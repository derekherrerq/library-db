import mysql from 'mysql2/promise';
import { config } from 'dotenv';

// Load environment variables
config({ path: './test.env' });

// Create a MySQL connection
const connectionConfig = {
 // hello there's clearly changes 
};

// Define the API route
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const connection = await mysql.createConnection(connectionConfig);
      // Change the SQL query to select from BorrowRecord
      const [results] = await connection.execute('SELECT * FROM BorrowRecord');
      await connection.end();
      res.status(200).json(results);
    } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Failed to fetch borrow records' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
