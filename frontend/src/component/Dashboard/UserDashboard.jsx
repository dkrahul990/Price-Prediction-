import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import './UserDashboard.css';

const UserDashboard = () => {
    const { user } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchDashboard = async () => {
            try {
                const res = await fetch('/user/dashboard', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user.username })
                });
                const data = await res.json();
                if (data.success) {
                    setDashboardData(data.dashboard);
                }
            } catch (error) {
                console.error("Dashboard error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, [user]);

    if (!user) return <div className="dashboard-container"><h2>Please log in to view your dashboard.</h2></div>;
    if (loading) return <div className="dashboard-container"><p>Loading dashboard...</p></div>;

    return (
        <div className="dashboard-container">
            <h2>Welcome back, {dashboardData?.username}!</h2>
            <div className="dashboard-section">
                <h3>Your Active Policies</h3>
                {dashboardData?.purchases?.length > 0 ? (
                    <table className="purchase-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Company</th>
                                <th>Insurance Type</th>
                                <th>Amount Paid</th>
                                <th>Payment Method</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dashboardData.purchases.map(p => (
                                <tr key={p.id}>
                                    <td>{p.date}</td>
                                    <td>{p.company_name}</td>
                                    <td><span className={`badge ${p.insurance_type.toLowerCase()}`}>{p.insurance_type}</span></td>
                                    <td>${p.price.toFixed(2)}</td>
                                    <td>{p.payment_method}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>You have not purchased any insurance plans yet. Go to Home to get a quote!</p>
                )}
            </div>
        </div>
    );
};
export default UserDashboard;
