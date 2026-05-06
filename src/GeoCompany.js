import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return +(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1);
};

const BASE_COMPANIES = {
  'Frontend Development': [
    {name:'Nagarro',location:'Noida',lat:28.5355,lng:77.3910,type:'MNC',hiring:'Frontend Developer',mode:'In-Person', seats: 12, applicants: 142, detailedDescription: 'Focuses on building scalable enterprise UIs for global clients.', website:'https://www.nagarro.com/careers'},
    {name:'HCL Technologies',location:'Noida Sec 126',lat:28.5494,lng:77.3590,type:'MNC',hiring:'React Developer',mode:'Hybrid', seats: 8, applicants: 256, detailedDescription: 'High-growth role in cloud-native application development.', website:'https://www.hcltech.com/careers'},
    {name:'Wipro',location:'Noida Sec 2',lat:28.5700,lng:77.3200,type:'MNC',hiring:'UI Developer',mode:'Online', seats: 5, applicants: 89, detailedDescription: 'Remote-first UI engineering for cybersecurity dashboards.', website:'https://careers.wipro.com'},
    {name:'Publicis Sapient',location:'Gurgaon',lat:28.4595,lng:77.0266,type:'MNC',hiring:'Frontend Engineer',mode:'Hybrid', seats: 15, applicants: 310, detailedDescription: 'Digital transformation projects using advanced React patterns.', website:'https://www.publicissapient.com/careers'},
    {name:'Adobe India',location:'Noida',lat:28.5355,lng:77.3910,type:'MNC',hiring:'UI Engineer',mode:'In-Person', seats: 3, applicants: 450, detailedDescription: 'Work on world-class creative software interfaces.', website:'https://www.adobe.com/careers'},
    {name:'Paytm',location:'Noida Sec 132',lat:28.5013,lng:77.4089,type:'Startup',hiring:'React Developer',mode:'Hybrid', seats: 4, applicants: 180, detailedDescription: 'Building high-performance payment interfaces for millions.', website:'https://jobs.paytm.com'},
    {name:'Zomato',location:'Gurgaon',lat:28.4949,lng:77.0869,type:'Startup',hiring:'Frontend Dev',mode:'Online', seats: 6, applicants: 210, detailedDescription: 'Creative UI development for the ultimate food delivery app.', website:'https://www.zomato.com/careers'},
  ],
  'Backend Development': [
    {name:'Infosys',location:'Noida Sec 62',lat:28.6270,lng:77.3649,type:'MNC',hiring:'Backend Developer',mode:'In-Person', seats: 10, applicants: 120, detailedDescription: 'Enterprise backend systems optimization and scaling.', website:'https://www.infosys.com/careers'},
    {name:'TCS',location:'Noida Sec 126',lat:28.5494,lng:77.3590,type:'MNC',hiring:'Node.js Developer',mode:'Hybrid', seats: 15, applicants: 300, detailedDescription: 'Join the large-scale digital banking transformation team.', website:'https://www.tcs.com/careers'},
    {name:'Tech Mahindra',location:'Noida',lat:28.5355,lng:77.3910,type:'MNC',hiring:'Java Backend Dev',mode:'In-Person', seats: 7, applicants: 95, detailedDescription: 'Core banking and telecommunication backend services.', website:'https://www.techmahindra.com/careers'},
    {name:'Razorpay',location:'Noida',lat:28.5700,lng:77.3200,type:'Startup',hiring:'Backend Engineer',mode:'Online', seats: 4, applicants: 500, detailedDescription: 'High-concurrency payment gateway engineering.', website:'https://razorpay.com/jobs'},
    {name:'MakeMyTrip',location:'Gurgaon',lat:28.4949,lng:77.0869,type:'MNC',hiring:'API Developer',mode:'Hybrid', seats: 12, applicants: 240, detailedDescription: 'Developing microservices for India\'s leading travel platform.', website:'https://www.makemytrip.com/careers'},
  ],
  'Artificial Intelligence': [
    {name:'Microsoft India',location:'Noida',lat:28.5355,lng:77.3910,type:'MNC',hiring:'AI Engineer',mode:'Hybrid', seats: 5, applicants: 600, detailedDescription: 'Working on Azure AI services and Large Language Models.', website:'https://careers.microsoft.com'},
    {name:'IBM India',location:'Noida Sec 62',lat:28.6270,lng:77.3649,type:'MNC',hiring:'ML Engineer',mode:'In-Person', seats: 8, applicants: 150, detailedDescription: 'Developing enterprise ML pipelines for data-driven insights.', website:'https://www.ibm.com/employment'},
    {name:'Google India',location:'Gurgaon',lat:28.4949,lng:77.0869,type:'MNC',hiring:'AI Researcher',mode:'Online', seats: 2, applicants: 1200, detailedDescription: 'Advanced research in machine learning and neural networks.', website:'https://careers.google.com'},
    {name:'Samsung R&D',location:'Noida Sec 129',lat:28.5150,lng:77.4050,type:'MNC',hiring:'AI Intern',mode:'In-Person', seats: 20, applicants: 800, detailedDescription: 'Innovating on-device AI for the next generation of mobile devices.', website:'https://www.samsung.com/in/careers'},
    {name:'Ola AI',location:'Gurgaon',lat:28.4595,lng:77.0266,type:'Startup',hiring:'ML Developer',mode:'Hybrid', seats: 5, applicants: 190, detailedDescription: 'Optimizing mobility algorithms using deep learning.', website:'https://careers.olacabs.com'},
  ],
  'default': [
    {name:'TCS',location:'Noida Sec 126',lat:28.5494,lng:77.3590,type:'MNC',hiring:'Trainee Engineer',mode:'In-Person', seats: 100, applicants: 5000, detailedDescription: 'Entry-level engineering role in world-class IT services.', website:'https://www.tcs.com/careers'},
    {name:'Infosys',location:'Noida Sec 62',lat:28.6270,lng:77.3649,type:'MNC',hiring:'Systems Engineer',mode:'Hybrid', seats: 50, applicants: 2500, detailedDescription: 'Kickstart your tech career with top-tier training and projects.', website:'https://www.infosys.com/careers'},
    {name:'Wipro',location:'Noida Sec 2',lat:28.5700,lng:77.3200,type:'MNC',hiring:'Project Engineer',mode:'Online', seats: 30, applicants: 1500, detailedDescription: 'Join the team building next-gen digital solutions.', website:'https://careers.wipro.com'},
    {name:'HCL Technologies',location:'Noida',lat:28.5355,lng:77.3910,type:'MNC',hiring:'Graduate Trainee',mode:'In-Person', seats: 40, applicants: 1800, detailedDescription: 'Be part of HCL\'s global infrastructure and application team.', website:'https://www.hcltech.com/careers'},
  ],
};

