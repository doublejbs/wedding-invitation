"""두 사람 영역의 사람 모양 사진(photo-NN-cut.webp)을 만든다.

원본 photos/photo-NN.jpg에서 배경을 지우고(rembg, BiRefNet portrait 모델), 사람 둘레에 흰 테두리를 두른 뒤
배경이 투명한 WebP로 저장한다. 그림자는 페이지 CSS(drop-shadow)가 맡으므로 넣지 않는다.

    pip install "rembg[cpu]" pillow numpy
    python3 scripts/BuildCutouts.py        # 두 장 모두
    python3 scripts/BuildCutouts.py 09     # 한 장만 (메모리가 모자라면 한 장씩)

모델은 처음 실행할 때 GitHub(danielgatis/rembg 릴리스)에서 받는다. 원본 사진이 바뀌었을 때만 다시 돌리고 결과를 커밋한다.
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove

PHOTOS = Path(__file__).resolve().parent.parent / 'docs' / 'cover-studies' / 'photos'

# 신랑 10번, 신부 9번 (SectionsSpec 2-1b).
PHOTO_NUMBERS = ['10', '09']

MODEL = 'birefnet-portrait'

# 흰 테두리 두께(원본 사진 픽셀). 사용자가 비교한 세 두께(6·12·18) 중 중간.
BORDER = 12

# 사람 가장자리에서 안쪽으로 깎는 폭. 반투명 가장자리에 남는 풀밭 초록빛을 흰 테두리가 덮게 한다.
EDGE_TRIM = 2

# 페이지에서 높이 400px로 보이므로 2배 화면을 위해 높이 800px로 줄여 저장한다.
OUTPUT_HEIGHT = 800

WEBP_QUALITY = 86


def build_cutout(source: Path) -> Image.Image:
    person = remove(Image.open(source).convert('RGB'), session=SESSION, post_process_mask=True).convert('RGBA')
    width, height = person.size
    pad = BORDER * 2

    mask = person.getchannel('A').point(lambda value: 255 if value > 110 else 0)
    canvas_mask = Image.new('L', (width + pad * 2, height + pad * 2), 0)
    canvas_mask.paste(mask, (pad, pad))

    # 둥근 바깥선: 넓힌 뒤 흐렸다가 다시 잘라 모서리를 부드럽게.
    outline = (
        canvas_mask.filter(ImageFilter.MaxFilter(BORDER * 2 + 1))
        .filter(ImageFilter.GaussianBlur(BORDER * 0.45))
        .point(lambda value: 255 if value > 100 else 0)
        .filter(ImageFilter.GaussianBlur(1))
    )
    # 원본 사진이 사람을 자른 아래쪽은 테두리 없이 일자로 끊는다.
    outline_pixels = np.array(outline)
    outline_pixels[pad + height:, :] = 0
    outline = Image.fromarray(outline_pixels)

    result = Image.new('RGBA', outline.size, (255, 255, 255, 0))
    white = Image.new('RGBA', outline.size, (255, 255, 255, 255))
    white.putalpha(outline)
    result.alpha_composite(white)

    person_alpha = person.getchannel('A').filter(ImageFilter.MinFilter(EDGE_TRIM * 2 + 1))
    person.putalpha(person_alpha)
    layer = Image.new('RGBA', outline.size, (0, 0, 0, 0))
    layer.paste(person, (pad, pad))
    result.alpha_composite(layer)

    result = result.crop(result.getbbox())
    scale = OUTPUT_HEIGHT / result.height

    return result.resize((round(result.width * scale), OUTPUT_HEIGHT), Image.Resampling.LANCZOS)


SESSION = new_session(MODEL)

for number in sys.argv[1:] or PHOTO_NUMBERS:
    target = PHOTOS / f'photo-{number}-cut.webp'
    cutout = build_cutout(PHOTOS / f'photo-{number}.jpg')
    cutout.save(target, 'WEBP', quality=WEBP_QUALITY, method=6)
    print(f'{target.name}: {cutout.width}x{cutout.height}, {target.stat().st_size // 1024}KB')
