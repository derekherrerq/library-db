import mysql from 'mysql2/promise';
import { config } from 'dotenv';

// Load environment variables
config({ path: './test.env' });

// Create a MySQL connection
const connectionConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// Define the API route
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const connection = await mysql.createConnection(connectionConfig);
      const [results] = await connection.execute('SELECT * FROM BorrowRecord');
      await connection.end();
      res.status(200).json(results);
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Failed to fetch borrow records' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`); // Enclosed in backticks
  }
}
