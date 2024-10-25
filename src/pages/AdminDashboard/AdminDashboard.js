import React from 'react';

const AdminDashboard = () => (
  <div>
    <h1>Admin Dashboard</h1>
    <p>Welcome, Admin User!</p>
    <p>I'm making changes</p>
  </div>
);
const getUserBorrowCount = (userID, callback) => {
  const sql = `SELECT COUNT(*) AS count FROM BorrowRecord WHERE UserID = ?`;
  connection.query(sql, [userID], (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null, results[0].count);
  });
};

const checkBorrowLimit = (userID, userType, callback) => {
  const limit = userType === 'student' ? 5 : 10; // Borrowing limit
  getUserBorrowCount(userID, (err, borrowCount) => {
    if (err) return callback(err);
    if (borrowCount >= limit) {
      return callback(new Error(`User has exceeded the borrow limit of ${limit} items.`));
    }
    callback(null, true);
  });
};

const getBorrowDuration = (userType) => {
  return userType === 'student' ? 7 : 14; // Days
};

const borrowItem = (userID, userType, itemID, itemType, callback) => {
  checkBorrowLimit(userID, userType, (err, allowed) => {
    if (err) return callback(err);

    const borrowDuration = getBorrowDuration(userType);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + borrowDuration);

    const sql = `INSERT INTO BorrowRecord (UserID, ItemID, ItemType, DueDate) VALUES (?, ?, ?, ?)`;
    connection.query(sql, [userID, itemID, itemType, dueDate], (err, result) => {
      if (err) return callback(err);
      callback(null, `Item borrowed successfully, due on ${dueDate.toISOString().split('T')[0]}`);
    });
  });
};


export default AdminDashboard;
