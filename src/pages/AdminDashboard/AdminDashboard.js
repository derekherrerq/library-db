import React, { useState, useEffect } from 'react';

const USER_LIMITS = {
  Student: {
    limit: 5,
    duration: 7,
  },
  Faculty: {
    limit: 10,
    duration: 14,
  },
  // Add other roles if necessary
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
    // 'CreatedAt', 'CreatedBy', 'LastUpdated', 'UpdatedBy' are handled automatically
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
  Users: [
    { label: 'User ID', key: 'UserID' },
    { label: 'Role', key: 'Role' },
    { label: 'First Name', key: 'FirstName' },
    { label: 'Last Name', key: 'LastName' },
    { label: 'Email', key: 'Email' },
    { label: 'Phone Number', key: 'PhoneNumber' },
    { label: 'Start Date', key: 'StartDate', isDate: true },
    { label: 'Birthday', key: 'Birthday', isDate: true },
    { label: 'Street Address', key: 'StreetAddress' },
    { label: 'City', key: 'City' },
    { label: 'State', key: 'State' },
    { label: 'Zip Code', key: 'ZipCode' },
    { label: 'Borrow Limit', key: 'BorrowLimit' },
    { label: 'Balance', key: 'Balance', isCurrency: true },
    { label: 'Suspended', key: 'Suspended' },
  ],
  Employee: [
    { label: 'Employee ID', key: 'EmployeeID' },
    { label: 'User ID', key: 'UserID' },
    { label: 'First Name', key: 'FirstName' },
    { label: 'Last Name', key: 'LastName' },
    { label: 'Email', key: 'Email' },
    { label: 'Phone Number', key: 'PhoneNumber' },
    { label: 'Birthday', key: 'Birthday', isDate: true },
    { label: 'Street Address', key: 'StreetAddress' },
    { label: 'City', key: 'City' },
    { label: 'State', key: 'State' },
    { label: 'Zip Code', key: 'ZipCode' },
    { label: 'Hire Date', key: 'HireDate', isDate: true },
    { label: 'Role', key: 'role' },
    { label: 'Department', key: 'Department' },
    { label: 'Is Supervisor', key: 'is_supervisor' },
    { label: 'Supervised By Name', key: 'supervised_by_name' },
    { label: 'Supervised By Employee ID', key: 'supervised_by_employee_id' },
    { label: 'Fine Amount', key: 'FineAmount', isCurrency: true },
  ],
};

