  const express = require('express');
  const bodyParser = require('body-parser');
  const cors = require('cors');
  const { Pool } = require('pg'); // PostgreSQL library

  const app = express();
  const port = 5000;
  const apiKey = "AIzaSyBzPFSyyUko1TRyhRb26FyIGt0j5epyDGU"; 


  // PostgreSQL connection
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'MyOptiRoute',
    password: 'Armoury@1939',
    port: 5432, // Default PostgreSQL port
  });

  // Middleware
  app.use(cors());
  app.use(bodyParser.json());

  // Login route
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing email or password" });
    }

    try {
      // Query user by email 
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

      // Empty submission condition
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }

      const user = result.rows[0];

      // Password does not match
      if (password !== user.password) {
        return res.status(401).json({ success: false, message: "Invalid password" });
      }
      // Extract the userid and save it to a local storage
      const userID = user.userid;

      console.log('Fetched user:', user);

      res.json({
        success: true,
        message: "Login successful!",
        userID, 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });


  // Route for registering users
  app.post('/register', async (req, res) => {
      const { name, email, password } = req.body;
      console.log('Received data:', { name, email, password }); 

      // Check if any required field is missing
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Missing name, email or password" });
      }
    
      try {
        // Check if email already exists
        const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
          return res.status(400).json({ success: false, message: "Email already exists" });
        }
    
        // Get the next available ID
        const result = await pool.query('SELECT COALESCE(MAX(userid), 0) + 1 AS next_id FROM users');
        const nextId = result.rows[0].next_id;
        console.log('Received data:', { nextId }); 

        // Insert new user with the calculated ID
        const insertResult = await pool.query(
          'INSERT INTO users (userid, name, email, password) VALUES ($1, $2, $3, $4)',
          [nextId, name, email, password]
        );
    
        // Send response
        res.json({ success: true, message: "User registered successfully!" });
      } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });


    //Search.tsx
    app.get('/travelHistory', async (req, res) => {
      const userID = req.query.userID; // Extract userID from query params
      console.log('Received UserID:', userID); // Debugging log
    
      if (!userID) {
        return res.status(400).json({ error: 'UserID is required' });
      }
    
      try {
        const query = `
          SELECT 
            TH."historyid", 
            TH."traveldate", 
            TH."userid", 
            R."startlocation", 
            R."endlocation", 
            R."distance", 
            R."travelduration",
            R."travelcost"
          FROM 
            travelhistory AS TH 
          JOIN 
            routes AS R
          ON 
            TH."routeid" = R."routeid"
          WHERE 
            TH."userid" = $1;
        `;
    
        console.log(`Executing SQL Query:\n${query}\nWith userID: ${userID}`);
        
        const result = await pool.query(query, [userID]);
        console.log('Query Result:', result.rows);
        
        res.json(result.rows);
      } catch (error) {
        console.error('Error fetching travel history:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    });


    // Endpoint to get user preferences
    app.get('/preferences', async (req, res) => {
      const { userID } = req.query; // Extract userID from query
    
      if (!userID) {
        console.error('Missing userID in query');
        return res.status(400).json({ message: 'Missing userID in query' });
      }
    
      console.log('Request to /preferences for userID:', userID); // Log the incoming request
    
      try {
        const result = await pool.query(
          'SELECT restaurants, attractions AS touristAttractions, malls, hotels, schools FROM recommendations WHERE userid = $1',
          [userID]
        );
        console.log('Database query result:', result.rows); // Log database response
    
        if (result.rows.length > 0) {
          res.json(result.rows[0]); // Return the user's preferences
        } else {
          console.warn('No preferences found for userID:', userID);
          res.status(404).json({ message: 'User preferences not found' });
        }
      } catch (error) {
        console.error('Server Error:', error.message); // Add error logging
        res.status(500).json({ message: 'Server error' });
      }
    });
    // Endpoint to update user preferences
    app.post('/preferences', async (req, res) => {
      const userID = parseInt(req.query.userID, 10);
      const { preferenceField } = req.body;
    
      if (!userID) return res.status(400).json({ message: 'Missing userID' });
      if (!preferenceField) return res.status(400).json({ message: 'Missing preferenceField' });
    
      const validFields = ['restaurants', 'attractions', 'malls', 'hotels', 'schools'];
      if (!validFields.includes(preferenceField)) return res.status(400).json({ message: 'Invalid preferenceField' });
    
      try {
        const query = `UPDATE recommendations SET ${preferenceField} = NOT ${preferenceField} WHERE userid = $1 RETURNING *;`;
        const result = await pool.query(query, [userID]);
    
        if (result.rows.length === 0) return res.status(404).json({ message: 'User preferences not found' });
    
        res.json({ message: 'Preference toggled successfully', preferences: result.rows[0] });
      } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    

    // Start server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });