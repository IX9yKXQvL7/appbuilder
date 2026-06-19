import React, { useEffect, useState } from 'react';
import allActions from '../../config.json';

const initialForm = {
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: ''
};

const styles = {
    page: {
        background: '#f4f6f8',
        minHeight: '100vh',
        padding: '40px'
    },
    container: {
        maxWidth: '1000px',
        margin: '0 auto',
        background: '#fff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
        fontFamily: 'Segoe UI, Roboto, Arial'
    },
    title: { marginBottom: '20px' },
    button: {
        padding: '10px 15px',
        background: '#2563eb',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { background: '#f1f5f9', padding: '12px', textAlign: 'left' },
    td: { padding: '12px', borderBottom: '1px solid #e5e7eb' },

    /* Modal */
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    modal: {
        background: '#fff',
        padding: '25px',
        width: '500px',
        borderRadius: '10px'
    },
    form: { display: 'grid', gap: '10px' },
    input: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
    textarea: { padding: '10px', borderRadius: '5px', border: '1px solid #ccc' },
    footerBtns: { display: 'flex', gap: '10px', marginTop: '10px' }
};

function GenerateTicket() {
    const [form, setForm] = useState(initialForm);
    const [users, setUsers] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const listUrl = allActions['Adobe/database-list'];
    const createUrl = allActions['Adobe/database-storage'];
    const deleteUrl = allActions['Adobe/database-delete'];
    const updateUrl = allActions['Adobe/database-edit'];

    const fetchUsers = async () => {
        const res = await fetch(listUrl);
        const data = await res.json();
        setUsers(data.data || []);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingId ? updateUrl : createUrl;
        const method = editingId ? 'POST' : 'POST';
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                editingId
                ? { id: editingId, ...form }
                : form
            )
        });
        setShowModal(false);
        setForm(initialForm);
        setEditingId(null);
        fetchUsers();
    };

    const handleEdit = (u) => {
        setEditingId(u.id);
        setForm(u);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this ticket?')) return;
        await fetch(`${deleteUrl}?id=${id}`, { method: 'DELETE' });
        fetchUsers();
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <h2 style={styles.title}>🎫 Generate Ticket</h2>
                <button
                style={styles.button}
                onClick={() => {
                    setForm(initialForm);
                    setEditingId(null);
                    setShowModal(true);
                }}
                >➕ Create Ticket</button>
                <table style={styles.table}>
                <thead>
                    <tr>
                    {['Name', 'Email', 'Phone', 'Company', 'Notes', 'Action'].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                    <tr key={u.id}>
                        <td style={styles.td}>{u.name}</td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>{u.phone}</td>
                        <td style={styles.td}>{u.company}</td>
                        <td style={styles.td}>{u.notes}</td>
                        <td style={styles.td}>
                        <button onClick={() => handleEdit(u)}>✏️</button>{' '}
                        <button onClick={() => handleDelete(u.id)}>🗑</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            {showModal && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <h3>{editingId ? 'Edit Ticket' : 'Create Ticket'}</h3>
                        <form onSubmit={handleSubmit} style={styles.form}>
                            {['id', 'name', 'email', 'phone', 'company'].map(f => (
                                <input key={f} name={f}
                                    placeholder={f.toUpperCase()}
                                    value={form[f]}
                                    onChange={handleChange}
                                    style={styles.input}
                                    required={f !== 'phone' && f !== 'company'}
                                />
                            ))}
                            <textarea
                                name="notes"
                                placeholder="NOTES"
                                value={form.notes}
                                onChange={handleChange}
                                style={styles.textarea}
                            />
                            <div style={styles.footerBtns}>
                                <button type="submit" style={styles.button}>
                                {editingId ? 'Update' : 'Save'}
                                </button>
                                <button type="button" onClick={() => setShowModal(false)}>
                                Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GenerateTicket;