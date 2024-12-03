const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid (already exists in users array)
const isValid = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
};

// Authenticate user by username and password
const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return user.username === username && user.password === password;
    });
    return validusers.length > 0;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({ message: "Error logging in. Username and password are required." });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign(
            { username },
            'access_secret_key',
            { expiresIn: '1h' }
        );

        // Store access token and username in session
        req.session.authorization = {
                accessToken,
                username
        };

        return res.status(200).json({ message: "User successfully logged in" });
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password." });
    }
});

// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;

    if (!review) {
        return res.status(400).json({ message: "Review content is required." });
    }

    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    // Extract username from session
    const username = req.session.authorization?.username;

    if (!username) {
        return res.status(401).json({ message: "Unauthorized access. Please log in." });
    }

    // Initialize reviews if not present
    if (!book.reviews) {
        book.reviews = {};
    }

    // Add or update the user's review for the book
    book.reviews[username] = review;

    return res.status(200).json({ 
        message: "Review added/updated successfully.", 
        reviews: book.reviews 
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
