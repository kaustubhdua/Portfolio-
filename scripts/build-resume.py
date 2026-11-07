"""Build Kaustubh Dua's one-page, ATS-readable recruiter resume.

This is the source of truth for public/Kaustubh-Dua-Resume.pdf.
The resume distinguishes merged upstream contributions, team prototypes,
job simulations, hackathon participation and unverified deployments.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph
import sys

out = sys.argv[1] if len(sys.argv) > 1 else 'public/Kaustubh-Dua-Resume.pdf'
style = ParagraphStyle(
    'resume', fontName='Helvetica', fontSize=7.5, leading=9.2,
    textColor=HexColor('#17151c'),
)
content = """<font size="21"><b>Kaustubh Dua</b></font><br/>
<font color="#8c1d28" size="9"><b>Software Engineering Student | Full-Stack &amp; Applied AI | JIIT Noida | Class of 2029</b></font><br/>
kaustubhdua1991@gmail.com | github.com/kaustubhdua | linkedin.com/in/kaustubh-dua-2b5a76416 | kaustubhdua.vercel.app<br/><br/>
<font color="#8c1d28"><b>PROFILE</b></font><br/>
Electronics &amp; Computer Engineering undergraduate building full-stack software and applied AI/data tools. Seeking software engineering internships across backend, full-stack and applied AI; focused on usable interfaces, clear system boundaries and reliable testing.<br/><br/>
<font color="#8c1d28"><b>EDUCATION</b></font><br/>
<b>Jaypee Institute of Information Technology, Noida</b> | B.Tech. Electronics &amp; Computer Engineering (ECM) | Expected 2029<br/><br/>
<font color="#8c1d28"><b>SELECTED PROJECTS</b></font><br/>
<b>NIRDHOOM</b> | Multi-contributor prototype | React, Supabase, PostgreSQL/PostGIS, OR-Tools<br/>
- Contributed to a field-first workflow connecting farmer bookings, operator dispatch, evidence and residue-buyer pathways; hosted preview uses sample data.<br/>
github.com/kaustubhdua/nihdhoom<br/>
<b>Saathi</b> | Multi-contributor MVP | Next.js, FastAPI, Python<br/>
- Hindi/Hinglish assistant with deterministic intent routing, source provenance, consent prompts and human escalation; includes a 120-case synthetic benchmark.<br/>
github.com/kaustubhdua/Saathi<br/>
<b>PatchPilot</b> | Personal early-stage project | Python, FastAPI, pytest, Docker<br/>
- Analyses pull-request diffs as untrusted text and emits evidence-backed risk signals and test suggestions; never executes repository code.<br/>
github.com/kaustubhdua/PatchPilot<br/>
<b>JIIT Youth Club Website</b> | Multi-contributor campus website | React, Vite, Supabase, Playwright<br/>
- Co-built and iterated the club website for 23+ societies, events, gallery, archive and recruitment; production deployment is not claimed as verified.<br/>
github.com/kaustubhdua/JYC-Website2<br/><br/>
<font color="#8c1d28"><b>OPEN-SOURCE CONTRIBUTIONS</b></font><br/>
<b>Lemma Platform | 6 merged upstream PRs</b> - PostgreSQL 18 and Podman compatibility (#1156, #1155); GitHub webhook event identity/idempotency (#1136); bundle sidecar path containment (#1128); Python SDK auth-refresh errors (#1125); JSONC diagnostics (#1124).<br/>
github.com/lemma-work/lemma-platform/pulls<br/><br/>
<font color="#8c1d28"><b>SKILLS</b></font><br/>
<b>Languages:</b> Python, TypeScript, JavaScript, C++17, Java, SQL | <b>Frontend:</b> React, Next.js, Vite, Tailwind CSS, Three.js/WebGL<br/>
<b>Backend &amp; Data:</b> FastAPI, PostgreSQL/PostGIS, Supabase, SQLAlchemy, OR-Tools, scikit-learn, PyTorch | <b>Engineering:</b> Git, GitHub Actions, pytest, Playwright, Docker, CodeQL<br/><br/>
<font color="#8c1d28"><b>LEADERSHIP &amp; RECOGNITION</b></font><br/>
- <b>Nexus Spring of Code (NSoC)</b> | Campus Ambassador | 2026-Present; representing the open-source program at JIIT Noida.<br/>
- <b>JIIT Youth Club, Tech Vertical</b> | Member, Tech and Management team.<br/>
- <b>JPMorgan Chase &amp; Co.</b> | Software Engineering Job Simulation (Forage, 2026); Java, Spring Boot, Kafka and REST integration.<br/>
- <b>Harvard CS50</b> | Introduction to Databases with SQL; seven problem sets and final project.<br/>
- <b>ISRO Bharatiya Antariksh Hackathon 2026</b> | Participation with AkashChalak, a satellite-assisted air-quality prototype."""
doc = SimpleDocTemplate(
    out, pagesize=A4, leftMargin=14*mm, rightMargin=14*mm,
    topMargin=8*mm, bottomMargin=7*mm,
    title='Kaustubh Dua - Resume', author='Kaustubh Dua',
)
doc.build([Paragraph(content, style)])
print('wrote', out)
