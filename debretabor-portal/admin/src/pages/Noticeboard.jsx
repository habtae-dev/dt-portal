import React, { useState, useEffect } from 'react';
import { API_ORIGIN } from '../config';
import axios from '../api';
import { Bell, Plus, Trash2, Edit, X, Search, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Noticeboard() {
  const [noticesList, setNoticesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title_en: '',
    title_am: '',
    notice_body_en: '',
    notice_body_am: '',
    target_audience: 'All Citizens',
    priority: 'Normal',
    document_url: '',
    is_active: true,
    expiry_date: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_ORIGIN}/api/noticeboard/admin/all`);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setNoticesList(data);
    } catch (err) {
      console.error('Error fetching notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_am: '',
      notice_body_en: '',
      notice_body_am: '',
      target_audience: 'All Citizens',
      priority: 'Normal',
      document_url: '',
      is_active: true,
      expiry_date: ''
    });
    setSelectedFile(null);
    setEditId(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditId(item.id);
      const formattedDate = item.expiry_date ? new Date(item.expiry_date).toISOString().slice(0, 10) : '';
      setFormData({
        title_en: item.title_en || '',
        title_am: item.title_am || '',
        notice_body_en: item.notice_body_en || '',
        notice_body_am: item.notice_body_am || '',
        target_audience: item.target_audience || 'All Citizens',
        priority: item.priority || 'Normal',
        document_url: item.document_url || '',
        is_active: item.is_active ?? true,
        expiry_date: formattedDate
      });
      setSelectedFile(null);
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
      data.append('notice_body_en', formData.notice_body_en);
      data.append('notice_body_am', formData.notice_body_am);
      data.append('target_audience', formData.target_audience);
      data.append('priority', formData.priority);
      data.append('is_active', formData.is_active);
      data.append('expiry_date', formData.expiry_date);

      if (selectedFile) {
        data.append('document', selectedFile);
      } else if (formData.document_url) {
        data.append('document_url', formData.document_url);
      }

      const headers = {
        'Content-Type': 'multipart/form-data'
      };

      if (editId) {
        await axios.put(`${API_ORIGIN}/api/noticeboard/${editId}`, data, { headers });
      } else {
        await axios.post(`${API_ORIGIN}/api/noticeboard`, data, { headers });
      }

      setShowModal(false);
      resetForm();
      fetchNotices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save notice record.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await axios.delete(`${API_ORIGIN}/api/noticeboard/${id}`);
      fetchNotices();
    } catch (err) {
      alert('Failed to delete notice.');
    }
  };

  const filteredNotices = noticesList.filter(item =>
    item.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title_am?.includes(searchQuery) ||
    item.target_audience?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#ffffff', fontWeight: '700' }}>Digital Noticeboard (የዲጂታል ማስታወቂያ ሰሌዳ)</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Manage urgent announcements, expiry-driven alerts, and public notices.</p>
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
          <Plus size={18} /> Add New Notice
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search notices by title or target audience..."
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
        <p style={{ color: '#94a3b8' }}>Loading notices...</p>
      ) : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '13px' }}>
                <th style={{ padding: '14px 18px' }}>Title (EN / AM)</th>
                <th style={{ padding: '14px 18px' }}>Audience</th>
                <th style={{ padding: '14px 18px' }}>Priority</th>
                <th style={{ padding: '14px 18px' }}>Expiry Date</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No notices found.</td>
                </tr>
              ) : (
                filteredNotices.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #334155', fontSize: '14px', color: '#cbd5e1' }}>
                    <td style={{ padding: '14px 18px', fontWeight: '600', color: '#ffffff' }}>
                      <div>{item.title_en}</div>
                      {item.title_am && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>{item.title_am}</div>}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                        {item.target_audience}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                        background: item.priority === 'Urgent' ? 'rgba(248, 113, 113, 0.1)' : item.priority === 'Important' ? 'rgba(251, 146, 60, 0.1)' : 'rgba(52, 211, 153, 0.1)',
                        color: item.priority === 'Urgent' ? '#f87171' : item.priority === 'Important' ? '#fb923c' : '#34d399'
                      }}>
                        {item.priority}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#94a3b8' }}>{new Date(item.expiry_date).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 18px' }}>
                      {item.is_active ? (
                        <span style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>Active</span>
                      ) : (
                        <span style={{ color: '#f87171', background: 'rgba(248, 113, 113, 0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>Expired/Off</span>
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
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '30px', width: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #334155' }}>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>{editId ? 'Edit Notice' : 'Create New Notice'}</h3>
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
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Title (Amharic - የአማርኛ አርዕስት)</label>
                  <input
                    type="text"
                    value={formData.title_am}
                    onChange={(e) => setFormData({ ...formData, title_am: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Target Audience</label>
                  <input
                    type="text"
                    value={formData.target_audience}
                    onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Status</label>
                  <select
                    value={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Expiry Date (የማለፊያ ቀን) *</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Upload Attachment (PDF/Doc)</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Notice Body (English) *</label>
                  <textarea
                    value={formData.notice_body_en}
                    onChange={(e) => setFormData({ ...formData, notice_body_en: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', height: '90px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Notice Body (Amharic - የማስታወቂያው ዝርዝር)</label>
                  <textarea
                    value={formData.notice_body_am}
                    onChange={(e) => setFormData({ ...formData, notice_body_am: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', height: '90px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}