"""Combine the section files under docs/cover-studies into Invitation.html.

Usage: cd docs/cover-studies && python3 ../../scripts/BuildInvitation.py
(input and output paths come from this script's location, so any working directory works).

Each section file is a standalone page: a <style>, one root element and its scripts.
The shared kit (SectionKit.css / SectionKit.js) is inlined once, before every section's own code.
To add a section, add one line to SECTIONS.
"""
import pathlib
import re
import sys
from dataclasses import dataclass
from typing import Callable, Optional

STUDIES_DIR = pathlib.Path(__file__).resolve().parent.parent / 'docs' / 'cover-studies'
OUTPUT_FILE = STUDIES_DIR / 'Invitation.html'
KIT_CSS_FILE = 'SectionKit.css'
KIT_JS_FILE = 'SectionKit.js'
KIT_CSS_MARKER = '/* SectionKit */'
KIT_JS_MARKER = '// SectionKit'
# Section comments may mention the kit files by name; the built page must not.
KIT_FILE_MENTION = 'the section kit'

PAGE_TITLE = '진용·하림 청첩장'
FONTS_URL = 'https://fonts.googleapis.com/css2'

# The cover is a standalone full-height page; inside the invitation it becomes one section.
COVER_ROOT_OPEN = '<main class="card" aria-label="커버">'
COVER_SECTION_OPEN = '<section class="card" aria-label="커버">'
COVER_FULL_HEIGHT_RULE = '  html,\n  body {\n    height: 100%;\n  }\n\n'
COVER_CARD_HEIGHT = '    min-height: 100%;\n    box-sizing: border-box;\n    max-width: 440px;'
# Full screen inside the invitation: 100vh for browsers that do not know svh, then 100svh where they do.
COVER_CARD_SCREEN_HEIGHT = COVER_CARD_HEIGHT.replace(
    '    min-height: 100%;\n',
    '    min-height: 100vh;\n    min-height: 100svh;\n',
)


class BuildError(Exception):
    """A section file is missing something the build relies on."""


@dataclass(frozen=True)
class SectionPart:
    """The pieces of one section file that go into the invitation."""

    style: str
    markup: str
    scripts: list


def require(condition: bool, file_name: str, message: str) -> None:
    if not condition:
        raise BuildError(f'{file_name}: {message}')


def replace_once(text: str, old: str, new: str, file_name: str, what: str) -> str:
    require(old in text, file_name, f'{what} not found ({old!r})')

    return text.replace(old, new, 1)


def adapt_cover(part: SectionPart, file_name: str) -> SectionPart:
    """Turn the full-page cover into a section: drop the 100% page height, size the card to the screen."""
    style = replace_once(part.style, COVER_FULL_HEIGHT_RULE, '', file_name, 'html/body height rule')
    style = replace_once(style, COVER_CARD_HEIGHT, COVER_CARD_SCREEN_HEIGHT, file_name, '.card min-height rule')
    markup = replace_once(part.markup, COVER_ROOT_OPEN, COVER_SECTION_OPEN, file_name, 'cover root <main>')
    markup = markup[: -len('</main>')] + '</section>'

    return SectionPart(style=style, markup=markup, scripts=part.scripts)


@dataclass(frozen=True)
class Section:
    file_name: str
    label: str
    root_tag: str = 'section'
    adapt: Optional[Callable[[SectionPart, str], SectionPart]] = None


SECTIONS = [
    Section('GreenhouseCover.html', '커버', root_tag='main', adapt=adapt_cover),
    Section('GreetingCard.html', '인사말'),
    Section('PhotosFilm.html', '사진'),
    Section('CeremonyInfo.html', '예식 안내'),
    Section('Directions.html', '오시는 길'),
    Section('GiftAccounts.html', '마음 전하실 곳'),
    Section('Rsvp.html', '참석 여부'),
    Section('Closing.html', '마무리'),
]

def read_study(file_name: str) -> str:
    path = STUDIES_DIR / file_name
    require(path.is_file(), file_name, f'file not found in {STUDIES_DIR}')

    return path.read_text(encoding='utf-8')


def extract_style(source: str, file_name: str) -> str:
    styles = re.findall(r'<style>(.*?)</style>', source, re.S)
    require(len(styles) == 1, file_name, f'expected exactly one <style>, found {len(styles)}')

    return styles[0].strip('\n')


def extract_markup(source: str, section: Section) -> str:
    """The root element: exactly one opening and one closing tag in the file, and everything between them."""
    tag = section.root_tag
    openings = [match.start() for match in re.finditer(rf'<{tag}\b', source)]
    closings = [match.end() for match in re.finditer(rf'</{tag}\s*>', source)]
    require(len(openings) == 1, section.file_name, f'expected exactly one <{tag}, found {len(openings)}')
    require(len(closings) == 1, section.file_name, f'expected exactly one </{tag}>, found {len(closings)}')
    require(openings[0] < closings[0], section.file_name, f'</{tag}> comes before <{tag}')

    return source[openings[0]:closings[0]]


def extract_scripts(source: str, file_name: str) -> list:
    """Inline scripts in order. The only external script allowed is the kit, which is inlined separately.

    Every <script ...> tag must be one of the two known shapes (kit src, or a bare inline <script>);
    anything else (type="module", defer, single-quoted src, ...) would be dropped silently, so it fails.
    """
    all_tags = re.findall(r'<script\b[^>]*>', source)
    external = re.findall(r'<script\s+src="([^"]*)"></script>', source)
    unknown = [src for src in external if src != KIT_JS_FILE]
    require(not unknown, file_name, f'unexpected external script {unknown}')

    inline = [script.strip('\n') for script in re.findall(r'<script>(.*?)</script>', source, re.S)]
    handled = len(external) + len(inline)
    require(
        handled == len(all_tags),
        file_name,
        f'{len(all_tags)} <script> tags but only {handled} handled (kit src or bare inline): {all_tags}',
    )

    return inline


