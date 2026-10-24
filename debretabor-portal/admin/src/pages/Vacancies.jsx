import React, { useState, useEffect } from 'react';
import { API_ORIGIN } from '../config';
import axios from '../api';
import { Briefcase, Plus, Trash2, Edit, X, Search, FileText, Calendar, MapPin, Users } from 'lucide-react';

export default function Vacancies() {
  const [vacanciesList, setVacanciesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    job_code: '',
    position_title_en: '',
    position_title_am: '',
    department: '',
    employment_type: 'Permanent',
    quantity: 1,
    description_en: '',
    description_am: '',
    qualifications_en: '',
    qualifications_am: '',
    document_url: '',
    application_place: 'Debre Tabor City Admin, HR Office, 1st Floor',
    deadline: '',
    status: 'Open'
  });

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_ORIGIN}/api/vacancies/admin/all`);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setVacanciesList(data);
    } catch (err) {
      console.error('Error fetching vacancies:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      job_code: '',
      position_title_en: '',
      position_title_am: '',
      department: '',
      employment_type: 'Permanent',
      quantity: 1,
      description_en: '',
      description_am: '',
      qualifications_en: '',
      qualifications_am: '',
      document_url: '',
      application_place: 'Debre Tabor City Admin, HR Office, 1st Floor',
      deadline: '',
      status: 'Open'
    });
    setSelectedFile(null);
    setEditId(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditId(item.id);
      const formattedDate = item.deadline ? new Date(item.deadline).toISOString().slice(0, 10) : '';
      setFormData({
        job_code: item.job_code || '',
        position_title_en: item.position_title_en || '',
        position_title_am: item.position_title_am || '',
        department: item.department || '',
        employment_type: item.employment_type || 'Permanent',
        quantity: item.quantity || 1,
        description_en: item.description_en || '',
        description_am: item.description_am || '',
        qualifications_en: item.qualifications_en || '',
        qualifications_am: item.qualifications_am || '',
        document_url: item.document_url || '',
        application_place: item.application_place || 'Debre Tabor City Admin, HR Office, 1st Floor',
        deadline: formattedDate,
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
      data.append('job_code', formData.job_code);
      data.append('position_title_en', formData.position_title_en);
      data.append('position_title_am', formData.position_title_am);
      data.append('department', formData.department);
      data.append('employment_type', formData.employment_type);
      data.append('quantity', formData.quantity);
      data.append('description_en', formData.description_en);
      data.append('description_am', formData.description_am);
      data.append('qualifications_en', formData.qualifications_en);
      data.append('qualifications_am', formData.qualifications_am);
      data.append('application_place', formData.application_place);
      data.append('deadline', formData.deadline);
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
        await axios.put(`${API_ORIGIN}/api/vacancies/${editId}`, data, { headers });
      } else {
        await axios.post(`${API_ORIGIN}/api/vacancies`, data, { headers });
      }

      setShowModal(false);
      resetForm();
      fetchVacancies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save job vacancy.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vacancy?')) return;
    try {
      await axios.delete(`${API_ORIGIN}/api/vacancies/${id}`);
      fetchVacancies();
    } catch (err) {
      alert('Failed to delete vacancy entry.');
    }
  };

  const filteredVacancies = vacanciesList.filter(item =>
    item.position_title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.position_title_am?.includes(searchQuery) ||
    item.job_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#ffffff', fontWeight: '700' }}>Job Vacancies Management (የክፍት ሥራ ቦታ ማስታወቂያዎች)</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Manage municipal job postings, requirements, deadlines, and application documents.</p>
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
          <Plus size={18} /> Add New Vacancy
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search vacancies by job code, title, or department..."
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
        <p style={{ color: '#94a3b8' }}>Loading job vacancies...</p>
      ) : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '13px' }}>
                <th style={{ padding: '14px 18px' }}>Job Code</th>
                <th style={{ padding: '14px 18px' }}>Position Title</th>
                <th style={{ padding: '14px 18px' }}>Department</th>
                <th style={{ padding: '14px 18px' }}>Type / Qty</th>
                <th style={{ padding: '14px 18px' }}>Deadline</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVacancies.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No job vacancies found.</td>
                </tr>
              ) : (
                filteredVacancies.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #334155', fontSize: '14px', color: '#cbd5e1' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 'bold', color: '#c084fc' }}>{item.job_code}</td>
                    <td style={{ padding: '14px 18px', fontWeight: '600', color: '#ffffff' }}>
                      <div>{item.position_title_en}</div>
                      {item.position_title_am && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>{item.position_title_am}</div>}
                    </td>
                    <td style={{ padding: '14px 18px' }}>{item.department}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                        {item.employment_type} ({item.quantity})
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#94a3b8' }}>{new Date(item.deadline).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                        background: item.status === 'Open' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)',
                        color: item.status === 'Open' ? '#34d399' : '#f87171'
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
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>{editId ? 'Edit Vacancy' : 'Create New Job Vacancy'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Job Code (የመለያ ቁጥር) *</label>
                  <input
                    type="text"
                    value={formData.job_code}
                    onChange={(e) => setFormData({ ...formData, job_code: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Department (ክፍል/መሪያ) *</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Position Title (English) *</label>
                  <input
                    type="text"
                    value={formData.position_title_en}
                    onChange={(e) => setFormData({ ...formData, position_title_en: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Position Title (Amharic - የሥራ መደብ አርዕስት)</label>
                  <input
                    type="text"
                    value={formData.position_title_am}
                    onChange={(e) => setFormData({ ...formData, position_title_am: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Employment Type</label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="Permanent">Permanent</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Quantity (ብዛት)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Deadline (የማመልከቻ ማብቂያ ቀን) *</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Application Place (ማመልከቻ ቦታ)</label>
                  <input
                    type="text"
                    value={formData.application_place}
                    onChange={(e) => setFormData({ ...formData, application_place: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
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

              {/* Qualifications */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Qualifications & Requirements (EN)</label>
                  <textarea
                    value={formData.qualifications_en}
                    onChange={(e) => setFormData({ ...formData, qualifications_en: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', height: '80px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Qualifications (Amharic - የትምህርትና ሥራ ልምድ መስፈርት)</label>
                  <textarea
                    value={formData.qualifications_am}
                    onChange={(e) => setFormData({ ...formData, qualifications_am: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', height: '80px' }}
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Description (English)</label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', height: '80px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Description (Amharic - የሥራው ዝርዝር መግለጫ)</label>
                  <textarea
                    value={formData.description_am}
                    onChange={(e) => setFormData({ ...formData, description_am: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', height: '80px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Vacancy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}