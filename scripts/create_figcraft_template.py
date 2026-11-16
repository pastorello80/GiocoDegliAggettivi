"""Build an editable FigCraft starter with the official CLI (tested with 0.18.1).

Usage: python scripts/create_figcraft_template.py --cli path/to/figcraft-cli.exe
No editor installation, font installation, account or MCP configuration is changed.
"""
import argparse
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "design"
COLORS = {
    "paper": "#f8f7f2", "surface": "#fffefa", "ink": "#263c33",
    "muted": "#7c827a", "line": "#e8e9e0", "green": "#244d3b",
    "orange": "#df5837", "mint": "#e8eddf", "peach": "#f8e5dc",
    "violet": "#ece7f4", "yellow": "#f5edcf", "white": "#ffffff",
}
STEPS = []
FRAME_NAMES = []
COUNTER = 0


def ref(name):
    return {"$ref": name}


def call(command, params, alias=None):
    step = {"command": command, "params": params}
    if alias:
        step["as"] = alias
    STEPS.append(step)


def paint(color):
    return {"$var": ref("color_" + color)} if color in COLORS else color


def node(parent, name, x, y, w, h, kind="frame", fill="none", alias=None, **props):
    global COUNTER
    COUNTER += 1
    alias = alias or f"layer_{COUNTER}"
    params = dict(type=kind, name=name, x=x, y=y, width=w, height=h,
                  props={"fill": paint(fill), **props}, select=False)
    if parent:
        params["parent"] = ref(parent)
    call("node.create", params, alias)
    return alias


def text(parent, content, x, y, w, size=14, color="ink", serif=False,
         bold=False, name=None, h=None, **props):
    return node(parent, name or content.replace("\n", " ")[:60], x, y, w,
                h or size * 1.5, "text", color, characters=content,
                fontFamily="DM Serif Display" if serif else "DM Sans",
                fontStyle="Regular" if not bold else "Bold", fontSize=size,
                lineHeight="130%", textAutoResize="height", **props)


def rect(parent, name, x, y, w, h, color="surface", radius=12, stroke=None, **props):
    return node(parent, name, x, y, w, h, "rectangle", color,
                cornerRadius=radius,
                **({"stroke": paint(stroke), "strokeWeight": 1} if stroke else {}), **props)


def panel(parent, name, x, y, w, h, color="surface", **props):
    return node(parent, name, x, y, w, h, fill=color, cornerRadius=14,
                stroke=paint("line"), strokeWeight=1, **props)


def board(alias, label, x, y, w, h):
    text(None, label, x, y-30, w, 13, bold=True)
    result = node(None, label, x, y, w, h, fill="paper", alias=alias, clip=True)
    FRAME_NAMES.append(alias)
    return result


def instance(component, parent, x, y, w=None, alias=None):
    global COUNTER
    COUNTER += 1
    alias = alias or f"instance_{COUNTER}"
    call("instance.create", {"component": ref(component), "parent": ref(parent),
                             "x": x, "y": y}, alias)
    if w:
        call("node.set", {"ids": [ref(alias)], "props": {"width": w}})
    return alias


def button_component(parent, alias, label, x, y, color="green", foreground="white", w=342):
    b = node(parent, "Pulsante / " + label, x, y, w, 50, "component", color,
             alias=alias, cornerRadius=9, layout="horizontal", gap=16,
             padding=[12, 20, 12, 20], mainAlign="center", crossAlign="center")
    text(b, label, 0, 0, 210, 14, foreground, bold=True, sizingH="hug", sizingV="hug")
    text(b, "→", 0, 0, 20, 20, foreground, sizingH="hug", sizingV="hug")
    return b


def mobile_header(parent):
    rect(parent, "Marchio", 24, 25, 32, 32, "orange", 9)
    text(parent, "Aa", 27, 27, 30, 20, "white", serif=True)
    text(parent, "Gioco degli Aggettivi", 66, 29, 236, 16, bold=True)
    text(parent, "DEMO", 318, 34, 50, 10, "orange", bold=True)
    rect(parent, "Separatore", 24, 78, 342, 1, "line", 0)


