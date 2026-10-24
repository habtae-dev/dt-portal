import React, { useState, useEffect } from 'react';
import { API_ORIGIN, assetUrl } from '../config';
import axios from '../api';
import { Plus, Trash2, Edit, X, Search, Upload, MapPin, DollarSign, FileText, Eye, Image as ImageIcon, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function ProjectsManagement() {
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [viewModal, setViewModal] = useState(null);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    category: 'Project',
    title_en: '',
    title_am: '',
    description_en: '',
    description_am: '',
    status: 'Planned',
    budget: '',
    location_en: '',
    location_am: '',
    start_date: '',
    end_date: '',
    is_published: true
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [documentFile, setDocumentFile] = useState(null);

  const statusOptions = ['All', 'Planned', 'Ongoing', 'Completed', 'On Hold'];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      // አድሚን ስለሆነ Published ያልሆኑትንም ማየት እንዲችል route ላይ query ሳንገድብ እናመጣለን
      const res = await axios.get(`${API_ORIGIN}/api/projects/admin/all`);
      const resData = res.data;
      if (Array.isArray(resData)) {
        setProjectsList(resData);
      } else if (resData && Array.isArray(resData.data)) {
        setProjectsList(resData.data);
      } else {
        setProjectsList([]);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setProjectsList([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category: 'Project',
      title_en: '',
      title_am: '',
      description_en: '',
      description_am: '',
      status: 'Planned',
      budget: '',
      location_en: '',
      location_am: '',
      start_date: '',
      end_date: '',
      is_published: true
    });
    setSelectedImages([]);
    setDocumentFile(null);
    setEditId(null);
  };

  const handleOpenModal = (item = null, e = null) => {
    if (e) e.stopPropagation();
    if (item) {
      setEditId(item.id);
      setFormData({
        category: item.category || 'Project',
        title_en: item.title_en || '',
        title_am: item.title_am || '',
        description_en: item.description_en || '',
        description_am: item.description_am || '',
        status: item.status || 'Planned',
        budget: item.budget || '',
        location_en: item.location_en || '',
        location_am: item.location_am || '',
        start_date: item.start_date ? item.start_date.split('T')[0] : '',
        end_date: item.end_date ? item.end_date.split('T')[0] : '',
        is_published: item.is_published ?? true
      });
      setSelectedImages([]);
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
      data.append('category', formData.category);
      data.append('title_en', formData.title_en);
      data.append('title_am', formData.title_am || '');
      data.append('description_en', formData.description_en || '');
      data.append('description_am', formData.description_am || '');
      data.append('status', formData.status);
      data.append('budget', formData.budget || '');
      data.append('location_en', formData.location_en || '');
      data.append('location_am', formData.location_am || '');
      data.append('start_date', formData.start_date || '');
      data.append('end_date', formData.end_date || '');
      data.append('is_published', formData.is_published);

      for (let i = 0; i < selectedImages.length; i++) {
        data.append('images', selectedImages[i]);
      }

      if (documentFile) {
        data.append('document', documentFile);
      }

      const headers = {
        'Content-Type': 'multipart/form-data'
      };

      if (editId) {
        await axios.put(`${API_ORIGIN}/api/projects/${editId}`, data, { headers });
      } else {
        await axios.post(`${API_ORIGIN}/api/projects`, data, { headers });
      }

      setShowModal(false);
      resetForm();
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save project record.');
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(`${API_ORIGIN}/api/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert('Failed to delete project.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return { bg: 'rgba(52, 211, 153, 0.1)', color: '#34d399', icon: <CheckCircle size={12} /> };
      case 'Ongoing':
        return { bg: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', icon: <Clock size={12} /> };
      case 'On Hold':
        return { bg: 'rgba(248, 113, 113, 0.1)', color: '#f87171', icon: <AlertCircle size={12} /> };
      default:
        return { bg: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', icon: <Clock size={12} /> };
    }
  };

  const filteredProjects = projectsList.filter(item => {
    if (!item) return false;
    const matchesSearch = (item.title_en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.title_am || '').includes(searchQuery);
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: '20px', color: '#f8fafc', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#ffffff', fontWeight: '700' }}>Projects & Programs Management (የልማት ፕሮጀክቶች እና ፕሮግራሞች)</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Manage project statuses, budgets, schedules, photos, and proposal documents.</p>
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
          <Plus size={18} /> Add New Project
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 40px', backgroundColor: '#1e293b',
              border: '1px solid #334155', borderRadius: '8px', color: '#ffffff', fontSize: '14px', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
          {statusOptions.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              style={{
                padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                border: '1px solid #334155',
                backgroundColor: selectedStatus === st ? '#3b82f6' : '#1e293b',
                color: selectedStatus === st ? '#ffffff' : '#94a3b8'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <p style={{ color: '#94a3b8', padding: '20px' }}>Loading projects...</p>
      ) : filteredProjects.length === 0 ? (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '15px' }}>No projects found.</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Click on <strong>"+ Add New Project"</strong> to create one.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredProjects.map((item) => {
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

            const badge = getStatusBadge(item.status);

            return (
              <div
                key={item.id}
                onClick={() => setViewModal({ ...item, imagesArray: parsedImages })}
                style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
              >
                <div style={{ height: '160px', backgroundColor: '#0f172a', position: 'relative' }}>
                  {coverImg ? (
                    <img src={assetUrl(coverImg)} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={36} color="#475569" />
                    </div>
                  )}

                  <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(15, 23, 42, 0.85)', color: '#38bdf8', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                    {item.category}
                  </span>

                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: badge.bg, color: badge.color, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {badge.icon} {item.status}
                  </span>
                </div>

                <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#ffffff', fontWeight: '700' }}>{item.title_am || item.title_en}</h4>
                    {item.title_am && <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94a3b8' }}>{item.title_en}</p>}

                    {(item.location_am || item.location_en) && (
                      <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} /> {item.location_am || item.location_en}
                      </p>
                    )}

                    {item.budget && (
                      <p style={{ margin: 0, fontSize: '12px', color: '#34d399', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <DollarSign size={13} /> Budget: {Number(item.budget).toLocaleString()} ETB
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '10px', marginTop: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={14} /> View Details ({parsedImages.length}) {item.document_url && '📄'}
                    </span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={(e) => handleOpenModal(item, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#38bdf8' }}><Edit size={16} /></button>
                      <button onClick={(e) => handleDelete(item.id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {viewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '25px', width: '800px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '12px', borderBottom: '1px solid #334155' }}>
              <div>
                <span style={{ color: '#38bdf8', fontSize: '12px', fontWeight: 'bold' }}>{viewModal.category} ({viewModal.status})</span>
                <h3 style={{ margin: '4px 0 0 0', color: '#ffffff', fontSize: '20px' }}>{viewModal.title_am || viewModal.title_en}</h3>
                {viewModal.title_am && <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>{viewModal.title_en}</p>}
              </div>
              <button onClick={() => setViewModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={22} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: '#0f172a', padding: '12px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #334155' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>📍 Location:</span>
                <p style={{ margin: 0, color: '#38bdf8', fontSize: '13px', fontWeight: 'bold' }}>{viewModal.location_am || viewModal.location_en || 'N/A'}</p>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>💰 Budget:</span>
                <p style={{ margin: 0, color: '#34d399', fontSize: '13px', fontWeight: 'bold' }}>{viewModal.budget ? `${Number(viewModal.budget).toLocaleString()} ETB` : 'N/A'}</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#f1f5f9', fontSize: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '5px' }}>መግለጫ (Description)</h4>
              {viewModal.description_am && <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6', margin: '0 0 8px 0' }}>{viewModal.description_am}</p>}
              {viewModal.description_en && <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{viewModal.description_en}</p>}
            </div>

            {viewModal.document_url && (
              <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', padding: '12px 15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Official Document Attached</span>
                <a href={assetUrl(viewModal.document_url)} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', textDecoration: 'none', fontWeight: 'bold' }}>Download PDF</a>
              </div>
            )}

            <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '10px' }}>Project Gallery ({viewModal.imagesArray.length})</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {viewModal.imagesArray.map((imgPath, index) => (
                <div key={index} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden', height: '120px' }}>
                  <img src={assetUrl(imgPath)} alt={`proj-img-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #334155', paddingTop: '15px' }}>
              <button onClick={() => setViewModal(null)} style={{ padding: '8px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT FORM MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '30px', width: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #334155' }}>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>{editId ? 'Edit Project' : 'Add New Project'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Project Title (English) *</label>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="Project">Project</option>
                    <option value="Program">Program</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="Planned">Planned</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Budget (ETB)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Location (English)</label>
                  <input
                    type="text"
                    value={formData.location_en}
                    onChange={(e) => setFormData({ ...formData, location_en: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>አድራሻ / ቦታ (አማርኛ)</label>
                  <input
                    type="text"
                    value={formData.location_am}
                    onChange={(e) => setFormData({ ...formData, location_am: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>የፕሮጀክቱ መግለጫ (አማርኛ)</label>
                <textarea
                  rows="3"
                  value={formData.description_am}
                  onChange={(e) => setFormData({ ...formData, description_am: e.target.value })}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                ></textarea>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Description (English)</label>
                <textarea
                  rows="3"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                ></textarea>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Project Images (Multiple)</label>
                <div style={{ border: '2px dashed #334155', padding: '15px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#0f172a' }}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedImages(Array.from(e.target.files))}
                    id="project-images-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="project-images-input" style={{ cursor: 'pointer', color: '#38bdf8', fontSize: '13px' }}>
                    {selectedImages.length > 0 ? `${selectedImages.length} images selected` : 'Click to Upload Photos'}
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Official Proposal PDF (Optional)</label>
                <div style={{ border: '2px dashed #334155', padding: '15px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#0f172a' }}>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setDocumentFile(e.target.files[0])}
                    id="project-document-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="project-document-input" style={{ cursor: 'pointer', color: '#38bdf8', fontSize: '13px' }}>
                    {documentFile ? documentFile.name : 'Click to Upload Document (PDF)'}
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}