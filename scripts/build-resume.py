"""Generate the one-page, ATS-readable recruiter resume.

All claims are grounded in the public repositories, certificates and roles stated by the owner.
Multi-contributor work, job simulations, prototypes and hackathon participation are labelled
explicitly. No unverified deployment, impact metric, award or employer claim is added.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, KeepTogether
import sys

out = sys.argv[1] if len(sys.argv) > 1 else 'public/Kaustubh-Dua-Resume.pdf'
ink, accent, muted = HexColor('#17151c'), HexColor('#8c1d28'), HexColor('#55515a')
def style(**kw):
    return ParagraphStyle('resume', fontName='Body', textColor=ink, **kw)

name = style(fontName='Helvetica-Bold', fontSize=22, leading=24)
headline = style(fontName='Bold', fontSize=9.6, leading=12, textColor=accent)
contact = style(fontSize=8.1, leading=10.2, textColor=muted)
section = style(fontName='Bold', fontSize=8.8, leading=10, textColor=accent, spaceBefore=4, spaceAfter=1)
body = style(fontSize=8.05, leading=9.8)
role = style(fontName='Bold', fontSize=8.5, leading=10, spaceBefore=2)
detail = style(fontSize=7.45, leading=8.8, textColor=muted)
bullet = style(fontSize=7.75, leading=9.3, leftIndent=10, bulletIndent=1)
small = style(fontSize=7.1, leading=8.3, textColor=muted)

def link(url, label):
    return label

def rule():
    return HRFlowable(width='100%', thickness=0.65, color=accent, spaceAfter=2)

def point(text):
    return Paragraph(text, bullet, bulletText='•')

def project(title, descriptor, stack, bullets, repo):
    return KeepTogether([
        Paragraph(f'{title} <font name="Body" size="7.7" color="#8c1d28"> - {descriptor}</font>', role),
        Paragraph(stack, small),
        *[point(x) for x in bullets],
        Paragraph(link(f'https://github.com/kaustubhdua/{repo}', f'github.com/kaustubhdua/{repo}'), small),
    ])

doc = SimpleDocTemplate(
    out, pagesize=A4, leftMargin=14*mm, rightMargin=14*mm,
    topMargin=8*mm, bottomMargin=7*mm,
    title='Kaustubh Dua - Resume', author='Kaustubh Dua',
    subject='Software Engineering Student · JIIT Noida · Class of 2029',
)

f = [
    Paragraph('Kaustubh Dua', name),
    Paragraph('Software Engineering Student · Full-Stack &amp; Applied AI · JIIT Noida · Class of 2029', headline),
    Spacer(1, 2),
    Paragraph(
        link('mailto:kaustubhdua1991@gmail.com', 'kaustubhdua1991@gmail.com') + '  ·  ' +
        link('https://github.com/kaustubhdua', 'github.com/kaustubhdua') + '  ·  ' +
        link('https://www.linkedin.com/in/kaustubh-dua-2b5a76416', 'linkedin.com/in/kaustubh-dua-2b5a76416') + '  ·  ' +
        link('https://kaustubhdua.vercel.app', 'kaustubhdua.vercel.app'), contact),
    Paragraph('PROFILE', section), rule(),
    Paragraph('Electronics &amp; Computer Engineering undergraduate at JIIT Noida building full-stack software and applied AI/data tools. '
              'Interested in software engineering internships across backend, full-stack and applied AI. Focused on usable interfaces, '
              'clear system boundaries and reliable, testable workflows.', body),

    Paragraph('EDUCATION', section), rule(),
    Paragraph('<b>Jaypee Institute of Information Technology (JIIT), Noida</b> · B.Tech., Electronics &amp; Computer Engineering (ECM)', body),
    Paragraph('2nd year of a 4-year course · Expected graduation 2029', detail),

    Paragraph('EXPERIENCE', section), rule(),
    Paragraph('Pinnacle Labs · Web Development Intern · 2026', role),
    Paragraph('HTML5 · CSS3 · JavaScript · Fetch API · localStorage', small),
    point('Built <b>Weather Core Matrix</b>, a responsive weather dashboard with asynchronous Fetch API updates and live weather-data rendering.'),
    point('Built <b>Nord Studio Task Manager</b>, with localStorage persistence, priority labels and All / Active / Completed filters.'),
    Paragraph(link('https://github.com/kaustubhdua/weather-core-matrix', 'Weather Core Matrix') + '  ·  ' +
              link('https://github.com/kaustubhdua/nord-studio-task-manager', 'Nord Studio Task Manager'), small),

    Paragraph('SELECTED PROJECTS', section), rule(),
    project('NIRDHOOM', 'multi-contributor prototype', 'React 19 · Supabase · PostgreSQL / PostGIS · OR-Tools · PWA',
            ['Contributed to a field-first workflow connecting farmer bookings, field records, operator dispatch, evidence and residue-buyer pathways.',
             'The hosted build is a sample-data prototype; no production impact or deployment metrics are claimed.'], 'nihdhoom'),
    project('Saathi', 'multi-contributor MVP', 'Next.js · FastAPI · Python · Hindi / Hinglish intent routing',
            ['Built around deterministic intent routing, source provenance, consent prompts and human escalation.',
             'Includes a 120-case synthetic intent benchmark; no public live demo or production accuracy claim is advertised.'], 'Saathi'),
    project('PatchPilot', 'personal early-stage project', 'Python · FastAPI · pytest · Docker',
            ['Analyses pull-request diffs as untrusted text and emits evidence-backed risk signals and test suggestions; it does not execute repository code.',
             'Adds bounded inputs, strict request validation and rate limiting. Not a formal security verdict.'], 'PatchPilot'),
    project('JIIT Youth Club Website', 'multi-contributor campus website', 'React · Vite · Supabase · Playwright · CodeQL',
            ['Built and iterated the public club website for events, societies, gallery, archive and recruitment.',
             'Production deployment is not claimed as verified.'], 'JYC-Website'),

    Paragraph('SKILLS', section), rule(),
    Paragraph('<b>Languages:</b> Python · TypeScript · JavaScript · C++17 · Java · SQL · HTML · CSS', body),
    Paragraph('<b>Frontend:</b> React · Next.js · Vite · Tailwind CSS · Three.js / WebGL', body),
    Paragraph('<b>Backend &amp; Data:</b> FastAPI · PostgreSQL / PostGIS · Supabase · SQLAlchemy · OR-Tools · scikit-learn · PyTorch', body),
    Paragraph('<b>Engineering:</b> Git · GitHub Actions · pytest · Playwright · Docker · CodeQL', body),

    Paragraph('LEADERSHIP &amp; COMMUNITY', section), rule(),
    point('<b>Nexus Spring of Code (NSoC)</b> · Campus Ambassador · 2026-Present — representing the open-source program at JIIT Noida and helping students discover contribution opportunities.'),
    point('<b>JIIT Youth Club (JYC), Tech Vertical</b> · Member, Tech and Management team.'),

    Paragraph('CERTIFICATES &amp; CHALLENGES', section), rule(),
    point('<b>JPMorgan Chase &amp; Co. Software Engineering Job Simulation</b> (Forage, 2026) · Java, Spring Boot, Kafka, H2 and REST API integration.'),
    point('<b>Harvard CS50 Introduction to Databases with SQL</b> · seven problem sets and a final project.'),
    point('<b>OSDHACK'26</b> · Certificate of Merit for participation; team-built Adapt AI, a hardware-aware local Ollama assistant.'),
    point('<b>ISRO Bharatiya Antariksh Hackathon 2026</b> · participation with AkashChalak, a satellite-assisted air-quality and hotspot prototype.'),
]
doc.build(f)
print('wrote', out)