def mobile_nav(parent, y, active="Turno"):
    bar = node(parent, "Navigazione mobile", 0, y, 390, 80, fill="surface")
    rect(bar, "Separatore", 0, 0, 390, 1, "line", 0)
    for i, (symbol, label) in enumerate([("⌂", "Turno"), ("#", "Classifica"),
                                        ("≡", "Giocate"), ("?", "Regole")]):
        x = 8 + i * 96
        if label == active:
            rect(bar, "Voce attiva", x+10, 8, 60, 58, "mint", 10)
        text(bar, symbol, x+24, 11, 32, 22, "green" if label == active else "muted",
             textAlign="center")
        text(bar, label, x, 44, 80, 11, "green" if label == active else "muted",
             bold=label == active, textAlign="center")


def word_card(parent, x, y, w, compact=False):
    p = panel(parent, "Turno / parola e iniziale", x, y, w, 188 if compact else 208, "mint")
    text(p, "●  TURNO DIMOSTRATIVO", 20, 16, w-50, 10, "green", bold=True)
    text(p, "LA PAROLA È", 20, 50, 210, 10, "muted")
    text(p, "DOCUMENTO", 20, 70, w-96, 26 if compact else 39, serif=True)
    tile = node(p, "Iniziale richiesta", w-78, 54, 58, 66, fill="surface", cornerRadius=10)
    text(tile, "LETTERA", 5, 6, 48, 8, "muted", textAlign="center")
    text(tile, "C", 6, 17, 46, 36, serif=True, textAlign="center")
    text(p, "Quali aggettivi gli stanno meglio?", 20, 116 if compact else 130, w-40, 12, "muted")
    rect(p, "Separatore", 20, 148 if compact else 166, w-40, 1, "#d4dccd", 0)
    text(p, "Scadenza di esempio · 22 novembre, ore 12:00", 20, 158 if compact else 177,
         w-40, 10, "muted")


def answers(parent, x, y, w, mobile=False):
    p = panel(parent, "Giocata / cinque aggettivi", x, y, w, 444 if mobile else 450)
    text(p, "Le tue parole", 20, 20, w-90, 19, bold=True)
    text(p, "0 / 5", w-60, 24, 45, 12, "muted")
    text(p, "Dalla più calzante alla meno calzante.", 20, 50, w-40, 11, "muted")
    for i in range(5):
        row = node(p, f"Aggettivo / posizione {i+1}", 20, 84+i*49, w-40, 42,
                   fill="paper", stroke=paint("line"), strokeWeight=1, cornerRadius=7)
        text(row, f"{i+1:02}", 12, 13, 24, 11, "muted")
        text(row, "Il primo che ti viene in mente…" if i == 0 else "Un altro aggettivo con la C…",
             44, 13, w-140, 10 if mobile else 12, "muted")
        text(row, "↕", w-88, 10, 24, 15, "muted")
    text(p, "Bozza salvata su questo dispositivo", 20, 342, w-40, 10, "muted")
    instance("button_primary", p, 20, 375, w-40)


