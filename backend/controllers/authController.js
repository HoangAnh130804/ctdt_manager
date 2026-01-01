const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

exports.register = async (req, res) => {
    try {
        const { username, email, password, full_name, role, department, phone } = req.body;

        if (!username || !email || !password || !full_name) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
            });
        }

        const existingUser = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [{ email }, { username }]
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email hoặc tên đăng nhập đã tồn tại'
            });
        }

        const user = await User.create({
            username,
            email,
            password,
            full_name,
            role: role || 'user',
            department: department || '',
            phone: phone || ''
        });

        const token = generateToken(user.id);

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công!',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                department: user.department,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên đăng nhập và mật khẩu'
            });
        }

        const user = await User.findOne({
            where: {
                [require('sequelize').Op.or]: [
                    { username },
                    { email: username }
                ]
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Tài khoản không tồn tại'
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Tài khoản đã bị khóa'
            });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Mật khẩu không đúng'
            });
        }

        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                department: user.department,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ'
        });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: { exclude: ['password'] }
        });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Người dùng không tồn tại'
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi máy chủ'
        });
    }
};
