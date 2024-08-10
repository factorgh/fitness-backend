import jwt from "jsonwebtoken";

// Create protection for all routes
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(403).json({ message: "Access denied" });
    }
    console.log(token);

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedData);
    req.user = decodedData;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default auth;
