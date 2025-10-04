const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// const { Client } = require('pg')
require("dotenv").config();

const db = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("Connection error:", err.stack));

// const db = new pg.Client({
//     user: "postgres",
//     host: "localhost",
//     database: "book review",
//     password: "!",
//     port: 5432,
// })

db.connect();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));

async function log_books() {
    const result = await db.query("SELECT * FROM books");
    return result.rows;
}


app.get('/', async (req, res) => {
    const books = await log_books();
    res.render('index', { books });
    console.log(books);
});

app.get('/review', (req, res) => {
    res.render('review');});


app.post('/submit-review', async (req, res) => {
    const { title, author, review, isbn, rating } = req.body;
    try {
        const result = await db.query(
            "INSERT INTO books (title, author, review, isbn, rating) VALUES ($1, $2, $3, $4, $5)",
            [title, author, review, isbn, rating]
        );
        console.log('Review submitted:', result.rows[1]);
    }
    catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).send('Internal Server Error');
    }
    res.redirect('/');
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});