const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config({ path: './test.env' }); // Load environment variables only once

// Create a MySQL connection pool (persistent connection)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Test database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL database');
    connection.release();
  }
});

// Function to generate BorrowRecordID
const generateBorrowRecordID = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT MAX(CAST(SUBSTRING(BorrowRecordID, 3) AS UNSIGNED)) AS maxID 
      FROM BorrowRecord
    `;

    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching max ID:', error);
        return reject(error);
      }

      const maxID = results[0].maxID || 0;
      const newID = `BR${String(maxID + 1).padStart(10, '0')}`; // Generates new ID
      resolve(newID);
    });
  });
};

// Function to format date to YYYY-MM-DD
const formatDateToMySQL = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  const yyyy = date.getFullYear();
  const mm = ('0' + (date.getMonth() + 1)).slice(-2);
  const dd = ('0' + date.getDate()).slice(-2);
  return `${yyyy}-${mm}-${dd}`;
};

// Export the API route handler
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Log the request body for debugging
    console.log('Received request body:', req.body);

    const { userID, bookISBN, deviceID, magID, mediaID } = req.body;

    // Ensure the required fields are provided
    if (!userID) {
      console.error('Validation failed: UserID is missing');
      return res.status(400).json({ message: 'User ID is required.' });
    }

    // Determine which item type is being borrowed
    let itemIDColumn = '';
    let itemTable = '';
    let itemIDValue = '';
    let borrowRecordItemColumn = '';

    if (bookISBN) {
      itemIDColumn = 'ISBN'; // Column name in ItemBook table
      itemTable = 'ItemBook';
      itemIDValue = bookISBN;
      borrowRecordItemColumn = 'BookISBN';
    } else if (deviceID) {
      itemIDColumn = 'DeviceID'; // Column name in ItemDevices table
      itemTable = 'ItemDevices';
      itemIDValue = deviceID;
      borrowRecordItemColumn = 'DeviceID';
    } else if (magID) {
      itemIDColumn = 'MagazineID'; // Column name in ItemMagazine table
      itemTable = 'ItemMagazine';
      itemIDValue = magID;
      borrowRecordItemColumn = 'MagID';
    } else if (mediaID) {
      itemIDColumn = 'MediaID'; // Column name in ItemMedia table
      itemTable = 'ItemMedia';
      itemIDValue = mediaID;
      borrowRecordItemColumn = 'MediaID';
    } else {
      return res.status(400).json({ message: 'No item ID provided.' });
    }

    try {
      // Fetch user info (balance, suspended, borrowLimit, activeBorrowCount)
      const userInfoQuery = `
        SELECT Balance, Suspended, BorrowLimit
        FROM Users
        WHERE UserID = ?
      `;
      const [userResults] = await db.promise().query(userInfoQuery, [userID]);

      if (userResults.length === 0) {
        console.error('User not found');
        return res.status(404).json({ message: 'User not found.' });
      }

      const balance = parseFloat(userResults[0].Balance);
      const suspended = userResults[0].Suspended === 1;
      const borrowLimit = parseInt(userResults[0].BorrowLimit, 10);

      // Count active borrows
      const activeBorrowQuery = `
        SELECT COUNT(*) AS activeCount
        FROM BorrowRecord
        WHERE UserID = ? AND Status = 'Active'
      `;
      const [borrowResults] = await db.promise().query(activeBorrowQuery, [userID]);
      const activeBorrowCount = borrowResults[0].activeCount;

      console.log(
        `User Info - Balance: ${balance}, Suspended: ${suspended}, BorrowLimit: ${borrowLimit}, ActiveBorrows: ${activeBorrowCount}`
      );

      // Enforce borrow limit
      if (activeBorrowCount >= borrowLimit) {
        return res
          .status(403)
          .json({ message: `Borrow limit of ${borrowLimit} items reached.` });
      }

      // Check if the user is suspended
      if (suspended) {
        return res.status(403).json({
          message:
            'Your account is suspended. Please resolve outstanding fines to borrow items.',
        });
      }

      // Check if the item is available
      const availabilityQuery = `
        SELECT Availability
        FROM ${itemTable}
        WHERE ${itemIDColumn} = ?
      `;
      const [availabilityResults] = await db.promise().query(availabilityQuery, [itemIDValue]);

      if (availabilityResults.length === 0) {
        return res.status(404).json({ message: 'Item not found.' });
      }

      if (availabilityResults[0].Availability !== 'Available') {
        return res.status(400).json({ message: 'Item is not available.' });
      }

      // Generate BorrowRecordID
      const newBorrowRecordID = await generateBorrowRecordID();

      const createdAt = formatDateToMySQL(new Date());
      const lastUpdated = formatDateToMySQL(new Date());

      // Set BorrowDate to today and DueDate to two weeks from today
      const formattedBorrowDate = formatDateToMySQL(new Date());
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      const formattedDueDate = formatDateToMySQL(dueDate);
      const formattedReturnDate = null; // Not returned yet

      // Insert BorrowRecord
      const insertBorrowRecordQuery = `
        INSERT INTO BorrowRecord (
          BorrowRecordID, 
          UserID, 
          ${borrowRecordItemColumn}, 
          BorrowDate, 
          DueDate, 
          ReturnDate, 
          FineAmount, 
          CreatedBy, 
          CreatedAt,
          UpdatedBy,
          LastUpdated,
          Status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
      `;
      const borrowRecordValues = [
        newBorrowRecordID,
        userID,
        itemIDValue,
        formattedBorrowDate,
        formattedDueDate,
        formattedReturnDate,
        0, // FineAmount set to 0
        'user', // CreatedBy set to 'user'
        createdAt,
        'user', // UpdatedBy set to 'user'
        lastUpdated,
      ];

      await db.promise().query(insertBorrowRecordQuery, borrowRecordValues);

      // Update item's availability to 'Checked Out'
      const updateAvailabilityQuery = `
        UPDATE ${itemTable} 
        SET Availability = 'Checked Out' 
        WHERE ${itemIDColumn} = ?
      `;
      await db.promise().query(updateAvailabilityQuery, [itemIDValue]);

      res.status(201).json({ message: 'Item borrowed successfully!' });
    } catch (error) {
      console.error('Error processing borrow request:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}