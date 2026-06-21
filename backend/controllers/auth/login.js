const bcrypt = require('bcryptjs');
const User   = require('../../models/User');
const { signToken } = require('../../services/jwtService');

const DUMMY_HASH = '$2a$12$dummy.hash.for.timing.attack.prevention.only.xx';

module.exports = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user          = await User.findOne({ email, isActive: true }).select('+password');
    const hashToCompare = user ? user.password : DUMMY_HASH;
    const isValid       = await bcrypt.compare(password, hashToCompare);

    if (!user || !isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user);

    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
