const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config({ path: './test.env' });

// Create a MySQL connection using environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Function to generate BorrowRecordID
const generateBorrowRecordID = (callback) => {
  const query = `
    SELECT MAX(CAST(SUBSTRING(BorrowRecordID, 3) AS UNSIGNED)) AS maxID 
    FROM BorrowRecord
  `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching max ID:', error);
      return callback(error);
    }

    const maxID = results[0].maxID || 0;
    const newID = `BR${String(maxID + 1).padStart(10, '0')}`; // Generates new ID
    callback(null, newID);
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
      console.error('Validation failed:', { userID });
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

    // Check if the user is suspended
    const checkSuspensionQuery = `
      SELECT Suspended
      FROM Users
      WHERE UserID = ?
    `;
    db.query(checkSuspensionQuery, [userID], (error, results) => {
      if (error) {
        console.error('Error checking suspension status:', error);
        return res.status(500).json({ message: 'Internal server error.' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }

      const isSuspended = results[0].Suspended === 1;

      if (isSuspended) {
        return res.status(403).json({ message: 'Your account is suspended. Please resolve outstanding fines to borrow items.' });
      }

      // Check if the item is available
      const checkAvailabilityQuery = `
        SELECT Availability FROM ${itemTable} WHERE ${itemIDColumn} = ?
      `;
      db.query(checkAvailabilityQuery, [itemIDValue], (error, results) => {
        if (error) {
          console.error('Error checking availability:', error);
          return res.status(500).json({ message: 'Internal server error.' });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: 'Item not found.' });
        }

        if (results[0].Availability !== 'Available') {
          return res.status(400).json({ message: 'Item is not available.' });
        }

        // Proceed to create BorrowRecord
        generateBorrowRecordID((error, newBorrowRecordID) => {
          if (error) {
            return res.status(500).json({ message: 'Error generating BorrowRecordID.' });
          }

          const createdAt = formatDateToMySQL(new Date()); // Format the current date to YYYY-MM-DD
          const lastUpdated = formatDateToMySQL(new Date()); // Set LastUpdated to current date

          // Automatically set the borrow date to today's date
          const formattedBorrowDate = formatDateToMySQL(new Date());
          // Automatically set the due date to two weeks from today
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 14);
          const formattedDueDate = formatDateToMySQL(dueDate);
          // Will be set by the user when the item is returned
          const formattedReturnDate = null;

          // SQL query to insert the borrow record into the database
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
              LastUpdated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          db.query(
            insertBorrowRecordQuery,
            [
              newBorrowRecordID,
              userID,
              itemIDValue,
              formattedBorrowDate,
              formattedDueDate,
              formattedReturnDate, // Set ReturnDate to DueDate
              0, // FineAmount set to 0
              'user', // CreatedBy set to 'user'
              createdAt,
              'user', // UpdatedBy set to 'user'
              lastUpdated,
            ],
            (error, results) => {
              if (error) {
                console.error('Error inserting borrow record:', error);
                return res.status(500).json({ message: 'Internal server error.' });
              }

              // Update the item's availability to 'Checked Out'
              const updateAvailabilityQuery = `
                UPDATE ${itemTable} SET Availability = 'Checked Out' WHERE ${itemIDColumn} = ?
              `;
              db.query(updateAvailabilityQuery, [itemIDValue], (error, results) => {
                if (error) {
                  console.error('Error updating item availability:', error);
                  return res.status(500).json({ message: 'Internal server error.' });
                }

                res.status(201).json({ message: 'Item borrowed successfully!' });
              });
            }
          );
        });
      });
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}