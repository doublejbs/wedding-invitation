"""Build the deployable site from the final invitation page.

Usage (from the project root): python3 scripts/BuildSite.py [site-url]
Rebuilds docs/cover-studies/Invitation.html first (scripts/BuildInvitation.py), so a stale page is never
deployed, then writes site/index.html (a full HTML document around it) and copies the photos and textures it uses
(only the files the page names, e.g. textures/stamp-frame.png; the kept stamp-frame-source.png is not shipped), plus the
favicons, the share card (both made by scripts/BuildShareImages.mjs) and wedding.ics from docs/cover-studies/share/ (only copied here).
site-url, if given, makes the share-preview addresses absolute, which KakaoTalk and other link previews need.
"""
import pathlib
import re
import shutil
import sys

# Imported from this folder; no __pycache__ left next to the scripts.
sys.dont_write_bytecode = True

import BuildInvitation  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
STUDIES = ROOT / 'docs' / 'cover-studies'
TEXTURES = STUDIES / 'textures'
SHARE = STUDIES / 'share'
SITE = ROOT / 'site'
SITE_URL = sys.argv[1].rstrip('/') if len(sys.argv) > 1 else ''

TITLE = '서진용 · 장하림 결혼합니다'
DESCRIPTION = '2027년 3월 6일 토요일 오후 5시, 식물관PH'
SITE_NAME = '서진용 · 장하림 모바일 청첩장'
SHARE_IMAGE = 'og-image.png'
SHARE_IMAGE_WIDTH = 1200
SHARE_IMAGE_HEIGHT = 630
SHARE_IMAGE_ALT = '크레파스로 그린 유리 온실 안에 야자수와 붉은 꽃이 가득하고 가운데로 흰 버진로드가 난 그림'
THEME_COLOR = '#fbfbf8'
# Copied to the site root as they are; the generated PNGs are committed, so no browser is needed here.
# wedding.ics is the event behind 캘린더에 추가 in CeremonyInfo.html.
SHARE_FILES = ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'og-image.png', 'wedding.ics']

missing_share = [name for name in SHARE_FILES if not (SHARE / name).is_file()]

if missing_share:
    sys.exit(f'BuildSite failed: share files not found in docs/cover-studies/share: {missing_share} (images: node scripts/BuildShareImages.mjs; wedding.ics is kept in git)')

try:
    BuildInvitation.build()
except BuildInvitation.BuildError as error:
    sys.exit(f'BuildSite failed: BuildInvitation failed: {error}')

# (built page in docs/cover-studies, file in site/, path in its address, kept out of search and previews)
PAGES = [
    ('Invitation.html', 'index.html', '', False),
]
image_url = f'{SITE_URL}/{SHARE_IMAGE}' if SITE_URL else SHARE_IMAGE


def build_document(page: str, url_path: str, is_hidden: bool) -> str:
    # claude.ai wraps artifact pages in a skeleton; a real site needs its own document and reset.
    head_end = page.index('<style>')
    head_tags = page[:head_end]
    head_tags = re.sub(r'<meta charset="utf-8">\n|<meta name="viewport"[^>]*>\n|<meta name="claude:viewport-fit-sides"[^>]*>\n', '', head_tags)
    body = page[head_end:]
    page_url = f'{SITE_URL}/{url_path}' if SITE_URL else f'./{url_path}'
    robots = '<meta name="robots" content="noindex">\n' if is_hidden else ''

    return f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
{robots}<meta name="description" content="{DESCRIPTION}">
<meta name="theme-color" content="{THEME_COLOR}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{SITE_NAME}">
<meta property="og:locale" content="ko_KR">
<meta property="og:url" content="{page_url}">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="{DESCRIPTION}">
<meta property="og:image" content="{image_url}">
<meta property="og:image:width" content="{SHARE_IMAGE_WIDTH}">
<meta property="og:image:height" content="{SHARE_IMAGE_HEIGHT}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:alt" content="{SHARE_IMAGE_ALT}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{TITLE}">
<meta name="twitter:description" content="{DESCRIPTION}">
<meta name="twitter:image" content="{image_url}">
{head_tags.strip()}
<style>
  html {{ -webkit-text-size-adjust: 100%; }}
  body {{ margin: 0; font-family: system-ui, sans-serif; font-size: 14px; }}
  img {{ max-width: 100%; }}
  [hidden] {{ display: none !important; }}
</style>
</head>
<body>
{body.strip()}
</body>
</html>
'''


documents = {
    site_name: build_document((STUDIES / source).read_text(encoding='utf-8'), url_path, is_hidden)
    for source, site_name, url_path, is_hidden in PAGES
}
every_page = '\n'.join(documents.values())

# Photos named in the pages: the greeting stamp's photo-12.jpg and photo-04.jpg, the photos section's small copies
# and the families section's cut-outs (photo-NN-cut.webp).
used = set(re.findall(r'photos/(photo-\d+(?:-sm)?\.jpg|photo-\d+-cut\.webp)', every_page))

# The photos section opens each small photo (photo-NN-sm.jpg) as its original (photo-NN.jpg) in the full view,
# so every small copy the page names ships with its original.
used |= {name.replace('-sm.jpg', '.jpg') for name in used if name.endswith('-sm.jpg')}

missing = sorted(name for name in used if not (STUDIES / 'photos' / name).is_file())

if missing:
    sys.exit(f'BuildSite failed: photos not found in docs/cover-studies/photos: {missing}')

# Textures named literally in the page (the greeting's stamp paper). Checked before site/ is cleared.
textures = set(re.findall(r'textures/([\w.-]+\.(?:png|jpg|jpeg|webp|svg))', every_page))
missing_textures = sorted(name for name in textures if not (TEXTURES / name).is_file())

if missing_textures:
    sys.exit(f'BuildSite failed: textures not found in docs/cover-studies/textures: {missing_textures}')

if SITE.exists():
    shutil.rmtree(SITE)

(SITE / 'photos').mkdir(parents=True)
(SITE / 'textures').mkdir()

for site_name, document in documents.items():
    (SITE / site_name).write_text(document, encoding='utf-8')

for name in sorted(used):
    shutil.copy(STUDIES / 'photos' / name, SITE / 'photos' / name)

for name in sorted(textures):
    shutil.copy(TEXTURES / name, SITE / 'textures' / name)

for name in SHARE_FILES:
    shutil.copy(SHARE / name, SITE / name)

print(f'site/{" + site/".join(documents)} + {len(used)} photos + {len(textures)} textures + {len(SHARE_FILES)} share files')

# An empty endpoint means the RSVP form only says it is a preview; guests would see that sentence.
endpoint = re.search(r"const RSVP_ENDPOINT = '([^']*)';", documents['index.html'])

if endpoint is None or not endpoint.group(1).strip():
    print("경고: Rsvp.html의 RSVP_ENDPOINT가 비어 있습니다. 이대로 배포하면 하객이 보내기를 눌러도 저장되지 않고 '시안이라 아직 저장되지는 않아요.'가 보입니다.")
