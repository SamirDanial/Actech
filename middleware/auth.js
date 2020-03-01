const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if there is not any token
    if(!token) {
        return res.status(401).json({msg: 'Authorization failed, Access denied'});
    }

    // Verify token
    try{
        const decoded = jwt.verify(token, config.get('jwtAtechSecret'));

        req.user = decoded.user;
        next();
    } catch(err){
        res.status(401).json({msg:'Token is not valid'});
    }
}