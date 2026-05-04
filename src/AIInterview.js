import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PREDEFINED_FIELDS = [
  "Frontend Developer",
  "Backend Engineer",
  "Data Scientist",
  "UI/UX Designer",
  "Product Manager",
  "Full Stack Engineer",
  "Other"
];

export default function AIInterview({ userData, onBack, onComplete }) {
  // Setup Phase
  const [setupPhase, setSetupPhase] = useState(true);
  const [selectedField, setSelectedField] = useState('');
  const [customField, setCustomField] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  // Recording / Transcription States
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [timer, setTimer] = useState(60); 
  const [stream, setStream] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [results, setResults] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
  // Integrity States
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [personCount, setPersonCount] = useState(1);
  const [securityViolation, setSecurityViolation] = useState(null);
  const [boundingBox, setBoundingBox] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyzerRef = useRef(null);
  const recognitionRef = useRef(null);
  const prevMassesRef = useRef({ l: 0, r: 0 });

  const targetField = selectedField === 'Other' ? customField : selectedField;
  const isFieldValid = targetField.length > 2 && /^[a-zA-Z\s]+$/.test(targetField);

  // TAB & WINDOW FOCUS LOCK
  useEffect(() => {
    const triggerViolation = () => {
      if (recording) handleViolation("🚫 SECURITY VIOLATION: Unauthorized window switch or focus loss detected.");
    };
    window.addEventListener("blur", triggerViolation);
    document.addEventListener("visibilitychange", () => { if (document.hidden) triggerViolation(); });
    return () => {
      window.removeEventListener("blur", triggerViolation);
      document.removeEventListener("visibilitychange", triggerViolation);
    };
    // eslint-disable-next-line
  }, [recording]);

  // Speech Recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      let finalStr = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalStr += event.results[i][0].transcript;
      }
      if (finalStr) setCurrentTranscript(prev => prev + ' ' + finalStr);
    };
    recognitionRef.current = recognition;
  }, []);

  // Kill Stream Utility
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    recognitionRef.current?.stop();
  };

  // Start Camera & Audio Analysis
  useEffect(() => {
    if (setupPhase) return;
    async function startCam() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyzer = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(s);
        source.connect(analyzer);
        analyzer.fftSize = 256;
        audioContextRef.current = audioContext;
        analyzerRef.current = analyzer;
        
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        const checkNoise = () => {
          if (!analyzerRef.current) return;
          analyzerRef.current.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setNoiseLevel(Math.round(avg * 1.5));
          requestAnimationFrame(checkNoise);
        };
        checkNoise();
      } catch (err) { alert("Camera access denied."); }
    }
    startCam();
    return () => stopStream();
    // eslint-disable-next-line
  }, [setupPhase]);

  // SKIN-SENTINEL ENTITY SCANNER WITH BOUNDING BOX
  useEffect(() => {
    if (setupPhase || !videoRef.current || results) return;

    const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
    const interval = setInterval(() => {
      if (!videoRef.current) return;

      canvasRef.current.width = 160;
      canvasRef.current.height = 120;
      ctx.drawImage(videoRef.current, 0, 0, 160, 120);
      const frame = ctx.getImageData(0, 0, 160, 120).data;
      
      let curL = 0, curR = 0;
      let minX = 160, maxX = 0, minY = 120, maxY = 0;
      let skinDetected = false;

      for (let i = 0; i < frame.length; i += 4) { 
        const r = frame[i];
        const g = frame[i+1];
        const b = frame[i+2];
        const x = (i/4) % 160;
        const y = Math.floor((i/4) / 160);
        
        const isSkin = (r > 105 && g > 55 && b > 35 && r > g && r > b && (r - g) > 22);

        if (isSkin) {
           skinDetected = true;
           if (x < minX) minX = x;
           if (x > maxX) maxX = x;
           if (y < minY) minY = y;
           if (y > maxY) maxY = y;

           if (x < 55) curL++;
           else if (x > 105) curR++;
        }
      }

      if (skinDetected) {
        setBoundingBox({ x: (minX/160)*100, y: (minY/120)*100, w: ((maxX-minX)/160)*100, h: ((maxY-minY)/120)*100 });
      } else {
        setBoundingBox(null);
      }

      const lDelta = Math.abs(curL - prevMassesRef.current.l);
      const rDelta = Math.abs(curR - prevMassesRef.current.r);
      const isSecondPerson = (curL > 1500) || (curR > 1500) || (lDelta > 1200) || (rDelta > 1200);

      if (isSecondPerson) {
        setPersonCount(2);
        if (recording) handleViolation("👥 SECURITY TERMINATION: Unauthorized person detected.");
      } else {
        setPersonCount(1);
      }
      prevMassesRef.current = { l: curL, r: curR };
    }, 150); 

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [setupPhase, recording, results]);

  // Countdown Timer
  useEffect(() => {
    let interval;
    if (recording && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && recording) {
      nextQuestion();
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [recording, timer]);

  const handleViolation = (msg) => {
    stopRecording();
    setSecurityViolation(msg);
    setRecorded(false);
    stopStream();
  };

  const handleBack = () => {
    stopStream();
    onBack();
  };

  const generateQuestions = async () => {
    if (!isFieldValid) return;
    setAnalyzing(true);
    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY || localStorage.getItem('PATHFORGE_GEMINI_API_KEY');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Generate 5 high-quality technical interview questions for: ${targetField}. Return as plain list.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const qList = text.split('\n').filter(q => q.trim().length > 5).slice(0, 5);
      setQuestions(qList.length > 0 ? qList : ["Tell us about your background.", "Describe a complex bug.", "How do you handle scalability?", "What is your testing strategy?", "Explain a technical trade-off."]);
      setSetupPhase(false);
    } catch (e) {
      setQuestions(["Explain your technical background.", "Describe a complex bug.", "How do you handle scalability?", "What is your testing strategy?", "Explain a technical trade-off."]);
      setSetupPhase(false);
    } finally { setAnalyzing(false); }
  };

  const startRecording = () => {
    setRecording(true);
    setRecorded(false);
    setTimer(60);
    setCurrentTranscript('');
    setTranscripts([]);
    chunksRef.current = [];
    try { recognitionRef.current?.start(); } catch(e){}
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setVideoUrl(URL.createObjectURL(blob));
    };
    recorder.start();
  };

  const stopRecording = () => {
    setRecording(false);
    setRecorded(true);
    recognitionRef.current?.stop();
    if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
  };

  const nextQuestion = () => {
    setTranscripts(prev => [...prev, currentTranscript]);
    setCurrentTranscript('');
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setTimer(60);
    } else { stopRecording(); }
  };

  const analyzeInterview = async () => {
    setAnalyzing(true);
    try {
      const apiKey = process.env.REACT_APP_GEMINI_API_KEY || localStorage.getItem('PATHFORGE_GEMINI_API_KEY');
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const interviewContext = questions.map((q, i) => `Q: ${q}\nA: ${transcripts[i] || 'Silent'}`).join('\n\n');
      const prompt = `Perform a brutal technical audit of this ${targetField} interview. 
      STRICT RULES:
      - If answers are gibberish, empty, or unrelated, the rating MUST be 0.0/10.
      - Evaluate technical depth only.
      
      TRANSCRIPT:
      ${interviewContext}
      
      Return ONLY a valid JSON:
      {
        "rating": number (out of 10),
        "confidence": "string",
        "feelings": "string",
        "explanation": "brutal 1-sentence summary",
        "detailedJudgement": "A detailed 3-sentence technical audit.",
        "metrics": { "communication": number, "technical": number, "integrity": 100 }
      }`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleaned = text.replace(/```json|```/g, '').trim();
      setResults(JSON.parse(cleaned));
      stopStream();
    } catch (e) {
      setResults({ rating: 0.0, confidence: "None", feelings: "Silent", explanation: "Failed audit.", detailedJudgement: "No depth.", metrics: { communication: 0, technical: 0, integrity: 100 } });
      stopStream();
    } finally { setAnalyzing(false); }
  };

  if (setupPhase) {
    return (
      <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a0c,#1a1a1c)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
        <div style={{ maxWidth:'600px', width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', padding:'40px', borderRadius:'30px', textAlign:'center' }}>
          <div style={{ fontSize:'50px', marginBottom:'10px' }}>🎥</div>
          <h2 style={{ fontSize:'28px', fontWeight:'900', marginBottom:'15px' }}>Mock Interview Studio</h2>
          <p style={{ color:'rgba(255,255,255,0.6)', marginBottom:'30px' }}>Select your target field for a precise AI evaluation.</p>
          
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'10px', marginBottom:'25px' }}>
            {PREDEFINED_FIELDS.map(f => (
              <button 
                key={f}
                onClick={() => setSelectedField(f)}
                style={{ padding:'12px', borderRadius:'12px', background: selectedField === f ? '#FF6B35' : 'rgba(255,255,255,0.05)', border:'1px solid ' + (selectedField === f ? '#FF6B35' : 'rgba(255,255,255,0.1)'), color: selectedField === f ? 'white' : 'rgba(255,255,255,0.8)', cursor:'pointer', fontSize:'13px', fontWeight:'bold', transition:'all 0.2s' }}
              >
                {f}
              </button>
            ))}
          </div>

          {selectedField === 'Other' && (
            <input 
              type="text" 
              placeholder="Enter your field (e.g. DevOps Engineer)" 
              value={customField}
              onChange={(e) => setCustomField(e.target.value)}
              style={{ width:'100%', padding:'15px', borderRadius:'15px', background:'rgba(0,0,0,0.3)', border:'1px solid ' + (isFieldValid ? 'rgba(255,107,53,0.3)' : '#E74C3C'), color:'white', marginBottom:'20px', outline:'none' }}
            />
          )}

          <button 
            onClick={generateQuestions}
            disabled={!isFieldValid || analyzing}
            style={{ width:'100%', padding:'18px', borderRadius:'15px', background: isFieldValid ? '#FF6B35' : 'rgba(255,255,255,0.1)', color:'white', border:'none', fontWeight:'bold', cursor: isFieldValid ? 'pointer' : 'not-allowed' }}
          >
            {analyzing ? 'Initializing AI...' : 'Start Proctored Session ⚡'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0c', color:'white', padding:'40px 20px', fontFamily:'Arial, sans-serif' }}>
      
      <div style={{ display:'flex', alignItems:'center', gap:'16px', maxWidth:'1000px', margin:'0 auto 30px' }}>
        <button onClick={handleBack} style={{ background:'transparent', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.2)', padding:'8px 18px', borderRadius:'20px', cursor:'pointer' }}>← Back</button>
        <h1 style={{ color:'#FF6B35', fontSize:'22px', fontWeight:'bold', margin:0 }}>🎥 AI Mock Interview Studio</h1>
      </div>

      {securityViolation && (
        <div style={{ maxWidth:'1000px', margin:'0 auto 30px', background:'rgba(231,76,60,0.15)', border:'2px solid #E74C3C', borderRadius:'16px', padding:'20px', textAlign:'center', color:'#E74C3C' }}>
          <div style={{ fontSize:'24px', fontWeight:'bold' }}>⚠️ SECURITY TERMINATION</div>
          <p>{securityViolation}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop:'15px', background:'#E74C3C', color:'white', border:'none', padding:'8px 20px', borderRadius:'12px', cursor:'pointer' }}>Restart Session</button>
        </div>
      )}

      <div style={{ maxWidth:'1000px', margin:'0 auto', display:'grid', gridTemplateColumns: results ? '1fr 1.4fr' : '1fr', gap:'30px' }}>
        
        <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
          {!results && (
            <div style={{ background:'rgba(255,107,53,0.1)', border:'1px solid rgba(255,107,53,0.3)', padding:'25px', borderRadius:'20px', animation:'fadeIn 0.5s ease' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                <div style={{ fontSize:'12px', color:'#FF6B35', fontWeight:'800' }}>QUESTION {currentQIndex + 1} OF {questions.length}</div>
                {recording && <div style={{ fontSize:'14px', fontWeight:'900', color:'#E74C3C' }}>⏱️ {timer}s</div>}
              </div>
              <div style={{ fontSize:'20px', fontWeight:'700', lineHeight:'1.5' }}>{questions[currentQIndex]}</div>
            </div>
          )}

          <div style={{ position:'relative', borderRadius:'24px', overflow:'hidden', background:'#000', border:'1px solid rgba(255,255,255,0.1)' }}>
            {!recorded ? (
              <>
                <video ref={videoRef} autoPlay muted playsInline style={{ width:'100%', display:'block', filter: securityViolation ? 'blur(10px) grayscale(1)' : 'none' }} />
                {boundingBox && !securityViolation && (
                  <div style={{ 
                    position:'absolute', 
                    border:'2px solid ' + (personCount > 1 ? '#E74C3C' : '#FF6B35'), 
                    left: `${boundingBox.x}%`, 
                    top: `${boundingBox.y}%`, 
                    width: `${boundingBox.w}%`, 
                    height: `${boundingBox.h}%`, 
                    transition: 'all 0.15s ease-out',
                    boxShadow: '0 0 15px ' + (personCount > 1 ? 'rgba(231,76,60,0.5)' : 'rgba(255,107,53,0.3)'),
                    borderRadius: '8px',
                    pointerEvents: 'none'
                  }}>
                    <div style={{ position:'absolute', top:'-25px', left:0, background: personCount > 1 ? '#E74C3C' : '#FF6B35', color:'white', fontSize:'10px', padding:'2px 8px', borderRadius:'4px', fontWeight:'bold', whiteSpace:'nowrap' }}>
                      {personCount > 1 ? '⚠️ MULTIPLE ENTITIES' : '🎯 TARGET LOCKED'}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <video src={videoUrl} controls style={{ width:'100%', display:'block' }} />
            )}

            {recording && currentTranscript && (
              <div style={{ position:'absolute', bottom:20, left:20, right:20, background:'rgba(0,0,0,0.8)', padding:'15px', borderRadius:'15px', border:'1px solid rgba(255,255,255,0.1)', backdropFilter:'blur(10px)' }}>
                <div style={{ fontSize:'10px', color:'#FF6B35', fontWeight:'800', marginBottom:'5px' }}>LIVE SPEECH CAPTURE</div>
                <div style={{ fontSize:'13px', color:'white', fontStyle:'italic' }}>"...{currentTranscript.slice(-120)}"</div>
              </div>
            )}

            {!results && (
              <div style={{ position:'absolute', top:20, left:20, display:'flex', gap:'10px' }}>
                <div style={{ background:'rgba(0,0,0,0.6)', padding:'6px 12px', borderRadius:'10px', fontSize:'11px', border:'1px solid rgba(255,255,255,0.2)', backdropFilter:'blur(5px)' }}>
                  👤 {personCount} PERSON DETECTED
                </div>
                <div style={{ background:'rgba(0,0,0,0.6)', padding:'6px 12px', borderRadius:'10px', fontSize:'11px', border:'1px solid rgba(255,255,255,0.2)', backdropFilter:'blur(5px)' }}>
                  🔊 NOISE: <span style={{ color: noiseLevel > 65 ? '#E74C3C' : '#2ECC71' }}>{noiseLevel > 65 ? 'LOUD' : 'OPTIMAL'}</span>
                </div>
              </div>
            )}
          </div>

          {!recording && !recorded && !securityViolation && (
            <button onClick={startRecording} style={{ width:'100%', padding:'18px', borderRadius:'15px', background:'#FF6B35', color:'white', border:'none', fontWeight:'bold', fontSize:'16px', cursor:'pointer' }}>Start Interview</button>
          )}
          {recording && (
             <button onClick={nextQuestion} style={{ width:'100%', padding:'18px', borderRadius:'15px', background:'#3498DB', color:'white', border:'none', fontWeight:'bold', fontSize:'16px', cursor:'pointer' }}>
               {currentQIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
             </button>
          )}
          {recorded && !results && !analyzing && (
            <button onClick={analyzeInterview} style={{ width:'100%', padding:'18px', borderRadius:'15px', background:'#2ECC71', color:'white', border:'none', fontWeight:'bold', fontSize:'16px', cursor:'pointer' }}>Generate AI Scorecard</button>
          )}
          {analyzing && (
            <div style={{ textAlign:'center', padding:'30px', background:'rgba(255,255,255,0.03)', borderRadius:'24px' }}>
              <div style={{ fontSize:'40px', marginBottom:'15px' }}>🧠</div>
              <div style={{ fontWeight:'bold', color:'#3498DB' }}>GEMINI AI IS PERFORMING TECHNICAL AUDIT...</div>
            </div>
          )}
        </div>

        {results && (
          <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:'24px', padding:'35px', border:'1px solid #2ECC71', animation:'fadeIn 0.5s ease' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px' }}>
              <h3 style={{ fontSize:'24px', fontWeight:'900' }}>AI Technical Scorecard</h3>
              <div style={{ fontSize:'32px', fontWeight:'900', color: results.rating > 5 ? '#2ECC71' : '#E74C3C' }}>{results.rating}/10</div>
            </div>
            <div style={{ marginBottom:'30px' }}>
              <div style={{ fontSize:'11px', color:'#FF6B35', fontWeight:'900', textTransform:'uppercase', marginBottom:'10px' }}>Detailed Technical Audit</div>
              <p style={{ fontSize:'14px', lineHeight:'1.7', color:'rgba(255,255,255,0.8)', background:'rgba(255,107,53,0.05)', padding:'20px', borderRadius:'15px', borderLeft:'4px solid #FF6B35' }}>{results.detailedJudgement}</p>
            </div>
            <button onClick={handleBack} style={{ width:'100%', marginTop:'35px', padding:'18px', borderRadius:'15px', background:'rgba(255,255,255,0.1)', color:'white', border:'none', fontWeight:'bold', cursor:'pointer' }}>Return to Dashboard</button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
