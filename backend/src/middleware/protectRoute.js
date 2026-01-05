import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        roles: { include: { role: true } }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();

  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default protectRoute;
