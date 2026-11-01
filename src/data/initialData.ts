import { JobApplication, StandingRule, UserProfile, VibePlan } from '../types/job';

export const INITIAL_PROFILE: UserProfile = {
  fullName: 'KETAN KAUSHIKBHAI BHOI',
  email: 'kkbhoi09@gmail.com',
  headline: 'B.Tech Information Technology | MERN Stack Developer | AI & LLM Evaluation',
  currentRole: 'MERN Stack Web Developer',
  yearsOfExp: 1,
  skills: [
    'HTML',
    'CSS',
    'JavaScript',
    'Node.js',
    'React.js',
    'Tailwind CSS',
    'RESTful APIs',
    'Python',
    'Java',
    'SQL',
    'MongoDB',
    'Express.js',
    'Prompt Engineering',
    'LLM Output Review & Quality Assessment',
    'Test Case Design for AI Responses',
    'Bias & Consistency Checking',
    'Structured Feedback / Annotation',
    'Comparative Model Testing',
    'Git',
    'Linux Shell Scripting',
    'Google Cloud Fundamentals'
  ],
  experienceSnippets: [
    'Developed MetroMart, a multivendor e-commerce website, using the MERN stack (MongoDB, Express.js, React.js, Node.js) with vendor and customer-facing modules.',
    'Built product listings, cart, and order management features for multiple vendors with RESTful API integration.',
    'Supported web development staff at Jinarth Infotech in daily development tasks, reducing workload and organizing spreadsheets and code reports.',
    'Designed test cases for AI/LLM evaluation, prompt engineering, output quality assessment, and bias/consistency checking.',
    'Engineered object-oriented applications in Java, Python, and SQL with automated Linux shell scripting and Git workflows.',
    'Pursuing B.Tech in IT at Madhuben And Bhanubhai Patel Institute of Technology, CVM University (CGPA: 7.58, SGPA: 8.00).'
  ],
  targetLocations: ['Vasad, Anand, Gujarat', 'Remote', 'Ahmedabad', 'Bengaluru', 'Hybrid'],
  targetSalary: '₹6 - ₹12 LPA / $35,000 - $65,000'
};

export const INITIAL_RULES: StandingRule[] = [
  {
    id: 'rule-1',
    title: 'Zero AI Slop & Banned Clichés',
    category: 'tone',
    instruction: "Never use cliché filler words: 'spearheaded', 'synergy', 'passionate self-starter', 'dynamic', 'orchestrated', or 'proven track record'. Write in sharp, crisp human prose.",
    enabled: true,
    timesEnforced: 24,
    description: 'Forces natural voice instead of robotic buzzword generation.'
  },
  {
    id: 'rule-2',
    title: 'Quantified Impact Framework (XYZ)',
    category: 'integrity',
    instruction: "Every resume bullet point must follow Google's XYZ formula: Accomplished [X], as measured by [Y], by doing [Z]. If an exact metric is unknown, use bracketed placeholders like [increased throughput by X%] so I can verify.",
    enabled: true,
    timesEnforced: 19,
    description: 'Ensures every claim is backed by measurable metrics and never fabricates numbers.'
  },
  {
    id: 'rule-3',
    title: 'Outreach Brevity Cap (<150 words)',
    category: 'brevity',
    instruction: 'Keep cold recruiter and hiring manager messages under 150 words with a direct 1-sentence hook and a single low-friction call to action.',
    enabled: true,
    timesEnforced: 15,
    description: 'Hiring managers delete long essays; short emails get 3x higher reply rates.'
  },
  {
    id: 'rule-4',
    title: 'Red Flag Scanner',
    category: 'custom',
    instruction: "Explicitly flag: unlisted compensation, mentions of 'fast-paced family culture' without work-life balance cues, or excessive interview steps (>5 rounds).",
    enabled: true,
    timesEnforced: 11,
    description: 'Protects applicant from toxic job descriptions and endless interview loops.'
  },
  {
    id: 'rule-5',
    title: 'Follow-Up Inactivity Alert',
    category: 'cadence',
    instruction: 'Automatically set a follow-up reminder 6 business days after submitting an application if no recruiter reply has been logged.',
    enabled: true,
    timesEnforced: 8,
    description: 'Ensures no high-priority lead falls through the cracks.'
  }
];

export const INITIAL_PLAN: VibePlan = {
  taskName: 'Repetitive Job Hunting & Application Customization',
  problem:
    'Every job application requires reading dense 800-word job postings, extracting keywords, manually rewriting resume bullets to match job specs, drafting personalized cold emails, prepping company-specific interview answers, and remembering when to follow up. Doing this 30+ times is exhausting, repetitive, and error-prone.',
  inputs:
    '1. Raw Job Postings (copy-pasted text or URL)\n2. Base Candidate Profile (skills, past bullet points, target salary)\n3. Custom Standing Rules (banned buzzwords, length limits, metrics formats)',
  process:
    '1. Parse JD for core tech stack, hidden requirements, salary, and red flags.\n2. Run Gap Analysis vs candidate background.\n3. Synthesize ATS-aligned resume bullets enforcing XYZ format and standing rules.\n4. Draft high-converting, sub-150-word outreach emails.\n5. Generate tailored STAR interview questions + situational answers.\n6. Pipeline auto-tracks status, deadlines, and follow-up reminders.',
  output:
    'Structured application card in Kanban board with instant match score, 4 tailored resume bullets with copy button, cold email draft, 5 STAR interview flashcards, and automated follow-up cadence.',
  goal:
    'Eliminate 85% of manual job search busywork, apply with higher quality tailored materials, and ensure zero opportunities fall through the cracks.',
  standingRulesCount: 5
};

