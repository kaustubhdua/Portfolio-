"""Builds public/Kaustubh-Dua-Resume.pdf.

Follows common technical-resume guidance: one page, one column, no tables or images (so applicant
tracking systems read it cleanly), a standard sans font, the order Education > Skills > Projects, and
bullets that start with a past-tense verb. Every statement comes from the public repositories and
READMEs or from what the owner told us directly (programme, institution, graduation year 2029, certificates, club roles and volunteering).
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

name = S(fontName='Bold', fontSize=24, leading=27)
sub = S(fontName='Bold', fontSize=10.5, leading=14, textColor=accent)
contact = S(fontSize=9.2, leading=13, textColor=muted)
head = S(fontName='Bold', fontSize=9.8, leading=12, textColor=accent, spaceBefore=6, spaceAfter=0)
body = S(fontSize=9.1, leading=12)
item = S(fontName='Bold', fontSize=9.9, leading=12.5, spaceBefore=3)
detail = S(fontSize=8.3, leading=10.6, textColor=muted)
bullet = S(fontSize=8.9, leading=11.6, leftIndent=11, bulletIndent=1)

link = lambda u, t: f'<a href="{u}" color="#8c1d28">{t}</a>'
rule = lambda: HRFlowable(width='100%', thickness=0.9, color=accent, spaceAfter=3)
bl = lambda t: Paragraph(t, bullet, bulletText='•')
GH = 'https://github.com/kaustubhdua/'


def project(title, tag, stack, points, repo, live=None):
    links = link(GH + repo, 'github.com/kaustubhdua/' + repo)
    if live:
        links += '  ·  Live: ' + link(live, live.replace('https://', '').rstrip('/'))
    return KeepTogether([
        Paragraph(f'{title} <font name="Body" size="8.8" color="#8c1d28">  {tag}</font>', item),
        Paragraph(stack, detail),
        *[bl(p) for p in points],
        Paragraph(links, detail),
    ])


doc = SimpleDocTemplate(out, pagesize=A4, leftMargin=15*mm, rightMargin=15*mm, topMargin=10*mm, bottomMargin=8*mm,
                        title='Kaustubh Dua - Resume', author='Kaustubh Dua',
                        subject='Software developer, Electronics and Computer Engineering, JIIT Noida (Class of 2029)')

f = [
    Paragraph('Kaustubh Dua', name),
    Paragraph('Software Developer  ·  B.Tech. Electronics &amp; Computer Engineering, JIIT Noida  ·  Class of 2029', sub),
    Spacer(1, 3),
    Paragraph(
        link('mailto:kaustubhdua1991@gmail.com', 'kaustubhdua1991@gmail.com') + '   ·   ' +
        link('https://github.com/kaustubhdua', 'github.com/kaustubhdua') + '   ·   ' +
        link('https://www.linkedin.com/in/kaustubh-dua-2b5a76416', 'linkedin.com/in/kaustubh-dua-2b5a76416'), contact),

    Paragraph('PROFILE', head), rule(),
    Paragraph('Engineering student who ships full-stack products end to end: React or Next.js front ends, FastAPI and Supabase back ends, '
              'automated tests and CI. Careful about security, data boundaries and honest status labels. '
              'Open to software engineering internships in backend, full-stack and applied AI or data work.', body),

    Paragraph('EDUCATION', head), rule(),
    Paragraph('<b>Jaypee Institute of Information Technology (JIIT), Noida</b>', body),
    Paragraph('B.Tech., Electronics &amp; Computer Engineering (ECM)  ·  2nd year of 4  ·  Expected graduation 2029', body),

    Paragraph('SKILLS', head), rule(),
    Paragraph('<b>Languages</b>   Python · TypeScript · JavaScript · SQL · C++17 · Java', body),
    Paragraph('<b>Build</b>   React · Next.js · FastAPI · Supabase · PostgreSQL / PostGIS · SQLAlchemy · Google OR-Tools · scikit-learn · PyTorch · OpenCV', body),
    Paragraph('<b>Ship</b>   Git · GitHub Actions · pytest · Playwright · Appium · Docker · CodeQL', body),

    Paragraph('PROJECTS', head), rule(),
    project('NIRDHOOM', 'Crop-residue coordination platform · prototype', 'React 19, Supabase, PostGIS, OR-Tools, PWA',
            ['Built the full workflow from a farmer\'s booking to operator jobs, dispatch and a buyer-facing pool of <b>verified residue lots</b>.',
             'Kept service keys <b>server-side</b> behind Row Level Security; added SHA-256 evidence hashing and an offline upload queue.'],
            'nihdhoom', 'https://nihdhoom-9qiu.vercel.app/'),
    project('Saathi', 'Voice-first Hindi and Hinglish assistant · MVP', 'Next.js, FastAPI, speech APIs, GitHub Actions',
            ['Made intent routing <b>deterministic</b> and tested it on a <b>120-case benchmark</b>, so the language model is never the source of truth.',
             'Attached a source and timestamp to every factual answer; added consent prompts and <b>human escalation</b>.'],
            'Saathi', 'https://saathi-two-pi.vercel.app'),
    project('GenomeGuard', 'Governance layer for genomic data access · research prototype', 'Python, Starlette, NumPy, PostgreSQL, GitHub Actions',
            ['Built consent-style policy checks, a disclosure-risk estimate and a <b>hash-chained audit log</b>; evaluated differencing and membership attacks on <b>synthetic data</b> and reported where the defences fail.'],
            'GenomeGuard'),
    project('PatchPilot', 'Pull-request risk triage · early stage', 'Python, FastAPI, pytest, Docker',
            ['Wrote an analyser that turns a diff into <b>evidence-backed risk signals</b> and a 0-100 score, without ever running the code it reads.',
             'Hardened the API: input limits, strict schemas, rate limiting and a non-root Docker image.'],
            'PatchPilot'),
    project('JIIT Youth Club website', 'Public site for a campus club · live', 'React 19, Supabase, Playwright, CodeQL',
            ['Built the site for events, clubs, gallery and recruitment, guarded by <b>browser tests and security scanning</b> on every change.'],
            'JYC-Website', 'https://jyc-website-eight.vercel.app'),

    Paragraph('CERTIFICATES AND HACKATHONS', head), rule(),
    bl('<b>JPMorgan Chase &amp; Co. Software Engineering Job Simulation</b> (Forage, April to June 2026): Kafka and H2 integration, REST API integration and a REST controller on a Java and Spring Boot backend.'),
    bl('<b>CS50 Introduction to Databases with SQL</b> (Harvard): schema design, indexing, joins and query optimisation.'),
    bl('<b>OSDHACK\u201926</b>: Certificate of Merit for taking part; the team built Adapt AI.'),
    bl('<b>ISRO Bharatiya Antariksh Hackathon 2026</b>: participated with AkashChalak, a satellite-assisted air-quality and hotspot prototype built on CPCB and NASA FIRMS data.'),

    Paragraph('TEAMS, CLUBS AND VOLUNTEERING', head), rule(),
    bl('<b>JIIT Youth Club (JYC)</b>, Tech Vertical: member of the tech and management team.'),
    bl('<b>AIML and AI-Tronics Club</b>, JIIT: member of the tech and management team.'),
    bl('<b>National Service Scheme (NSS)</b>: volunteer on the cinematography and management teams.'),

    Paragraph('TEAMWORK', head), rule(),
    Paragraph('<b>Adapt AI</b>  (contributor)   Local AI assistant that recommends an Ollama model for a machine\'s RAM and VRAM. '
              'Team project; ' + link(GH + 'adapt-ai', 'my fork') + '.', body),

]
doc.build(f)
print('wrote', out)
