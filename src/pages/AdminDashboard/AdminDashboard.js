import React, { useState, useEffect, useCallback } from 'react';
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
  // State variables
  const [itemsData, setItemsData] = useState([]);
  const [currentItemType, setCurrentItemType] = useState('ItemBook');
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [selectedCategories, setSelectedCategories] = useState({
    Book: true,
    Device: true,
    Magazine: true,
    Media: true,
  });
  const [popularItemsData, setPopularItemsData] = useState({
    popularBooks: [],
    popularDevices: [],
    popularMagazines: [],
    popularMedia: [],
  });
  const [selectedPopularTables, setSelectedPopularTables] = useState({
    Books: true,
    Devices: true,
    Magazines: true,
    Media: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [filteredUserInfo, setFilteredUserInfo] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const displayNames = {
    BorrowRecord: 'Borrow Record',
    ItemBook: 'Book',
    ItemDevices: 'Device',
    ItemMagazine: 'Magazine',
    ItemMedia: 'Media',
    Users: 'User',
    Employee: 'Employee',
  };

  // Fetch Functions
  const fetchItems = useCallback(
    async (table) => {
      console.log(`Fetching data for table: ${table}`);
      try {
        let response;
        let url = '';

        if (table === 'UserFinesReport') {
          // Ensure that UserID is provided
          const userID = userIdFilter;
          if (!userID) {
            alert('No user selected.');
            console.log('UserFinesReport: No UserID provided. Skipping fetch.');
            setItemsData([]);
            return;
          }
          const params = new URLSearchParams();
          params.append('UserID', userID);
          url = `/api/userFinesReport?${params.toString()}`;
        } else if (table === 'AnnualCostReport') {
          // Check if at least one category is selected
          const categoriesSelected = Object.values(selectedCategories).some((val) => val);
          if (!reportStartDate || !reportEndDate || !categoriesSelected) {
            console.log('AnnualCostReport: Missing parameters. Skipping fetch.');
            setItemsData([]);
            return;
          }

          const categories = Object.keys(selectedCategories)
            .filter((cat) => selectedCategories[cat])
            .join(',');
          url = `/api/annualCostReport?startDate=${reportStartDate}&endDate=${reportEndDate}&categories=${categories}`;
          console.log(`Fetching AnnualCostReport with URL: ${url}`);
        } else {
          url = `/api/pullAPI?table=${table}`;
        }

        console.log(`Fetching data from URL: ${url}`);
        response = await fetch(url);

        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error fetching ${table}:`, errorData);
          throw new Error(errorData.error || `Failed to fetch ${table} data`);
        }
        const data = await response.json();
        console.log(`Fetched data for ${table}:`, data);

        if (table === 'UserFinesReport') {
          // Set itemsData to reportRows and setFilteredUserInfo
          setItemsData(data.reportRows || []);
          if (data.userInfo) {
            setFilteredUserInfo({
              fullName: `${data.userInfo.FirstName} ${data.userInfo.LastName}`,
              email: data.userInfo.Email,
              phoneNumber: data.userInfo.PhoneNumber,
              balance: data.userInfo.UserBalance,
            });
          } else {
            setFilteredUserInfo(null);
          }
        } else {
          setItemsData(data);
        }
      } catch (error) {
        console.error(`Error in fetchItems for ${table}:`, error);
        alert(error.message);
      }
    },
    [reportStartDate, reportEndDate, selectedCategories, userIdFilter]
  );

  const fetchPopularItemsReport = useCallback(async () => {
    if (!reportStartDate || !reportEndDate) {
      alert('Please select both start and end dates.');
      console.log('PopularItemsReport: Missing start or end date.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    console.log('Fetching PopularItemsReport...');

    try {
      const response = await fetch(
        `/api/popularItemsReport?startDate=${reportStartDate}&endDate=${reportEndDate}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching PopularItemsReport:', errorData);
        throw new Error(errorData.error || 'Failed to fetch Popular Items Report');
      }
      const data = await response.json();
      console.log('Fetched PopularItemsReport data:', data);
      setPopularItemsData(data);
    } catch (error) {
      console.error('Error in fetchPopularItemsReport:', error);
      setErrorMessage(error.message);
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [reportStartDate, reportEndDate]);

  // Function to fetch users for the dropdown
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/userFinesReport?action=getUsers');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const users = await response.json();
      setUsersList(users);
      if (users.length > 0 && !userIdFilter) {
        setUserIdFilter(users[0].UserID);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert(error.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Effect to fetch data when currentItemType changes
  useEffect(() => {
    if (currentItemType !== 'PopularItemsReport' && currentItemType !== 'UserFinesReport') {
      fetchItems(currentItemType);
    } else if (currentItemType === 'UserFinesReport') {
      fetchUsers();
    }
  }, [currentItemType, fetchItems]);

  // Effect to fetch UserFinesReport data when userIdFilter changes
  useEffect(() => {
    if (currentItemType === 'UserFinesReport' && userIdFilter) {
      fetchItems('UserFinesReport');
    }
  }, [userIdFilter, currentItemType, fetchItems]);

  // Handler for changing the report type
  const handleItemTypeChange = (itemType) => {
    console.log(`Changing report type to: ${itemType}`);
    setCurrentItemType(itemType);
    setFormData({});
    setIsEditing(false);
    setErrorMessage('');

    // Reset filters
    setUserIdFilter('');
    setFilteredUserInfo(null);

    if (itemType === 'PopularItemsReport') {
      // Clear previous popular items data
      setPopularItemsData({
        popularBooks: [],
        popularDevices: [],
        popularMagazines: [],
        popularMedia: [],
      });
    }

    // If UserFinesReport is selected, fetch the list of users
    if (itemType === 'UserFinesReport') {
      fetchUsers();
    }
  };

  // Handlers for form inputs
  const handleInputChange = (e, field) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (field && field.isBoolean) {
      newValue = checked;
    }

    setFormData({ ...formData, [name]: newValue });
    console.log(`Form data updated: ${name} = ${newValue}`);
  };

  // Handler for user selection change
  const handleUserChange = (e) => {
    const { value } = e.target;
    setUserIdFilter(value);
  };

  const handleAddNew = () => {
    console.log('Adding new item.');
    setFormData({});
    setIsEditing(false);
  };

  const handleEdit = (item) => {
    console.log('Editing item:', item);
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
    console.log('Form data for editing:', processedItem);
  };

  const handleDelete = async (itemID) => {
    console.log(`Deleting item with ID: ${itemID}`);
    if (!window.confirm('Are you sure you want to delete this item?')) {
      console.log('Delete action canceled by user.');
      return;
    }
    try {
      const response = await fetch(`/api/pullAPI?table=${currentItemType}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [itemFields[currentItemType][0].key]: itemID }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error deleting item from ${currentItemType}:`, errorData);
        throw new Error(errorData.error || 'Failed to delete item');
      }
      await response.json();
      alert('Item deleted successfully.');
      console.log(`Item with ID ${itemID} deleted successfully.`);
      fetchItems(currentItemType);
    } catch (error) {
      console.error('Error in handleDelete:', error);
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
        alert(
          'At least one of Book ISBN, Device ID, Magazine ID, or Media ID must be provided.'
        );
        console.log('Validation failed: Missing BookISBN, DeviceID, MagID, or MediaID.');
        return false;
      }
    }
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted.');

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

      console.log(
        `Sending ${method} request to /api/pullAPI?table=${currentItemType} with data:`,
        dataToSend
      );

      const response = await fetch(`/api/pullAPI?table=${currentItemType}`, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error in handleFormSubmit (${method}):`, errorData);
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'add'} item`);
      }

      await response.json();
      alert(`Item ${isEditing ? 'updated' : 'added'} successfully.`);
      console.log(`Item ${isEditing ? 'updated' : 'added'} successfully.`);
      fetchItems(currentItemType);
      setFormData({});
      setIsEditing(false);
    } catch (error) {
      console.error('Error in handleFormSubmit:', error);
      alert(error.message);
    }
  };

  const handleCategoryChange = (e) => {
    const { name, checked } = e.target;
    setSelectedCategories({ ...selectedCategories, [name]: checked });
    console.log(`Category ${name} set to ${checked}`);
  };

  const handlePopularTableChange = (e) => {
    const { name, checked } = e.target;
    setSelectedPopularTables({ ...selectedPopularTables, [name]: checked });
    console.log(`Popular Table ${name} set to ${checked}`);
  };

  // Calculate total spending across all selected categories
  const calculateTotalSpending = () => {
    if (!itemsData.totalCosts) return 0;
    return itemsData.totalCosts.reduce((acc, curr) => acc + curr.totalCost, 0);
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
          <button className="item-type-button" onClick={() => handleItemTypeChange('AnnualCostReport')}>
            Total Spending Report
          </button>
          <button className="item-type-button" onClick={() => handleItemTypeChange('PopularItemsReport')}>
            Popular Items Report
          </button>
        </div>

        {/* Total Spending Report UI */}
        {currentItemType === 'AnnualCostReport' && (
          <>
            <h2>Total Spending Report</h2>
            <div className="report-filters">
              <label>
                Start Date:
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  required
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  required
                />
              </label>
              <div className="category-filters">
                <label>
                  <input
                    type="checkbox"
                    name="Book"
                    checked={selectedCategories.Book}
                    onChange={handleCategoryChange}
                  />
                  Books
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="Device"
                    checked={selectedCategories.Device}
                    onChange={handleCategoryChange}
                  />
                  Devices
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="Magazine"
                    checked={selectedCategories.Magazine}
                    onChange={handleCategoryChange}
                  />
                  Magazines
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="Media"
                    checked={selectedCategories.Media}
                    onChange={handleCategoryChange}
                  />
                  Media
                </label>
              </div>
              <button onClick={() => fetchItems('AnnualCostReport')}>Generate Report</button>
            </div>

            {/* Display total spending across selected categories */}
            {itemsData.totalCosts && Object.values(selectedCategories).some((val) => val) && (
              <div className="report-summary">
                <p>Total Spending: ${calculateTotalSpending().toFixed(2)}</p>
              </div>
            )}

            {/* Display total spending per category */}
            {itemsData.totalCosts && (
              <div className="report-summary">
                {selectedCategories.Book ? (
                  <p>
                    Books Total: $
                    {itemsData.totalCosts
                      .find((c) => c.category === 'Book')
                      ?.totalCost.toFixed(2) || '0.00'}
                  </p>
                ) : (
                  <p>Books Total: N/A</p>
                )}

                {selectedCategories.Device ? (
                  <p>
                    Devices Total: $
                    {itemsData.totalCosts
                      .find((c) => c.category === 'Device')
                      ?.totalCost.toFixed(2) || '0.00'}
                  </p>
                ) : (
                  <p>Devices Total: N/A</p>
                )}

                {selectedCategories.Magazine ? (
                  <p>
                    Magazines Total: $
                    {itemsData.totalCosts
                      .find((c) => c.category === 'Magazine')
                      ?.totalCost.toFixed(2) || '0.00'}
                  </p>
                ) : (
                  <p>Magazines Total: N/A</p>
                )}

                {selectedCategories.Media ? (
                  <p>
                    Media Total: $
                    {itemsData.totalCosts
                      .find((c) => c.category === 'Media')
                      ?.totalCost.toFixed(2) || '0.00'}
                  </p>
                ) : (
                  <p>Media Total: N/A</p>
                )}
              </div>
            )}

            {/* Display items if any categories are selected */}
            {selectedCategories.Book ||
            selectedCategories.Device ||
            selectedCategories.Magazine ||
            selectedCategories.Media ? (
              itemsData.items && itemsData.items.length > 0 ? (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item Type</th>
                        <th>Item ID</th>
                        <th>Title</th>
                        <th>Cost</th>
                        <th>Purchased Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsData.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.ItemType}</td>
                          <td>{item.ItemID}</td>
                          <td>{item.Title}</td>
                          <td>${parseFloat(item.Cost).toFixed(2)}</td>
                          <td>{new Date(item.CreatedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No records found for the selected time frame.</p>
              )
            ) : (
              <p>
                No categories selected. Please select at least one category to view the report.
              </p>
            )}
          </>
        )}

        {/* Popular Items Report UI */}
        {currentItemType === 'PopularItemsReport' && (
          <>
            <h2>Popular Items Report</h2>
            <div className="report-filters">
              <label>
                Start Date:
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  required
                />
              </label>
              <label>
                End Date:
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  required
                />
              </label>
              <div className="popular-category-filters">
                <label>
                  <input
                    type="checkbox"
                    name="Books"
                    checked={selectedPopularTables.Books}
                    onChange={handlePopularTableChange}
                  />
                  Books
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="Devices"
                    checked={selectedPopularTables.Devices}
                    onChange={handlePopularTableChange}
                  />
                  Devices
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="Magazines"
                    checked={selectedPopularTables.Magazines}
                    onChange={handlePopularTableChange}
                  />
                  Magazines
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="Media"
                    checked={selectedPopularTables.Media}
                    onChange={handlePopularTableChange}
                  />
                  Media
                </label>
              </div>
              <button onClick={fetchPopularItemsReport}>Generate Report</button>
            </div>

            {isLoading ? (
              <p className="loading-message">Loading...</p>
            ) : errorMessage ? (
              <div className="error-message">{errorMessage}</div>
            ) : (
              <>
                {/* Popular Books Table */}
                {selectedPopularTables.Books &&
                  popularItemsData.popularBooks.length > 0 && (
                    <div className="report-section">
                      <h3>Top 10 Popular Books</h3>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Borrow Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {popularItemsData.popularBooks.map((book, index) => (
                            <tr key={index}>
                              <td>{book.Title}</td>
                              <td>{book.Author}</td>
                              <td>{book.BorrowCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                {/* Popular Devices Table */}
                {selectedPopularTables.Devices &&
                  popularItemsData.popularDevices.length > 0 && (
                    <div className="report-section">
                      <h3>Top 10 Popular Devices</h3>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Brand</th>
                            <th>Model</th>
                            <th>Borrow Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {popularItemsData.popularDevices.map((device, index) => (
                            <tr key={index}>
                              <td>{device.Title}</td>
                              <td>{device.Brand}</td>
                              <td>{device.Model}</td>
                              <td>{device.BorrowCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                {/* Popular Magazines Table */}
                {selectedPopularTables.Magazines &&
                  popularItemsData.popularMagazines.length > 0 && (
                    <div className="report-section">
                      <h3>Top 10 Popular Magazines</h3>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>Borrow Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {popularItemsData.popularMagazines.map((mag, index) => (
                            <tr key={index}>
                              <td>{mag.Title}</td>
                              <td>{mag.Author}</td>
                              <td>{mag.BorrowCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                {/* Popular Media Table */}
                {selectedPopularTables.Media &&
                  popularItemsData.popularMedia.length > 0 && (
                    <div className="report-section">
                      <h3>Top 10 Popular Media Items</h3>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Director</th>
                            <th>Media Type</th>
                            <th>Borrow Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {popularItemsData.popularMedia.map((media, index) => (
                            <tr key={index}>
                              <td>{media.Title}</td>
                              <td>{media.Director}</td>
                              <td>{media.MediaType}</td>
                              <td>{media.BorrowCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
              </>
            )}
          </>
        )}

        {/* User Fines Report UI */}
        {currentItemType === 'UserFinesReport' && (
          <>
            <div className="filter-section">
              <h2>Select User for Fines Report</h2>
              <div className="filter-controls">
                <div className="form-control">
                  <label>
                    User:
                    {loadingUsers ? (
                      <select disabled>
                        <option>Loading...</option>
                      </select>
                    ) : (
                      <select
                        name="userIdFilter"
                        value={userIdFilter}
                        onChange={handleUserChange}
                      >
                        {usersList.map((user) => (
                          <option key={user.UserID} value={user.UserID}>
                            {user.UserID} - {user.FirstName} {user.LastName}
                          </option>
                        ))}
                      </select>
                    )}
                  </label>
                </div>
              </div>
              {/* Display filtered user info */}
              {filteredUserInfo && (
                <div className="user-info">
                  <p>
                    <strong>User:</strong> {filteredUserInfo.fullName}
                  </p>
                  <p>
                    <strong>Email:</strong> {filteredUserInfo.email}
                  </p>
                  <p>
                    <strong>Phone Number:</strong> {filteredUserInfo.phoneNumber}
                  </p>
                  <p>
                    <strong>Current Balance:</strong> $
                    {parseFloat(filteredUserInfo.balance).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* User Fines Report Data Table */}
            {itemsData.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      {itemFields['UserFinesReport'].map((field) => (
                        <th key={field.key}>{field.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {itemsData.map((item, index) => (
                      <tr key={index}>
                        {itemFields['UserFinesReport'].map((field) => {
                          let value = item[field.key];

                          if (field.isCurrency && value !== null) {
                            value = `$${parseFloat(value).toFixed(2)}`;
                          } else if (field.isDate && value) {
                            value = new Date(value).toLocaleDateString();
                          } else {
                            value = value !== null && value !== undefined ? value : 'N/A';
                          }

                          return <td key={field.key}>{value}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No records found.</p>
            )}
          </>
        )}

        {/* Data Table for Other Item Types */}
        {currentItemType !== 'AnnualCostReport' &&
          currentItemType !== 'UserFinesReport' &&
          currentItemType !== 'PopularItemsReport' &&
          Array.isArray(itemsData) &&
          itemsData.length > 0 && (
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
          )}

        {/* Form to add or edit items */}
        {currentItemType !== 'UserFinesReport' &&
          currentItemType !== 'AnnualCostReport' &&
          currentItemType !== 'PopularItemsReport' && (
            <>
              <h2>
                {isEditing ? 'Edit' : 'Add New'} {displayNames[currentItemType]}
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