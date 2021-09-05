const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route       POST api/users
// @desc        register user
// @access      Public

router.post(
	'/',
	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Please include valid email').isEmail(),
		check(
			'password',
			'Please enter a password with atleast 8 characters',
		).isLength({ min: 8 }),
	],

	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;

		try {
			// See if user exists
			let user = await User.findOne({ email });
			if (user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'User already exists' }] });
			}
			// Get users gravatar
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm',
			});

			user = new User({
				name,
				email,
				avatar,
				password,
			});

			// Encrypt passwords
			const salt = await bcrypt.genSalt(10);

			user.password = await bcrypt.hash(password, salt);
			await user.save();
			// return jsonwebtokens

			//creating a payload so that there is a specified token for x amount of seconds for all users.
			const payload = {
				user: {
					id: user.id,
				},
			};
			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 360000 },
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				},
			);
		} catch (err) {
			console.log(err.message);
			res.status(500).send('Server Error');
		}
	},
);

module.exports = router;
