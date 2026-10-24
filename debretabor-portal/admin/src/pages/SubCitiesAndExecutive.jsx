import React, { useState, useEffect, useCallback } from 'react';
import { API_ORIGIN, assetUrl } from '../config';
import axios from '../api';
import { Plus, Trash2, Pencil, X, FileText, Image as ImageIcon, Eye, Building2, UserCheck, Phone, MapPin, Search } from 'lucide-react';

const input = { padding: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '6px', width: '100%', boxSizing: 'border-box' };
const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' };
const primaryBtn = { backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' };
const overlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };

const EMPTY_SUB_CITY = { name_en: '', name_am: '', description_en: '', description_am: '', head_office_location_am: '', contact_phone: '', is_active: true };
const EMPTY_EXEC = {
  category: 'mayor', title_en: '', title_am: '', person_name_en: '', person_name_am: '',
  position_en: '', position_am: '', content_en: '', content_am: '', is_published: true
};
const matches = (item, q, keys) => !q || keys.some((k) => String(item[k] || '').toLowerCase().includes(q));
const EXEC_CATEGORIES = ['All', 'mayor', 'cabinet', 'structure', 'bureau'];

const rows = (res) => (Array.isArray(res.data) ? res.data : res.data.data || []);
const fromItem = (empty, item) => Object.fromEntries(Object.keys(empty).map((k) => [k, item[k] ?? empty[k]]));

// Defined at module level on purpose: components created inside a render remount on every keystroke and steal input focus.
const Header = ({ title, hint, onAdd, addLabel }) => (
  <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '18px' }}>
    <div>
      <h3 style={{ margin: 0, fontSize: '18px', color: '#ffffff' }}>{title}</h3>
      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>{hint}</p>
    </div>
    <button onClick={onAdd} style={primaryBtn}><Plus size={18} /> {addLabel}</button>
  </div>
);

const SearchBox = ({ value, onChange, placeholder }) => (
  <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '420px' }}>
    <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#94a3b8' }} />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} style={{ ...input, paddingLeft: '36px' }} />
  </div>
);

