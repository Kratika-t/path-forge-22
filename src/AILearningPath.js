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

export default function AILearningPath({ userData, onBack, onNext, onProgressUpdate }) {
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
    return () => clearInterval(id);
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: 'white', padding: '30px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
          <button type="button" onClick={onBack} style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer' }}>← Back</button>
          <h1 style={{ color: '#FF6B35', fontSize: '22px', fontWeight: 'bold' }}>⚡ PathForge</h1>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.4)', borderRadius: '20px', padding: '6px 18px', marginBottom: '16px', fontSize: '13px', color: '#FF6B35' }}>
            🤖 AI-Driven Adaptive Roadmap · Time-verified study
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>{name}&apos;s Learning Journey</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>{skillIcon} {skillName} · 🎯 {goal.split(' ').slice(1).join(' ')}</p>
        </div>

        <div style={{ background: 'rgba(52,152,219,0.1)', border: '1px solid rgba(52,152,219,0.25)', borderRadius: '14px', padding: '14px 18px', marginBottom: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
          <strong style={{ color: '#3498DB' }}>How completion works:</strong> for each task, click <strong>Open resource</strong> to visit its own link (3 tasks → 3 links). The timer for that task starts only after its link was opened; time accrues when you are back on <strong>this PathForge tab</strong> with the module expanded (other tabs pause the timer). Need <strong>{MIN_MS_PER_TASK / 60000} minutes</strong> per task, then quiz, AI viva, and <strong>Finalize module</strong>.
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>{doneCount} of {steps.length} modules mastered</span>
            <span style={{ color: '#FF6B35', fontWeight: 'bold' }}>{progress}%</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #FF6B35, #FF9A6C)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {steps.map((step, i) => {
            const item = moduleProgress[i] || {};
            const isDone = Boolean(item.completed);
            const isOpen = activeStep === i;
            const frac = studyProgressFraction(item, step);
            const studyDone = studyRequirementsMet(item, step);

            return (
              <div key={i} style={{ background: isDone ? 'rgba(46,204,113,0.05)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isDone ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '20px', overflow: 'hidden' }}>
                <button type="button" onClick={() => setActiveStep(isOpen ? null : i)} style={{ width: '100%', padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', color: 'inherit', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isDone ? '#2ECC71' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isDone ? 'white' : 'rgba(255,255,255,0.4)', fontWeight: 'bold', fontSize: '14px' }}>{isDone ? '✓' : i + 1}</div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: isDone ? '#2ECC71' : 'white', margin: 0 }}>{step.title}</h3>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>{step.week} · {step.duration} · Study {Math.round(frac * 100)}%</p>
                    </div>
                  </div>
                  <div style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.3s', color: 'rgba(255,255,255,0.3)' }}>▼</div>
                </button>

                {isOpen && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', margin: '20px 0', lineHeight: '1.6' }}>{step.description}</p>

                    <div style={{ background: 'rgba(255,107,53,0.08)', border: '1px solid rgba(255,107,53,0.25)', borderRadius: '14px', padding: '16px', marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#FF6B35', margin: '0 0 12px' }}>⏱ Tasks &amp; resources (timer starts after each link)</h4>
                      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', marginBottom: '12px' }}>
                        Use <strong>Open resource</strong> to open the official reading for that task. The timer for that line unlocks only after you open its link. Come back to this tab and choose <strong>Use timer for this task</strong> so time counts while PathForge stays visible ({formatClock(MIN_MS_PER_TASK)} per task).
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {step.tasks.map((t, ti) => {
                          const tr = getTaskResources(step)[ti];
                          const arr = normalizeTaskTimes(item, step.tasks.length);
                          const opened = normalizeResourceOpened(item, step.tasks.length);
                          const ms = arr[ti] || 0;
                          const pct = Math.min(100, (ms / MIN_MS_PER_TASK) * 100);
                          const isActive = (studyTaskIdx[i] ?? 0) === ti;
                          return (
                            <div key={ti} style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${isActive ? 'rgba(255,107,53,0.55)' : 'rgba(255,255,255,0.12)'}`, background: 'rgba(0,0,0,0.18)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-start' }}>
                                <div style={{ flex: '1 1 200px' }}>
                                  <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: 6 }}>Task {ti + 1}</div>
                                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.45 }}>{t}</div>
                                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#3498DB' }}>📎 {tr.name} · {tr.type}</div>
                                </div>
                                <button type="button" onClick={() => openTaskResource(i, ti)} style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', background: opened[ti] ? 'rgba(46,204,113,0.2)' : '#3498DB', color: opened[ti] ? '#2ECC71' : 'white', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>{opened[ti] ? '✓ Opened' : '🔗 Open resource'}</button>
                              </div>
                              <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '10px' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: pct >= 99.5 ? '#2ECC71' : '#FF6B35', borderRadius: '2px' }} />
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap', gap: 8 }}>
                                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>{formatClock(ms)} / {formatClock(MIN_MS_PER_TASK)}</span>
                                {opened[ti] ? (
                                  <button type="button" onClick={() => setStudyTaskIdx((s) => ({ ...s, [i]: ti }))} style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', border: isActive ? '2px solid #FF6B35' : '1px solid rgba(255,255,255,0.2)', background: isActive ? 'rgba(255,107,53,0.15)' : 'transparent', color: 'white', cursor: 'pointer' }}>{isActive ? '● Timer on this task' : 'Use timer for this task'}</button>
                                ) : (
                                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>Open resource to unlock timer</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {document.visibilityState !== 'visible' && isOpen && (
                        <p style={{ fontSize: '12px', color: '#F39C12', marginTop: '12px', marginBottom: 0 }}>⏸ Timer paused — return to this PathForge tab for study time to count.</p>
                      )}
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '18px' }}>📝</span>
                          <h4 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0 }}>{pickQuizQuestions(i).label}</h4>
                        </div>
                        {!item.moduleQuizPassed && (
                          <button
                            type="button"
                            onClick={() => openModuleQuiz(i)}
                            disabled={!studyDone}
                            style={{
                              padding: '10px 18px',
                              borderRadius: '12px',
                              border: 'none',
                              fontWeight: 'bold',
                              cursor: studyDone ? 'pointer' : 'not-allowed',
                              background: studyDone ? '#9B59B6' : 'rgba(255,255,255,0.08)',
                              color: studyDone ? 'white' : 'rgba(255,255,255,0.35)',
                            }}
                          >
                            {studyDone ? 'Open verification quiz' : '🔒 Finish study time first'}
                          </button>
                        )}
                        {item.moduleQuizPassed && (
                          <span style={{ color: '#2ECC71', fontWeight: 'bold', fontSize: '13px' }}>✅ Quiz passed ({item.moduleQuizScore ?? 0}%)</span>
                        )}
                      </div>
                      {!item.moduleQuizPassed && !studyDone && (
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>Quiz unlocks when every task line reaches 100% focused time.</p>
                      )}
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '18px' }}>🧠</span>
                        <h4 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0 }}>AI Interactive Viva</h4>
                      </div>
                      {!item.moduleQuizPassed ? (
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>Pass the quiz above to unlock the viva.</p>
                      ) : item.testPassed ? (
                        <div style={{ color: '#2ECC71', fontWeight: 'bold', fontSize: '14px' }}>✅ Viva cleared: {item.testScore}% technical depth</div>
                      ) : (
                        <div>
                          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
                            Challenge: <strong>Explain how you would apply {step.title} in a real project (architecture, tradeoffs, pitfalls).</strong>
                          </p>
                          <textarea
                            id={`viva-${i}`}
                            placeholder={`Type your explanation (${VIVA_MIN_CHARS}+ chars). Paste is disabled.`}
                            onPaste={(e) => {
                              e.preventDefault();
                              alert('Anti-cheat: paste is disabled. Type your own explanation.');
                            }}
                            onCopy={(e) => e.preventDefault()}
                            onCut={(e) => e.preventDefault()}
                            onContextMenu={(e) => e.preventDefault()}
                            style={{ width: '100%', minHeight: '120px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: 'white', fontSize: '14px', marginBottom: '12px', resize: 'vertical' }}
                          />
                          <button type="button" onClick={() => submitAIViva(i, document.getElementById(`viva-${i}`)?.value || '')} style={{ background: '#FF6B35', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Submit for AI audit</button>
                          {testResult && activeStep === i && (
                            <p style={{ marginTop: '12px', fontSize: '13px', color: testResult.includes('✅') ? '#2ECC71' : '#E74C3C' }}>{testResult}</p>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => finalizeModule(i)}
                      disabled={isDone}
                      style={{
                        marginTop: '16px',
                        width: '100%',
                        padding: '14px',
                        background: isDone ? 'rgba(46,204,113,0.12)' : item.testPassed && item.moduleQuizPassed && studyDone ? '#2ECC71' : 'rgba(255,255,255,0.06)',
                        color: isDone ? '#2ECC71' : item.testPassed && item.moduleQuizPassed && studyDone ? 'white' : 'rgba(255,255,255,0.35)',
                        border: isDone ? '1px solid #2ECC71' : 'none',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        cursor: isDone || (item.testPassed && item.moduleQuizPassed && studyDone) ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {isDone ? '🎓 Module fully verified' : '✅ Finalize module (100% — requires study + quiz + viva)'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {quizOpen !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div
            role="dialog"
            style={{ background: '#1a1a2e', border: '1px solid rgba(155,89,182,0.5)', borderRadius: 20, padding: 28, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            onPaste={(e) => e.preventDefault()}
          >
            <h3 style={{ marginTop: 0, color: '#FF6B35' }}>{pickQuizQuestions(quizOpen).label}</h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Answer all. Submit is enabled after {QUIZ_MIN_READ_MS / 1000}s on this screen.</p>
            {pickQuizQuestions(quizOpen).questions.map((q, qi) => (
              <div key={qi} style={{ marginBottom: 18 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 14 }}>{qi + 1}. {q.q}</div>
                {q.options.map((opt, oi) => (
                  <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer', fontSize: 13 }}>
                    <input
                      type="radio"
                      name={`mq-${quizOpen}-${qi}`}
                      checked={quizChoices[qi] === oi}
                      onChange={() => setQuizChoices((c) => ({ ...c, [qi]: oi }))}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ))}
            {quizMessage && <p style={{ color: '#E74C3C', fontSize: 13 }}>{quizMessage}</p>}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="button" onClick={() => { setQuizOpen(null); setQuizMessage(''); }} style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: 'pointer' }}>Cancel</button>
              <button
                type="button"
                onClick={() => submitModuleQuiz(quizOpen)}
                style={{ padding: '12px 24px', borderRadius: 12, border: 'none', background: '#9B59B6', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Submit answers
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button type="button" onClick={onNext} style={{ background: '#FF6B35', color: 'white', border: 'none', padding: '16px 48px', borderRadius: '30px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer' }}>View Employability Score →</button>
      </div>
    </div>
  );
}
