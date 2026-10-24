import React, { useState, useEffect } from 'react';
import { API_ORIGIN, assetUrl } from '../config';
import axios from '../api';
import { Plus, Trash2, Edit, X, Search, Upload, FileText, Image as ImageIcon, Eye, CheckCircle, Clock } from 'lucide-react';

export default function CouncilManagement() {
  const [councilList, setCouncilList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    subcategory: 'overview',
    title_en: '',
    title_am: '',
    content_en: '',
    content_am: '',
    is_published: true
  });

  const [imageFile, setImageFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);

  const subcategories = ['All', 'overview', 'structure', 'speaker', 'standing_committees'];

  useEffect(() => {
    fetchCouncilData();
  }, []);

  const fetchCouncilData = async () => {
    try {
      setLoading(true);
      // አድሚን ስለሆነ Published ያልሆኑትንም ማየት እንዲችል ራውቱን ያለ query እናመጣለን
      const res = await axios.get(`${API_ORIGIN}/api/council/admin/all`);
      const resData = res.data;
      if (Array.isArray(resData)) {
        setCouncilList(resData);
      } else if (resData && Array.isArray(resData.data)) {
        setCouncilList(resData.data);
      } else {
        setCouncilList([]);
      }
    } catch (err) {
      console.error('Error fetching council contents:', err);
      setCouncilList([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      subcategory: 'overview',
      title_en: '',
      title_am: '',
      content_en: '',
      content_am: '',
      is_published: true
    });
    setImageFile(null);
    setDocumentFile(null);
    setEditId(null);
  };

  const handleOpenModal = (item = null, e = null) => {
    if (e) e.stopPropagation();
    if (item) {
      setEditId(item.id);
      setFormData({
        subcategory: item.subcategory || 'overview',
        title_en: item.title_en || '',
        title_am: item.title_am || '',
        content_en: item.content_en || '',
        content_am: item.content_am || '',
        is_published: item.is_published ?? true
      });
      setImageFile(null);
      setDocumentFile(null);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('subcategory', formData.subcategory);
      data.append('title_en', formData.title_en);
      data.append('title_am', formData.title_am || '');
      data.append('content_en', formData.content_en || '');
      data.append('content_am', formData.content_am || '');
      data.append('is_published', formData.is_published);

      if (imageFile) {
        data.append('image', imageFile);
      }
      if (documentFile) {
        data.append('document', documentFile);
      }

      const headers = {
        'Content-Type': 'multipart/form-data'
      };

      if (editId) {
        await axios.put(`${API_ORIGIN}/api/council/${editId}`, data, { headers });
      } else {
        await axios.post(`${API_ORIGIN}/api/council`, data, { headers });
      }

      setShowModal(false);
      resetForm();
      fetchCouncilData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save council record.');
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await axios.delete(`${API_ORIGIN}/api/council/${id}`);
      fetchCouncilData();
    } catch (err) {
      alert('Failed to delete record.');
    }
  };

  const filteredList = councilList.filter(item => {
    if (!item) return false;
    const matchesSearch = (item.title_en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.title_am || '').includes(searchQuery);
    const matchesSubcat = selectedSubcategory === 'All' || item.subcategory === selectedSubcategory;
    return matchesSearch && matchesSubcat;
  });

  return (
    <div style={{ padding: '20px', color: '#f8fafc', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#ffffff', fontWeight: '700' }}>City Council Contents (የከተማው ምክር ቤት መረጃዎች)</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Manage overview, structure, speaker profiles, and standing committees.</p>
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
          <Plus size={18} /> Add Council Content
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search contents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 40px', backgroundColor: '#1e293b',
              border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '14px', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
          {subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubcategory(sub)}
              style={{
                padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                border: '1px solid #334155',
                backgroundColor: selectedSubcategory === sub ? '#3b82f6' : '#1e293b',
                color: selectedSubcategory === sub ? '#ffffff' : '#94a3b8',
                textTransform: 'capitalize'
              }}
            >
              {sub.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid View */}
      {loading ? (
        <p style={{ color: '#94a3b8', padding: '20px' }}>Loading council contents...</p>
      ) : filteredList.length === 0 ? (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '15px' }}>No records found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredList.map((item) => (
            <div
              key={item.id}
              onClick={() => setViewModal(item)}
              style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
            >
              <div style={{ height: '160px', backgroundColor: '#0f172a', position: 'relative' }}>
                {item.image_url ? (
                  <img src={assetUrl(item.image_url)} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={36} color="#475569" />
                  </div>
                )}
                <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(56, 189, 248, 0.9)', color: '#0f172a', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {item.subcategory.replace('_', ' ')}
                </span>
              </div>

              <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#ffffff', fontWeight: '700' }}>{item.title_am || item.title_en}</h4>
                  {item.title_am && <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94a3b8' }}>{item.title_en}</p>}
                  <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.content_am || item.content_en}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '10px', marginTop: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={14} /> View Details {item.document_url && '📄'}
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

      {/* VIEW DETAILS MODAL (IMAGE PREVIEW INCLUDED) */}
      {viewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '25px', width: '750px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '12px', borderBottom: '1px solid #334155' }}>
              <div>
                <span style={{ color: '#38bdf8', fontSize: '12px', fontWeight: 'bold', textTransform: 'capitalize' }}>{viewModal.subcategory.replace('_', ' ')}</span>
                <h3 style={{ margin: '4px 0 0 0', color: '#ffffff', fontSize: '20px' }}>{viewModal.title_am || viewModal.title_en}</h3>
                {viewModal.title_am && <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>{viewModal.title_en}</p>}
              </div>
              <button onClick={() => setViewModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={22} /></button>
            </div>

            {/* Image Preview inside View Modal */}
            {viewModal.image_url && (
              <div style={{ width: '100%', height: '250px', backgroundColor: '#0f172a', borderRadius: '8px', overflow: 'hidden', marginBottom: '15px', border: '1px solid #334155' }}>
                <img src={assetUrl(viewModal.image_url)} alt="council-preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )}

            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '15px' }}>
              {viewModal.content_am && <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6', margin: '0 0 10px 0' }}>{viewModal.content_am}</p>}
              {viewModal.content_en && <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{viewModal.content_en}</p>}
            </div>

            {viewModal.document_url && (
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', padding: '10px 15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ color: '#38bdf8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Official Document Attached</span>
                <a href={assetUrl(viewModal.document_url)} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', textDecoration: 'none', fontWeight: 'bold' }}>Download PDF</a>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #334155', paddingTop: '15px' }}>
              <button onClick={() => setViewModal(null)} style={{ padding: '8px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '30px', width: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #334155' }}>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>{editId ? 'Edit Council Content' : 'Add Council Content'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Title (English) *</label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>ርዕስ (አማርኛ)</label>
                  <input
                    type="text"
                    value={formData.title_am}
                    onChange={(e) => setFormData({ ...formData, title_am: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Subcategory *</label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', textTransform: 'capitalize' }}
                  >
                    <option value="overview">Overview</option>
                    <option value="structure">Structure</option>
                    <option value="speaker">Speaker</option>
                    <option value="standing_committees">Standing Committees</option>
                  </select>
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

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>ይዘት (አማርኛ)</label>
                <textarea
                  rows="3"
                  value={formData.content_am}
                  onChange={(e) => setFormData({ ...formData, content_am: e.target.value })}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                ></textarea>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Content (English)</label>
                <textarea
                  rows="3"
                  value={formData.content_en}
                  onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Upload Image (Speaker/Structure)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    style={{ fontSize: '12px', color: '#94a3b8' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Upload PDF Document</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setDocumentFile(e.target.files[0])}
                    style={{ fontSize: '12px', color: '#94a3b8' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}