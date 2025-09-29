import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchUserAccounts, transferMoney, clearTransferMessages } from './userAccountsSlice';

const TransferForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, loading, error, transferLoading, transferError, transferSuccess } =
    useAppSelector((state) => state.userAccounts);

  const [fromUserId, setFromUserId] = useState<number | ''>('');
  const [toUserId, setToUserId] = useState<number | ''>('');
  const [amount, setAmount] = useState<string>('');

  useEffect(() => {
    dispatch(fetchUserAccounts());
  }, [dispatch]);

  useEffect(() => {
    if (transferSuccess || transferError) {
      const timer = setTimeout(() => {
        dispatch(clearTransferMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [transferSuccess, transferError, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromUserId || !toUserId || !amount) return;

    if (fromUserId === toUserId) {
      alert("Sender and receiver cannot be the same");
      return;
    }

    dispatch(transferMoney({ fromUserId, toUserId, amount }));
  };

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <h3>Money Transfer</h3>
      {loading && <p>Loading user accounts...</p>}
      {error && <div className="alert alert-danger">{error}</div>}
      {transferError && <div className="alert alert-danger">{transferError}</div>}
      {transferSuccess && <div className="alert alert-success">{transferSuccess}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">From User</label>
          <select
            className="form-select"
            value={fromUserId}
            onChange={(e) => setFromUserId(Number(e.target.value) || '')}
            disabled={transferLoading || loading}
          >
            <option value="">Select sender</option>
            {users.filter(user => toUserId ? user.id !== toUserId : true).map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.country} - {user.currency})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">To User</label>
          <select
            className="form-select"
            value={toUserId}
            onChange={(e) => setToUserId(Number(e.target.value) || '')}
            disabled={transferLoading || loading}
          >
            <option value="">Select receiver</option>
            {users.filter(user => fromUserId ? user.id !== fromUserId : true).map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.country} - {user.currency})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Amount</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            className="form-control"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={transferLoading || loading}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={transferLoading || loading}>
          {transferLoading ? "Processing..." : "Transfer"}
        </button>
      </form>
    </div>
  );
};

export default TransferForm;
