import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

const itemFields = {
  BorrowRecord: [
    { label: 'Borrow Record ID', key: 'BorrowRecordID', readOnly: true },
    { label: 'User ID', key: 'UserID' },
    { label: 'Book ISBN', key: 'BookISBN', isOptional: true },
    { label: 'Device ID', key: 'DeviceID', isOptional: true },
    { label: 'Magazine ID', key: 'MagID', isOptional: true },
    { label: 'Media ID', key: 'MediaID', isOptional: true },
    { label: 'Borrow Date', key: 'BorrowDate', isDate: true },
    { label: 'Due Date', key: 'DueDate', isDate: true },
    { label: 'Return Date', key: 'ReturnDate', isDate: true, isOptional: true },
    { label: 'Status', key: 'Status' },
    { label: 'Fine Amount', key: 'FineAmount', isCurrency: true },
  ],
  ItemBook: [
    { label: 'Book ID', key: 'BookID', readOnly: true },
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
    { label: 'Device ID', key: 'DeviceID', readOnly: true },
    { label: 'Title', key: 'Title' },
    { label: 'Brand', key: 'Brand' },
    { label: 'Model', key: 'Model' },
    { label: 'Warranty', key: 'Warranty', isDate: true },
    { label: 'Publisher', key: 'Publisher' },
    { label: 'Cost', key: 'Cost', isCurrency: true },
    { label: 'Availability', key: 'Availability' },
  ],
  ItemMagazine: [
    { label: 'Magazine ID', key: 'MagazineID', readOnly: true },
    { label: 'ISSN', key: 'ISSN' },
    { label: 'Title', key: 'Title' },
    { label: 'Author', key: 'Author' },
    { label: 'Publish Date', key: 'PublishDate', isDate: true },
    { label: 'Publisher', key: 'Publisher' },
    { label: 'Cost', key: 'Cost', isCurrency: true },
    { label: 'Availability', key: 'Availability' },
  ],
  ItemMedia: [
    { label: 'Media ID', key: 'MediaID', readOnly: true },
    { label: 'Title', key: 'Title' },
    { label: 'Media Type', key: 'MediaType' },
    { label: 'Duration', key: 'Duration', isDuration: true },
    { label: 'Director', key: 'Director' },
    { label: 'Cost', key: 'Cost', isCurrency: true },
    { label: 'Availability', key: 'Availability' },
  ],
  Users: [
    { label: 'User ID', key: 'UserID', readOnly: true },
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
    { label: 'Suspended', key: 'Suspended', isBoolean: true },
  ],
  Employee: [
    { label: 'Employee ID', key: 'EmployeeID', readOnly: true },
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
    { label: 'Role', key: 'Role' },
    { label: 'Department', key: 'Department' },
    { label: 'Is Supervisor', key: 'is_supervisor', isBoolean: true },
    { label: 'Supervised By Name', key: 'supervised_by_name' },
    { label: 'Supervised By Employee ID', key: 'supervised_by_employee_id' },
  ],
  UserFinesReport: [
    { label: 'User ID', key: 'UserID' },
    { label: 'First Name', key: 'FirstName' },
    { label: 'Last Name', key: 'LastName' },
    { label: 'Email', key: 'Email' },
    { label: 'Phone Number', key: 'PhoneNumber' },
    { label: 'User Balance', key: 'UserBalance', isCurrency: true },
    { label: 'Borrow Record ID', key: 'BorrowRecordID' },
    { label: 'Borrow Date', key: 'BorrowDate', isDate: true },
    { label: 'Due Date', key: 'DueDate', isDate: true },
    { label: 'Return Date', key: 'ReturnDate', isDate: true },
    { label: 'Fine Amount', key: 'FineAmount', isCurrency: true },
    { label: 'Status', key: 'Status' },
    { label: 'Item Title', key: 'ItemTitle' },
    { label: 'Item Type', key: 'ItemType' },
  ],
};

