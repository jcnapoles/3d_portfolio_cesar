"""Generator for public/Cesar_Napoles_CV.pdf (ReportLab platypus, A4, 5 pages).

Run from any cwd:  python scripts/cv/gen_cv.py [out.pdf]   (default: <repo>/public/Cesar_Napoles_CV.pdf)
Requires:          pip install -r scripts/cv/requirements.txt   (reportlab 4.5.1, Pillow); photo.png next to this file.

Edit the text in the CONTENT block; the layout code below it must keep the output visually identical:
base-14 fonts only (Helvetica family, nothing embedded), the black square SEP that ReportLab renders as
ZapfDingbats 'n' in dates and separators, and the keep-together rules in build_story() (no lone section
title, job header, Stack line or skill title at a page bottom). Unchanged content + PDF_DATE rebuilds the
committed PDF byte-for-byte.
"""
import sys
import time
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader, TimeStamp
from reportlab.pdfbase import pdfdoc
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import BaseDocTemplate, Flowable, Frame, KeepTogether, PageTemplate, Paragraph, Spacer

HERE = Path(__file__).resolve().parent
PHOTO_PATH = HERE / 'photo.png'                       # 400x400 RGBA, drawn in the header circle
DEFAULT_OUT = HERE.parent.parent / 'public' / 'Cesar_Napoles_CV.pdf'

SEP = '■'   # rendered as ZapfDingbats 'n' (black square)
BUL = '•'   # WinAnsi bullet

# ================================================================ CONTENT (edit here)
# Plain-text fields are escaped automatically. SUMMARY paragraphs and job bullets are ReportLab
# mini-HTML: <b>bold</b> is allowed and a literal ampersand must be written as &amp;.

TITLE, AUTHOR = 'Cesar Napoles — CV', 'Cesar Napoles'   # PDF metadata
# PDF /CreationDate and /ModDate as (unix time, UTC offset in hours); ReportLab also seeds the /ID from it.
# Fixed so unchanged content rebuilds byte-identically; None stamps the current local time.
PDF_DATE = (1792005359.3803434, 2)                     # 2026-10-14 21:15:59 +02:00

NAME = 'CESAR NAPOLES'
HEADLINE = 'CTO & Senior Technical Lead  |  Full Stack Engineer'
LINKS = [('linkedin.com/in/jcnapoles', 'https://www.linkedin.com/in/jcnapoles'),   # left column
         ('cesarnapoles.com', 'https://cesarnapoles.com')]                          # right column
LOCATION = 'Tarragona, Spain'                          # left column
AVAILABILITY = 'Available for remote & hybrid'         # right column
FOOTER = 'Cesar Napoles  ·  CV  ·  Page {page}'

SUMMARY = [
    'Technology leader and entrepreneur with <b>12+ years of experience</b> in software engineering, system architecture, '
    'and digital transformation across industries including <b>fintech, payments, insurance, aviation, e-commerce, and '
    'event ticketing</b>. Proven track record building scalable platforms from the ground up, leading cross-functional '
    'teams, and driving measurable business outcomes.',
    'Currently serving as <b>CTO &amp; Co-Founder of Closevibe</b>, an AI-powered conversational commerce platform, and as '
    '<b>Fractional CTO</b> of Cashela (cross-border B2B payments) and 1234ticket (event ticketing), while simultaneously '
    'holding a <b>Senior Technical Lead</b> position at CaixaBank Tech. Deep expertise in <b>microservices architecture, '
    'cloud infrastructure (AWS/GCP), AI/RAG systems, and full-stack development</b> across Java, Python, TypeScript, and '
    'React ecosystems.',
    'Passionate about leveraging emerging technologies, particularly <b>LLMs, conversational AI, and intelligent '
    'automation</b>, to solve complex business problems at scale.',
]

