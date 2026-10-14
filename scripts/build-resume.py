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

name = S(fontName='Bold', fontSize=27, leading=30)
sub = S(fontName='Bold', fontSize=10.5, leading=14, textColor=accent)
contact = S(fontSize=9.2, leading=13, textColor=muted)
head = S(fontName='Bold', fontSize=9.8, leading=12, textColor=accent, spaceBefore=9, spaceAfter=1)
body = S(fontSize=9.4, leading=13)
item = S(fontName='Bold', fontSize=10.2, leading=13.5, spaceBefore=5)
detail = S(fontSize=8.6, leading=11.6, textColor=muted)
bullet = S(fontSize=9.3, leading=12.8, leftIndent=11, bulletIndent=1)

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


doc = SimpleDocTemplate(out, pagesize=A4, leftMargin=17*mm, rightMargin=17*mm, topMargin=13*mm, bottomMargin=11*mm,
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
              'Open to software engineering internships.', body),

    Paragraph('EDUCATION', head), rule(),
    Paragraph('<b>Jaypee Institute of Information Technology (JIIT), Noida</b>', body),
    Paragraph('B.Tech., Electronics &amp; Computer Engineering (ECM)  ·  Expected graduation 2029', body),

    Paragraph('SKILLS', head), rule(),
    Paragraph('<b>Languages</b>   Python · TypeScript · JavaScript · SQL · C++17', body),
    Paragraph('<b>Build</b>   React · Next.js · FastAPI · Supabase · PostgreSQL / PostGIS · Google OR-Tools · scikit-learn', body),
    Paragraph('<b>Ship</b>   Git · GitHub Actions · pytest · Playwright · Docker · CodeQL', body),

    Paragraph('PROJECTS', head), rule(),
    project('NIRDHOOM', 'Crop-residue coordination platform · prototype', 'React 19, Supabase, PostGIS, OR-Tools, PWA',
            ['Built the full workflow from a farmer\'s booking to operator jobs, dispatch and a buyer-facing pool of <b>verified residue lots</b>.',
             'Kept service keys <b>server-side</b> behind Row Level Security; added SHA-256 evidence hashing and an offline upload queue.'],
            'nihdhoom', 'https://nihdhoom-9qiu.vercel.app/'),
    project('Saathi', 'Voice-first Hindi and Hinglish assistant · MVP', 'Next.js, FastAPI, speech APIs, GitHub Actions',
            ['Made intent routing <b>deterministic</b> and tested it on a <b>120-case benchmark</b>, so the language model is never the source of truth.',
             'Attached a source and timestamp to every factual answer; added consent prompts and <b>human escalation</b>.'],
            'Saathi', 'https://saathi-two-pi.vercel.app'),
    project('PatchPilot', 'Pull-request risk triage · early stage', 'Python, FastAPI, pytest, Docker',
            ['Wrote an analyser that turns a diff into <b>evidence-backed risk signals</b> and a 0-100 score, without ever running the code it reads.',
             'Hardened the API: input limits, strict schemas, rate limiting and a non-root Docker image.'],
            'PatchPilot'),
    project('JIIT Youth Club website', 'Public site for a campus club · live', 'React 19, Supabase, Playwright, CodeQL',
            ['Built the site for events, clubs, gallery and recruitment, guarded by <b>browser tests and security scanning</b> on every change.'],
            'JYC-Website', 'https://jyc-website-eight.vercel.app'),

    Paragraph('TEAMWORK', head), rule(),
    Paragraph('<b>Adapt AI</b>  (contributor)   Local AI assistant that recommends an Ollama model for a machine\'s RAM and VRAM. '
              'Team project; ' + link(GH + 'adapt-ai', 'my fork') + '.', body),

]
doc.build(f)
print('wrote', out)
