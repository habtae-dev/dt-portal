import React, { useState, useEffect } from 'react';
import { API_ORIGIN } from '../config';
import axios from '../api';
import { FileText, Plus, Trash2, Edit, X, Search } from 'lucide-react';

export default function Tenders() {
  const [tendersList, setTendersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    reference_no: '',
    title_en: '',
    title_am: '',
    description_en: '',
    description_am: '',
    document_url: '',
    submission_place: 'Debre Tabor City Admin, Main Building, Office No. 12',
    submission_instructions_en: '',
    submission_instructions_am: '',
    closing_date: '',
    status: 'Open'
  });

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchTenders();
  }, []);

  const fetchTenders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_ORIGIN}/api/tenders/admin/all`);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setTendersList(data);
    } catch (err) {
      console.error('Error fetching tenders:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      reference_no: '',
      title_en: '',
      title_am: '',
      description_en: '',
      description_am: '',
      document_url: '',
      submission_place: 'Debre Tabor City Admin, Main Building, Office No. 12',
      submission_instructions_en: '',
      submission_instructions_am: '',
      closing_date: '',
      status: 'Open'
    });
    setSelectedFile(null);
    setEditId(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditId(item.id);
      setFormData({
        reference_no: item.reference_no || '',
        title_en: item.title_en || '',
        title_am: item.title_am || '',
        description_en: item.description_en || '',
        description_am: item.description_am || '',
        document_url: item.document_url || '',
        submission_place: item.submission_place || 'Debre Tabor City Admin, Main Building, Office No. 12',
        submission_instructions_en: item.submission_instructions_en || '',
        submission_instructions_am: item.submission_instructions_am || '',
        closing_date: item.closing_date ? item.closing_date.slice(0, 16) : '', // "YYYY-MM-DDTHH:MM" straight from the API (no time-zone shift)
        status: item.status || 'Open'
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
      data.append('reference_no', formData.reference_no);
      data.append('title_en', formData.title_en);
      data.append('title_am', formData.title_am);
      data.append('description_en', formData.description_en);
      data.append('description_am', formData.description_am);
      data.append('submission_place', formData.submission_place);
      data.append('submission_instructions_en', formData.submission_instructions_en);
      data.append('submission_instructions_am', formData.submission_instructions_am);
      data.append('closing_date', formData.closing_date);
      data.append('status', formData.status);

      if (selectedFile) {
        data.append('document', selectedFile);
      } else if (formData.document_url) {
        data.append('document_url', formData.document_url);
      }

      const headers = {
        'Content-Type': 'multipart/form-data'
      };

      if (editId) {
        await axios.put(`${API_ORIGIN}/api/tenders/${editId}`, data, { headers });
      } else {
        await axios.post(`${API_ORIGIN}/api/tenders`, data, { headers });
      }

      setShowModal(false);
      resetForm();
      fetchTenders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save tender record.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tender?')) return;
    try {
      await axios.delete(`${API_ORIGIN}/api/tenders/${id}`);
      fetchTenders();
    } catch (err) {
      alert('Failed to delete tender.');
    }
  };

  const filteredTenders = tendersList.filter(item =>
    item.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title_am?.includes(searchQuery) ||
    item.reference_no?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#ffffff', fontWeight: '700' }}>Tenders & Bids Management (የጨረታ ማስታወቂያዎች)</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Manage bilingual tender specifications, deadlines, and bidding PDF documents.</p>
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
          <Plus size={18} /> Add New Tender
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search tenders by reference no or title (በጨረታ ቁጥር ወይም አርዕስት ይፈልጉ)..."
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
        <p style={{ color: '#94a3b8' }}>Loading tenders...</p>
      ) : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '13px' }}>
                <th style={{ padding: '14px 18px' }}>Ref No</th>
                <th style={{ padding: '14px 18px' }}>Title (EN / AM)</th>
                <th style={{ padding: '14px 18px' }}>Closing Date</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTenders.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No tenders found.</td>
                </tr>
              ) : (
                filteredTenders.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #334155', fontSize: '14px', color: '#cbd5e1' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 'bold', color: '#38bdf8' }}>{item.reference_no}</td>
                    <td style={{ padding: '14px 18px', fontWeight: '600', color: '#ffffff' }}>
                      <div>{item.title_en}</div>
                      {item.title_am && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>{item.title_am}</div>}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#94a3b8' }}>{new Date(item.closing_date).toLocaleString()}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                        background: item.status === 'Open' ? 'rgba(52, 211, 153, 0.1)' : item.status === 'Closed' ? 'rgba(248, 113, 113, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                        color: item.status === 'Open' ? '#34d399' : item.status === 'Closed' ? '#f87171' : '#38bdf8'
                      }}>
                        {item.status}
                      </span>
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
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '30px', width: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #334155' }}>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>{editId ? 'Edit Tender Details' : 'Create New Tender'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Reference No (የጨረታ ቁጥር) *</label>
                  <input
                    type="text"
                    value={formData.reference_no}
                    onChange={(e) => setFormData({ ...formData, reference_no: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Status (ሁኔታ)</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="Awarded">Awarded</option>
                  </select>
                </div>
              </div>

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
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Title (Amharic - የአማርኛ አርዕስት)</label>
                <input
                  type="text"
                  value={formData.title_am}
                  onChange={(e) => setFormData({ ...formData, title_am: e.target.value })}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Closing Date & Time (የመዝጊያ ቀን) *</label>
                  <input
                    type="datetime-local"
                    value={formData.closing_date}
                    onChange={(e) => setFormData({ ...formData, closing_date: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Upload Specification (PDF)</label>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Submission Place (የማስረከቢያ ቦታ)</label>
                <input
                  type="text"
                  value={formData.submission_place}
                  onChange={(e) => setFormData({ ...formData, submission_place: e.target.value })}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>

              {/* Description Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Description (English)</label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', height: '90px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Description (Amharic - የአማርኛ ማብራሪያ)</label>
                  <textarea
                    value={formData.description_am}
                    onChange={(e) => setFormData({ ...formData, description_am: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', height: '90px' }}
                  />
                </div>
              </div>

              {/* Submission Instruction Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Submission Instructions (English)</label>
                  <textarea
                    value={formData.submission_instructions_en}
                    onChange={(e) => setFormData({ ...formData, submission_instructions_en: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', height: '90px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Submission Instructions (Amharic - የማስረከቢያ መመሪያዎች)</label>
                  <textarea
                    value={formData.submission_instructions_am}
                    onChange={(e) => setFormData({ ...formData, submission_instructions_am: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', height: '90px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Tender</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}