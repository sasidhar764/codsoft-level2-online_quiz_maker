const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register user
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }
    
    // Create user
    const user = await User.create({
      username,
      email,
      password,
      profile: {
        firstName,
        lastName
      }
    });
    
    // Generate token
    const token = user.generateAuthToken();
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        role: user.role
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = user.generateAuthToken();
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        role: user.role,
        lastLogin: user.lastLogin
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('createdQuizzes', 'title category totalAttempts averageScore')
      .populate('testResults', 'quiz score percentage completedAt');
    
    const stats = await user.getStats();
    
    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        stats
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        'profile.firstName': firstName,
        'profile.lastName': lastName,
        'profile.bio': bio
      },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    
    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
};
