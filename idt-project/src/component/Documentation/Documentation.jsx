import React from 'react';
import './Documentation.css';

const Documentation = () => {
    return (
        <div className="docs-container">
            <h1>Documentation</h1>
            <div className="doc-section">
                <h2>1. Navigating the Medical Insurance Price Predictor</h2>
                <p>Welcome to our state-of-the-art insurance app! This tool asks for some personal health metrics to generate automated pricing bounds tailored to your physical statistics utilizing a Gradient Boosting Machine Learning algorithm.</p>
            </div>
            <div className="doc-section">
                <h2>2. Buying an Insurance Policy</h2>
                <p>Upon receiving a predicted price, our internal recommendation system scans the marketplace for Medical or Life insurance providers that offer coverage perfectly suited around your price range.</p>
                <p>You can securely purchase these recommendations using UPI, NetBanking, or Cards. You will receive an instant invoice into your personalized 'Dashboard' area.</p>
            </div>
            <div className="doc-section">
                <h2>3. Admin Dashboard Capabilities</h2>
                <p>Verified Administrators have clearance to register enterprise agencies onto the platform. These agencies supply varying types of insurance cover (such as Life or Medical), and detail internal terms and conditions.</p>
            </div>
        </div>
    );
};
export default Documentation;
