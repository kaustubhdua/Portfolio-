"""Builds public/Kaustubh-Dua-Resume.pdf from the resume text the owner supplied.
Fields the resume leaves as placeholders (phone, graduation year) are omitted, not invented."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
import sys

out = sys.argv[1] if len(sys.argv) > 1 else 'public/Kaustubh-Dua-Resume.pdf'
fd = '/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('Body', fd + 'DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('Bold', fd + 'DejaVuSans-Bold.ttf'))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='Bold')

ink, accent, muted = HexColor('#1a1420'), HexColor('#a8232f'), HexColor('#5b525c')
def S(**k):
    d = dict(fontName='Body', textColor=ink)
    d.update(k)
    return ParagraphStyle('s', **d)

name = S(fontName='Bold', fontSize=21, leading=25)
sub = S(fontSize=10.5, leading=14, textColor=accent)
meta = S(fontSize=8.2, leading=12, textColor=muted)
head = S(fontName='Bold', fontSize=9.2, leading=12, textColor=accent, spaceBefore=11, spaceAfter=2)
body = S(fontSize=8.8, leading=12.6)
item = S(fontName='Bold', fontSize=9, leading=12.4)
small = S(fontSize=8.4, leading=11.8, textColor=muted)

link = lambda u, t=None: f'<a href="{u}" color="#a8232f">{t or u.replace("https://", "")}</a>'
doc = SimpleDocTemplate(out, pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=16*mm, bottomMargin=14*mm,
                        title='Kaustubh Dua - Resume', author='Kaustubh Dua')
rule = lambda: HRFlowable(width='100%', thickness=0.6, color=HexColor('#d9cfd6'), spaceAfter=3)
proj = lambda t, stack, text, repo: [
    Paragraph(f'{t} <font name="Body" color="#5b525c" size="8.2">|  {stack}</font>', item),
    Paragraph(f'{text}  {link("https://github.com/kaustubhdua/" + repo)}', body), Spacer(1, 3)]

f = [
    Paragraph('KAUSTUBH DUA', name),
    Paragraph('Electronics &amp; Computer Engineering Student | Software Developer', sub),
    Spacer(1, 3),
    Paragraph('JIIT Noida  •  ' + link('mailto:kaustubhdua1991@gmail.com', 'kaustubhdua1991@gmail.com') + '  •  ' +
              link('https://github.com/kaustubhdua', 'github.com/kaustubhdua') + '  •  ' +
              link('https://www.linkedin.com/in/kaustubh-dua-2b5a76416', 'linkedin.com/in/kaustubh-dua-2b5a76416'), meta),
    Paragraph('PROFESSIONAL SUMMARY', head), rule(),
    Paragraph('Electronics &amp; Computer Engineering student at Jaypee Institute of Information Technology, Noida, building practical '
              'software across AI, data, systems, and product engineering. Interested in turning complex workflows into useful tools '
              'with clear system boundaries, careful validation, and thoughtful UX.', body),
    Paragraph('EDUCATION', head), rule(),
    Paragraph('B.Tech. / Undergraduate — Electronics &amp; Computer Engineering (ECM)', item),
    Paragraph('Jaypee Institute of Information Technology (JIIT), Noida', body),
    Paragraph('TECHNICAL SKILLS', head), rule(),
    Paragraph('<b>Languages &amp; web:</b> Python, JavaScript/TypeScript, HTML, CSS', body),
    Paragraph('<b>Frameworks &amp; tools:</b> React, Next.js, FastAPI, Streamlit, Vite, esbuild', body),
    Paragraph('<b>Data &amp; systems:</b> PostgreSQL, Supabase, REST APIs, local inference with Ollama', body),
    Paragraph('<b>Engineering:</b> Git/GitHub, automated testing, CI workflows, Playwright, CodeQL', body),
    Paragraph('SELECTED PROJECTS', head), rule(),
    *proj('GitGlobe', 'Three.js, WebGL, embeddings', 'Interactive 3D repository-discovery experience for exploring open-source projects by capability.', 'GitGlobe'),
    *proj('NIRDHOOM', 'React, Supabase, OR-Tools', 'Crop-residue coordination concept connecting field requests, service workflows, operational evidence, and buyer pathways.', 'nihdhoom'),
    *proj('Saathi', 'Next.js, FastAPI, voice UX', 'Voice-first, multilingual assistance platform designed around source-aware answers, consent-based workflows, and human escalation.', 'Saathi'),
    *proj('SATARK', 'Python, Streamlit, threat triage', 'AI-assisted security-awareness workspace for triaging suspicious messages, links, images, QR codes, PDFs, and supported videos.', 'Satark'),
    *proj('Adapt AI', 'FastAPI, Ollama, local inference', 'Local AI assistant that checks available hardware and recommends a suitable model for on-device workflows.', 'adapt-ai'),
    *proj('JIIT Youth Club Website', 'React, Vite, Playwright', 'Public-facing website for organisation information, clubs, events, history, gallery, and recruitment.', 'JYC-Website'),
    Paragraph('ENGINEERING APPROACH', head), rule(),
    Paragraph('Prioritise honest prototype/demo labels, test failure paths as well as happy paths, keep external providers behind clear '
              'interfaces, and verify claims against implementation evidence.', body),
]
doc.build(f)
print('wrote', out)
