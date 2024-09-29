// src/components/ManageCards.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManageCards = () => {
    const [paymentMethods, setPaymentMethods] = useState([]);
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
            } catch (err) {
                console.error('Error fetching payment methods:', err);
                setError('Có lỗi xảy ra khi tải phương thức thanh toán.');
            }
        };

        fetchPaymentMethods();
    }, [appUserId]);

    const handleRemove = async (paymentMethodId) => {
        try {
            const response = await axios.delete('/payment/remove-payment-method', {
                params: { paymentMethodId: paymentMethodId, appUserId: appUserId }
            });

            if (response.data.status === 'success') {
                setSuccess(response.data.message);
                setError('');
                // Cập nhật lại danh sách thẻ sau khi xóa
                setPaymentMethods(paymentMethods.filter(pm => pm.id !== paymentMethodId));
            } else {
                setError(response.data.message);
                setSuccess('');
            }
        } catch (err) {
            console.error('Error removing payment method:', err);
            setError('Có lỗi xảy ra khi xóa phương thức thanh toán.');
            setSuccess('');
        }
    };

    return (
        <div className="container">
            <h2>Manage Cards</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            {paymentMethods.length === 0 ? (
                <p>Không có phương thức thanh toán nào được lưu trữ.</p>
            ) : (
                <ul className="payment-method-list">
                    {paymentMethods.map(method => (
                        <li key={method.id} className="payment-method">
                            {`${method.card.brand.toUpperCase()} **** **** **** ${method.card.last4} (${method.card.exp_month}/${method.card.exp_year})`}
                            <button onClick={() => handleRemove(method.id)}>Remove</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ManageCards;
