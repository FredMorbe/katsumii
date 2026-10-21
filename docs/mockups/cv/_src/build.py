#!/usr/bin/env python3
"""Builds the CV mockups: inlines fonts + shared data into each template.

    python3 docs/mockups/cv/_src/build.py

Templates (_src/N-name.html) use two markers:
    /*@FONTS*/  → base64 @font-face rules (families listed in FONTS_FOR below)
    /*@DATA*/   → contents of data.js
Output goes to docs/mockups/cv/cv-N-name.html (standalone, no network needed);
selector.html becomes docs/mockups/cv/index.html (comparison page; thumbnails live in ../thumbs/).
"""
import base64, pathlib

HERE = pathlib.Path(__file__).parent
OUT = HERE.parent
FONT_DIR = HERE.parents[3] / "public" / "fonts"

def b64(p): return base64.b64encode((FONT_DIR / p).read_bytes()).decode()

FACES = {
    "mono":  lambda: f"@font-face{{font-family:'DM Mono';font-weight:400;font-display:swap;src:url(data:font/woff2;base64,{b64('DMMono-normal-400-latin.woff2')}) format('woff2')}}"
                     f"@font-face{{font-family:'DM Mono';font-weight:500;font-display:swap;src:url(data:font/woff2;base64,{b64('DMMono-normal-500-latin.woff2')}) format('woff2')}}",
    "sans":  lambda: f"@font-face{{font-family:'DM Sans';font-style:normal;font-weight:300 700;font-display:swap;src:url(data:font/woff2;base64,{b64('DMSans-normal-300-700-latin.woff2')}) format('woff2')}}"
                     f"@font-face{{font-family:'DM Sans';font-style:italic;font-weight:300 700;font-display:swap;src:url(data:font/woff2;base64,{b64('DMSans-italic-300-700-latin.woff2')}) format('woff2')}}",
    "manrope": lambda: f"@font-face{{font-family:'Manrope';font-weight:400 800;font-display:swap;src:url(data:font/woff2;base64,{b64('Manrope-normal-400-800-latin.woff2')}) format('woff2')}}",
    "serif": lambda: f"@font-face{{font-family:'Fraunces';font-style:normal;font-weight:300 640;font-display:swap;src:url(data:font/woff2;base64,{b64('Fraunces-normal-300-640-latin.woff2')}) format('woff2')}}"
                     f"@font-face{{font-family:'Fraunces';font-style:italic;font-weight:300 640;font-display:swap;src:url(data:font/woff2;base64,{b64('Fraunces-italic-300-640-latin.woff2')}) format('woff2')}}",
    "sora":  lambda: f"@font-face{{font-family:'Sora';font-weight:500 700;font-display:swap;src:url(data:font/woff2;base64,{b64('Sora-normal-500-700-latin.woff2')}) format('woff2')}}",
}

FONTS_FOR = {
    "1-command":       ["sans", "mono", "manrope"],
    "2-elevation":     ["sans", "mono", "sora"],
    "3-constellation": ["sans", "mono", "manrope"],
    "4-editorial":     ["serif", "sans", "mono"],
    "5-datasheet":     ["sans", "mono"],
    "6-ask":           ["sans", "manrope", "mono"],
    "selector":        ["sans", "mono"],   # → index.html (comparison page)
}

data = (HERE / "data.js").read_text()
for key, fams in FONTS_FOR.items():
    src = HERE / f"{key}.html"
    if not src.exists():
        continue
    html = src.read_text().replace("/*@FONTS*/", "".join(FACES[f]() for f in fams)).replace("/*@DATA*/", data)
    out = OUT / ("index.html" if key == "selector" else f"cv-{key}.html")
    out.write_text(html)
    print(out.name, len(html) // 1024, "KB")