JOBS = [  # newest first
    dict(company='1234ticket · Remote, Spain', location='Remote | Spain', role='Fractional CTO / Technical Lead',
         dates=('Feb 2026', 'Present'), bullets=[
        'Leading the <b>technical roadmap</b> of an event-ticketing platform connecting event producers and buyers, from seat maps and pricing to on-site QR check-in.',
        'Audited the platform and turned the findings into a <b>prioritized engineering backlog</b>, a bilingual technical wiki and a load-test go/no-go gate.',
        'Moved card checkout to <b>PCI SAQ-A hosted payments</b> with server-side reconciliation of orphaned orders.',
        'Leading the <b>ticket-inventory partner integration</b>: catalog sync, signed webhooks, authorize-confirm-capture checkout and refunds behind feature flags.',
    ], stack='Node.js, Express, TypeScript, Prisma, PostgreSQL, Next.js, Expo, Terraform, AWS (ECS, ALB, ElastiCache, Lambda), GitHub Actions'),
    dict(company='Closevibe, S.L. · Tarragona, Spain', location='Bellvei, Tarragona | Spain | closevibe.com',
         role='CTO & Technical Co-Founder', dates=('Nov 2025', 'Present'), bullets=[
        'Co-founded and architected a <b>multi-tenant conversational AI platform</b> automating e-commerce sales and customer service across WhatsApp Business API, Messenger, and Email.',
        'Designed a <b>RAG-based agent system</b> with dynamic intent detection, semantic vector search (pgvector), and real-time conversation orchestration serving multiple concurrent clients.',
        'Built the entire technology stack end-to-end: <b>Python/FastAPI backend, React frontend, PostgreSQL with pgvector</b>, deployed on GCP and Railway with Docker containerization.',
        'Integrated Meta Business APIs (WhatsApp, Instagram, Messenger), <b>n8n workflow automation</b>, and third-party e-commerce platforms for seamless client onboarding.',
        'Led technical client engagements, delivered solution architecture proposals, and managed a <b>€35K+ services pipeline</b> for enterprise customers.',
        'Evaluated and optimized multi-model LLM costs across Anthropic Claude, OpenAI, Google Gemini, DeepSeek, and Mistral for Spanish-language use cases.',
    ], stack='Python, FastAPI, React, TypeScript, Node.js, PostgreSQL, pgvector, Docker, GCP, Railway, n8n, WhatsApp Business API, Meta APIs, RAG, LLMs, Langchain'),
    dict(company='Cashela · Remote, Spain', location='Remote | Spain', role='Fractional CTO',
         dates=('Jan 2025', 'Present'), bullets=[
        'Leading the <b>technical strategy and architecture</b> of a cross-border B2B payments platform: pay-ins, payouts, wallets, payment links and remittances.',
        "Audited the platform and built a <b>bilingual technical wiki</b> (architecture, ADRs, runbooks) as the engineering team's source of truth.",
        "Driving the core's <b>migration to a hexagonal architecture</b> behind feature flags, with a flag + test + documentation Definition of Done enforced in CI.",
        'Built <b>Payment Links end to end</b>: hosted Next.js checkout, merchant refunds and card, ACH and wire payment rails, ready for rollout behind feature flags.',
    ], stack='Laravel, PHP, MySQL (AWS RDS), Next.js, React Native (Expo), Playwright, pytest, Terraform, AWS (ECS/Fargate), GitHub Actions'),
    dict(company='CaixaBank Tech · Barcelona, Spain', location='Barcelona | Spain', role='Senior Technical Lead',
         dates=('Oct 2024', 'Present'), bullets=[
        "Leading the design and development of <b>responsive web interfaces</b> using React.js for one of Spain's largest financial institutions.",
        'Architecting and developing <b>Java/Spring Boot microservices</b> within a large-scale distributed event-driven system powered by Kafka.',
        'Collaborating with cross-functional squads (design, product, QA) to deliver <b>high-quality financial products</b> following strict compliance and security standards.',
        'Driving <b>code quality initiatives</b> through comprehensive testing strategies (JUnit, Jest, Cypress) and CI/CD pipeline optimization.',
        'Conducting <b>technical interviews</b> for Full Stack Developer candidates using structured evaluation frameworks.',
    ], stack='Java, Spring Boot, Spring Cloud, React, Kafka, Oracle, PostgreSQL, Jest, Cypress, Maven, Git'),
    dict(company='Sttok · Remote, Spain', location='Remote | Spain',
         role='Fractional CTO / External Tech Lead & Strategic Consultant', dates=('Nov 2024', 'Feb 2025'), bullets=[
        'Led <b>strategic technology decisions and architecture redesign</b> to support scaling from 50K to 250,000+ active users.',
        'Directed the <b>complete AWS migration</b>: infrastructure provisioning, CI/CD pipelines, Cognito-based authentication, and VPC networking.',
        'Delivered <b>production-ready cost analysis and TCO projections</b> using AWS pricing tools, reducing projected infrastructure spend by 30%.',
        'Consulted on <b>MongoDB Atlas performance tuning</b>: indexing strategies, ESR rule enforcement, and advanced Atlas Search optimization, cutting p95 query latency by 70%.',
        'Established <b>monitoring and alerting frameworks</b> in MongoDB Atlas for predictive diagnostics and SLA compliance.',
    ], stack='AWS (EC2, S3, Cognito, VPC, CloudWatch), MongoDB Atlas, CI/CD, Node.js'),
    dict(company='Flyr · Remote, Spain', location='Remote | Spain', role='Lead Engineer & Frontend Architect',
         dates=('Mar 2023', 'Sep 2025'), bullets=[
        'Led the <b>frontend architecture for white-label airline applications</b> deployed for FlyArystan, HKExpress, JSX, and PlusUltra.',
        'Defined a <b>modular, component-driven architecture</b> enabling rapid deployment of new airline brands with shared core libraries.',
        'Implemented <b>micro-frontend strategies</b> to decouple brand-specific UIs, enabling independent deployment cycles.',
        'Integrated with <b>airline reservation systems</b>, disruption management platforms, and multi-channel communication services.',
        'Achieved a <b>60% reduction in time-to-market</b> for onboarding new airline clients by streamlining development and deployment workflows.',
    ], stack='React, TypeScript, Micro-frontends, REST APIs, CI/CD, Git'),
    dict(company='FIATC Seguros · Barcelona, Spain', location='Barcelona | Spain',
         role='Fractional CTO / External Tech Lead & Strategic Consultant', dates=('Jan 2023', 'Oct 2024'), bullets=[
        "Acted as <b>fractional CTO</b> for internal digital transformation within one of Spain's established insurance companies.",
        'Led the <b>complete redesign and migration</b> of the internal intranet platform to Liferay, replacing a legacy CMS with a scalable solution and improving internal adoption by 45%.',
        'Directed <b>vendor evaluations, technical audits, and roadmap planning</b> for legacy system modernization.',
        'Mentored internal teams in <b>agile practices, CI/CD automation, and DevOps culture</b> implementation.',
        'Aligned strategic technology objectives directly with <b>C-level business stakeholders</b>.',
    ], stack='Liferay, Java, CI/CD, Docker, Agile/Scrum'),
    dict(company='Amaris Consulting · Barcelona, Spain', location='Barcelona | Spain',
         role='Full Stack Developer / Project Manager', dates=('May 2021', 'Oct 2024'), bullets=[
        'Delivered <b>end-to-end application development</b> and technical consulting for enterprise clients across diverse sectors.',
        'Led development, maintenance, and <b>migration of legacy systems</b> to modern Java, Spring, Angular, and React stacks.',
        'Managed <b>project planning, budgeting, and delivery</b> for cross-functional teams using Agile/Scrum methodologies.',
        'Designed and integrated <b>RESTful APIs</b> connecting internal systems with third-party services and data platforms.',
    ], stack='Java, Spring, Angular, React, Oracle, PostgreSQL, MySQL, HBase, AWS, Jest, Cypress, Jira'),
    dict(company='ISERN Patentes y Marcas · Barcelona, Spain', location='Barcelona | Spain', role='Software Engineer',
         dates=('Jul 2018', 'May 2021'), bullets=[
        'Designed and developed <b>IsernTools</b>, a comprehensive web-based management platform for the intellectual property sector.',
        'Built an <b>AI-powered document similarity detector</b> in collaboration with UPC (Polytechnic University of Catalonia).',
        'Automated <b>bulletin ingestion pipelines</b> for downloading, parsing, and loading official patent bulletins into the database.',
        'Developed a SOAP/REST client to consume <b>Spanish Patent Office (OEPM)</b> web services.',
        'Resolved <b>complex data-processing issues</b> across distributed systems, improving system uptime to 99.5%.',
    ], stack='Java EE, Spring Boot, Spring Security, JPA-Hibernate, jQuery, MySQL, Intersystems Caché, BIRT, SOAP/REST, Git'),
    dict(company='Indra · Montevideo, Uruguay', location='Montevideo | Uruguay', role='Full Stack Developer',
         dates=('Jul 2016', 'Jun 2018'), bullets=[
        'Developed the <b>InGRID MDM platform</b> for management and estimation of electrical measurements deployed nationally in Uruguay.',
        'Implemented <b>Big Data processing pipelines</b> using Hadoop/MapReduce/HBase on Cloudera for high-volume utility data.',
        'Built <b>REST APIs</b> for inventory data exchange with external client systems.',
        'Maintained code quality through automated testing and <b>process optimization</b> initiatives.',
    ], stack='Hadoop, MapReduce, HBase, Spring Boot, JPA-Hibernate, Oracle, PostgreSQL, JavaScript, BIRT'),
    dict(company='Universidad de las Ciencias Informáticas · Havana, Cuba', location='Havana | Cuba', role='QA Tester',
         dates=('Sep 2014', 'Jul 2016'), bullets=[
        'Designed and executed <b>functional test plans and test cases</b> for university-developed software projects.',
        'Implemented <b>automated testing frameworks</b> using Selenium and JMeter for regression and performance testing.',
    ], stack='Selenium, JMeter, JUnit, Linux, Redmine'),
    dict(company='Universidad de las Ciencias Informáticas · Havana, Cuba', location='Havana | Cuba',
         role='Software Developer', dates=('Sep 2012', 'Aug 2014'), bullets=[
        'Developed <b>component management tools</b> (services and dependencies) within the XAUCE business framework.',
        'Built web interfaces using <b>PHP, JavaScript, and ExtJS</b> for internal university platforms.',
    ], stack='PHP, JavaScript, HTML5, CSS3, ExtJS'),
]

