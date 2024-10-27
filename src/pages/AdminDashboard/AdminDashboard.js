import React, { useState } from 'react';

const AdminDashboard = () => {
  const [borrowRecords, setBorrowRecords] = useState([]);

  const fetchBorrowRecords = async () => {
    try {
      const response = await fetch('/api/pullAPI'); // Call your updated API route
      if (!response.ok) {
        throw new Error('Failed to fetch borrow records');
      }
      const data = await response.json();
      console.log('Fetched data:', data); // Log fetched data for debugging
      setBorrowRecords(data);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={fetchBorrowRecords}>Fetch Borrow Records</button>
      <ul>
        {borrowRecords.length > 0 ? (
          borrowRecords.map((record) => (
            <li key={record.BorrowRecordID}> {/* Use BorrowRecordID as a unique key */}
              <h2>Borrow Record</h2>
              <p><strong>Borrow Record ID:</strong> {record.BorrowRecordID || 'N/A'}</p>
              <p><strong>User ID:</strong> {record.UserID || 'N/A'}</p>
              <p><strong>Book ISBN:</strong> {record.BookISBN || 'N/A'}</p>
              <p><strong>Device ID:</strong> {record.DeviceID || 'N/A'}</p>
              <p><strong>Magazine ID:</strong> {record.MagID || 'N/A'}</p>
              <p><strong>Media ID:</strong> {record.MediaID || 'N/A'}</p>
              <p><strong>Borrow Date:</strong> {record.BorrowDate ? new Date(record.BorrowDate).toLocaleString() : 'N/A'}</p>
              <p><strong>Due Date:</strong> {record.DueDate ? new Date(record.DueDate).toLocaleString() : 'N/A'}</p>
              <p><strong>Return Date:</strong> {record.ReturnDate ? new Date(record.ReturnDate).toLocaleString() : 'N/A'}</p>
              <p><strong>Fine Amount:</strong> {record.FineAmount !== null ? `$${parseFloat(record.FineAmount).toFixed(2)}` : 'N/A'}</p>
              <p><strong>Created At:</strong> {record.CreatedAt ? new Date(record.CreatedAt).toLocaleString() : 'N/A'}</p>
              <p><strong>Created By:</strong> {record.CreatedBy || 'N/A'}</p>
              <p><strong>Last Updated:</strong> {record.LastUpdated ? new Date(record.LastUpdated).toLocaleString() : 'N/A'}</p>
              <p><strong>Updated By:</strong> {record.UpdatedBy || 'N/A'}</p>
            </li>
          ))
        ) : (
          <li>No borrow records found.</li>
        )}
      </ul>
    </div>
  );
};

export default AdminDashboard;