"""Builds public/Kaustubh-Dua-Resume.pdf.

Follows common technical-resume guidance: one page, one column, no tables or images (so applicant
tracking systems read it cleanly), a standard sans font, the order Education > Skills > Projects, and
bullets that start with a past-tense verb. Every statement comes from the public repositories and
READMEs or from what the owner told us directly (programme, institution, graduation year 2029).
Nothing is invented: no phone number, grades, awards, employers or performance figures. Forks and
team projects are labelled as such.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, KeepTogether
import sys

out = sys.argv[1] if len(sys.argv) > 1 else 'public/Kaustubh-Dua-Resume.pdf'
fd = '/usr/share/fonts/truetype/liberation/'
pdfmetrics.registerFont(TTFont('Body', fd + 'LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Bold', fd + 'LiberationSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Italic', fd + 'LiberationSans-Italic.ttf'))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='Bold', italic='Italic')

ink, accent, muted = HexColor('#111111'), HexColor('#8c1d28'), HexColor('#4a4a4a')
S = lambda **k: ParagraphStyle('s', **{'fontName': 'Body', 'textColor': ink, **k})

name = S(fontName='Bold', fontSize=20, leading=23)
sub = S(fontSize=10, leading=13, textColor=accent)
contact = S(fontSize=9, leading=12.5, textColor=muted)
head = S(fontName='Bold', fontSize=9.6, leading=12, textColor=accent, spaceBefore=5, spaceAfter=1)
body = S(fontSize=9, leading=12.4)
item = S(fontName='Bold', fontSize=9.4, leading=12.6, spaceBefore=3)
detail = S(fontSize=8.4, leading=11.4, textColor=muted)
bullet = S(fontSize=8.9, leading=12, leftIndent=10, bulletIndent=1)

link = lambda u, t: f'<a href="{u}" color="#8c1d28">{t}</a>'
rule = lambda: HRFlowable(width='100%', thickness=0.7, color=HexColor('#bdbdbd'), spaceAfter=2)
bl = lambda t: Paragraph(t, bullet, bulletText='•')
GH = 'https://github.com/kaustubhdua/'


def project(title, stack, points, repo, live=None, note=None):
    links = link(GH + repo, 'GitHub: kaustubhdua/' + repo)
    if live:
        links += '   Live demo: ' + link(live, live.replace('https://', '').rstrip('/'))
    head_line = f'{title}' + (f' <font name="Body" size="8.4" color="#4a4a4a">({note})</font>' if note else '')
    return KeepTogether([
        Paragraph(head_line, item),
        Paragraph(stack, detail),
        *[bl(p) for p in points],
        Paragraph(links, detail),
    ])


doc = SimpleDocTemplate(out, pagesize=A4, leftMargin=16*mm, rightMargin=16*mm, topMargin=11*mm, bottomMargin=9*mm,
                        title='Kaustubh Dua - Resume', author='Kaustubh Dua',
                        subject='Software developer, Electronics and Computer Engineering, JIIT Noida (Class of 2029)')

f = [
    Paragraph('Kaustubh Dua', name),
    Paragraph('Software developer · Electronics &amp; Computer Engineering student · Class of 2029', sub),
    Spacer(1, 2),
    Paragraph(
        link('mailto:kaustubhdua1991@gmail.com', 'kaustubhdua1991@gmail.com') + '  ·  ' +
        link('https://github.com/kaustubhdua', 'github.com/kaustubhdua') + '  ·  ' +
        link('https://www.linkedin.com/in/kaustubh-dua-2b5a76416', 'linkedin.com/in/kaustubh-dua-2b5a76416'), contact),

    Paragraph('SUMMARY', head), rule(),
    Paragraph('Engineering student who builds full-stack and data tools end to end in Python and TypeScript: a React or Next.js front end, '
              'a FastAPI or Supabase back end, automated tests and CI. Projects state their limits plainly and make no unmeasured claims.', body),

    Paragraph('EDUCATION', head), rule(),
    Paragraph('<b>Jaypee Institute of Information Technology (JIIT), Noida</b>', body),
    Paragraph('B.Tech., Electronics &amp; Computer Engineering (ECM). Expected graduation: 2029.', body),

    Paragraph('TECHNICAL SKILLS', head), rule(),
    Paragraph('<b>Languages:</b> Python, TypeScript, JavaScript, C++17, SQL', body),
    Paragraph('<b>Frameworks:</b> React, Next.js, Vite, FastAPI, Streamlit, Tailwind CSS', body),
    Paragraph('<b>Data and AI:</b> PostgreSQL, PostGIS, Supabase, pandas, scikit-learn, Google OR-Tools, Ollama, Three.js and WebGL', body),
    Paragraph('<b>Tools and testing:</b> Git, GitHub Actions, pytest, Playwright, CodeQL, Docker, CTest', body),

    Paragraph('PROJECTS', head), rule(),
    project('NIRDHOOM: crop-residue coordination system', 'React 19, Vite, Supabase, PostgreSQL, PostGIS, OR-Tools, Leaflet',
            ['Built a field-to-buyer workflow covering booking, operator jobs, dispatch, residue pooling and verification, as an installable PWA.',
             'Designed server-side API routes and Row Level Security so service keys never reach the browser; added SHA-256 evidence hashing and an offline upload queue.',
             'Integrated an OR-Tools dispatch service with a local fallback, and kept seeded demo data separate from live records. Status: prototype.'],
            'nihdhoom', 'https://nihdhoom-9qiu.vercel.app/'),
    project('Saathi: voice-first multilingual assistant', 'Next.js, React, FastAPI, Python, speech APIs, GitHub Actions',
            ['Implemented deterministic Hindi and Hinglish intent routing and checked it against a 120-case synthetic benchmark.',
             'Attached a source and retrieval time to every factual answer, and added consent prompts and human escalation.',
             'Set up CI for backend tests, front-end checks and dependency audits. Status: MVP.'],
            'Saathi', 'https://saathi-two-pi.vercel.app'),
    project('PatchPilot: pull-request risk triage', 'Python, FastAPI, pytest, Ruff, Docker, GitHub Actions',
            ['Wrote a diff analyser that returns evidence-backed risk signals and a coarse 0-100 score without ever running the analysed code.',
             'Bounded untrusted input with size limits, strict schemas and rate limiting (HTTP 429 with Retry-After); shipped a non-root Docker image. Status: early stage.'],
            'PatchPilot'),
    project('Smart Waste Collection', 'Python, scikit-learn, OR-Tools, Streamlit, Folium',
            ['Built a pipeline that predicts bin fill levels with a Random Forest, scores collection priority from 0 to 100 and plans truck routes with OR-Tools.',
             'Documented that the IoT-style data is synthetic and the routing is simulated. Status: prototype.'],
            'smart_waste_project', 'https://smartwasteproject-glmvz89ttkxfktcssfdfuc.streamlit.app/'),
    project('JIIT Youth Club website', 'React 19, Vite, React Router, Supabase, Playwright, GitHub Actions',
            ['Built the public site for the club (events, clubs, gallery, archive, recruitment) with Supabase-backed content.',
             'Added quality gates: static checks for security, SEO and accessibility, Playwright browser tests and CodeQL scanning.'],
            'JYC-Website', 'https://jyc-website-eight.vercel.app'),

    Paragraph('TEAM WORK AND OTHER PROJECTS', head), rule(),
    bl('<b>Adapt AI</b> (team project, contributor): local AI assistant that recommends an Ollama model for the machine\'s RAM and VRAM (FastAPI, Ollama). '
       'Upstream repository belongs to a teammate. ' + link(GH + 'adapt-ai', 'My fork')),
    bl('<b>This portfolio</b>: a scroll-driven 3D world with a hand-written WebGL 2 engine and no 3D library, covered by Playwright tests. ' + link(GH + 'Portfolio-', 'Source')),
    bl('<b>Explored (forks, not original work):</b> SATARK, a security-awareness triage workspace; GitGlobe, a 3D map of repositories. '
       '<b>Also built:</b> AkashChalak, Smart Bike Taxi (C++17), JIIT Toppers.'),
]
doc.build(f)
print('wrote', out)
