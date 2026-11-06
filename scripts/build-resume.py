"""Build Kaustubh Dua's concise, one-page, ATS-readable recruiter resume.

This file is the source of truth for public/Kaustubh-Dua-Resume.pdf.
It distinguishes merged upstream contributions, team prototypes, job simulations,
hackathon participation and unverified deployments.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, HRFlowable
import sys

out = sys.argv[1] if len(sys.argv) > 1 else 'public/Kaustubh-Dua-Resume.pdf'
ink, accent, muted = HexColor('#17151c'), HexColor('#8c1d28'), HexColor('#55515a')

def style(**kw):
    kw.setdefault('fontName', 'Helvetica')
    kw.setdefault('textColor', ink)
    return ParagraphStyle('resume', **kw)

name = style(fontName='Helvetica-Bold', fontSize=21, leading=23)
headline = style(fontName='Helvetica-Bold', fontSize=9.2, leading=11, textColor=accent)
section = style(fontName='Helvetica-Bold', fontSize=8.5, leading=9.5, textColor=accent, spaceBefore=3, spaceAfter=1)
body = style(fontSize=7.7, leading=9.1)
detail = style(fontSize=7.0, leading=8.1, textColor=muted)
bullet_style = style(fontSize=7.5, leading=8.8, leftIndent=9, bulletIndent=0)

def section_heading(label):
    return [Paragraph(label, section), HRFlowable(width='100%', thickness=.55, color=accent, spaceAfter=1)]

def bullet(text):
    return Paragraph(text, bullet_style, bulletText='-')

doc = SimpleDocTemplate(
    out, pagesize=A4, leftMargin=14*mm, rightMargin=14*mm,
    topMargin=8*mm, bottomMargin=7*mm,
    title='Kaustubh Dua - Resume', author='Kaustubh Dua',
    subject='Software Engineering Student - JIIT Noida - Class of 2029',
)

story = [
    Paragraph('Kaustubh Dua', name),
    Paragraph('Software Engineering Student | Full-Stack &amp; Applied AI | JIIT Noida | Class of 2029', headline),
    Paragraph('kaustubhdua1991@gmail.com | github.com/kaustubhdua | linkedin.com/in/kaustubh-dua-2b5a76416 | kaustubhdua.vercel.app', detail),
    *section_heading('PROFILE'),
    Paragraph('Electronics &amp; Computer Engineering undergraduate building full-stack software and applied AI/data tools. Seeking software engineering internships across backend, full-stack and applied AI; focused on usable interfaces, clear system boundaries and reliable testing.', body),
    *section_heading('EDUCATION'),
    Paragraph('<b>Jaypee Institute of Information Technology, Noida</b> | B.Tech. Electronics &amp; Computer Engineering (ECM) | Expected 2029 | <b>CGPA: 9.2/10 overall</b>', body),
    *section_heading('EXPERIENCE'),
    Paragraph('<b>Pinnacle Labs | Web Development Intern | 2026</b> | HTML5, CSS3, JavaScript, Fetch API, localStorage', body),
    bullet('Built Weather Core Matrix, a responsive weather dashboard with asynchronous Fetch API updates.'),
    bullet('Built Nord Studio Task Manager with localStorage persistence, priority labels and All / Active / Completed filters.'),
    Paragraph('github.com/kaustubhdua/weather-core-matrix | github.com/kaustubhdua/nord-studio-task-manager', detail),
    *section_heading('SELECTED PROJECTS'),
    Paragraph('<b>NIRDHOOM</b> | Multi-contributor prototype | React, Supabase, PostgreSQL/PostGIS, OR-Tools', body),
    bullet('Contributed to a field-first workflow connecting farmer bookings, operator dispatch, evidence and residue-buyer pathways; hosted preview uses sample data.'),
    Paragraph('github.com/kaustubhdua/nihdhoom', detail),
    Paragraph('<b>Saathi</b> | Multi-contributor MVP | Next.js, FastAPI, Python', body),
    bullet('Hindi/Hinglish assistant with deterministic intent routing, source provenance, consent prompts and human escalation; includes a 120-case synthetic benchmark.'),
    Paragraph('github.com/kaustubhdua/Saathi', detail),
    Paragraph('<b>PatchPilot</b> | Personal early-stage project | Python, FastAPI, pytest, Docker', body),
    bullet('Analyses pull-request diffs as untrusted text and emits evidence-backed risk signals and test suggestions; never executes repository code.'),
    Paragraph('github.com/kaustubhdua/PatchPilot', detail),
    Paragraph('<b>JIIT Youth Club Website</b> | Multi-contributor campus website | React, Vite, Supabase, Playwright', body),
    bullet('Co-built and iterated the club website for 23+ societies, events, gallery, archive and recruitment; production deployment is not claimed as verified.'),
    Paragraph('github.com/kaustubhdua/JYC-Website2', detail),
    *section_heading('OPEN-SOURCE CONTRIBUTIONS'),
    Paragraph('<b>Lemma Platform | 6 merged upstream PRs</b> - PostgreSQL 18 and Podman compatibility (#1156, #1155); GitHub webhook event identity/idempotency (#1136); bundle sidecar path containment (#1128); Python SDK auth-refresh errors (#1125); JSONC diagnostics (#1124).', body),
    Paragraph('github.com/lemma-work/lemma-platform/pull/{1156,1155,1136,1128,1125,1124}', detail),
    *section_heading('SKILLS'),
    Paragraph('<b>Languages:</b> Python, TypeScript, JavaScript, C++17, Java, SQL | <b>Frontend:</b> React, Next.js, Vite, Tailwind CSS, Three.js/WebGL', body),
    Paragraph('<b>Backend &amp; Data:</b> FastAPI, PostgreSQL/PostGIS, Supabase, SQLAlchemy, OR-Tools, scikit-learn, PyTorch | <b>Engineering:</b> Git, GitHub Actions, pytest, Playwright, Docker, CodeQL', body),
    *section_heading('LEADERSHIP &amp; RECOGNITION'),
    bullet('<b>Nexus Spring of Code (NSoC)</b> | Campus Ambassador | 2026-Present; representing the open-source program at JIIT Noida.'),
    bullet('<b>JIIT Youth Club, Tech Vertical</b> | Member, Tech and Management team.'),
    bullet('<b>JPMorgan Chase &amp; Co.</b> | Software Engineering Job Simulation (Forage, 2026); Java, Spring Boot, Kafka and REST integration.'),
    bullet('<b>Harvard CS50</b> | Introduction to Databases with SQL; seven problem sets and final project.'),
    bullet('<b>ISRO Bharatiya Antariksh Hackathon 2026</b> | Participation with AkashChalak, a satellite-assisted air-quality prototype.'),
]
doc.build(story)
print('wrote', out)