def kit():
    p = board("kit", "05 · Kit grafico / componenti e colori", 0, 1800, 1120, 1090)
    text(p, "Un tema, tante possibilità.", 40, 36, 1000, 42, serif=True)
    text(p, "Modifica i colori nelle variabili; duplica i componenti dal pannello Assets.",
         40, 98, 1000, 15, "muted")
    for i, color in enumerate(["paper", "surface", "ink", "green", "orange", "mint", "peach", "violet", "yellow"]):
        x = 40 + i*117
        rect(p, f"Colore / {color}", x, 150, 100, 70, color, 10, "line")
        text(p, color, x, 231, 110, 12, bold=True)
        text(p, COLORS[color], x, 253, 110, 11, "muted")
    text(p, "Tipografia", 40, 310, 460, 22, bold=True)
    text(p, "Le parole ci uniscono.", 40, 354, 650, 38, serif=True)
    text(p, "DM Serif Display · titoli e parola del turno", 40, 415, 650, 13, "muted")
    text(p, "Cinque aggettivi, nel tuo ordine.", 40, 456, 650, 23, bold=True)
    text(p, "DM Sans · interfaccia, pulsanti e testi", 40, 496, 650, 13, "muted")
    text(p, "Componenti riutilizzabili", 40, 552, 650, 22, bold=True)
    button_component(p, "button_primary", "Prova la giocata", 40, 603)
    button_component(p, "button_secondary", "Torna alle parole", 40, 671, "mint", "green")
    text(p, "I pulsanti usano auto layout:", 40, 752, 345, 15, bold=True)
    text(p, "cambia il testo o la larghezza.\nLe istanze seguono il componente.\n\nI layout delle schermate sono espliciti:\nmobile e desktop si modificano separatamente.",
         40, 786, 345, 14, "muted")
    text(p, "Booster / quattro componenti", 430, 603, 640, 17, bold=True)
    for i, (alias, title, badge, desc, color) in enumerate([
        ("jolly", "Jolly", "×2", "Raddoppia il punteggio base.", "peach"),
        ("estensore", "Estensore", "10", "Gioca dieci aggettivi.", "violet"),
        ("top", "Top", "1°", "Potenzia il primo aggettivo.", "yellow"),
        ("cinque", "5su10", "5/10", "Contano le cinque migliori.", "mint"),
    ]):
        b = node(p, "Booster / " + title, 430, 649+i*90, 342, 76, "component", "surface",
                 alias="booster_"+alias, cornerRadius=10, stroke=paint("line"), strokeWeight=1)
        rect(b, "Simbolo", 12, 15, 46, 46, color, 9)
        text(b, badge, 16, 27, 38, 17, "green", bold=True, textAlign="center")
        text(b, title, 72, 14, 230, 15, bold=True)
        text(b, desc, 72, 39, 236, 11, "muted")
        node(b, "Selezione", 316, 29, 16, 16, "ellipse", "none", stroke=paint("line"), strokeWeight=1)
    text(p, "Spaziature", 823, 650, 245, 16, bold=True)
    text(p, "8 · 12 · 16 · 24 · 32\n\nAngoli\n7 · 9 · 14 px\n\nTocco\nPulsanti alti 50 px\n\nStato\nPrototipo dimostrativo",
         823, 688, 245, 14, "muted")


def mobile_turn():
    p = board("mobile_turn", "01 · Mobile / il mio turno · 390 px", 0, 160, 390, 1480)
    mobile_header(p)
    text(p, "SI GIOCA CON LE PAROLE", 24, 99, 340, 10, "orange", bold=True, letterSpacing=1.6)
    text(p, "Il tuo prossimo\ncolpo di genio.", 24, 126, 342, 37, serif=True)
    text(p, "Una parola, una lettera. Prova a pensare\ncome il gruppo.", 24, 234, 342, 13, "muted")
    word_card(p, 24, 294, 342, True)
    answers(p, 24, 502, 342, True)
    text(p, "I tuoi booster", 24, 976, 342, 24, serif=True)
    text(p, "Scegline uno, oppure tienili per dopo.", 24, 1015, 342, 12, "muted")
    for i, alias in enumerate(["jolly", "estensore", "top", "cinque"]):
        instance("booster_"+alias, p, 24, 1050+i*82, 342)
    mobile_nav(p, 1400)


