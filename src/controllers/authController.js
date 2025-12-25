const db  = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/encryption');
const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../middleware/errorHandler');

const register = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ error: 'Email and password required' });
    }

    const result = await db.User.findOne({ where: { email } });
    if (result) {
        return res.status(400).send({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const role = await db.Role.findOne({ where: { type : 'USER' } });
    const newUser = await db.User.create({
        email,
        passwordHash: hashedPassword,
        roleId : role.id
    });
    const token = getToken(newUser)
    res.status(201).send({
        message: 'User created successfully',
        user: newUser,
        token,
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({ error: 'Email and password required' });
    }

    const result = await db.User.findOne({ where: { email } });
    if (!result) {
        return res.status(401).send({ error: 'Invalid credentials' });
    }

    const user = result;

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
        return res.status(401).send({ error: 'Invalid credentials' });
    }

    const token = getToken(user);

    res.send({
        message: 'Login successful',
        token,
        user: { id: user.id, email: user.email },
    });
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId;

    const result = await db.User.findOne({ where: { id: userId } });
    if (!result) {
        return res.status(404).send({ error: 'User not found' });
    }

    const isValid = await comparePassword(oldPassword, result.passwordHash);
    if (!isValid) {
        return res.status(401).send({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await db.User.update({ passwordHash: hashedPassword }, { where: { id: userId } });

    res.send({ message: 'Password updated successfully' });
});

function getToken(user){
    if(!user) return;
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );

}
module.exports = { register, login, changePassword };
