import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import generateToken from "../utils/generateJwt.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, cityId, zoneId, localityId } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ message: "Email or phone number required" });
    }

    
    const orConditions = [];
    if (email) orConditions.push({ email });
    if (phoneNumber) orConditions.push({ phoneNumber });

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: orConditions
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneNumber,
        passwordHash: hashedPassword,
        cityId,
        zoneId,
        localityId,
        roles: {
          create: {
            role: {
              connect: { name: "citizen" }
            }
          }
        }
      },
      include: {
        roles: { include: { role: true } }
      }
    });

    generateToken(user.id, res);

    res.status(201).json({
      id: user.id,
      fullName: user.fullName,
      roles: user.roles.map(r => r.role.name)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    const orConditions = [];
    if (email) orConditions.push({ email });
    if (phoneNumber) orConditions.push({ phoneNumber });

    const user = await prisma.user.findFirst({
      where: {
        OR: orConditions
      },
      include: {
        roles: { include: { role: true } }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    generateToken(user.id, res);

    res.json({
      id: user.id,
      fullName: user.fullName,
      roles: user.roles.map(r => r.role.name)
    });

  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};


export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    res.status(200).json({ message: "Logout successful" });

  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Logout failed" });
  }
};