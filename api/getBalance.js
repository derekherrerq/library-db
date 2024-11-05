// pages/api/getBalance.js
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config({ path: './test.env' }); // Load environment variables
console.log('Database configuration:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

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

// Export the API route handler
export default function handler(req, res) {
  // Get userID from custom header
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

  // Log the request for debugging
  console.log(`Fetching balance for UserID: ${userID}`);

  // Query to get the balance for the given userID
  const query = `
    SELECT Balance
    FROM Users
    WHERE UserID = ?
  `;

  db.query(query, [userID], (error, results) => {
    if (error) {
      console.error('Error fetching balance:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    // After fetching the results
    if (results.length > 0) {
      const balance = parseFloat(results[0].Balance);
      console.log(`Balance fetched: ${balance} (Type: ${typeof balance})`);
      res.status(200).json({ balance: balance });
    } else {
      console.error('User not found');
      res.status(404).json({ message: 'User not found' });
    }
  });
}