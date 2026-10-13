"""Builds public/Kaustubh-Dua-Resume.pdf.

Every line comes from public sources: the kaustubhdua GitHub profile, its repositories and READMEs,
and the details the owner gave directly (programme, institution, graduation year 2029). Nothing is
invented: phone number, grades, awards and employers are left out because none were published.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, KeepTogether, Table, TableStyle
import sys

out = sys.argv[1] if len(sys.argv) > 1 else 'public/Kaustubh-Dua-Resume.pdf'
fd = '/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('Body', fd + 'DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('Bold', fd + 'DejaVuSans-Bold.ttf'))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='Bold')

ink, accent, muted, line = HexColor('#17131c'), HexColor('#a8232f'), HexColor('#5b525c'), HexColor('#d9cfd6')
def S(**k):
    d = dict(fontName='Body', textColor=ink)
    d.update(k)
    return ParagraphStyle('s', **d)

name = S(fontName='Bold', fontSize=22, leading=26)
sub = S(fontSize=10.2, leading=14, textColor=accent)
meta = S(fontSize=8.1, leading=12, textColor=muted)
head = S(fontName='Bold', fontSize=8.8, leading=11, textColor=accent, spaceBefore=9, spaceAfter=2)
body = S(fontSize=8.5, leading=12.2)
item = S(fontName='Bold', fontSize=8.9, leading=12)
small = S(fontSize=8, leading=11.4, textColor=muted)
bullet = S(fontSize=8.4, leading=11.8, leftIndent=9, bulletIndent=0)

link = lambda u, t=None: f'<a href="{u}" color="#a8232f">{t or u.replace("https://", "").rstrip("/")}</a>'
rule = lambda: HRFlowable(width='100%', thickness=0.6, color=line, spaceAfter=3)
bl = lambda t: Paragraph(t, bullet, bulletText='•')

def project(title, stack, points, repo, live=None):
    links = link('https://github.com/kaustubhdua/' + repo, 'GitHub')
    if live:
        links += '  ·  ' + link(live, 'Live')
    return KeepTogether([
        Paragraph(f'{title} <font name="Body" color="#5b525c" size="7.8">|  {stack}</font>', item),
        *[bl(p) for p in points],
        Paragraph(links, small),
        Spacer(1, 3.5),
    ])

doc = SimpleDocTemplate(out, pagesize=A4, leftMargin=17*mm, rightMargin=17*mm, topMargin=14*mm, bottomMargin=12*mm,
                        title='Kaustubh Dua - Resume', author='Kaustubh Dua', subject='Software developer, ECM, JIIT Noida (Class of 2029)')

f = [
    Paragraph('KAUSTUBH DUA', name),
    Paragraph('Software Developer  |  Electronics &amp; Computer Engineering, JIIT Noida  |  Class of 2029', sub),
    Spacer(1, 3),
    Paragraph(
        link('mailto:kaustubhdua1991@gmail.com', 'kaustubhdua1991@gmail.com') + '   •   ' +
        link('https://github.com/kaustubhdua', 'github.com/kaustubhdua') + '   •   ' +
        link('https://www.linkedin.com/in/kaustubh-dua-2b5a76416', 'linkedin.com/in/kaustubh-dua-2b5a76416'), meta),

    Paragraph('SUMMARY', head), rule(),
    Paragraph('Student developer at the intersection of <b>AI, data, systems and product engineering</b>. I turn messy, '
              'real workflows (crop residue, waste routing, multilingual help, security triage) into tested tools with clear system '
              'boundaries, honest status labels and verifiable claims. Working style: <b>build thoughtfully, verify everything</b>.', body),

    Paragraph('EDUCATION', head), rule(),
    Table([[Paragraph('<b>B.Tech., Electronics &amp; Computer Engineering (ECM)</b><br/>Jaypee Institute of Information Technology (JIIT), Noida', body),
            Paragraph('Expected graduation<br/><b>2029</b>', S(fontSize=8.5, leading=12, alignment=2))]],
          colWidths=[None, 38*mm], style=TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('TOPPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 0)])),

    Paragraph('TECHNICAL SKILLS', head), rule(),
    Paragraph('<b>Languages:</b> Python, TypeScript, JavaScript, C++17, SQL', body),
    Paragraph('<b>Application:</b> React, Next.js, Vite, FastAPI, Streamlit, Tailwind CSS', body),
    Paragraph('<b>Data, AI &amp; optimisation:</b> PostgreSQL / PostGIS, Supabase, pandas, scikit-learn, Google OR-Tools, Ollama (local inference), embeddings, Three.js / WebGL', body),
    Paragraph('<b>Quality &amp; delivery:</b> Git, GitHub Actions, pytest, Playwright, CodeQL, Docker, CTest', body),

    Paragraph('SELECTED PROJECTS', head), rule(),
    project('NIRDHOOM', 'React 19, Supabase, PostGIS, OR-Tools, Leaflet',
            ['Crop-residue coordination system linking field requests, service workflows, operational evidence and buyer pathways.',
             'Service keys stay on the server, never in the browser; row-level security guards the data.'],
            'nihdhoom', 'https://nihdhoom-9qiu.vercel.app/'),
    project('Saathi', 'Next.js, FastAPI, speech APIs',
            ['Voice-first, multilingual assistant built around source-aware answers, consent-based workflows and human escalation.',
             'Ships a 120-case synthetic benchmark for its Hindi/Hinglish intent router; labels demo and live results.'],
            'Saathi', 'https://saathi-two-pi.vercel.app'),
    project('SATARK', 'Python, Streamlit, LLM / vision workflows',
            ['AI-assisted security-awareness workspace for triaging suspicious messages, links, images, QR codes, PDFs and supported videos.'],
            'Satark', 'https://satark-32uppvjxwmderrchbhj7gj.streamlit.app/'),
    project('PatchPilot', 'Python, FastAPI, pytest, Docker',
            ['Explainable pull-request risk triage that never clones or executes the code it analyses.'],
            'PatchPilot'),
    project('Smart Waste Collection', 'Python, Random Forest, OR-Tools, Streamlit',
            ['Predict-prioritise-route pipeline for waste collection. States plainly that its IoT-style data is synthetic.'],
            'smart_waste_project', 'https://smartwasteproject-glmvz89ttkxfktcssfdfuc.streamlit.app/'),
    project('GitGlobe', 'React Three Fiber, WebGL, FastAPI, embeddings',
            ['Interactive 3D map for exploring open-source repositories by capability.'],
            'GitGlobe', 'https://gitglobe-yd-mj.vercel.app'),

    Paragraph('COMMUNITY &amp; TEAM WORK', head), rule(),
    bl('<b>JIIT Youth Club website</b> (React 19, Vite, Supabase): public site for the club behind major events at the Sector 128 campus, '
       'guarded by GitHub Actions, CodeQL and Playwright browser checks. ' + link('https://jyc-website-eight.vercel.app', 'Live')),
    bl('<b>Adapt AI</b>: contributor on a team-built local AI assistant that checks hardware and recommends a suitable on-device model (FastAPI, Ollama).'),
    bl('<b>This portfolio</b>: a 3D village and Nether-fortress world built with a hand-written WebGL 2 engine (no 3D library), tested with Playwright.'),

    Paragraph('ALSO BUILT', head), rule(),
    Paragraph('AkashChalak (air-quality hotspot decision support)  •  Smart Bike Taxi Platform (C++17 graph algorithms, CTest)  •  '
              'JIIT Toppers (Next.js, Prisma)  •  Weather Core Matrix and Nord Studio Task Manager (vanilla JS)', body),
]
doc.build(f)
print('wrote', out)
