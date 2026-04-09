import { useState, useContext } from 'react'
import { AuthContext } from '../../AuthContext';
import './InputForm.css'

const InputForm = () => {
    const { user } = useContext(AuthContext);
    const [form, setForm] = useState({
        age: "", sex: "Male", bmi: "", children: "0", smoker: "No", region: "northeast"
    });
    const [prediction, setPrediction] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("UPI");
    const [buyMessage, setBuyMessage] = useState("");

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
        <div className="input-form-wrapper">
            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="age"><span className="icon" aria-hidden="true">👤</span> Age</label>
                    <input type="number" id="age" name="age" value={form.age} min="0" max="120" onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <label htmlFor="sex"><span className="icon" aria-hidden="true">⚧</span> Gender</label>
                    <select id="sex" name="sex" value={form.sex} onChange={handleChange} required>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div className="input-group">
                    <label htmlFor="bmi"><span className="icon" aria-hidden="true">📈</span> BMI</label>
                    <input type="number" id="bmi" name="bmi" value={form.bmi} step="0.1" min="5" max="50" onChange={handleChange} required />
                    <small className="helper-text">Body Mass Index</small>
                </div>
                <div className="input-group">
                    <label htmlFor="smoker"><span className="icon" aria-hidden="true">🚬</span> Smoker Status</label> 
                    <select id="smoker" name="smoker" value={form.smoker} onChange={handleChange} required>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </div>
                <div className="input-group">
                    <label htmlFor="children"><span className="icon" aria-hidden="true">👶</span> Children (1-4)</label>
                    <input type="number" id="children" name="children" value={form.children} min="0" max="4" onChange={handleChange} required />
                </div>
                <div className="input-group">
                    <label htmlFor="region"><span className="icon" aria-hidden="true">📍</span> Region</label>
                    <select id="region" name="region" value={form.region} onChange={handleChange} required>
                        <option value="northeast">Northeast</option>
                        <option value="northwest">Northwest</option>
                        <option value="southeast">Southeast</option>
                        <option value="southwest">Southwest</option>
                    </select>
                </div>
                <button type="submit" className="submit-btn" >Get Prediction</button>
            </form>

            {prediction && (
                <div className="prediction-box">
                    <h3>Predicted Cost: {prediction}</h3>
                    
                    {recommendation && (
                        <div className="recommendation-box">
                            <h4>Special Recommendation For You 🎉</h4>
                            <p><strong>Company:</strong> {recommendation.name}</p>
                            <p><strong>Rating:</strong> ⭐ {recommendation.rating}</p>
                            <p><strong>Estimated Quote:</strong> ${recommendation.base_charge}</p>
                            <p className="desc">{recommendation.description}</p>
                            
                            <hr />
                            <h5>Terms and Conditions</h5>
                            <p className="terms">{recommendation.terms}</p>
                            
                            <div className="buy-section">
                                <div style={{ marginBottom: "10px" }}>
                                    <label><strong>Select Payment Method: </strong></label>
                                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ padding: "5px" }}>
                                        <option value="UPI">UPI / BHIM</option>
                                        <option value="Card">Credit/Debit Card</option>
                                        <option value="NetBanking">Net Banking</option>
                                    </select>
                                </div>
                                <label>
                                    <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                                    I agree to the terms and conditions
                                </label>
                                <br/>
                                <button className="submit-btn buy-btn" onClick={handleBuy}>Buy Insurance Plan</button>
                            </div>
                            {buyMessage && <p className="buy-message">{buyMessage}</p>}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default InputForm