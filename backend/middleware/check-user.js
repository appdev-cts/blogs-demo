const jwt = require('jsonwebtoken');
require('dotenv').config();
const Users = require('../models/Users.model');

const checkUser = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error("Token missing or invalid format:", authHeader);
            req.user = null;
            req.message = "Token missing or invalid format";
            return next();
        }

        // Split header value to extract token
        const token = authHeader.split(' ')[1];
        // console.log(token);
        // Check if token is explicitly set to null
        if (token === 'null') {
            console.error("Token explicitly set to null:", authHeader);
            req.user = null;
            req.message = "Token explicitly set to null";
            return next();
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.id;
        next();
    } catch (error) {
        console.error("Error verifying token:", error);
        req.user = null;
        req.message = "Error verifying token";
        next();
    }
};

module.exports = checkUser;