export const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: 'app-haronex-1',
    company: 'Haronex Technology',
    role: 'MERN Stack Web Developer',
    location: 'Anand, Gujarat / Hybrid',
    salary: '₹7,20,000 / year',
    status: 'offer',
    priority: 'high',
    appliedDate: '2026-09-15',
    followUpDate: '2026-10-05',
    interviewDate: '2026-09-28T11:00',
    jobUrl: 'https://haronex.com/careers/mern-developer',
    jobDescription: `About Haronex Technology:
We build scalable web and e-commerce solutions for retail and multi-vendor networks across India.

Responsibilities:
- Build and maintain MetroMart, our multi-vendor e-commerce platform using MongoDB, Express.js, React.js, and Node.js.
- Develop vendor and customer-facing modules including product listings, cart, and multi-vendor order management.
- Implement robust RESTful APIs and integrate frontend React components with backend Node/Express services.
- Optimize database queries in MongoDB and enforce clean, type-safe API communication.

Requirements:
- Hands-on experience with the MERN stack (MongoDB, Express, React, Node.js).
- Strong command of HTML, CSS, JavaScript, and Tailwind CSS.
- Familiarity with RESTful API design, Git version control, and Linux shell commands.`,
    fitScore: 96,
    fitRationale:
      'Exact match: Built MetroMart multi-vendor platform with MERN stack, implemented RESTful APIs, cart & order management, and multi-vendor schemas.',
    parsedDetails: {
      title: 'MERN Stack Web Developer',
      company: 'Haronex Technology',
      location: 'Anand, Gujarat / Hybrid',
      salaryRange: '₹7,20,000 / year',
      employmentType: 'Full-time',
      experienceLevel: 'Entry / Junior Level',
      summary:
        'Develop and scale MetroMart multivendor e-commerce platform using MongoDB, Express.js, React.js, and Node.js with RESTful APIs.',
      coreSkills: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'RESTful APIs', 'JavaScript'],
      niceToHaveSkills: ['Tailwind CSS', 'Git', 'Linux Shell Scripting', 'E-commerce Architecture'],
      keyResponsibilities: [
        'Develop multi-vendor product listings, cart, and order workflows in MERN stack.',
        'Build and document RESTful endpoints for customer and vendor dashboards.',
        'Optimize MongoDB data models and ensure smooth UI integration with React.'
      ],
      redFlags: [],
      culturePerks: ['Mentorship from senior architects', 'Flexible hybrid schedule', 'Rapid career growth'],
      enforcedRules: ['Verified salary range', 'Matched real project experience from resume']
    },
    tailoredBullets: [
      {
        text: 'Developed MetroMart, a multivendor e-commerce web platform, utilizing MongoDB, Express.js, React.js, and Node.js with responsive vendor dashboards and dynamic inventory synchronization.',
        targetKeyword: 'MERN Stack, React.js, Node.js, MongoDB',
        impactType: 'Full-Stack Product Architecture',
        rulesFollowed: ['Enforced XYZ formula', 'Zero AI clichés', 'Strict resume truth alignment']
      },
      {
        text: 'Built vendor and customer-facing modules including real-time product search, multi-item shopping carts, and order fulfillment tracking, reducing checkout drop-off rates.',
        targetKeyword: 'E-commerce Modules, Cart & Order Management',
        impactType: 'User Experience & Conversion',
        rulesFollowed: ['Action + Context + Result', 'Specific to Haronex MetroMart project']
      },
      {
        text: 'Implemented RESTful APIs and connected React frontend interfaces with Node/Express backends, ensuring seamless asynchronous state updates and error handling.',
        targetKeyword: 'RESTful APIs, Component Integration',
        impactType: 'API Integration & Reliability',
        rulesFollowed: ['Active decisive verb', 'Technical verification']
      }
    ],
    outreachDraft: {
      type: 'hiring_manager',
      subject: 'Application for MERN Stack Web Developer — Ketan Kaushikbhai Bhoi',
      body: `Dear Hiring Team,\n\nI recently completed the development of MetroMart, a multi-vendor e-commerce platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js), featuring complete vendor catalogs, shopping carts, and order workflows.\n\nAs a final-year B.Tech Information Technology student at MBIT (CVM University, CGPA: 7.58), I have focused on building clean RESTful APIs and responsive React user interfaces.\n\nI would welcome the opportunity to discuss how my hands-on MERN stack experience can contribute to Haronex Technology's engineering roadmap.\n\nThank you for your time,\nKetan Kaushikbhai Bhoi\n+91 90541 46405 | kkbhoi09@gmail.com`,
      wordCount: 98,
      keyAngle: 'Highlights direct MetroMart project experience and MERN skills.',
      enforcedRules: ['Under 150 words (98 words)', 'Real contact info from resume', 'Direct CTA']
    },
    interviewPrep: {
      questions: [
        {
          id: 'q1',
          question: 'How did you design the schema in MongoDB for MetroMart to support multiple vendors selling products with independent inventories?',
          category: 'Database Design',
          interviewerIntent: 'Evaluating MongoDB modeling, referencing vs embedding, and vendor isolation.',
          starGuide: {
            situation: 'MetroMart needed distinct product catalogs and order fulfillments for multiple independent vendors.',
            task: 'Design a clean schema that allows vendor-specific product updates without cross-vendor data interference.',
            action: 'Created vendor reference IDs on product documents and structured sub-documents for line items in orders.',
            result: 'Enabled smooth multi-vendor order routing with fast indexed queries by vendor ID.'
          },
          pitfallsToAvoid: 'Embedding unbounded arrays inside a single document.'
        },
        {
          id: 'q2',
          question: 'How did you handle state management and API communication between React and Express in MetroMart?',
          category: 'Full-Stack Integration',
          interviewerIntent: 'Testing understanding of async hooks, axios/fetch error handling, and component lifecycle.',
          starGuide: {
            situation: 'Cart updates needed instant reflection in the UI without full page refreshes.',
            task: 'Synchronize cart state with the backend while keeping the user experience snappy.',
            action: 'Implemented React state hooks with debounced RESTful API updates and optimistic badge count increments.',
            result: 'Sub-100ms UI feedback for cart operations.'
          },
          pitfallsToAvoid: 'Forgetting to handle network error rollback states.'
        }
      ],
      proTip: 'Emphasize your hands-on work with MetroMart and explain the real challenges you solved during development.'
    },
    contacts: [
      {
        id: 'c1',
        name: 'Technical Hiring Manager',
        title: 'Lead Architect',
        emailOrLinkedIn: 'hr@haronex.com'
      }
    ],
    notes: 'Offer letter under review. Base compensation ₹7.2 LPA. Excellent alignment with MERN stack skill set.',
    tags: ['MERN Stack', 'React', 'Node.js', 'Top Priority'],
    createdAt: '2026-09-15T10:00:00.000Z',
    updatedAt: '2026-09-30T14:30:00.000Z',
    activityTimeline: [
      { id: 'act-hx-1', type: 'created', date: '2026-09-15', description: 'Opportunity analyzed with Standing Rules' },
      { id: 'act-hx-2', type: 'applied', date: '2026-09-15', description: 'Applied via company careers portal' },
      { id: 'act-hx-3', type: 'interview', date: '2026-09-23', description: 'MERN stack technical interview with Lead Architect' },
      { id: 'act-hx-4', type: 'status_change', date: '2026-09-30', description: 'Received official offer letter (₹7.2 LPA)' }
    ]
  },
  {
    id: 'app-outlier-2',
    company: 'Outlier AI',
    role: 'AI / LLM Evaluation Specialist & Prompt Engineer',
    location: 'Remote (India / Global)',
    salary: '$25 - $35 / hour (~₹20 LPA)',
    status: 'interviewing',
    priority: 'high',
    appliedDate: '2026-09-20',
    followUpDate: '2026-10-04',
    interviewDate: '2026-10-04T15:00',
    jobUrl: 'https://outlier.ai/careers/llm-evaluator',
    jobDescription: `About Outlier AI:
We partner with leading frontier AI research labs to evaluate, stress-test, and align state-of-the-art Large Language Models.

Role & Responsibilities:
- Design structured test cases and adversarial prompts to evaluate LLM reasoning, code correctness, and factual consistency.
- Review and score model outputs across technical programming benchmarks (Python, Java, SQL, JavaScript).
- Identify hallucinations, bias, and instruction-following failures; provide structured annotations and comparative feedback.
- Synthesize prompt variations to measure model robustness and consistency across multiple inference runs.

Requirements:
- Background in Computer Science or Information Technology (B.Tech student / graduate).
- Strong foundation in programming (Python, Java, or SQL) and software debugging.
- High attention to detail, analytical mindset, and active interest in AI/LLM safety and output quality.`,
    fitScore: 94,
    fitRationale:
      'Direct match for resume focus: developing focus in AI/LLM evaluation, prompt engineering, structured testing, bias checking, and test case design.',
    parsedDetails: {
      title: 'AI / LLM Evaluation Specialist & Prompt Engineer',
      company: 'Outlier AI',
      location: 'Remote (India / Global)',
      salaryRange: '$25 - $35 / hour (~₹20 LPA)',
      employmentType: 'Contract / Flexible',
      experienceLevel: 'Entry - Mid Level',
      summary:
        'Evaluate and benchmark frontier LLM code and reasoning quality using test case design, prompt engineering, and comparative output annotation.',
      coreSkills: ['Prompt Engineering', 'LLM Output Review', 'Test Case Design', 'Bias & Consistency Checking', 'Python'],
      niceToHaveSkills: ['Java', 'SQL', 'Comparative Model Testing', 'Structured Annotation'],
      keyResponsibilities: [
        'Design rigorous test prompts to probe frontier AI models for reasoning flaws and code bugs.',
        'Review and grade model responses against strict correctness and safety rubrics.',
        'Deliver structured feedback on model output quality and consistency.'
      ],
      redFlags: [],
      culturePerks: ['100% remote flexibility', 'Work with frontier AI labs', 'Competitive hourly USD compensation'],
      enforcedRules: ['Verified remote eligibility', 'Highlighted AI evaluation skills from resume']
    },
    tailoredBullets: [
      {
        text: 'Designed adversarial test cases and structured evaluation rubrics for frontier AI/LLM models, identifying output inconsistencies, hallucinations, and edge-case code bugs across Python and Java benchmarks.',
        targetKeyword: 'AI / LLM Evaluation, Test Case Design, Prompt Engineering',
        impactType: 'Model Quality & Evaluation Accuracy',
        rulesFollowed: ['XYZ framework', 'Aligned with resume AI skills', 'Zero clichés']
      },
      {
        text: 'Conducted comparative model testing and systematic bias checking across multi-turn prompt interactions, providing granular structured annotations that improved model instruction alignment.',
        targetKeyword: 'Comparative Model Testing, Bias & Consistency Checking',
        impactType: 'Output Reliability & Alignment',
        rulesFollowed: ['Clear active phrasing', 'Truth-grounded from resume']
      }
    ],
    outreachDraft: {
      type: 'recruiter',
      subject: 'AI Evaluation & Prompt Engineering Specialist — Ketan Kaushikbhai Bhoi',
      body: `Hello Outlier AI Talent Team,\n\nI recently applied for the AI/LLM Evaluation Specialist role.\n\nWith my B.Tech Information Technology background and focused work in prompt engineering, test case design, and model output quality assessment across Python, Java, and web stacks, I am passionate about benchmarking LLM correctness and safety.\n\nI have reviewed your evaluation criteria and look forward to completing the technical screening assessment.\n\nBest regards,\nKetan Kaushikbhai Bhoi\n+91 90541 46405 | kkbhoi09@gmail.com`,
      wordCount: 82,
      keyAngle: 'Focuses on structured test case design and programming fundamentals.',
      enforcedRules: ['Under 150 words (82 words)', 'Real resume credentials', 'Polite call to action']
    },
    interviewPrep: {
      questions: [
        {
          id: 'q1',
          question: 'How do you design a test prompt to evaluate whether an LLM understands edge cases in Python data structures versus just hallucinating plausible code?',
          category: 'Prompt Engineering & Testing',
          interviewerIntent: 'Testing understanding of boundary conditions, time complexity, and prompt variations.',
          starGuide: {
            situation: 'Evaluating code generation models on dictionary mutations during iteration.',
            task: 'Design a prompt that specifically triggers common subtle runtime exceptions.',
            action: 'Crafted input with concurrent list modifications and required the model to explain step-by-step memory references.',
            result: 'Accurately classified models that caught the race condition versus those generating hallucinated code.'
          },
          pitfallsToAvoid: 'Using generic coding prompts found in public training data.'
        }
      ],
      proTip: 'Highlight your analytical and detail-oriented mindset from your resume when discussing error detection.'
    },
    contacts: [],
    notes: 'Technical assessment passed. Live panel interview scheduled for Friday at 3:00 PM IST.',
    tags: ['AI / LLM', 'Prompt Engineering', 'Remote USD'],
    createdAt: '2026-09-20T08:00:00.000Z',
    updatedAt: '2026-09-28T16:00:00.000Z',
    activityTimeline: [
      { id: 'act-ot-1', type: 'created', date: '2026-09-20', description: 'Opportunity imported from remote job board' },
      { id: 'act-ot-2', type: 'applied', date: '2026-09-20', description: 'Submitted AI evaluation questionnaire' },
      { id: 'act-ot-3', type: 'status_change', date: '2026-09-28', description: 'Technical assessment passed (Score 94%)' },
      { id: 'act-ot-4', type: 'interview', date: '2026-10-04', description: 'Live panel interview on LLM benchmark testing' }
    ]
  },
  {
    id: 'app-tcs-3',
    company: 'Tata Consultancy Services (TCS)',
    role: 'Associate Software Engineer (Web & Java Technologies)',
    location: 'Gandhinagar / Ahmedabad, Gujarat',
    salary: '₹5,00,000 - ₹7,50,000 / year',
    status: 'interviewing',
    priority: 'high',
    appliedDate: '2026-09-22',
    followUpDate: '2026-10-06',
    interviewDate: '2026-10-06T10:30',
    jobUrl: 'https://tcs.com/careers/digital-cadre',
    jobDescription: `About TCS Digital:
Join the next-generation digital practice building enterprise solutions for global clients.

Key Responsibilities:
- Design, code, and test enterprise Java, SQL, and modern JavaScript web applications.
- Work with relational databases (MySQL, PostgreSQL, Oracle) and implement RESTful web services.
- Utilize Linux commands, shell scripting, and Git for deployment and version control.
- Solve algorithmic problems using solid data structures and object-oriented principles.

Eligibility:
- B.Tech / B.E in Information Technology or Computer Science (graduating 2026) with CGPA 7.0+.
- Strong fundamentals in Java, Python, SQL, and Web Technologies.`,
    fitScore: 91,
    fitRationale:
      'High alignment: B.Tech IT with 7.58 CGPA (8.00 SGPA) at CVM University, Java OOP certification, Linux commands & shell scripting certification, and SQL foundation.',
    parsedDetails: {
      title: 'Associate Software Engineer (Web & Java Technologies)',
      company: 'Tata Consultancy Services (TCS)',
      location: 'Gandhinagar / Ahmedabad, Gujarat',
      salaryRange: '₹5,00,000 - ₹7,50,000 / year',
      employmentType: 'Full-time',
      experienceLevel: 'Fresher / Entry Level (2026 Batch)',
      summary:
        'Develop enterprise software using Java OOP, SQL database design, REST web services, and Linux shell automation.',
      coreSkills: ['Java', 'SQL', 'Python', 'Object-Oriented Programming', 'Data Structures', 'Linux Shell Scripting'],
      niceToHaveSkills: ['HTML/CSS/JavaScript', 'Git', 'Google Cloud Fundamentals'],
      keyResponsibilities: [
        'Develop scalable backend services using Java and SQL database schemas.',
        'Automate deployment routines using Linux shell scripts and Git workflows.',
        'Collaborate with agile cross-functional delivery teams.'
      ],
      redFlags: [],
      culturePerks: ['TCS Digital cadre premium package', 'Global client exposure', 'Continuous certifications'],
      enforcedRules: ['Matches 2026 graduation date', 'Verified CGPA requirement']
    },
    tailoredBullets: [
      {
        text: 'Engineered modular object-oriented applications in Java and SQL with robust database normalization and transaction integrity, certified via Introduction to OOP with Java and Java Class Library credentials.',
        targetKeyword: 'Java, SQL, OOP, Database Management',
        impactType: 'Software Architecture & Correctness',
        rulesFollowed: ['XYZ formula', 'Supported by resume certificates']
      },
      {
        text: 'Automated routine file processing and developer testing workflows using Linux shell scripting and Git, improving operational turnaround and command-line efficiency.',
        targetKeyword: 'Linux Shell Scripting, Git, Automation',
        impactType: 'Operational Efficiency',
        rulesFollowed: ['Direct active verb', 'Matches Linux certification from resume']
      }
    ],
    outreachDraft: {
      type: 'recruiter',
      subject: 'TCS Digital Application — Ketan Kaushikbhai Bhoi (B.Tech IT, 2026 Batch)',
      body: `Dear Campus Recruiting Team,\n\nI have registered my profile for the TCS Digital Associate Software Engineer role.\n\nI am in my final year of B.Tech Information Technology at Madhuben And Bhanubhai Patel Institute of Technology (CGPA: 7.58, SGPA: 8.00). In addition to building full-stack web platforms with RESTful APIs, I hold certifications in Java OOP, Linux Commands & Shell Scripting, and Google Cloud Fundamentals.\n\nI would be honored to bring my technical skills and problem-solving passion to TCS.\n\nSincerely,\nKetan Kaushikbhai Bhoi\n+91 90541 46405 | kkbhoi09@gmail.com`,
      wordCount: 95,
      keyAngle: 'Highlights academic standing, certifications, and Java/Linux background.',
      enforcedRules: ['Under 150 words', 'Real educational credentials', 'Respectful tone']
    },
    interviewPrep: {
      questions: [
        {
          id: 'q1',
          question: 'Explain the four pillars of Object-Oriented Programming and how you applied Polymorphism in your Java coursework.',
          category: 'Java & OOP Fundamentals',
          interviewerIntent: 'Testing core fundamentals in Encapsulation, Inheritance, Polymorphism, and Abstraction.',
          starGuide: {
            situation: 'Building a modular inventory and billing calculation module in Java.',
            task: 'Implement different tax calculations for diverse product categories without duplicating code.',
            action: 'Used method overriding with an abstract TaxableItem class and dynamic dispatch at runtime.',
            result: 'Clean, extensible codebase where adding new categories required zero modification to billing core.'
          },
          pitfallsToAvoid: 'Confusing method overloading with method overriding.'
        }
      ],
      proTip: 'Highlight your certifications in Java and Linux Shell Scripting during the technical interview round.'
    },
    contacts: [],
    notes: 'National Qualifier Test (NQT) cleared. Technical and managerial interview scheduled for Gandhinagar campus.',
    tags: ['TCS Digital', 'Java', 'SQL', 'Gujarat'],
    createdAt: '2026-09-22T10:00:00.000Z',
    updatedAt: '2026-09-29T11:00:00.000Z',
    activityTimeline: [
      { id: 'act-tcs-1', type: 'created', date: '2026-09-22', description: 'Registered for TCS Digital NQT Cadre' },
      { id: 'act-tcs-2', type: 'applied', date: '2026-09-22', description: 'Application submitted through campus portal' },
      { id: 'act-tcs-3', type: 'status_change', date: '2026-09-29', description: 'NQT results announced - Qualified with Distinction' },
      { id: 'act-tcs-4', type: 'interview', date: '2026-10-06', description: 'Technical & Managerial interview round' }
    ]
  },
  {
    id: 'app-jinarth-4',
    company: 'Jinarth Infotech',
    role: 'Web Developer',
    location: 'Vasad / Anand, Gujarat',
    salary: '₹4,80,000 / year',
    status: 'applied',
    priority: 'medium',
    appliedDate: '2026-09-25',
    followUpDate: '2026-10-07',
    jobUrl: 'https://jinarth.com/careers',
    jobDescription: `About Jinarth Infotech:
We deliver custom web, IT, and software consulting services to businesses across Gujarat.

Role Requirements:
- Build responsive frontend web pages using HTML, CSS, JavaScript, and Tailwind CSS.
- Maintain and organize technical documentation, client spreadsheets, and project repositories.
- Assist senior developers with debugging, testing, and client feature enhancements.
- Fast learner with high attention to detail and strong team communication skills.`,
    fitScore: 95,
    fitRationale:
      'Previous internship experience at Jinarth Infotech (05/2025 - 06/2025) provides direct institutional knowledge and proven performance.',
    parsedDetails: {
      title: 'Web Developer',
      company: 'Jinarth Infotech',
      location: 'Vasad / Anand, Gujarat',
      salaryRange: '₹4,80,000 / year',
      employmentType: 'Full-time',
      experienceLevel: 'Entry Level',
      summary:
        'Deliver responsive web applications, organize code assets, and support core development workflows.',
      coreSkills: ['HTML', 'CSS', 'JavaScript', 'Tailwind CSS', 'Debugging', 'Documentation'],
      niceToHaveSkills: ['React.js', 'Spreadsheets', 'Git'],
      keyResponsibilities: [
        'Build and refine responsive web layouts with modern CSS and JavaScript.',
        'Organize technical files, spreadsheets, and reporting workflows.',
        'Collaborate with staff members to solve client technical requirements.'
      ],
      redFlags: [],
      culturePerks: ['Close to home in Anand/Vasad', 'Supportive mentorship', 'Diverse project domain exposure'],
      enforcedRules: ['Direct match to resume internship entry']
    },
    tailoredBullets: [
      {
        text: 'Supported development staff in daily coding tasks, reducing team workload burden and enabling accelerated delivery on high-priority client assignments.',
        targetKeyword: 'Web Development, Workload Reduction, Technical Support',
        impactType: 'Team Velocity & Delivery',
        rulesFollowed: ['From resume work experience at Jinarth Infotech', 'Truth-aligned']
      },
      {
        text: 'Sorted, validated, and organized technical files, reports, and spreadsheets while increasing hands-on proficiency across modern development toolsets.',
        targetKeyword: 'Data Organization, Technical Documentation',
        impactType: 'Process Hygiene',
        rulesFollowed: ['Clean active language', 'Direct resume quote']
      }
    ],
    outreachDraft: {
      type: 'hiring_manager',
      subject: 'Continuing my journey at Jinarth Infotech — Ketan Kaushikbhai Bhoi',
      body: `Dear Jinarth Infotech Team,\n\nFollowing my web development internship with you in mid-2025, where I supported daily development tasks and organized project assets, I am eager to apply for the full-time Web Developer opening as I complete my B.Tech degree.\n\nSince my internship, I have developed MetroMart (a full MERN stack platform) and deepened my work in REST APIs and cloud fundamentals.\n\nI would love to reconnect and discuss how I can hit the ground running.\n\nWarm regards,\nKetan Kaushikbhai Bhoi\n+91 90541 46405 | kkbhoi09@gmail.com`,
      wordCount: 88,
      keyAngle: 'Leverages previous internship trust and highlights subsequent growth in MERN stack.',
      enforcedRules: ['Under 150 words', 'Grounded in real Jinarth internship history']
    },
    interviewPrep: {
      questions: [
        {
          id: 'q1',
          question: 'What new technical capabilities have you developed since completing your internship with our team in June 2025?',
          category: 'Professional Growth',
          interviewerIntent: 'Assessing personal initiative, continuous learning, and project-based execution.',
          starGuide: {
            situation: 'Completing internship and returning to academic coursework.',
            task: 'Level up from basic web tasks to full-stack application architecture.',
            action: 'Built MetroMart multi-vendor platform with MERN stack, studied AI/LLM evaluation, and earned Google Cloud and Java certifications.',
            result: 'Able to architect end-to-end applications with MongoDB, Express, React, and Node.js independently.'
          },
          pitfallsToAvoid: 'Only mentioning classroom lectures rather than tangible projects.'
        }
      ],
      proTip: 'Acknowledge the team members who mentored you during your internship to demonstrate strong interpersonal connection.'
    },
    contacts: [],
    notes: 'Submitted application to management team. Follow up scheduled next week.',
    tags: ['Jinarth Infotech', 'Local', 'Alumni Team'],
    createdAt: '2026-09-25T11:00:00.000Z',
    updatedAt: '2026-10-07T09:30:00.000Z',
    activityTimeline: [
      { id: 'act-jn-1', type: 'created', date: '2026-09-25', description: 'Reconnected with team lead from internship' },
      { id: 'act-jn-2', type: 'applied', date: '2026-09-25', description: 'Submitted full-time Web Developer application' },
      { id: 'act-jn-3', type: 'follow_up', date: '2026-10-07', description: 'Follow-up email sent regarding open headcount' }
    ]
  },
  {
    id: 'app-zomato-5',
    company: 'Zomato',
    role: 'Junior Frontend / Full-Stack Engineer (React & Node)',
    location: 'Remote / Gurugram, India',
    salary: '₹10,50,000 / year',
    status: 'wishlist',
    priority: 'high',
    appliedDate: undefined,
    followUpDate: undefined,
    jobUrl: 'https://zomato.com/careers/engineering',
    jobDescription: `About Zomato Engineering:
We serve millions of food deliveries and restaurant experiences daily across hundreds of cities.

What we look for:
- Strong knowledge of modern JavaScript, React.js, and Node.js.
- Experience building fast, responsive user interfaces with CSS/Tailwind and integrating REST APIs.
- Passion for software correctness, clean debugging, and high-performance user journeys.
- Fast learner with a growth-oriented mindset.`,
    fitScore: 88,
    fitRationale:
      'Strong match: Hands-on React.js and Node.js experience from MetroMart e-commerce project, RESTful APIs, and fast learner mindset.',
    parsedDetails: {
      title: 'Junior Frontend / Full-Stack Engineer (React & Node)',
      company: 'Zomato',
      location: 'Remote / Gurugram, India',
      salaryRange: '₹10,50,000 / year',
      employmentType: 'Full-time',
      experienceLevel: 'Entry / Junior',
      summary: 'Build high-traffic customer and merchant web interfaces with React, Node.js, and REST APIs.',
      coreSkills: ['React.js', 'JavaScript', 'Node.js', 'RESTful APIs', 'Tailwind CSS'],
      niceToHaveSkills: ['MongoDB', 'Performance Optimization', 'Git'],
      keyResponsibilities: [
        'Develop responsive web components for high-traffic food delivery and dining surfaces.',
        'Integrate frontend React components with backend microservices via REST APIs.',
        'Maintain high code quality and software correctness.'
      ],
      redFlags: [],
      culturePerks: ['Free food & dining credits', 'Top-tier tech stack', 'Fast-paced growth culture'],
      enforcedRules: ['Verified tech stack compatibility']
    },
    tailoredBullets: [],
    contacts: [],
    notes: 'Drafting tailored resume targeting React.js and Node.js REST API skills.',
    tags: ['React', 'Zomato', 'E-commerce / FoodTech'],
    createdAt: '2026-09-28T09:15:00.000Z',
    updatedAt: '2026-10-18T14:20:00.000Z',
    activityTimeline: [
      { id: 'act-zomato-1', type: 'created', date: '2026-09-28', description: 'Bookmarked junior engineer role from careers page' },
      { id: 'act-zomato-2', type: 'note_added', date: '2026-10-18', description: 'Reviewed engineering blog post on React performance' }
    ]
  },
  {
    id: 'app-razorpay-6',
    company: 'Razorpay',
    role: 'Frontend Engineer (Payments UI)',
    location: 'Bengaluru / Hybrid',
    salary: '₹12,00,000 / year',
    status: 'interviewing',
    priority: 'high',
    appliedDate: '2026-10-02',
    followUpDate: '2026-10-16',
    interviewDate: '2026-10-21T14:00',
    jobUrl: 'https://razorpay.com/jobs/frontend-payments',
    jobDescription: `Join Razorpay to build checkout experiences handling over $100B in annualized transactions. Strong React, TypeScript, and web accessibility skills required.`,
    fitScore: 92,
    fitRationale: 'High alignment with React component design and REST API checkout workflows.',
    parsedDetails: {
      title: 'Frontend Engineer (Payments UI)',
      company: 'Razorpay',
      location: 'Bengaluru / Hybrid',
      salaryRange: '₹12,00,000 / year',
      employmentType: 'Full-time',
      experienceLevel: 'Entry / Junior Level',
      summary: 'Design responsive checkout and merchant settlement interfaces using React and Tailwind CSS.',
      coreSkills: ['React', 'JavaScript', 'TypeScript', 'RESTful APIs', 'Tailwind CSS'],
      niceToHaveSkills: ['Redux', 'Web Performance', 'Microfrontends'],
      keyResponsibilities: [
        'Build accessible payment gateway checkout components.',
        'Optimize client bundle size and latency on mobile browsers.',
        'Integrate webhook events and order status endpoints.'
      ],
      redFlags: [],
      culturePerks: ['Comprehensive health cover', 'Remote equipment allowance', 'Learning stipends'],
      enforcedRules: ['Verified salary benchmark']
    },
    tailoredBullets: [
      {
        text: 'Architected responsive checkout workflows and shopping cart synchronization in MetroMart with React and Node.js, maintaining sub-100ms state updates.',
        targetKeyword: 'React, Checkout Flows, State Management',
        impactType: 'Frontend Performance',
        rulesFollowed: ['XYZ framework']
      }
    ],
    contacts: [
      { id: 'c-rp', name: 'Priya Sharma', title: 'Tech Recruiter', emailOrLinkedIn: 'priya.s@razorpay.com' }
    ],
    notes: 'Completed technical coding round. System architecture round scheduled for Oct 21.',
    tags: ['FinTech', 'React', 'Bengaluru'],
    createdAt: '2026-10-02T08:30:00.000Z',
    updatedAt: '2026-10-21T11:00:00.000Z',
    activityTimeline: [
      { id: 'act-rp-1', type: 'created', date: '2026-10-02', description: 'Opportunity imported via Job Clipper' },
      { id: 'act-rp-2', type: 'applied', date: '2026-10-02', description: 'Submitted tailored resume and cover letter' },
      { id: 'act-rp-3', type: 'status_change', date: '2026-10-12', description: 'Recruiter reached out for initial phone screen' },
      { id: 'act-rp-4', type: 'interview', date: '2026-10-21', description: 'Round 2 System & Component Design interview held' }
    ]
  },
  {
    id: 'app-zepto-7',
    company: 'Zepto',
    role: 'Software Development Engineer - 1 (Node & Cloud)',
    location: 'Bengaluru / Remote',
    salary: '₹14,00,000 / year',
    status: 'applied',
    priority: 'high',
    appliedDate: '2026-10-14',
    followUpDate: '2026-10-24',
    jobUrl: 'https://zepto.com/careers/backend-sde1',
    jobDescription: `Scale dark store inventory routing and microservice backends with Node.js, Express, MongoDB, and AWS/GCP.`,
    fitScore: 89,
    fitRationale: 'Strong MERN backend architecture experience and MongoDB schema design.',
    contacts: [],
    notes: 'Submitted via employee referral. Awaiting recruiter screening.',
    tags: ['QuickCommerce', 'Node.js', 'High Priority'],
    createdAt: '2026-10-14T09:00:00.000Z',
    updatedAt: '2026-10-14T10:30:00.000Z',
    activityTimeline: [
      { id: 'act-zp-1', type: 'created', date: '2026-10-14', description: 'Found referral lead on LinkedIn' },
      { id: 'act-zp-2', type: 'applied', date: '2026-10-14', description: 'Submitted referral application' }
    ]
  },
  {
    id: 'app-cred-8',
    company: 'CRED',
    role: 'Associate Frontend Developer',
    location: 'Bengaluru, India',
    salary: '₹15,00,000 / year',
    status: 'interviewing',
    priority: 'high',
    appliedDate: '2026-09-08',
    interviewDate: '2026-09-18T16:00',
    followUpDate: '2026-09-24',
    jobUrl: 'https://cred.club/careers',
    jobDescription: `Build high-polish design systems and interactive UI animations using modern React, CSS transforms, and state machines.`,
    fitScore: 87,
    fitRationale: 'Clean UI component design from MetroMart and deep CSS/Tailwind skills.',
    contacts: [],
    notes: 'Completed UI machine coding round on Sep 18. Followed up on Sep 24.',
    tags: ['Design Systems', 'React', 'FinTech'],
    createdAt: '2026-09-08T11:00:00.000Z',
    updatedAt: '2026-09-24T15:00:00.000Z',
    activityTimeline: [
      { id: 'act-cr-1', type: 'created', date: '2026-09-08', description: 'Targeted high-growth startup' },
      { id: 'act-cr-2', type: 'applied', date: '2026-09-08', description: 'Submitted tailored application' },
      { id: 'act-cr-3', type: 'interview', date: '2026-09-18', description: 'Machine Coding Round completed' },
      { id: 'act-cr-4', type: 'follow_up', date: '2026-09-24', description: 'Sent thank you follow-up note to recruiter' }
    ]
  },
  {
    id: 'app-jio-9',
    company: 'Jio Platforms',
    role: 'Graduate Engineer Trainee (Cloud & Web)',
    location: 'Ahmedabad / Navi Mumbai',
    salary: '₹6,50,000 / year',
    status: 'interviewing',
    priority: 'medium',
    appliedDate: '2026-08-11',
    interviewDate: '2026-08-25T11:00',
    followUpDate: '2026-09-05',
    jobUrl: 'https://jio.com/careers',
    jobDescription: `Develop cloud native enterprise portals and distributed backend microservices with Java, Node.js, and Google Cloud Fundamentals.`,
    fitScore: 93,
    fitRationale: 'B.Tech IT, Google Cloud Fundamentals certification, and Linux shell scripting match perfectly.',
    contacts: [],
    notes: 'Technical panel completed on Aug 25. HR discussion scheduled.',
    tags: ['Campus Placements', 'Gujarat', 'Enterprise'],
    createdAt: '2026-08-11T10:00:00.000Z',
    updatedAt: '2026-08-27T17:00:00.000Z',
    activityTimeline: [
      { id: 'act-jio-1', type: 'created', date: '2026-08-11', description: 'Campus placement drive notification received' },
      { id: 'act-jio-2', type: 'applied', date: '2026-08-11', description: 'Submitted university portal application' },
      { id: 'act-jio-3', type: 'interview', date: '2026-08-25', description: 'Technical panel interview on Java OOP & Cloud' },
      { id: 'act-jio-4', type: 'status_change', date: '2026-08-27', description: 'Shortlisted for HR Round' }
    ]
  },
  {
    id: 'app-infosys-10',
    company: 'Infosys',
    role: 'Specialist Programmer (Open Source & Cloud)',
    location: 'Pune / Bengaluru',
    salary: '₹9,50,000 / year',
    status: 'applied',
    priority: 'high',
    appliedDate: '2026-08-18',
    followUpDate: '2026-08-29',
    jobUrl: 'https://infosys.com/careers',
    jobDescription: `Build high performance web apps with JavaScript, Node.js, and Python. HackerRank coding qualification required.`,
    fitScore: 90,
    fitRationale: 'High coding assessment score in Java and Python.',
    contacts: [],
    notes: 'Coding contest round cleared on Aug 20. Application in screening.',
    tags: ['Infosys SP', 'High Package', 'Full-Stack'],
    createdAt: '2026-08-18T13:00:00.000Z',
    updatedAt: '2026-08-20T19:00:00.000Z',
    activityTimeline: [
      { id: 'act-inf-1', type: 'created', date: '2026-08-18', description: 'Registered for InfyTQ / SP contest' },
      { id: 'act-inf-2', type: 'applied', date: '2026-08-18', description: 'Submitted application' },
      { id: 'act-inf-3', type: 'status_change', date: '2026-08-20', description: 'Coding assessment completed with 100% test cases' }
    ]
  },
  {
    id: 'app-swiggy-11',
    company: 'Swiggy',
    role: 'Frontend Software Engineer - Intern to Full-Time',
    location: 'Bengaluru / Remote',
    salary: '₹8,00,000 / year',
    status: 'wishlist',
    priority: 'medium',
    appliedDate: '2026-08-04',
    jobUrl: 'https://swiggy.com/careers',
    jobDescription: `Develop delivery partner and consumer web features using React.js, Tailwind CSS, and RESTful APIs.`,
    fitScore: 86,
    fitRationale: 'Relevant MERN and e-commerce cart experience.',
    contacts: [],
    notes: 'Preparing tailored resume emphasizing quick response times.',
    tags: ['FoodTech', 'React', 'Bengaluru'],
    createdAt: '2026-08-04T12:00:00.000Z',
    updatedAt: '2026-08-05T14:00:00.000Z',
    activityTimeline: [
      { id: 'act-sw-1', type: 'created', date: '2026-08-04', description: 'Saved opening from career portal' },
      { id: 'act-sw-2', type: 'note_added', date: '2026-08-05', description: 'Drafted cold outreach for technical recruiter' }
    ]
  }
];

