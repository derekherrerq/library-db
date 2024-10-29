import React, { useState } from 'react';

const UserDashboard = () => {
  const [itemID, setItemID] = useState('');
  const [userID, setUserID] = useState('');
  const [bookISBN, setBookISBN] = useState('');
  const [deviceID, setDeviceID] = useState('');
  const [magID, setMagID] = useState('');
  const [mediaID, setMediaID] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch('http://localhost:3000/api/hold', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemID,
        userID,
        bookISBN,
        deviceID,
        magID,
        mediaID,
      }),
    });

    if (response.ok) {
      setMessage('Request submitted successfully!');
    } else {
      setMessage('Failed to submit request. Please try again.');
    }

    // Clear the form fields
    setItemID('');
    setUserID('');
    setBookISBN('');
    setDeviceID('');
    setMagID('');
    setMediaID('');
  };

  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Welcome, Normal User!</p>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Item ID:
            <input
              type="text"
              value={itemID}
              onChange={(e) => setItemID(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            User ID:
            <input
              type="text"
              value={userID}
              onChange={(e) => setUserID(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Book ISBN:
            <input
              type="text"
              value={bookISBN}
              onChange={(e) => setBookISBN(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Device ID:
            <input
              type="text"
              value={deviceID}
              onChange={(e) => setDeviceID(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Magazine ID:
            <input
              type="text"
              value={magID}
              onChange={(e) => setMagID(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Media ID:
            <input
              type="text"
              value={mediaID}
              onChange={(e) => setMediaID(e.target.value)}
            />
          </label>
        </div>
        <button type="submit">Request/Hold Item</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
};

export default UserDashboard;