const Empty = ({ children }) => <div style={{ ...card, padding: '30px', textAlign: 'center', color: '#94a3b8' }}>{children}</div>;
const Modal = ({ title, onClose, onSubmit, width, children }) => (
  <div style={overlay}>
    <div style={{ ...card, padding: '25px', width, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
      <h3 style={{ color: '#ffffff', margin: '0 0 15px 0' }}>{title}</h3>
      <form onSubmit={onSubmit}>
        {children}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
        </div>
      </form>
    </div>
  </div>
);

export default function SubCitiesAndExecutive({ initialTab = 'subcities' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'subcities' | 'executive'
  const [subCities, setSubCities] = useState([]);
  const [executive, setExecutive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [execCategory, setExecCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [subView, setSubView] = useState(null);

  const [subModal, setSubModal] = useState(null);   // { id|null }
  const [execModal, setExecModal] = useState(null); // { id|null }
  const [viewModal, setViewModal] = useState(null);
  const [subForm, setSubForm] = useState(EMPTY_SUB_CITY);
  const [execForm, setExecForm] = useState(EMPTY_EXEC);
  const [execImage, setExecImage] = useState(null);
  const [execDoc, setExecDoc] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'subcities') {
        setSubCities(rows(await axios.get(`${API_ORIGIN}/api/executive/sub-cities/admin/all`)));
      } else {
        const q = execCategory !== 'All' ? `?category=${execCategory}` : '';
        setExecutive(rows(await axios.get(`${API_ORIGIN}/api/executive/admin/all${q}`)));
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, execCategory]);

  useEffect(() => { load(); }, [load]);
  // the sidebar links /admin/subcities and /admin/executive share this component: follow the route
  useEffect(() => { setActiveTab(initialTab); setQuery(''); }, [initialTab]);

  const q = query.trim().toLowerCase();
  const visibleSubCities = subCities.filter((sc) => matches(sc, q, ['name_en', 'name_am', 'description_en', 'description_am', 'head_office_location_am', 'contact_phone']));
  const visibleExecutive = executive.filter((it) => matches(it, q, ['title_en', 'title_am', 'person_name_en', 'person_name_am', 'position_en', 'position_am']));

  const openSub = (item) => { setSubForm(item ? fromItem(EMPTY_SUB_CITY, item) : EMPTY_SUB_CITY); setSubModal({ id: item?.id || null }); };
  const openExec = (item) => {
    setExecForm(item ? fromItem(EMPTY_EXEC, item) : EMPTY_EXEC);
    setExecImage(null); setExecDoc(null);
    setExecModal({ id: item?.id || null });
  };

  const saveSub = async (e) => {
    e.preventDefault();
    try {
      const url = `${API_ORIGIN}/api/executive/sub-cities${subModal.id ? `/${subModal.id}` : ''}`;
      await axios[subModal.id ? 'put' : 'post'](url, subForm);
      setSubModal(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save sub-city.');
    }
  };

  const saveExec = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(execForm).forEach(([k, v]) => data.append(k, v ?? ''));
      if (execImage) data.append('image', execImage);
      if (execDoc) data.append('document', execDoc);
      const url = `${API_ORIGIN}/api/executive${execModal.id ? `/${execModal.id}` : ''}`;
      await axios[execModal.id ? 'put' : 'post'](url, data);
      setExecModal(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save executive record.');
    }
  };

  const remove = async (url, what) => {
    if (!window.confirm(`Are you sure you want to delete this ${what}?`)) return;
    try {
      await axios.delete(`${API_ORIGIN}${url}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to delete ${what}.`);
    }
  };

  const tabStyle = (tab) => ({
    padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
    backgroundColor: activeTab === tab ? '#3b82f6' : '#1e293b', color: activeTab === tab ? '#ffffff' : '#94a3b8',
    display: 'flex', alignItems: 'center', gap: '8px'
  });

  const two = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginBottom: '10px' };
  const set = (setter, form) => (k) => (e) => setter({ ...form, [k]: e.target.value });
  const onSub = set(setSubForm, subForm);
  const onExec = set(setExecForm, execForm);

  return (
    <div style={{ color: '#f8fafc', width: '100%' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('subcities')} style={tabStyle('subcities')}><Building2 size={18} /> Sub-Cities (ክፍለ ከተሞች)</button>
        <button onClick={() => setActiveTab('executive')} style={tabStyle('executive')}><UserCheck size={18} /> Executive Branch (አስፈፃሚ አካላት)</button>
      </div>

      {/* ================= SUB-CITIES ================= */}
      {activeTab === 'subcities' && (
        <>
          <Header title="Sub-Cities Management (የክፍለ ከተሞች ማስተዳደሪያ)" hint="Manage Debre Tabor sub-cities, head offices, and contact numbers." onAdd={() => openSub(null)} addLabel="Add Sub-City" />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <SearchBox value={query} onChange={setQuery} placeholder="Search sub-cities…" />
          </div>
          {loading ? <p style={{ color: '#94a3b8' }}>Loading sub-cities...</p> : visibleSubCities.length === 0 ? (
            <Empty>{subCities.length === 0 ? 'No sub-cities found. Click "+ Add Sub-City" to record one.' : 'No sub-cities match your search.'}</Empty>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {visibleSubCities.map((sc) => (
                <div key={sc.id} onClick={() => setSubView(sc)} style={{ ...card, cursor: 'pointer', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: sc.is_active ? 1 : 0.6 }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }}>{sc.name_en}</h4>
                    {sc.name_am && <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#94a3b8' }}>{sc.name_am}</p>}
                    {sc.head_office_location_am && <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> {sc.head_office_location_am}</p>}
                    {sc.contact_phone && <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {sc.contact_phone}</p>}
                    <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', lineHeight: '1.5' }}>{sc.description_en || sc.description_am}</p>
                    {!sc.is_active && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#fbbf24' }}>Hidden from the public site</p>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '12px', marginTop: '15px' }}>
                    <span style={{ fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> View</span>
                    <span style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={(e) => { e.stopPropagation(); openSub(sc); }} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }} title="Edit" aria-label="Edit"><Pencil size={16} /></button>
                      <button onClick={(e) => { e.stopPropagation(); remove(`/api/executive/sub-cities/${sc.id}`, 'sub-city'); }} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }} title="Delete" aria-label="Delete"><Trash2 size={16} /></button>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ================= EXECUTIVE ================= */}
      {activeTab === 'executive' && (
        <>
          <Header title="Executive Branch & Bureaus (የአስፈፃሚ አካላት እና ቢሮዎች)" hint="Manage Mayor office, cabinet members, city structure, and bureaus." onAdd={() => openExec(null)} addLabel="Add Executive Record" />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <SearchBox value={query} onChange={setQuery} placeholder="Search executive records…" />
            {EXEC_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setExecCategory(cat)} style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '13px', border: '1px solid #334155', cursor: 'pointer', backgroundColor: execCategory === cat ? '#3b82f6' : '#1e293b', color: execCategory === cat ? '#ffffff' : '#94a3b8', textTransform: 'capitalize' }}>{cat}</button>
            ))}
          </div>
          {loading ? <p style={{ color: '#94a3b8' }}>Loading executive content...</p> : visibleExecutive.length === 0 ? (
            <Empty>{executive.length === 0 ? 'No executive content found in this category.' : 'No records match your search.'}</Empty>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {visibleExecutive.map((item) => (
                <div key={item.id} onClick={() => setViewModal(item)} style={{ ...card, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: item.is_published ? 1 : 0.6 }}>
                  <div style={{ height: '160px', backgroundColor: '#0f172a', position: 'relative' }}>
                    {item.image_url ? <img src={assetUrl(item.image_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={36} color="#475569" /></div>}
                    <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#38bdf8', color: '#0f172a', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'capitalize' }}>{item.category}</span>
                  </div>
                  <div style={{ padding: '15px' }}>
                    <h4 style={{ margin: '0 0 4px 0', color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>{item.title_en}</h4>
                    {item.title_am && <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#94a3b8' }}>{item.title_am}</p>}
                    {(item.person_name_en || item.person_name_am) && <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#38bdf8' }}>👤 {item.person_name_en || item.person_name_am}</p>}
                    {(item.position_en || item.position_am) && <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>{item.position_en || item.position_am}</p>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderTop: '1px solid #334155' }}>
                    <span style={{ fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> View {item.document_url && '📄'}</span>
                    <span style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={(e) => { e.stopPropagation(); openExec(item); }} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }} title="Edit" aria-label="Edit"><Pencil size={16} /></button>
                      <button onClick={(e) => { e.stopPropagation(); remove(`/api/executive/${item.id}`, 'executive record'); }} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* SUB-CITY VIEW */}
      {subView && (
        <div style={{ ...overlay, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1100 }}>
          <div style={{ ...card, padding: '25px', width: '600px', maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
              <div>
                <span style={{ color: subView.is_active ? '#34d399' : '#fbbf24', fontSize: '11px', fontWeight: 'bold' }}>{subView.is_active ? 'Active' : 'Hidden'}</span>
                <h3 style={{ margin: '2px 0 0 0', color: '#ffffff', fontSize: '18px' }}>{subView.name_en}{subView.name_am && ` · ${subView.name_am}`}</h3>
              </div>
              <button onClick={() => setSubView(null)} aria-label="Close" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            {subView.head_office_location_am && <p style={{ color: '#38bdf8', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={15} /> {subView.head_office_location_am}</p>}
            {subView.contact_phone && <p style={{ color: '#34d399', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={15} /> {subView.contact_phone}</p>}
            {[['English', subView.description_en], ['አማርኛ', subView.description_am]].map(([lng, text]) => text && (
              <div key={lng} style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>{lng}</span>
                <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6', margin: '4px 0 0', whiteSpace: 'pre-line' }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW */}
      {viewModal && (
        <div style={{ ...overlay, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1100 }}>
          <div style={{ ...card, padding: '25px', width: '700px', maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
              <div>
                <span style={{ color: '#38bdf8', fontSize: '11px', fontWeight: 'bold', textTransform: 'capitalize' }}>{viewModal.category}</span>
                <h3 style={{ margin: '2px 0 0 0', color: '#ffffff', fontSize: '18px' }}>{viewModal.title_en}{viewModal.title_am && ` · ${viewModal.title_am}`}</h3>
              </div>
              <button onClick={() => setViewModal(null)} aria-label="Close" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            {viewModal.image_url && <div style={{ width: '100%', height: '240px', borderRadius: '8px', overflow: 'hidden', marginBottom: '15px', backgroundColor: '#0f172a' }}><img src={assetUrl(viewModal.image_url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>}
            {[['en', viewModal.person_name_en, viewModal.position_en, viewModal.content_en], ['am', viewModal.person_name_am, viewModal.position_am, viewModal.content_am]].map(([lng, name, pos, content]) => (
              (name || pos || content) && (
                <div key={lng} style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '12px' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>{lng === 'en' ? 'English' : 'አማርኛ'}</span>
                  {name && <p style={{ color: '#38bdf8', margin: '4px 0 2px 0', fontSize: '14px', fontWeight: 'bold' }}>👤 {name}</p>}
                  {pos && <p style={{ color: '#94a3b8', margin: '0 0 8px 0', fontSize: '12px' }}>{pos}</p>}
                  {content && <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-line' }}>{content}</p>}
                </div>
              )
            ))}
            {viewModal.document_url && (
              <div style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid #3b82f6', padding: '10px 15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#38bdf8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={16} /> Official Document Attached</span>
                <a href={assetUrl(viewModal.document_url)} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#3b82f6', color: 'white', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', textDecoration: 'none', fontWeight: 'bold' }}>Download</a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-CITY FORM */}
      {subModal && (
        <Modal title={subModal.id ? 'Edit Sub-City' : 'Add New Sub-City'} width="600px" onClose={() => setSubModal(null)} onSubmit={saveSub}>
          <div style={two}>
            <input style={input} placeholder="Name (EN) *" value={subForm.name_en} onChange={onSub('name_en')} required maxLength={150} />
            <input style={input} placeholder="ስም (አማርኛ)" value={subForm.name_am} onChange={onSub('name_am')} maxLength={150} />
          </div>
          <div style={two}>
            <textarea style={input} rows="3" placeholder="Description (EN)" value={subForm.description_en} onChange={onSub('description_en')} />
            <textarea style={input} rows="3" placeholder="መግለጫ (አማርኛ)" value={subForm.description_am} onChange={onSub('description_am')} />
          </div>
          <div style={two}>
            <input style={input} placeholder="ዋና መሥሪያ ቤት አድራሻ (Amharic)" value={subForm.head_office_location_am} onChange={onSub('head_office_location_am')} />
            <input style={input} placeholder="Contact Phone" value={subForm.contact_phone} onChange={onSub('contact_phone')} maxLength={50} />
          </div>
          <select style={input} value={String(subForm.is_active)} onChange={(e) => setSubForm({ ...subForm, is_active: e.target.value === 'true' })}>
            <option value="true">Active (visible on the public site)</option>
            <option value="false">Hidden</option>
          </select>
        </Modal>
      )}

      {/* EXECUTIVE FORM */}
      {execModal && (
        <Modal title={execModal.id ? 'Edit Executive Content' : 'Add Executive Content'} width="700px" onClose={() => setExecModal(null)} onSubmit={saveExec}>
          <div style={two}>
            <select style={input} value={execForm.category} onChange={onExec('category')}>
              <option value="mayor">Mayor Office</option>
              <option value="cabinet">Cabinet Member</option>
              <option value="structure">City Structure</option>
              <option value="bureau">Bureau / Sector</option>
            </select>
            <select style={input} value={String(execForm.is_published)} onChange={(e) => setExecForm({ ...execForm, is_published: e.target.value === 'true' })}>
              <option value="true">Published</option>
              <option value="false">Draft</option>
            </select>
          </div>
          <div style={two}>
            <input style={input} placeholder="Title (EN) *" value={execForm.title_en} onChange={onExec('title_en')} required maxLength={255} />
            <input style={input} placeholder="ርዕስ (አማርኛ)" value={execForm.title_am} onChange={onExec('title_am')} maxLength={255} />
          </div>
          <div style={two}>
            <input style={input} placeholder="Person Name (EN)" value={execForm.person_name_en} onChange={onExec('person_name_en')} maxLength={150} />
            <input style={input} placeholder="የሰው ስም (አማርኛ)" value={execForm.person_name_am} onChange={onExec('person_name_am')} maxLength={150} />
          </div>
          <div style={two}>
            <input style={input} placeholder="Position (EN)" value={execForm.position_en} onChange={onExec('position_en')} maxLength={150} />
            <input style={input} placeholder="ኃላፊነት (አማርኛ)" value={execForm.position_am} onChange={onExec('position_am')} maxLength={150} />
          </div>
          <div style={two}>
            <textarea style={input} rows="4" placeholder="Details (EN)" value={execForm.content_en} onChange={onExec('content_en')} />
            <textarea style={input} rows="4" placeholder="ዝርዝር (አማርኛ)" value={execForm.content_am} onChange={onExec('content_am')} />
          </div>
          <div style={two}>
            <div><label style={{ fontSize: '12px', color: '#cbd5e1' }}>Image {execModal.id && '(leave empty to keep current)'}</label><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setExecImage(e.target.files[0] || null)} style={{ fontSize: '11px' }} /></div>
            <div><label style={{ fontSize: '12px', color: '#cbd5e1' }}>Document (PDF) {execModal.id && '(leave empty to keep current)'}</label><input type="file" accept="application/pdf" onChange={(e) => setExecDoc(e.target.files[0] || null)} style={{ fontSize: '11px' }} /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
