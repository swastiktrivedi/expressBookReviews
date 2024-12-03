const express = require('express');
const axios = require('axios'); // Import Axios
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Helper function to check if a user already exists
const doesExist = (username) => {
  return users.some(user => user.username === username);
};

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!doesExist(username)) {
      // Add the new user to the users array
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login." });
    } else {
      return res.status(400).json({ message: "User already exists!" });
    }
  }
  // Return error if username or password is missing
  return res.status(400).json({ message: "Unable to register user. Missing username or password." });
});

// Get the book list available in the shop using Promise-based callback
public_users.get('/books-promise', (req, res) => {
  // Simulate fetching books using a Promise
  new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject("No books found");
    }
  })
    .then(bookList => res.status(200).json(bookList))
    .catch(err => res.status(500).json({ error: err }));
});

// Get the book list available in the shop using async-await with Axios
public_users.get('/books-async', async (req, res) => {
  try {
    // Simulate a call to an external API
    const response = await axios.get('https://api.example.com/books'); // Replace with your API URL
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching book data" });
  }
});

// Get book details based on ISBN using async-await with Axios
public_users.get('/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const book = books[isbn]; // Search book locally first
    if (book) {
      return res.status(200).json(book);
    }
    
    // If book not found locally, fetch from external API
    const response = await axios.get(`https://api.example.com/book/${isbn}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
});

// Get book details based on author using async-await with Axios
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author;

  try {
    // Search books locally first
    const matchingBooks = Object.values(books).filter(book => book.author === author);
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    }

    // If no books found locally, fetch from external API
    const response = await axios.get(`https://api.example.com/author/${author}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: `No books found by author ${author}.` });
  }
});

// Get all books based on title using async-await with Axios
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title;

  try {
    // Search books locally first
    const matchingBooks = Object.values(books).filter(book => book.title.toLowerCase().includes(title.toLowerCase()));
    if (matchingBooks.length > 0) {
      return res.status(200).json(matchingBooks);
    }

    // If no books found locally, fetch from external API
    const response = await axios.get(`https://api.example.com/title/${title}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(404).json({ message: `No books found with title "${title}".` });
  }
});

// Get book reviews using async-await with Axios
public_users.get('/review/:isbn', async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const book = books[isbn];

    if (book && book.reviews) {
      return res.status(200).json(book.reviews);
    } else if (book) {
      return res.status(200).json({ message: "No reviews available for this book." });
    } else {
      const response = await axios.get(`https://api.example.com/book/review/${isbn}`);
      res.status(200).json(response.data);
    }
  } catch (error) {
    res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }
});

module.exports.general = public_users;
