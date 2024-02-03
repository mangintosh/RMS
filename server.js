// Import necessary modules
const express = require("express");
const { createPool } = require("mysql");
const bodyParser = require("body-parser");

// Create a connection pool
const pool = createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "osr",
  connectionLimit: 10,
});

const app = express();
app.listen(8000, () => {
  console.log("The server is listening to http://localhost:8000");
});

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.set("view engine", "pug");

// Define routes
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/phys', (req, res) => {
  res.render('phys');
});

app.get('/math', (req, res) => {
  res.render('math');
});

app.get('/chem', (req, res) => {
  res.render('chem');
});

app.get('/gs', (req, res) => {
  res.render('gs');
});

app.get('/studies', (req, res) => {
    res.render('studies');
});


app.get('/adminhome', (req, res) => {
    // Fetch user data from the database
    pool.query("SELECT * FROM user", (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
        return;
      }
  
      // Render the adminhome.pug template with the fetched data
      res.render('adminhome', { users: results });
    });
  });


// Handle registration form submission
app.post("/register", (req, res) => {
    const { firstName, lastName, email, password, gender } = req.body;
    // Insert user details into the database
    const insertSql = "INSERT INTO user (first_name, last_name, user_email, user_password, user_gender, user_role) VALUES (?, ?, ?, ?, ?, ?)";
    pool.query(insertSql, [firstName, lastName, email, password, gender, "student"], (error, results, fields) => {
      if (error) {
        console.error(error);
        res.render('register', { error: 'Registration failed. Please try again.' });
        return;
      }
  
      // Redirect to login page after successful registration
      res.redirect("/login");
    });
  });
  
  // Handle login form submission
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Check if the user exists in the database
    const selectSql = "SELECT * FROM user WHERE user_email = ? AND user_password = ?";
    pool.query(selectSql, [email, password], (error, results, fields) => {
      if (error || results.length === 0) {
        console.error(error);
        res.status(401).send('Invalid credentials');
        return;
      }  
      // Redirect to studyhome page after successful login
      if(results[0].user_role == "admin"){
        res.redirect("/adminhome");
      }else
      if(results[0].user_role == "student"){
        res.redirect("/studies");
      }  
    });
  });
  
  // New route to handle user deletion
app.post("/delete-user", (req, res) => {
    const deleteUserId = req.body.deleteUserId;
  
    // Perform the deletion in the database
    const deleteSql = "DELETE FROM user WHERE user_id = ?";
    pool.query(deleteSql, [deleteUserId], (error, results, fields) => {
      if (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
        return;
      }
  
      // Redirect back to adminhome page after deletion
      res.redirect("/adminhome");
    });
  });