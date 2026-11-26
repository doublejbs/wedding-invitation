"""Make the web font for the guest's name on the cover (docs/SectionsSpec.md 2-0).

Usage: python3 scripts/BuildGuestFont.py "<path to 나눔손글씨 여름글씨.ttf>"

The original TTF (about 5MB, every Hangul syllable) is too heavy for a phone, and it is not kept in the repository.
This keeps the 2,350 Hangul syllables of KS X 1001 (the common set, which covers nearly every name) plus printable
ASCII, and writes docs/cover-studies/fonts/NanumYeoReumGeurSsi-ksx1001.woff2 (about 510KB).
Needs fontTools with brotli: pip install fonttools brotli
"""
import pathlib
import sys

from fontTools import subset

OUTPUT = pathlib.Path(__file__).resolve().parent.parent / 'docs' / 'cover-studies' / 'fonts' / 'NanumYeoReumGeurSsi-ksx1001.woff2'

HANGUL_FIRST = 0xAC00
HANGUL_LAST = 0xD7A3
PRINTABLE_ASCII = range(0x20, 0x7F)


def is_ksx1001(code_point: int) -> bool:
    # A syllable is in KS X 1001 exactly when EUC-KR encodes it in two bytes; Python spells the others out as
    # eight-byte jamo sequences instead of failing.
    try:
        return len(chr(code_point).encode('euc-kr')) == 2
    except UnicodeEncodeError:
        return False


if len(sys.argv) != 2:
    sys.exit(__doc__)

source = pathlib.Path(sys.argv[1])

if not source.is_file():
    sys.exit(f'BuildGuestFont failed: no font at {source}')

unicodes = [code for code in range(HANGUL_FIRST, HANGUL_LAST + 1) if is_ksx1001(code)] + list(PRINTABLE_ASCII)

options = subset.Options()
options.flavor = 'woff2'
options.layout_features = ['*']

font = subset.load_font(str(source), options)
subsetter = subset.Subsetter(options)
subsetter.populate(unicodes=unicodes)
subsetter.subset(font)
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
subset.save_font(font, str(OUTPUT), options)

print(f'{OUTPUT.name}: {len(unicodes)} characters, {OUTPUT.stat().st_size // 1024}KB')
