const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up the SQLite database
const db = new sqlite3.Database(":memory:");

db.serialize(() => {
    db.run(
        "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, first_name TEXT, last_name TEXT, email TEXT, password TEXT, phone_number TEXT)",
    );
    db.run(
        "CREATE TABLE subscribers (id INTEGER PRIMARY KEY AUTOINCREMENT, firstname TEXT, email TEXT)",
    );
    db.run(
        "CREATE TABLE feedback (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT, experience TEXT, improvements TEXT)",
    );
});

// Serve static files
app.use(express.static("public"));

// Handle sign-up form submission
app.post("/signup", (req, res) => {
    const {
        first_name,
        last_name,
        email,
        password,
        confirm_password,
        phone_number,
    } = req.body;

    // Backend validation
    const nameRegex = /^[A-Za-z]+$/;
    const phoneRegex = /^\d{10}$/;
    const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!nameRegex.test(first_name) || !nameRegex.test(last_name)) {
        return res
            .status(400)
            .send("First and last names should only contain letters.");
    }

    if (password !== confirm_password) {
        return res.status(400).send("Passwords do not match.");
    }

    if (!passwordRegex.test(password)) {
        return res
            .status(400)
            .send(
                "Password should be at least 8 characters long and contain a number and a special character.",
            );
    }

    if (!phoneRegex.test(phone_number)) {
        return res
            .status(400)
            .send("Phone number should be exactly 10 digits.");
    }

    db.run(
        "INSERT INTO users (first_name, last_name, email, password, phone_number) VALUES (?, ?, ?, ?, ?)",
        [first_name, last_name, email, password, phone_number],
        function (err) {
            if (err) {
                return res.status(500).send("Error saving user to database");
            }
            res.send("Thank you for signing up!");
        },
    );
});

// Handle subscribe form submission
app.post("/subscribe", (req, res) => {
    const { firstname, email } = req.body;
    db.run(
        "INSERT INTO subscribers (firstname, email) VALUES (?, ?)",
        [firstname, email],
        function (err) {
            if (err) {
                return res
                    .status(500)
                    .send("Error saving subscriber to database");
            }
            res.send("Thank you for subscribing!");
        },
    );
});

// Handle feedback form submission
app.post("/submit-feedback", (req, res) => {
    const { name, email, experience, improvements } = req.body;

    console.log("Received Feedback:", req.body); // Log the received feedback data

    db.run(
        "INSERT INTO feedback (name, email, experience, improvements) VALUES (?, ?, ?, ?)",
        [name, email, experience, improvements],
        function (err) {
            if (err) {
                console.error("Error saving feedback to database:", err); // Log the error
                return res
                    .status(500)
                    .send("Error saving feedback to database");
            }
            res.json({ success: true });
        },
    );
});

// Route to fetch and display user data
app.get("/users", (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            return res.status(500).send("Error retrieving users from database");
        }
        res.json(rows);
    });
});

// Route to fetch and display subscriber data
app.get("/subscribers", (req, res) => {
    db.all("SELECT * FROM subscribers", [], (err, rows) => {
        if (err) {
            return res
                .status(500)
                .send("Error retrieving subscribers from database");
        }
        res.json(rows);
    });
});

// Route to fetch and display feedback data
app.get("/feedback", (req, res) => {
    db.all("SELECT * FROM feedback", [], (err, rows) => {
        if (err) {
            return res
                .status(500)
                .send("Error retrieving feedback from database");
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


/*const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up the SQLite database
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, first_name TEXT, last_name TEXT, email TEXT, password TEXT, phone_number TEXT)');
    db.run('CREATE TABLE subscribers (id INTEGER PRIMARY KEY AUTOINCREMENT, firstname TEXT, email TEXT)');
});

// Serve static files
app.use(express.static('public'));

// Handle sign-up form submission
app.post('/signup', (req, res) => {
    const { first_name, last_name, email, password, confirm_password, phone_number } = req.body;

    // Backend validation
    const nameRegex = /^[A-Za-z]+$/;
    const phoneRegex = /^\d{10}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!nameRegex.test(first_name) || !nameRegex.test(last_name)) {
        return res.status(400).send('First and last names should only contain letters.');
    }

    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match.');
    }

    if (!passwordRegex.test(password)) {
        return res.status(400).send('Password should be at least 8 characters long and contain a number and a special character.');
    }

    if (!phoneRegex.test(phone_number)) {
        return res.status(400).send('Phone number should be exactly 10 digits.');
    }

    db.run('INSERT INTO users (first_name, last_name, email, password, phone_number) VALUES (?, ?, ?, ?, ?)', [first_name, last_name, email, password, phone_number], function(err) {
        if (err) {
            return res.status(500).send('Error saving user to database');
        }
        res.send('Thank you for signing up!');
    });
});

// Handle subscribe form submission
app.post('/subscribe', (req, res) => {
    const { firstname, email } = req.body;
    db.run('INSERT INTO subscribers (firstname, email) VALUES (?, ?)', [firstname, email], function(err) {
        if (err) {
            return res.status(500).send('Error saving subscriber to database');
        }
        res.send('Thank you for subscribing!');
    });
});

// Handle login form submission
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
        if (err) {
            return res.status(500).send('Error checking credentials');
        }
        if (row) {
            res.send('Login successful');
        } else {
            res.status(400).send('Invalid email or password');
        }
    });
});

// Route to fetch and display user data
app.get('/users', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) {
            return res.status(500).send('Error retrieving users from database');
        }
        res.json(rows);
    });
});

// Route to fetch and display subscriber data
app.get('/subscribers', (req, res) => {
    db.all('SELECT * FROM subscribers', [], (err, rows) => {
        if (err) {
            return res.status(500).send('Error retrieving subscribers from database');
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
*/