EDUCATION = [  # (degree, school, (from, to))
    ('Computer Science Engineer | Informatics Engineering', 'Universidad de las Ciencias Informáticas, Havana, Cuba', ('2009', '2014')),
    ("Master's Degree in Big Data with Python", 'Escuela Superior de Informática CIPSA, Barcelona, Spain', ('2019', '2020')),
    ("Master's Degree in Java EE", 'Escuela Superior de Informática CIPSA, Barcelona, Spain', ('2018', '2019')),
    ('Cloud Administration (Azure, AWS, Google Cloud)', 'Amaris Consulting, Barcelona, Spain', ('2022', '2023')),
]

LANGUAGES = [('Spanish', 'Native'), ('English', 'B2 (Reading/Listening/Speaking/Writing)')]

SKILLS = [
    ('Languages & Core', ['Java', 'JavaScript', 'TypeScript', 'Python', 'PHP', 'HTML5', 'CSS3', 'SQL', 'Bash']),
    ('Backend Frameworks', ['Spring Boot', 'Spring Cloud', 'Spring Security', 'Spring MVC', 'FastAPI', 'JPA-Hibernate', 'Maven', 'Quartz']),
    ('Frontend Frameworks', ['React.js', 'Angular', 'Next.js', 'jQuery', 'Bootstrap', 'Tailwind CSS', 'Framer Motion', 'ExtJS']),
    ('AI / Machine Learning', ['RAG Architecture', 'LLM Integration', 'Langchain', 'pgvector', 'Prompt Engineering', 'Intent Detection', 'NLP', 'Semantic Search']),
    ('Databases', ['PostgreSQL', 'Oracle', 'MySQL', 'MongoDB Atlas', 'HBase', 'Intersystems Caché', 'Redis']),
    ('Cloud & DevOps', ['AWS (EC2, S3, Cognito, VPC)', 'GCP', 'Azure', 'Docker', 'Railway', 'Heroku', 'Jenkins', 'GitHub Actions', 'CI/CD']),
    ('Messaging & Integration', ['Apache Kafka', 'WhatsApp Business API', 'Meta APIs', 'n8n', 'REST', 'SOAP', 'GraphQL']),
    ('Testing & QA', ['JUnit', 'Jest', 'Cypress', 'Selenium', 'JMeter', 'Postman', 'SoapUI', 'cURL']),
    ('Tools & Management', ['Git', 'SVN', 'Jira', 'Redmine', 'Trello', 'IntelliJ IDEA', 'VS Code', 'DBeaver', 'Figma']),
    ('Methodologies', ['Scrum', 'Agile', 'Micro-frontends', 'Microservices', 'Event-Driven Architecture', 'Domain-Driven Design', 'TDD']),
]

