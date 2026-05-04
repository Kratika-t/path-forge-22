import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;
let activeApiKey = '';
let activeModelName = '';

export function getGeminiApiKey() {
  const envKey = (process.env.REACT_APP_GEMINI_API_KEY || '').trim();
  if (envKey) return envKey;
  try {
    const stored = (localStorage.getItem('PATHFORGE_GEMINI_API_KEY') || '').trim();
    return stored;
  } catch {
    return '';
  }
}

export function hasGeminiApiKey() {
  return Boolean(getGeminiApiKey());
}

export function setGeminiApiKey(key) {
  const clean = (key || '').trim();
  try {
    if (clean) localStorage.setItem('PATHFORGE_GEMINI_API_KEY', clean);
    else localStorage.removeItem('PATHFORGE_GEMINI_API_KEY');
  } catch {
    // ignore storage failures (e.g., blocked storage)
  }
  // Reset the cached model so a newly provided key takes effect immediately.
  genAI = null;
  model = null;
  activeApiKey = '';
  activeModelName = '';
}

export function getGeminiModelName() {
  const envModel = (process.env.REACT_APP_GEMINI_MODEL || '').trim();
  if (envModel) return envModel;
  try {
    const stored = (localStorage.getItem('PATHFORGE_GEMINI_MODEL') || '').trim();
    if (stored) return stored;
  } catch {
    // ignore
  }
  // Stable alias that tracks the latest "Flash" model.
  return 'gemini-flash-latest';
}

export function setGeminiModelName(modelName) {
  const clean = (modelName || '').trim();
  try {
    if (clean) localStorage.setItem('PATHFORGE_GEMINI_MODEL', clean);
    else localStorage.removeItem('PATHFORGE_GEMINI_MODEL');
  } catch {
    // ignore storage failures
  }
  genAI = null;
  model = null;
  activeApiKey = '';
  activeModelName = '';
}

function getModel() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.warn('Gemini API key not found. Set REACT_APP_GEMINI_API_KEY in your .env file (or provide it in-app).');
    return null;
  }
  const desiredModelName = getGeminiModelName();
  if (!model || activeApiKey !== apiKey || activeModelName !== desiredModelName) {
    activeApiKey = apiKey;
    activeModelName = desiredModelName;
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: desiredModelName });
  }
  return model;
}

// ─── 1. RESUME ANALYSIS ───────────────────────────────────────────────────────
// Analyzes resume text content and returns a structured report
export async function analyzeResumeWithGemini(resumeText) {
  const m = getModel();
  if (!m) return null;

  const prompt = `
You are an expert career AI at PathForge, a platform that maps student employability.

Analyze this resume content and return a JSON response ONLY (no markdown, no extra text):
{
  "skillTitle": "the primary tech domain (e.g. Frontend Development, Data Science, Backend Development, Mobile Development, Cyber Security, Cloud Computing, UI/UX Design)",
  "detectedStack": ["list", "of", "detected", "technologies"],
  "hasExperience": true/false,
  "hasEducation": true/false,
  "hasProjects": true/false,
  "hasCertifications": true/false,
  "readinessLevel": "Industry Ready OR Rising Talent",
  "readinessPercent": number between 20-85,
  "whyThisScore": ["reason 1", "reason 2", "reason 3", "reason 4", "reason 5"],
  "keywordScore": number of professional indicators found,
  "isFakeResume": true/false,
  "fraudReason": "if fake, explain why, otherwise empty string"
}

Resume Content:
${resumeText.substring(0, 4000)}
`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    // Strip markdown code blocks if present
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('Gemini resume analysis failed:', err);
    return null;
  }
}

