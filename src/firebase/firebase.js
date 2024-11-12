const admin = require("firebase-admin");
const mysql = require("mysql2");

// Firebase setup
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

// MySQL setup
const db = mysql.createConnection({
  host: "your_host",
  user: "your_user",
  password: "your_password",
  database: "your_database"
});

async function checkForDueSoonOrOverdue() {
  const query = `
    SELECT BorrowRecordID, UserID, DueDate, NotificationSent
    FROM borrowrecords
    WHERE (DATEDIFF(DueDate, NOW()) = 2 OR DATEDIFF(NOW(), DueDate) > 0)
      AND NotificationSent = 0
  `;

  db.query(query, async (error, results) => {
    if (error) throw error;

    for (const record of results) {
      const message = {
        notification: {
          title: DATEDIFF(NOW(), record.DueDate) > 0 ? "Overdue Notice" : "Due Soon Notice",
          body: `Your borrowed item with ID ${record.BorrowRecordID} is ${DATEDIFF(NOW(), record.DueDate) > 0 ? "overdue" : "due soon."}`
        },
        token: `USER_FCM_TOKEN_FOR_${record.UserID}`
      };

      try {
        await admin.messaging().send(message);
        // Mark as notified
        db.query("UPDATE borrowrecords SET NotificationSent = 1 WHERE BorrowRecordID = ?", [record.BorrowRecordID]);
      } catch (err) {
        console.error("Error sending notification:", err);
      }
    }
  });
}

// Run the function on a schedule, e.g., every hour
setInterval(checkForDueSoonOrOverdue, 3600000); // 1 hour in milliseconds