STRENGTHS = [
    ('Technical Leadership', 'Experienced leading distributed teams, mentoring developers, and making strategic architecture decisions across startup and enterprise environments.'),
    ('Entrepreneurship', 'Built a product from zero to market as CTO & co-founder, managing everything from architecture design to client acquisition and delivery.'),
    ('System Architecture', 'Deep expertise designing scalable, multi-tenant platforms with microservices, event-driven systems, and AI-powered automation.'),
    ('Cross-Functional Collaboration', 'Proven ability to bridge technical and business stakeholders, translating complex requirements into actionable engineering roadmaps.'),
    ('Continuous Learning', 'Actively exploring cutting-edge AI technologies, options trading algorithms, and cloud-native patterns to stay ahead of industry trends.'),
]

PROJECTS = [
    ('Closevibe AI Platform', 'Designed and built a production multi-tenant conversational AI SaaS from scratch, handling automated sales conversations across WhatsApp and Messenger for e-commerce brands. Implemented FSM-based conversation flows, RAG with pgvector, and multi-model LLM orchestration.'),
    ('White-Label Airline Platform (Flyr)', 'Architected a modular micro-frontend system that reduced airline onboarding time by 60%, deployed across 4+ international carriers with brand-specific UIs sharing a unified codebase.'),
    ('Similar Files Detector (ISERN + UPC)', 'Developed an AI-powered document similarity engine in collaboration with the Polytechnic University of Catalonia for intellectual property analysis in the patent industry.'),
    ('InGRID MDM (Indra)', "Built a national-scale energy metering data management platform for Uruguay's utility infrastructure, processing high-volume electrical measurement data using Hadoop/MapReduce/HBase."),
    ('Options Trading SaaS', 'Personal project: designed and developed a full-stack options trading dashboard with Black-Scholes pricing, backtesting engine, FSM state management, and Interactive Brokers API integration.'),
]

