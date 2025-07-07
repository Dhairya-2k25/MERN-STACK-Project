// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User'); // Import the User model
const auth = require('../middleware/auth'); // Import authentication middleware

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ username, email, password: hashedPassword });
    await user.save();

    const payload = {
      user: {
        id: user.id // JWT payload uses 'id' by convention from Mongoose virtuals
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        // CORRECTED PART: Ensure _id is sent in the user object
        res.json({
          token,
          user: {
            _id: user._id, // Add this line to include the MongoDB _id
            username: user.username,
            email: user.email,
            // Add any other user fields you want the frontend to have
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id // JWT payload uses 'id' by convention from Mongoose virtuals
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        // CORRECTED PART: Ensure _id is sent in the user object
        res.json({
          token,
          user: {
            _id: user._id, // Add this line to include the MongoDB _id
            username: user.username,
            email: user.email,
            // Add any other user fields you want the frontend to have
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/user
// @desc    Get authenticated user data (private route)
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    // req.user.id comes from the auth middleware after verifying the token
    const user = await User.findById(req.user.id).select('-password'); // Exclude password from the response
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;