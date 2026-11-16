from pathlib import Path
import re
from html import escape
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'report'
OUT.mkdir(parents=True, exist_ok=True)
SOURCE = ROOT / 'docs' / 'RAPPORTO_ORGANIZZATORE.md'
PDF = OUT / 'Rapporto_Gioco_degli_Aggettivi.pdf'
for name, file in [('Arial', 'arial.ttf'), ('Arial-Bold', 'arialbd.ttf'), ('Arial-Italic', 'ariali.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(Path('C:/Windows/Fonts') / file)))
pdfmetrics.registerFontFamily('Arial', normal='Arial', bold='Arial-Bold', italic='Arial-Italic', boldItalic='Arial-Bold')
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='ReportTitle', fontName='Arial-Bold', fontSize=24, leading=29, textColor=colors.black, spaceAfter=12))
styles.add(ParagraphStyle(name='ReportSubtitle', fontName='Arial', fontSize=11, leading=16, textColor=colors.black, spaceAfter=7))
styles.add(ParagraphStyle(name='ReportDate', fontName='Arial', fontSize=9, leading=13, textColor=colors.HexColor('#6A706D'), spaceAfter=16))
styles.add(ParagraphStyle(name='ReportHeading', fontName='Arial-Bold', fontSize=13, leading=17, textColor=colors.black, spaceBefore=13, spaceAfter=8, keepWithNext=True))
styles.add(ParagraphStyle(name='ReportBody', fontName='Arial', fontSize=10.3, leading=15.1, textColor=colors.HexColor('#252A28'), spaceAfter=7, allowWidows=0, allowOrphans=0))
styles.add(ParagraphStyle(name='ReportList', parent=styles['ReportBody'], leftIndent=13, firstLineIndent=-13, spaceAfter=10))
styles.add(ParagraphStyle(name='ReportCell', parent=styles['ReportBody'], fontSize=9.3, leading=13.5, spaceAfter=0))
styles.add(ParagraphStyle(name='ReportHeadCell', parent=styles['ReportCell'], fontName='Arial-Bold', textColor=colors.white))
styles.add(ParagraphStyle(name='ReportSource', parent=styles['ReportBody'], fontSize=8.3, leading=10.5, spaceAfter=3))

def markup(t):
    t = escape(t)
    t = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', t)
    return t

def footer(c, d):
    c.saveState()
    c.setFont('Arial', 8)
    c.setFillColor(colors.HexColor('#7D837F'))
    c.drawString(48, 30, 'Gioco degli Aggettivi   |   Rapporto di progetto   |   16 novembre 2026')
    c.drawRightString(A4[0] - 48, 30, str(d.page))
    c.restoreState()

lines = SOURCE.read_text(encoding='utf-8').splitlines()
story = []
i = 0
# Explicit section starts keep the report in five readable parts.
break_before = {'Come si giocherà', 'Le decisioni sul regolamento spettano al suo autore', 'Il piano B in caso di problemi al portale', 'Le prossime fasi'}
while i < len(lines):
    line = lines[i].strip()
    if not line:
        i += 1
        continue
    if line.startswith('# '):
        story.append(Paragraph(markup(line[2:]), styles['ReportTitle']))
    elif line.startswith('## '):
        title = line[3:]
        if title in break_before:
            story.append(PageBreak())
        story.append(Paragraph(markup(title), styles['ReportHeading']))
    elif line.startswith('|'):
        rows = []
        while i < len(lines) and lines[i].strip().startswith('|'):
            cells = [s.strip() for s in lines[i].strip().strip('|').split('|')]
            if not all(re.fullmatch(r'[-: ]+', s) for s in cells):
                rows.append(cells)
            i += 1
        data = [[Paragraph(markup(s), styles['ReportHeadCell'] if r == 0 else styles['ReportCell']) for s in row] for r, row in enumerate(rows)]
        table = Table(data, colWidths=[158, A4[0] - 96 - 158], hAlign='LEFT', repeatRows=1)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#334B5C')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F3F5F6')]),
            ('GRID', (0, 0), (-1, -1), .5, colors.HexColor('#D9D9D9')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 10), ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 7), ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ]))
        story.extend([Spacer(1, 4), table, Spacer(1, 12)])
        continue
    elif re.match(r'^\d+\. ', line):
        story.append(Paragraph(markup(line), styles['ReportList']))
    elif line.startswith('- '):
        text = line[2:]
        if 'https://' in text:
            label, url = text.split('https://', 1)
            story.append(Paragraph(f'<link href="https://{escape(url)}" color="#334B5C">{escape(label.rstrip(": "))}</link>', styles['ReportSource']))
        else:
            story.append(Paragraph(markup('• ' + text), styles['ReportList']))
    elif line.startswith('Rapporto per'):
        story.append(Paragraph(markup(line), styles['ReportSubtitle']))
    elif line.startswith('Informazioni e prezzi verificati'):
        story.append(Paragraph(markup(line), styles['ReportSource']))
    elif line == '16 novembre 2026':
        story.append(Paragraph(line, styles['ReportDate']))
    else:
        story.append(Paragraph(markup(line), styles['ReportBody']))
    i += 1

doc = SimpleDocTemplate(str(PDF), pagesize=A4, rightMargin=48, leftMargin=48, topMargin=42, bottomMargin=50, title='Il progetto della webapp del Gioco degli Aggettivi', author='Progetto Gioco degli Aggettivi', subject='Decisioni tecniche motivazioni e prossime fasi per l’organizzatore')
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(PDF)
