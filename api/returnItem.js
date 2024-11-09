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
    // It's better to handle connection errors at the application level
  } else {
    console.log('Connected to MySQL database');
  }
});

// Function to format date to YYYY-MM-DD
const formatDateToMySQL = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // Format to YYYY-MM-DD
};

// Export the API route handler
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Log the request body for debugging
    console.log('Received request body:', req.body);

    const { BorrowRecordID } = req.body;

    // Ensure the required fields are provided
    if (!BorrowRecordID) {
      console.error('Validation failed:', { BorrowRecordID });
      return res.status(400).json({ message: 'BorrowRecordID is required.' });
    }

    // Step 1: Fetch the borrow record
    const fetchBorrowRecordQuery = `
      SELECT * FROM BorrowRecord WHERE BorrowRecordID = ?
    `;
    db.query(fetchBorrowRecordQuery, [BorrowRecordID], (error, results) => {
      if (error) {
        console.error('Error fetching borrow record:', error);
        return res.status(500).json({ message: 'Internal server error.' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Borrow record not found.' });
      }

      const borrowRecord = results[0];

      // Check if the borrow record is already returned
      if (borrowRecord.Status === 'Returned') {
        return res.status(400).json({ message: 'Item is already returned.' });
      }

      // Determine which item type is being returned
      let itemIDColumn = '';
      let itemTable = '';
      let itemIDValue = '';

      if (borrowRecord.BookISBN) {
        itemIDColumn = 'ISBN';
        itemTable = 'ItemBook';
        itemIDValue = borrowRecord.BookISBN;
      } else if (borrowRecord.DeviceID) {
        itemIDColumn = 'DeviceID';
        itemTable = 'ItemDevices';
        itemIDValue = borrowRecord.DeviceID;
      } else if (borrowRecord.MagID) {
        itemIDColumn = 'MagazineID';
        itemTable = 'ItemMagazine';
        itemIDValue = borrowRecord.MagID;
      } else if (borrowRecord.MediaID) {
        itemIDColumn = 'MediaID';
        itemTable = 'ItemMedia';
        itemIDValue = borrowRecord.MediaID;
      } else {
        return res.status(400).json({ message: 'Invalid borrow record.' });
      }

      // Step 2: Update the borrow record's status to 'Returned' and set ReturnDate
      const currentDate = formatDateToMySQL(new Date());
      const updateBorrowRecordQuery = `
        UPDATE BorrowRecord
        SET Status = 'Returned', ReturnDate = ?, LastUpdated = ?
        WHERE BorrowRecordID = ?
      `;
      db.query(
        updateBorrowRecordQuery,
        [currentDate, currentDate, BorrowRecordID],
        (error, results) => {
          if (error) {
            console.error('Error updating borrow record:', error);
            return res.status(500).json({ message: 'Internal server error.' });
          }

          // Step 3: Update the item's availability back to 'Available'
          const updateItemAvailabilityQuery = `
            UPDATE ${itemTable}
            SET Availability = 'Available'
            WHERE ${itemIDColumn} = ?
          `;
          db.query(
            updateItemAvailabilityQuery,
            [itemIDValue],
            (error, results) => {
              if (error) {
                console.error('Error updating item availability:', error);
                return res.status(500).json({ message: 'Internal server error.' });
              }

              res.status(200).json({ message: 'Item returned successfully!' });
            }
          );
        }
      );
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}