import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();

const generateTokenandSetCookie = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: "15d"});
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // true in production
        maxage: 15 * 24 * 60 * 60 * 1000, // 15 days
        sameSite: "strict"
    });
}

export default generateTokenandSetCookie;