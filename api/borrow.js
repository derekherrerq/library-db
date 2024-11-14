const express = require('express');
const router = express.Router();
const db = require('../db');

// Borrow limits based on user roles
const USER_LIMITS = {
  student: 5,
  faculty: 10,
};

// Endpoint to handle borrowing an item
router.post('/borrow', async (req, res) => {
  const { UserID, MediaID, DueDate } = req.body; 

  // Validate request body
  if (!UserID || !MediaID || !DueDate) {
    return res.status(400).json({ error: 'UserID, MediaID, and DueDate are required.' });
  }

  try {
    // Check the user's role 
    const user = await db.getUserById(UserID); 
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const userRole = user.role; // Assuming user object contains the role
    const currentBorrowedCount = await db.getCurrentBorrowedCount(UserID); 

    // Check borrowing limits
    if (currentBorrowedCount >= USER_LIMITS[userRole]) {
      return res.status(403).json({ error: `Borrow limit reached for ${userRole}.` });
    }

    // Insert the new borrow record into the database
    const borrowRecord = {
      UserID,
      MediaID,
      BorrowDate: new Date().toISOString(),
      DueDate,
    };

    await db.insertBorrowRecord(borrowRecord); 

    res.status(201).json({ message: 'Item borrowed successfully.', borrowRecord });
  } catch (error) {
    console.error('Error borrowing item:', error);
    res.status(500).json({ error: 'An error occurred while processing the borrow request.' });
  }
});

module.exports = router;
