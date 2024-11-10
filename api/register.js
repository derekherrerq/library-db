import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './test.env' });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password, firstName, lastName, email, phoneNumber, streetAddress, city, state, zipCode, birthday } = req.body;

    try {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      });

      // Find the highest UserID and increment it
      const [result] = await connection.execute('SELECT MAX(UserID) AS maxUserID FROM Users');
      const maxUserID = result[0].maxUserID || 'U000';
      const newUserID = `U${(parseInt(maxUserID.slice(1)) + 1).toString().padStart(3, '0')}`;

      // Insert the new user into the database, with StartDate as the current date
      const [insertResult] = await connection.execute(
        `INSERT INTO Users (UserID, Username, Password, Role, FirstName, LastName, Email, PhoneNumber, StreetAddress, City, State, ZipCode, BorrowLimit, Balance, Suspended, CreatedBy, UpdatedBy, StartDate, Birthday) 
        VALUES (?, ?, ?, 'Normal', ?, ?, ?, ?, ?, ?, ?, ?, 5, 0.00, 0, 'System', 'System', CURDATE(), ?)`,
        [newUserID, username, password, firstName, lastName, email, phoneNumber, streetAddress, city, state, zipCode, birthday]
      );

      await connection.end();

      res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ success: false, message: 'An error occurred while registering the user' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}