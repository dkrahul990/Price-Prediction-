import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import './CompanyList.css';

const CompanyList = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('All');

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await fetch('/companies');
                const data = await res.json();
                setCompanies(data);
            } catch (error) {
                console.error("Error fetching companies:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    const handleApplyClick = (companyId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate(`/apply/${companyId}`);
    };

    const displayedCompanies = companies.filter(c => filterType === 'All' || c.insurance_type === filterType);

    if (loading) return <div className="company-list-container"><h2>Loading companies...</h2></div>;

    return (
        <div className="company-list-container">
            <div className="header-section">
                <h2>Our Insurance Partners</h2>
                <div className="filter-box">
                    <label>Filter by Type: </label>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="All">All Categories</option>
                        <option value="Medical">Medical Insurance</option>
                        <option value="Life">Life Insurance</option>
                    </select>
                </div>
            </div>

            <div className="cards-grid">
                {displayedCompanies.length > 0 ? (
                    displayedCompanies.map(c => (
                        <div className="company-card" key={c.id}>
                            <div className="card-header">
                                <h3>{c.name}</h3>
                                <span className={`badge ${c.insurance_type.toLowerCase()}`}>{c.insurance_type}</span>
                            </div>
                            <div className="card-body">
                                <p className="rating">Rating: ⭐ {c.rating}</p>
                                <p className="est-charge">Avg Quote: <strong>${c.base_charge.toLocaleString()}</strong></p>
                                <p className="description">{c.description}</p>
                                
                                <button className="submit-btn apply-btn" onClick={() => handleApplyClick(c.id)}>
                                    Buy Option
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No companies found for this category.</p>
                )}
            </div>
        </div>
    );
};

export default CompanyList;
