const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User.js'); // Assuming you have a User model
const { isEmail } = require('validator');
// Register route
router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      req.flash('error', 'Username already exists');
      return res.redirect('/register');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    await User.create({ username, password: hashedPassword });

    req.flash('success', 'Registration successful');
    res.redirect('/login');
  } catch (error) {
    req.flash('error', 'Registration failed');
    res.redirect('/register');
  }
});

// Login route
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
      // Find the user by username
      const user = await User.findOne({ username });
  
      // Check if the user exists
      if (!user) {
        req.flash('error', 'Invalid username or password');
        return res.redirect('/login');
      }
  
      // Compare the provided password with the stored hash
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        // Authentication successful
        req.session.user = user;
        req.flash('success', 'Login successful');
        res.redirect('/dashboard');
      } else {
        // Invalid password
        req.flash('error', 'Invalid username or password');
        res.redirect('/login');
      }
    } catch (error) {
      req.flash('error', 'Login failed');
      res.redirect('/login');
    }
  });

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;