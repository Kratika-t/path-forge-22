import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const skillNodes = {
  'Frontend Development': [
    { id: 'html',     label: 'HTML',        levels: ['basic','intermediate','advanced'] },
    { id: 'css',      label: 'CSS',         levels: ['basic','intermediate','advanced'] },
    { id: 'js',       label: 'JavaScript',  levels: ['intermediate','advanced'] },
    { id: 'react',    label: 'React',       levels: ['advanced'] },
    { id: 'tailwind', label: 'Tailwind',    levels: ['advanced'] },
    { id: 'git',      label: 'Git/GitHub',  levels: ['intermediate','advanced'] },
    { id: 'api',      label: 'REST APIs',   levels: ['advanced'] },
    { id: 'ts',       label: 'TypeScript',  levels: ['advanced'] },
  ],
  'Backend Development': [
    { id: 'node',    label: 'Node.js',    levels: ['basic','intermediate','advanced'] },
    { id: 'express', label: 'Express',    levels: ['intermediate','advanced'] },
    { id: 'mongo',   label: 'MongoDB',    levels: ['intermediate','advanced'] },
    { id: 'sql',     label: 'SQL',        levels: ['basic','intermediate','advanced'] },
    { id: 'rest',    label: 'REST APIs',  levels: ['intermediate','advanced'] },
    { id: 'auth',    label: 'Auth/JWT',   levels: ['advanced'] },
    { id: 'docker',  label: 'Docker',     levels: ['advanced'] },
    { id: 'git',     label: 'Git/GitHub', levels: ['basic','intermediate','advanced'] },
  ],
  'Artificial Intelligence': [
    { id: 'python',     label: 'Python',       levels: ['basic','intermediate','advanced'] },
    { id: 'numpy',      label: 'NumPy',        levels: ['intermediate','advanced'] },
    { id: 'pandas',     label: 'Pandas',       levels: ['intermediate','advanced'] },
    { id: 'sklearn',    label: 'Scikit-Learn', levels: ['advanced'] },
    { id: 'tensorflow', label: 'TensorFlow',   levels: ['advanced'] },
    { id: 'nlp',        label: 'NLP',          levels: ['advanced'] },
    { id: 'kaggle',     label: 'Kaggle',       levels: ['intermediate','advanced'] },
    { id: 'dl',         label: 'Deep Learning',levels: ['advanced'] },
  ],
  'Data Science': [
    { id: 'python', label: 'Python',     levels: ['basic','intermediate','advanced'] },
    { id: 'sql',    label: 'SQL',        levels: ['basic','intermediate','advanced'] },
    { id: 'pandas', label: 'Pandas',     levels: ['intermediate','advanced'] },
    { id: 'viz',    label: 'Matplotlib', levels: ['intermediate','advanced'] },
    { id: 'tableau',label: 'Tableau',    levels: ['advanced'] },
    { id: 'stats',  label: 'Statistics', levels: ['advanced'] },
    { id: 'ml',     label: 'ML Basics',  levels: ['advanced'] },
    { id: 'excel',  label: 'Excel',      levels: ['basic','intermediate','advanced'] },
  ],
  'Mobile Development': [
    { id: 'dart',    label: 'Dart',          levels: ['intermediate','advanced'] },
    { id: 'flutter', label: 'Flutter',       levels: ['intermediate','advanced'] },
    { id: 'rn',      label: 'React Native',  levels: ['advanced'] },
    { id: 'android', label: 'Android',       levels: ['advanced'] },
    { id: 'git',     label: 'Git/GitHub',    levels: ['basic','intermediate','advanced'] },
    { id: 'api',     label: 'REST APIs',     levels: ['intermediate','advanced'] },
  ],
  'Cyber Security': [
    { id: 'network', label: 'Networking',    levels: ['basic','intermediate','advanced'] },
    { id: 'linux',   label: 'Linux',         levels: ['basic','intermediate','advanced'] },
    { id: 'ethical', label: 'Ethical Hack',  levels: ['intermediate','advanced'] },
    { id: 'tryhack', label: 'TryHackMe',     levels: ['intermediate','advanced'] },
    { id: 'ceh',     label: 'CEH Cert',      levels: ['advanced'] },
    { id: 'crypto',  label: 'Cryptography',  levels: ['advanced'] },
  ],
  'UI/UX Design': [
    { id: 'figma',  label: 'Figma',          levels: ['basic','intermediate','advanced'] },
    { id: 'wire',   label: 'Wireframing',    levels: ['basic','intermediate','advanced'] },
    { id: 'proto',  label: 'Prototyping',    levels: ['intermediate','advanced'] },
    { id: 'user',   label: 'User Research',  levels: ['intermediate','advanced'] },
    { id: 'color',  label: 'Color Theory',   levels: ['advanced'] },
    { id: 'motion', label: 'Motion Design',  levels: ['advanced'] },
  ],
  'Cloud Computing': [
    { id: 'aws',    label: 'AWS Basics',  levels: ['basic','intermediate','advanced'] },
    { id: 'azure',  label: 'Azure',       levels: ['intermediate','advanced'] },
    { id: 'docker', label: 'Docker',      levels: ['intermediate','advanced'] },
    { id: 'k8s',    label: 'Kubernetes',  levels: ['advanced'] },
    { id: 'devops', label: 'DevOps',      levels: ['advanced'] },
    { id: 'ci',     label: 'CI/CD',       levels: ['advanced'] },
  ],
  'default': [
    { id: 's1', label: 'Core Skill',      levels: ['basic','intermediate','advanced'] },
    { id: 's2', label: 'Tool Basics',     levels: ['basic','intermediate','advanced'] },
    { id: 's3', label: 'Advanced Tool',   levels: ['intermediate','advanced'] },
    { id: 's4', label: 'Project Work',    levels: ['advanced'] },
    { id: 's5', label: 'Communication',   levels: ['basic','intermediate','advanced'] },
    { id: 's6', label: 'Portfolio',       levels: ['advanced'] },
  ],
};

