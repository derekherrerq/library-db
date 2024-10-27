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
  database: process.env.DB_NAME,
};

// Allowed tables and their primary keys
const allowedTables = {
  BorrowRecord: 'BorrowRecordID',
  ItemBook: 'BookID',
  ItemDevices: 'DeviceID',
  ItemMagazine: 'MagazineID',
  ItemMedia: 'MediaID',
};

// Date fields for each table
const dateFields = {
  BorrowRecord: ['BorrowDate', 'DueDate', 'ReturnDate'],
  ItemBook: ['PublishedDate'],
  ItemDevices: ['Warranty'],
  ItemMagazine: ['PublishDate'],
  ItemMedia: [],
};

function isDateField(field, table) {
  return dateFields[table] && dateFields[table].includes(field);
}

function formatDateForMySQL(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  const yyyy = date.getFullYear();
  const mm = ('0' + (date.getMonth() + 1)).slice(-2);
  const dd = ('0' + date.getDate()).slice(-2);
  return `${yyyy}-${mm}-${dd}`;
}

export default async function handler(req, res) {
  const { table } = req.query; // Get the 'table' query parameter

  if (!allowedTables[table]) {
    return res.status(400).json({ error: 'Invalid table parameter' });
  }

  const primaryKey = allowedTables[table];

  try {
    const connection = await mysql.createConnection(connectionConfig);

    if (req.method === 'GET') {
      // Fetch data based on the specified table
      const [results] = await connection.execute(`SELECT * FROM ${table}`);
      await connection.end();
      res.status(200).json(results);
    } else if (req.method === 'POST') {
      // Create a new record
      const data = req.body;

      // Exclude 'CreatedAt', 'CreatedBy', 'LastUpdated', 'UpdatedBy' from data
      delete data.CreatedAt;
      delete data.CreatedBy;
      delete data.LastUpdated;
      delete data.UpdatedBy;

      // Process date fields
      for (const field in data) {
        if (isDateField(field, table)) {
          data[field] = formatDateForMySQL(data[field]);
        }
      }

      const fields = Object.keys(data);
      const values = Object.values(data);

      const placeholders = fields.map(() => '?').join(', ');

      const sql = `INSERT INTO ${table} (${fields.join(', ')}, CreatedAt, CreatedBy, LastUpdated, UpdatedBy) VALUES (${placeholders}, NOW(), 'admin', NOW(), 'admin')`;

      await connection.execute(sql, values);
      await connection.end();
      res.status(201).json({ message: 'Record created successfully' });
    } else if (req.method === 'PUT') {
      // Update an existing record
      const data = req.body;

      if (!data[primaryKey]) {
        await connection.end();
        return res.status(400).json({ error: 'Primary key is missing' });
      }

      const keyValue = data[primaryKey];

      // Exclude 'CreatedAt', 'CreatedBy', 'LastUpdated', 'UpdatedBy' from being updated
      const fields = Object.keys(data).filter(
        (key) =>
          key !== primaryKey &&
          key !== 'CreatedAt' &&
          key !== 'CreatedBy' &&
          key !== 'LastUpdated' &&
          key !== 'UpdatedBy'
      );

      // Process date fields
      const values = fields.map((field) => {
        let value = data[field];
        if (isDateField(field, table)) {
          value = formatDateForMySQL(value);
        }
        return value;
      });

      values.push('admin'); // UpdatedBy
      values.push(keyValue);

      const setClause = fields.map((field) => `${field} = ?`).join(', ');
      const sql = `UPDATE ${table} SET ${setClause}, LastUpdated = NOW(), UpdatedBy = ? WHERE ${primaryKey} = ?`;

      await connection.execute(sql, values);
      await connection.end();
      res.status(200).json({ message: 'Record updated successfully' });
    } else if (req.method === 'DELETE') {
      // Delete a record
      const data = req.body;

      if (!data[primaryKey]) {
        await connection.end();
        return res.status(400).json({ error: 'Primary key is missing' });
      }

      const keyValue = data[primaryKey];

      const sql = `DELETE FROM ${table} WHERE ${primaryKey} = ?`;

      await connection.execute(sql, [keyValue]);
      await connection.end();
      res.status(200).json({ message: 'Record deleted successfully' });
    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'Failed to execute query' });
  }
}