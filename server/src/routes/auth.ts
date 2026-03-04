import { Router, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = Router();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) throw new Error("JWT_SECRET is not defined");

const JWT_SECRET = jwtSecret;
const COOKIE_NAME = "token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};

router.post("/signup", async (req: Request, res: Response) => {
  const { name, email, password, role, ...rest } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ error: "Email already in use" });
    return;
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
    ...rest,
  });

  const token = jwt.sign(
    { id: user._id, role, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  res
    .status(201)
    .json({ id: user._id, name: user.name, email: user.email, role });
});

router.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+name +email +password");
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.get("role"),
      name: user.name,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  res
    .status(200)
    .json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.get("role"),
    });
});

router.post("/signout", (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME);
  res.status(200).json({ message: "Signed out" });
});

export default router;
