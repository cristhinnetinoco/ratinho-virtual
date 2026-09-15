"""Monta o jogo: junta src/ em dois arquivos.
  ratinho-virtual.html  -> fragmento para publicar como Artifact (sem html/head/body)
  index.html            -> pagina completa para abrir direto no navegador / hospedar
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"
JS_FILES = ["sprites.js", "rat.js", "furniture.js", "pet.js", "sfx.js", "scene.js", "ui.js", "games.js", "games2.js", "main.js"]

css = (SRC / "style.css").read_text(encoding="utf-8")
markup = (SRC / "markup.html").read_text(encoding="utf-8")
js = "\n".join((SRC / f).read_text(encoding="utf-8") for f in JS_FILES)

# checagem simples: linhas de sprite com largura irregular
spr_src = (SRC / "sprites.js").read_text(encoding="utf-8")
block = spr_src.split("const SPR = {", 1)[1].split("\n};", 1)[0]
for m in re.finditer(r"(\w+):\[\s*((?:'[^']*',?\s*)+)\]", block):
    name = m.group(1)
    rows = re.findall(r"'([^']*)'", m.group(2))
    widths = {len(r) for r in rows}
    if len(widths) > 1:
        print(f"AVISO sprite {name}: larguras {sorted(widths)}", file=sys.stderr)

fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap">'
head = f"<title>Tem um rato aqui</title>\n{fonts}\n<style>\n{css}\n</style>\n"
script = f"<script>\n{js}\n</script>\n"

fragment = head + markup + "\n" + script
(ROOT / "ratinho-virtual.html").write_text(fragment, encoding="utf-8")

import shutil, time
BUILD = time.strftime("%Y%m%d-%H%M%S")
sw_reg = (
    "<script>if('serviceWorker' in navigator){addEventListener('load',function(){"
    "navigator.serviceWorker.register('sw.js').catch(function(){});});}</script>\n"
)
standalone = (
    "<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n"
    "<meta charset=\"utf-8\">\n"
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no\">\n"
    "<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">\n"
    "<meta name=\"mobile-web-app-capable\" content=\"yes\">\n"
    "<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black-translucent\">\n"
    "<meta name=\"apple-mobile-web-app-title\" content=\"Tem um rato\">\n"
    "<meta name=\"theme-color\" content=\"#1b1233\">\n"
    "<link rel=\"manifest\" href=\"manifest.webmanifest\">\n"
    "<link rel=\"apple-touch-icon\" href=\"icons/icon-180.png\">\n"
    "<link rel=\"icon\" type=\"image/png\" href=\"icons/icon-192.png\">\n"
    + head + "</head>\n<body>\n" + markup + "\n" + script + sw_reg + "</body>\n</html>\n"
)
(ROOT / "index.html").write_text(standalone, encoding="utf-8")

# pasta "docs": tudo que precisa ser hospedado (GitHub Pages serve a pasta /docs)
SITE = ROOT / "docs"
SITE.mkdir(exist_ok=True)
(SITE / "index.html").write_text(standalone, encoding="utf-8")
(SITE / "manifest.webmanifest").write_text((SRC / "manifest.webmanifest").read_text(encoding="utf-8"), encoding="utf-8")
(SITE / "sw.js").write_text((SRC / "sw.js").read_text(encoding="utf-8").replace("__BUILD__", BUILD), encoding="utf-8")
(SITE / ".nojekyll").write_text("", encoding="utf-8")
icons_src = SRC / "icons"
if icons_src.is_dir():
    (SITE / "icons").mkdir(exist_ok=True)
    for p in icons_src.glob("*.png"):
        shutil.copyfile(p, SITE / "icons" / p.name)
else:
    print("AVISO: src/icons ainda nao existe (icones do app)", file=sys.stderr)
print(f"ok: fragmento {len(fragment)//1024} KB, index {len(standalone)//1024} KB, site/ build {BUILD}")