const skillLinks = {
  'Frontend Development': [
    ['root','html'],['root','css'],['root','js'],['root','react'],
    ['root','tailwind'],['root','git'],['root','api'],['root','ts'],
    ['html','css'],['js','react'],['react','ts'],
  ],
  'Backend Development': [
    ['root','node'],['root','express'],['root','mongo'],['root','sql'],
    ['root','rest'],['root','auth'],['root','docker'],['root','git'],
    ['node','express'],['express','auth'],['mongo','docker'],
  ],
  'Artificial Intelligence': [
    ['root','python'],['root','numpy'],['root','pandas'],['root','sklearn'],
    ['root','tensorflow'],['root','nlp'],['root','kaggle'],['root','dl'],
    ['python','numpy'],['numpy','pandas'],['sklearn','tensorflow'],['tensorflow','dl'],
  ],
  'Data Science': [
    ['root','python'],['root','sql'],['root','pandas'],['root','viz'],
    ['root','tableau'],['root','stats'],['root','ml'],['root','excel'],
    ['python','pandas'],['pandas','viz'],['stats','ml'],
  ],
  'Mobile Development': [
    ['root','dart'],['root','flutter'],['root','rn'],['root','android'],
    ['root','git'],['root','api'],
    ['dart','flutter'],['flutter','rn'],
  ],
  'Cyber Security': [
    ['root','network'],['root','linux'],['root','ethical'],['root','tryhack'],
    ['root','ceh'],['root','crypto'],
    ['network','linux'],['ethical','tryhack'],
  ],
  'UI/UX Design': [
    ['root','figma'],['root','wire'],['root','proto'],['root','user'],
    ['root','color'],['root','motion'],
    ['figma','wire'],['wire','proto'],
  ],
  'Cloud Computing': [
    ['root','aws'],['root','azure'],['root','docker'],['root','k8s'],
    ['root','devops'],['root','ci'],
    ['aws','docker'],['docker','k8s'],['devops','ci'],
  ],
  'default': [
    ['root','s1'],['root','s2'],['root','s3'],
    ['root','s4'],['root','s5'],['root','s6'],
    ['s1','s2'],['s2','s3'],
  ],
};

