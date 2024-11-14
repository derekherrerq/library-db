import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config({ path: './test.env' });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query(`
        SELECT
          u.UserID,
          u.FirstName,
          u.LastName,
          u.Email,
          u.PhoneNumber,
          u.Balance AS UserBalance,
          br.BorrowRecordID,
          br.BorrowDate,
          br.DueDate,
          br.ReturnDate,
          br.FineAmount,
          br.Status,
          COALESCE(ib.Title, id.Title, im.Title, ima.Title) AS ItemTitle,
          CASE
            WHEN ib.Title IS NOT NULL THEN 'Book'
            WHEN id.Title IS NOT NULL THEN 'Device'
            WHEN im.Title IS NOT NULL THEN 'Media'
            WHEN ima.Title IS NOT NULL THEN 'Magazine'
          END AS ItemType
        FROM
          Users u
        LEFT JOIN BorrowRecord br ON u.UserID = br.UserID AND br.IsDeleted = 0
        LEFT JOIN ItemBook ib ON br.BookISBN = ib.ISBN AND ib.IsDeleted = 0
        LEFT JOIN ItemDevices id ON br.DeviceID = id.DeviceID AND id.IsDeleted = 0
        LEFT JOIN ItemMedia im ON br.MediaID = im.MediaID AND im.IsDeleted = 0
        LEFT JOIN ItemMagazine ima ON br.MagID = ima.MagazineID AND ima.IsDeleted = 0
        WHERE
          (u.Balance > 0 OR br.FineAmount > 0) AND u.IsDeleted = 0
        ORDER BY
          u.UserID,
          br.BorrowDate DESC;
      `);

      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching user fines report:', error);
      res.status(500).json({ error: 'Failed to fetch user fines report' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}