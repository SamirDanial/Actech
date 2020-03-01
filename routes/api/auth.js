const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth')
const User = require('../../models/User')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

// @route   GET api/auth
// @dis     Test Route
// @access  Public

router.get('/', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password').select('-avatar');
        res.json(user);
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// @route   GET api/auth
// @dis     Authenticate user & get token
// @access  Public

router.post(
    '/',
    [
      check('email', 'Please enter a valid email address').isEmail(),
      check('password', 'please enter password').exists()
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }
  
      const { email, password } = req.body;
  
      try {
        // See if user exists
        let user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ errors: [{msg: 'Invalid Credentials'}] });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(400).json({ errors: [{msg: 'Invalid Credentials'}] });
        }
  
        // Return jsonwebtoken
        const payload = {
          user: {
            id: user.id
          }
        }
  
        jwt.sign(payload, config.get('jwtAtechSecret'), { expiresIn: 360000}, (err, token) => {
          if(err) {
            throw err;
          }
          res.json({token});
        })
      } catch (err) {
        console.log(err.message);
        res.status(500).send('Server internal error');
      }
    }
  );
  

module.exports = router;
