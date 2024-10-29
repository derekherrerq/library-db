const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config({ path: './test.env' });
console.log('Database configuration:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
});

// Create a MySQL connection using environment variables
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Function to generate BorrowRecordID
const generateBorrowRecordID = (callback) => {
    const query = `
        SELECT MAX(CAST(SUBSTRING(BorrowRecordID, 3) AS UNSIGNED)) AS maxID 
        FROM BorrowRecord
    `;

    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching max ID:', error);
            return callback(error);
        }

        const maxID = results[0].maxID || 0;
        const newID = `HR${String(maxID + 1).padStart(10, '0')}`; // Generates new ID
        callback(null, newID);
    });
};

// Function to format date to YYYY-MM-DD
const formatDateToMySQL = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format to YYYY-MM-DD
};

// Export the API route handler
export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Log the request body for debugging
        console.log('Received request body:', req.body);

        const { userID, bookISBN, deviceID, magID, mediaID } = req.body;

        // Ensure the required fields are checked
        if (!userID) {
            console.error('Validation failed:', { userID });
            return res.status(400).json({ message: 'User ID is required.' });
        }

        // Create new BorrowRecordID
        generateBorrowRecordID((error, newBorrowRecordID) => {
            if (error) {
                return res.status(500).json({ message: 'Error generating BorrowRecordID.' });
            }

            const createdAt = formatDateToMySQL(new Date()); // Format the current date to YYYY-MM-DD
            const lastUpdated = formatDateToMySQL(new Date()); // Set LastUpdated to current date

            // Automatically set the borrow date to today's date
            const formattedBorrowDate = formatDateToMySQL(new Date());
            // Automatically set the due date to two weeks from today
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 14);
            const formattedDueDate = formatDateToMySQL(dueDate);
            // Set return date to the same as due date
            const formattedReturnDate = formattedDueDate; // Set return date to the due date

            // SQL query to insert the request into the database
            const query = `
                INSERT INTO BorrowRecord (
                    BorrowRecordID, 
                    UserID, 
                    BookISBN, 
                    DeviceID, 
                    MagID, 
                    MediaID, 
                    BorrowDate, 
                    DueDate, 
                    ReturnDate, 
                    FineAmount, 
                    CreatedBy, 
                    CreatedAt,
                    LastUpdated,
                    UpdatedBy
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(query, [
                newBorrowRecordID,
                userID,
                bookISBN || null,  // Set to null if not provided
                deviceID || null,  
                magID || null,     
                mediaID || null,   
                formattedBorrowDate, // Use formatted date for borrow date
                formattedDueDate, 
                formattedReturnDate, //  return date (same as due date)
                0, // FineAmount set to 0
                'user', // CreatedBy set to 'user'
                createdAt, 
                lastUpdated,
                'user' // UpdatedBy set to 'user'
            ], (error, results) => {
                if (error) {
                    console.error('Error inserting request:', error);
                    return res.status(500).json({ message: 'Internal server error.' });
                }
                res.status(201).json({ message: 'Request submitted successfully!' });
            });
        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
