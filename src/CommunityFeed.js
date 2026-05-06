import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, updateDoc, doc, arrayUnion, arrayRemove, serverTimestamp, getDocs, where, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

// Helper to format "time ago"
const timeAgo = (date) => {
  if (!date) return 'Just now';
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' years ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' months ago';
  interval = seconds / 604800;
  if (interval > 1) return Math.floor(interval) + ' weeks ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' days ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' hours ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minutes ago';
  return 'Just now';
};

// Compress image using canvas before storing
const compressImage = (file, maxWidth = 900, quality = 0.75) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round((h * maxWidth) / w); w = maxWidth; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    };
  });

const defaultTheme = { 
  pageBg:'var(--bg-base)', 
  cardBg:'var(--glass-bg)', 
  inputBg:'rgba(255, 255, 255, 0.6)', 
  border:'var(--glass-border)', 
  textPrimary:'var(--text-heading)', 
  textMuted:'var(--text-body)', 
  accent:'var(--brand-teal)', 
  accentHover:'var(--brand-yellow)', 
  accentLight:'rgba(0, 212, 170, 0.1)', 
  success:'var(--brand-teal)', 
  warning:'var(--brand-yellow)', 
  error:'var(--brand-coral)' 
};

export default function CommunityFeed({ user, userData, onBack, onGoToProfile, theme = defaultTheme }) {
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [postImage, setPostImage] = useState(null);  // base64 image for new post
  const [posting, setPosting] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [toast, setToast] = useState('');
  const imgInputRef = useRef(null);

  const displayName = userData?.name || user?.displayName || user?.email?.split('@')[0] || 'Student';
  const displayPhoto = userData?.profilePhoto || null;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    const q = query(collection(db, 'posts'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      postsData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setPosts(postsData);
    }, (error) => console.error('Firestore Error:', error));
    return () => unsubscribe();
  }, []);

  // Handle image file selection → compress → store as base64 preview
  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('⚠️ Please select an image file.'); return; }
    try {
      const compressed = await compressImage(file);
      setPostImage(compressed);
    } catch { showToast('⚠️ Failed to load image.'); }
    e.target.value = ''; // reset input so same file can be re-selected
  };

  const handlePost = async () => {
    if (!newPostText.trim() && !postImage) return;
    setPosting(true);
    try {
      await addDoc(collection(db, 'posts'), {
        text: newPostText,
        imageUrl: postImage || null,
        authorId: user.uid,
        authorName: displayName,
        authorPhoto: displayPhoto,
        createdAt: serverTimestamp(),
        likes: [],
        comments: [],
        reposts: []
      });
      setNewPostText('');
      setPostImage(null);
    } catch (err) {
      console.error('Error posting:', err);
      showToast('⚠️ Failed to post. Image may be too large.');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId, currentLikes) => {
    const postRef = doc(db, 'posts', postId);
    const hasLiked = currentLikes?.includes(user.uid);
    try {
      if (hasLiked) await updateDoc(postRef, { likes: arrayRemove(user.uid) });
      else await updateDoc(postRef, { likes: arrayUnion(user.uid) });
    } catch (err) { console.error('Error toggling like:', err); }
  };

  const handleComment = async (postId) => {
    if (!commentText.trim()) return;
    const postRef = doc(db, 'posts', postId);
    try {
      await updateDoc(postRef, {
        comments: arrayUnion({
          id: Date.now().toString(),
          text: commentText,
          authorId: user.uid,
          authorName: displayName,
          authorPhoto: displayPhoto,
          createdAt: new Date().toISOString()
        })
      });
      setCommentText('');
      setActiveCommentPost(null);
    } catch (err) { console.error('Error adding comment:', err); }
  };

  const handleRepost = async (post) => {
    const alreadyReposted = post.reposts?.includes(user.uid);
    if (alreadyReposted) {
      try {
        await updateDoc(doc(db, 'posts', post.id), { reposts: arrayRemove(user.uid) });
        const snap = await getDocs(query(collection(db, 'posts'), where('isRepost', '==', true), where('originalPostId', '==', post.id), where('authorId', '==', user.uid)));
        for (const d of snap.docs) await deleteDoc(doc(db, 'posts', d.id));
        showToast('Repost removed.');
      } catch (err) { console.error('Error removing repost:', err); }
    } else {
      if (!window.confirm('Repost this to the community?')) return;
      try {
        await addDoc(collection(db, 'posts'), {
          isRepost: true, originalPostId: post.id, originalAuthorId: post.authorId,
          originalAuthorName: post.isRepost ? post.originalAuthorName : post.authorName,
          originalAuthorPhoto: post.isRepost ? post.originalAuthorPhoto : post.authorPhoto,
          text: post.text, imageUrl: post.imageUrl || null,
          authorId: user.uid, authorName: displayName, authorPhoto: displayPhoto,
          createdAt: serverTimestamp(), likes: [], comments: [], reposts: []
        });
        await updateDoc(doc(db, 'posts', post.id), { reposts: arrayUnion(user.uid) });
        showToast('✅ Reposted to the community!');
      } catch (err) { console.error('Error reposting:', err); }
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      showToast('🗑 Post deleted.');
    } catch (err) { console.error('Error deleting post:', err); }
  };

  const handleShare = async (postId) => {
    const shareUrl = `${window.location.origin}?post=${postId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('🔗 Link copied! Share it to bring people to PathForge.');
    } catch {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el); el.select();
      document.execCommand('copy'); document.body.removeChild(el);
      showToast('🔗 Link copied!');
    }
  };

  const handleAvatarClick = (authorId) => {
    if (authorId === user.uid) { if (onGoToProfile) onGoToProfile(); }
    else setSelectedProfileId(authorId);
  };

  const displayedPosts = selectedProfileId ? posts.filter(p => p.authorId === selectedProfileId) : posts;
  const selectedProfileName = selectedProfileId ? posts.find(p => p.authorId === selectedProfileId)?.authorName : '';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-body)', fontFamily: 'var(--font-main)', padding: '80px 20px', position: 'relative' }}>

      {/* Toast */}
      {toast && (
        <div className="pf-glass" style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', border: 'none', color: 'var(--text-heading)', padding: '20px 45px', borderRadius: '40px', fontSize: '15px', fontWeight: '900', zIndex: 9999, boxShadow: '0 40px 100px rgba(0, 212, 170, 0.2)', background:'white', animation: 'fadeInToast 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent:'space-between', marginBottom: '80px' }}>
          <button onClick={() => selectedProfileId ? setSelectedProfileId(null) : (onBack && onBack())} className="pf-glass" style={{ border: 'none', padding: '16px 35px', cursor: 'pointer', fontSize: '13px', fontWeight:'900', letterSpacing:'1.5px', borderRadius:'25px', textTransform:'uppercase' }}>BACK</button>
          <h1 className="pf-shimmer-text" style={{ fontSize: '42px', fontWeight: '900', margin: 0, fontFamily:'var(--font-display)', letterSpacing:'-2px' }}>
            {selectedProfileId ? `${selectedProfileName}'s Orbit` : 'Neural Community Orbit'}
          </h1>
        </div>

        {/* Post Composer */}
        {!selectedProfileId && (
          <div className="pf-glass composer-card" style={{ padding: '50px', marginBottom: '80px', background:'white !important', borderRadius:'50px', border:'none', boxShadow:'0 40px 100px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: '30px' }}>
              <div onClick={() => handleAvatarClick(user.uid)} className="pf-glass" style={{ width: '75px', height: '75px', borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: 'pointer', border:'none', boxShadow:'0 15px 35px rgba(0,0,0,0.08)' }}>
                {displayPhoto ? <img src={displayPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{fontSize:'38px'}}>👤</span>}
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="WHAT'S BREWING IN YOUR CAREER TRACK?"
                  style={{ width: '100%', minHeight: '160px', padding: '30px', borderRadius: '30px', border: 'none', background: 'rgba(0,0,0,0.02)', color: 'var(--text-heading)', fontSize: '18px', fontWeight:'700', resize: 'none', boxSizing: 'border-box', outline: 'none', fontFamily:'var(--font-main)', letterSpacing:'-0.2px' }}
                />

                {/* Image preview */}
                {postImage && (
                  <div className="pf-glass" style={{ position: 'relative', marginTop: '30px', borderRadius: '35px', overflow: 'hidden', border: 'none', boxShadow:'0 25px 60px rgba(0,0,0,0.1)' }}>
                    <img src={postImage} alt="preview" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }} />
                    <button onClick={() => setPostImage(null)} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background:'white', color:'var(--brand-coral)', fontWeight:'900', boxShadow:'0 10px 25px rgba(0,0,0,0.15)' }}>✕</button>
                  </div>
                )}

                {/* Hidden file input */}
                <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
                  <button
                    onClick={() => imgInputRef.current?.click()}
                    className="pf-glass"
                    style={{ background: postImage ? 'var(--brand-teal) !important' : 'rgba(0,0,0,0.03) !important', color: postImage ? 'white' : 'var(--brand-teal)', border: 'none', padding: '16px 35px', borderRadius: '25px', fontSize: '13px', fontWeight:'900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', letterSpacing:'1.5px', textTransform:'uppercase' }}
                  >
                    {postImage ? 'IMAGE SYNCED ✓' : '🖼️ ATTACH MEDIA'}
                  </button>
                  <button
                    onClick={handlePost}
                    disabled={posting || (!newPostText.trim() && !postImage)}
                    className={posting || (!newPostText.trim() && !postImage) ? "" : "pf-glow-btn"}
                    style={{ border: 'none', padding: '20px 60px', borderRadius: '35px', fontWeight: '900', cursor: posting || (!newPostText.trim() && !postImage) ? 'not-allowed' : 'pointer', textTransform:'uppercase', letterSpacing:'2.5px', fontSize:'15px', background: posting || (!newPostText.trim() && !postImage) ? 'rgba(0,0,0,0.05)' : 'var(--brand-teal)', color:'white' }}
                  >
                    {posting ? 'EMITTING...' : 'LAUNCH'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
          {displayedPosts.length === 0 ? (
            <div className="pf-glass" style={{ textAlign: 'center', padding: '150px 20px', borderRadius:'50px', background:'white !important', border:'none', boxShadow:'0 30px 70px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '90px', marginBottom: '30px', opacity: 0.2 }}>🛸</div>
              <div style={{fontWeight:'900', fontSize:'28px', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-1px'}}>ORBIT IS VACANT.</div>
              <div style={{fontWeight:'700', fontSize:'18px', color:'var(--text-muted)', marginTop:'15px'}}>BE THE FIRST TO TRANSMIT FROM THIS SECTOR.</div>
            </div>
          ) : (
            displayedPosts.map((post) => {
              const postDate = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();
              const hasLiked = post.likes?.includes(user.uid);
              const hasReposted = post.reposts?.includes(user.uid);
              const likeCount = post.likes?.length || 0;
              const commentCount = post.comments?.length || 0;
              const repostCount = post.reposts?.length || 0;
              const postAuthorId = post.isRepost ? post.originalAuthorId : post.authorId;
              const postAuthorPhoto = post.isRepost ? post.originalAuthorPhoto : post.authorPhoto;
              const postAuthorName = post.isRepost ? post.originalAuthorName : post.authorName;

              return (
                <div key={post.id} className="pf-glass post-card" style={{ padding: '50px', borderRadius: '50px', animation: 'fadeInPost 0.8s cubic-bezier(0.16, 1, 0.3, 1) both', background:'white !important', border:'none', boxShadow:'0 30px 80px rgba(0,0,0,0.04)' }}>

                  {post.isRepost && (
                    <div style={{ fontSize: '14px', color: 'var(--brand-teal)', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight:'900', letterSpacing:'1.5px', textTransform:'uppercase' }}>
                      <span style={{fontSize:'22px'}}>🔄</span> {post.authorName} SIGNAL RE-EMITTED
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '30px' }}>
                    <div onClick={() => handleAvatarClick(postAuthorId)} title={postAuthorId === user.uid ? 'Go to your profile' : `View ${postAuthorName}'s orbit`} className="pf-glass" style={{ width: '80px', height: '80px', borderRadius: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: 'pointer', border:'none', boxShadow:'0 15px 35px rgba(0,0,0,0.08)' }}>
                      {postAuthorPhoto ? <img src={postAuthorPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{fontSize:'42px'}}>👤</span>}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div onClick={() => handleAvatarClick(postAuthorId)} style={{ cursor: 'pointer' }}>
                          <div style={{ fontWeight: '900', fontSize: '24px', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-1px' }}>{postAuthorName}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', fontWeight:'800', textTransform:'uppercase', letterSpacing:'1.5px' }}>{timeAgo(postDate)}</div>
                        </div>
                        {post.authorId === user.uid && (
                          <button onClick={() => handleDelete(post.id)} title="Purge Transmission" style={{ border: 'none', width: '48px', height: '48px', borderRadius: '18px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color:'var(--brand-coral)', background:'rgba(255, 107, 107, 0.05)', transition:'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>🗑</button>
                        )}
                      </div>

                      {post.text && (
                        <div style={{ marginTop: '25px', fontSize: '20px', lineHeight: '1.8', color: 'var(--text-heading)', whiteSpace: 'pre-wrap', fontWeight:'600', letterSpacing:'-0.3px' }}>{post.text}</div>
                      )}

                      {/* Post image display */}
                      {post.imageUrl && (
                        <div style={{ marginTop: '30px', borderRadius: '40px', overflow: 'hidden', border: 'none', boxShadow:'0 30px 70px rgba(0,0,0,0.08)' }}>
                          <img src={post.imageUrl} alt="post content" style={{ width: '100%', maxHeight: '600px', objectFit: 'cover', display: 'block' }} />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '50px', marginTop: '45px', borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '40px' }}>
                        <button onClick={() => handleLike(post.id, post.likes)} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'transparent', border: 'none', color: hasLiked ? 'var(--brand-coral)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', padding: 0, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', fontWeight:'900' }}>
                          <span style={{ fontSize: '32px', filter: hasLiked ? 'drop-shadow(0 0 15px rgba(255, 107, 107, 0.4))' : 'none' }}>{hasLiked ? '❤️' : '🤍'}</span>{likeCount > 0 ? likeCount : ''}
                        </button>
                        <button onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'transparent', border: 'none', color: activeCommentPost === post.id ? 'var(--brand-teal)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', padding: 0, fontWeight:'900' }}>
                          <span style={{ fontSize: '32px' }}>💬</span>{commentCount > 0 ? commentCount : ''}
                        </button>
                        <button onClick={() => handleRepost(post)} title={hasReposted ? 'Undo Re-emission' : 'Re-emit Signal'} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'transparent', border: 'none', color: hasReposted ? 'var(--brand-teal)' : 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', padding: 0, transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', fontWeight:'900' }}>
                          <span style={{ fontSize: '32px', filter: hasReposted ? 'drop-shadow(0 0 15px rgba(0, 212, 170, 0.4))' : 'none' }}>🔄</span>{repostCount > 0 ? repostCount : ''}
                        </button>
                        <button onClick={() => handleShare(post.id)} title="Export Signal Link" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', padding: 0 }}>
                          <span style={{ fontSize: '32px' }}>📤</span>
                        </button>
                      </div>

                      {/* Comments section */}
                      {activeCommentPost === post.id && (
                        <div className="pf-glass comments-area" style={{ marginTop: '45px', background: 'rgba(0,0,0,0.015) !important', borderRadius: '40px', padding: '40px', border:'none' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginBottom: '35px' }}>
                            {post.comments?.map((c) => (
                              <div key={c.id} style={{ display: 'flex', gap: '20px', animation:'msgIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
                                <div onClick={() => handleAvatarClick(c.authorId)} className="pf-glass" style={{ width: '50px', height: '50px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: 'pointer', border:'none', boxShadow:'0 8px 20px rgba(0,0,0,0.04)' }}>
                                  {c.authorPhoto ? <img src={c.authorPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '20px' }}>👤</span>}
                                </div>
                                <div style={{ flex: 1, padding: '24px 30px', borderRadius: '0 30px 30px 30px', border:'none', background:'white', boxShadow:'0 15px 40px rgba(0,0,0,0.03)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span onClick={() => handleAvatarClick(c.authorId)} style={{ fontWeight: '900', fontSize: '16px', cursor: 'pointer', color:'var(--text-heading)', fontFamily:'var(--font-display)', letterSpacing:'-0.2px' }}>{c.authorName}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight:'800', textTransform:'uppercase', letterSpacing:'1px' }}>{timeAgo(new Date(c.createdAt))}</span>
                                  </div>
                                  <div style={{ fontSize: '17px', color: 'var(--text-heading)', fontWeight:'600', lineHeight:'1.6' }}>{c.text}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: '20px', background:'white', padding:'10px', borderRadius:'30px', boxShadow:'0 20px 50px rgba(0,0,0,0.04)' }}>
                            <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="ADD TO THIS THREAD..." onKeyDown={(e) => { if (e.key === 'Enter') handleComment(post.id); }} style={{ flex: 1, padding: '16px 30px', borderRadius: '25px', border: 'none', background: 'transparent', color: 'var(--text-heading)', fontSize: '17px', outline: 'none', fontWeight:'700', fontFamily:'var(--font-main)' }} />
                            <button onClick={() => handleComment(post.id)} disabled={!commentText.trim()} className={commentText.trim() ? "pf-glow-btn" : ""} style={{ border: 'none', padding: '0 40px', borderRadius: '22px', fontWeight: '900', cursor: commentText.trim() ? 'pointer' : 'not-allowed', fontSize:'13px', textTransform:'uppercase', letterSpacing:'2px', background: commentText.trim() ? 'var(--brand-teal)' : 'rgba(0,0,0,0.05)', color:'white' }}>SEND</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeInToast { from { opacity: 0; transform: translateX(-50%) translateY(40px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes fadeInPost { from { opacity: 0; transform: translateY(60px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes msgIn { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .post-card { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .post-card:hover { transform: translateY(-10px); box-shadow: 0 40px 100px rgba(0,0,0,0.08) !important; }
      `}</style>
    </div>
  );
}
