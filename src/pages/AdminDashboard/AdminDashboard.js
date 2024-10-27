import React, { useState } from 'react';

const USER_LIMITS = {
  student: {
    limit: 5,
    duration: 7 
  },
  faculty: {
    limit: 10,
    duration: 14 
  }
};

const AdminDashboard = () => {
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState('student'); // Set a default role or get it from user context
  const [isRecordsVisible, setIsRecordsVisible] = useState(false); // New state for toggling records visibility
  const [borrowLimitMessage, setBorrowLimitMessage] = useState(''); // New state for borrow limit message

  const fetchBorrowRecords = async () => {
    try {
      const response = await fetch('/api/pullAPI'); 
      if (!response.ok) {
        throw new Error('Failed to fetch borrow records');
      }
      const data = await response.json();
      console.log('Fetched data:', data); // Log fetched data for debugging
      setBorrowRecords(data);
      setIsRecordsVisible(data.length > 0); // Show records if there's data
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const toggleRecordsVisibility = () => {
    setIsRecordsVisible(!isRecordsVisible); // Toggle the fetch records
  };

  const canBorrowMoreItems = (userID) => {
    const userRecords = borrowRecords.filter(record => record.UserID === userID);
    return userRecords.length < USER_LIMITS[currentUserRole].limit;
  };

  const getDueDate = () => {
    const durationDays = USER_LIMITS[currentUserRole].duration;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + durationDays);
    return dueDate.toISOString();
  };

  const borrowItem = async (itemID) => {
    if (!canBorrowMoreItems(itemID)) {
      alert(`Borrow limit reached for ${currentUserRole}.`);
      return;
    }

    const dueDate = getDueDate();
    const newRecord = {
      UserID: itemID, 
      DueDate: dueDate,
    };

    // Borrow Item API / WIP 
    try {
      const response = await fetch('/api/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });

      if (!response.ok) {
        throw new Error('Failed to borrow item');
      }

      const result = await response.json();
      console.log('Borrowed item successfully:', result);
      fetchBorrowRecords(); // Refresh borrow records after borrowing
    } catch (error) {
      console.error('Error borrowing item:', error);
      alert(error.message);
    }
  };

  const checkBorrowLimits = () => {
    const currentUserID = "replace_with_current_user_id"; // Replace with the actual user ID
    if (canBorrowMoreItems(currentUserID)) {
      setBorrowLimitMessage(`You can borrow more items. Limit: ${USER_LIMITS[currentUserRole].limit}`);
    } else {
      setBorrowLimitMessage(`You have reached your borrowing limit.`);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={fetchBorrowRecords}>Fetch Borrow Records</button>
      <button onClick={checkBorrowLimits}>Check Borrow Limits</button>
      {borrowRecords.length > 0 && (
        <button onClick={toggleRecordsVisibility}>
          {isRecordsVisible ? 'Hide Borrow Records' : 'Show Borrow Records'}
        </button>
      )}
      {isRecordsVisible && (
        <ul>
          {borrowRecords.map((record) => (
            <li key={record.BorrowRecordID}>
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
              <button onClick={() => borrowItem(record.UserID)}>Borrow Item</button>
            </li>
          ))}
        </ul>
      )}
      {!isRecordsVisible && borrowRecords.length > 0 && <p>Borrow records are hidden. Click "Show Borrow Records" to display them.</p>}
      <p>{borrowLimitMessage}</p> {/* Display borrow limit message */}
    </div>
  );
};

export default AdminDashboard;
