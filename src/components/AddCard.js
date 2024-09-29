// src/components/AddCard.js
import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import axios from 'axios';

const AddCard = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        const cardElement = elements.getElement(CardElement);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            setError(error.message);
            setSuccess('');
        } else {
            try {
                // Gửi paymentMethod.id tới server để lưu trữ
                const response = await axios.post('/payment/add-payment-method', {
                    paymentMethodId: paymentMethod.id,
                });

                if (response.data.error) {
                    setError(response.data.error);
                    setSuccess('');
                } else {
                    setSuccess('Card added successfully!');
                    setError('');
                    // Làm sạch form hoặc thực hiện các hành động khác nếu cần
                }
            } catch (err) {
                setError('Có lỗi xảy ra khi thêm thẻ.');
                setSuccess('');
                console.error(err);
            }
        }
    };

    return (
        <div className="container">
            <h2>Add Card</h2>
            <form onSubmit={handleSubmit}>
                <div className="card-element">
                    <CardElement />
                </div>
                <button type="submit" disabled={!stripe}>Add Card</button>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
            </form>
        </div>
    );
};

export default AddCard;
