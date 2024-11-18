import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './test.env' });

// Create a MySQL connection pool (persistent connection)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Export the API route handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const userID = req.query.userID;
  const { paymentAmount } = req.body;

  // Basic validation
  if (!userID) {
    return res.status(400).json({ message: 'UserID query parameter missing' });
  }

  if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
    return res.status(400).json({ message: 'Invalid payment amount.' });
  }

  try {
    // Fetch current Balance and Suspended status
    const [userResults] = await pool.execute(
      'SELECT Balance, Suspended FROM Users WHERE UserID = ?',
      [userID]
    );

    if (userResults.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const currentBalance = parseFloat(userResults[0].Balance);
    const isSuspended = userResults[0].Suspended === 1;

    // Calculate new Balance
    const newBalance = parseFloat((currentBalance - parseFloat(paymentAmount)).toFixed(2));

    // Determine new Suspended status
    const newSuspendedStatus = newBalance > 0 ? 1 : 0;

    // Update Balance and Suspended status in the database
    const [updateResult] = await pool.execute(
      'UPDATE Users SET Balance = ?, Suspended = ? WHERE UserID = ?',
      [newBalance.toFixed(2), newSuspendedStatus, userID]
    );

    // Check if the update was successful
    if (updateResult.affectedRows === 0) {
      return res.status(500).json({ message: 'Failed to update user balance.' });
    }

    // Respond with success message and new balance
    res.status(200).json({
      message: 'Payment processed successfully.',
      newBalance: newBalance.toFixed(2),
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
}