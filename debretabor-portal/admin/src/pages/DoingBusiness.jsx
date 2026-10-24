import React, { useState, useEffect } from 'react';
import { API_ORIGIN, assetUrl } from '../config';
import axios from '../api';
import { Plus, Trash2, Edit, X, Search, Upload, FileText, Briefcase, Eye, Download, CheckCircle, Clock } from 'lucide-react';

export default function DoingBusinessManagement() {
  const [businessList, setBusinessList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title_en: '',
    title_am: '',
    category: 'Investment Guide',
    content_en: '',
    content_am: '',
    is_published: true
  });

  const [documentFile, setDocumentFile] = useState(null);

  const categories = ['All', 'Investment Guide', 'Business License', 'Incentives', 'Opportunities'];

  useEffect(() => {
    fetchBusinessData();
  }, []);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_ORIGIN}/api/business/admin/all`);
      const resData = res.data;
      if (Array.isArray(resData)) {
        setBusinessList(resData);
      } else if (resData && Array.isArray(resData.data)) {
        setBusinessList(resData.data);
      } else {
        setBusinessList([]);
      }
    } catch (err) {
      console.error('Error fetching business guides:', err);
      setBusinessList([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_am: '',
      category: 'Investment Guide',
      content_en: '',
      content_am: '',
      is_published: true
    });
    setDocumentFile(null);
    setEditId(null);
  };

  const handleOpenModal = (item = null, e = null) => {
    if (e) e.stopPropagation();
    if (item) {
      setEditId(item.id);
      setFormData({
        title_en: item.title_en || '',
        title_am: item.title_am || '',
        category: item.category || 'Investment Guide',
        content_en: item.content_en || '',
        content_am: item.content_am || '',
        is_published: item.is_published ?? true
      });
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
      data.append('title_en', formData.title_en);
      data.append('title_am', formData.title_am || '');
      data.append('category', formData.category);
      data.append('content_en', formData.content_en);
      data.append('content_am', formData.content_am || '');
      data.append('is_published', formData.is_published);

      if (documentFile) {
        data.append('document', documentFile);
      }

      const headers = {
        'Content-Type': 'multipart/form-data'
      };

      if (editId) {
        await axios.put(`${API_ORIGIN}/api/business/${editId}`, data, { headers });
      } else {
        await axios.post(`${API_ORIGIN}/api/business`, data, { headers });
      }

      setShowModal(false);
      resetForm();
      fetchBusinessData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save business record.');
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this business record?')) return;
    try {
      await axios.delete(`${API_ORIGIN}/api/business/${id}`);
      fetchBusinessData();
    } catch (err) {
      alert('Failed to delete record.');
    }
  };

  const filteredList = businessList.filter(item => {
    if (!item) return false;
    const matchesSearch = (item.title_en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.title_am || '').includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '20px', color: '#f8fafc', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 🔴 Top Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#ffffff', fontWeight: '700' }}>Doing Business & Investment Management (የንግድና ኢንቨስትመንት መመሪያዎች)</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Manage investment policies, trade license procedures, incentives, and official documents.</p>
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
          <Plus size={18} /> Add New Guide / Policy
        </button>
      </div>

      {/* 🔴 Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search guidelines..."
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

      {/* 🔴 Cards Grid */}
      {loading ? (
        <p style={{ color: '#94a3b8', padding: '20px' }}>Loading business guidelines...</p>
      ) : filteredList.length === 0 ? (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '15px' }}>No records found.</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Click on <strong>"+ Add New Guide / Policy"</strong> to publish one.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredList.map((item) => (
            <div
              key={item.id}
              onClick={() => setViewModal(item)}
              style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Briefcase size={14} /> {item.category}
                  </span>
                  
                  {/* Status Badge */}
                  <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: item.is_published ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)', color: item.is_published ? '#34d399' : '#f87171' }}>
                    {item.is_published ? <CheckCircle size={12} /> : <Clock size={12} />}
                    {item.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 4px 0', fontSize: '17px', color: '#ffffff', fontWeight: '700' }}>{item.title_am || item.title_en}</h4>
                {item.title_am && <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#94a3b8' }}>{item.title_en}</p>}

                <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.content_am || item.content_en}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '12px', marginTop: '15px' }}>
                <span style={{ fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={14} /> Details {item.document_url && '📄 (PDF Attached)'}
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={(e) => handleOpenModal(item, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#38bdf8' }}><Edit size={16} /></button>
                  <button onClick={(e) => handleDelete(item.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔴 VIEW DETAILS MODAL */}
      {viewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '25px', width: '750px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '12px', borderBottom: '1px solid #334155' }}>
              <div>
                <span style={{ color: '#38bdf8', fontSize: '12px', fontWeight: 'bold' }}>{viewModal.category}</span>
                <h3 style={{ margin: '4px 0 0 0', color: '#ffffff', fontSize: '20px' }}>{viewModal.title_am || viewModal.title_en}</h3>
                {viewModal.title_am && <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>{viewModal.title_en}</p>}
              </div>
              <button onClick={() => setViewModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={22} /></button>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '18px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#f1f5f9', fontSize: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '5px' }}>መግለጫና ማብራሪያ (Full Details)</h4>
              {viewModal.content_am && (
                <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7', whiteSpace: 'pre-line', margin: '0 0 12px 0' }}>{viewModal.content_am}</p>
              )}
              {viewModal.content_en && (
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-line', margin: 0 }}>{viewModal.content_en}</p>
              )}
            </div>

            {viewModal.document_url && (
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', padding: '12px 18px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8' }}>
                  <FileText size={20} />
                  <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Attached PDF Document</span>
                </div>
                <a
                  href={assetUrl(viewModal.document_url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#3b82f6', color: 'white', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', textDecoration: 'none', fontWeight: 'bold' }}
                >
                  <Download size={14} /> View / Download PDF
                </a>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #334155', paddingTop: '15px' }}>
              <button onClick={() => setViewModal(null)} style={{ padding: '8px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 🔴 ADD / EDIT FORM MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '30px', width: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #334155' }}>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>{editId ? 'Edit Business Guide' : 'Add New Business Guide'}</h3>
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

              {/* Category & Status Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="Investment Guide">Investment Guide</option>
                    <option value="Business License">Business License</option>
                    <option value="Incentives">Incentives</option>
                    <option value="Opportunities">Opportunities</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Publish Status</label>
                  <select
                    value={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.value === 'true' })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="true">Published (ለህዝብ ይታይ)</option>
                    <option value="false">Draft (ድራፍት/ተደብቆ ይቆይ)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>የመመሪያው ማብራሪያ (አማርኛ)</label>
                <textarea
                  rows="4"
                  value={formData.content_am}
                  onChange={(e) => setFormData({ ...formData, content_am: e.target.value })}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                ></textarea>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Content / Details (English) *</label>
                <textarea
                  rows="4"
                  value={formData.content_en}
                  onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  required
                ></textarea>
              </div>

              {/* Document Upload */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Upload Official PDF Document (Optional)</label>
                <div style={{ border: '2px dashed #334155', padding: '18px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#0f172a' }}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setDocumentFile(e.target.files[0])}
                    id="business-document-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="business-document-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                    <Upload size={20} />
                    <span style={{ fontSize: '13px' }}>{documentFile ? documentFile.name : 'Click to Upload Document (PDF/Doc)'}</span>
                  </label>
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