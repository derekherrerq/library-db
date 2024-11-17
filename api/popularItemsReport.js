// src/pages/api/popularItemsReport.js
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
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    try {
      // Popular Books
      const [popularBooks] = await pool.query(`
        SELECT 
          ib.Title,
          ib.Author,
          COUNT(br.BorrowRecordID) AS BorrowCount
        FROM 
          BorrowRecord br
        JOIN 
          ItemBook ib ON br.BookISBN = ib.ISBN
        WHERE 
          br.BorrowDate BETWEEN ? AND ?
          AND br.IsDeleted = 0
          AND ib.IsDeleted = 0
        GROUP BY 
          ib.BookID, ib.Title, ib.Author
        ORDER BY 
          BorrowCount DESC
        LIMIT 10;
      `, [startDate, endDate]);

      // Popular Devices
      const [popularDevices] = await pool.query(`
        SELECT 
          id.Title,
          id.Brand,
          id.Model,
          COUNT(br.BorrowRecordID) AS BorrowCount
        FROM 
          BorrowRecord br
        JOIN 
          ItemDevices id ON br.DeviceID = id.DeviceID
        WHERE 
          br.BorrowDate BETWEEN ? AND ?
          AND br.IsDeleted = 0
          AND id.IsDeleted = 0
        GROUP BY 
          id.DeviceID, id.Title, id.Brand, id.Model
        ORDER BY 
          BorrowCount DESC
        LIMIT 10;
      `, [startDate, endDate]);

      // Popular Magazines
      const [popularMagazines] = await pool.query(`
        SELECT 
          im.Title,
          im.Author,
          COUNT(br.BorrowRecordID) AS BorrowCount
        FROM 
          BorrowRecord br
        JOIN 
          ItemMagazine im ON br.MagID = im.MagazineID
        WHERE 
          br.BorrowDate BETWEEN ? AND ?
          AND br.IsDeleted = 0
          AND im.IsDeleted = 0
        GROUP BY 
          im.MagazineID, im.Title, im.Author
        ORDER BY 
          BorrowCount DESC
        LIMIT 10;
      `, [startDate, endDate]);

      // Popular Media
      const [popularMedia] = await pool.query(`
        SELECT 
          imd.Title,
          imd.Director,
          imd.MediaType,
          COUNT(br.BorrowRecordID) AS BorrowCount
        FROM 
          BorrowRecord br
        JOIN 
          ItemMedia imd ON br.MediaID = imd.MediaID
        WHERE 
          br.BorrowDate BETWEEN ? AND ?
          AND br.IsDeleted = 0
          AND imd.IsDeleted = 0
        GROUP BY 
          imd.MediaID, imd.Title, imd.Director, imd.MediaType
        ORDER BY 
          BorrowCount DESC
        LIMIT 10;
      `, [startDate, endDate]);

      res.status(200).json({
        popularBooks,
        popularDevices,
        popularMagazines,
        popularMedia,
      });
    } catch (error) {
      console.error('Error fetching Popular Items Report:', error);
      res.status(500).json({ error: 'Failed to fetch Popular Items Report' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}



