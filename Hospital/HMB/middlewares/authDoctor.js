import jwt from 'jsonwebtoken';

// doctor authentication middleware
const authDoctor = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ msg: "No token, authorization denied" });
        }

        const authToken = authHeader.split(" ")[1]; // Extract token
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);

        req.docId = decoded.id;

        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error("Error authenticating admin:", err);
        res.status(500).json({ success: false, message: "Oops! Something went wrong." });
    }
};

export default authDoctor;