INTERESTS = ['Conversational AI & LLM applications', 'Cloud-native architecture', 'Quantitative finance & algorithmic trading',
             'Open-source development', 'Startup building & product strategy', 'Big Data engineering',
             'Technical mentoring & team leadership']

# ================================================================ LAYOUT
PW, PH = A4
NAVY = HexColor('#1b2a4a'); NAVY2 = HexColor('#243b6a'); GOLD = HexColor('#e8b931')
ACCENT = HexColor('#3d7ec7'); ROLE = HexColor('#2d4a7a'); TEXT = HexColor('#2c2c3a')
BODY = HexColor('#4a4a5c'); MUTED = HexColor('#6b6b7e'); HEADMUTED = HexColor('#a0b4d0')
RULE = HexColor('#d8dae5'); CHIP = HexColor('#f5f6fa')
BOTTOM = 12*mm   # bottom margin; changing it reflows every page


class FixedTimeStamp(TimeStamp):
    """ReportLab build timestamp pinned to PDF_DATE (installed over pdfdoc.TimeStamp in main())."""
    def __init__(self, invariant=None):
        t, hours = PDF_DATE
        self.t, self.dhh, self.dmm, self.tzname = t, hours, 0, f'UTC{hours:+03d}:00'
        self.lt = time.gmtime(t + hours * 3600)
        self.YMDhms = tuple(self.lt)[:6]


