const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: './test.env' });

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { userID } = req.query;

    if (!userID) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    try {
      const [rows] = await db.query(
        `
        SELECT 
          br.BorrowRecordID,
          br.UserID,
          CASE
            WHEN br.BookISBN IS NOT NULL THEN 'Book'
            WHEN br.DeviceID IS NOT NULL THEN 'Device'
            WHEN br.MagID IS NOT NULL THEN 'Magazine'
            WHEN br.MediaID IS NOT NULL THEN 'Media'
          END AS ItemType,
          COALESCE(br.BookISBN, br.DeviceID, br.MagID, br.MediaID) AS ItemID,
          br.BorrowDate,
          br.DueDate,
          br.ReturnDate,
          br.FineAmount,
          br.Status
        FROM BorrowRecord br
        WHERE br.UserID = ? AND br.IsDeleted = 0
        `,
        [userID]
      );

      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching borrowed items:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}