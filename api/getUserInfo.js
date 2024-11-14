const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config({ path: './test.env' });

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

// Function to count active borrow records
const countActiveBorrows = (userID) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) AS activeCount
      FROM BorrowRecord
      WHERE UserID = ? AND Status = 'Active'
    `;
    db.query(query, [userID], (error, results) => {
      if (error) {
        console.error('Error counting active borrows:', error);
        return reject(error);
      }
      const activeCount = results[0].activeCount;
      resolve(activeCount);
    });
  });
};

// Export the API route handler
export default async function handler(req, res) {
  const userID = req.headers['x-user-id'];

  if (!userID) {
    console.error('UserID header missing');
    return res.status(400).json({ error: 'UserID header missing' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    console.error(`Method ${req.method} Not Allowed`);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  console.log(`Fetching user info for UserID: ${userID}`);

  try {
    // Fetch Balance, Suspended status, and BorrowLimit
    const userQuery = `
      SELECT Balance, Suspended, BorrowLimit
      FROM Users
      WHERE UserID = ?
    `;
    const [userResults] = await db.promise().query(userQuery, [userID]);

    if (userResults.length === 0) {
      console.error('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    const balance = parseFloat(userResults[0].Balance);
    const suspended = userResults[0].Suspended === 1; // Convert to boolean
    const borrowLimit = parseInt(userResults[0].BorrowLimit, 10);

    // Count active borrows
    const activeBorrowCount = await countActiveBorrows(userID);

    console.log(
      `User Info - Balance: ${balance}, Suspended: ${suspended}, BorrowLimit: ${borrowLimit}, ActiveBorrows: ${activeBorrowCount}`
    );

    res.status(200).json({
      balance: balance,
      suspended: suspended,
      borrowLimit: borrowLimit,
      activeBorrowCount: activeBorrowCount,
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}