const AdminDashboard = () => {
  const [itemsData, setItemsData] = useState([]);
  const [currentItemType, setCurrentItemType] = useState('ItemBook');

  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const [userIdFilter, setUserIdFilter] = useState('');
  const [borrowDateFrom, setBorrowDateFrom] = useState('');
  const [borrowDateTo, setBorrowDateTo] = useState('');
  const [filteredUserInfo, setFilteredUserInfo] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const fetchItems = async (table) => {
    try {
      let url = '';
      if (table === 'UserFinesReport') {
        // Append query parameters if filters are applied
        const params = new URLSearchParams();
        if (userIdFilter.trim() !== '') {
          params.append('UserID', userIdFilter.trim());
        }
        if (borrowDateFrom !== '') {
          params.append('BorrowDateFrom', borrowDateFrom);
        }
        if (borrowDateTo !== '') {
          params.append('BorrowDateTo', borrowDateTo);
        }
        url = `/api/userFinesReport?${params.toString()}`;
      } else {
        url = `/api/pullAPI?table=${table}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${table} data`);
      }
      const data = await response.json();
      console.log(`Fetched ${table} data:`, data);
      setItemsData(data);

      // If UserFinesReport and data exists, set filtered user info
      if (table === 'UserFinesReport' && data.length > 0) {
        const user = data[0]; // Assuming all records are for the same user when filtered
        setFilteredUserInfo({
          fullName: `${user.FirstName} ${user.LastName}`,
          balance: user.UserBalance,
        });
      } else {
        setFilteredUserInfo(null);
      }
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  // Function to fetch users for the dropdown using the same endpoint
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/userFinesReport?action=getUsers');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const users = await response.json();
      setUsersList(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert(error.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchItems(currentItemType);
  }, [currentItemType]);

  const handleItemTypeChange = (itemType) => {
    setCurrentItemType(itemType);
    fetchItems(itemType);
    setFormData({});
    setIsEditing(false);
    // Reset filters when changing item type
    setUserIdFilter('');
    setBorrowDateFrom('');
    setBorrowDateTo('');
    setFilteredUserInfo(null);

    // If UserFinesReport is selected, fetch the list of users
    if (itemType === 'UserFinesReport') {
      fetchUsers();
    }
  };

  const handleInputChange = (e, field) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (field && field.isBoolean) {
      newValue = checked;
    }

    setFormData({ ...formData, [name]: newValue });
  };

  // Handlers for filter inputs
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'userIdFilter') {
      setUserIdFilter(value);
    } else if (name === 'borrowDateFrom') {
      setBorrowDateFrom(value);
    } else if (name === 'borrowDateTo') {
      setBorrowDateTo(value);
    }
  };

  const applyFilters = () => {
    fetchItems('UserFinesReport');
  };

  const clearFilters = () => {
    setUserIdFilter('');
    setBorrowDateFrom('');
    setBorrowDateTo('');
    setFilteredUserInfo(null);
    fetchItems('UserFinesReport');
  };

  const handleAddNew = () => {
    setFormData({});
    setIsEditing(false);
  };

  const handleEdit = (item) => {
    const processedItem = { ...item };
    const fields = itemFields[currentItemType];

    fields.forEach((field) => {
      if (field.isDate && processedItem[field.key]) {
        // Ensure date is in 'YYYY-MM-DD' format
        processedItem[field.key] = new Date(processedItem[field.key])
          .toISOString()
          .split('T')[0];
      }
      if (field.isBoolean) {
        // Convert to boolean
        processedItem[field.key] =
          processedItem[field.key] === '1' ||
          processedItem[field.key] === 1 ||
          processedItem[field.key] === true;
      }
    });

    setFormData(processedItem);
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
      alert('Item deleted successfully.');
      fetchItems(currentItemType);
    } catch (error) {
      console.error('Error deleting item:', error);
      alert(error.message);
    }
  };

  const validateForm = () => {
    if (currentItemType === 'BorrowRecord') {
      const { BookISBN, DeviceID, MagID, MediaID } = formData;
      if (
        (!BookISBN || BookISBN.trim() === '') &&
        (!DeviceID || DeviceID.trim() === '') &&
        (!MagID || MagID.trim() === '') &&
        (!MediaID || MediaID.trim() === '')
      ) {
        alert('At least one of Book ISBN, Device ID, Magazine ID, or Media ID must be provided.');
        return false;
      }
    }
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const method = isEditing ? 'PUT' : 'POST';
      const dataToSend = { ...formData };

      // Process date and boolean fields
      const fields = itemFields[currentItemType];
      fields.forEach((field) => {
        if (field.isDate && dataToSend[field.key]) {
          // Ensure date is in 'YYYY-MM-DD' format
          dataToSend[field.key] = dataToSend[field.key];
        }
        if (field.isBoolean && dataToSend[field.key] !== undefined) {
          // Convert boolean to the format expected by backend
          dataToSend[field.key] = dataToSend[field.key] ? 1 : 0;
        }
      });

      // Handle nullable fields: Convert empty strings to null
      Object.keys(dataToSend).forEach((key) => {
        if (
          dataToSend[key] === '' ||
          dataToSend[key] === undefined ||
          dataToSend[key] === null
        ) {
          dataToSend[key] = null;
        }
      });

      const response = await fetch(`/api/pullAPI?table=${currentItemType}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'add'} item`);
      }
      await response.json();
      alert(`Item ${isEditing ? 'updated' : 'added'} successfully.`);
      fetchItems(currentItemType);
      setFormData({});
      setIsEditing(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.message);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1>Admin Dashboard</h1>
        {/* Buttons to select the item type */}
        <div className="button-group">
          <button className="item-type-button" onClick={() => handleItemTypeChange('BorrowRecord')}>
            Borrow Records
          </button>
          <button className="item-type-button" onClick={() => handleItemTypeChange('ItemBook')}>
            Books
          </button>
          <button className="item-type-button" onClick={() => handleItemTypeChange('ItemDevices')}>
            Devices
          </button>
          <button className="item-type-button" onClick={() => handleItemTypeChange('ItemMagazine')}>
            Magazines
          </button>
          <button className="item-type-button" onClick={() => handleItemTypeChange('ItemMedia')}>
            Media
          </button>
          <button className="item-type-button" onClick={() => handleItemTypeChange('Users')}>
            Users
          </button>
          <button className="item-type-button" onClick={() => handleItemTypeChange('Employee')}>
            Employee
          </button>
          <button className="item-type-button" onClick={() => handleItemTypeChange('UserFinesReport')}>
            User Fines Report
          </button>
        </div>

        {/* Filter Section for User Fines Report */}
        {currentItemType === 'UserFinesReport' && (
          <div className="filter-section">
            <h2>Filter User Fines Report</h2>
            <div className="filter-controls">
              <div className="form-control">
                <label>
                  User ID:
                  {loadingUsers ? (
                    <select disabled>
                      <option>Loading...</option>
                    </select>
                  ) : (
                    <select
                      name="userIdFilter"
                      value={userIdFilter}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Users</option>
                      {usersList.map((user) => (
                        <option key={user.UserID} value={user.UserID}>
                          {user.UserID} - {user.FirstName} {user.LastName}
                        </option>
                      ))}
                    </select>
                  )}
                </label>
              </div>
              <div className="form-control">
                <label>
                  Borrow Date From:
                  <input
                    type="date"
                    name="borrowDateFrom"
                    value={borrowDateFrom}
                    onChange={handleFilterChange}
                  />
                </label>
              </div>
              <div className="form-control">
                <label>
                  Borrow Date To:
                  <input
                    type="date"
                    name="borrowDateTo"
                    value={borrowDateTo}
                    onChange={handleFilterChange}
                  />
                </label>
              </div>
              <div className="filter-buttons">
                <button className="apply-button" onClick={applyFilters}>
                  Apply Filters
                </button>
                <button className="clear-button" onClick={clearFilters}>
                  Clear Filters
                </button>
              </div>
            </div>
            {/* Display filtered user info */}
            {filteredUserInfo && (
              <div className="user-info">
                <p>
                  <strong>User:</strong> {filteredUserInfo.fullName}
                </p>
                <p>
                  <strong>Current Balance:</strong> ${parseFloat(filteredUserInfo.balance).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Data Table */}
        {itemsData.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {itemFields[currentItemType].map((field) => (
                    <th key={field.key}>{field.label}</th>
                  ))}
                  {currentItemType !== 'UserFinesReport' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {itemsData.map((item, index) => (
                  <tr key={index}>
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
                      } else if (field.isBoolean) {
                        value = value ? 'Yes' : 'No';
                      } else {
                        value = value !== null && value !== undefined ? value : 'N/A';
                      }

                      return <td key={field.key}>{value}</td>;
                    })}
                    {currentItemType !== 'UserFinesReport' && (
                      <td>
                        <button className="edit-button" onClick={() => handleEdit(item)}>
                          Edit
                        </button>
                        <button
                          className="delete-button"
                          onClick={() =>
                            handleDelete(item[itemFields[currentItemType][0].key])
                          }
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No records found.</p>
        )}

        {/* Form to add or edit items */}
        {currentItemType !== 'UserFinesReport' && (
          <>
            <h2>
              {isEditing ? 'Edit' : 'Add New'} {currentItemType}
            </h2>
            <form onSubmit={handleFormSubmit} className="dashboard-form">
              {itemFields[currentItemType].map((field) => (
                <div key={field.key} className="form-control">
                  <label>
                    {field.label}:
                    {field.isBoolean ? (
                      <input
                        type="checkbox"
                        name={field.key}
                        checked={!!formData[field.key]}
                        onChange={(e) => handleInputChange(e, field)}
                        disabled={isEditing && field.readOnly}
                      />
                    ) : (
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
                        value={
                          field.isDate && formData[field.key]
                            ? formData[field.key]
                            : formData[field.key] || ''
                        }
                        onChange={(e) => handleInputChange(e, field)}
                        required={!field.isOptional && !field.readOnly}
                        disabled={isEditing && field.readOnly}
                      />
                    )}
                  </label>
                </div>
              ))}
              <div className="form-buttons">
                <button className="submit-button" type="submit">
                  {isEditing ? 'Update' : 'Add'}
                </button>
                {isEditing && (
                  <button className="cancel-button" type="button" onClick={handleAddNew}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;