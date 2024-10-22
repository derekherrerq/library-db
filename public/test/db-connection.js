require('dotenv').config({ path: './test.env' });
console.log('DB_USER:', process.env.DB_USER); 
const mysql = require('mysql2');

const connection = mysql.createConnection({

});

// BorrowRecord, Employee, HoldRequest, ItemBook, ItemDevices, ItemMagazine, ItemMedia, Users

const table = 'BorrowRecord';

const sqlSelect = `SELECT * FROM ${table}`;
connection.query(sqlSelect, (err, results) => {
  if (err) {
    console.error(`Error executing query on ${table}:`, err.stack);
    return;
  }
  console.log(`Query results from ${table}:`, results);

  connection.end(err => {
    if (err) {
      return console.error('Error ending the connection:', err);
    }
    console.log('Connection Closed');
  });
});
