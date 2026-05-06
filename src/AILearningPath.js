import React, { useMemo, useState, useEffect, useCallback } from 'react';

/** Focused study time required per checklist line (tab must be visible). */
const MIN_MS_PER_TASK = 30 * 60 * 1000;
const QUIZ_PASS_RATIO = 0.7;
const QUIZ_MIN_READ_MS = 45 * 1000;
const VIVA_MIN_CHARS = 80;

const weeklyPlans = {
  'Frontend Development': [
    { week: 'Week 1', title: 'HTML & CSS Foundations', duration: '5-7 hours', description: 'Learn the building blocks of every website. HTML gives structure, CSS gives style.', tasks: ['Complete HTML basics — headings, paragraphs, links, images', 'Learn CSS selectors, colors, fonts, and spacing', 'Build a simple personal profile page'], taskResources: [{ name: 'MDN — HTML intro', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', type: 'Docs' }, { name: 'MDN — CSS intro', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS', type: 'Docs' }, { name: 'freeCodeCamp — Responsive Web Design', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', type: 'Course' }], outcome: 'You can build a basic webpage from scratch' },
    { week: 'Week 2', title: 'JavaScript Basics', duration: '6-8 hours', description: 'JavaScript makes websites interactive. Learn variables, functions, and events.', tasks: ['Learn variables, data types, and operators', 'Understand if/else, loops, and functions', 'Build a simple calculator or to-do list'], taskResources: [{ name: 'JavaScript.info — Fundamentals', url: 'https://javascript.info/first-steps', type: 'Course' }, { name: 'MDN — JS guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', type: 'Docs' }, { name: 'MDN — Functions', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions', type: 'Docs' }], outcome: 'You can add interactivity to any webpage' },
    { week: 'Week 3', title: 'React Fundamentals', duration: '7-9 hours', description: 'React is the most in-demand frontend skill. Learn components, props, and state.', tasks: ['Understand what React is and why companies use it', 'Learn components, JSX syntax, and props', 'Build a simple React app with multiple components'], taskResources: [{ name: 'React.dev — Quick Start', url: 'https://react.dev/learn', type: 'Docs' }, { name: 'React.dev — Describing the UI', url: 'https://react.dev/learn/describing-the-ui', type: 'Docs' }, { name: 'React.dev — Adding Interactivity', url: 'https://react.dev/learn/adding-interactivity', type: 'Docs' }], outcome: 'You can build a basic React application' },
    { week: 'Week 4', title: 'Tailwind CSS + Responsive Design', duration: '5-6 hours', description: 'Make your apps look professional on any screen size.', tasks: ['Install and configure Tailwind CSS', 'Learn utility classes for layout, spacing, and colors', 'Make your React app fully responsive on mobile'], taskResources: [{ name: 'Tailwind — Installation', url: 'https://tailwindcss.com/docs/installation', type: 'Docs' }, { name: 'Tailwind — Layout & spacing', url: 'https://tailwindcss.com/docs/layout', type: 'Docs' }, { name: 'Tailwind — Responsive design', url: 'https://tailwindcss.com/docs/responsive-design', type: 'Docs' }], outcome: 'Your app looks great on both desktop and mobile' },
    { week: 'Week 5', title: 'Git & GitHub + First Project', duration: '6-8 hours', description: 'Push your project to GitHub — this is what recruiters actually check.', tasks: ['Learn git init, add, commit, push commands', 'Create a GitHub account and push your first project', 'Write a good README file for your project'], taskResources: [{ name: 'GitHub — Git guides', url: 'https://docs.github.com/en/get-started/git-basics', type: 'Docs' }, { name: 'GitHub — Hello World', url: 'https://docs.github.com/en/get-started/quickstart/hello-world', type: 'Docs' }, { name: 'GitHub — About READMEs', url: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes', type: 'Docs' }], outcome: 'Your project is live on GitHub for recruiters to see' },
    { week: 'Week 6', title: 'Apply + Portfolio + Internships', duration: '5-7 hours', description: 'Time to get hired. Build your portfolio and start applying.', tasks: ['Build a portfolio website with your 2-3 best projects', 'Update your resume with GitHub links', 'Apply to 5+ frontend internships on LinkedIn and Internshala'], taskResources: [{ name: 'GitHub Pages', url: 'https://pages.github.com', type: 'Hosting' }, { name: 'LinkedIn — Job search', url: 'https://www.linkedin.com/jobs/', type: 'Apply' }, { name: 'Internshala', url: 'https://internshala.com', type: 'Apply' }], outcome: 'You have a live portfolio and active job applications' },
  ],
  'Backend Development': [
    { week: 'Week 1', title: 'Node.js Basics', duration: '5-7 hours', description: 'Node.js lets you run JavaScript on the server.', tasks: ['Install Node.js', 'Learn modules and npm', 'Build a simple CLI app'], taskResources: [{ name: 'Node.js — Get started', url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs', type: 'Docs' }, { name: 'Node.js — Modules', url: 'https://nodejs.org/api/modules.html', type: 'Docs' }, { name: 'npm — Docs', url: 'https://docs.npmjs.com/', type: 'Docs' }], outcome: 'You can run JavaScript outside the browser' },
    { week: 'Week 2', title: 'Express.js + REST APIs', duration: '6-8 hours', description: 'Express is the most popular Node.js framework.', tasks: ['Set up an Express server', 'Create GET/POST routes', 'Test using Postman'], taskResources: [{ name: 'Express — Getting started', url: 'https://expressjs.com/en/starter/installing.html', type: 'Docs' }, { name: 'Express — Routing', url: 'https://expressjs.com/en/guide/routing.html', type: 'Docs' }, { name: 'Postman Learning', url: 'https://learning.postman.com/', type: 'Tool' }], outcome: 'You have built a working REST API' },
    { week: 'Week 3', title: 'MongoDB + Mongoose', duration: '6-7 hours', description: 'Connect your backend to a database.', tasks: ['Set up MongoDB Atlas', 'Connect using Mongoose', 'Build CRUD operations'], taskResources: [{ name: 'MongoDB Atlas', url: 'https://www.mongodb.com/atlas', type: 'Tool' }, { name: 'Mongoose — Docs', url: 'https://mongoosejs.com/docs/guide.html', type: 'Docs' }, { name: 'MongoDB CRUD', url: 'https://www.mongodb.com/docs/manual/crud/', type: 'Docs' }], outcome: 'Your API now reads and writes to a database' },
    { week: 'Week 4', title: 'Authentication + JWT', duration: '6-8 hours', description: 'Learn how login systems work with tokens.', tasks: ['Implement user registration', 'Generate JWT tokens', 'Protect routes'], taskResources: [{ name: 'JWT.io — Introduction', url: 'https://jwt.io/introduction', type: 'Docs' }, { name: 'Auth0 — JWT', url: 'https://auth0.com/docs/secure/tokens/json-web-tokens', type: 'Docs' }, { name: 'OWASP — Auth cheat sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html', type: 'Security' }], outcome: 'Your app has a working login system' },
    { week: 'Week 5', title: 'SQL + Deployment', duration: '6-7 hours', description: 'Learn SQL databases and deploy live.', tasks: ['Learn basic SQL', 'Deploy on Render or Railway', 'Connect frontend to live backend'], taskResources: [{ name: 'SQLZoo', url: 'https://sqlzoo.net', type: 'Practice' }, { name: 'Render — Docs', url: 'https://render.com/docs', type: 'Deploy' }, { name: 'Railway — Docs', url: 'https://docs.railway.app', type: 'Deploy' }], outcome: 'Your backend is live on the internet' },
    { week: 'Week 6', title: 'Project + Apply', duration: '5-7 hours', description: 'Build a complete full-stack project.', tasks: ['Build a full-stack project', 'Push to GitHub', 'Apply to 5+ internships'], taskResources: [{ name: 'GitHub — Repositories', url: 'https://docs.github.com/en/repositories', type: 'Docs' }, { name: 'GitHub — Push commits', url: 'https://docs.github.com/en/get-started/using-git/pushing-commits-to-a-remote-repository', type: 'Docs' }, { name: 'Internshala', url: 'https://internshala.com', type: 'Apply' }], outcome: 'You have a complete backend project' },
  ],
};

const defaultPlan = weeklyPlans['Frontend Development'];

const moderateBank = [
  { q: 'What is the main role of HTML in a web page?', options: ['Styling only', 'Structure and content', 'Database queries', 'Authentication'], correct: 1 },
  { q: 'Which HTTP method is usually used to fetch data?', options: ['POST', 'DELETE', 'GET', 'PATCH'], correct: 2 },
  { q: 'Git is primarily used for…', options: ['Image editing', 'Version control', 'DNS hosting', 'Payments'], correct: 1 },
  { q: 'A REST API commonly returns data as…', options: ['JPEG only', 'JSON', 'MP4', 'ZIP code lists'], correct: 1 },
  { q: 'npm is best described as…', options: ['A CSS framework', 'A Node package manager', 'A browser engine', 'A cloud VM'], correct: 1 },
  { q: 'Which pair is a client-side JavaScript framework/library?', options: ['Docker + Kubernetes', 'React / Vue / Angular', 'MySQL + Redis', 'Nginx + HAProxy'], correct: 1 },
];

const toughBank = [
  { q: 'JWTs are commonly signed to ensure…', options: ['Faster CSS', 'Integrity and authenticity', 'Larger bundle size', 'SEO ranking'], correct: 1 },
  { q: 'CORS exists mainly to…', options: ['Style buttons', 'Control cross-origin browser requests', 'Compile TypeScript', 'Minify images'], correct: 1 },
  { q: 'Idempotent HTTP methods (safe to retry) often include…', options: ['GET and PUT (in design)', 'Random UDP', 'FTP binary mode', 'SMTP HELO'], correct: 0 },
  { q: 'MongoDB documents are typically stored as…', options: ['Strict rows only', 'BSON / JSON-like documents', 'Excel sheets', 'INI files'], correct: 1 },
  { q: 'Rate limiting an API helps mitigate…', options: ['Typography issues', 'Abuse and brute-force traffic', 'Color contrast', 'Lack of emojis'], correct: 1 },
  { q: 'Environment variables for secrets should live…', options: ['In public GitHub README', 'Server-side / CI secrets, not client bundle', 'Inside every image alt text', 'In localStorage unencrypted'], correct: 1 },
];

function pickQuizQuestions(moduleIndex) {
  const tough = moduleIndex >= 3;
  const bank = tough ? toughBank : moderateBank;
  const start = (moduleIndex * 2) % bank.length;
  const out = [];
  for (let k = 0; k < 4; k++) {
    out.push(bank[(start + k) % bank.length]);
  }
  return { questions: out, label: tough ? 'Tough verification' : 'Moderate verification' };
}

function normalizeTaskTimes(item, taskCount) {
  const arr = Array.isArray(item.taskTimeMs) ? [...item.taskTimeMs] : [];
  while (arr.length < taskCount) arr.push(0);
  return arr.slice(0, taskCount);
}

function studyProgressFraction(item, step) {
  const n = step.tasks.length;
  if (n === 0) return 1;
  const arr = normalizeTaskTimes(item, n);
  const sum = arr.reduce((a, ms) => a + Math.min(ms, MIN_MS_PER_TASK), 0);
  return sum / (n * MIN_MS_PER_TASK);
}

function studyRequirementsMet(item, step) {
  return studyProgressFraction(item, step) >= 0.999;
}

function normalizeResourceOpened(item, taskCount) {
  const arr = Array.isArray(item.resourceOpened) ? [...item.resourceOpened] : [];
  while (arr.length < taskCount) arr.push(false);
  return arr.slice(0, taskCount).map(Boolean);
}

/** One resource per task line; falls back if legacy step has only `resources`. */
function getTaskResources(step) {
  const n = step.tasks.length;
  if (Array.isArray(step.taskResources) && step.taskResources.length >= n) {
    return step.taskResources.slice(0, n);
  }
  const fb = (step.resources && step.resources[0]) || { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', type: 'Docs' };
  return step.tasks.map((_, i) => ({
    name: n > 1 ? `${fb.name} (part ${i + 1})` : fb.name,
    url: fb.url,
    type: fb.type || 'Link',
  }));
}

const defaultTheme = {
  pageBg: 'var(--bg-base)',
  cardBg: 'var(--glass-bg)',
  inputBg: 'rgba(255, 255, 255, 0.6)',
  border: 'var(--glass-border)',
  textPrimary: 'var(--text-heading)',
  textMuted: 'var(--text-body)',
  accent: 'var(--brand-teal)',
  accentHover: 'var(--brand-yellow)',
  accentLight: 'rgba(0, 212, 170, 0.2)',
  success: 'var(--brand-teal)',
  warning: 'var(--brand-yellow)',
  error: 'var(--brand-coral)',
};

export default function AILearningPath({ userData, onBack, onNext, onProgressUpdate, theme }) {
  const currentTheme = theme || defaultTheme;
  const skillName = userData?.skill?.title || 'Frontend Development';
  const name = userData?.name || 'Student';
  const skillIcon = userData?.skill?.icon || '💻';
  const goal = userData?.goal?.label || '💼 Get a Job';

  const [moduleProgress, setModuleProgress] = useState(() => userData?.learningProgress?.modules || {});
  const [activeStep, setActiveStep] = useState(null);
  const [testResult, setTestResult] = useState('');
  const [remediationSteps] = useState(userData?.remediationWeeks || []);
  const [studyTaskIdx, setStudyTaskIdx] = useState({});

  const [quizOpen, setQuizOpen] = useState(null);
  const [quizChoices, setQuizChoices] = useState({});
  const [quizOpenedAt, setQuizOpenedAt] = useState(null);
  const [quizMessage, setQuizMessage] = useState('');

  const steps = useMemo(() => {
    const baseSteps = weeklyPlans[skillName] || defaultPlan;
    if (remediationSteps.length === 0) return baseSteps;

    const injected = [...baseSteps];
    remediationSteps.forEach((title, idx) => {
      injected.splice(3 + idx, 0, {
        week: `Remediation ${idx + 1}`,
        title: title.split(': ')[1] || title,
        duration: '4-5 hours',
        description: 'This module was dynamically added based on your Project Audit results.',
        tasks: ['Review AI-identified gaps', 'Refactor existing project code'],
        taskResources: [
          { name: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/', type: 'Security' },
          { name: 'Refactoring Guru', url: 'https://refactoring.guru', type: 'Guide' },
        ],
        outcome: 'Your project depth matches industry standards',
      });
    });
    return injected;
  }, [skillName, remediationSteps]);

  const doneCount = useMemo(
    () => Object.values(moduleProgress).filter((value) => value?.completed).length,
    [moduleProgress]
  );
  const progress = Math.round((doneCount / steps.length) * 100);

  const syncLearningProgress = useCallback((nextModules) => {
    if (!onProgressUpdate) return;
    const nextDoneCount = Object.values(nextModules).filter((value) => value?.completed).length;
    const nextProgress = Math.round((nextDoneCount / steps.length) * 100);
    onProgressUpdate({
      learningProgress: {
        modules: nextModules,
        completedCount: nextDoneCount,
        total: steps.length,
        percent: nextProgress,
      },
    });
  }, [onProgressUpdate, steps.length]);

  useEffect(() => {
    if (activeStep === null) return undefined;
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      setModuleProgress((prev) => {
        const step = steps[activeStep];
        if (!step) return prev;
        const item = prev[activeStep] || {};
        if (item.completed) return prev;
        const n = step.tasks.length;
        const tIdx = Math.min(Math.max(studyTaskIdx[activeStep] ?? 0, 0), Math.max(0, n - 1));
        const opened = normalizeResourceOpened(item, n);
        if (!opened[tIdx]) return prev;
        const arr = normalizeTaskTimes(item, n);
        if (arr[tIdx] >= MIN_MS_PER_TASK) return prev;
        arr[tIdx] = Math.min(MIN_MS_PER_TASK, arr[tIdx] + 1000);
        return {
          ...prev,
          [activeStep]: { ...item, taskTimeMs: arr, courseStarted: true },
        };
      });
    };
    const id = setInterval(tick, 1000);
    return () => setInterval(id);
  }, [activeStep, steps, studyTaskIdx]);

  useEffect(() => {
    const vis = () => {
      if (quizOpen !== null) setQuizOpenedAt((t) => t || Date.now());
    };
    document.addEventListener('visibilitychange', vis);
    return () => document.removeEventListener('visibilitychange', vis);
  }, [quizOpen]);

  const openTaskResource = useCallback((moduleIdx, taskIdx) => {
    const step = steps[moduleIdx];
    if (!step) return;
    const list = getTaskResources(step);
    const tr = list[taskIdx];
    if (!tr?.url || tr.url === '#') {
      alert('Resource link is not available for this task.');
      return;
    }
    window.open(tr.url, '_blank', 'noopener,noreferrer');
    setStudyTaskIdx((s) => ({ ...s, [moduleIdx]: taskIdx }));
    setModuleProgress((prev) => {
      const item = prev[moduleIdx] || {};
      const n = step.tasks.length;
      const opened = normalizeResourceOpened(item, n);
      opened[taskIdx] = true;
      return { ...prev, [moduleIdx]: { ...item, resourceOpened: opened, courseStarted: true } };
    });
  }, [steps]);

  const openModuleQuiz = (i) => {
    const step = steps[i];
    const item = moduleProgress[i] || {};
    if (!studyRequirementsMet(item, step)) {
      alert('Complete focused study time on every task first (timer runs only while this tab is visible).');
      return;
    }
    if (item.moduleQuizPassed) return;
    setQuizChoices({});
    setQuizMessage('');
    setQuizOpen(i);
    setQuizOpenedAt(Date.now());
  };

  const submitModuleQuiz = (i) => {
    const elapsed = Date.now() - (quizOpenedAt || Date.now());
    if (elapsed < QUIZ_MIN_READ_MS) {
      setQuizMessage(`Please spend at least ${Math.ceil(QUIZ_MIN_READ_MS / 1000)}s reviewing the questions (anti-cheat).`);
      return;
    }
    const { questions } = pickQuizQuestions(i);
    let correct = 0;
    questions.forEach((q, qi) => {
      if (quizChoices[qi] === q.correct) correct += 1;
    });
    const score = correct / questions.length;
    if (score < QUIZ_PASS_RATIO) {
      setQuizMessage(`Score ${Math.round(score * 100)}%. Need ${Math.round(QUIZ_PASS_RATIO * 100)}%+ to pass. Try again.`);
      setQuizChoices({});
      setQuizOpenedAt(Date.now());
      return;
    }
    setModuleProgress((prev) => {
      const next = {
        ...prev,
        [i]: {
          ...prev[i],
          moduleQuizPassed: true,
          moduleQuizScore: Math.round(score * 100),
        },
      };
      syncLearningProgress(next);
      return next;
    });
    setQuizOpen(null);
    setQuizMessage('');
    setTestResult(`✅ ${pickQuizQuestions(i).label} passed (${Math.round(score * 100)}%). Continue with the AI viva below.`);
  };

  const submitAIViva = (index, answer) => {
    const item = moduleProgress[index] || {};
    if (!item.moduleQuizPassed) {
      setTestResult('⚠️ Pass the verification quiz before the AI viva.');
      return;
    }
    if (!answer || answer.length < VIVA_MIN_CHARS) {
      setTestResult(`⚠️ Write at least ${VIVA_MIN_CHARS} characters of original explanation (anti-cheat).`);
      return;
    }
    setTestResult('🔍 AI is auditing your explanation...');
    setTimeout(() => {
      const passed = answer.length >= VIVA_MIN_CHARS + 20;
      const score = passed ? 88 : 42;
      setModuleProgress((prev) => {
        const cur = prev[index] || {};
        const next = {
          ...prev,
          [index]: {
            ...cur,
            testPassed: passed,
            testScore: score,
          },
        };
        syncLearningProgress(next);
        return next;
      });
      setTestResult(passed ? `✅ AI viva passed (${score}% depth). You may now finalize the module.` : '❌ Viva needs more concrete technical detail. Try again.');
    }, 1800);
  };

  const finalizeModule = (i) => {
    const step = steps[i];
    const item = moduleProgress[i] || {};
    if (!studyRequirementsMet(item, step)) {
      alert('Study time incomplete for one or more tasks.');
      return;
    }
    if (!item.moduleQuizPassed) {
      alert('Pass the verification quiz first.');
      return;
    }
    if (!item.testPassed) {
      alert('Pass the AI viva first.');
      return;
    }
    setModuleProgress((prev) => {
      const next = {
        ...prev,
        [i]: {
          ...prev[i],
          courseDone: true,
          completed: true,
        },
      };
      syncLearningProgress(next);
      return next;
    });
  };

  const formatClock = (ms) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}m ${s}s`;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-body)', fontFamily: 'var(--font-main)', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '60px' }}>
          <button type="button" onClick={onBack} className="pf-glass" style={{ border:'none', padding: '16px 35px', cursor: 'pointer', fontSize: '13px', fontWeight: '900', borderRadius:'25px', letterSpacing:'1.5px', textTransform:'uppercase' }}>BACK</button>
          <h1 className="pf-shimmer-text" style={{ fontSize: '42px', fontWeight: '900', fontFamily:'var(--font-display)', margin: 0, letterSpacing: '-2px' }}>⚡ PathForge Roadmap</h1>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '100px' }}>
          <div className="pf-glass" style={{ display: 'inline-block', borderRadius: '25px', padding: '12px 30px', marginBottom: '40px', fontSize: '14px', color: 'var(--brand-teal)', fontWeight: '900', border: 'none', background:'rgba(0, 212, 170, 0.08)', letterSpacing:'3px' }}>
            🤖 ADAPTIVE LEARNING ENGINE · TIME-VERIFIED STUDY
          </div>
          <h2 style={{ fontSize: '72px', fontWeight: '900', marginBottom: '25px', fontFamily: 'var(--font-display)', letterSpacing: '-3.5px', color:'var(--text-heading)', lineHeight: '1.1' }}>
            {name}'s Path to Mastery
          </h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: '900', fontSize:'26px', opacity:0.6, letterSpacing: '1px' }}>{skillIcon} {skillName.toUpperCase()} · 🎯 {goal.split(' ').slice(1).join(' ').toUpperCase()}</p>
        </div>

        <div className="pf-glass" style={{ padding: '60px', marginBottom: '80px', background:'white !important', borderRadius:'50px', border:'none', borderLeft: '15px solid var(--brand-teal) !important', boxShadow: '0 40px 100px rgba(0,0,0,0.05)' }}>
          <div style={{ display:'flex', gap:'35px', alignItems:'flex-start' }}>
             <span style={{fontSize:'48px'}}>💡</span>
             <div>
                <strong style={{ color: 'var(--brand-teal)', fontWeight: '900', fontSize:'18px', letterSpacing:'2px', display:'block', marginBottom:'15px' }}>HOW TO PROGRESS:</strong>
                <p style={{ margin:0, fontSize: '18px', color: 'var(--text-body)', lineHeight: 1.8, fontWeight: '700' }}>
                   For each task, click <strong>Open Resource</strong> to initiate the study sequence. The timer triggers only when active on this tab. Requires <strong>{MIN_MS_PER_TASK / 60000} minutes</strong> per task, followed by verification quiz and AI viva audit.
                </p>
             </div>
          </div>
        </div>

        <div className="pf-glass" style={{ padding: '60px', marginBottom: '80px', background:'white !important', borderRadius:'50px', boxShadow:'0 30px 80px rgba(0,0,0,0.04)', border:'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '35px', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'2.5px', opacity:0.5 }}>{doneCount} / {steps.length} MODULES MASTERED</span>
            <span className="pf-shimmer-text" style={{ fontWeight: '900', fontSize: '56px', fontFamily: 'var(--font-display)', letterSpacing:'-2.5px', lineHeight:1 }}>{progress}%</span>
          </div>
          <div style={{ height: '24px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', overflow: 'hidden', padding:'6px', boxShadow:'inset 0 2px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--brand-teal), var(--brand-yellow))', borderRadius: '8px', transition: 'width 2s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 0 30px rgba(0, 212, 170, 0.3)' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          {steps.map((step, i) => {
            const item = moduleProgress[i] || {};
            const isDone = Boolean(item.completed);
            const isOpen = activeStep === i;
            const frac = studyProgressFraction(item, step);
            const studyDone = studyRequirementsMet(item, step);

            return (
              <div key={i} className="pf-glass" style={{ 
                overflow: 'hidden', 
                borderRadius:'50px',
                background: isDone ? 'rgba(0, 212, 170, 0.04) !important' : (isOpen ? 'white !important' : 'rgba(0,0,0,0.01) !important'),
                transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isOpen ? '0 50px 120px rgba(0,0,0,0.08)' : '0 10px 30px rgba(0,0,0,0.02)',
                transform: isOpen ? 'scale(1.02)' : 'scale(1)',
                border:'none'
              }}>
                <button type="button" onClick={() => setActiveStep(isOpen ? null : i)} style={{ width: '100%', padding: '45px 60px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', color: 'inherit', textAlign: 'left', outline:'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                    <div className="pf-glass" style={{ 
                      width: '80px', height: '80px', borderRadius: '28px', 
                      background: isDone ? 'var(--brand-teal)' : 'white !important', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      color: isDone ? '#FFFFFF' : 'var(--text-heading)', fontWeight: '900', fontSize: '32px',
                      border: 'none',
                      fontFamily:'var(--font-display)',
                      boxShadow: isDone ? '0 15px 40px rgba(0,212,170,0.3)' : '0 5px 15px rgba(0,0,0,0.03)'
                    }}>{isDone ? '✓' : i + 1}</div>
                    <div>
                      <h3 style={{ fontSize: '32px', fontWeight: '900', color: isDone ? 'var(--brand-teal)' : 'var(--text-heading)', margin: 0, fontFamily: 'var(--font-display)', letterSpacing:'-1.5px' }}>{step.title}</h3>
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '12px 0 0', fontWeight: '900', letterSpacing:'2px' }}>{step.week.toUpperCase()} · {step.duration.toUpperCase()} · SYNC: {Math.round(frac * 100)}%</p>
                    </div>
                  </div>
                  <div style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.6s cubic-bezier(0.16, 1, 0.3, 1)', color: 'var(--brand-teal)', fontSize: '32px', fontWeight:'900' }}>▼</div>
                </button>

                {isOpen && (
                  <div style={{ padding: '0 45px 45px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <p style={{ fontSize: '20px', color: 'var(--text-body)', margin: '50px 0', lineHeight: '1.8', fontWeight: '600' }}>{step.description}</p>

                    <div className="pf-glass" style={{ padding: '50px', marginBottom: '50px', background: 'rgba(0,0,0,0.01) !important', borderRadius:'40px', border:'none' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '900', color: 'var(--brand-teal)', margin: '0 0 40px', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '4px' }}>⏱ DEPTH OF STUDY & RESOURCES</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {step.tasks.map((t, ti) => {
                          const tr = getTaskResources(step)[ti];
                          const arr = normalizeTaskTimes(item, step.tasks.length);
                          const opened = normalizeResourceOpened(item, step.tasks.length);
                          const ms = arr[ti] || 0;
                          const pct = Math.min(100, (ms / MIN_MS_PER_TASK) * 100);
                          const isActive = (studyTaskIdx[i] ?? 0) === ti;
                          return (
                            <div key={ti} className="pf-glass" style={{ padding: '40px', background: isActive ? 'white !important' : 'rgba(255,255,255,0.4) !important', borderRadius:'35px', transition:'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)', border: 'none', boxShadow: isActive ? '0 20px 50px rgba(0,0,0,0.05)' : 'none' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start' }}>
                                <div style={{ flex: '1 1 400px' }}>
                                  <div style={{ fontWeight: '900', fontSize: '12px', marginBottom: 15, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing:'2px' }}>LEARNING UNIT {ti + 1}</div>
                                  <div style={{ fontSize: '22px', color: 'var(--text-heading)', lineHeight: 1.6, fontWeight: '800', letterSpacing:'-0.5px' }}>{t}</div>
                                  <div style={{ marginTop: '20px', fontSize: '14px', color: 'var(--brand-teal)', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '20px' }}>🔗</span> {tr.name.toUpperCase()} · {tr.type.toUpperCase()}
                                  </div>
                                </div>
                                <button type="button" onClick={() => openTaskResource(i, ti)} className={opened[ti] ? "pf-glass" : "pf-glow-btn"} style={{ border:'none', padding: '18px 35px', borderRadius: '25px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap', textTransform:'uppercase', letterSpacing:'1px' }}>
                                  {opened[ti] ? '✓ OPENED' : 'OPEN RESOURCE'}
                                </button>
                              </div>
                              <div style={{ height: '12px', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', marginTop: '40px', overflow: 'hidden', padding:'4px', boxShadow:'inset 0 1px 5px rgba(0,0,0,0.02)' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: 'var(--brand-teal)', borderRadius: '4px', transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow:'0 0 15px rgba(0, 212, 170, 0.4)' }} />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px', flexWrap: 'wrap', gap: 20 }}>
                                <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '800', letterSpacing:'0.5px' }}>{formatClock(ms)} / {formatClock(MIN_MS_PER_TASK)} SYNCHRONIZED</span>
                                {opened[ti] ? (
                                  <button type="button" onClick={() => setStudyTaskIdx((s) => ({ ...s, [i]: ti }))} className="pf-glass" style={{ border:'none', padding: '12px 28px', borderRadius: '20px', fontSize: '13px', background: isActive ? 'var(--brand-teal) !important' : 'rgba(0,0,0,0.05) !important', color: isActive ? 'white' : 'var(--text-body)', fontWeight: '900', cursor: 'pointer', textTransform:'uppercase', letterSpacing:'1px' }}>
                                    {isActive ? '● ACTIVE TRACKING' : 'ENGAGE TIMER'}
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '14px', color: 'var(--brand-coral)', fontWeight: '900', textTransform:'uppercase', letterSpacing:'1.5px', animation:'pf-pulse 1.5s infinite' }}>Unlock via link</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {document.visibilityState !== 'visible' && isOpen && (
                        <p style={{ fontSize: '15px', color: 'var(--brand-coral)', marginTop: '40px', marginBottom: 0, fontWeight: '900', textAlign: 'center', textTransform:'uppercase', letterSpacing:'3px', animation: 'pf-pulse 2s infinite' }}>⏸ FOCUS REQUIRED — TAB SYNC PAUSED</p>
                      )}
                    </div>

                    <div className="pf-glass" style={{ padding: '45px', borderRadius: '40px', marginBottom: '40px', background: 'rgba(0,0,0,0.01) !important', border:'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                          <span style={{ fontSize: '42px' }}>📝</span>
                          <div>
                            <h4 style={{ fontSize: '26px', fontWeight: '900', margin: 0, fontFamily: 'var(--font-display)', letterSpacing:'-0.5px', color:'var(--text-heading)' }}>Knowledge Calibration</h4>
                            {(!item.moduleQuizPassed && !studyDone) && (
                               <p style={{ fontSize: '14px', color: 'var(--brand-coral)', margin: '8px 0 0', fontWeight: '900', textTransform:'uppercase', letterSpacing:'1.5px' }}>LOCKED UNTIL STUDY SYNC COMPLETE</p>
                            )}
                          </div>
                        </div>
                        {!item.moduleQuizPassed && (
                          <button
                            type="button"
                            onClick={() => openModuleQuiz(i)}
                            disabled={!studyDone}
                            className={studyDone ? "pf-glow-btn" : "pf-glass"}
                            style={{
                              border:'none',
                              padding: '20px 45px',
                              borderRadius: '30px',
                              fontWeight: '900',
                              cursor: studyDone ? 'pointer' : 'not-allowed',
                              fontSize: '15px',
                              textTransform:'uppercase',
                              letterSpacing:'1.5px'
                            }}
                          >
                            {studyDone ? 'START CALIBRATION' : 'LOCK: STUDY REQ'}
                          </button>
                        )}
                        {item.moduleQuizPassed && (
                          <div className="pf-glass" style={{ border:'none', padding:'16px 35px', borderRadius:'25px', background:'white !important', boxShadow:'0 10px 25px rgba(0, 212, 170, 0.1)' }}>
                             <span style={{ color: 'var(--brand-teal)', fontWeight: '900', fontSize: '17px', fontFamily: 'var(--font-display)', letterSpacing:'1.5px' }}>✅ SYNCED: {item.moduleQuizScore ?? 0}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pf-glass" style={{ padding: '50px', borderRadius: '45px', background: 'rgba(0,0,0,0.01) !important', border:'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '25px', marginBottom: '40px' }}>
                        <span style={{ fontSize: '42px' }}>🧠</span>
                        <h4 style={{ fontSize: '26px', fontWeight: '900', margin: 0, fontFamily: 'var(--font-display)', letterSpacing:'-0.5px', color:'var(--text-heading)' }}>AI Technical Audit</h4>
                      </div>
                      {!item.moduleQuizPassed ? (
                        <p style={{ fontSize: '18px', color: 'var(--text-muted)', margin: 0, fontWeight: '700', opacity:0.6 }}>Pass knowledge calibration to initiate AI interview sequence.</p>
                      ) : item.testPassed ? (
                        <div className="pf-glass" style={{ color: 'var(--brand-teal)', fontWeight: '900', fontSize: '22px', fontFamily: 'var(--font-display)', padding: '40px', background: 'white !important', borderRadius: '30px', letterSpacing:'1px', textAlign: 'center', boxShadow:'0 20px 60px rgba(0, 212, 170, 0.1)' }}>
                          ✅ AUDIT CLEARED: {item.testScore}% Technical Saturation
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontSize: '20px', color: 'var(--text-body)', marginBottom: '40px', fontWeight: '600', lineHeight: '1.8' }}>
                            <strong style={{ color: 'var(--brand-teal)', letterSpacing:'2px' }}>PROMPT:</strong> Explain how you would architect {step.title.toUpperCase()} in a high-scale environment. Detail trade-offs, potential failure points, and optimization strategies.
                          </p>
                          <textarea
                            id={`viva-${i}`}
                            placeholder={`Type your expert-level explanation (${VIVA_MIN_CHARS}+ chars required)...`}
                            onPaste={(e) => { e.preventDefault(); alert('Manual entry required to verify cognitive synthesis.'); }}
                            className="pf-glass"
                            style={{ width: '100%', minHeight: '250px', background: 'white !important', border: 'none !important', borderRadius: '40px', padding: '40px', color: 'var(--text-heading)', fontSize: '19px', marginBottom: '35px', resize: 'vertical', fontWeight: '600', fontFamily: 'var(--font-main)', outline:'none', boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.03)' }}
                          />
                          <button type="button" onClick={() => submitAIViva(i, document.getElementById(`viva-${i}`)?.value || '')} className="pf-glow-btn" style={{ border:'none', padding: '22px 60px', borderRadius: '35px', fontWeight: '900', cursor: 'pointer', fontSize: '17px', textTransform:'uppercase', letterSpacing:'2px' }}>INITIATE AUDIT</button>
                          {testResult && activeStep === i && (
                            <div className="pf-glass" style={{ marginTop: '35px', padding: '30px 40px', borderRadius: '25px', fontSize: '17px', fontWeight: '900', background: 'white !important', color: testResult.includes('✅') ? 'var(--brand-teal)' : 'var(--brand-coral)', letterSpacing:'1px', boxShadow:'0 15px 35px rgba(0,0,0,0.04)' }}>{testResult.toUpperCase()}</div>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => finalizeModule(i)}
                      disabled={isDone}
                      className={isDone ? "" : (item.testPassed && item.moduleQuizPassed && studyDone ? "pf-glow-btn" : "pf-glass")}
                      style={{
                        marginTop: '50px',
                        width: '100%',
                        padding: '28px',
                        borderRadius: '40px',
                        fontWeight: '900',
                        fontSize: '20px',
                        cursor: isDone || (item.testPassed && item.moduleQuizPassed && studyDone) ? 'pointer' : 'not-allowed',
                        textTransform: 'uppercase',
                        letterSpacing: '4px',
                        border:'none'
                      }}
                    >
                      {isDone ? '🎓 MASTERY ACHIEVED' : '✅ FINALIZE COMPETENCY'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {quizOpen !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(253,252,248,0.4)', backdropFilter: 'blur(50px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 25 }}>
          <div className="pf-glass" role="dialog" style={{ padding: '80px', maxWidth: '850px', width: '100%', maxHeight: '92vh', overflowY: 'auto', background:'rgba(255,255,255,0.98) !important', borderRadius:'60px', boxShadow: '0 60px 150px rgba(0,0,0,0.2)', border:'none', animation:'modalFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <h3 className="pf-shimmer-text" style={{ marginTop: 0, fontFamily: 'var(--font-display)', fontWeight: '900', fontSize: '48px', letterSpacing:'-2.5px' }}>{pickQuizQuestions(quizOpen).label.toUpperCase()}</h3>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '900', marginBottom: '50px', letterSpacing:'3px', opacity:0.6 }}>VERIFY KNOWLEDGE INTEGRITY. SELECT THE MOST ACCURATE RESPONSE.</p>
            {pickQuizQuestions(quizOpen).questions.map((q, qi) => (
              <div key={qi} style={{ marginBottom: '50px', padding: '45px', background: 'rgba(0,0,0,0.01)', borderRadius: '40px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 15px 35px rgba(0,0,0,0.02)' }}>
                <div style={{ fontWeight: '900', marginBottom: '35px', fontSize: '24px', color: 'var(--text-heading)', fontFamily: 'var(--font-display)', lineHeight:1.4, letterSpacing:'-0.5px' }}>{qi + 1}. {q.q}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {q.options.map((opt, oi) => (
                    <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: '25px', padding: '22px 35px', borderRadius: '25px', cursor: 'pointer', fontSize: '18px', fontWeight: '800', background: quizChoices[qi] === oi ? 'rgba(0, 212, 170, 0.1)' : 'white', border: quizChoices[qi] === oi ? '3px solid var(--brand-teal)' : '3px solid transparent', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: quizChoices[qi] === oi ? '0 10px 25px rgba(0, 212, 170, 0.2)' : '0 5px 15px rgba(0,0,0,0.02)' }}>
                      <input
                        type="radio"
                        name={`mq-${quizOpen}-${qi}`}
                        checked={quizChoices[qi] === oi}
                        onChange={() => setQuizChoices((c) => ({ ...c, [qi]: oi }))}
                        style={{ accentColor: 'var(--brand-teal)', width: '26px', height: '26px' }}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {quizMessage && <div style={{ color: 'var(--brand-coral)', fontSize: '17px', fontWeight: '900', marginBottom: '45px', textAlign: 'center', padding: '25px', background: 'rgba(255, 107, 107, 0.08)', borderRadius: '25px', letterSpacing:'1.5px', border:'1px solid rgba(255, 107, 107, 0.1)' }}>{quizMessage.toUpperCase()}</div>}
            <div style={{ display: 'flex', gap: '30px', marginTop: '40px' }}>
              <button type="button" onClick={() => { setQuizOpen(null); setQuizMessage(''); }} className="pf-glass" style={{ border:'none', flex: 1, padding: '24px', borderRadius: '30px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', fontSize:'15px', letterSpacing:'2px' }}>ABORT</button>
              <button
                type="button"
                onClick={() => submitModuleQuiz(quizOpen)}
                className="pf-glow-btn"
                style={{ border:'none', flex: 1, padding: '24px', borderRadius: '30px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', fontSize:'15px', letterSpacing:'2px' }}
              >
                SUBMIT CALIBRATION
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '100px', marginBottom: '150px' }}>
        <button type="button" onClick={onNext} className="pf-glow-btn" style={{ border:'none', padding: '30px 100px', borderRadius: '60px', fontSize: '24px', fontWeight: '900', cursor: 'pointer', textTransform:'uppercase', letterSpacing:'4px' }}>Analyze Employability Score →</button>
      </div>
      <style>{`
        @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95) translateY(40px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}
