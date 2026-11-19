"""Build the deployable site from the final invitation page.

Usage (from the project root): python3 scripts/BuildSite.py [site-url]
Writes site/index.html (a full HTML document around docs/cover-studies/Invitation.html)
and copies the photos it uses. site-url, if given, makes the share-preview image absolute,
which KakaoTalk and other link previews need.
"""
import pathlib
import re
import shutil
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
STUDIES = ROOT / 'docs' / 'cover-studies'
SITE = ROOT / 'site'
SITE_URL = sys.argv[1].rstrip('/') if len(sys.argv) > 1 else ''

TITLE = '서진용 · 장하림 결혼합니다'
DESCRIPTION = '2027년 3월 6일 토요일 오후 5시, 식물관PH'
SHARE_IMAGE = 'photos/photo-06.jpg'

page = (STUDIES / 'Invitation.html').read_text(encoding='utf-8')

# claude.ai wraps artifact pages in a skeleton; a real site needs its own document and reset.
head_end = page.index('<style>')
head_tags = page[:head_end]
head_tags = re.sub(r'<meta charset="utf-8">\n|<meta name="viewport"[^>]*>\n|<meta name="claude:viewport-fit-sides"[^>]*>\n', '', head_tags)
body = page[head_end:]
image_url = f'{SITE_URL}/{SHARE_IMAGE}' if SITE_URL else SHARE_IMAGE
document = f'''<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="{DESCRIPTION}">
<meta property="og:type" content="website">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="{DESCRIPTION}">
<meta property="og:image" content="{image_url}">
<meta name="twitter:card" content="summary_large_image">
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

if SITE.exists():
    shutil.rmtree(SITE)

(SITE / 'photos').mkdir(parents=True)
(SITE / 'index.html').write_text(document, encoding='utf-8')

used = set(re.findall(r'photos/(photo-\d+(?:-sm)?\.jpg)', document))
flow_numbers = re.findall(r"\['(\d{2})', '", document)
used |= {f'photo-{number}-sm.jpg' for number in flow_numbers}

for name in sorted(used):
    shutil.copy(STUDIES / 'photos' / name, SITE / 'photos' / name)

print(f'site/index.html + {len(used)} photos')