// ─── 2. AI MENTOR CHAT ────────────────────────────────────────────────────────
// Context-aware mentor that knows the user's skill domain and progress
export async function askAIMentor(userMessage, userContext = {}) {
  const m = getModel();
  if (!m) return "I'm currently offline. Please check your Gemini API key in your .env file.";

  const { skillTitle = 'Software Development', level = 'Beginner', moduleName = '' } = userContext;

  const prompt = `
You are PathForge's AI Career Mentor — a senior software engineer and career coach.
The student you are mentoring has the following profile:
- Primary Skill: ${skillTitle}
- Current Level: ${level}
- Currently studying: ${moduleName || 'general topics'}

Respond to their question in a helpful, encouraging, and concise way (max 3-4 sentences).
Give specific, actionable advice relevant to their skill domain.
Do NOT use markdown formatting. Respond in plain conversational text.

Student's question: "${userMessage}"
`;

  try {
    const result = await m.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error('Gemini mentor chat failed:', err);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}

// ─── 3. AI VIVA EVALUATION ────────────────────────────────────────────────────
// Evaluates a student's explanation of a technical concept
export async function evaluateVivaAnswer(question, studentAnswer, topic) {
  const m = getModel();
  if (!m) return { passed: false, score: 0, feedback: 'AI evaluation offline. Please check API key.' };

  const prompt = `
You are a strict but fair technical interviewer at PathForge evaluating a student's understanding.

Topic: ${topic}
Question asked: "${question}"
Student's answer: "${studentAnswer}"

Evaluate and return JSON ONLY (no markdown):
{
  "passed": true/false,
  "score": number between 0-100,
  "feedback": "2-3 sentence specific feedback on what was correct or incorrect",
  "strongPoints": ["point 1", "point 2"],
  "improvementAreas": ["area 1", "area 2"]
}

Rules:
- Score >= 60 means passed
- Be strict — vague or copied-sounding answers should score low
- Check for conceptual understanding, not just keyword matching
`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('Gemini viva evaluation failed:', err);
    return { passed: false, score: 0, feedback: 'Evaluation error. Please try again.' };
  }
}

// ─── 4. CAREER DNA MAPPING ────────────────────────────────────────────────────
// Maps beginner quiz answers to the best skill path
export async function mapCareerDNA(answers) {
  const m = getModel();
  if (!m) return { skillTitle: 'Frontend Development', reason: 'Default mapping (AI offline)' };

  const prompt = `
You are PathForge's Career DNA Engine. Based on these quiz answers from a student, determine the best tech career path for them.

Their answers:
- Problem-solving preference: "${answers[0] || 'Not specified'}"
- Favorite type of tool: "${answers[1] || 'Not specified'}"
- Career goal: "${answers[2] || 'Not specified'}"

Return JSON ONLY:
{
  "skillTitle": "one of: Frontend Development, Backend Development, Data Science, Artificial Intelligence, Mobile Development, Cyber Security, UI/UX Design, Cloud Computing, Full Stack Development",
  "reason": "one sentence explaining why this path fits them",
  "alternativePath": "a second option they might enjoy"
}
`;

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('Gemini career DNA mapping failed:', err);
    return { skillTitle: 'Frontend Development', reason: 'Default mapping applied.' };
  }
}

// ─── 5. AI INDUSTRY AUDIT ───────────────────────────────────────────────────
// Performs a deep scan of user's current progress and profile
export async function performIndustryAudit(userData) {
  const m = getModel();
  if (!m) return null;

  const context = {
    skill: userData.skill?.title || 'Unknown',
    modulesCompleted: userData.learningProgress?.completedCount || 0,
    totalModules: userData.learningProgress?.total || 6,
    currentScore: userData.learningProgress?.percent || 0,
    resumeSignals: userData.auditReport?.signals || {}
  };

  const prompt = `
You are PathForge's Senior Industry Auditor. Perform a deep career audit for this student.

Current Student Context:
- Domain: ${context.skill}
- Progress: ${context.modulesCompleted}/${context.totalModules} modules verified
- Current Index: ${context.currentScore}%
- Resume Signals: ${JSON.stringify(context.resumeSignals)}

Evaluate if their "Industry Readiness" should be upgraded and provide a verdict.
Return JSON ONLY (no markdown):
{
  "verdict": "e.g. READY FOR INTERNSHIPS, SKILL GAP DETECTED, or INDUSTRY ELITE",
  "readinessPercent": updated number 0-100,
  "analysis": "2 sentence professional analysis of their current standing",
  "criticalMissingSkill": "one specific tech they should learn next",
  "hiringLikelihood": "percentage 0-100"
}
`;

  const parseJsonLoosely = (rawText) => {
    const clean = String(rawText || '').replace(/```json|```/g, '').trim();
    try {
      return JSON.parse(clean);
    } catch {
      const start = clean.indexOf('{');
      const end = clean.lastIndexOf('}');
      if (start >= 0 && end > start) {
        const slice = clean.slice(start, end + 1);
        return JSON.parse(slice);
      }
      throw new Error('AI response was not valid JSON.');
    }
  };

  try {
    const result = await m.generateContent(prompt);
    const text = result.response.text().trim();
    const data = parseJsonLoosely(text);
    return data && typeof data === 'object' ? data : null;
  } catch (err) {
    console.error('Gemini industry audit failed:', err);
    return {
      error: true,
      message: err?.message || 'AI Audit failed. Please verify your Gemini API key and try again.'
    };
  }
}