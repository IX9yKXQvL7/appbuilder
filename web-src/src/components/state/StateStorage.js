import React, { useEffect, useState } from 'react'

function StateStorage() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editMode, setEditMode] = useState(false)

    const [form, setForm] = useState({
        id: '',
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: ''
    })

  // 🔹 FETCH LIST
    const fetchData = async () => {
        setLoading(true)
        try {
          const res = await fetch('/api/v1/web/Adobe/state-storage-list')
          const json = await res.json()

          // normalize API response
          const normalized = (json.data || []).map(item => ({
            id: item.key,
            ...item.value
          }))

          setData(normalized)
        } catch (err) {
          console.error(err)
        } finally {
          setLoading(false)
        }
    }

  useEffect(() => {
    fetchData()
  }, [])

  // 🔹 FORM CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // 🔹 ADD / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.id || !form.name || !form.email) {
      alert('ID, Name, Email required')
      return
    }

    const url = editMode
      ? '/api/v1/web/Adobe/state-storage'
      : '/api/v1/web/Adobe/state-storage'

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const json = await res.json()

      if (json.success) {
        setShowModal(false)
        setEditMode(false)
        resetForm()
        fetchData()
      } else {
        alert(json.error)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // 🔹 EDIT
  const handleEdit = (item) => {
    setForm(item)
    setEditMode(true)
    setShowModal(true)
  }

  // 🔹 DELETE
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return

    try {
      const res = await fetch('/api/v1/web/Adobe/state-storage-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      const json = await res.json()
      if (json.success) fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const resetForm = () => {
    setForm({
      id: '',
      name: '',
      email: '',
      phone: '',
      company: '',
      notes: ''
    })
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>State Storage Demo</h2>

      <button onClick={() => {
        resetForm()
        setEditMode(false)
        setShowModal(true)
      }}>
        Add
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Company</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.company}</td>
                <td>
                  <button onClick={() => handleEdit(item)}>Edit</button>{' '}
                  <button onClick={() => handleDelete(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 🔹 MODAL */}
      {showModal && (
        <div style={modalStyle}>
          <form onSubmit={handleSubmit} style={modalContent}>
            <h3>{editMode ? 'Update' : 'Add'} Record</h3>

            <input
              name="id"
              placeholder="ID *"
              value={form.id}
              onChange={handleChange}
              disabled={editMode}
            />
            <input
              name="name"
              placeholder="Name *"
              value={form.name}
              onChange={handleChange}
            />
            <input
              name="email"
              placeholder="Email *"
              value={form.email}
              onChange={handleChange}
            />
            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
            />
            <input
              name="company"
              placeholder="Company"
              value={form.company}
              onChange={handleChange}
            />
            <textarea
              name="notes"
              placeholder="Notes"
              value={form.notes}
              onChange={handleChange}
            />

            <div style={{ marginTop: 10 }}>
              <button type="submit">
                {editMode ? 'Update' : 'Save'}
              </button>
              <button type="button" onClick={() => setShowModal(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

// 🔹 MODAL STYLES
const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const modalContent = {
  background: '#fff',
  padding: 20,
  width: 320,
  display: 'flex',
  flexDirection: 'column',
  gap: 8
}

export default StateStorage