import React, { useState, useEffect } from 'react';
import { API_ORIGIN } from '../config';
import axios from '../api';
import { Newspaper, Plus, Trash2, Edit, X, Eye, EyeOff, Upload, Search } from 'lucide-react';

export default function News() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title_en: '',
    title_am: '',
    content_en: '',
    content_am: '',
    category: 'General',
    is_published: true
  });
  
  // ለፋይል ፕሪቪው እና መያዣ
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);


  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_ORIGIN}/api/news/admin/all`);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setNewsList(data);
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_am: '',
      content_en: '',
      content_am: '',
      category: 'General',
      is_published: true
    });
    setSelectedFiles([]);
    setExistingImages([]);
    setEditId(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditId(item.id);
      let imgs = [];
      if (item.images) {
        try {
          imgs = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
        } catch (e) {
          imgs = [];
        }
      }
      setFormData({
        title_en: item.title_en || '',
        title_am: item.title_am || '',
        content_en: item.content_en || '',
        content_am: item.content_am || '',
        category: item.category || 'General',
        is_published: item.is_published ?? true
      });
      setExistingImages(Array.isArray(imgs) ? imgs : []);
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
      data.append('title_am', formData.title_am);
      data.append('content_en', formData.content_en);
      data.append('content_am', formData.content_am);
      data.append('category', formData.category);
      data.append('is_published', formData.is_published);

      // የተመረጡትን ፋይሎች ወደ FormData መጨመር
      for (let i = 0; i < selectedFiles.length; i++) {
        data.append('images', selectedFiles[i]);
      }

      const headers = {
        'Content-Type': 'multipart/form-data'
      };

      if (editId) {
        await axios.put(`${API_ORIGIN}/api/news/${editId}`, data, { headers });
      } else {
        await axios.post(`${API_ORIGIN}/api/news`, data, { headers });
      }

      setShowModal(false);
      resetForm();
      fetchNews();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save news article.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) return;
    try {
      await axios.delete(`${API_ORIGIN}/api/news/${id}`);
      fetchNews();
    } catch (err) {
      alert('Failed to delete news entry.');
    }
  };

  const filteredNews = newsList.filter(item => 
    item.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#ffffff', fontWeight: '700' }}>News & Press Releases</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Manage bilingual news articles and direct media file uploads.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#3b82f6', color: 'white', border: 'none',
            padding: '10px 18px', borderRadius: '8px', fontWeight: '600',
            cursor: 'pointer', fontSize: '14px'
          }}
        >
          <Plus size={18} /> Add New Article
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search news by title or category..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px 10px 40px', backgroundColor: '#1e293b',
            border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '14px', boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Table Section */}
      {loading ? (
        <p style={{ color: '#94a3b8' }}>Loading news articles...</p>
      ) : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '13px' }}>
                <th style={{ padding: '14px 18px' }}>ID</th>
                <th style={{ padding: '14px 18px' }}>Title (English)</th>
                <th style={{ padding: '14px 18px' }}>Category</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNews.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No news articles found.</td>
                </tr>
              ) : (
                filteredNews.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #334155', fontSize: '14px', color: '#cbd5e1' }}>
                    <td style={{ padding: '14px 18px' }}>{item.id}</td>
                    <td style={{ padding: '14px 18px', fontWeight: '600', color: '#ffffff' }}>{item.title_en}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {item.is_published ? (
                        <span style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>Published</span>
                      ) : (
                        <span style={{ color: '#f87171', background: 'rgba(248, 113, 113, 0.1)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>Draft</span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button onClick={() => handleOpenModal(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#38bdf8', marginRight: '12px' }}><Edit size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '30px', width: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #334155' }}>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>{editId ? 'Edit News Article' : 'Create News Article'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Title (English) *</label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Title (Amharic)</label>
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
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Publish Status</label>
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

              {/* Direct File Upload Input */}
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Upload Images (Max 5)</label>
                <div style={{ border: '2px dashed #334155', padding: '20px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#0f172a' }}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                    id="news-file-upload"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="news-file-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#38bdf8' }}>
                    <Upload size={24} />
                    <span>{selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : 'Click to Browse Images'}</span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Content (English) *</label>
                <textarea
                  value={formData.content_en}
                  onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', height: '100px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Content (Amharic)</label>
                <textarea
                  value={formData.content_am}
                  onChange={(e) => setFormData({ ...formData, content_am: e.target.value })}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', height: '100px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Article</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}