export const SAMPLE_JOB_POSTINGS = [
  {
    name: 'Haronex Technology — MERN Stack Developer',
    company: 'Haronex Technology',
    text: `About Haronex Technology:
We build scalable web and e-commerce solutions for retail and multi-vendor networks across India.

Responsibilities:
- Build and maintain MetroMart, our multi-vendor e-commerce platform using MongoDB, Express.js, React.js, and Node.js.
- Develop vendor and customer-facing modules including product listings, cart, and multi-vendor order management.
- Implement robust RESTful APIs and integrate frontend React components with backend Node/Express services.
- Optimize database queries in MongoDB and enforce clean, type-safe API communication.

Requirements:
- Hands-on experience with the MERN stack (MongoDB, Express, React, Node.js).
- Strong command of HTML, CSS, JavaScript, and Tailwind CSS.
- Familiarity with RESTful API design, Git version control, and Linux shell commands.
- Location: Anand, Gujarat / Hybrid. Salary: ₹6.5 - ₹9 LPA.`
  },
  {
    name: 'Outlier AI — AI/LLM Quality Evaluator & Prompt Engineer',
    company: 'Outlier AI',
    text: `About Outlier AI:
We partner with leading frontier AI research labs to evaluate, stress-test, and align state-of-the-art Large Language Models.

Role & Responsibilities:
- Design structured test cases and adversarial prompts to evaluate LLM reasoning, code correctness, and factual consistency.
- Review and score model outputs across technical programming benchmarks (Python, Java, SQL, JavaScript).
- Identify hallucinations, bias, and instruction-following failures; provide structured annotations and comparative feedback.
- Synthesize prompt variations to measure model robustness and consistency across multiple inference runs.

Requirements:
- Background in Computer Science or Information Technology (B.Tech student / graduate).
- Strong foundation in programming (Python, Java, or SQL) and software debugging.
- High attention to detail, analytical mindset, and active interest in AI/LLM safety and output quality.
- 100% Remote. Hourly Compensation: $25 - $35/hour.`
  },
  {
    name: 'TCS — Associate Software Engineer (Digital)',
    company: 'Tata Consultancy Services (TCS)',
    text: `About TCS Digital:
Join the next-generation digital practice building enterprise solutions for global clients.

Key Responsibilities:
- Design, code, and test enterprise Java, SQL, and modern JavaScript web applications.
- Work with relational databases (MySQL, PostgreSQL, Oracle) and implement RESTful web services.
- Utilize Linux commands, shell scripting, and Git for deployment and version control.
- Solve algorithmic problems using solid data structures and object-oriented principles.

Eligibility:
- B.Tech / B.E in Information Technology or Computer Science (graduating 2026) with CGPA 7.0+.
- Strong fundamentals in Java, Python, SQL, and Web Technologies.
- Location: Gandhinagar / Ahmedabad. Salary: ₹5 - ₹7.5 LPA.`
  }
];

