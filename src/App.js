// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import AddCard from './components/AddCard';
import PayWithCard from './components/PayWithCard';
import ManageCards from './components/ManageCards';
import './styles.css';

// Khởi tạo Stripe với Publishable Key của bạn
const stripePromise = loadStripe('pk_test_51Q4DREKYDzfwQexmJTj49NymeJBPFDPULMYeAKFzUTzvzy8ip14rqrH7mSqQDuAUTZjSpZ0TA9BJBxbRBmWActWN00b1Kgrdd5');

function App() {
    return (
        <Elements stripe={stripePromise}>
            <Router>
                <nav>
                    <ul>
                        <li><Link to="/">Add Card</Link></li>
                        <li><Link to="/pay">Pay with Card</Link></li>
                        <li><Link to="/manage">Manage Cards</Link></li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/" element={<AddCard />} />
                    <Route path="/pay" element={<PayWithCard />} />
                    <Route path="/manage" element={<ManageCards />} />
                </Routes>
            </Router>
        </Elements>
    );
}

export default App;