# ---------------------------------------------------------------- page decorations
def footer(c, doc):
    c.setFillColor(MUTED)
    c.setFont('Helvetica', 7)
    c.drawRightString(PW - 18*mm, 8*mm, FOOTER.format(page=doc.page))

def first_page(c, doc):
    c.saveState()
    c.setFillColor(NAVY); c.rect(0, PH - 52*mm, PW, 52*mm, fill=1, stroke=0)
    c.setFillColor(NAVY2); c.rect(0, PH - 52*mm, PW, 2*mm, fill=1, stroke=0)
    c.setFillColor(GOLD); c.rect(0, PH - 52*mm - 1, PW, 1.5, fill=1, stroke=0)
    c.setFillColor(white); c.circle(37*mm, PH - 26*mm, 18.2*mm, fill=1, stroke=0)
    c.drawImage(ImageReader(str(PHOTO_PATH)), 20*mm, PH - 43*mm, 34*mm, 34*mm, mask='auto')
    x1, x2 = 62*mm, 114*mm
    c.setFillColor(white); c.setFont('Helvetica-Bold', 24)
    c.drawString(x1, PH - 18*mm, NAME)
    c.setFillColor(GOLD); c.setFont('Helvetica', 11)
    c.drawString(x1, PH - 25*mm, HEADLINE)
    c.setFillColor(HEADMUTED); c.setFont('Helvetica', 8)
    y = PH - 33*mm
    for i, (x, (label, url)) in enumerate(zip((x1, x2), LINKS)):
        c.drawString(x, y, label)
        w = stringWidth(label, 'Helvetica', 8)
        if i == 0:   # set once, after the first label (keeps the content stream unchanged)
            c.setStrokeColor(HEADMUTED); c.setLineWidth(.3)
        c.line(x, y - .5, x + w, y - .5)
        c.linkURL(url, (x, y - 1, x + w, y + 8), relative=0, thickness=0)
    c.drawString(x1, PH - 38*mm, LOCATION)
    c.drawString(x2, PH - 38*mm, AVAILABILITY)
    footer(c, doc)
    c.restoreState()

def later_pages(c, doc):
    c.saveState()
    c.setFillColor(NAVY); c.rect(0, PH - 3*mm, PW, 3*mm, fill=1, stroke=0)
    c.setFillColor(GOLD); c.rect(0, PH - 3*mm - .8, PW, .8, fill=1, stroke=0)
    footer(c, doc)
    c.restoreState()

# ---------------------------------------------------------------- flowables
class TopCollapsingSpacer(Spacer):
    """Vertical gap that collapses when it would start a new frame/page."""
    def wrap(self, aW, aH):
        f = getattr(self, '_frame', None)
        if f is not None and f._atTop:
            return (self.width, 0)
        return (self.width, self.height)

def gap(h):
    return TopCollapsingSpacer(1, h)

class SectionTitle(Flowable):
    def __init__(self, text):
        Flowable.__init__(self)
        self.text = text
        self.width = PW - 36*mm
        self.height = 7*mm
        self.spaceBefore = 1*mm
    def wrap(self, aW, aH):
        return self.width, self.height
    def draw(self):
        c = self.canv
        c.setFillColor(ACCENT); c.rect(0, 0, 3*mm, 7*mm, fill=1, stroke=0)
        c.setFillColor(NAVY); c.setFont('Helvetica-Bold', 11)
        c.drawString(5.5*mm, 2*mm, self.text)
        c.setStrokeColor(RULE); c.setLineWidth(.4)
        c.line(5.5*mm, 0, self.width, 0)

