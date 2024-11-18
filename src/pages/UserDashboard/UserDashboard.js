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
  const [viewBorrowedItems, setViewBorrowedItems] = useState(false); // false, 'active', or 'history'
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [borrowLimit, setBorrowLimit] = useState(null);
  const [activeBorrowCount, setActiveBorrowCount] = useState(0);

  // New state for payment popup and messages
  const [paymentPopup, setPaymentPopup] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentInfo, setPaymentInfo] = useState({ cardNumber: '', expiryDate: '', cvv: '' });
  const [paymentErrors, setPaymentErrors] = useState({});
  const [popupMessage, setPopupMessage] = useState('');
  const [showPopupMessage, setShowPopupMessage] = useState(false);

  // Fetch user information
  const fetchUserInfo = async () => {
    if (!userID) {
      // User is not logged in, redirect to login page
      navigate('/login');
      return;
    }

    try {
      console.log('Fetching user info with userID:', userID);
      const response = await fetch('/api/getUserInfo', {
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
        setPopupMessage(data.message || 'Failed to fetch user info');
        setShowPopupMessage(true);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setPopupMessage('An error occurred while fetching user info');
      setShowPopupMessage(true);
    }
  };

  useEffect(() => {
    if (userID) {
      fetchUserInfo();
    }
  }, [userID, navigate]);

  // Fetch available items based on the current item type
  const fetchItems = async (table) => {
    try {
      const response = await fetch(`/api/pullAPI?table=${table}&available=true`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${table} data`);
      }
      const data = await response.json();
      setItemsData(data);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  useEffect(() => {
    if (userID && !viewBorrowedItems) {
      fetchItems(currentItemType);
    }
  }, [currentItemType, userID, viewBorrowedItems]);

  // Handle item type change
  const handleItemTypeChange = (itemType) => {
    setCurrentItemType(itemType);
    setViewBorrowedItems(false);
    setPopupMessage('');
    setShowPopupMessage(false);
  };

  // Borrow an item
  const borrowItem = async (item) => {
    if (suspended) {
      setPopupMessage('Your account is suspended. Please resolve outstanding fines to borrow items.');
      setShowPopupMessage(true);
      return;
    }

    if (borrowLimit !== null && activeBorrowCount >= borrowLimit) {
      setPopupMessage(`You have reached your borrow limit of ${borrowLimit} items.`);
      setShowPopupMessage(true);
      return;
    }

    const confirmBorrow = window.confirm(`Do you want to borrow "${item.Title || item.Name || 'this item'}"?`);
    if (!confirmBorrow) {
      return;
    }

    try {
      const borrowData = {
        userID: userID,
      };

      if (currentItemType === 'ItemBook') {
        borrowData.bookISBN = item['ISBN'];
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
        setPopupMessage('Item borrowed successfully!');
        setShowPopupMessage(true);
        setActiveBorrowCount((prevCount) => prevCount + 1);
        fetchItems(currentItemType);
        fetchBorrowedItems(viewBorrowedItems);
        fetchUserInfo();
      } else {
        setPopupMessage(result.message || 'Failed to borrow item');
        setShowPopupMessage(true);
      }
    } catch (error) {
      console.error('Error borrowing item:', error);
      setPopupMessage('An error occurred while borrowing the item');
      setShowPopupMessage(true);
    }
  };

  // Return an item
  const returnItem = async (borrowRecordID) => {
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
        setPopupMessage('Item returned successfully!');
        setShowPopupMessage(true);
        setActiveBorrowCount((prevCount) => Math.max(prevCount - 1, 0));
        fetchBorrowedItems(viewBorrowedItems);
        fetchUserInfo();
      } else {
        setPopupMessage(result.message || 'Failed to return item');
        setShowPopupMessage(true);
      }
    } catch (error) {
      console.error('Error returning item:', error);
      setPopupMessage('An error occurred while returning the item');
      setShowPopupMessage(true);
    }
  };

  // View active borrowed items
  const handleViewBorrowedItems = () => {
    setViewBorrowedItems('active');
    setPopupMessage('');
    setShowPopupMessage(false);
    fetchBorrowedItems('Active');
  };

  // View borrow history
  const handleViewBorrowHistory = () => {
    setViewBorrowedItems('history');
    setPopupMessage('');
    setShowPopupMessage(false);
    fetchBorrowedItems('history');
  };

  // Fetch borrowed items based on status
  const fetchBorrowedItems = async (status = 'active') => {
    try {
      let url = `/api/getBorrowedItems?userID=${encodeURIComponent(userID)}`;
      if (status === 'Active') {
        url += '&status=Active';
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-user-id': userID, // Include if the API expects it in headers
        },
      });
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

  const displayedBorrowedItems = viewBorrowedItems === 'active'
    ? borrowedItems.filter((item) => item.Status === 'Active')
    : borrowedItems;

  // Updated handlePayment function
  const handlePayment = async () => {
    const errors = {};

    // Validate payment amount
    if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
      errors.paymentAmount = 'Please enter a valid payment amount.';
    }

    // Validate card number (16 digits)
    const cardNumberRegex = /^\d{16}$/;
    if (!cardNumberRegex.test(paymentInfo.cardNumber)) {
      errors.cardNumber = 'Please enter a valid 16-digit card number.';
    }

    // Validate expiry date (MM/YY format)
    const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryDateRegex.test(paymentInfo.expiryDate)) {
      errors.expiryDate = 'Please enter a valid expiry date in MM/YY format.';
    }

    // Validate CVV (3 or 4 digits)
    const cvvRegex = /^\d{3,4}$/;
    if (!cvvRegex.test(paymentInfo.cvv)) {
      errors.cvv = 'Please enter a valid 3 or 4-digit CVV.';
    }

    setPaymentErrors(errors);

    // If there are errors, do not proceed
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Ensure userID is available
    if (!userID) {
      setPopupMessage('User is not authenticated.');
      setShowPopupMessage(true);
      return;
    }

    try {
      console.log('Submitting payment with the following details:', {
        userID,
        paymentAmount: parseFloat(paymentAmount),
        paymentInfo,
      });

      // Pass userID as a query parameter to match the API's expectation
      const response = await fetch(`/api/reactivateAccount?userID=${encodeURIComponent(userID)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'x-user-id': userID, // Removed to prevent conflicts
        },
        body: JSON.stringify({
          paymentAmount: parseFloat(paymentAmount),
          // paymentInfo, // Uncomment if backend requires payment info
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPopupMessage('Payment successful! Your fines have been updated.');
        setShowPopupMessage(true);
        setPaymentPopup(false);
        setPaymentAmount('');
        setPaymentInfo({ cardNumber: '', expiryDate: '', cvv: '' });
        setPaymentErrors({});
        fetchUserInfo(); // Fetch updated balance and suspension status
      } else {
        setPopupMessage(data.message || 'Payment failed. Please try again.');
        setShowPopupMessage(true);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setPopupMessage('An error occurred while processing your payment.');
      setShowPopupMessage(true);
    }
  };

  // Handle click outside the payment popup to close it
  const handlePopupClick = (e) => {
    if (e.target.className === 'payment-popup') {
      setPaymentPopup(false);
      setPaymentErrors({});
    }
  };

  // Close the message popup
  const closeMessagePopup = () => {
    setShowPopupMessage(false);
    setPopupMessage('');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1>User Dashboard</h1>

        <div className="balance-container">
          {balance !== null ? (
            <p>Fines: ${parseFloat(balance).toFixed(2)}</p>
          ) : (
            <p>Loading balance...</p>
          )}
        </div>

        {/* Pay Fine Button */}
        {balance > 0 && !suspended && (
          <div className="action-button-container">
            <button className="pay-fine-button" onClick={() => setPaymentPopup(true)}>
              Pay Fine
            </button>
          </div>
        )}

        {/* Suspended Status and Reactivate Account Button */}
        {suspended && (
          <div className="suspended-status">
            <p className="suspended-text">Your account is <strong>Suspended</strong>.</p>
            <button className="reactivate-button" onClick={() => setPaymentPopup(true)}>
              Reactivate Account
            </button>
          </div>
        )}

        {/* Display payment popup */}
        {paymentPopup && (
          <div className="payment-popup" onClick={handlePopupClick}>
            <div className="popup-content">
              <h2>{suspended ? 'Reactivate Account' : 'Make a Payment'}</h2>
              <label>
                Card Number:
                <input
                  type="text"
                  value={paymentInfo.cardNumber}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })}
                  placeholder="Enter 16-digit card number"
                  maxLength="16"
                />
                {paymentErrors.cardNumber && <span className="error">{paymentErrors.cardNumber}</span>}
              </label>
              <label>
                Expiry Date (MM/YY):
                <input
                  type="text"
                  value={paymentInfo.expiryDate}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, expiryDate: e.target.value })}
                  placeholder="MM/YY"
                  maxLength="5"
                />
                {paymentErrors.expiryDate && <span className="error">{paymentErrors.expiryDate}</span>}
              </label>
              <label>
                CVV:
                <input
                  type="password" // Changed to password for security
                  value={paymentInfo.cvv}
                  onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value })}
                  placeholder="3 or 4-digit CVV"
                  maxLength="4"
                />
                {paymentErrors.cvv && <span className="error">{paymentErrors.cvv}</span>}
              </label>
              <label>
                Payment Amount:
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0.01"
                  step="0.01"
                />
                {paymentErrors.paymentAmount && <span className="error">{paymentErrors.paymentAmount}</span>}
              </label>
              <div className="popup-buttons">
                <button onClick={handlePayment}>Submit Payment</button>
                <button onClick={() => setPaymentPopup(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Display success/error message popup */}
        {showPopupMessage && (
          <div className="message-popup">
            <div className="message-content">
              <p>{popupMessage}</p>
              <button onClick={closeMessagePopup}>Close</button>
            </div>
          </div>
        )}

        {borrowLimit !== null && (
          <div className="borrow-limit-container">
            <p>Borrow Limit: {borrowLimit}</p>
            <p>Currently Borrowed: {activeBorrowCount}</p>
          </div>
        )}

        <div className="button-group">
          <button
            className={currentItemType === 'ItemBook' ? 'active' : ''}
            onClick={() => handleItemTypeChange('ItemBook')}
            disabled={suspended || (borrowLimit !== null && activeBorrowCount >= borrowLimit)}
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

        {viewBorrowedItems === 'active' || viewBorrowedItems === 'history' ? (
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
                      No {viewBorrowedItems === 'history' ? 'borrow history' : 'active borrowed items'} found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : itemsData.length > 0 ? (
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
                        disabled={suspended || (borrowLimit !== null && activeBorrowCount >= borrowLimit)}
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