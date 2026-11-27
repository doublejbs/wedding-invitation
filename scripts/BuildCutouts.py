"""두 사람 영역의 찢은 사진: 신랑·신부(photo-NN-cut.webp)와 가운데 부케(photo-02-bouquet-cut.webp) (docs/SectionsSpec.md 2-1b).

원본 사진에서 대상을 찾고(사람은 rembg BiRefNet portrait, 부케는 rembg SAM에 점으로 부케를 지정), 사진째 손으로 찢은 것처럼
둘레에 배경을 들쭉날쭉한 띠로 남긴 뒤 찢긴 흰 종이 결을 두른다. 사람과 부케는 같은 찢기 설정을 쓴다.
배경이 투명한 WebP로 저장한다. 그림자는 페이지 CSS(drop-shadow)가 맡는다. 흔들림은 시드가 정해진 난수라 몇 번을 돌려도 같다.

    pip install "rembg[cpu]" pillow numpy scipy
    python3 scripts/BuildCutouts.py            # 사람 두 장과 부케
    python3 scripts/BuildCutouts.py 09         # 하나만 (메모리가 모자라면 하나씩: 10, 09, bouquet)
    python3 scripts/BuildCutouts.py bouquet

모델은 처음 실행할 때 GitHub(danielgatis/rembg 릴리스)에서 받는다. 원본이 바뀌었을 때만 다시 돌리고 결과를 커밋한다.
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

STUDIES = Path(__file__).resolve().parent.parent / 'docs' / 'cover-studies'
PHOTOS = STUDIES / 'photos'

# 신랑 10번, 신부 9번과 각자의 찢기 시드 (사용자가 고른 시안과 같은 모양).
PHOTO_SEEDS = {'10': 7, '09': 11}

MODEL = 'birefnet-portrait'

# 사람으로 볼 알파 값.
PERSON_ALPHA = 110

# 남는 배경 띠 = 사람에서 BAND_BASE ± BAND_SWING(크게) ± BAND_MID(중간) ± BAND_TEETH(잔 톱니), 원본 사진 픽셀.
BAND_BASE = 11
BAND_SWING = 7
BAND_MID = 3
BAND_TEETH = 1.5

# 그 바깥의 찢긴 흰 결 = FIBER_BASE + 최대 FIBER_MID + 잔 톱니 FIBER_TEETH. 맨 바깥 EDGE_PX는 옅은 회색.
FIBER_BASE = 5
FIBER_MID = 2.5
FIBER_TEETH = 2.5
EDGE_PX = 2
PAPER = (252, 251, 248, 255)
PAPER_EDGE = (226, 224, 219, 255)

# 흔들림을 만드는 잡음의 결 크기(가우시안 반경, 픽셀): 크게, 중간, 잔 톱니.
NOISE_SCALES = (40, 6, 1.2)
PAD = 60

# 페이지에서 높이 260px 남짓으로 보이므로 높은 화면 밀도를 생각해 높이 800px로 줄여 저장한다.
OUTPUT_HEIGHT = 800
WEBP_QUALITY = 86

# 부케: photo-02에서 부케가 든 부분(원본 픽셀 상자), 그 안에서 부케(꽃)와 부케 아닌 곳(손·정장·하늘·숲·풀·리본)을 찍은 점,
# 찢기 시드, 저장 폭. 손에 가려 끊긴 줄기는 넣지 않고 가장 큰 덩어리(꽃다발)만 쓴다.
BOUQUET_PHOTO = '02'
BOUQUET_BOX = (288, 373, 672, 1012)
BOUQUET_POINTS = [(150, 200), (220, 200), (240, 260), (180, 300), (260, 320), (200, 250), (300, 230), (130, 190), (290, 450), (270, 470), (230, 150)]
NOT_BOUQUET_POINTS = [(310, 400), (365, 250), (30, 100), (40, 350), (100, 560), (220, 530), (365, 450)]
BOUQUET_SEED = 13
BOUQUET_OUTPUT_WIDTH = 240


def smooth_noise(rng: np.random.Generator, shape: tuple, scale: float) -> np.ndarray:
    field = ndimage.gaussian_filter(rng.standard_normal(shape), scale)

    return field / (np.abs(field).max() + 1e-9)


def paint_paper(canvas: np.ndarray, paper: np.ndarray) -> None:
    """찢긴 종이 속살(흰색)과, 단면처럼 보이는 바깥 가장자리의 옅은 회색을 칠한다."""
    canvas[paper] = PAPER
    edge = paper & ~ndimage.binary_erosion(paper, iterations=EDGE_PX)
    canvas[edge] = PAPER_EDGE


def tear(photo: np.ndarray, alpha: np.ndarray, seed: int) -> Image.Image:
    """Tears the photo around the object (alpha 0..255 over the photo) and returns it cropped to what is left."""
    height, width = alpha.shape
    subject = alpha > PERSON_ALPHA

    rng = np.random.default_rng(seed)
    shape = (height + 2 * PAD, width + 2 * PAD)
    low, mid, fine = (smooth_noise(rng, shape, scale) for scale in NOISE_SCALES)

    padded_subject = np.zeros(shape, bool)
    padded_subject[PAD:PAD + height, PAD:PAD + width] = subject
    distance = ndimage.distance_transform_edt(~padded_subject)

    reach = BAND_BASE + BAND_SWING * low + BAND_MID * mid + BAND_TEETH * fine
    band = distance <= reach
    paper = distance <= reach + FIBER_BASE + FIBER_MID * np.abs(mid) + FIBER_TEETH * fine

    # 원본 사진이 잘린 가장자리(사람의 아래쪽 등)는 찢지 않고 일자로 둔다.
    band[PAD + height:, :] = False
    paper[PAD + height:, :] = False

    canvas = np.zeros((*shape, 4), np.uint8)
    paint_paper(canvas, paper)

    padded_photo = np.zeros((*shape, 3), np.uint8)
    padded_photo[PAD:PAD + height, PAD:PAD + width] = photo
    canvas[band, :3] = padded_photo[band]
    canvas[band, 3] = 255

    # 대상을 맨 위에. 가장자리 1px을 깎아 배경 경계가 겹쳐 보이지 않게 한다.
    cover = np.zeros(shape, np.float32)
    cover[PAD:PAD + height, PAD:PAD + width] = alpha / 255 * ndimage.binary_erosion(subject, iterations=1)

    for channel in range(3):
        canvas[..., channel] = (padded_photo[..., channel] * cover + canvas[..., channel] * (1 - cover)).astype(np.uint8)

    canvas[..., 3] = np.maximum(canvas[..., 3], (cover * 255).astype(np.uint8))

    image = Image.fromarray(canvas, 'RGBA')

    return image.crop(image.getbbox())


def build_person(number: str, session) -> Image.Image:
    from rembg import remove

    photo = Image.open(PHOTOS / f'photo-{number}.jpg').convert('RGB')
    cut = np.array(remove(photo, session=session, post_process_mask=True).convert('RGBA'))
    image = tear(np.array(photo), cut[..., 3], PHOTO_SEEDS[number])

    return image.resize((round(image.width * OUTPUT_HEIGHT / image.height), OUTPUT_HEIGHT), Image.Resampling.LANCZOS)


def build_bouquet() -> Image.Image:
    from rembg import new_session, remove

    photo = Image.open(PHOTOS / f'photo-{BOUQUET_PHOTO}.jpg').convert('RGB').crop(BOUQUET_BOX)
    prompt = [{'type': 'point', 'data': list(point), 'label': 1} for point in BOUQUET_POINTS]
    prompt += [{'type': 'point', 'data': list(point), 'label': 0} for point in NOT_BOUQUET_POINTS]
    cut = np.array(remove(photo, session=new_session('sam'), sam_prompt=prompt, post_process_mask=True).convert('RGBA'))

    # 꽃다발 한 덩어리만: 잔 조각을 걷어내고 가장 큰 덩어리를 남긴다.
    mask = ndimage.binary_opening(cut[..., 3] > PERSON_ALPHA, iterations=2)
    labels, _ = ndimage.label(mask)
    biggest = labels == np.bincount(labels.ravel())[1:].argmax() + 1
    image = tear(np.array(photo), np.where(biggest, 255, 0).astype(np.float32), BOUQUET_SEED)

    return image.resize((BOUQUET_OUTPUT_WIDTH, round(image.height * BOUQUET_OUTPUT_WIDTH / image.width)), Image.Resampling.LANCZOS)


def save_webp(image: Image.Image, target: Path) -> None:
    image.save(target, 'WEBP', quality=WEBP_QUALITY, method=6)
    print(f'{target.name}: {image.width}x{image.height}, {target.stat().st_size // 1024}KB')


targets = sys.argv[1:] or [*PHOTO_SEEDS, 'bouquet']

if 'bouquet' in targets:
    save_webp(build_bouquet(), PHOTOS / f'photo-{BOUQUET_PHOTO}-bouquet-cut.webp')

people = [target for target in targets if target in PHOTO_SEEDS]

if people:
    from rembg import new_session

    SESSION = new_session(MODEL)

    for number in people:
        save_webp(build_person(number, SESSION), PHOTOS / f'photo-{number}-cut.webp')
