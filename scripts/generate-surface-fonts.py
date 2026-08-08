#!/usr/bin/env python
"""Regenerate latin-subset WOFF2 faces for docs/playgrounds.

Run from repo root:
  python scripts/generate-surface-fonts.py

Requires: pip install fonttools brotli
"""

from __future__ import annotations

import shutil
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parents[1]
DOCS_FONTS = ROOT / "apps" / "docs" / "public" / "fonts"
PLAYGROUNDS = [
    "playground-vanilla",
    "playground-react",
    "playground-vue",
    "playground-alpine",
    "playground-jquery",
    "playground-htmx",
]

LATIN_SPEC = (
    "U+0000-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,"
    "U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
)

JOBS = [
    ("Urbanist/Urbanist-VariableFont_wght.ttf", "Urbanist/Urbanist-latin.woff2"),
    (
        "JetBrains_Mono/static/JetBrainsMono-Regular.ttf",
        "JetBrains_Mono/JetBrainsMono-Regular-latin.woff2",
    ),
    (
        "JetBrains_Mono/static/JetBrainsMono-Medium.ttf",
        "JetBrains_Mono/JetBrainsMono-Medium-latin.woff2",
    ),
    (
        "JetBrains_Mono/static/JetBrainsMono-SemiBold.ttf",
        "JetBrains_Mono/JetBrainsMono-SemiBold-latin.woff2",
    ),
    ("Chakra_Petch/ChakraPetch-Medium.ttf", "Chakra_Petch/ChakraPetch-Medium-latin.woff2"),
    ("Chakra_Petch/ChakraPetch-SemiBold.ttf", "Chakra_Petch/ChakraPetch-SemiBold-latin.woff2"),
    ("Chakra_Petch/ChakraPetch-Bold.ttf", "Chakra_Petch/ChakraPetch-Bold-latin.woff2"),
]


def parse_unicodes(spec: str) -> list[int]:
    out: list[int] = []
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            a, b = part.split("-", 1)
            start = int(a.replace("U+", ""), 16)
            end = int(b.replace("U+", ""), 16)
            out.extend(range(start, end + 1))
        else:
            out.append(int(part.replace("U+", ""), 16))
    return out


def to_woff2(src: Path, dest: Path, unicodes: list[int]) -> None:
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = ["*"]
    options.ignore_missing_unicodes = True
    options.ignore_missing_glyphs = True
    font = subset.load_font(str(src), options)
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=unicodes)
    subsetter.subset(font)
    dest.parent.mkdir(parents=True, exist_ok=True)
    subset.save_font(font, str(dest), options)
    print(f"{src.name:48} {src.stat().st_size:7} -> {dest.name:48} {dest.stat().st_size:7}")


def main() -> None:
    unicodes = parse_unicodes(LATIN_SPEC)
    outputs: list[Path] = []
    for src_rel, dest_rel in JOBS:
        src = DOCS_FONTS / src_rel
        dest = DOCS_FONTS / dest_rel
        to_woff2(src, dest, unicodes)
        outputs.append(dest)

    for app in PLAYGROUNDS:
        base = ROOT / "apps" / app / "public" / "fonts"
        for dest in outputs:
            rel = dest.relative_to(DOCS_FONTS)
            target = base / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(dest, target)
        print(f"synced {app}")


if __name__ == "__main__":
    main()
