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
};

const AdminDashboard = () => {
  const [itemsData, setItemsData] = useState([]);
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
    fetchItems(itemType);
    setFormData({});
    setIsEditing(false);
  };

  const handleInputChange = (e, field) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (field && field.isBoolean) {
      newValue = checked;
    }

    setFormData({ ...formData, [name]: newValue });
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
          <button onClick={() => handleItemTypeChange('BorrowRecord')}>Borrow Records</button>
          <button onClick={() => handleItemTypeChange('ItemBook')}>Books</button>
          <button onClick={() => handleItemTypeChange('ItemDevices')}>Devices</button>
          <button onClick={() => handleItemTypeChange('ItemMagazine')}>Magazines</button>
          <button onClick={() => handleItemTypeChange('ItemMedia')}>Media</button>
          <button onClick={() => handleItemTypeChange('Users')}>Users</button>
          <button onClick={() => handleItemTypeChange('Employee')}>Employee</button>
        </div>

        {itemsData.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  {itemFields[currentItemType].map((field) => (
                    <th key={field.key}>{field.label}</th>
                  ))}
                  <th>Actions</th>
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
                      } else if (field.isBoolean) {
                        value = value ? 'Yes' : 'No';
                      } else {
                        value = value !== null && value !== undefined ? value : 'N/A';
                      }

                      return <td key={field.key}>{value}</td>;
                    })}
                    <td>
                      <button onClick={() => handleEdit(item)}>Edit</button>
                      <button onClick={() => handleDelete(item[itemFields[currentItemType][0].key])}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No records found.</p>
        )}

        {/* Form to add or edit items */}
        <h2>{isEditing ? 'Edit' : 'Add New'} {currentItemType}</h2>
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
            <button type="submit">{isEditing ? 'Update' : 'Add'}</button>
            {isEditing && (
              <button type="button" onClick={handleAddNew}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;