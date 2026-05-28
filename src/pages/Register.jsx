import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'

const CLASSES = ['Nursery','LKG','UKG','Class I','Class II','Class III','Class IV',
  'Class V','Class VI','Class VII','Class VIII','Class IX','Class X','Class XI','Class XII']
const RELIGIONS = ['Hindu','Muslim','Christian','Sikh','Buddhist','Jain','Other']

const EMPTY_FORM = {
  adm_no: '', name: '', father_name: '', mother_name: '',
  dob: '', address: '', adm_date: '', tc_date: '',
  class_of_study: '', religion: '', caste: ''
}

function fmt(d) {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

export default function Register({ user, onSignOut }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('adm_no', { ascending: true })
    if (!error) setRecords(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const filtered = records.filter(r => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      r.name?.toLowerCase().includes(q) ||
      r.adm_no?.toLowerCase().includes(q) ||
      r.father_name?.toLowerCase().includes(q) ||
      r.caste?.toLowerCase().includes(q)
    const matchClass = !filterClass || r.class_of_study === filterClass
    return matchSearch && matchClass
  })

  const stats = {
    total: records.length,
    active: records.filter(r => !r.tc_date).length,
    tc: records.filter(r => r.tc_date).length,
    classes: new Set(records.map(r => r.class_of_study).filter(Boolean)).size
  }

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setEditId(null)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (r) => {
    setForm({
      adm_no: r.adm_no || '', name: r.name || '',
      father_name: r.father_name || '', mother_name: r.mother_name || '',
      dob: r.dob || '', address: r.address || '',
      adm_date: r.adm_date || '', tc_date: r.tc_date || '',
      class_of_study: r.class_of_study || '',
      religion: r.religion || '', caste: r.caste || ''
    })
    setEditId(r.id)
    setFormError('')
    setShowModal(true)
  }

  const closeModal = () => { setShowModal(false); setEditId(null) }

  const handleSave = async () => {
    if (!form.adm_no.trim() || !form.name.trim() || !form.adm_date) {
      setFormError('Admission number, candidate name, and admission date are required.')
      return
    }
    const dup = records.find(r => r.adm_no === form.adm_no.trim() && r.id !== editId)
    if (dup) { setFormError(`Admission number ${form.adm_no} already exists.`); return }
    setSaving(true)
    const payload = {
      adm_no: form.adm_no.trim(),
      name: form.name.trim(),
      father_name: form.father_name.trim(),
      mother_name: form.mother_name.trim(),
      dob: form.dob || null,
      address: form.address.trim(),
      adm_date: form.adm_date,
      tc_date: form.tc_date || null,
      class_of_study: form.class_of_study || null,
      religion: form.religion || null,
      caste: form.caste.trim() || null,
    }
    let error
    if (editId) {
      ;({ error } = await supabase.from('students').update(payload).eq('id', editId))
    } else {
      ;({ error } = await supabase.from('students').insert([payload]))
    }
    setSaving(false)
    if (error) { setFormError(error.message); return }
    closeModal()
    fetchRecords()
  }

  const handleDelete = async (id) => {
    await supabase.from('students').delete().eq('id', id)
    setDeleteConfirm(null)
    fetchRecords()
  }

  const exportCSV = () => {
    const cols = ['Adm No','Name','Father','Mother','Class','Religion','Caste','DOB','Address','Adm Date','TC Date']
    const rows = records.map(r => [
      r.adm_no, r.name, r.father_name, r.mother_name, r.class_of_study,
      r.religion, r.caste, fmt(r.dob), r.address, fmt(r.adm_date), r.tc_date ? fmt(r.tc_date) : ''
    ].map(v => `"${v || ''}"`).join(','))
    const csv = [cols.join(','), ...rows].join('\n')
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'admission_register.csv'
    a.click()
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="header-emblem">DAV</div>
          <div>
            <div className="header-title">D.A.V. Mukhyamantri Public School</div>
            <div className="header-sub">Ulloor, Bhopalpatnam — Admission Register</div>
          </div>
        </div>
        <div className="header-right">
          <span className="header-user">{user?.email}</span>
          <button className="btn-outline" onClick={onSignOut}>Sign out</button>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-row">
        {[
          { label: 'Total students', value: stats.total },
          { label: 'Active', value: stats.active },
          { label: 'TC issued', value: stats.tc },
          { label: 'Classes', value: stats.classes },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search by name, adm. no., father's name, caste…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={filterClass} onChange={e => setFilterClass(e.target.value)}>
          <option value="">All classes</option>
          {CLASSES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button className="btn-primary" onClick={openAdd}>+ Add student</button>
        <button className="btn-outline" onClick={exportCSV}>↓ Export CSV</button>
      </div>

      {/* Table */}
      <div className="table-wrap">
        {loading ? (
          <div className="loading-state">Loading records…</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No records found</div>
        ) : (
          <table className="register-table">
            <thead>
              <tr>
                {['Adm. No.','Candidate','Father','Mother','Class','Religion','Caste','DOB','Address','Adm. Date','TC Date',''].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.adm_no}</strong></td>
                  <td>{r.name}</td>
                  <td>{r.father_name || '—'}</td>
                  <td>{r.mother_name || '—'}</td>
                  <td>{r.class_of_study ? <span className="badge badge-class">{r.class_of_study}</span> : '—'}</td>
                  <td>{r.religion || '—'}</td>
                  <td>{r.caste || '—'}</td>
                  <td>{fmt(r.dob)}</td>
                  <td className="address-cell">{r.address || '—'}</td>
                  <td>{fmt(r.adm_date)}</td>
                  <td>
                    {r.tc_date
                      ? <span className="badge badge-tc">{fmt(r.tc_date)}</span>
                      : <span className="badge badge-active">Active</span>}
                  </td>
                  <td className="actions-cell">
                    <button className="icon-btn" onClick={() => openEdit(r)} title="Edit">✎</button>
                    <button className="icon-btn danger" onClick={() => setDeleteConfirm(r.id)} title="Delete">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editId ? 'Edit student' : 'Add student'}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-section-label">Admission details</div>
              <div className="form-grid">
                <div className="field-group">
                  <label>Admission number *</label>
                  <input value={form.adm_no} onChange={e => setForm(f => ({...f, adm_no: e.target.value}))} placeholder="e.g. 104" />
                </div>
                <div className="field-group">
                  <label>Date of admission *</label>
                  <input type="date" value={form.adm_date} onChange={e => setForm(f => ({...f, adm_date: e.target.value}))} />
                </div>
                <div className="field-group">
                  <label>Class of study</label>
                  <select value={form.class_of_study} onChange={e => setForm(f => ({...f, class_of_study: e.target.value}))}>
                    <option value="">Select class</option>
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label>TC date (if issued)</label>
                  <input type="date" value={form.tc_date} onChange={e => setForm(f => ({...f, tc_date: e.target.value}))} />
                </div>
              </div>

              <div className="form-section-label">Personal details</div>
              <div className="form-grid">
                <div className="field-group full">
                  <label>Name of candidate *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Full name" />
                </div>
                <div className="field-group">
                  <label>Father's name</label>
                  <input value={form.father_name} onChange={e => setForm(f => ({...f, father_name: e.target.value}))} placeholder="Father's full name" />
                </div>
                <div className="field-group">
                  <label>Mother's name</label>
                  <input value={form.mother_name} onChange={e => setForm(f => ({...f, mother_name: e.target.value}))} placeholder="Mother's full name" />
                </div>
                <div className="field-group">
                  <label>Date of birth</label>
                  <input type="date" value={form.dob} onChange={e => setForm(f => ({...f, dob: e.target.value}))} />
                </div>
                <div className="field-group">
                  <label>Religion</label>
                  <select value={form.religion} onChange={e => setForm(f => ({...f, religion: e.target.value}))}>
                    <option value="">Select religion</option>
                    {RELIGIONS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label>Caste</label>
                  <input value={form.caste} onChange={e => setForm(f => ({...f, caste: e.target.value}))} placeholder="e.g. General / OBC / SC / ST" />
                </div>
                <div className="field-group full">
                  <label>Address</label>
                  <input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} placeholder="Full address" />
                </div>
              </div>
              {formError && <div className="form-error">{formError}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={closeModal}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save record'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal modal-sm">
            <div className="modal-header">
              <h2>Delete record?</h2>
            </div>
            <div className="modal-body">
              <p style={{color:'var(--text-secondary)', fontSize:'14px'}}>This will permanently delete the student record. This cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
