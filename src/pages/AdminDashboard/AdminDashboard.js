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

const itemFields = {
  BorrowRecord: [
    { label: 'Borrow Record ID', key: 'BorrowRecordID' },
    { label: 'User ID', key: 'UserID' },
    { label: 'Book ISBN', key: 'BookISBN' },
    { label: 'Device ID', key: 'DeviceID' },
    { label: 'Magazine ID', key: 'MagID' },
    { label: 'Media ID', key: 'MediaID' },
    { label: 'Borrow Date', key: 'BorrowDate', isDate: true },
    { label: 'Due Date', key: 'DueDate', isDate: true },
    { label: 'Return Date', key: 'ReturnDate', isDate: true },
    { label: 'Fine Amount', key: 'FineAmount', isCurrency: true },
    { label: 'Created At', key: 'CreatedAt', isDateTime: true },
    { label: 'Created By', key: 'CreatedBy' },
    { label: 'Last Updated', key: 'LastUpdated', isDateTime: true },
    { label: 'Updated By', key: 'UpdatedBy' },
  ],
  ItemBook: [
    { label: 'Book ID', key: 'BookID' },
    { label: 'ISBN', key: 'ISBN' },
    { label: 'Title', key: 'Title' },
    { label: 'Author', key: 'Author' },
    { label: 'Genre', key: 'Genre' },
    { label: 'Published Date', key: 'PublishedDate', isDate: true },
    { label: 'Publisher', key: 'Publisher' },
    { label: 'Cost', key: 'Cost', isCurrency: true },
    { label: 'Availability', key: 'Availability' },
  ],
  ItemDevices: [
    { label: 'Device ID', key: 'DeviceID' },
    { label: 'Title', key: 'Title' },
    { label: 'Brand', key: 'Brand' },
    { label: 'Model', key: 'Model' },
    { label: 'Warranty', key: 'Warranty', isDate: true },
    { label: 'Publisher', key: 'Publisher' },
    { label: 'Cost', key: 'Cost', isCurrency: true },
    { label: 'Availability', key: 'Availability' },
  ],
  ItemMagazine: [
    { label: 'Magazine ID', key: 'MagazineID' },
    { label: 'ISSN', key: 'ISSN' },
    { label: 'Title', key: 'Title' },
    { label: 'Author', key: 'Author' },
    { label: 'Publish Date', key: 'PublishDate', isDate: true },
    { label: 'Publisher', key: 'Publisher' },
    { label: 'Cost', key: 'Cost', isCurrency: true },
    { label: 'Availability', key: 'Availability' },
  ],
  ItemMedia: [
    { label: 'Media ID', key: 'MediaID' },
    { label: 'Title', key: 'Title' },
    { label: 'Media Type', key: 'MediaType' },
    { label: 'Duration', key: 'Duration', isDuration: true },
    { label: 'Director', key: 'Director' },
    { label: 'Cost', key: 'Cost', isCurrency: true },
    { label: 'Availability', key: 'Availability' },
  ],
};

const AdminDashboard = () => {
  const [itemsData, setItemsData] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState('student'); // Set a default role or get it from user context
  const [isRecordsVisible, setIsRecordsVisible] = useState(false);
  const [borrowLimitMessage, setBorrowLimitMessage] = useState('');
  const [currentItemType, setCurrentItemType] = useState('BorrowRecord');

  const fetchItems = async (table) => {
    try {
      const response = await fetch(`/api/pullAPI?table=${table}`); 
      if (!response.ok) {
        throw new Error(`Failed to fetch ${table} data`);
      }
      const data = await response.json();
      console.log(`Fetched ${table} data:`, data);
      setItemsData(data);
      setIsRecordsVisible(data.length > 0);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  const toggleRecordsVisibility = () => {
    setIsRecordsVisible(!isRecordsVisible);
  };

  const canBorrowMoreItems = (userID) => {
    const userRecords = itemsData.filter(record => record.UserID === userID);
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
      fetchItems(currentItemType); // Refresh items data after borrowing
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

  const handleItemTypeChange = (itemType) => {
    setCurrentItemType(itemType);
    fetchItems(itemType);
  };

  const renderItemDetails = (item) => {
    const fields = itemFields[currentItemType];

    return (
      <li key={item[fields[0].key]}>
        <h2>{currentItemType}</h2>
        {fields.map(field => {
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
            value = value || 'N/A';
          }

          return (
            <p key={field.key}>
              <strong>{field.label}:</strong> {value}
            </p>
          );
        })}
        <button onClick={() => borrowItem(item[fields[0].key])}>Borrow Item</button>
      </li>
    );
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {/* Buttons to select the item type */}
      <button onClick={() => handleItemTypeChange('BorrowRecord')}>Borrow Records</button>
      <button onClick={() => handleItemTypeChange('ItemBook')}>Books</button>
      <button onClick={() => handleItemTypeChange('ItemDevices')}>Devices</button>
      <button onClick={() => handleItemTypeChange('ItemMagazine')}>Magazines</button>
      <button onClick={() => handleItemTypeChange('ItemMedia')}>Media</button>
      <button onClick={checkBorrowLimits}>Check Borrow Limits</button>
      
      {itemsData.length > 0 && (
        <button onClick={toggleRecordsVisibility}>
          {isRecordsVisible ? 'Hide Records' : 'Show Records'}
        </button>
      )}

      {isRecordsVisible && (
        <ul>
          {itemsData.map(item => renderItemDetails(item))}
        </ul>
      )}

      {!isRecordsVisible && itemsData.length > 0 && (
        <p>Records are hidden. Click "Show Records" to display them.</p>
      )}
      
      <p>{borrowLimitMessage}</p>
    </div>
  );
};

export default AdminDashboard;