def check_stylesheets(source: str, file_name: str) -> None:
    """Fail on a stylesheet the build would silently drop (only Google Fonts and the kit are known)."""
    links = re.findall(r'<link\b[^>]*rel="stylesheet"[^>]*>', source)

    for link in links:
        href = re.search(r'href="([^"]*)"', link)
        require(href is not None, file_name, f'stylesheet without href: {link}')
        known = href.group(1) == KIT_CSS_FILE or href.group(1).startswith(FONTS_URL)
        require(known, file_name, f'unexpected stylesheet {href.group(1)}')


def check_label(markup: str, section: Section) -> None:
    opening = markup[: markup.index('>') + 1]
    expected = f'aria-label="{section.label}"'
    require(expected in opening, section.file_name, f'root element has no {expected}: {opening}')


def read_section(section: Section, source: str) -> SectionPart:
    check_stylesheets(source, section.file_name)

    part = SectionPart(
        style=extract_style(source, section.file_name),
        markup=extract_markup(source, section),
        scripts=extract_scripts(source, section.file_name),
    )

    if section.adapt is not None:
        part = section.adapt(part, section.file_name)

    check_label(part.markup, section)

    return part


def collect_font_weights(sources: list) -> dict:
    """Merge the Google Fonts families and weights every file asks for, keeping first-seen order.

    A family with a single weight may come without one (family=Some+Font); it keeps an empty set,
    unless another file asks for explicit weights.
    """
    weights = {}

    for source in sources:
        for url in re.findall(rf'href="({re.escape(FONTS_URL)}[^"]*)"', source):
            for family, wght in re.findall(r'family=([^:&]+)(?::wght@([\d;]+))?', url):
                merged = weights.setdefault(family, set())

                if wght:
                    merged.update(int(weight) for weight in wght.split(';'))

    return weights


def build_font_family(family: str, values: set) -> str:
    if not values:
        return f'family={family}'

    return f'family={family}:wght@{";".join(str(weight) for weight in sorted(values))}'


def build_fonts_link(weights: dict) -> str:
    require(bool(weights), 'section files', 'no Google Fonts link found')

    families = '&'.join(build_font_family(family, values) for family, values in weights.items())

    return f'<link href="{FONTS_URL}?{families}&display=swap" rel="stylesheet">'


def build_head(fonts_link: str) -> str:
    return '\n'.join([
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
        f'<title>{PAGE_TITLE}</title>',
        '<meta name="claude:viewport-fit-sides" content="cover">',
        '<link rel="preconnect" href="https://fonts.googleapis.com">',
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
        fonts_link,
    ])


def read_kit(file_name: str, marker: str) -> str:
    kit = read_study(file_name).strip('\n')
    require(kit.startswith(marker), file_name, f'must start with {marker!r}')

    return kit


def indent(text: str, prefix: str = '  ') -> str:
    return '\n'.join(prefix + line if line.strip() else '' for line in text.split('\n'))


def drop_kit_mentions(text: str) -> str:
    return text.replace(KIT_CSS_FILE, KIT_FILE_MENTION).replace(KIT_JS_FILE, KIT_FILE_MENTION)


def build_page(parts: list, fonts_link: str, kit_css: str, kit_js: str) -> str:
    styles = [indent(kit_css)] + [part.style for part in parts]
    markup = [part.markup for part in parts]
    scripts = [indent(kit_js)] + [script for part in parts for script in part.scripts]

    page = '\n'.join([
        build_head(fonts_link),
        '<style>',
        '\n\n'.join(styles),
        '</style>',
        '',
        '<main>',
        '\n\n'.join(markup),
        '</main>',
        '',
        '\n\n'.join(f'<script>\n{script}\n</script>' for script in scripts),
        '',
    ])

    return drop_kit_mentions(page)


def check_page(page: str, sections: list, output_name: str) -> None:
    """The kit appears exactly once and nothing still points at the kit files."""
    for marker in (KIT_CSS_MARKER, KIT_JS_MARKER):
        count = page.count(marker)
        require(count == 1, output_name, f'{marker!r} appears {count} times, expected once')

    for file_name in (KIT_CSS_FILE, KIT_JS_FILE):
        require(file_name not in page, output_name, f'still mentions {file_name}')

    found = len(re.findall(r'<section\b', page))
    require(found == len(sections), output_name, f'{found} sections, expected {len(sections)}')


def build_invitation(sections: list, output_file: pathlib.Path) -> None:
    """One page from the given sections; the fonts link asks only for what these sections use."""
    sources = [read_study(section.file_name) for section in sections]
    parts = [read_section(section, source) for section, source in zip(sections, sources)]
    fonts_link = build_fonts_link(collect_font_weights(sources))
    kit_css = read_kit(KIT_CSS_FILE, KIT_CSS_MARKER)
    kit_js = read_kit(KIT_JS_FILE, KIT_JS_MARKER)

    page = build_page(parts, fonts_link, kit_css, kit_js)
    check_page(page, sections, output_file.name)
    output_file.write_text(page, encoding='utf-8')

    print(f'{output_file.name}: {len(parts)} sections')


def build() -> None:
    build_invitation(SECTIONS, OUTPUT_FILE)


if __name__ == '__main__':
    try:
        build()
    except BuildError as error:
        print(f'BuildInvitation failed: {error}', file=sys.stderr)
        sys.exit(1)