// Maps experience ID to which levels are "known"
const expToKnown = {
  'beginner':     [],
  'basic':        ['basic'],
  'intermediate': ['basic','intermediate'],
  'advanced':     ['basic','intermediate','advanced'],
};

// Maps experience ID to which levels are "learning"
const expToLearning = {
  'beginner':     ['basic'],
  'basic':        ['intermediate'],
  'intermediate': ['advanced'],
  'advanced':     [],
};

function getStatus(node, expId, isSkilled) {
  const known    = expToKnown[expId]    || [];
  const learning = expToLearning[expId] || [];
  
  // If user is skilled/audited, automatically mark basic/intermediate levels as known
  if (isSkilled && node.levels.some(l => ['basic', 'intermediate'].includes(l))) {
    return 'known';
  }

  if (node.levels.some(l => known.includes(l) && !learning.includes(l))) {
    const lowestLevel = node.levels[0];
    if (known.includes(lowestLevel)) return 'known';
  }
  if (node.levels.some(l => learning.includes(l))) return 'learning';
  return 'gap';
}

export default function SkillMap({ userData, onBack, onNext, theme }) {
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
  const currentTheme = theme || defaultTheme;
  
  const statusConfig = {
    you:      { color: 'var(--brand-teal)', radius: 32 },
    known:    { color: 'var(--brand-teal)', radius: 24 },
    learning: { color: 'var(--brand-yellow)', radius: 24 },
    gap:      { color: 'var(--brand-coral)', radius: 24 },
  };

  const svgRef = useRef(null);
  const skillName = userData?.skill?.title || 'default';
  const expId     = userData?.experience?.id || 'beginner';

  const rawNodes = skillNodes[skillName] || skillNodes['default'];
  const rawLinks = skillLinks[skillName] || skillLinks['default'];

  const calculateReadiness = () => {
    const hasOnboarding = userData?.onboardingCompleted;
    const hasSkill = userData?.skill?.title;
    const hasExperience = userData?.experience?.id;
    const completedModules = Object.values(userData?.learningProgress?.modules || {}).filter(m => m.completed).length;
    const totalModules = userData?.learningProgress?.total || 0;
    
    const profileComplete = hasOnboarding && hasSkill && hasExperience;
    const learningComplete = totalModules > 0 && completedModules >= totalModules * 0.8;
    
    if (!profileComplete) {
      return { status: 'not_ready', message: 'Profile incomplete', percentage: 0 };
    } else if (!learningComplete) {
      return { 
        status: 'in_progress', 
        message: 'Learning in progress', 
        percentage: Math.round((completedModules / totalModules) * 100) 
      };
    } else {
      return { status: 'ready', message: 'Ready for opportunities', percentage: 100 };
    }
  };

  const readiness = calculateReadiness();

  const processedNodes = rawNodes.map(n => ({
    ...n,
    status: getStatus(n, expId, userData?.onboardingType === 'skilled'),
  }));

  const known    = processedNodes.filter(n => n.status === 'known').length;
  const learning = processedNodes.filter(n => n.status === 'learning').length;
  const gap      = processedNodes.filter(n => n.status === 'gap').length;

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const W = 600, H = 450;
    svg.attr('viewBox', `0 0 ${W} ${H}`);

    const nodes = [
      { id: 'root', label: skillName.split(' ')[0], status: 'you' },
      ...processedNodes,
    ];
    const nodeIds = new Set(nodes.map(d => d.id));
    const links = rawLinks
      .map(([source, target]) => ({ source, target }))
      .filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));

    const sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(130))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(45));

    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const link = svg.append('g').selectAll('line')
      .data(links).join('line')
      .attr('stroke', 'rgba(0,0,0,0.06)')
      .attr('stroke-width', 2);

    const node = svg.append('g').selectAll('g')
      .data(nodes).join('g')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', (event, d) => {
          if (!event.active) sim.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
        .on('end', (event, d) => {
          if (!event.active) sim.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      );

    node.append('circle')
      .attr('r', d => statusConfig[d.status].radius)
      .attr('fill', d => d.status === 'you' ? 'white' : `rgba(255, 255, 255, 0.9)`)
      .attr('stroke', d => statusConfig[d.status].color)
      .attr('stroke-width', d => d.status === 'you' ? 4 : 3)
      .attr('filter', d => d.status === 'you' ? 'url(#glow)' : null);

    node.append('text')
      .text(d => d.label.toUpperCase())
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', d => d.status === 'you' ? 'var(--brand-teal)' : 'var(--text-heading)')
      .attr('font-family', 'var(--font-display)')
      .attr('font-size', d => d.status === 'you' ? '12px' : '10px')
      .attr('font-weight', '900')
      .attr('letter-spacing', '0.5px')
      .attr('pointer-events', 'none');

    sim.on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => sim.stop();
  }, [processedNodes, rawLinks, skillName]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      color: 'var(--text-body)',
      fontFamily: 'var(--font-main)',
      padding: '80px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent:'space-between', maxWidth: '1200px', margin: '0 auto 60px' }}>
        <button onClick={onBack} className="pf-glass" style={{
          border: 'none', padding: '16px 35px',
          cursor: 'pointer', fontSize: '13px', fontWeight: '900', borderRadius:'25px', letterSpacing:'1.5px', textTransform:'uppercase'
        }}>← BACK</button>
        <h1 className="pf-shimmer-text" style={{ fontSize: '32px', fontWeight: '900', fontFamily:'var(--font-display)', margin:0, letterSpacing:'-1px' }}>⚡ PathForge DNA</h1>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-2.5px', fontFamily: 'var(--font-display)', color:'var(--text-heading)', lineHeight:1.1 }}>
            <span className="pf-shimmer-text">{userData?.name || 'User'}'s Skill DNA Map</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '20px', fontWeight: '800', fontSize:'22px', letterSpacing:'1px' }}>
            {userData?.skill?.icon} {skillName.toUpperCase()} · EXPERIENCE: {userData?.experience?.label.toUpperCase()}
          </p>
        </div>

        <div className="pf-glass" style={{
          padding: '60px', marginBottom: '60px', background:'white !important', borderRadius:'50px', border:'none',
          borderLeft: `12px solid ${readiness.status === 'ready' ? 'var(--brand-teal)' : 
                                    readiness.status === 'in_progress' ? 'var(--brand-yellow)' : 'var(--brand-coral)'} !important`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div>
              <h3 style={{ 
                fontSize: '38px', 
                fontWeight: '900', 
                margin: 0,
                fontFamily: 'var(--font-display)',
                color: readiness.status === 'ready' ? 'var(--brand-teal)' : 
                       readiness.status === 'in_progress' ? 'var(--brand-yellow)' : 'var(--brand-coral)',
                letterSpacing:'-1px'
              }}>
                {readiness.status === 'ready' ? '✅ JOB READY STATUS' : 
                 readiness.status === 'in_progress' ? '📚 LEARNING ASCENSION' : 
                 '❌ PROFILE INCOMPLETE'}
              </h3>
              <p style={{ color: 'var(--text-muted)', margin: '10px 0 0 0', fontSize: '18px', fontWeight: '700' }}>
                {readiness.message}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '64px', 
                fontWeight: '900',
                fontFamily: 'var(--font-display)',
                color: readiness.status === 'ready' ? 'var(--brand-teal)' : 
                       readiness.status === 'in_progress' ? 'var(--brand-yellow)' : 'var(--brand-coral)',
                letterSpacing:'-2px'
              }}>
                {readiness.percentage}%
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'1.5px' }}>DNA SYNC</div>
            </div>
          </div>
          
          <div style={{
            width: '100%', height: '18px', background: 'rgba(0,0,0,0.03)',
            borderRadius: '9px', overflow: 'hidden', marginBottom: '40px', padding:'4px'
          }}>
            <div style={{
              width: `${readiness.percentage}%`, height: '100%',
              background: readiness.status === 'ready' ? 'var(--brand-teal)' : 
                         readiness.status === 'in_progress' ? 'var(--brand-yellow)' : 'var(--brand-coral)',
              borderRadius: '5px', transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: `0 0 20px ${readiness.status === 'ready' ? 'var(--brand-teal)' : readiness.status === 'in_progress' ? 'var(--brand-yellow)' : 'var(--brand-coral)'}55`
            }} />
          </div>

          <div style={{ background:'rgba(0,0,0,0.02)', padding:'40px', borderRadius:'30px', border:'none' }}>
            {readiness.status === 'not_ready' && (
              <div style={{ fontSize: '16px', lineHeight: '2' }}>
                <div style={{ fontWeight: '900', marginBottom: '15px', color: 'var(--brand-coral)', letterSpacing:'1px', textTransform:'uppercase' }}>
                  🎯 ACTION REQUIRED TO SYNC DNA:
                </div>
                <div style={{ color: 'var(--text-muted)', fontWeight:'700' }}>
                  {!userData?.onboardingCompleted && (
                    <div style={{ marginBottom: '12px', display:'flex', gap:'15px' }}>
                      <span>1️⃣</span> <strong>COMPLETE ASSESSMENT</strong> - Baseline your skill level for personalization
                    </div>
                  )}
                  {!userData?.skill?.title && (
                    <div style={{ marginBottom: '12px', display:'flex', gap:'15px' }}>
                      <span>2️⃣</span> <strong>SELECT CAREER TRACK</strong> - Define your focus area in the talent economy
                    </div>
                  )}
                  {!userData?.experience?.id && (
                    <div style={{ marginBottom: '12px', display:'flex', gap:'15px' }}>
                      <span>3️⃣</span> <strong>CALIBRATE EXPERIENCE</strong> - Set your current competency benchmark
                    </div>
                  )}
                </div>
              </div>
            )}

            {readiness.status === 'in_progress' && (
              <div style={{ fontSize: '16px', lineHeight: '2' }}>
                <div style={{ fontWeight: '900', marginBottom: '15px', color: 'var(--brand-yellow)', letterSpacing:'1px', textTransform:'uppercase' }}>
                  🚀 DNA ASCENSION IN PROGRESS:
                </div>
                <div style={{ color: 'var(--text-muted)', fontWeight:'700' }}>
                  <div style={{ marginBottom: '12px', display:'flex', gap:'15px' }}>
                    <span>📈</span> <strong>SYNC STATUS:</strong> {Object.values(userData?.learningProgress?.modules || {}).filter(m => m.completed).length} / {userData?.learningProgress?.total || 0} sequences completed
                  </div>
                  <div style={{ marginBottom: '12px', display:'flex', gap:'15px' }}>
                    <span>🎯</span> <strong>NEXT PHASE:</strong> Continue your roadmap to achieve 80% DNA saturation
                  </div>
                </div>
              </div>
            )}

            {readiness.status === 'ready' && (
              <div style={{ fontSize: '16px', lineHeight: '2' }}>
                <div style={{ fontWeight: '900', marginBottom: '15px', color: 'var(--brand-teal)', letterSpacing:'1px', textTransform:'uppercase' }}>
                  🎉 DNA SYNC COMPLETE:
                </div>
                <div style={{ color: 'var(--text-muted)', fontWeight:'700' }}>
                  <div style={{ marginBottom: '12px', display:'flex', gap:'15px' }}>
                    <span>✅</span> <strong>VERIFIED STATUS:</strong> Your competency profile is fully mapped and industry-ready
                  </div>
                  <div style={{ marginBottom: '12px', display:'flex', gap:'15px' }}>
                    <span>💼</span> <strong>OPPORTUNITIES:</strong> Explore the Industry Dashboard to connect with hiring partners
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '25px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
          {[
            { color: 'var(--brand-teal)', label: 'VERIFIED' },
            { color: 'var(--brand-yellow)', label: 'LEARNING' },
            { color: 'var(--brand-coral)', label: 'GAP' },
            { color: 'white', border:'2px solid var(--brand-teal)', label: 'YOU' },
          ].map((l, i) => (
            <div key={i} className="pf-glass" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white !important', padding: '12px 25px', borderRadius:'20px', border: 'none', boxShadow:'0 10px 25px rgba(0,0,0,0.03)' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: l.color, border: l.border || 'none' }} />
              <span style={{ fontSize: '14px', color: 'var(--text-heading)', fontWeight: '900', letterSpacing:'1px' }}>{l.label}</span>
            </div>
          ))}
        </div>

        <div className="pf-glass" style={{
          padding: '40px', marginBottom: '60px', overflow: 'hidden', background:'white !important', borderRadius:'50px', border:'none', boxShadow:'0 40px 100px rgba(0,0,0,0.05)'
        }}>
          <svg ref={svgRef} style={{ width: '100%', height: '450px', borderRadius: '30px', background:'rgba(0,0,0,0.01)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '30px', marginBottom: '60px' }}>
          {[
            { label: 'Verified Skills',     value: known,    color: 'var(--brand-teal)', emoji: '✅' },
            { label: 'Active Sequences',    value: learning, color: 'var(--brand-yellow)', emoji: '📚' },
            { label: 'Identified Gaps',     value: gap,      color: 'var(--brand-coral)', emoji: '❌' },
          ].map((s, i) => (
            <div key={i} className="pf-glass" style={{
              padding: '45px 30px', textAlign: 'center', background:'white !important', borderRadius:'40px', border:'none', borderBottom: `8px solid ${s.color} !important`, transition:'all 0.4s ease'
            }}>
              <div style={{ fontSize: '56px', marginBottom: '20px' }}>{s.emoji}</div>
              <div style={{ fontSize: '48px', fontWeight: '900', color: 'var(--text-heading)', fontFamily: 'var(--font-display)', letterSpacing:'-1.5px' }}>{s.value}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'1.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {gap > 0 && (
          <div className="pf-glass" style={{
            padding: '40px 50px', marginBottom: '60px', background:'rgba(255,107,107,0.03) !important', borderRadius:'40px',
            borderLeft: `12px solid var(--brand-coral) !important`, border:'none'
          }}>
            <div style={{ fontWeight: '900', marginBottom: '20px', color: 'var(--brand-coral)', fontSize: '22px', fontFamily:'var(--font-display)', letterSpacing:'-0.5px' }}>
              🚨 {gap} CRITICAL SKILL DNA GAP{gap > 1 ? 'S' : ''} DETECTED:
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '18px', lineHeight: '2.2', fontWeight: '700' }}>
              {processedNodes.filter(n => n.status === 'gap').map(n => (
                <div key={n.id} style={{ display:'flex', alignItems:'center', gap:'15px' }}>
                  <span style={{color:'var(--brand-coral)', fontSize:'20px'}}>→</span> Initiate learning sequence for <strong style={{ color: 'var(--text-heading)', fontWeight:'900' }}>{n.label.toUpperCase()}</strong> to unlock tier ascension
                </div>
              ))}
            </div>
          </div>
        )}

        {expId === 'beginner' && (
          <div className="pf-glass" style={{
            padding: '60px', marginBottom: '60px', background:'rgba(0, 212, 170, 0.03) !important', borderRadius:'50px',
            textAlign: 'center', borderBottom: `10px solid var(--brand-teal) !important`, border:'none'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '25px' }}>🌱</div>
            <div style={{ fontWeight: '900', color: 'var(--brand-teal)', marginBottom: '15px', fontSize: '32px', fontFamily: 'var(--font-display)', letterSpacing:'-1px' }}>
              BASE LEVEL SYNCHRONIZATION
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '20px', fontWeight: '700', lineHeight: 1.6, maxWidth:'800px', margin:'0 auto' }}>
              Every master was once a beginner. Your DNA sequence is primed for growth. Start your first module to begin ascension.
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: '100px' }}>
          <button onClick={onNext} className="pf-glow-btn" style={{
            padding: '24px 80px', fontSize: '20px', fontWeight: '900', cursor: 'pointer', borderRadius:'45px', textTransform:'uppercase', letterSpacing:'2.5px', border:'none'
          }}>
            Analyze Employability Score →
          </button>
        </div>
      </div>
    </div>
  );
}