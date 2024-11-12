import React, { useState, useEffect, useContext } from 'react';
import './UserDashboard.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../components/Authentication/AuthContext'; // Adjust the path as needed

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
  const { userID } = useContext(AuthContext); // Get userID from AuthContext
  const navigate = useNavigate();

  const [itemsData, setItemsData] = useState([]);
  const [currentItemType, setCurrentItemType] = useState('ItemBook');
  const [balance, setBalance] = useState(null);
  const [suspended, setSuspended] = useState(false); // New state for suspension
  const [message, setMessage] = useState('');
  const [viewBorrowedItems, setViewBorrowedItems] = useState(false); // false, 'active', or 'history'
  const [borrowedItems, setBorrowedItems] = useState([]);

  // New state variables for borrow limit and active borrow count
  const [borrowLimit, setBorrowLimit] = useState(null);
  const [activeBorrowCount, setActiveBorrowCount] = useState(0);

  // Define fetchBalance and fetchUserInfo at the component level so they can be accessed by other functions
  const fetchUserInfo = async () => {
    if (!userID) {
      // User is not logged in, redirect to login page
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('/api/getUserInfo', { // Merged API endpoint
        method: 'GET',
        headers: {
          'x-user-id': userID, // Send userID in custom header
        },
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Fetched user info:', data);
        setBalance(data.balance);
        setSuspended(data.suspended);
        setBorrowLimit(data.borrowLimit);
        setActiveBorrowCount(data.activeBorrowCount);
      } else {
        setMessage(data.message || 'Failed to fetch user info');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setMessage('An error occurred while fetching user info');
    }
  };

  // Fetch the user's info when the component mounts or when userID changes
  useEffect(() => {
    if (userID) {
      fetchUserInfo();
    }
  }, [userID, navigate]);

  // Function to fetch available items based on the current item type
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

  // Fetch items when the currentItemType changes
  useEffect(() => {
    if (userID && !viewBorrowedItems) { // Ensure userID is available and not viewing borrowed items
      fetchItems(currentItemType);
    }
  }, [currentItemType, userID, viewBorrowedItems]);

  // Handle changing the item type (Books, Devices, etc.)
  const handleItemTypeChange = (itemType) => {
    setCurrentItemType(itemType);
    setViewBorrowedItems(false);
    setMessage('');
  };

  // Function to borrow an item
  const borrowItem = async (item) => {
    if (suspended) {
      setMessage('Your account is suspended. Please resolve outstanding fines to borrow items.');
      return;
    }

    // Check if user has reached their borrow limit
    if (borrowLimit !== null && activeBorrowCount >= borrowLimit) {
      setMessage(`You have reached your borrow limit of ${borrowLimit} items.`);
      return;
    }

    // Confirmation dialog
    const confirmBorrow = window.confirm(`Do you want to borrow "${item.Title || item.Name || 'this item'}"?`);
    if (!confirmBorrow) {
      return;
    }

    try {
      const borrowData = {
        userID: userID,
      };

      // Determine the correct item ID key based on the current item type
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

      const result = await response.json();

      if (response.ok) {
        console.log('Borrowed item successfully:', result);
        setMessage('Item borrowed successfully!');
        // Update active borrow count
        setActiveBorrowCount(prevCount => prevCount + 1);
        // Refresh items and balance after borrowing
        fetchItems(currentItemType);
        fetchBorrowedItems(viewBorrowedItems);
        fetchUserInfo(); // Refresh user info to ensure consistency
      } else {
        // Handle specific error messages from the backend
        if (result.message.includes('borrow limit')) {
          setMessage(result.message);
        } else {
          setMessage(result.message || 'Failed to borrow item');
        }
      }
    } catch (error) {
      console.error('Error borrowing item:', error);
      setMessage('An error occurred while borrowing the item');
    }
  };

  // Function to return an item
  const returnItem = async (borrowRecordID) => {
    // Confirmation dialog
    const confirmReturn = window.confirm('Are you sure you want to return this item?');
    if (!confirmReturn) {
      return;
    }

    try {
      const returnData = {
        BorrowRecordID: borrowRecordID,
      };

      const response = await fetch('/api/returnItem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(returnData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Returned item successfully:', result);
        setMessage('Item returned successfully!');
        // Update active borrow count
        setActiveBorrowCount(prevCount => Math.max(prevCount - 1, 0));
        // Refresh borrowed items and balance after returning
        fetchBorrowedItems(viewBorrowedItems);
        fetchUserInfo(); // Refresh user info to ensure consistency
      } else {
        // Handle specific error messages from the backend
        setMessage(result.message || 'Failed to return item');
      }
    } catch (error) {
      console.error('Error returning item:', error);
      setMessage('An error occurred while returning the item');
    }
  };

  // Function to view borrowed items
  const handleViewBorrowedItems = () => {
    setViewBorrowedItems('active');
    setMessage('');
    fetchBorrowedItems('Active'); // Updated to 'Active'
  };

  // Function to view borrow history
  const handleViewBorrowHistory = () => {
    setViewBorrowedItems('history');
    setMessage('');
    fetchBorrowedItems('history'); // Pass 'history' to fetch all records
  };

  // Function to fetch borrowed items for the user
  const fetchBorrowedItems = async (status = 'active') => {
    try {
      let url = `/api/getBorrowedItems?userID=${userID}`;
      if (status === 'Active') { // Updated to 'Active'
        url += '&status=Active';
      }
      // If status is 'history', fetch all borrowed items regardless of status
      const response = await fetch(url);
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

  // Define a filtered list based on the current view
  const displayedBorrowedItems = viewBorrowedItems === 'active'
    ? borrowedItems.filter(item => item.Status === 'Active')
    : borrowedItems;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1>User Dashboard</h1>

        {/* Display the user's balance */}
        <div className="balance-container">
          {balance !== null ? (
            <p>Fines: ${balance.toFixed(2)}</p>
          ) : (
            <p>Loading balance...</p>
          )}
        </div>

        {/* Display suspension status if suspended */}
        {suspended && (
          <div className="suspended-status">
            <p className="suspended-text">Your account is <strong>Suspended</strong>.</p>
          </div>
        )}

        {/* Display borrow limit and active borrow count */}
        {borrowLimit !== null && (
          <div className="borrow-limit-container">
            <p>Borrow Limit: {borrowLimit}</p>
            <p>Currently Borrowed: {activeBorrowCount}</p>
          </div>
        )}

        {/* Display any messages */}
        {message && <p className="message">{message}</p>}

        {/* Buttons to select the item type and view borrowed items/history */}
        <div className="button-group">
          <button
            className={currentItemType === 'ItemBook' ? 'active' : ''}
            onClick={() => handleItemTypeChange('ItemBook')}
            disabled={suspended || (borrowLimit !== null && activeBorrowCount >= borrowLimit)} // Disable if suspended or limit reached
            title={
              suspended
                ? 'Cannot borrow while suspended'
                : (borrowLimit !== null && activeBorrowCount >= borrowLimit
                  ? 'Borrow limit reached'
                  : 'Borrow Books')
            }
          >
            Books
          </button>
          <button
            className={currentItemType === 'ItemDevices' ? 'active' : ''}
            onClick={() => handleItemTypeChange('ItemDevices')}
            disabled={suspended || (borrowLimit !== null && activeBorrowCount >= borrowLimit)}
            title={
              suspended
                ? 'Cannot borrow while suspended'
                : (borrowLimit !== null && activeBorrowCount >= borrowLimit
                  ? 'Borrow limit reached'
                  : 'Borrow Devices')
            }
          >
            Devices
          </button>
          <button
            className={currentItemType === 'ItemMagazine' ? 'active' : ''}
            onClick={() => handleItemTypeChange('ItemMagazine')}
            disabled={suspended || (borrowLimit !== null && activeBorrowCount >= borrowLimit)}
            title={
              suspended
                ? 'Cannot borrow while suspended'
                : (borrowLimit !== null && activeBorrowCount >= borrowLimit
                  ? 'Borrow limit reached'
                  : 'Borrow Magazines')
            }
          >
            Magazines
          </button>
          <button
            className={currentItemType === 'ItemMedia' ? 'active' : ''}
            onClick={() => handleItemTypeChange('ItemMedia')}
            disabled={suspended || (borrowLimit !== null && activeBorrowCount >= borrowLimit)}
            title={
              suspended
                ? 'Cannot borrow while suspended'
                : (borrowLimit !== null && activeBorrowCount >= borrowLimit
                  ? 'Borrow limit reached'
                  : 'Borrow Media')
            }
          >
            Media
          </button>
          {/* New buttons for borrowed items and history */}
          <button
            className={viewBorrowedItems === 'active' ? 'active' : ''}
            onClick={handleViewBorrowedItems}
          >
            My Borrowed Items
          </button>
          <button
            className={viewBorrowedItems === 'history' ? 'active' : ''}
            onClick={handleViewBorrowHistory}
          >
            Borrow History
          </button>
        </div>

        {/* Inform the user if they are suspended and attempting to borrow */}
        {suspended && (
          <div className="suspension-warning">
            <p>Please settle your outstanding fines to reactivate your account.</p>
          </div>
        )}

        {viewBorrowedItems === 'active' || viewBorrowedItems === 'history' ? (
          // Render borrowed items or borrow history
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
                  {viewBorrowedItems === 'history' && <th>Status</th>}
                  {viewBorrowedItems === 'active' && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {displayedBorrowedItems.length > 0 ? (
                  displayedBorrowedItems.map((record) => (
                    <tr key={record.BorrowRecordID}>
                      <td>{record.BorrowRecordID}</td>
                      <td>{record.ItemType}</td>
                      <td>{record.ItemID}</td>
                      <td>{new Date(record.BorrowDate).toLocaleDateString()}</td>
                      <td>{new Date(record.DueDate).toLocaleDateString()}</td>
                      <td>
                        {record.ReturnDate ? new Date(record.ReturnDate).toLocaleDateString() : 'Not Returned'}
                      </td>
                      <td>${parseFloat(record.FineAmount).toFixed(2)}</td>
                      {viewBorrowedItems === 'history' && (
                        <td>{record.Status === 'Active' ? 'Active' : 'Returned'}</td>
                      )}
                      {viewBorrowedItems === 'active' && (
                        <td>
                          <button onClick={() => returnItem(record.BorrowRecordID)}>Return</button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={viewBorrowedItems === 'history' ? '8' : '7'}>
                      No {viewBorrowedItems === 'history' ? 'borrow history' : 'active borrowed'} found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : itemsData.length > 0 ? (
          // Render available items and borrow button
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
                      <button
                        onClick={() => borrowItem(item)}
                        disabled={suspended || (borrowLimit !== null && activeBorrowCount >= borrowLimit)} // Disable if suspended or limit reached
                        title={
                          suspended
                            ? 'Cannot borrow while suspended'
                            : (borrowLimit !== null && activeBorrowCount >= borrowLimit
                              ? 'Borrow limit reached'
                              : 'Borrow this item')
                        }
                      >
                        Borrow
                      </button>
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