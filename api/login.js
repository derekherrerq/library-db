export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    // Dummy user data with roles
    const users = [
      {
        username: 'normaluser',
        password: 'password123',
        role: 'user', // Normal User
      },
      {
        username: 'staffuser',
        password: 'password123',
        role: 'staff', // Staff User
      },
      {
        username: 'adminuser',
        password: 'password123',
        role: 'admin', // Admin User
      },
    ];

    // Find the user
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // In a real application, generate a JWT or session here
      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        token: 'fake-jwt-token', // Replace with real token
        role: user.role, // Include user role
      });
    } else {
      // Authentication failed
      res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      });
    }
  } else {
    // Handle any non-POST requests
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
