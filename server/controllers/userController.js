import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}



export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.json({ success: false , message: "User already exists" });
        }

        const user = await User.create({name, email, password})

        const token = generateToken(user._id);
        res.json({success: true, token})
    }

    catch (error){
        return res.json({success: false, message: error.message});
    }
}

// Login User

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email})
        if(user){
            const isMatch = await bcrypt.compare(password, user.password)

            if(isMatch){
                const token = generateToken(user._id);
                return res.json({ success: true, token });
            }
        }
        return res.json({ success: false, message: "Invalid email or password" });
    }

    catch (error){
        return res.json({ success: false, message: error.message });
    }
}

// Get User Profile

export const getUser = async (req, res) => {
    try{
        const user = req.user
        return res.json({ success: true, user });
    }
    catch (error){
        return res.json({ success: false, message: error.message });
    }
}