const modeColor = {'In-Person':'#057642','Hybrid':'var(--brand-yellow)','Online':'var(--brand-teal)'};
const typeColor = {'MNC':'#9B59B6','Startup':'var(--brand-teal)','Govt':'#057642'};

const defaultTheme = {
  pageBg: 'transparent',
  cardBg: 'rgba(255, 255, 255, 0.7)',
  inputBg: 'rgba(255, 255, 255, 0.8)',
  border: 'none',
  textPrimary: 'var(--text-heading)',
  textMuted: 'var(--text-body)',
  accent: 'var(--brand-teal)',
  accentHover: 'var(--brand-yellow)',
  accentLight: 'rgba(0, 212, 170, 0.1)',
  success: 'var(--brand-teal)',
  warning: 'var(--brand-yellow)',
  error: 'var(--brand-coral)',
};

export default function GeoCompany({ userData, onBack, onNext, onProgressUpdate, theme = defaultTheme }) {
  const currentTheme = theme || defaultTheme;
  const skillName = userData?.skill?.title || 'default';
  const [userLoc, setUserLoc] = useState(null);
  const [userCity, setUserCity] = useState('Detecting location...');
  const [locError, setLocError] = useState(null);
  const [locLoading, setLocLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('distance');
  const [applied, setApplied] = useState({});
  const [showMap, setShowMap] = useState(false);

  const mapRef = useRef(null);
  const mapInst = useRef(null);
  const routeLayer = useRef(null);
  const companyMarkers = useRef([]);

  useEffect(() => {
    const syncAppliedStatuses = () => {
      const jobs = userData?.appliedJobs;
      if (!jobs || Object.keys(jobs).length === 0) {
        setApplied({});
        return;
      }
      const now = Date.now();
      const updatedStatuses = {};
      Object.entries(jobs).forEach(([name, appliedAt]) => {
        const elapsedMinutes = (now - appliedAt) / 1000 / 60;
        if (elapsedMinutes >= 10) {
          updatedStatuses[name] = 'approved';
        } else {
          updatedStatuses[name] = 'pending';
        }
      });
      setApplied(updatedStatuses);
    };

    syncAppliedStatuses();
    const checkInterval = setInterval(syncAppliedStatuses, 2000);
    return () => clearInterval(checkInterval);
  }, [userData]);

  const handleApply = async (companyName) => {
    const updatedJobs = { ...(userData?.appliedJobs || {}), [companyName]: Date.now() };
    if (onProgressUpdate) {
      await onProgressUpdate({ appliedJobs: updatedJobs });
    }
    const company = companies.find(c => c.name === companyName);
    if (company?.website) {
      window.open(company.website, '_blank');
    }
  };

  const handleUnapply = async (companyName) => {
    const updatedJobs = { ...(userData?.appliedJobs || {}) };
    delete updatedJobs[companyName];

    if (onProgressUpdate) {
      await onProgressUpdate({ appliedJobs: updatedJobs });
    }

    setApplied((prev) => {
      const next = { ...prev };
      delete next[companyName];
      return next;
    });
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError('Geolocation not supported by your browser.');
      setLocLoading(false);
      setUserLoc({ lat: 28.5355, lng: 77.3910 });
      setUserCity(userData?.city || 'Noida');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLoc({ lat, lng });
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const d = await res.json();
          const city = d.address?.city || d.address?.town || d.address?.village || d.address?.suburb || 'Your Location';
          setUserCity(city);
        } catch { setUserCity('Your Location'); }
        setLocLoading(false);
      },
      () => {
        setLocError('Location access denied. Using default location.');
        setUserLoc({ lat: 28.5355, lng: 77.3910 });
        setUserCity(userData?.city || 'Noida');
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, []);

  useEffect(() => {
    if (!userLoc) return;
    const raw = BASE_COMPANIES[skillName] || BASE_COMPANIES['default'];
    const withDist = raw.map(c => ({ ...c, distance: haversine(userLoc.lat, userLoc.lng, c.lat, c.lng) }));
    setCompanies(withDist);
  }, [userLoc, skillName]);

  useEffect(() => {
    if (!showMap || !mapRef.current || mapInst.current) return;
    const map = L.map(mapRef.current).setView([28.5355, 77.3910], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 18
    }).addTo(map);
    mapInst.current = map;
  }, [showMap]);

  useEffect(() => {
    if (!showMap || !mapInst.current || !userLoc || companies.length === 0) return;
    const map = mapInst.current;

    const userIcon = L.divIcon({
      html: `<div style="width:20px;height:20px;background:var(--brand-teal);border:4px solid white;border-radius:50%;box-shadow:0 0 20px var(--brand-teal)"></div>`,
      iconSize: [20,20], iconAnchor: [10,10], className: ''
    });
    L.marker([userLoc.lat, userLoc.lng], { icon: userIcon }).addTo(map)
      .bindPopup(`<b>📍 You are here</b><br>${userCity}`).openPopup();
    map.setView([userLoc.lat, userLoc.lng], 11);

    companyMarkers.current.forEach(m => m.remove());
    companyMarkers.current = [];

    companies.forEach(c => {
      const icon = L.divIcon({
        html: `<div style="background:var(--brand-teal);color:#FFFFFF;padding:5px 12px;border-radius:12px;font-size:11px;font-weight:900;white-space:nowrap;box-shadow:0 8px 20px rgba(0,0,0,0.1);cursor:pointer;border:1px solid rgba(255,255,255,0.3)">${c.name}</div>`,
        className: '', iconAnchor: [0,0]
      });
      const marker = L.marker([c.lat, c.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${c.name}</b><br>📍 ${c.location}<br>💼 ${c.hiring}<br>🚗 ${c.distance} km away`)
        .on('click', () => setSelected(c));
      companyMarkers.current.push(marker);
    });
  }, [showMap, userLoc, companies, userCity]);

  const getRoute = async (company) => {
    if (!userLoc || !mapInst.current) return;
    setSelected(company);
    setRouteLoading(true);
    setRouteInfo(null);
    if (routeLayer.current) { routeLayer.current.remove(); routeLayer.current = null; }
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userLoc.lng},${userLoc.lat};${company.lng},${company.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes?.[0]) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        routeLayer.current = L.polyline(coords, { color: 'var(--brand-teal)', weight: 6, opacity: 0.8 }).addTo(mapInst.current);
        mapInst.current.fitBounds(routeLayer.current.getBounds(), { padding: [40, 40] });
        setRouteInfo({ km: (route.distance/1000).toFixed(1), mins: Math.round(route.duration/60) });
      }
    } catch { setRouteInfo({ error: true }); }
    setRouteLoading(false);
  };

  const getFitReason = (c) => {
    const name = c.name.toLowerCase();
    if (name.includes('hcl')) return `Your 92% readiness score matches HCL's 'High Potential' filter for ${c.hiring}.`;
    if (name.includes('tcs')) return `Aligned with your B.Tech background and high signal count (${userData?.auditReport?.keywordScore || 15} indicators).`;
    if (name.includes('wipro')) return `Top match for your 'Online' work preference and JavaScript expertise.`;
    if (name.includes('infosys')) return `Selected based on your ${userData?.skill?.title || 'Tech'} roadmap and local residency in ${userCity}.`;
    if (name.includes('paytm')) return `Startup-ready: Your project activity on GitHub meets Paytm's agile developer criteria.`;
    if (name.includes('zomato')) return `Culture fit: Your portfolio projects show the creative UI depth Zomato looks for.`;
    return `High relevance for your ${skillName} roadmap in ${c.location}.`;
  };

  const filtered = companies
    .filter(c => filter === 'All' || c.mode === filter)
    .sort((a,b) => sortBy === 'distance' ? a.distance - b.distance : a.name.localeCompare(b.name));

  return (
    <div style={{ minHeight:'100vh', background: 'transparent', color: 'var(--text-body)', fontFamily:'var(--font-main)', padding:'60px 20px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'25px', maxWidth:'1100px', margin:'0 auto 40px' }}>
        <button onClick={onBack} className="pf-glass" style={{ border:'none', padding:'12px 30px', cursor:'pointer', fontSize:'13px', fontWeight:'900', letterSpacing:'1.5px', borderRadius:'18px' }}>BACK</button>
        <h1 className="pf-shimmer-text" style={{ fontSize:'32px', fontWeight:'900', margin:0, fontFamily:'var(--font-display)', letterSpacing:'-1.5px' }}>Neural Geo-Pulse</h1>
      </div>

      <div style={{ maxWidth:'1100px', margin:'0 auto' }}>
        <div className="pf-glass" style={{ padding:'30px 40px', marginBottom:'40px', display:'flex', alignItems:'center', gap:'30px', background:'rgba(255,255,255,0.7)', borderRadius:'35px', border:'none', boxShadow:'0 20px 50px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize:'42px', animation:'pulse 2s infinite' }}>{locLoading ? '🔄' : locError ? '⚠️' : '📍'}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:'900', fontSize:'24px', color: 'var(--text-heading)', fontFamily: 'var(--font-display)', letterSpacing:'-0.5px' }}>
              {locLoading ? 'SYNCHRONIZING COORDINATES...' : locError ? 'ESTABLISHING FALLBACK RELAY' : `ORBITAL SYNC: ${userCity.toUpperCase()}`}
            </div>
            <div style={{ fontSize:'14px', color: 'var(--text-body)', marginTop:'8px', fontWeight: '800', opacity:0.6, letterSpacing:'0.5px' }}>
              {locLoading ? 'Accessing global positioning satellites...'
                : userLoc ? `SIGNAL ACQUIRED: ${userLoc.lat.toFixed(6)}°N, ${userLoc.lng.toFixed(6)}°E — LATENCY CALIBRATED`
                : 'TRANSMISSION INTERRUPTED'}
            </div>
          </div>
          {!locLoading && (
            <button onClick={() => { setShowMap(!showMap); }} className="pf-glass" style={{ border:'none', background:'white', color: 'var(--brand-teal)', padding:'14px 30px', cursor:'pointer', fontWeight:'900', fontSize:'13px', borderRadius:'20px', letterSpacing:'1.5px', boxShadow:'0 10px 25px rgba(0,0,0,0.05)' }}>
              {showMap ? 'HIDE MAP' : 'VIEW RADAR'}
            </button>
          )}
        </div>

        {showMap && (
          <div className="pf-glass" style={{ overflow:'hidden', marginBottom:'40px', padding: '15px', background:'rgba(255,255,255,0.5)', borderRadius:'40px', border:'none', animation:'fadeIn 0.5s ease' }}>
            <div ref={mapRef} style={{ height:'450px', width:'100%', borderRadius: '30px', border:'1px solid rgba(0,0,0,0.05)' }} />
            {routeInfo && !routeInfo.error && (
              <div style={{ padding:'25px 35px', background: 'white', marginTop: '15px', borderRadius: '25px', display:'flex', alignItems:'center', gap:'40px', flexWrap:'wrap', boxShadow:'0 15px 40px rgba(0,0,0,0.05)' }}>
                <span style={{ fontWeight:'900', color: 'var(--brand-teal)', fontFamily: 'var(--font-display)', fontSize:'18px' }}>🚗 NEURAL PATHWAY TO {selected?.name}</span>
                <div style={{ display:'flex', gap:'25px' }}>
                  <span style={{ fontWeight: '800', fontSize:'15px' }}>📍 {routeInfo.km} KM</span>
                  <span style={{ fontWeight: '800', fontSize:'15px' }}>⏱ ~{routeInfo.mins} MINS</span>
                </div>
                <a href={`https://www.google.com/maps/dir/${userLoc?.lat},${userLoc?.lng}/${selected?.lat},${selected?.lng}`} target="_blank" rel="noopener noreferrer" className="pf-glow-btn" style={{ padding:'12px 30px', textDecoration:'none', fontSize:'12px', fontWeight:'900', letterSpacing:'1px', borderRadius:'15px' }}>NAVIGATE ↗</a>
              </div>
            )}
            {routeLoading && (
              <div style={{ padding:'20px', textAlign:'center', color: 'var(--brand-teal)', fontSize:'14px', fontWeight: '900', letterSpacing:'1px' }}>SYNTHESIZING OPTIMAL TRAJECTORY...</div>
            )}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'25px', marginBottom:'50px' }}>
          {[
            {emoji:'🏢', label:'Physical Hubs', value:companies.filter(c=>c.mode==='In-Person').length, color:'var(--brand-coral)'},
            {emoji:'🔀', label:'Adaptive Hybrid', value:companies.filter(c=>c.mode==='Hybrid').length, color:'var(--brand-yellow)'},
            {emoji:'💻', label:'Cloud Native', value:companies.filter(c=>c.mode==='Online').length, color:'var(--brand-teal)'},
          ].map((s,i) => (
            <div key={i} className="pf-glass" style={{ padding:'35px', textAlign:'center', borderRadius:'35px', background:'rgba(255,255,255,0.75)', border:'none', boxShadow:'0 20px 45px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize:'32px', marginBottom:'15px' }}>{s.emoji}</div>
              <div style={{ fontSize:'42px', fontWeight:'900', color:'var(--text-heading)', fontFamily: 'var(--font-display)', letterSpacing:'-2px' }}>{s.value}</div>
              <div style={{ fontSize:'12px', color: 'var(--text-body)', marginTop:'5px', fontWeight: '900', textTransform: 'uppercase', letterSpacing:'1.5px', opacity:0.6 }}>{s.label}</div>
              <div style={{ height:'4px', width:'40px', background:s.color, margin:'15px auto 0', borderRadius:'2px', opacity:0.5 }} />
            </div>
          ))}
        </div>

        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <h2 style={{ fontSize:'42px', fontWeight:'900', letterSpacing: '-1.5px', fontFamily: 'var(--font-display)', color:'var(--text-heading)' }}>
            LOCAL HIRING <span className="pf-shimmer-text">ECOSYSTEM</span>
          </h2>
          <p style={{ color: 'var(--text-body)', marginTop:'12px', fontSize:'16px', fontWeight: '700', opacity:0.7 }}>
            {userData?.skill?.icon} {skillName.toUpperCase()} · {filtered.length} NODES DETECTED · REAL-TIME GPS CALIBRATION
          </p>
        </div>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'35px', flexWrap:'wrap', gap:'20px' }}>
          <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
            {['All','In-Person','Hybrid','Online'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={filter===f ? "pf-glow-btn" : "pf-glass"} style={{ border:'none', padding:'12px 28px', cursor:'pointer', fontSize:'13px', fontWeight:'900', borderRadius:'18px', letterSpacing:'1px', textTransform:'uppercase' }}>{f}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:'15px', alignItems:'center' }}>
            <span style={{ fontSize:'12px', color: 'var(--text-body)', fontWeight: '900', textTransform: 'uppercase', opacity:0.5, letterSpacing:'1px' }}>SORT ENGINE:</span>
            {['distance','name'].map(s => (
              <button key={s} onClick={() => setSortBy(s)} className="pf-glass" style={{ border:'none', background: sortBy===s ? 'white' : 'rgba(255,255,255,0.4)', padding:'10px 22px', cursor:'pointer', fontSize:'12px', color: sortBy===s ? 'var(--brand-teal)' : 'var(--text-body)', fontWeight: '900', borderRadius:'15px', letterSpacing:'0.5px' }}>{s === 'distance' ? '📍 DISTANCE' : '🔤 ALPHA'}</button>
            ))}
          </div>
        </div>

        <div className="pf-glass" style={{ overflow:'hidden', marginBottom:'50px', padding: '0', borderRadius:'45px', background:'rgba(255,255,255,0.7)', border:'none', boxShadow:'0 30px 70px rgba(0,0,0,0.05)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'60px 1fr 100px 90px 110px 100px minmax(200px,1fr)', gap:'0', padding:'25px 40px', background: 'rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(0,0,0,0.05)', fontSize:'11px', color: 'var(--text-body)', fontWeight:'900', textTransform:'uppercase', letterSpacing:'2px', opacity:0.6 }}>
            <span>#</span><span>Entity & Intel</span><span>Openings</span><span>Flow</span><span>Interface</span><span>Domain</span><span style={{ textAlign:'right' }}>Command</span>
          </div>
          {locLoading ? (
            <div style={{ padding:'80px', textAlign:'center', color: 'var(--brand-teal)', fontWeight: '900', fontSize:'18px', letterSpacing:'1px' }}>SYNCHRONIZING WITH GEO-RELAY...</div>
          ) : filtered.map((c, i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'60px 1fr 100px 90px 110px 100px minmax(200px,1fr)', gap:'0', padding:'35px 40px', borderBottom: i < filtered.length-1 ? '1px solid rgba(0,0,0,0.05)' : 'none', background: applied[c.name] === 'approved' ? 'rgba(0, 212, 170, 0.04)' : selected?.name === c.name ? 'rgba(245, 166, 35, 0.04)' : 'transparent', alignItems:'start', transition:'all 0.3s' }}>
              <span style={{ color: i===0 ? 'var(--brand-yellow)' : 'var(--text-muted)', fontWeight:'900', fontSize:'16px', paddingTop:'2px' }}>{i===0 ? '⭐' : i+1}</span>
              <div>
                <div style={{ fontWeight:'900', fontSize:'22px', color: 'var(--text-heading)', marginBottom:'6px', fontFamily: 'var(--font-display)', letterSpacing:'-0.5px' }}>{c.name}</div>
                <div style={{ fontSize:'14px', color: 'var(--brand-teal)', marginBottom:'15px', fontWeight: '800', letterSpacing:'0.2px' }}>📍 {c.location.toUpperCase()} · 💼 {c.hiring.toUpperCase()} · 🚗 {c.distance} KM</div>
                
                <p style={{ fontSize:'15px', color: 'var(--text-body)', lineHeight:'1.7', marginBottom:'18px', maxWidth:'95%', fontWeight: '600', opacity:0.8 }}>{c.detailedDescription}</p>

                <div style={{ fontSize:'12px', color: 'var(--text-heading)', background: 'white', padding:'10px 18px', borderRadius:'15px', display:'inline-block', border: '1px solid rgba(0,0,0,0.03)', fontWeight: '700', boxShadow:'0 5px 15px rgba(0,0,0,0.02)' }}>
                  ✨ <span style={{color:'var(--brand-teal)', fontWeight:'900'}}>NEURAL MATCH:</span> {getFitReason(c)}
                </div>
              </div>
              
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'24px', fontWeight:'900', color: c.seats < 5 ? 'var(--brand-coral)' : 'var(--brand-teal)', fontFamily: 'var(--font-display)' }}>{c.seats}</div>
                <div style={{ fontSize:'10px', color: 'var(--text-body)', marginTop:'4px', fontWeight: '900', textTransform: 'uppercase', opacity:0.5 }}>UNITS</div>
              </div>

              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'24px', fontWeight:'900', color: 'var(--text-heading)', fontFamily: 'var(--font-display)' }}>{c.applicants + (applied[c.name] ? 1 : 0)}</div>
                <div style={{ fontSize:'10px', color: 'var(--text-body)', marginTop:'4px', fontWeight: '900', textTransform: 'uppercase', opacity:0.5 }}>SIGNALS</div>
              </div>

              <span style={{ fontSize:'11px', padding:'6px 14px', borderRadius:'20px', background:`${modeColor[c.mode]}15`, color:modeColor[c.mode], border:`1px solid ${modeColor[c.mode]}30`, fontWeight:'900', width:'fit-content', justifySelf:'center', textTransform: 'uppercase', letterSpacing:'1px' }}>{c.mode}</span>
              <span style={{ fontSize:'11px', padding:'6px 14px', borderRadius:'20px', background:`${typeColor[c.type] || '#999'}15`, color:typeColor[c.type] || '#999', border:`1px solid ${typeColor[c.type] || '#999'}30`, fontWeight:'900', width:'fit-content', justifySelf:'center', textTransform: 'uppercase', letterSpacing:'1px' }}>{c.type}</span>
              
              <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', flexWrap:'wrap', alignItems:'center' }}>
                <button type="button" onClick={() => { setShowMap(true); setTimeout(() => getRoute(c), 300); }} className="pf-glass" style={{ border:'none', background:'white', padding:'10px 20px', cursor:'pointer', fontSize:'11px', color: 'var(--brand-teal)', fontWeight:'900', textTransform: 'uppercase', borderRadius:'12px', letterSpacing:'1px', boxShadow:'0 5px 15px rgba(0,0,0,0.03)' }}>ROUTE</button>

                {applied[c.name] === 'approved' ? (
                  <>
                    <span style={{ padding:'10px 22px', borderRadius:'15px', fontSize:'11px', background: 'var(--brand-teal)', color:'#FFFFFF', fontWeight:'900', letterSpacing:'1px' }}>SYNCED</span>
                    <button type="button" onClick={() => handleUnapply(c.name)} className="pf-glass" style={{ border:'none', padding:'10px 20px', cursor:'pointer', fontSize:'11px', color: 'var(--brand-coral)', fontWeight:'900', textTransform:'uppercase', background:'rgba(255,107,107,0.05)', borderRadius:'12px' }}>DROP</button>
                  </>
                ) : applied[c.name] === 'pending' ? (
                  <>
                    <span style={{ padding:'10px 22px', borderRadius:'15px', fontSize:'11px', background: 'var(--brand-yellow)', color:'#FFFFFF', fontWeight:'900', letterSpacing:'1px' }}>QUEUED</span>
                    <button type="button" onClick={() => handleUnapply(c.name)} className="pf-glass" style={{ border:'none', padding:'10px 20px', cursor:'pointer', fontSize:'11px', color: 'var(--brand-coral)', fontWeight:'900', textTransform:'uppercase', background:'rgba(255,107,107,0.05)', borderRadius:'12px' }}>ABORT</button>
                  </>
                ) : (
                  <button type="button" onClick={() => handleApply(c.name)} className="pf-glow-btn" style={{ border:'none', padding:'12px 30px', fontSize:'12px', fontWeight:'900', borderRadius:'15px', letterSpacing:'1.5px' }}>APPLY</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {Object.values(applied).filter(v => v === 'approved').length > 0 && (
          <div className="pf-glass" style={{ border:'none', background: 'rgba(0, 212, 170, 0.1)', padding:'25px 40px', marginBottom:'40px', textAlign:'center', borderRadius:'30px', animation:'msgIn 0.5s ease' }}>
            <span style={{ color: 'var(--brand-teal)', fontWeight:'900', fontSize: '18px', fontFamily:'var(--font-display)', letterSpacing:'-0.5px' }}>🚀 SIGNAL CLEAR: YOU HAVE {Object.values(applied).filter(v => v === 'approved').length} INDUSTRY-APPROVED APPLICATIONS READY FOR TRANSMISSION!</span>
          </div>
        )}

        <div style={{ textAlign:'center', marginBottom: '80px' }}>
          <button onClick={onNext} className="pf-glow-btn" style={{ padding:'22px 60px', fontSize:'18px', fontWeight:'900', cursor:'pointer', borderRadius:'25px', letterSpacing:'2px' }}>VISUALIZE SKILL DNA MAP →</button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes msgIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
        .leaflet-container { background: #fdfcf8 !important; }
        .leaflet-popup-content-wrapper { background: rgba(255,255,255,0.9) !important; backdrop-filter: blur(10px); border-radius: 15px !important; box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important; color: var(--text-heading) !important; }
        .leaflet-popup-tip { background: rgba(255,255,255,0.9) !important; }
      `}</style>
    </div>
  );
}