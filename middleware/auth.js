const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
	//Get Tokens from the HEADER
	const token = req.header('x-auth-token');

	// Check if there is no token
	if (!token) {
		return res.status(401).json({
			msg: 'No Token, Authorization Denied!',
		});
	}
	// verify token
	try {
		//token exists allow
		const decoded = jwt.verify(token, config.get('jwtSecret'));
		req.user = decoded.user;
		next();
	} catch (err) {
		// if token doesn't exist send an error
		res.status(401).json({ msg: 'Token is not valid' });
	}
};
