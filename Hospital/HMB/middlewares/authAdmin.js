import jwt from 'jsonwebtoken';

// Admin authentication middleware
const authAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ msg: "No token, authorization denied" });
        }

        const authToken = authHeader.split(" ")[1]; // Extract token
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);

        // Ensure the token belongs to the admin
        if (decoded !== process.env.admin_email + process.env.admin_password) {
            return res.status(401).json({ msg: "Invalid token, authorization denied" });
        }

        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error("Error authenticating admin:", err);
        res.status(500).json({ success: false, message: "Oops! Something went wrong." });
    }
};

export default authAdmin;
