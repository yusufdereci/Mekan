const User = require('../../models/User');
const { signToken } = require('../../services/jwtService');

module.exports = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username';
      return res.status(409).json({ success: false, message: `${field} is already in use.` });
    }

    const user  = await User.create({ username, email, password, role: 'user' });
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
