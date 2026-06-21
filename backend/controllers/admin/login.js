const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const { signToken } = require('../../services/jwtService');

const DUMMY_HASH = '$2a$12$dummy.hash.for.timing.attack.prevention.only.xx';

module.exports = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, isActive: true }).select('+password');

    const hashToCompare   = user ? user.password : DUMMY_HASH;
    const passwordIsValid = await bcrypt.compare(password, hashToCompare);

    if (!user || !passwordIsValid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    if (!['admin', 'superadmin'].includes(user.role)) {
      return res.status(403).json({ success: false, message: 'Admin privileges required' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user);

    res.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