class Chips(Flowable):
    FONT, SIZE, PAD, GAP, ROWH = 'Helvetica', 7.5, 3*mm, 2*mm, 7.7*mm
    def __init__(self, items):
        Flowable.__init__(self)
        self.items = items
    def wrap(self, aW, aH):
        rows, row, x = [], [], 0
        for t in self.items:
            w = stringWidth(t, self.FONT, self.SIZE) + 2*self.PAD
            if row and x + w > aW:
                rows.append(row); row, x = [], 0
            row.append((x, w, t)); x += w + self.GAP
        if row: rows.append(row)
        self.rows = rows
        self.width, self.height = aW, len(rows)*self.ROWH
        return self.width, self.height
    def draw(self):
        c = self.canv
        n = len(self.rows)
        for i, row in enumerate(self.rows):
            y = (n - 1 - i)*self.ROWH
            for x, w, t in row:
                c.setFillColor(CHIP)
                c.roundRect(x, y + 2.2*mm, w, 5.5*mm, 2*mm, stroke=0, fill=1)
                c.setFillColor(TEXT); c.setFont(self.FONT, self.SIZE)
                c.drawString(x + self.PAD, y + 3.7*mm, t)

# ---------------------------------------------------------------- styles
S_SUMMARY = ParagraphStyle('summary', fontName='Helvetica', fontSize=9, leading=13.5, textColor=BODY, alignment=TA_JUSTIFY)
S_COMPANY = ParagraphStyle('company', fontName='Helvetica-Bold', fontSize=10, leading=13, textColor=NAVY)
S_LOC = ParagraphStyle('loc', fontName='Helvetica', fontSize=8, leading=10.5, textColor=MUTED)
S_ROLE = ParagraphStyle('role', fontName='Helvetica-Bold', fontSize=9.5, leading=12.5, textColor=ROLE, spaceBefore=.5*mm)
S_DATE = ParagraphStyle('date', fontName='Helvetica-Oblique', fontSize=8, leading=10, textColor=ACCENT)
S_BULLET = ParagraphStyle('bullet', fontName='Helvetica', fontSize=8.5, leading=12, textColor=TEXT, alignment=TA_JUSTIFY,
                          leftIndent=8*mm, firstLineIndent=-4*mm, spaceBefore=.3*mm)
S_STACK = ParagraphStyle('stack', fontName='Helvetica-Oblique', fontSize=7.5, leading=10, textColor=MUTED, spaceBefore=1*mm)
S_DEGREE = ParagraphStyle('degree', fontName='Helvetica-Bold', fontSize=9, leading=12, textColor=TEXT)
S_LANG = ParagraphStyle('lang', fontName='Helvetica', fontSize=9, leading=12.5, textColor=TEXT)
S_SKILLCAT = ParagraphStyle('skillcat', fontName='Helvetica-Bold', fontSize=8.5, leading=11, textColor=NAVY, spaceBefore=2*mm)
S_HL = ParagraphStyle('highlight', fontName='Helvetica', fontSize=8.5, leading=12.5, textColor=TEXT, alignment=TA_JUSTIFY,
                      leftIndent=6*mm, firstLineIndent=-4*mm, spaceBefore=.5*mm)
S_INTERESTS = ParagraphStyle('interests', fontName='Helvetica', fontSize=8.5, leading=12.5, textColor=BODY, alignment=TA_JUSTIFY)

def esc(s):
    return s.replace('&', '&amp;')

def span(from_to):
    return f'{from_to[0]} {SEP} {from_to[1]}'

def bullet(text):
    return Paragraph(f'<font color="#3d7ec7">{BUL}</font>&nbsp;&nbsp;' + text, S_BULLET)

def highlight(title, text):
    return Paragraph(f'<font color="#3d7ec7">{BUL}</font>&nbsp;&nbsp;<b>{esc(title)}</b> '
                     f'<font color="#e8b931">{SEP}</font> {esc(text)}', S_HL)

