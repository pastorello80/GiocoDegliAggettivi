"""Generate the complete roadmap PDF from docs/ROADMAP.md.

Run from the repository root: python scripts/create_roadmap_pdf.py
Requires ReportLab and the Arial fonts included with Windows.
"""

from html import escape
from pathlib import Path
import re

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs' / 'ROADMAP.md'
OUTPUT = ROOT / 'output' / 'pdf' / 'Roadmap_Gioco_degli_Aggettivi.pdf'
INK = colors.HexColor('#243E34')
GREEN = colors.HexColor('#244E3D')
MUTED = colors.HexColor('#66736D')
LIGHT = colors.HexColor('#EFF3ED')
RULE = colors.HexColor('#DCE3DC')
WIDTH = A4[0] - 92


def clean(text):
    return text.replace('\u2014', '-').replace('\u2013', '-').replace('\u2011', '-')


def markup(text):
    text = escape(clean(text))

    def link(match):
        label, target = match.groups()
        if target.startswith(('https://', 'http://')):
            return f'<link href="{target}" color="#244E3D"><u>{label}</u></link>'
        return label

    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', link, text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    return text


def register_fonts():
    folder = Path('C:/Windows/Fonts')
    for name, filename in [('Roadmap', 'arial.ttf'), ('RoadmapBold', 'arialbd.ttf')]:
        pdfmetrics.registerFont(TTFont(name, str(folder / filename)))
    pdfmetrics.registerFontFamily(
        'Roadmap', normal='Roadmap', bold='RoadmapBold',
        italic='Roadmap', boldItalic='RoadmapBold',
    )


def make_styles():
    body = ParagraphStyle(
        'Body', fontName='Roadmap', fontSize=10, leading=14.1,
        textColor=INK, spaceAfter=7, allowWidows=0, allowOrphans=0,
    )
    return {
        'body': body,
        'title': ParagraphStyle('Title', parent=body, fontName='RoadmapBold',
                                fontSize=29, leading=34, spaceAfter=16),
        'heading': ParagraphStyle('Heading', parent=body, fontName='RoadmapBold',
                                  fontSize=15, leading=19, spaceBefore=17,
                                  spaceAfter=10, keepWithNext=True),
        'eyebrow': ParagraphStyle('Eyebrow', parent=body, fontName='RoadmapBold',
                                  fontSize=9, leading=13, textColor=GREEN,
                                  spaceAfter=10),
        'small': ParagraphStyle('Small', parent=body, fontSize=8.5, leading=12,
                                textColor=MUTED),
        'list': ParagraphStyle('List', parent=body, leftIndent=12,
                               firstLineIndent=-12, spaceAfter=6),
        'task': ParagraphStyle('Task', parent=body, spaceAfter=0),
        'cell': ParagraphStyle('Cell', parent=body, fontSize=8.3,
                               leading=11.4, spaceAfter=0),
        'headcell': ParagraphStyle('HeadCell', parent=body, fontName='RoadmapBold',
                                   fontSize=8.3, leading=11.4, textColor=colors.white,
                                   spaceAfter=0),
        'criterion': ParagraphStyle('Criterion', parent=body, fontSize=9.4,
                                    leading=13.2, spaceAfter=0),
    }


class Task(Flowable):
    """A vector checkbox with a hanging paragraph; no font-dependent symbols."""

    def __init__(self, text, checked, style):
        super().__init__()
        self.paragraph = Paragraph(markup(text), style)
        self.checked = checked
        self.spaceAfter = 6

    def wrap(self, available_width, available_height):
        self.width = available_width
        _, self.height = self.paragraph.wrap(available_width - 19, available_height)
        return self.width, self.height

    def draw(self):
        c = self.canv
        top = self.height - 10.6
        c.setStrokeColor(GREEN if self.checked else MUTED)
        c.setLineWidth(.7)
        c.roundRect(1, top, 8.2, 8.2, 1, stroke=1, fill=0)
        if self.checked:
            c.setLineWidth(1)
            path = c.beginPath()
            path.moveTo(2.4, top + 4.1)
            path.lineTo(4.3, top + 2.3)
            path.lineTo(7.7, top + 6.1)
            c.drawPath(path)
        self.paragraph.drawOn(c, 19, 0)


