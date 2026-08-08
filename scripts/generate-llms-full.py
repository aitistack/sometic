#!/usr/bin/env python
"""Regenerate apps/docs/public/llms-full.txt from consumer documentation.

Run from repo root:
  python scripts/generate-llms-full.py

Includes only pages published on the consumer docs site (aligns with VitePress
srcExclude). Never references ADRs, .cursor paths, or maintainer-only docs.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "apps" / "docs"
OUT = ROOT / "public" / "llms-full.txt"
BASE = "https://sometic.aitistack.com"

INCLUDE_DIRS = [
    "guide",
    "components",
    "frameworks",
    "concepts",
    "primitives",
    "theming",
    "authentication",
    "forms",
    "stores",
    "utilities",
    "api",
    "releases",
    "legal",
    "services",
]

GUIDE_EXCLUDE_STEMS = frozenset(
    {
        "development",
        "repository-structure",
        "getting-started",
        "release",
    }
)


def strip_frontmatter(text: str) -> str:
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            return text[end + 4 :].lstrip("\n")
    return text


def should_include(rel: Path) -> bool:
    posix = rel.as_posix().lower()
    if "architecture/" in posix:
        return False
    if "public-api-inventory" in posix:
        return False
    if posix.startswith("guide/") and rel.stem in GUIDE_EXCLUDE_STEMS:
        return False
    return True


def rel_to_url(rel: Path) -> str:
    parts = rel.as_posix()
    if parts.endswith("index.md"):
        parts = parts[: -len("index.md")]
    elif parts.endswith(".md"):
        parts = parts[: -len(".md")]
    if not parts.startswith("/"):
        parts = "/" + parts
    while "//" in parts:
        parts = parts.replace("//", "/")
    return BASE + parts


def scrub_internal_refs(body: str) -> str:
    body = re.sub(r"</?Preview[A-Za-z0-9]+[^>]*>", "", body)
    body = re.sub(r"</?DemoFrame[^>]*>", "", body)
    body = re.sub(r"</?CopyPrompt[^>]*>", "", body)
    body = re.sub(r"\s*\(see ADR-\d+[^.]*\.\)", ".", body, flags=re.IGNORECASE)
    body = re.sub(r"\s*See ADR-\d+[^.]*\.", ".", body, flags=re.IGNORECASE)
    body = re.sub(r"\bADR-\d+\s*:\s*", "", body)
    body = re.sub(r"\s*\(ADR-\d+\)", "", body)
    body = re.sub(r"\s*See ADR-\d+ and `\.cursor/[^`]+`\.", ".", body)
    body = re.sub(r"`\.cursor/[^`]+`", "", body)
    body = re.sub(r"docs/decisions/[^\s)]*", "", body)
    body = re.sub(r"\n{3,}", "\n\n", body)
    return body.strip()


def main() -> None:
    files: list[Path] = []
    home = ROOT / "index.md"
    if home.exists():
        files.append(home)
    for d in INCLUDE_DIRS:
        base = ROOT / d
        if not base.exists():
            continue
        for p in sorted(base.rglob("*.md")):
            rel = p.relative_to(ROOT)
            if should_include(rel):
                files.append(p)

    chunks: list[str] = [
        "# Sometic full documentation export\n",
        "> Complete consumer documentation for Sometic (`@sometic`), concatenated for LLM / agent ingestion. Companion index: https://sometic.aitistack.com/llms.txt\n",
        "Site: https://sometic.aitistack.com\nnpm scope: @sometic\nLicense: MIT\nParent brand: AitiStack\nMaturity: public beta\n",
        "\nImportant product facts for agents:\n"
        "- Packages are unstyled by default; consumers own CSS/fonts.\n"
        "- Prefer subpath imports for tree-shaking.\n"
        "- Custom elements use the `sometic-*` prefix.\n"
        "- Auth helpers are client UX; authorize on the server.\n"
        "- Server cache lives in @sometic/query; client UI state in @sometic/store.\n"
        "- Use Copy Prompt on surface docs; see https://sometic.aitistack.com/guide/agents.\n"
        "- Documentation search is local (client-side).\n",
        "\n## Table of contents\n",
    ]

    for p in files:
        rel = p.relative_to(ROOT)
        chunks.append(f"- [{rel.as_posix()}]({rel_to_url(rel)})")

    for p in files:
        rel = p.relative_to(ROOT)
        body = scrub_internal_refs(strip_frontmatter(p.read_text(encoding="utf-8")))
        chunks.append(f"\n\n# {rel.as_posix()}\n\nSource: {rel_to_url(rel)}\n\n{body}\n")

    OUT.write_text("\n".join(chunks).rstrip() + "\n", encoding="utf-8")
    print(f"Wrote {OUT} ({len(files)} pages)")


if __name__ == "__main__":
    main()
