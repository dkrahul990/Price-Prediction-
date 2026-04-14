import { useState, useContext } from 'react'
import { AuthContext } from '../../AuthContext';
import './InputForm.css'

const InputForm = () => {
    const { user } = useContext(AuthContext);
    const [form, setForm] = useState({
        age: "", sex: "Male", height: "", weight: "", bmi: "", children: "0", smoker: "No", region: "northeast"
    });
    const [prediction, setPrediction] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [buyMessage, setBuyMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        let newForm = { ...form, [name]: value };

        if (name === "height" || name === "weight") {
            const h = name === "height" ? parseFloat(value) : parseFloat(form.height);
            const w = name === "weight" ? parseFloat(value) : parseFloat(form.weight);

            if (h > 0 && w > 0) {
                const bmiVal = (w / ((h / 100) ** 2)).toFixed(2);
                newForm.bmi = bmiVal;
            } else {
                newForm.bmi = "";
            }
        }
        setForm(newForm);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBuyMessage("");
        const payload = {
            ...form,
            sex: form.sex === "Female" ? 1 : 0,
            smoker: form.smoker === "Yes" ? 1 : 0,
        };

        try {
            const res = await fetch("/predict", {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (data.success) {
                setPrediction(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.prediction));
                setRecommendation(data.recommendation);
                setTermsAccepted(false);
            } else {
                setPrediction("Error: " + data.error);
            }
        } catch (error) {
            setPrediction("Error fetching prediction.");
        }
    };

    const handleBuy = async () => {
        if (!user) {
            setBuyMessage("Please log in to purchase an insurance policy.");
            return;
        }
        if (!termsAccepted) {
            setBuyMessage("You must accept the terms and conditions.");
            return;
        }
        try {
            const res = await fetch("/buy", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    company_name: recommendation.name, 
                    insurance_type: recommendation.insurance_type,
                    price: recommendation.base_charge,
                    payment_method: paymentMethod,
                    username: user.username 
                })
            });
            const data = await res.json();
            setBuyMessage(data.message);
        } catch (err) {
            setBuyMessage("Failed to process transaction.");
        }
    };

    return (
        <div className="input-form-page">
            <header className="page-header">
                <h1>Insurance <span className="highlight">Predictor</span></h1>
                <p>Calculate your health insurance premium with our AI-powered engine</p>
            </header>
            
            <div className={`main-layout ${prediction ? 'has-prediction' : ''}`}>
                <div className="card form-card">
                    <div className="card-header">
                        <h2>Personal Details</h2>
                        <span className="badge">Fill all fields</span>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="input-group">
                                <label htmlFor="age"><span className="icon" aria-hidden="true">👤</span> Age</label>
                                <input type="number" id="age" name="age" value={form.age} min="0" max="120" onChange={handleChange} required placeholder="Enter age" />
                            </div>
                            <div className="input-group">
                                <label htmlFor="sex"><span className="icon" aria-hidden="true">⚧</span> Gender</label>
                                <select id="sex" name="sex" value={form.sex} onChange={handleChange} required>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label htmlFor="height"><span className="icon" aria-hidden="true">📏</span> Height (cm)</label>
                                <input type="number" id="height" name="height" value={form.height} min="50" max="250" onChange={handleChange} required placeholder="cm" />
                            </div>
                            <div className="input-group">
                                <label htmlFor="weight"><span className="icon" aria-hidden="true">⚖️</span> Weight (kg)</label>
                                <input type="number" id="weight" name="weight" value={form.weight} min="10" max="300" onChange={handleChange} required placeholder="kg" />
                            </div>
                            <div className="input-group full-width">
                                <label htmlFor="bmi"><span className="icon" aria-hidden="true">📈</span> Calculated BMI</label>
                                <input type="number" id="bmi" name="bmi" value={form.bmi} step="0.1" readOnly className="bmi-display" />
                                <small className="helper-text">Auto-calculated Body Mass Index</small>
                            </div>
                            <div className="input-group">
                                <label htmlFor="smoker"><span className="icon" aria-hidden="true">🚬</span> Smoker</label> 
                                <select id="smoker" name="smoker" value={form.smoker} onChange={handleChange} required>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label htmlFor="children"><span className="icon" aria-hidden="true">👶</span> Children</label>
                                <input type="number" id="children" name="children" value={form.children} min="0" max="4" onChange={handleChange} required />
                            </div>
                            <div className="input-group full-width">
                                <label htmlFor="region"><span className="icon" aria-hidden="true">📍</span> Region</label>
                                <select id="region" name="region" value={form.region} onChange={handleChange} required>
                                    <option value="northeast">Northeast</option>
                                    <option value="northwest">Northwest</option>
                                    <option value="southeast">Southeast</option>
                                    <option value="southwest">Southwest</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="submit-btn" >Get AI Prediction</button>
                    </form>
                </div>

                <div className="result-container">
                    {prediction ? (
                        <div className="card prediction-card animate-slide-in">
                            <div className="card-header">
                                <h2>Prediction Result</h2>
                                <span className="badge success">Calculated</span>
                            </div>
                            <div className="prediction-value">
                                <span className="label">Estimated Annual Cost</span>
                                <h3 className="amount">{prediction}</h3>
                            </div>
                            
                            {recommendation && (
                                <div className="recommendation-content">
                                    <div className="rec-header">
                                        <h4>Top Recommendation 🎉</h4>
                                    </div>
                                    <div className="company-details">
                                        <div className="company-main">
                                            <p className="company-name">{recommendation.name}</p>
                                            <p className="rating">⭐ {recommendation.rating}</p>
                                        </div>
                                        <p className="price-tag">Quote: ${recommendation.base_charge}/yr</p>
                                        <p className="description">{recommendation.description}</p>
                                    </div>
                                    
                                    <div className="purchase-controls">
                                        <div className="control-group">
                                            <label>Payment Mode</label>
                                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                                <option value="UPI">UPI / BHIM</option>
                                                <option value="Card">Credit/Debit Card</option>
                                                <option value="NetBanking">Net Banking</option>
                                            </select>
                                        </div>
                                        <label className="terms-label">
                                            <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                                            <span>I agree to the <span className="link">terms and conditions</span></span>
                                        </label>
                                        <button className="submit-btn buy-btn" onClick={handleBuy}>Secure This Plan</button>
                                        {buyMessage && <p className={`status-msg ${buyMessage.includes("success") ? "success" : "error"}`}>{buyMessage}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card empty-card">
                            <div className="empty-state">
                                <div className="illustration-placeholder">💡</div>
                                <h3>Ready to estimate?</h3>
                                <p>Fill out the form on the left to see your personalized insurance prediction and expert recommendations.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default InputForm