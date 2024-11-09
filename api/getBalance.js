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

// Export the API route handler
export default function handler(req, res) {
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

  console.log(`Fetching balance and suspension status for UserID: ${userID}`);

  const query = `
    SELECT Balance, Suspended
    FROM Users
    WHERE UserID = ?
  `;

  db.query(query, [userID], (error, results) => {
    if (error) {
      console.error('Error fetching balance and suspension status:', error);
      return res.status(500).json({ message: 'Internal server error.' });
    }

    if (results.length > 0) {
      const balance = parseFloat(results[0].Balance);
      const suspended = results[0].Suspended === 1; // Convert to boolean
      console.log(`Balance fetched: ${balance} (Type: ${typeof balance}), Suspended: ${suspended}`);
      res.status(200).json({ balance: balance, suspended: suspended });
    } else {
      console.error('User not found');
      res.status(404).json({ message: 'User not found' });
    }
  });
}