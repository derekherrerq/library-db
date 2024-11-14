const express = require('express');
const mysql = require('mysql2'); 
const router = express.Router();

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'library-db-library-db.i.aivencloud.com',
  user: 'your-username',
  password: 'your-password',
  database: 'library',
  port: 28084,
});

// Middleware for parsing JSON requests
router.use(express.json());

// GET /api/users - Fetch all users
router.get('/users', (req, res) => {
  const query = 'SELECT UserID, name, role FROM Users'; 

  pool.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(results);
  });
});

module.exports = router;
