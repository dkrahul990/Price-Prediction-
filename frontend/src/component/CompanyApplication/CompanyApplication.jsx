import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import './CompanyApplication.css';

const CompanyApplication = () => {
    const { companyId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    // Payment Form States
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [upiId, setUpiId] = useState('');
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '' });
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [buyMessage, setBuyMessage] = useState('');

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await fetch(`/companies/${companyId}`);
                const data = await res.json();
                if (data.success) {
                    setCompany(data.company);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, [companyId]);

    if (loading) return <div className="app-container"><h2>Loading Secure Checkout...</h2></div>;
    if (!company) return <div className="app-container"><h2>Company not found.</h2></div>;
    if (!user) return <div className="app-container"><h2>Please return to the Home page and log in to purchase this policy.</h2></div>;

    const handleCardChange = (e) => setCardData({ ...cardData, [e.target.name]: e.target.value });

    const confirmPurchase = async () => {
        if (!termsAccepted) {
            setBuyMessage("You must accept the terms and conditions explicitly.");
            return;
        }
        if (paymentMethod === 'UPI' && !upiId.includes('@')) {
            setBuyMessage("Please enter a valid UPI ID (e.g., name@bank).");
            return;
        }
        if (paymentMethod === 'Card' && cardData.number.length < 15) {
            setBuyMessage("Please enter a valid Card Number.");
            return;
        }

        try {
            const res = await fetch("/buy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    company_name: company.name, 
                    insurance_type: company.insurance_type,
                    price: company.base_charge,
                    payment_method: paymentMethod,
                    username: user.username 
                })
            });
            const data = await res.json();
            setBuyMessage(data.message);
            if (data.success) {
                setTimeout(() => navigate('/dashboard'), 3000);
            }
        } catch (err) {
            setBuyMessage("Failed to process transaction securely.");
        }
    };

    return (
        <div className="app-container">
            <div className="header-banner">
                <h1>{company.insurance_type} Policy Checkout</h1>
                <h2>{company.name}</h2>
                <p>Secured Policy Premium: <strong>${company.base_charge.toLocaleString()}</strong></p>
            </div>

            <div className="payment-container">
                <h3>Secure Payment Gateway</h3>
                <div className="amount-display">
                    <p>Total Due Today:</p>
                    <h3>${company.base_charge.toLocaleString()}</h3>
                </div>

                <div className="payment-selector">
                    <label className={paymentMethod === 'UPI' ? 'active-pm' : ''}>
                        <input type="radio" value="UPI" checked={paymentMethod === 'UPI'} onChange={(e) => setPaymentMethod(e.target.value)} />
                        UPI/BHIM
                    </label>
                    <label className={paymentMethod === 'Card' ? 'active-pm' : ''}>
                        <input type="radio" value="Card" checked={paymentMethod === 'Card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                        Credit/Debit Card
                    </label>
                </div>

                <div className="payment-fields">
                    {paymentMethod === 'UPI' && (
                        <div className="upi-field">
                            <label>Enter your UPI ID</label>
                            <input type="text" placeholder="example@okhdfcbank" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                        </div>
                    )}
                    {paymentMethod === 'Card' && (
                        <div className="card-fields">
                            <label>Card Number</label>
                            <input type="text" name="number" placeholder="XXXX-XXXX-XXXX-XXXX" value={cardData.number} onChange={handleCardChange} maxLength="19" />
                            <div className="card-row">
                                <div>
                                    <label>Expiry Date</label>
                                    <input type="text" name="expiry" placeholder="MM/YY" value={cardData.expiry} onChange={handleCardChange} maxLength="5" />
                                </div>
                                <div>
                                    <label>CVV</label>
                                    <input type="password" name="cvv" placeholder="123" value={cardData.cvv} onChange={handleCardChange} maxLength="3" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="terms-agreement">
                    <h4>{company.name} Legal Disclosures</h4>
                    <p className="legals">{company.terms}</p>
                    <label className="checkbox-label">
                        <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                        I have read the disclosures and verify my digital application is accurate.
                    </label>
                </div>

                <button className="submit-btn finalize-action-btn" onClick={confirmPurchase}>Confirm & Pay</button>
                {buyMessage && <p className="buy-status">{buyMessage}</p>}
            </div>
        </div>
    );
};

export default CompanyApplication;
