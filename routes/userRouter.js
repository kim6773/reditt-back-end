import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../index.js";
export const userRouter = express.Router();

userRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.send({
        success: false,
        error: "You must provide a username and password when logging in.",
      });
    }
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      return res.send({
        success: false,
        error: "User and/or password is invalid.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.send({
        success: false,
        error: "User and/or password is invalid.",
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.send({
      success: true,
      token,
    });
  } catch (error) {
    return res.send({
      success: false,
      error: error.message,
    });
  }
});

userRouter.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const checkUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (checkUser) {
      return res.send({
        success: false,
        error: "Username already exists, please login.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.send({
      success: true,
      token,
    });
  } catch (error) {
    return res.send({
      success: false,
      error: error.message,
    });
  }
});

userRouter.get("/token", async (req, res) => {
  try {
    res.send({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
// Update user information
userRouter.put("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: username,
      },
    });

    if (!user) {
      return res.send({
        success: false,
        error: "User not found",
      });
    }

    if (req.user.id !== user.id) {
      return res.send({
        success: false,
        error: "User is not authorized to update this profile",
      });
    }

    // Update user information
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username,
        password: hashedPassword,
      },
    });

    res.send({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