class RoadmapDoc(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if isinstance(flowable, Paragraph) and hasattr(flowable, 'outline_key'):
            self.canv.bookmarkPage(flowable.outline_key)
            self.canv.addOutlineEntry(flowable.getPlainText(), flowable.outline_key, 0)


def furniture(c, doc):
    c.saveState()
    c.setStrokeColor(RULE)
    c.setLineWidth(.6)
    c.line(46, A4[1] - 37, A4[0] - 46, A4[1] - 37)
    c.setFont('RoadmapBold', 8)
    c.setFillColor(GREEN)
    c.drawString(46, A4[1] - 28, 'GIOCO DEGLI AGGETTIVI')
    c.setFont('Roadmap', 8)
    c.setFillColor(MUTED)
    c.drawRightString(A4[0] - 46, A4[1] - 28, 'ROADMAP DI SVILUPPO')
    c.line(46, 39, A4[0] - 46, 39)
    c.drawString(46, 26, '17 novembre 2026  |  Fonte: docs/ROADMAP.md')
    c.drawRightString(A4[0] - 46, 26, f'{doc.page}')
    c.restoreState()


def heading(text, styles, key):
    paragraph = Paragraph(markup(text), styles['heading'])
    paragraph.outline_key = key
    return paragraph


def overview(rows, styles):
    data = []
    for index, row in enumerate(rows):
        cells = []
        for column, value in enumerate(row):
            rendered = markup(value)
            if index and column == 0:
                rendered = f'<link href="#phase-{value}"><b>{rendered}</b></link>'
            cells.append(Paragraph(rendered, styles['headcell' if index == 0 else 'cell']))
        data.append(cells)
    table = Table(data, colWidths=[35, 171, 80, WIDTH - 286], repeatRows=1, hAlign='LEFT')
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), GREEN),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT]),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('LINEBELOW', (0, 0), (-1, 0), .7, GREEN),
        ('LINEBELOW', (0, -1), (-1, -1), .5, RULE),
    ]))
    return table


def build():
    register_fonts()
    styles = make_styles()
    lines = SOURCE.read_text(encoding='utf-8').splitlines()
    story = [Spacer(1, 12), Paragraph('PIANIFICAZIONE DEL PROGETTO', styles['eyebrow'])]
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if not line:
            i += 1
            continue
        if line.startswith('# '):
            # Two lines keep the complete original title readable.
            title = clean(line[2:]).replace(' - Gioco degli Aggettivi', '<br/>Gioco degli Aggettivi')
            story.append(Paragraph(title, styles['title']))
            i += 1
            continue
        if line.startswith('## '):
            title = line[3:]
            number = re.match(r'^(\d+)\.', title)
            if title == 'Stato e traguardi':
                story.append(PageBreak())
                key = 'overview'
            elif number:
                key = f'phase-{number[1]}'
                # Keep related phases on one page without orphaned criteria.
                if number[1] in ('0', '2', '4', '6', '8', '10', '11', '13'):
                    story.append(PageBreak())
            else:
                key = 'next-work'
            story.append(heading(title, styles, key))
            i += 1
            continue
        if line.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].strip().startswith('|'):
                row = [cell.strip() for cell in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r'[-: ]+', cell) for cell in row):
                    rows.append(row)
                i += 1
            story.extend([overview(rows, styles), Spacer(1, 12)])
            continue

        parts = [line]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(
                r'^(#|\||- |\d+\. )', lines[i].strip()):
            parts.append(lines[i].strip())
            i += 1
        text = ' '.join(parts)
        checkbox = re.match(r'^- \[([ xX])\] (.*)', text)
        if checkbox:
            story.append(Task(checkbox[2], checkbox[1].lower() == 'x', styles['task']))
        elif text.startswith('- '):
            story.append(Paragraph('• ' + markup(text[2:]), styles['list']))
        elif re.match(r'^\d+\. ', text):
            story.append(Paragraph(markup(text), styles['list']))
        elif text.startswith(('**Completata quando:', '**Criterio di avvio:')):
            box = Table([[Paragraph(markup(text), styles['criterion'])]], colWidths=[WIDTH])
            box.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), LIGHT),
                ('LINEBEFORE', (0, 0), (0, -1), 2, GREEN),
                ('LEFTPADDING', (0, 0), (-1, -1), 11),
                ('RIGHTPADDING', (0, 0), (-1, -1), 11),
                ('TOPPADDING', (0, 0), (-1, -1), 9),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 9),
            ]))
            story.extend([Spacer(1, 4), box, Spacer(1, 7)])
        else:
            story.append(Paragraph(markup(text), styles['body']))

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = RoadmapDoc(
        str(OUTPUT), pagesize=A4, leftMargin=46, rightMargin=46,
        topMargin=53, bottomMargin=53,
        title='Roadmap di sviluppo - Gioco degli Aggettivi',
        author='Progetto Gioco degli Aggettivi',
        subject='Fasi, attivita, dipendenze e criteri di completamento',
        pageCompression=1,
    )
    doc.build(story, onFirstPage=furniture, onLaterPages=furniture)
    print(OUTPUT)


if __name__ == '__main__':
    build()
