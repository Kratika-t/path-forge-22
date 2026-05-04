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

export default function CommunityFeed({ user, userData, onBack, onGoToProfile }) {
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: 'white', fontFamily: 'Arial, sans-serif', padding: '30px 20px', position: 'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(30,30,60,0.97)', border: '1px solid rgba(255,107,53,0.5)', color: 'white', padding: '12px 24px', borderRadius: '30px', fontSize: '14px', fontWeight: 'bold', zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.5)', animation: 'fadeIn 0.3s ease' }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
          <button onClick={() => selectedProfileId ? setSelectedProfileId(null) : (onBack && onBack())} style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}>← Back</button>
          <h1 style={{ color: '#FF6B35', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
            {selectedProfileId ? `${selectedProfileName}'s Posts` : '⚡ Global Community Feed'}
          </h1>
        </div>

        {/* Post Composer */}
        {!selectedProfileId && (
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', marginBottom: '30px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div onClick={() => handleAvatarClick(user.uid)} style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}>
                {displayPhoto ? <img src={displayPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
              </div>
              <div style={{ flex: 1 }}>
                <textarea
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="What's happening?"
                  style={{ width: '100%', minHeight: '80px', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '15px', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                />

                {/* Image preview */}
                {postImage && (
                  <div style={{ position: 'relative', marginTop: '10px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={postImage} alt="preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }} />
                    <button onClick={() => setPostImage(null)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                  </div>
                )}

                {/* Hidden file input */}
                <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <button
                    onClick={() => imgInputRef.current?.click()}
                    style={{ background: postImage ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.1)', color: postImage ? '#FF6B35' : 'white', border: postImage ? '1px solid rgba(255,107,53,0.4)' : 'none', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    🖼️ {postImage ? 'Image Added ✓' : 'Add Image'}
                  </button>
                  <button
                    onClick={handlePost}
                    disabled={posting || (!newPostText.trim() && !postImage)}
                    style={{ background: posting || (!newPostText.trim() && !postImage) ? 'rgba(255,107,53,0.5)' : '#FF6B35', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '20px', fontWeight: 'bold', cursor: posting || (!newPostText.trim() && !postImage) ? 'not-allowed' : 'pointer' }}
                  >
                    {posting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {displayedPosts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.4)' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📄</div>
              <div>No posts yet. Be the first to share!</div>
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
                <div key={post.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>

                  {post.isRepost && (
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🔄</span> {post.authorName} reposted
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div onClick={() => handleAvatarClick(postAuthorId)} title={postAuthorId === user.uid ? 'Go to your profile' : `View ${postAuthorName}'s posts`} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}>
                      {postAuthorPhoto ? <img src={postAuthorPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div onClick={() => handleAvatarClick(postAuthorId)} style={{ cursor: 'pointer' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{postAuthorName}</div>
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{timeAgo(postDate)}</div>
                        </div>
                        {post.authorId === user.uid && (
                          <button onClick={() => handleDelete(post.id)} title="Delete post" style={{ background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.2)', color: '#FF6B6B', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🗑</button>
                        )}
                      </div>

                      {post.text && (
                        <div style={{ marginTop: '10px', fontSize: '15px', lineHeight: '1.5', color: 'rgba(255,255,255,0.9)', whiteSpace: 'pre-wrap' }}>{post.text}</div>
                      )}

                      {/* Post image display */}
                      {post.imageUrl && (
                        <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <img src={post.imageUrl} alt="post" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', display: 'block' }} />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '24px', marginTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
                        <button onClick={() => handleLike(post.id, post.likes)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: hasLiked ? '#FF6B35' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', padding: 0, transition: 'color 0.2s' }}>
                          <span style={{ fontSize: '16px' }}>{hasLiked ? '❤️' : '🤍'}</span>{likeCount > 0 ? likeCount : ''}
                        </button>
                        <button onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: activeCommentPost === post.id ? '#FF6B35' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', padding: 0 }}>
                          <span style={{ fontSize: '16px' }}>💬</span>{commentCount > 0 ? commentCount : ''}
                        </button>
                        <button onClick={() => handleRepost(post)} title={hasReposted ? 'Click to undo repost' : 'Repost'} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: hasReposted ? '#2ECC71' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', padding: 0, transition: 'color 0.2s' }}>
                          <span style={{ fontSize: '16px' }}>🔄</span>{repostCount > 0 ? repostCount : ''}
                        </button>
                        <button onClick={() => handleShare(post.id)} title="Copy link" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', padding: 0 }}>
                          <span style={{ fontSize: '16px' }}>📤</span>
                        </button>
                      </div>

                      {/* Comments */}
                      {activeCommentPost === post.id && (
                        <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                            {post.comments?.map((c) => (
                              <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                                <div onClick={() => handleAvatarClick(c.authorId)} style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}>
                                  {c.authorPhoto ? <img src={c.authorPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '12px' }}>👤</span>}
                                </div>
                                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '0 12px 12px 12px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span onClick={() => handleAvatarClick(c.authorId)} style={{ fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>{c.authorName}</span>
                                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{timeAgo(new Date(c.createdAt))}</span>
                                  </div>
                                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>{c.text}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..." onKeyDown={(e) => { if (e.key === 'Enter') handleComment(post.id); }} style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '14px', outline: 'none' }} />
                            <button onClick={() => handleComment(post.id)} disabled={!commentText.trim()} style={{ background: commentText.trim() ? '#FF6B35' : 'rgba(255,107,53,0.3)', color: 'white', border: 'none', padding: '0 16px', borderRadius: '20px', fontWeight: 'bold', cursor: commentText.trim() ? 'pointer' : 'not-allowed' }}>Send</button>
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
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}
