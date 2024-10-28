exports.checkHoldNotifications = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    try {
      const db = await mysql.createConnection(dbConfig);
      const [holds] = await db.execute(`
        SELECT user_token, item_name
        FROM holds
        WHERE available = TRUE
      `);
  
      for (const hold of holds) {
        const title = "Held Item Available";
        const body = `Good news! Your held item "${hold.item_name}" is now available for pickup.`;
  
        await sendNotification(hold.user_token, title, body);
      }
      console.log("Hold notifications processed.");
    } catch (error) {
      console.error("Error processing hold notifications:", error);
    }
  });