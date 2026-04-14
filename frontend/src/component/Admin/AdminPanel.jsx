import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import './AdminPanel.css';

const AdminPanel = () => {
    const { user } = useContext(AuthContext);
    const [companies, setCompanies] = useState([]);
    const [formData, setFormData] = useState({
        name: '', insurance_type: 'Medical', base_charge: '', rating: '', description: '', terms: ''
    });
    const [filterType, setFilterType] = useState('All');

    const fetchCompanies = async () => {
        try {
            const res = await fetch('/companies');
            const data = await res.json();
            setCompanies(data);
        } catch (e) { console.error('Error fetching companies', e); }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, adminUsername: user?.username })
            });
            if ((await res.json()).success) {
                fetchCompanies();
                setFormData({ name: '', insurance_type: 'Medical', base_charge: '', rating: '', description: '', terms: '' });
                alert('Company added successfully!');
            }
        } catch (err) {
            alert('Failed to add company');
        }
    };

    if (!user || user.role !== 'admin') {
        return <div className="admin-container"><h2>Access Denied. Admins Only.</h2></div>;
    }

    return (
        <div className="admin-container">
            <h2>Admin Panel: Manage Insurance Companies</h2>
            
            <form className="admin-form" onSubmit={handleSubmit}>
                <div className="input-group">
                    <label>Company Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <label>Insurance Type</label>
                    <select name="insurance_type" value={formData.insurance_type} onChange={handleChange} required>
                        <option value="Medical">Medical</option>
                        <option value="Life">Life</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Estimated Charge ($)</label>
                    <input type="number" step="0.01" name="base_charge" value={formData.base_charge} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <label>Rating (1-5)</label>
                    <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <label>Terms & Conditions</label>
                    <textarea name="terms" value={formData.terms} onChange={handleChange} required />
                </div>
                <button type="submit" className="submit-btn admin-btn">Add Company</button>
            </form>

            <div className="company-list">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Registered Companies</h3>
                    <div>
                        <label>Filter by Type: </label>
                        <select onChange={(e) => setFilterType(e.target.value)} value={filterType}>
                            <option value="All">All</option>
                            <option value="Medical">Medical</option>
                            <option value="Life">Life</option>
                        </select>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr><th>Name</th><th>Type</th><th>Base Charge</th><th>Rating</th></tr>
                    </thead>
                    <tbody>
                        {companies.filter(c => filterType === 'All' || c.insurance_type === filterType).map(c => (
                            <tr key={c.id}>
                                <td>{c.name}</td>
                                <td>{c.insurance_type}</td>
                                <td>${c.base_charge}</td>
                                <td>⭐ {c.rating}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default AdminPanel;
