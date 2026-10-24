import React, { useState, useEffect } from 'react';
import { API_ORIGIN } from '../config';
import axios from '../api';
import { Calendar, Plus, Trash2, Edit, X, Search, Upload, Clock, MapPin, Eye, EyeOff } from 'lucide-react';

export default function Events() {
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title_en: '',
    title_am: '',
    description_en: '',
    description_am: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location_en: '',
    location_am: '',
    image_url: '',
    is_published: true
  });

  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_ORIGIN}/api/events/admin/all`);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setEventsList(data);
    } catch (err) {
      console.error('Error fetching events:', err);
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
      event_date: '',
      start_time: '',
      end_time: '',
      location_en: '',
      location_am: '',
      image_url: '',
      is_published: true
    });
    setSelectedFile(null);
    setEditId(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditId(item.id);
      const formattedDate = item.event_date ? new Date(item.event_date).toISOString().slice(0, 10) : '';
      setFormData({
        title_en: item.title_en || '',
        title_am: item.title_am || '',
        description_en: item.description_en || '',
        description_am: item.description_am || '',
        event_date: formattedDate,
        start_time: item.start_time || '',
        end_time: item.end_time || '',
        location_en: item.location_en || '',
        location_am: item.location_am || '',
        image_url: item.image_url || '',
        is_published: item.is_published ?? true
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
      data.append('description_en', formData.description_en);
      data.append('description_am', formData.description_am);
      data.append('event_date', formData.event_date);
      data.append('start_time', formData.start_time);
      data.append('end_time', formData.end_time);
      data.append('location_en', formData.location_en);
      data.append('location_am', formData.location_am);
      data.append('is_published', formData.is_published);

      if (selectedFile) {
        data.append('image', selectedFile);
      } else if (formData.image_url) {
        data.append('image_url', formData.image_url);
      }

      const headers = {
        'Content-Type': 'multipart/form-data'
      };

      if (editId) {
        await axios.put(`${API_ORIGIN}/api/events/${editId}`, data, { headers });
      } else {
        await axios.post(`${API_ORIGIN}/api/events`, data, { headers });
      }

      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save public event.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`${API_ORIGIN}/api/events/${id}`);
      fetchEvents();
    } catch (err) {
      alert('Failed to delete event entry.');
    }
  };

  const filteredEvents = eventsList.filter(item =>
    item.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.title_am?.includes(searchQuery) ||
    item.location_en?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ color: '#f8fafc' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '22px', color: '#ffffff', fontWeight: '700' }}>City Public Events Management (የህዝባዊ ኩነቶች ማስታወቂያ)</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8' }}>Manage official municipal gatherings, schedules, locations, and event posters.</p>
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
          <Plus size={18} /> Add New Event
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px', position: 'relative' }}>
        <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Search events by title or location (በአርዕስት ወይም ቦታ ይፈልጉ)..."
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
        <p style={{ color: '#94a3b8' }}>Loading city events...</p>
      ) : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155', color: '#94a3b8', fontSize: '13px' }}>
                <th style={{ padding: '14px 18px' }}>Event Title</th>
                <th style={{ padding: '14px 18px' }}>Date & Schedule</th>
                <th style={{ padding: '14px 18px' }}>Location</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No upcoming events found.</td>
                </tr>
              ) : (
                filteredEvents.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #334155', fontSize: '14px', color: '#cbd5e1' }}>
                    <td style={{ padding: '14px 18px', fontWeight: '600', color: '#ffffff' }}>
                      <div>{item.title_en}</div>
                      {item.title_am && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>{item.title_am}</div>}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fb923c' }}>
                        <Calendar size={14} /> {new Date(item.event_date).toLocaleDateString()}
                      </div>
                      {(item.start_time || item.end_time) && (
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> {item.start_time || ''} - {item.end_time || ''}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}>
                        <MapPin size={14} /> {item.location_en}
                      </div>
                      {item.location_am && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>{item.location_am}</div>}
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
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '30px', width: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #334155' }}>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px' }}>{editId ? 'Edit Event Details' : 'Create New City Event'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Event Title (English) *</label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Event Title (Amharic - የኩነቱ አርዕስት)</label>
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
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Event Date (ቀን) *</label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Start Time (መነሻ ሰዓት)</label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>End Time (ማብቂያ ሰዓት)</label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Location (English) *</label>
                  <input
                    type="text"
                    value={formData.location_en}
                    onChange={(e) => setFormData({ ...formData, location_en: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Location (Amharic - የሚካሄድበት ቦታ)</label>
                  <input
                    type="text"
                    value={formData.location_am}
                    onChange={(e) => setFormData({ ...formData, location_am: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Upload Event Banner/Poster</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    style={{ width: '100%', padding: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', fontSize: '13px' }}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Description (English)</label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', height: '90px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#cbd5e1' }}>Description (Amharic - የኩነቱ ዝርዝር መግለጫ)</label>
                  <textarea
                    value={formData.description_am}
                    onChange={(e) => setFormData({ ...formData, description_am: e.target.value })}
                    style={{ width: '100%', padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#ffffff', boxSizing: 'border-box', height: '90px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #334155', paddingTop: '15px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 18px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 18px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}