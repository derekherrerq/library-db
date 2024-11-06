import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './test.env' }); // Load environment variables

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    try {
      // Connect to the database using environment variables
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });

      // Query the database for the user with matching username and password
      const [rows] = await connection.execute(
        'SELECT Username, Password, Role, UserID FROM Users WHERE Username = ? AND Password = ?',
        [username, password]
      );

      // Close the connection
      await connection.end();

      if (rows.length > 0) {
        const user = rows[0];

        // Respond with success
        res.status(200).json({
          success: true,
          message: 'Logged in successfully',
          token: 'fake-jwt-token', // Replace with a real token if needed
          role: user.Role, // User role
          userID: user.UserID, // User ID
        });
      } else {
        // Authentication failed
        res.status(401).json({
          success: false,
          message: 'Invalid username or password',
        });
      }
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({
        success: false,
        message: 'An error occurred while logging in',
      });
    }
  } else {
    // Handle non-POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}