import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "./db";
import { AuthenticatedRequest } from "./middleware";

const JWT_SECRET = process.env.JWT_SECRET || "learnvault_super_secret_session_key_2026_safe";

export async function register(req: AuthenticatedRequest, res: Response) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: "Username, email, and password are required fields" });
      return;
    }

    if (username.length < 3) {
      res.status(400).json({ error: "Username must be at least 3 characters long" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters long" });
      return;
    }

    // Check if email already registered
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
      res.status(400).json({ error: "Email is already in use" });
      return;
    }

    // Check if username taken
    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      res.status(400).json({ error: "Username is already taken" });
      return;
    }

    // Hash the password with bcryptjs
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in the database
    const user = await UserModel.create({ username, email }, passwordHash);

    // Issue JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      user
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "An error occurred during account registration" });
  }
}

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    // Find the user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Fetch password hash and compare
    const passwordHash = await UserModel.getPasswordHash(user.id);
    if (!passwordHash) {
      res.status(500).json({ error: "Database error during password check" });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, passwordHash);
    if (!isValidPassword) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Check & increment learning streak
    const updatedUser = await UserModel.updateStreak(user.id);

    // Issue JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      token,
      user: updatedUser || user
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "An error occurred during sign-in" });
  }
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }

    // Always fetch latest streak info during sessions
    const refreshedUser = await UserModel.updateStreak(req.userId);
    if (!refreshedUser) {
      res.status(404).json({ error: "User profile not found" });
      return;
    }

    res.status(200).json({ user: refreshedUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "An error occurred fetching profile" });
  }
}
