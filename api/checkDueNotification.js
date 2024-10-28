exports.checkDueNotifications = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
    const dueSoonIntervalDays = 2;
    const today = dayjs();
    const dueSoonDate = today.add(dueSoonIntervalDays, 'day').format('YYYY-MM-DD');
  
    try {
      const db = await mysql.createConnection(dbConfig);
      const [items] = await db.execute(`
        SELECT user_token, item_name, due_date
        FROM items
        WHERE due_date <= ? AND returned = FALSE
      `, [dueSoonDate]);
  
      for (const item of items) {
        const dueDate = dayjs(item.due_date);
        const isOverdue = dueDate.isBefore(today);
        const title = isOverdue ? "Overdue Item Notification" : "Item Due Soon";
        const body = isOverdue
          ? `Your item "${item.item_name}" was due on ${dueDate.format('MMMM D')}. Please return it to avoid fines.`
          : `Reminder: Your item "${item.item_name}" is due on ${dueDate.format('MMMM D')}. Please return it by then to avoid fines.`;
  
        await sendNotification(item.user_token, title, body);
      }
      console.log("Due notifications processed.");
    } catch (error) {
      console.error("Error processing due notifications:", error);
    }
  });