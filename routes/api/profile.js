const express = require('express');
const router = express.Router();

// @route   GET api/profile
// @dis     Test Route
// @access  Public

router.get('/', (req, res) => res.send('Profile route'));

module.exports = router;