const AdminDashboard = () => {
  const [itemsData, setItemsData] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState('Student'); // Default role
  const [isRecordsVisible, setIsRecordsVisible] = useState(false);
  const [borrowLimitMessage, setBorrowLimitMessage] = useState('');
  const [currentItemType, setCurrentItemType] = useState('ItemBook');

  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

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

  useEffect(() => {
    fetchItems(currentItemType);
  }, [currentItemType]);

  const toggleRecordsVisibility = () => {
    setIsRecordsVisible(!isRecordsVisible);
  };

  const canBorrowMoreItems = (userID) => {
    const userRecords = itemsData.filter((record) => record.UserID === userID);
    return userRecords.length < USER_LIMITS[currentUserRole].limit;
  };

  const getDueDate = () => {
    const durationDays = USER_LIMITS[currentUserRole].duration;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + durationDays);
    return dueDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  const borrowItem = async (itemID) => {
    // Replace 'UserID' and 'UserRole' with actual user context
    const currentUserID = 'U001'; // Replace with actual user ID
    const currentUserRole = 'Student'; // Replace with actual user role

    if (!canBorrowMoreItems(currentUserID)) {
      alert(`Borrow limit reached for ${currentUserRole}.`);
      return;
    }

    const dueDate = getDueDate();

    const newRecord = {
      BorrowRecordID: `BR${Date.now()}`, // Generate a unique ID
      UserID: currentUserID,
      BorrowDate: new Date().toISOString().split('T')[0],
      DueDate: dueDate,
      ReturnDate: null,
      FineAmount: 0,
    };

    // Assign the appropriate item ID based on the current item type
    if (currentItemType === 'ItemBook') {
      newRecord.BookISBN = itemID;
    } else if (currentItemType === 'ItemDevices') {
      newRecord.DeviceID = itemID;
    } else if (currentItemType === 'ItemMagazine') {
      newRecord.MagID = itemID;
    } else if (currentItemType === 'ItemMedia') {
      newRecord.MediaID = itemID;
    } else {
      // For Users and Employee tables, borrowing items is not applicable
      alert('Cannot borrow items from this table.');
      return;
    }

    try {
      const response = await fetch(`/api/pullAPI?table=BorrowRecord`, {
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
    const currentUserID = 'U001'; // Replace with actual user ID
    if (canBorrowMoreItems(currentUserID)) {
      setBorrowLimitMessage(
        `You can borrow more items. Limit: ${USER_LIMITS[currentUserRole].limit}`
      );
    } else {
      setBorrowLimitMessage(`You have reached your borrowing limit.`);
    }
  };

  const handleItemTypeChange = (itemType) => {
    setCurrentItemType(itemType);
    fetchItems(itemType);
    setFormData({});
    setIsEditing(false);
  };

  const renderItemDetails = (item) => {
    const fields = itemFields[currentItemType];

    return (
      <li key={item[fields[0].key]}>
        <h2>{currentItemType}</h2>
        {fields.map((field) => {
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

          return (
            <p key={field.key}>
              <strong>{field.label}:</strong> {value}
            </p>
          );
        })}
        {['ItemBook', 'ItemDevices', 'ItemMagazine', 'ItemMedia'].includes(currentItemType) && (
          <button onClick={() => borrowItem(item[fields[0].key])}>Borrow Item</button>
        )}
        <button onClick={() => handleEdit(item)}>Edit</button>
        <button onClick={() => handleDelete(item[fields[0].key])}>Delete</button>
      </li>
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddNew = () => {
    setFormData({});
    setIsEditing(false);
  };

  const handleEdit = (item) => {
    setFormData(item);
    setIsEditing(true);
  };

  const handleDelete = async (itemID) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }
    try {
      const response = await fetch(`/api/pullAPI?table=${currentItemType}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [itemFields[currentItemType][0].key]: itemID }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete item');
      }
      await response.json();
      fetchItems(currentItemType);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(error.message);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const dataToSend = { ...formData };

      // Process date fields
      const fields = itemFields[currentItemType];
      fields.forEach((field) => {
        if (field.isDate && dataToSend[field.key]) {
          // Ensure date is in 'YYYY-MM-DD' format
          dataToSend[field.key] = dataToSend[field.key].split('T')[0];
        }
      });

      const response = await fetch(`/api/pullAPI?table=${currentItemType}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'add'} item`);
      }
      await response.json();
      fetchItems(currentItemType);
      setFormData({});
      setIsEditing(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.message);
    }
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
      <button onClick={() => handleItemTypeChange('Users')}>Users</button>
      <button onClick={() => handleItemTypeChange('Employee')}>Employee</button>
      <button onClick={checkBorrowLimits}>Check Borrow Limits</button>

      {itemsData.length > 0 && (
        <button onClick={toggleRecordsVisibility}>
          {isRecordsVisible ? 'Hide Records' : 'Show Records'}
        </button>
      )}

      {isRecordsVisible && (
        <ul>
          {itemsData.map((item) => renderItemDetails(item))}
        </ul>
      )}

      {!isRecordsVisible && itemsData.length > 0 && (
        <p>Records are hidden. Click "Show Records" to display them.</p>
      )}

      <p>{borrowLimitMessage}</p>

      {/* Form to add or edit items */}
      <h2>{isEditing ? 'Edit' : 'Add New'} {currentItemType}</h2>
      <form onSubmit={handleFormSubmit}>
        {itemFields[currentItemType].map((field) => (
          <div key={field.key}>
            <label>
              {field.label}:
              <input
                type={
                  field.isDate
                    ? 'date'
                    : field.isCurrency
                    ? 'number'
                    : field.key.toLowerCase().includes('email')
                    ? 'email'
                    : 'text'
                }
                name={field.key}
                value={formData[field.key] || ''}
                onChange={handleInputChange}
                required
                disabled={isEditing && field.key === itemFields[currentItemType][0].key}
              />
            </label>
          </div>
        ))}
        <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
        {isEditing && <button type="button" onClick={handleAddNew}>Cancel</button>}
      </form>
    </div>
  );
};

export default AdminDashboard;