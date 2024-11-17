// annualCostReport.js
import mysql from 'mysql2/promise';
import { config } from 'dotenv';

config({ path: './test.env' });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Mapping of categories to their respective ID columns
const idFieldMap = {
  Book: 'BookID',
  Device: 'DeviceID',
  Magazine: 'MagazineID',
  Media: 'MediaID',
};

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { startDate, endDate, categories } = req.query;

    console.log('Received AnnualCostReport request with:', { startDate, endDate, categories });

    if (!startDate || !endDate) {
      console.log('Missing startDate or endDate');
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    // Parse categories into an array
    const selectedCategories = categories ? categories.split(',') : ['Book', 'Device', 'Magazine', 'Media'];
    console.log('Selected Categories:', selectedCategories);

    if (selectedCategories.length === 0) {
      console.log('No categories selected');
      return res.status(400).json({ error: 'At least one category must be selected' });
    }

    try {
      // Build dynamic query based on selected categories
      let itemsQuery = '';
      const queryParams = [];

      const categoryQueries = selectedCategories.map((category) => {
        const trimmedCategory = category.trim();
        let tableName = '';
        let idField = '';

        switch (trimmedCategory) {
          case 'Book':
            tableName = 'ItemBook';
            idField = idFieldMap.Book;
            break;
          case 'Device':
            tableName = 'ItemDevices';
            idField = idFieldMap.Device;
            break;
          case 'Magazine':
            tableName = 'ItemMagazine';
            idField = idFieldMap.Magazine;
            break;
          case 'Media':
            tableName = 'ItemMedia';
            idField = idFieldMap.Media;
            break;
          default:
            console.log(`Unknown category: ${trimmedCategory}`);
            return '';
        }

        queryParams.push(startDate, endDate);

        return `
          SELECT '${trimmedCategory}' AS ItemType, ${idField} AS ItemID, Title, Cost, CreatedAt
          FROM ${tableName}
          WHERE CreatedAt BETWEEN ? AND ? AND IsDeleted = 0
        `;
      });

      // Filter out any empty queries (in case of unknown categories)
      const validCategoryQueries = categoryQueries.filter(q => q !== '');

      if (validCategoryQueries.length === 0) {
        console.log('No valid categories to query');
        return res.status(400).json({ error: 'No valid categories selected' });
      }

      itemsQuery = validCategoryQueries.join(' UNION ALL ');
      console.log('Constructed Items Query:', itemsQuery);

      // Fetch items
      const [items] = await pool.query(itemsQuery, queryParams);
      console.log('Fetched Items:', items);

      // Calculate total cost per category
      const totalCostPromises = selectedCategories.map(async (category) => {
        const trimmedCategory = category.trim();
        const tableName = idFieldMap.hasOwnProperty(trimmedCategory) ? Object.keys(idFieldMap).find(key => key === trimmedCategory) : null;
        if (!tableName) {
          console.log(`Unknown category for total cost calculation: ${trimmedCategory}`);
          return { category: trimmedCategory, totalCost: 0 };
        }

        const actualTableName = (() => {
          switch (trimmedCategory) {
            case 'Book':
              return 'ItemBook';
            case 'Device':
              return 'ItemDevices';
            case 'Magazine':
              return 'ItemMagazine';
            case 'Media':
              return 'ItemMedia';
            default:
              return null;
          }
        })();

        if (!actualTableName) {
          console.log(`Unknown table name for category: ${trimmedCategory}`);
          return { category: trimmedCategory, totalCost: 0 };
        }

        const [result] = await pool.query(
          `SELECT SUM(Cost) AS TotalCost FROM ${actualTableName} WHERE CreatedAt BETWEEN ? AND ? AND IsDeleted = 0`,
          [startDate, endDate]
        );
        console.log(`Total Cost for ${trimmedCategory}:`, result[0].TotalCost);
        return { category: trimmedCategory, totalCost: result[0].TotalCost || 0 };
      });

      const totalCosts = await Promise.all(totalCostPromises);
      console.log('Total Costs:', totalCosts);

      res.status(200).json({ totalCosts, items });
    } catch (error) {
      console.error('Error fetching annual cost report:', error);
      res.status(500).json({ error: 'Failed to fetch annual cost report' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
