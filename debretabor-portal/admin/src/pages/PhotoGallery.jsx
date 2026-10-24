import React, { useState, useEffect } from 'react';
import { API_ORIGIN, assetUrl } from '../config';
import axios from '../api';
import { Plus, Trash2, Edit, X, Search, Upload, Image as ImageIcon, Eye } from 'lucide-react';

export default function PhotoGallery() {
  const [galleryList, setGalleryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [viewAlbumModal, setViewAlbumModal] = useState(null); // ለተመረጠው አልበም ፎቶዎች ማሳያ
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title_en: '',
    title_am: '',
    category: 'General',
    is_published: true
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  const categories = ['All', 'General', 'Infrastructure', 'Events', 'Tourism', 'Meetings'];

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_ORIGIN}/api/photos/admin/all`);
      const resData = res.data;
      if (Array.isArray(resData)) {
        setGalleryList(resData);
      } else if (resData && Array.isArray(resData.data)) {
        setGalleryList(resData.data);
      } else {
        setGalleryList([]);
      }
    } catch (err) {
      console.error('Error fetching gallery:', err);
      setGalleryList([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_am: '',
      category: 'General',
      is_published: true
    });
    setSelectedFiles([]);
    setEditId(null);
  };

  const handleOpenModal = (item = null, e = null) => {
    if (e) e.stopPropagation(); // Card click እንዳይጋጭ
    if (item) {
      setEditId(item.id);
      setFormData({
        title_en: item.title_en || '',
        title_am: item.title_am || '',
        category: item.category || 'General',
        is_published: item.is_published ?? true
      });
      setSelectedFiles([]);
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
      data.append('category', formData.category || 'General');
      data.append('is_published', formData.is_published);

      for (let i = 0; i < selectedFiles.length; i++) {
        data.append('images', selectedFiles[i]);
      }

      const headers = {
        'Content-Type': 'multipart/form-data'
      };

      if (editId) {
        await axios.put(`${API_ORIGIN}/api/photos/${editId}`, data, { headers });
      } else {
        await axios.post(`${API_ORIGIN}/api/photos`, data, { headers });
      }

      setShowModal(false);
      resetForm();
      fetchGallery();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save photo album.');
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this album?')) return;
    try {
      await axios.delete(`${API_ORIGIN}/api/photos/${id}`);
      fetchGallery();
    } catch (err) {
      alert('Failed to delete album.');
    }
  };

  const filteredGallery = galleryList.filter(item => {
    if (!item) return false;
    const titleEn = item.title_en || '';
    const titleAm = item.title_am || '';
    const matchesSearch = titleEn.toLowerCase().includes(searchQuery.toLowerCase()) || titleAm.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '20px', color: '#f8fafc', width: '100%', boxSizing: 'border-box' }}>
      {/* Top Header & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#ffffff', fontWeight: '700' }}>Photo Gallery Management (የፎቶ ማዕከለ-ስዕላት)</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Click any album card to view all its photos in a detailed grid.</p>
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
          <Plus size={18} /> Add New Album
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search albums..."
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

      {/* Album Cards Grid View */}
      {loading ? (
        <p style={{ color: '#94a3b8', padding: '20px' }}>Loading photo albums...</p>
      ) : filteredGallery.length === 0 ? (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '15px' }}>No photo albums found.</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Click on <strong>"+ Add New Album"</strong> to create one.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredGallery.map((item) => {
            let parsedImages = [];
            let coverImg = null;
            if (item.images) {
              try {
                parsedImages = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
                if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                  coverImg = parsedImages[0];
                }
              } catch (e) {
                parsedImages = [];
              }
            }

            return (
              <div 
                key={item.id} 
                onClick={() => setViewAlbumModal({ ...item, imagesArray: parsedImages })}
                style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer', transition: 'transform 0.2s' }}
                title="Click to view all photos in this album"
              >
                <div style={{ height: '160px', backgroundColor: '#0f172a', position: 'relative' }}>
                  {coverImg ? (
                    <img src={assetUrl(coverImg)} alt="album cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={36} color="#475569" />
                    </div>
                  )}
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(15, 23, 42, 0.8)', color: '#38bdf8', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
                    {parsedImages.length} Photos
                  </span>
                </div>

                <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', color: '#ffffff', fontWeight: '600' }}>{item.title_en}</h4>
                      <span style={{ fontSize: '11px', background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', padding: '2px 6px', borderRadius: '4px' }}>
                        {item.category || 'General'}
                      </span>
                    </div>
                    {item.title_am && <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#94a3b8' }}>{item.title_am}</p>}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '10px', marginTop: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> View Photos</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={(e) => handleOpenModal(item, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#38bdf8' }}><Edit size={15} /></button>
                      <button onClick={(e) => handleDelete(item.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}><Trash2 size={15} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔴 ALBUM PHOTOS DETAILS MODAL (አልበሙ ሲጫን ፎቶዎቹ በካርድ የሚታዩበት) */}
      {viewAlbumModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '30px', width: '850px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #334155' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#ffffff', fontSize: '20px' }}>{viewAlbumModal.title_en}</h3>
                {viewAlbumModal.title_am && <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>{viewAlbumModal.title_am}</p>}
              </div>
              <button onClick={() => setViewAlbumModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={22} /></button>
            </div>

            <p style={{ color: '#38bdf8', fontSize: '13px', marginBottom: '15px' }}>Total Photos in this Album: <strong>{viewAlbumModal.imagesArray.length}</strong></p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
              {viewAlbumModal.imagesArray.map((imgPath, index) => (
                <div key={index} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden', height: '140px' }}>
                  <img src={assetUrl(imgPath)} alt={`album-img-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '25px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
              <button onClick={() => setViewAlbumModal(null)} style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '30px', width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #334155' }}>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>{editId ? 'Edit Photo Album' : 'Create New Photo Album'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Album Title (English) *</label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Album Title (Amharic)</label>
                <input
                  type="text"
                  value={formData.title_am}
                  onChange={(e) => setFormData({ ...formData, title_am: e.target.value })}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                />
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
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Events">Events</option>
                    <option value="Tourism">Tourism</option>
                    <option value="Meetings">Meetings</option>
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
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Select Album Photos</label>
                <div style={{ border: '2px dashed #334155', padding: '20px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#0f172a' }}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                    id="photo-input-field"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="photo-input-field" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
                    <Upload size={24} />
                    <span>{selectedFiles.length > 0 ? `${selectedFiles.length} photos selected` : 'Click to Browse Multiple Photos'}</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Album</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}