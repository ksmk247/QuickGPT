import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const protect = async (req, res, next) => {
    // Try multiple locations for the token to be robust for different clients
    let token = req.headers.authorization || req.headers['x-auth-token'] || req.body?.token || req.query?.token || req.cookies?.token;
    try {
        // Extract token from "Bearer <token>" format
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        // If token looks like "Bearer <token>", strip the prefix. Also remove stray quotes/whitespace.
        if (typeof token === 'string') {
            token = token.trim();
            if (token.toLowerCase().startsWith('bearer ')) {
                token = token.slice(7).trim();
            }
            // Remove surrounding quotes if present
            if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
                token = token.slice(1, -1);
            }
        }

        console.log('Verifying token with secret:', !!process.env.JWT_SECRET ? 'present' : 'MISSING');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully:', decoded);
        const userId = decoded.id || decoded._id || decoded.userId;

        const user = await User.findById(userId)
        if(!user){
            console.log('User not found with ID:', userId);
            return res.status(401).json({ success: false, message: "User not found" });
        }
        console.log('User found:', user.email);
        req.user = user;
        return next();
    }

    catch (error){
        console.error('Auth error:', error && error.message ? error.message : error);
        return res.status(401).json({ message: "Not authorized, token failed", error: error.message || String(error) });
    }
}