def mobile_ranking():
    p = board("mobile_ranking", "02 · Mobile / classifica · 390 × 844", 450, 160, 390, 844)
    mobile_header(p)
    text(p, "OGNI PAROLA CONTA", 24, 105, 342, 10, "orange", bold=True, letterSpacing=1.5)
    text(p, "La classifica.", 24, 136, 342, 38, serif=True)
    text(p, "Nomi e punteggi di esempio.", 24, 194, 342, 13, "muted")
    tabs = node(p, "Filtro serie", 24, 238, 342, 44, fill="mint", cornerRadius=9,
                layout="horizontal", gap=6, padding=4)
    for i, label in enumerate(["Tutte", "Serie A", "Serie B"]):
        t = node(tabs, label, 0, 0, 107, 36, fill="surface" if i == 0 else "none",
                 cornerRadius=6, layout="horizontal", mainAlign="center", crossAlign="center")
        text(t, label, 0, 0, 90, 12, "green", textAlign="center", sizingH="hug", sizingV="hug")
    table = panel(p, "Classifica / righe modificabili", 24, 306, 342, 376)
    text(table, "CONCORRENTE", 18, 17, 230, 9, "muted", bold=True)
    text(table, "PUNTI", 279, 17, 55, 9, "muted", bold=True)
    for i, (name, score) in enumerate([("Le parole al vento", 286), ("Giulia", 274),
                                        ("I fuori dizionario", 263), ("Andrea", 251), ("Martina", 246)]):
        y = 48 + i*63
        rect(table, "Separatore", 18, y-3, 306, 1, "line", 0)
        rect(table, "Posizione", 18, y+8, 34, 34, "yellow" if i == 0 else "paper", 9)
        text(table, str(i+1), 18, y+16, 34, 13, "green", bold=True, textAlign="center")
        text(table, name, 64, y+8, 210, 13, bold=True)
        text(table, "Serie A", 64, y+30, 200, 10, "muted")
        text(table, str(score), 279, y+16, 50, 16, bold=True)
    text(p, "La formula ufficiale sarà definita dall’autore.", 24, 704, 342, 11, "muted")
    mobile_nav(p, 764, "Classifica")


def mobile_confirm():
    p = board("mobile_confirm", "03 · Mobile / riepilogo · 390 × 844", 900, 160, 390, 844)
    mobile_header(p)
    text(p, "←  TORNA AL TURNO", 24, 108, 342, 11, "muted", bold=True)
    text(p, "Un ultimo\nsguardo.", 24, 147, 342, 41, serif=True)
    text(p, "Controlla le parole e il loro ordine.\nÈ una prova: nessun invio all’organizzatore.",
         24, 270, 342, 13, "muted")
    box = panel(p, "Riepilogo della giocata", 24, 340, 342, 296)
    text(box, "DOCUMENTO · LETTERA C", 20, 20, 302, 11, "green", bold=True)
    for i, word in enumerate(["Chiaro", "Completo", "Corretto", "Comprensibile", "Confidenziale"]):
        text(box, f"{i+1:02}", 20, 61+i*40, 28, 12, "muted")
        text(box, word, 64, 58+i*40, 255, 16, bold=True)
    text(p, "Nessun booster selezionato", 24, 663, 342, 12, "muted")
    # A distinct component keeps this label editable without touching the submit label.
    button_component(p, "button_confirm", "Conferma la prova", 24, 705)
    text(p, "Torna alle parole", 24, 780, 342, 13, "green", textAlign="center")


