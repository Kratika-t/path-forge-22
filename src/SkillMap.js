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

const statusConfig = {
  you:      { color: '#FF6B35', radius: 28 },
  known:    { color: '#2ECC71', radius: 20 },
  learning: { color: '#F39C12', radius: 20 },
  gap:      { color: '#E74C3C', radius: 20 },
};

export default function SkillMap({ userData, onBack, onNext }) {
  const svgRef = useRef(null);
  const skillName = userData?.skill?.title || 'default';
  const expId     = userData?.experience?.id || 'beginner';

  const rawNodes = skillNodes[skillName] || skillNodes['default'];
  const rawLinks = skillLinks[skillName] || skillLinks['default'];

  // Calculate readiness status based on profile completion
  const calculateReadiness = () => {
    const hasOnboarding = userData?.onboardingCompleted;
    const hasSkill = userData?.skill?.title;
    const hasExperience = userData?.experience?.id;
    const hasLearningProgress = userData?.learningProgress?.modules;
    const completedModules = Object.values(userData?.learningProgress?.modules || {}).filter(m => m.completed).length;
    const totalModules = userData?.learningProgress?.total || 0;
    
    const profileComplete = hasOnboarding && hasSkill && hasExperience;
    const learningComplete = totalModules > 0 && completedModules >= totalModules * 0.8; // 80% completion
    
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

  // Assign status dynamically based on experience
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

    const W = 560, H = 420;
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
      .force('link', d3.forceLink(links).id(d => d.id).distance(110))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(38));

    // Glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const link = svg.append('g').selectAll('line')
      .data(links).join('line')
      .attr('stroke', 'rgba(255,255,255,0.12)')
      .attr('stroke-width', 1.5);

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
      .attr('fill', d => `${statusConfig[d.status].color}22`)
      .attr('stroke', d => statusConfig[d.status].color)
      .attr('stroke-width', d => d.status === 'you' ? 3 : 2)
      .attr('filter', d => d.status === 'you' ? 'url(#glow)' : null);

    node.append('text')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-size', d => d.status === 'you' ? '11px' : '10px')
      .attr('font-weight', d => d.status === 'you' ? 'bold' : 'normal')
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
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '30px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '900px', margin: '0 auto 24px' }}>
        <button onClick={onBack} style={{
          background: 'transparent', color: 'rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px',
          borderRadius: '20px', cursor: 'pointer', fontSize: '13px'
        }}>← Back</button>
        <h1 style={{ color: '#FF6B35', fontSize: '22px', fontWeight: 'bold' }}>⚡ PathForge</h1>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 'bold' }}>
            🧬 {userData?.name || 'User'}'s Skill DNA Map
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>
            {userData?.skill?.icon} {skillName} · Level: {userData?.experience?.label} · Drag nodes to explore
          </p>
        </div>

        {/* Readiness Status Card */}
        <div style={{
          background: readiness.status === 'ready' ? 'rgba(46,204,113,0.1)' : 
                     readiness.status === 'in_progress' ? 'rgba(243,156,18,0.1)' : 
                     'rgba(231,76,60,0.1)',
          border: readiness.status === 'ready' ? '1px solid rgba(46,204,113,0.3)' : 
                  readiness.status === 'in_progress' ? '1px solid rgba(243,156,18,0.3)' : 
                  '1px solid rgba(231,76,60,0.3)',
          borderRadius: '16px', padding: '24px', marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                margin: 0,
                color: readiness.status === 'ready' ? '#2ECC71' : 
                       readiness.status === 'in_progress' ? '#F39C12' : '#E74C3C'
              }}>
                {readiness.status === 'ready' ? '✅ Ready for Opportunities' : 
                 readiness.status === 'in_progress' ? '📚 In Progress' : 
                 '❌ Not Ready Yet'}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', margin: '4px 0 0 0', fontSize: '14px' }}>
                {readiness.message}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: 'bold',
                color: readiness.status === 'ready' ? '#2ECC71' : 
                       readiness.status === 'in_progress' ? '#F39C12' : '#E74C3C'
              }}>
                {readiness.percentage}%
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Complete</div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px', overflow: 'hidden', marginBottom: '16px'
          }}>
            <div style={{
              width: `${readiness.percentage}%`, height: '100%',
              background: readiness.status === 'ready' ? '#2ECC71' : 
                         readiness.status === 'in_progress' ? '#F39C12' : '#E74C3C',
              borderRadius: '4px', transition: 'width 0.3s ease'
            }} />
          </div>

          {/* Completion Guidance */}
          {readiness.status === 'not_ready' && (
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#E74C3C' }}>
                🎯 To get ready, complete these steps:
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                {!userData?.onboardingCompleted && (
                  <div style={{ marginBottom: '8px' }}>
                    1️⃣ <strong>Complete Onboarding Quiz</strong> - Take the skill assessment to personalize your journey
                  </div>
                )}
                {!userData?.skill?.title && (
                  <div style={{ marginBottom: '8px' }}>
                    2️⃣ <strong>Choose Your Track</strong> - Select your career path (Frontend, Backend, AI, etc.)
                  </div>
                )}
                {!userData?.experience?.id && (
                  <div style={{ marginBottom: '8px' }}>
                    3️⃣ <strong>Set Experience Level</strong> - Define your current skill level
                  </div>
                )}
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,107,53,0.1)', borderRadius: '8px' }}>
                  💡 <strong>Quick Start:</strong> Click "Start Your Journey" on the home page to begin the onboarding process
                </div>
              </div>
            </div>
          )}

          {readiness.status === 'in_progress' && (
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#F39C12' }}>
                🚀 Keep going! You're making great progress:
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                <div style={{ marginBottom: '8px' }}>
                  📈 <strong>Current Progress:</strong> {Object.values(userData?.learningProgress?.modules || {}).filter(m => m.completed).length} of {userData?.learningProgress?.total || 0} modules completed
                </div>
                <div style={{ marginBottom: '8px' }}>
                  🎯 <strong>Next Steps:</strong> Continue with your learning roadmap to reach 80% completion
                </div>
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(243,156,18,0.1)', borderRadius: '8px' }}>
                  💡 <strong>Tip:</strong> Focus on completing modules marked as "Learning" (orange nodes) in your Skill DNA map
                </div>
              </div>
            </div>
          )}

          {readiness.status === 'ready' && (
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#2ECC71' }}>
                🎉 Excellent! You're ready for job opportunities:
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)' }}>
                <div style={{ marginBottom: '8px' }}>
                  ✅ <strong>Profile Complete:</strong> Your skill assessment and learning journey are done
                </div>
                <div style={{ marginBottom: '8px' }}>
                  💼 <strong>Next Steps:</strong> Explore company finder and apply for jobs that match your skills
                </div>
                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(46,204,113,0.1)', borderRadius: '8px' }}>
                  🚀 <strong>Pro Tip:</strong> Visit the Company Search page to find opportunities matching your {skillName} skills
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          {[
            { color: '#2ECC71', label: '✅ Known' },
            { color: '#F39C12', label: '📚 Learning' },
            { color: '#E74C3C', label: '❌ Skill Gap' },
            { color: '#FF6B35', label: '⚡ You' },
          ].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: l.color }} />
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* D3 Graph */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px', padding: '10px', marginBottom: '24px',
        }}>
          <svg ref={svgRef} style={{ width: '100%', height: '420px' }} />
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Skills Known',        value: known,    color: '#2ECC71', emoji: '✅' },
            { label: 'Currently Learning',  value: learning, color: '#F39C12', emoji: '📚' },
            { label: 'Skill Gaps',          value: gap,      color: '#E74C3C', emoji: '❌' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${s.color}44`,
              borderRadius: '14px', padding: '20px', textAlign: 'center',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '6px' }}>{s.emoji}</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Gap alert */}
        {gap > 0 && (
          <div style={{
            background: 'rgba(231,76,60,0.1)',
            border: '1px solid rgba(231,76,60,0.3)',
            borderRadius: '14px', padding: '18px 24px', marginBottom: '24px',
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#E74C3C' }}>
              🚨 You have {gap} skill gap{gap > 1 ? 's' : ''} — here's what to learn:
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.8' }}>
              {processedNodes.filter(n => n.status === 'gap').map(n => (
                <div key={n.id}>→ Learn <strong style={{ color: 'white' }}>{n.label}</strong> to unlock more opportunities</div>
              ))}
            </div>
          </div>
        )}

        {/* Beginner encouragement */}
        {expId === 'beginner' && (
          <div style={{
            background: 'rgba(255,107,53,0.1)',
            border: '1px solid rgba(255,107,53,0.3)',
            borderRadius: '14px', padding: '18px 24px', marginBottom: '24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌱</div>
            <div style={{ fontWeight: 'bold', color: '#FF6B35', marginBottom: '6px' }}>
              Everyone starts from zero — and that's perfectly fine!
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
              Your roadmap is ready. Start with the first skill and build from there.
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <button onClick={onNext} style={{
            background: '#FF6B35', color: 'white', border: 'none',
            padding: '16px 48px', borderRadius: '30px',
            fontSize: '17px', fontWeight: 'bold', cursor: 'pointer',
          }}>
            View My Employability Score →
          </button>
        </div>

      </div>
    </div>
  );
}