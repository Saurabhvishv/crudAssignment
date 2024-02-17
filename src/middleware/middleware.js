const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const Auth = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            res.status(401).send({ status: false, msg: 'Unauthorized request' });
            return;
        }

        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

        const user = await User.findById(decodedToken?._id).select("-password");

        if (!user) {
            res.status(401).send({ status: false, message: 'Invalid Access Token' });
            return;
        }

        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).send({ status: false, msg: 'Token expired' });
        } else {
            res.status(500).send({ status: false, msg: `Error: ${error.message}` });
        }
    }
}


module.exports.Auth = Auth; 