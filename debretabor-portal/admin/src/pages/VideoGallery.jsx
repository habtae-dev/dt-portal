import React, { useState, useEffect } from 'react';
import { API_ORIGIN, assetUrl } from '../config';
import axios from '../api';
import { Plus, Trash2, Edit, X, Search, Upload, Play, Film } from 'lucide-react';

export default function VideoGallery() {
  const [videoList, setVideoList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title_en: '',
    title_am: '',
    description_en: '',
    description_am: '',
    video_url: '',
    category: 'General',
    is_published: true
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const categories = ['All', 'General', 'Documentary', 'News', 'Events', 'Projects'];

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_ORIGIN}/api/videos/admin/all`);
      const resData = res.data;
      if (Array.isArray(resData)) {
        setVideoList(resData);
      } else if (resData && Array.isArray(resData.data)) {
        setVideoList(resData.data);
      } else {
        setVideoList([]);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setVideoList([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_am: '',
      description_en: '',
      description_am: '',
      video_url: '',
      category: 'General',
      is_published: true
    });
    setThumbnailFile(null);
    setVideoFile(null);
    setEditId(null);
  };

  const handleOpenModal = (item = null, e = null) => {
    if (e) e.stopPropagation();
    if (item) {
      setEditId(item.id);
      setFormData({
        title_en: item.title_en || '',
        title_am: item.title_am || '',
        description_en: item.description_en || '',
        description_am: item.description_am || '',
        video_url: item.video_url || '',
        category: item.category || 'General',
        is_published: item.is_published ?? true
      });
      setThumbnailFile(null);
      setVideoFile(null);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title_en', formData.title_en);
      data.append('title_am', formData.title_am || '');
      data.append('description_en', formData.description_en || '');
      data.append('description_am', formData.description_am || '');
      data.append('video_url', formData.video_url || '');
      data.append('category', formData.category || 'General');
      data.append('is_published', formData.is_published);

      if (thumbnailFile) {
        data.append('thumbnail', thumbnailFile);
      }
      if (videoFile) {
        data.append('video', videoFile);
      }

      const headers = {
        'Content-Type': 'multipart/form-data'
      };

      if (editId) {
        await axios.put(`${API_ORIGIN}/api/videos/${editId}`, data, { headers });
      } else {
        await axios.post(`${API_ORIGIN}/api/videos`, data, { headers });
      }

      setShowModal(false);
      resetForm();
      fetchVideos(); // 🔴 ከተቀመጠ በኋላ ሊስቱን ማደስ
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save video record.');
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    try {
      await axios.delete(`${API_ORIGIN}/api/videos/${id}`);
      fetchVideos(); // 🔴 ከተሰረዘ በኋላ ሊስቱን በድጋሚ ማምጣት
    } catch (err) {
      alert('Failed to delete video.');
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  const filteredVideos = videoList.filter(item => {
    if (!item) return false;
    const matchesSearch = (item.title_en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.title_am || '').includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '20px', color: '#f8fafc', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#ffffff', fontWeight: '700' }}>Video Gallery Management (የቪዲዮ ማዕከለ-ስዕላት)</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Upload video files, embed YouTube links, play, update and delete.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#3b82f6', color: 'white', border: 'none',
            padding: '10px 20px', borderRadius: '8px', fontWeight: '600',
            cursor: 'pointer', fontSize: '14px'
          }}
        >
          <Plus size={18} /> Add New Video
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search videos by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 40px', backgroundColor: '#1e293b',
              border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '14px', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                border: '1px solid #334155',
                backgroundColor: selectedCategory === cat ? '#3b82f6' : '#1e293b',
                color: selectedCategory === cat ? '#ffffff' : '#94a3b8'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8', padding: '20px' }}>Loading videos...</p>
      ) : filteredVideos.length === 0 ? (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '15px' }}>No videos found in gallery.</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Click on <strong>"+ Add New Video"</strong> to upload one.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {filteredVideos.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveVideoModal(item)}
              style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
            >
              <div style={{ height: '170px', backgroundColor: '#0f172a', position: 'relative' }}>
                {item.thumbnail_url ? (
                  <img src={assetUrl(item.thumbnail_url)} alt="thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
                    <Film size={40} color="#475569" />
                  </div>
                )}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(59, 130, 246, 0.85)', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Play size={22} color="#ffffff" fill="#ffffff" />
                </div>
                <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(15, 23, 42, 0.85)', color: '#38bdf8', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                  {item.category || 'General'}
                </span>
              </div>

              <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#ffffff', fontWeight: '600' }}>{item.title_en}</h4>
                  {item.title_am && <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#94a3b8' }}>{item.title_am}</p>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '10px', marginTop: '10px' }}>
                  <span style={{ fontSize: '12px', color: item.is_published ? '#34d399' : '#f87171' }}>
                    {item.is_published ? '● Published' : '○ Draft'}
                  </span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={(e) => handleOpenModal(item, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#38bdf8' }}><Edit size={16} /></button>
                    <button onClick={(e) => handleDelete(item.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeVideoModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '25px', width: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>{activeVideoModal.title_en}</h3>
              <button onClick={() => setActiveVideoModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={22} /></button>
            </div>

            <div style={{ width: '100%', height: '380px', backgroundColor: '#000', borderRadius: '8px', overflow: 'hidden', marginBottom: '15px' }}>
              {activeVideoModal.video_url && (activeVideoModal.video_url.includes('youtube') || activeVideoModal.video_url.includes('youtu.be')) ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={getEmbedUrl(activeVideoModal.video_url)}
                  title={activeVideoModal.title_en}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video 
                  src={activeVideoModal.video_url?.startsWith('http') ? activeVideoModal.video_url : assetUrl(activeVideoModal.video_url)} 
                  controls 
                  style={{ width: '100%', height: '100%' }} 
                />
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '30px', width: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #334155' }}>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>{editId ? 'Edit Video' : 'Add New Video'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Video Title (English) *</label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Video Title (Amharic)</label>
                  <input
                    type="text"
                    value={formData.title_am}
                    onChange={(e) => setFormData({ ...formData, title_am: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>YouTube URL (Optional if uploading file)</label>
                <input
                  type="text"
                  placeholder="e.g. https://www.youtube.com/watch?v=..."
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Or Upload Video File (.mp4, .mkv)</label>
                <div style={{ border: '2px dashed #334155', padding: '15px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#0f172a' }}>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    id="direct-video-file-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="direct-video-file-input" style={{ cursor: 'pointer', color: '#38bdf8', fontSize: '13px' }}>
                    {videoFile ? videoFile.name : 'Click to Browse & Upload Video File'}
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="General">General</option>
                    <option value="Documentary">Documentary</option>
                    <option value="News">News</option>
                    <option value="Events">Events</option>
                    <option value="Projects">Projects</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Status</label>
                  <select
                    value={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.value === 'true' })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="true">Published</option>
                    <option value="false">Draft / Hidden</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Thumbnail Cover Image</label>
                <div style={{ border: '2px dashed #334155', padding: '15px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#0f172a' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnailFile(e.target.files[0])}
                    id="video-thumbnail-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="video-thumbnail-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                    <Upload size={20} />
                    <span style={{ fontSize: '13px' }}>{thumbnailFile ? thumbnailFile.name : 'Click to Upload Thumbnail Image'}</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Video</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}