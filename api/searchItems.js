import mysql from 'mysql2/promise';

export default async function handler(req, res) {
  const { searchTerm, itemType } = req.query;

  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST, // Use environment variables for security
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    let query = '';
    let params = [`%${searchTerm}%`, `%${searchTerm}%`, searchTerm];

    if (itemType === 'Book') {
      query = `
        SELECT 
          Title, 
          Author, 
          ISBN AS Identifier, 
          COUNT(BookID) AS TotalCopies, 
          SUM(CASE WHEN Availability = 'Available' THEN 1 ELSE 0 END) AS AvailableCopies
        FROM 
          ItemBook
        WHERE 
          Title LIKE ? OR 
          Author LIKE ? OR 
          ISBN = ?
        GROUP BY 
          ISBN;
      `;
    } else if (itemType === 'Media') {
      // Similar query for ItemMedia
    } else if (itemType === 'Device') {
      // Similar query for ItemDevices
    } else {
      res.status(400).json({ message: 'Invalid item type' });
      return;
    }

    const [rows] = await connection.execute(query, params);

    await connection.end();

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
