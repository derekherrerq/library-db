import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../components/Authentication/AuthContext';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const { userID } = useContext(AuthContext);
  const navigate = useNavigate();

  const [itemID, setItemID] = useState('');
  const [bookISBN, setBookISBN] = useState('');
  const [deviceID, setDeviceID] = useState('');
  const [magID, setMagID] = useState('');
  const [mediaID, setMediaID] = useState('');
  const [message, setMessage] = useState('');
  const [balance, setBalance] = useState(null);

  // Fetch the user's balance when the component mounts
  useEffect(() => {
    const fetchBalance = async () => {
      if (!userID) {
        // User is not logged in, redirect to login page
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('/api/getBalance', {
          method: 'GET',
          headers: {
            'x-user-id': userID, // Send userID in custom header
          },
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Fetched balance:', data.balance, 'Type:', typeof data.balance);
          const numericBalance = parseFloat(data.balance);
          setBalance(numericBalance);
        } else {
          setMessage(data.message || 'Failed to fetch balance');
        }
      } catch (error) {
        console.error('Error fetching balance:', error);
        setMessage('An error occurred while fetching balance');
      }
    };

    fetchBalance();
  }, [userID, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userID) {
      setMessage('User not logged in');
      return;
    }

    const response = await fetch('/api/hold', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userID, // Send userID in custom header
      },
      body: JSON.stringify({
        itemID,
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
    setBookISBN('');
    setDeviceID('');
    setMagID('');
    setMediaID('');
  };

  return (
    <div>
      <h1>User Dashboard</h1>
      <p>Welcome, User ID: {userID}</p>

      {balance !== null && !isNaN(balance) && (
        <div>
          <p>Your Current Balance: ${balance.toFixed(2)}</p>
        </div>
      )}

      {message && <p>{message}</p>}

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
        {/* UserID input can be hidden or removed since it's fetched */}
        <input type="hidden" value={userID} />

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
    </div>
  );
}

export default UserDashboard;