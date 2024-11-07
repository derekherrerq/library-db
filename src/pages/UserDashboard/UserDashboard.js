import React, { useState, useEffect } from 'react';
import './UserDashboard.css';
import { useNavigate } from 'react-router-dom';

const itemFields = {
  ItemBook: [
    { label: 'Book ID', key: 'BookID' },
    { label: 'ISBN', key: 'ISBN' },
    { label: 'Title', key: 'Title' },
    { label: 'Author', key: 'Author' },
    { label: 'Genre', key: 'Genre' },
    { label: 'Published Date', key: 'PublishedDate', isDate: true },
    { label: 'Publisher', key: 'Publisher' },
  ],
  ItemDevices: [
    { label: 'Device ID', key: 'DeviceID' },
    { label: 'Title', key: 'Title' },
    { label: 'Brand', key: 'Brand' },
    { label: 'Model', key: 'Model' },
    { label: 'Warranty', key: 'Warranty', isDate: true },
    { label: 'Publisher', key: 'Publisher' },
  ],
  ItemMagazine: [
    { label: 'Magazine ID', key: 'MagazineID' },
    { label: 'ISSN', key: 'ISSN' },
    { label: 'Title', key: 'Title' },
    { label: 'Author', key: 'Author' },
    { label: 'Publish Date', key: 'PublishDate', isDate: true },
    { label: 'Publisher', key: 'Publisher' },
  ],
  ItemMedia: [
    { label: 'Media ID', key: 'MediaID' },
    { label: 'Title', key: 'Title' },
    { label: 'Media Type', key: 'MediaType' },
    { label: 'Duration', key: 'Duration', isDuration: true },
    { label: 'Director', key: 'Director' },
  ],
};

const UserDashboard = () => {
  const [itemsData, setItemsData] = useState([]);
  const [currentItemType, setCurrentItemType] = useState('ItemBook');
  const [currentUserID, setCurrentUserID] = useState('U001'); // Replace with actual user ID
  const [balance, setBalance] = useState(null);
  const [message, setMessage] = useState('');
  const [viewBorrowedItems, setViewBorrowedItems] = useState(false);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const navigate = useNavigate();

  // Define fetchBalance at the component level
  const fetchBalance = async () => {
    if (!currentUserID) {
      // User is not logged in, redirect to login page
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('/api/getBalance', {
        method: 'GET',
        headers: {
          'x-user-id': currentUserID, // Send userID in custom header
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

  // Fetch the user's balance when the component mounts
  useEffect(() => {
    fetchBalance();
  }, [currentUserID, navigate]);

  const fetchItems = async (table) => {
    try {
      const response = await fetch(`/api/pullAPI?table=${table}&available=true`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${table} data`);
      }
      const data = await response.json();
      console.log(`Fetched ${table} data:`, data);
      setItemsData(data);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchItems(currentItemType);
  }, [currentItemType]);

  const handleItemTypeChange = (itemType) => {
    setCurrentItemType(itemType);
    setViewBorrowedItems(false);
    fetchItems(itemType);
  };

  const borrowItem = async (item) => {
    // Confirmation dialog
    const confirmBorrow = window.confirm(`Do you want to borrow ${item.Title || item.Name || 'this item'}?`);
    if (!confirmBorrow) {
      return;
    }

    try {
      const borrowData = {
        userID: currentUserID,
      };

      // Determine the correct item ID key
      if (currentItemType === 'ItemBook') {
        borrowData.bookISBN = item['ISBN']; // Use ISBN instead of BookID
      } else if (currentItemType === 'ItemDevices') {
        borrowData.deviceID = item['DeviceID'];
      } else if (currentItemType === 'ItemMagazine') {
        borrowData.magID = item['MagazineID'];
      } else if (currentItemType === 'ItemMedia') {
        borrowData.mediaID = item['MediaID'];
      }

      const response = await fetch('/api/borrowItem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(borrowData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to borrow item');
      }

      const result = await response.json();
      console.log('Borrowed item successfully:', result);
      setMessage('Item borrowed successfully!');
      fetchItems(currentItemType); // Refresh items data after borrowing
      fetchBorrowedItems(); // Refresh borrowed items
      fetchBalance(); // Refresh balance if needed
    } catch (error) {
      console.error('Error borrowing item:', error);
      setMessage(error.message);
    }
  };

  const handleViewBorrowedItems = () => {
    setViewBorrowedItems(true);
    fetchBorrowedItems();
  };

  const fetchBorrowedItems = async () => {
    try {
      const response = await fetch(`/api/getBorrowedItems?userID=${currentUserID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch borrowed items');
      }
      const data = await response.json();
      setBorrowedItems(data);
    } catch (error) {
      console.error('Error fetching borrowed items:', error);
      alert(error.message);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1>User Dashboard</h1>

        {/* Display the user's balance */}
        <div className="balance-container">
          {balance !== null ? (
            <p>Your Balance: ${balance.toFixed(2)}</p>
          ) : (
            <p>Loading balance...</p>
          )}
        </div>

        {/* Display any messages */}
        {message && <p className="message">{message}</p>}

        {/* Buttons to select the item type */}
        <div className="button-group">
          <button onClick={() => handleItemTypeChange('ItemBook')}>Books</button>
          <button onClick={() => handleItemTypeChange('ItemDevices')}>Devices</button>
          <button onClick={() => handleItemTypeChange('ItemMagazine')}>Magazines</button>
          <button onClick={() => handleItemTypeChange('ItemMedia')}>Media</button>
          <button onClick={handleViewBorrowedItems}>My Borrowed Items</button>
        </div>

        {viewBorrowedItems ? (
          // Render the borrowed items
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Borrow Record ID</th>
                  <th>Item Type</th>
                  <th>Item ID</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Return Date</th>
                  <th>Fine Amount</th>
                </tr>
              </thead>
              <tbody>
                {borrowedItems.map((record) => (
                  <tr key={record.BorrowRecordID}>
                    <td>{record.BorrowRecordID}</td>
                    <td>{record.ItemType}</td>
                    <td>{record.ItemID}</td>
                    <td>{new Date(record.BorrowDate).toLocaleDateString()}</td>
                    <td>{new Date(record.DueDate).toLocaleDateString()}</td>
                    <td>{record.ReturnDate ? new Date(record.ReturnDate).toLocaleDateString() : 'Not Returned'}</td>
                    <td>${parseFloat(record.FineAmount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : itemsData.length > 0 ? (
          // Existing code to render available items and borrow button
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {itemFields[currentItemType].map((field) => (
                    <th key={field.key}>{field.label}</th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {itemsData.map((item) => (
                  <tr key={item[itemFields[currentItemType][0].key]}>
                    {itemFields[currentItemType].map((field) => {
                      let value = item[field.key];

                      if (field.isDate && value) {
                        value = new Date(value).toLocaleDateString();
                      } else if (field.isDateTime && value) {
                        value = new Date(value).toLocaleString();
                      } else if (field.isCurrency && value !== null) {
                        value = `$${parseFloat(value).toFixed(2)}`;
                      } else if (field.isDuration && value !== null) {
                        value = `${value} minutes`;
                      } else {
                        value = value !== null && value !== undefined ? value : 'N/A';
                      }

                      return <td key={field.key}>{value}</td>;
                    })}
                    <td>
                      <button onClick={() => borrowItem(item)}>Borrow</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No available items found.</p>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;