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

const modeColor = {'In-Person':'#2ECC71','Hybrid':'#F39C12','Online':'#3498DB'};
const typeColor = {'MNC':'#9B59B6','Startup':'#FF6B35','Govt':'#2ECC71'};

export default function GeoCompany({ userData, onBack, onNext, onProgressUpdate }) {
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

  // Sync statuses with real time (and when appliedJobs is cleared)
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

  const handleApply = (company) => {
    // Redirect to company's career website
    if (company.website) {
      window.open(company.website, '_blank');
    } else {
      // Fallback to a generic job search if no website is specified
      window.open(`https://www.google.com/search?q=${encodeURIComponent(company.name + ' careers jobs')}`, '_blank');
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

  // Step 1: Get live GPS
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Step 2: Calculate real distances
  useEffect(() => {
    if (!userLoc) return;
    const raw = BASE_COMPANIES[skillName] || BASE_COMPANIES['default'];
    const withDist = raw.map(c => ({ ...c, distance: haversine(userLoc.lat, userLoc.lng, c.lat, c.lng) }));
    setCompanies(withDist);
  }, [userLoc, skillName]);

  // Step 3: Init Leaflet map
  useEffect(() => {
    if (!showMap || !mapRef.current || mapInst.current) return;
    const map = L.map(mapRef.current).setView([28.5355, 77.3910], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors', maxZoom: 18
    }).addTo(map);
    mapInst.current = map;
  }, [showMap]);

  // Step 4: Update map markers when location/companies ready
  useEffect(() => {
    if (!showMap || !mapInst.current || !userLoc || companies.length === 0) return;
    const map = mapInst.current;

    // User dot
    const userIcon = L.divIcon({
      html: `<div style="width:18px;height:18px;background:#3498DB;border:3px solid white;border-radius:50%;box-shadow:0 0 12px rgba(52,152,219,0.9)"></div>`,
      iconSize: [18,18], iconAnchor: [9,9], className: ''
    });
    L.marker([userLoc.lat, userLoc.lng], { icon: userIcon }).addTo(map)
      .bindPopup(`<b>📍 You are here</b><br>${userCity}`).openPopup();
    map.setView([userLoc.lat, userLoc.lng], 11);

    // Remove old company markers
    companyMarkers.current.forEach(m => m.remove());
    companyMarkers.current = [];

    companies.forEach(c => {
      const icon = L.divIcon({
        html: `<div style="background:#FF6B35;color:white;padding:3px 8px;border-radius:10px;font-size:10px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.4);cursor:pointer">${c.name}</div>`,
        className: '', iconAnchor: [0,0]
      });
      const marker = L.marker([c.lat, c.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${c.name}</b><br>📍 ${c.location}<br>💼 ${c.hiring}<br>🚗 ${c.distance} km away`)
        .on('click', () => setSelected(c));
      companyMarkers.current.push(marker);
    });
  }, [showMap, userLoc, companies, userCity]);

  // Step 5: Draw route via OSRM
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
        routeLayer.current = L.polyline(coords, { color: '#FF6B35', weight: 5, opacity: 0.85 }).addTo(mapInst.current);
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', color:'white', fontFamily:'Arial,sans-serif', padding:'30px 20px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:'16px', maxWidth:'1000px', margin:'0 auto 24px' }}>
        <button onClick={onBack} style={{ background:'transparent', color:'rgba(255,255,255,0.6)', border:'1px solid rgba(255,255,255,0.2)', padding:'8px 18px', borderRadius:'20px', cursor:'pointer', fontSize:'13px' }}>← Back</button>
        <h1 style={{ color:'#FF6B35', fontSize:'22px', fontWeight:'bold', margin:0 }}>⚡ PathForge</h1>
      </div>

      <div style={{ maxWidth:'1000px', margin:'0 auto' }}>

        {/* Location Detection Banner (Swiggy-style) */}
        <div style={{ background:'rgba(52,152,219,0.12)', border:'1px solid rgba(52,152,219,0.3)', borderRadius:'16px', padding:'16px 24px', marginBottom:'24px', display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ fontSize:'28px' }}>{locLoading ? '🔄' : locError ? '⚠️' : '📍'}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:'bold', fontSize:'16px' }}>
              {locLoading ? 'Detecting your location...' : locError ? 'Using fallback location' : `📍 ${userCity}`}
            </div>
            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.55)', marginTop:'3px' }}>
              {locLoading ? 'Getting GPS coordinates...'
                : userLoc ? `GPS: ${userLoc.lat.toFixed(4)}°N, ${userLoc.lng.toFixed(4)}°E — Distances calculated in real-time`
                : 'Location unavailable'}
            </div>
          </div>
          {!locLoading && (
            <button onClick={() => { setShowMap(!showMap); }} style={{ background: showMap ? 'rgba(255,107,53,0.2)' : 'rgba(255,107,53,0.15)', color:'#FF6B35', border:'1px solid rgba(255,107,53,0.4)', padding:'8px 18px', borderRadius:'20px', cursor:'pointer', fontWeight:'bold', fontSize:'13px' }}>
              {showMap ? '🗺️ Hide Map' : '🗺️ Show Map'}
            </button>
          )}
        </div>

        {/* Leaflet Map */}
        {showMap && (
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'16px', overflow:'hidden', marginBottom:'24px' }}>
            <div ref={mapRef} style={{ height:'420px', width:'100%' }} />
            {routeInfo && !routeInfo.error && (
              <div style={{ padding:'14px 20px', background:'rgba(255,107,53,0.1)', borderTop:'1px solid rgba(255,107,53,0.2)', display:'flex', alignItems:'center', gap:'24px', flexWrap:'wrap' }}>
                <span style={{ fontWeight:'bold', color:'#FF6B35' }}>🚗 Route to {selected?.name}</span>
                <span>📍 {routeInfo.km} km</span>
                <span>⏱ ~{routeInfo.mins} mins driving</span>
                <a href={`https://www.google.com/maps/dir/${userLoc?.lat},${userLoc?.lng}/${selected?.lat},${selected?.lng}`} target="_blank" rel="noopener noreferrer" style={{ background:'#4285F4', color:'white', padding:'6px 16px', borderRadius:'20px', textDecoration:'none', fontSize:'13px', fontWeight:'bold' }}>Open in Google Maps ↗</a>
              </div>
            )}
            {routeLoading && (
              <div style={{ padding:'14px 20px', textAlign:'center', color:'rgba(255,255,255,0.6)', fontSize:'13px' }}>⏳ Calculating route...</div>
            )}
          </div>
        )}

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'24px' }}>
          {[
            {emoji:'🏢', label:'In-Person', value:companies.filter(c=>c.mode==='In-Person').length, color:'#2ECC71'},
            {emoji:'🔀', label:'Hybrid', value:companies.filter(c=>c.mode==='Hybrid').length, color:'#F39C12'},
            {emoji:'💻', label:'Online / Remote', value:companies.filter(c=>c.mode==='Online').length, color:'#3498DB'},
          ].map((s,i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${s.color}44`, borderRadius:'14px', padding:'16px', textAlign:'center' }}>
              <div style={{ fontSize:'22px' }}>{s.emoji}</div>
              <div style={{ fontSize:'26px', fontWeight:'bold', color:s.color, marginTop:'4px' }}>{s.value}</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', marginTop:'2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Title */}
        <div style={{ textAlign:'center', marginBottom:'20px' }}>
          <h2 style={{ fontSize:'22px', fontWeight:'bold' }}>Companies Hiring Near {userCity}</h2>
          <p style={{ color:'rgba(255,255,255,0.5)', marginTop:'4px', fontSize:'13px' }}>{userData?.skill?.icon} {skillName} · {filtered.length} companies found · Sorted by real distance from your GPS</p>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'12px' }}>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {['All','In-Person','Hybrid','Online'].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding:'7px 16px', borderRadius:'20px', cursor:'pointer', fontSize:'13px', fontWeight: filter===f ? 'bold' : 'normal', background: filter===f ? '#FF6B35' : 'rgba(255,255,255,0.06)', color:'white', border: filter===f ? 'none' : '1px solid rgba(255,255,255,0.15)' }}>{f}</button>
            ))}
          </div>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>Sort:</span>
            {['distance','name'].map(s => (
              <button key={s} onClick={() => setSortBy(s)} style={{ padding:'6px 14px', borderRadius:'16px', cursor:'pointer', fontSize:'12px', background: sortBy===s ? 'rgba(255,107,53,0.25)' : 'rgba(255,255,255,0.06)', color: sortBy===s ? '#FF6B35' : 'white', border: sortBy===s ? '1px solid #FF6B35' : '1px solid rgba(255,255,255,0.15)' }}>{s === 'distance' ? '📍 Distance' : '🔤 Name'}</button>
            ))}
          </div>
        </div>

        {/* Company Table */}
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', overflow:'hidden', marginBottom:'24px' }}>
          {/* Table header */}
          <div style={{ display:'grid', gridTemplateColumns:'40px 1fr 100px 90px 110px 100px minmax(200px,1fr)', gap:'0', padding:'12px 20px', background:'rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.08)', fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:'bold', textTransform:'uppercase', letterSpacing:'0.5px' }}>
            <span>#</span><span>Company & Job Brief</span><span>Seats</span><span>Applied</span><span>Mode</span><span>Type</span><span style={{ textAlign:'right' }}>Actions</span>
          </div>
          {locLoading ? (
            <div style={{ padding:'40px', textAlign:'center', color:'rgba(255,255,255,0.4)' }}>🔄 Calculating distances from your location...</div>
          ) : filtered.map((c, i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'40px 1fr 100px 90px 110px 100px minmax(200px,1fr)', gap:'0', padding:'18px 20px', borderBottom: i < filtered.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: applied[c.name] === 'approved' ? 'rgba(46,204,113,0.05)' : selected?.name === c.name ? 'rgba(255,107,53,0.05)' : 'transparent', alignItems:'start', transition:'background 0.2s' }}>
              <span style={{ color: i===0 ? 'gold' : 'rgba(255,255,255,0.3)', fontWeight:'bold', fontSize:'13px', paddingTop:'2px' }}>{i===0 ? '⭐' : i+1}</span>
              <div>
                <div style={{ fontWeight:'bold', fontSize:'15px', marginBottom:'4px' }}>{c.name}</div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', marginBottom:'8px' }}>📍 {c.location} · 💼 {c.hiring} · 🚗 {c.distance} km</div>
                
                <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', lineHeight:'1.5', marginBottom:'10px', maxWidth:'90%' }}>{c.detailedDescription}</p>

                <div style={{ fontSize:'11px', color:'#FF6B35', background:'rgba(255,107,53,0.1)', padding:'4px 10px', borderRadius:'6px', display:'inline-block' }}>
                  ✨ Why Match? {getFitReason(c)}
                </div>
              </div>
              
              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'14px', fontWeight:'bold', color: c.seats < 5 ? '#E74C3C' : '#2ECC71' }}>{c.seats}</div>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', marginTop:'2px' }}>Openings</div>
              </div>

              <div style={{ textAlign:'center' }}>
                <div style={{ fontSize:'14px', fontWeight:'bold', color:'#3498DB' }}>{c.applicants + (applied[c.name] ? 1 : 0)}</div>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', marginTop:'2px' }}>Applied</div>
              </div>

              <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'20px', background:`${modeColor[c.mode]}22`, color:modeColor[c.mode], border:`1px solid ${modeColor[c.mode]}44`, fontWeight:'bold', width:'fit-content', justifySelf:'center' }}>{c.mode}</span>
              <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'20px', background:`${typeColor[c.type] || '#999'}22`, color:typeColor[c.type] || '#999', border:`1px solid ${typeColor[c.type] || '#999'}44`, fontWeight:'bold', width:'fit-content', justifySelf:'center' }}>{c.type}</span>
              
              <div style={{ display:'flex', gap:'6px', justifyContent:'flex-end', flexWrap:'wrap', alignItems:'center' }}>
                <button type="button" onClick={() => { setShowMap(true); setTimeout(() => getRoute(c), 300); }} style={{ padding:'6px 12px', borderRadius:'14px', cursor:'pointer', fontSize:'11px', background:'rgba(52,152,219,0.15)', color:'#3498DB', border:'1px solid rgba(52,152,219,0.3)', fontWeight:'bold' }}>🗺 Route</button>

                {applied[c.name] === 'approved' ? (
                  <>
                    <span style={{ padding:'6px 12px', borderRadius:'14px', fontSize:'11px', background:'rgba(46,204,113,1)', color:'white', fontWeight:'bold' }}>✅ APPROVED</span>
                    <button type="button" onClick={() => handleUnapply(c.name)} style={{ padding:'6px 10px', borderRadius:'14px', cursor:'pointer', fontSize:'10px', background:'rgba(231,76,60,0.15)', color:'#E74C3C', border:'1px solid rgba(231,76,60,0.45)', fontWeight:'bold' }} title="Withdraw this application">Unapply</button>
                  </>
                ) : applied[c.name] === 'pending' ? (
                  <>
                    <span style={{ padding:'6px 12px', borderRadius:'14px', fontSize:'10px', background:'rgba(255,255,255,0.1)', color:'#F39C12', border:'1px solid #F39C12', fontWeight:'bold' }}>⏳ PENDING</span>
                    <button type="button" onClick={() => handleUnapply(c.name)} style={{ padding:'6px 10px', borderRadius:'14px', cursor:'pointer', fontSize:'10px', background:'rgba(231,76,60,0.15)', color:'#E74C3C', border:'1px solid rgba(231,76,60,0.45)', fontWeight:'bold' }} title="Cancel this application">Unapply</button>
                  </>
                ) : (
                  <button type="button" onClick={() => handleApply(c)} style={{ padding:'6px 20px', borderRadius:'14px', cursor:'pointer', fontSize:'11px', background:'#FF6B35', color:'white', border:'none', fontWeight:'bold' }}>Apply</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {Object.values(applied).filter(v => v === 'approved').length > 0 && (
          <div style={{ background:'rgba(46,204,113,0.1)', border:'1px solid rgba(46,204,113,0.3)', borderRadius:'14px', padding:'14px 24px', marginBottom:'24px', textAlign:'center' }}>
            <span style={{ color:'#2ECC71', fontWeight:'bold' }}>🎉 You have {Object.values(applied).filter(v => v === 'approved').length} industry-approved application{Object.values(applied).filter(v => v === 'approved').length > 1 ? 's' : ''}!</span>
          </div>
        )}

        <div style={{ textAlign:'center' }}>
          <button onClick={onNext} style={{ background:'#FF6B35', color:'white', border:'none', padding:'16px 48px', borderRadius:'30px', fontSize:'17px', fontWeight:'bold', cursor:'pointer' }}>View My Skill DNA Map →</button>
        </div>
      </div>
    </div>
  );
}