require('dotenv').config();

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'library-db-library-db.i.aivencloud.com',
  port: 28084,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'db'
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database.');
});
