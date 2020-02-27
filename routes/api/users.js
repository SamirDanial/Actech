const express = require('express');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

const router = express.Router();

// @route   GET api/users
// @dis     Test Route
// @access  Public

router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please enter a valid email address').isEmail(),
    check('password', 'Your password should be 6 character or more').isLength({
      min: 6
    })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // See if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: 'User already exists' });
      }

      // Get user's garavatar
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      user = new User({ name, email, avatar, password });

      // Encrypt Password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return jsonwebtoken

      res.send('User registered');
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server internal error');
    }
  }
);

module.exports = router;
