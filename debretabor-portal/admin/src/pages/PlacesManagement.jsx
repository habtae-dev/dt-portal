import React, { useState, useEffect } from 'react';
import { API_ORIGIN, assetUrl } from '../config';
import axios from '../api';
import { Plus, Trash2, Edit, X, Search, Upload, MapPin, Image as ImageIcon, Eye, ExternalLink } from 'lucide-react';

export default function PlacesManagement() {
  const [placesList, setPlacesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [viewPlaceModal, setViewPlaceModal] = useState(null);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    name_en: '',
    name_am: '',
    category: 'Park',
    description_en: '',
    description_am: '',
    location_en: '',
    location_am: '',
    google_maps_url: '',
    is_published: true
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  const categories = ['All', 'Park', 'Monument', 'Museum'];

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_ORIGIN}/api/places/admin/all`);
      const resData = res.data;
      if (Array.isArray(resData)) {
        setPlacesList(resData);
      } else if (resData && Array.isArray(resData.data)) {
        setPlacesList(resData.data);
      } else {
        setPlacesList([]);
      }
    } catch (err) {
      console.error('Error fetching places:', err);
      setPlacesList([]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_am: '',
      category: 'Park',
      description_en: '',
      description_am: '',
      location_en: '',
      location_am: '',
      google_maps_url: '',
      is_published: true
    });
    setSelectedFiles([]);
    setEditId(null);
  };

  const handleOpenModal = (item = null, e = null) => {
    if (e) e.stopPropagation();
    if (item) {
      setEditId(item.id);
      setFormData({
        name_en: item.name_en || '',
        name_am: item.name_am || '',
        category: item.category || 'Park',
        description_en: item.description_en || '',
        description_am: item.description_am || '',
        location_en: item.location_en || '',
        location_am: item.location_am || '',
        google_maps_url: item.google_maps_url || '',
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
      data.append('name_en', formData.name_en);
      data.append('name_am', formData.name_am || '');
      data.append('category', formData.category);
      data.append('description_en', formData.description_en || '');
      data.append('description_am', formData.description_am || '');
      data.append('location_en', formData.location_en || '');
      data.append('location_am', formData.location_am || '');
      data.append('google_maps_url', formData.google_maps_url || '');
      data.append('is_published', formData.is_published);

      for (let i = 0; i < selectedFiles.length; i++) {
        data.append('images', selectedFiles[i]);
      }

      const headers = {
        'Content-Type': 'multipart/form-data'
      };

      if (editId) {
        await axios.put(`${API_ORIGIN}/api/places/${editId}`, data, { headers });
      } else {
        await axios.post(`${API_ORIGIN}/api/places`, data, { headers });
      }

      setShowModal(false);
      resetForm();
      fetchPlaces();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save place record.');
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this place?')) return;
    try {
      await axios.delete(`${API_ORIGIN}/api/places/${id}`);
      fetchPlaces();
    } catch (err) {
      alert('Failed to delete place.');
    }
  };

  const filteredPlaces = placesList.filter(item => {
    if (!item) return false;
    const matchesSearch = (item.name_en || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.name_am || '').includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '20px', color: '#f8fafc', width: '100%', boxSizing: 'border-box' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#ffffff', fontWeight: '700' }}>Places Management (የቦታዎች እና የቱሪዝም መዳረሻዎች)</h3>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>Manage parks, monuments, museums, locations, and bilingual content.</p>
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
          <Plus size={18} /> Add New Place
        </button>
      </div>

      {/* Filter and Search */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search places by name..."
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

      {/* Grid Display */}
      {loading ? (
        <p style={{ color: '#94a3b8', padding: '20px' }}>Loading places...</p>
      ) : filteredPlaces.length === 0 ? (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '15px' }}>No places found.</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Click on <strong>"+ Add New Place"</strong> to register one.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredPlaces.map((item) => {
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
                onClick={() => setViewPlaceModal({ ...item, imagesArray: parsedImages })}
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
                  <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(56, 189, 248, 0.9)', color: '#0f172a', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                    {item.category}
                  </span>
                </div>

                <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    {/* Amharic Title & English Title */}
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#ffffff', fontWeight: '700' }}>{item.name_am || item.name_en}</h4>
                    {item.name_am && <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94a3b8' }}>{item.name_en}</p>}

                    {/* Amharic / English Location */}
                    {(item.location_am || item.location_en) && (
                      <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} /> {item.location_am || item.location_en}
                      </p>
                    )}

                    {/* Short Description */}
                    <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description_am || item.description_en || 'መግለጫ አልተሰጠም'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '10px', marginTop: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> View Details ({parsedImages.length})</span>
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

      {/* 🔴 REVIEW & DETAILS MODAL (መግለጫው፣ ሎኬሽኑ እና ሪቪው ከፎቶዎቹ በላይ ተደርጓል) */}
      {viewPlaceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '25px', width: '800px', maxHeight: '85vh', overflowY: 'auto' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '12px', borderBottom: '1px solid #334155' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#ffffff', fontSize: '20px' }}>{viewPlaceModal.name_am || viewPlaceModal.name_en}</h3>
                {viewPlaceModal.name_am && <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>{viewPlaceModal.name_en}</p>}
              </div>
              <button onClick={() => setViewPlaceModal(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={22} /></button>
            </div>

            {/* 🔴 1. LOCATION AND MAP URL (ከፎቶዎቹ በላይ) */}
            <div style={{ backgroundColor: '#0f172a', padding: '12px 15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>ቦታ / Location:</span>
                <p style={{ margin: 0, color: '#38bdf8', fontSize: '14px', fontWeight: '600' }}>
                  📍 {viewPlaceModal.location_am || viewPlaceModal.location_en || 'አድራሻ አልተጠቀሰም'}
                </p>
              </div>
              {viewPlaceModal.google_maps_url && (
                <a
                  href={viewPlaceModal.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#3b82f6', color: '#ffffff', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', textDecoration: 'none', fontWeight: 'bold' }}
                >
                  <ExternalLink size={14} /> Open Map URL
                </a>
              )}
            </div>

            {/* 🔴 2. REVIEW & DESCRIPTION (ከፎቶዎቹ በላይ) */}
            <div style={{ marginBottom: '20px', backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', border: '1px solid #334155' }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#f1f5f9', fontSize: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '5px' }}>መግለጫ እና ማብራሪያ (Review & Description)</h4>
              {viewPlaceModal.description_am && (
                <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6', margin: '0 0 10px 0' }}>{viewPlaceModal.description_am}</p>
              )}
              {viewPlaceModal.description_en && (
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>{viewPlaceModal.description_en}</p>
              )}
            </div>

            {/* 🔴 3. IMAGES GALLERY (ከመግለጫው በታች) */}
            <h4 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '10px' }}>የፎቶዎች ጋለሪ ({viewPlaceModal.imagesArray.length})</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {viewPlaceModal.imagesArray.map((imgPath, index) => (
                <div key={index} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden', height: '120px' }}>
                  <img src={assetUrl(imgPath)} alt={`place-img-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #334155', paddingTop: '15px' }}>
              <button onClick={() => setViewPlaceModal(null)} style={{ padding: '8px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form for Add/Edit */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '30px', width: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #334155' }}>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>{editId ? 'Edit Place' : 'Add New Place'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Place Name (English) *</label>
                  <input
                    type="text"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>የቦታው ስም (አማርኛ)</label>
                  <input
                    type="text"
                    value={formData.name_am}
                    onChange={(e) => setFormData({ ...formData, name_am: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
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
                    <option value="Park">Park</option>
                    <option value="Monument">Monument</option>
                    <option value="Museum">Museum</option>
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
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>አድራሻ (አማርኛ)</label>
                  <input
                    type="text"
                    value={formData.location_am}
                    onChange={(e) => setFormData({ ...formData, location_am: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Google Maps Link (URL)</label>
                <input
                  type="text"
                  placeholder="https://maps.google.com/..."
                  value={formData.google_maps_url}
                  onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>የቦታው መግለጫ (አማርኛ)</label>
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

              {/* Upload Images */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Select Photos (Multiple)</label>
                <div style={{ border: '2px dashed #334155', padding: '18px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#0f172a' }}>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
                    id="place-images-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="place-images-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                    <Upload size={20} />
                    <span style={{ fontSize: '13px' }}>{selectedFiles.length > 0 ? `${selectedFiles.length} photos selected` : 'Click to Upload Photos'}</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Place</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}