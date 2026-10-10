"""Copy a task page from Antigravity into tasks/<slug>.html and wire it to the site.

Usage: python tools/add_task.py <source.html> <slug>
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TAILWIND = re.compile(r'<script src="https://(?:cdn\.tailwindcss\.com|www\.gstatic\.com/antigravity/web/dev/tailwindcss\.min\.js)[^"]*"></script>')
LOCAL_TAILWIND = '<script src="../assets/tailwind.js"></script>'
OLYMP = '<script src="../assets/olymp.js"></script>'


def main(source, slug):
    html = Path(source).read_text(encoding="utf-8")
    html = TAILWIND.sub(LOCAL_TAILWIND, html)
    if "https://" in re.sub(r'xmlns="[^"]*"', "", html):
        print("warning: the page still loads something from the internet, check it by hand")
    if OLYMP not in html:
        html = html.replace("</head>", f"  {OLYMP}\n</head>", 1)
    target = ROOT / "tasks" / f"{slug}.html"
    target.write_text(html, encoding="utf-8", newline="\n")
    print(f"{target.relative_to(ROOT)}: done. Add Olymp.stars(...) where the page detects a solved task.")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