def desktop():
    p = board("desktop_turn", "04 · Desktop / il mio turno · 1440 × 1120", 1380, 160, 1440, 1120)
    sidebar = node(p, "Menu laterale", 0, 0, 240, 1120, fill="surface")
    rect(sidebar, "Marchio", 28, 36, 40, 40, "orange", 11)
    text(sidebar, "Aa", 31, 42, 34, 24, "white", serif=True)
    text(sidebar, "Gioco degli\nAggettivi", 81, 35, 140, 16, bold=True)
    text(sidebar, "7ª EDIZIONE · DEMO", 28, 116, 200, 10, "muted", letterSpacing=1.2)
    for i, label in enumerate(["Il mio turno", "Classifiche", "Le mie giocate", "Come si gioca"]):
        if i == 0:
            rect(sidebar, "Pagina attiva", 16, 172, 208, 48, "mint", 9)
        text(sidebar, label, 39, 188+i*62, 184, 14, "green" if i == 0 else "muted", bold=i == 0)
    rect(sidebar, "Separatore", 28, 476, 184, 1, "line", 0)
    text(sidebar, "Area organizzatore", 39, 502, 180, 13, "muted")
    text(sidebar, "Un gioco di parole.\nUna questione di affinità.", 28, 986, 184, 12, "muted")
    text(p, "STAGIONE 2026 / 27", 288, 35, 500, 10, "muted", letterSpacing=1.5)
    text(p, "Anteprima interattiva  ·  Dati di esempio", 930, 35, 430, 11, "muted", textAlign="right")
    rect(p, "Separatore", 288, 77, 1104, 1, "line", 0)
    text(p, "SI GIOCA CON LE PAROLE", 288, 110, 850, 10, "orange", bold=True, letterSpacing=1.8)
    text(p, "Il tuo prossimo\ncolpo di genio.", 288, 140, 850, 53, serif=True)
    text(p, "Una parola, una lettera. Trova gli aggettivi che ci uniscono.", 288, 300, 880, 14, "muted")
    word_card(p, 288, 354, 628)
    answers(p, 288, 586, 628)
    b = panel(p, "Booster del turno", 940, 354, 412, 492)
    text(b, "UNA MARCIA IN PIÙ", 24, 23, 364, 9, "orange", bold=True, letterSpacing=1.5)
    text(b, "I tuoi booster", 24, 50, 364, 25, serif=True)
    text(b, "Uno per turno. Puoi anche tenerli per dopo.", 24, 94, 364, 12, "muted")
    for i, alias in enumerate(["jolly", "estensore", "top", "cinque"]):
        instance("booster_"+alias, b, 24, 139+i*82, 364)
    note = panel(p, "Suggerimento", 940, 870, 412, 160, "yellow")
    text(note, "Non cercare la più rara.", 24, 22, 364, 25, serif=True)
    text(note, "Trova quella che pensano gli altri.", 24, 59, 364, 23, serif=True)
    text(note, "Ripassa le regole  →", 24, 113, 364, 12, "green", bold=True)
    text(p, "Le parole sono più belle quando diventano un gioco.", 288, 1070, 1040, 11, "muted")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cli", required=True)
    args = parser.parse_args()
    cli = Path(args.cli).resolve()
    OUT.mkdir(parents=True, exist_ok=True)
    scratch = ROOT / "tmp" / "figcraft-reference"
    scratch.mkdir(parents=True, exist_ok=True)
    for filename in ["dm-sans-400.ttf", "dm-sans-500.ttf", "dm-sans-600.ttf", "dm-sans-700.ttf",
                     "dm-serif-display.ttf", "dm-serif-display-italic.ttf"]:
        call("text.loadFont", {"path": str(ROOT / "webapp" / "public" / "fonts" / filename)})
    call("page.rename", {"name": "Aggettivi · schermate e componenti"})
    call("variable.createCollection", {"name": "Tema Aggettivi"}, "theme")
    for name, color in COLORS.items():
        call("variable.create", {"collection": ref("theme"), "name": name,
                                 "type": "color", "value": color}, "color_"+name)
    text(None, "GIOCO DEGLI AGGETTIVI / BASE DI LAVORO", 0, 0, 2780, 36, bold=True)
    text(None, "Template modificabile · schermate statiche · nessun calcolo o invio · regole da confermare con l’autore",
         0, 64, 2780, 18, "muted")
    kit()
    mobile_turn()
    mobile_ranking()
    mobile_confirm()
    desktop()
    call("file.saveAs", {"path": str(OUT / "Gioco_degli_Aggettivi.figcraft")})
    for frame in FRAME_NAMES:
        call("file.export", {"ids": [ref(frame)], "format": "png", "scale": 1,
                             "path": str(OUT / (frame+".png"))})
        call("file.exportSvg", {"ids": [ref(frame)], "svgOutlineText": False,
                                "svgIdAttribute": True, "path": str(OUT / (frame+".svg"))})
    commands = scratch / "create-template.json"
    commands.write_text(json.dumps(STEPS, ensure_ascii=False, indent=2), encoding="utf-8")
    result = subprocess.run([str(cli), "run", str(commands)], capture_output=True, text=True,
                            encoding="utf-8", errors="replace")
    (scratch / "generation.log").write_text(result.stdout+result.stderr, encoding="utf-8")
    if result.returncode:
        raise RuntimeError(result.stderr or result.stdout[-3000:])
    lines = [json.loads(line) for line in result.stdout.splitlines() if line.startswith("{")]
    failed = [line for line in lines if line.get("ok") is False]
    if failed:
        raise RuntimeError(failed)
    print(f"Created {len(FRAME_NAMES)} boards with {len(STEPS)} successful commands: {OUT}")


if __name__ == "__main__":
    main()
