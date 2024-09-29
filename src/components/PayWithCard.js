// src/components/PayWithCard.js
import React, { useEffect, useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import axios from 'axios';

const PayWithCard = () => {
    const stripe = useStripe();
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Giả sử bạn có cách lấy appUserId từ session hoặc context
    const appUserId = 'app_user_12345'; // Thay bằng cách lấy thực tế

    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const response = await axios.get('/payment/get-payment-methods', {
                    params: { appUserId: appUserId }
                });
                setPaymentMethods(response.data);
                if (response.data.length > 0) {
                    setSelectedMethod(response.data[0].id);
                }
            } catch (err) {
                console.error('Error fetching payment methods:', err);
                setError('Có lỗi xảy ra khi tải phương thức thanh toán.');
            }
        };

        fetchPaymentMethods();
    }, [appUserId]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedMethod) {
            setError('Vui lòng chọn một phương thức thanh toán.');
            setSuccess('');
            return;
        }

        const amountInCents = parseInt(amount) * 100;

        if (isNaN(amountInCents) || amountInCents <= 0) {
            setError('Vui lòng nhập số tiền hợp lệ.');
            setSuccess('');
            return;
        }

        try {
            const response = await axios.post('/payment/create-payment-intent-for-existing-customer', {
                amount: amountInCents,
                paymentMethodId: selectedMethod,
                appUserId: appUserId
            });

            if (response.data.error) {
                throw new Error(response.data.error);
            }

            const clientSecret = response.data.clientSecret;

            if (!clientSecret) {
                throw new Error('Không nhận được client secret từ server.');
            }

            // Xác nhận thanh toán với PaymentMethod đã lưu
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: selectedMethod,
            });

            if (result.error) {
                setError(result.error.message);
                setSuccess('');
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    setSuccess('Thanh toán thành công!');
                    setError('');
                } else {
                    setError(`Thanh toán không thành công với trạng thái: ${result.paymentIntent.status}`);
                    setSuccess('');
                }
            }
        } catch (err) {
            console.error('Error during payment:', err);
            setError(err.message || 'Có lỗi xảy ra khi thực hiện thanh toán.');
            setSuccess('');
        }
    };

    return (
        <div className="container">
            <h2>Pay with Card</h2>
            <form onSubmit={handleSubmit}>
                <label htmlFor="payment-method-select">Chọn thẻ:</label>
                <select
                    id="payment-method-select"
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                >
                    {paymentMethods.length === 0 ? (
                        <option value="">Không có phương thức thanh toán nào được lưu trữ.</option>
                    ) : (
                        paymentMethods.map(method => (
                            <option key={method.id} value={method.id}>
                                {`${method.card.brand.toUpperCase()} **** **** **** ${method.card.last4} (${method.card.exp_month}/${method.card.exp_year})`}
                            </option>
                        ))
                    )}
                </select>

                <label htmlFor="amount">Nhập số tiền (USD):</label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Nhập số tiền"
                    required
                    min="1"
                />

                <button type="submit" disabled={!stripe || paymentMethods.length === 0}>Pay</button>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
            </form>
        </div>
    );
};

export default PayWithCard;
