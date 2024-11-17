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
      const { action, UserID } = req.query;

      if (action === 'getUsers') {
        // Fetch the list of users
        const [users] = await pool.query(`
          SELECT UserID, FirstName, LastName
          FROM Users
          WHERE IsDeleted = 0
          ORDER BY UserID ASC;
        `);
        res.status(200).json(users);
        return;
      }

      // Initialize variables for userInfo and reportData
      let userInfo = null;
      let reportRows = [];

      // Fetch user information if UserID is provided
      if (UserID) {
        const [userInfoRows] = await pool.query(
          `
          SELECT UserID, FirstName, LastName, Email, PhoneNumber, Balance AS UserBalance
          FROM Users
          WHERE UserID = ? AND IsDeleted = 0
        `,
          [UserID]
        );
        if (userInfoRows.length > 0) {
          userInfo = userInfoRows[0];
        } else {
          // If the user is not found, return an empty report
          res.status(200).json({ userInfo: null, reportRows: [] });
          return;
        }
      } else {
        // If UserID is not provided, return an empty report
        res.status(200).json({ userInfo: null, reportRows: [] });
        return;
      }

      // Proceed to fetch the User Fines Report without sensitive fields
      let query = `
        SELECT
          u.UserID,
          u.FirstName,
          u.LastName,
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
          u.IsDeleted = 0
          AND u.UserID = ?
      `;

      const params = [UserID];

      // Remove the restrictive condition
      // query += `
      //   AND (
      //     u.Balance > 0 OR
      //     (br.FineAmount IS NOT NULL AND br.FineAmount > 0)
      //   )
      // `;

      query += ' ORDER BY br.BorrowDate DESC;';

      const [rows] = await pool.query(query, params);

      // Assign reportRows for the response
      reportRows = rows;

      // Send both userInfo and reportRows to the frontend
      res.status(200).json({ userInfo, reportRows });
    } catch (error) {
      console.error('Error in userFinesReport:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}