# ---------------------------------------------------------------- story
def build_story():
    """Flowables in "groups"; every multi-flowable group is a KeepTogether (draws the same when it fits,
    moves to the next page whole when it does not). Groups:
      section title + 2mm gap + first block of the section   (no lone section title)
      job header (company..dates) + first bullet               (no lone job header)
      last bullet + Stack line                                 (no orphaned Stack line)
      skill category title + chips                             (no lone category title)"""
    groups, pending = [], []
    def add(*fl):
        nonlocal pending
        groups.append(pending + list(fl)); pending = []
    def section(title):
        nonlocal pending
        pending = [SectionTitle(title), gap(2*mm)]

    section('PROFESSIONAL SUMMARY')
    for p in SUMMARY:
        add(Paragraph(p, S_SUMMARY)); add(gap(1.5*mm))
    add(gap(2*mm))
    section('PROFESSIONAL EXPERIENCE')
    for job in JOBS:
        B = [bullet(b) for b in job['bullets']]
        S = Paragraph('<b>Stack:</b> ' + esc(job['stack']), S_STACK)
        head = [Paragraph(esc(job['company']), S_COMPANY), Paragraph(esc(job['location']), S_LOC),
                Paragraph(esc(job['role']), S_ROLE), Paragraph(esc(span(job['dates'])), S_DATE), gap(.8*mm)]
        if len(B) == 1:
            add(*head, B[0], S)
        else:
            add(*head, B[0])
            for b in B[1:-1]:
                add(b)
            add(B[-1], S)
        add(gap(4*mm))
    section('EDUCATION & TRAINING')
    for degree, school, years in EDUCATION:
        add(Paragraph(esc(degree), S_DEGREE), Paragraph(esc(f'{school} | {span(years)}'), S_LOC)); add(gap(2*mm))
    section('LANGUAGES')
    sq = f'<font color="#3d7ec7">{SEP}</font>'
    add(Paragraph(' &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;'.join(
        f'<b>{esc(lang)}</b> {sq} {esc(level)}' for lang, level in LANGUAGES), S_LANG)); add(gap(2*mm))
    section('TECHNICAL SKILLS')
    for cat, items in SKILLS:
        add(Paragraph(esc(cat), S_SKILLCAT), gap(.8*mm), Chips(items)); add(gap(.5*mm))
    add(gap(2*mm))
    section('KEY STRENGTHS')
    for t, d in STRENGTHS:
        add(highlight(t, d))
    add(gap(2*mm))
    section('NOTABLE PROJECTS')
    for t, d in PROJECTS:
        add(highlight(t, d))
    add(gap(2*mm))
    section('PROFESSIONAL INTERESTS')
    add(Paragraph(esc(f' {BUL} '.join(INTERESTS)), S_INTERESTS))

    story = []
    for g in groups:
        if len(g) > 1:
            story.append(KeepTogether(g))
        else:
            story.extend(g)
    return story

# ---------------------------------------------------------------- document
def main():
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_OUT
    if PDF_DATE:
        pdfdoc.TimeStamp = FixedTimeStamp
    doc = BaseDocTemplate(str(out), pagesize=A4, leftMargin=18*mm, rightMargin=18*mm,
                          topMargin=6*mm, bottomMargin=BOTTOM, title=TITLE, author=AUTHOR)
    fw = PW - 36*mm
    doc.addPageTemplates([
        PageTemplate('first', [Frame(18*mm, BOTTOM, fw, PH - 57*mm - BOTTOM, id='f1')], onPage=first_page, autoNextPageTemplate='later'),
        PageTemplate('later', [Frame(18*mm, BOTTOM, fw, PH - 6*mm - BOTTOM, id='f2')], onPage=later_pages),
    ])
    doc.build(build_story())
    print(f'wrote {out} ({out.stat().st_size:,} bytes)')

if __name__ == '__main__':
    main()
