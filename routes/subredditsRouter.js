import express from "express";
import { prisma } from "../index.js";

export const subredditsRouter = express.Router();

subredditsRouter.get("/", async (req, res) => {
  const subReddits = await prisma.subreddit.findMany();
  res.send({
    success: true,
    subReddits,
  });
});

subredditsRouter.post("/", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.send({
        success: false,
        error:
          "Please include both text and project name when creating a Subreddit",
      });
    }

    if (!req.user) {
      return res.send({
        success: false,
        error: "You must be logged in to create a submission.",
      });
    }

    const newPost = await prisma.subreddit.create({
      select: {
        post,
        text,
        title,
        userId: req.user.id,
        subredditId,
        parentId,
      },
    });
    res.send({ success: true, newPost });
  } catch (error) {
    res.send({ success: false, error: error.message });
  }
});

subredditsRouter.delete("/:subredditId", async (req, res) => {
  const { subredditId } = req.params;

  try {
    const subreddit = await prisma.subreddit.findUnique({
      where: {
        id: subredditId,
      },
    });
    if (!subreddit) {
      return res.send({
        success: false,
        error: "Subreddit not found",
      });
    }
    if (subreddit.userId !== req.user.id) {
      return res.send({
        success: false,
        error: "User is not authorized to delete this subreddit",
      });
    }
    return res.send({
      success: true,
      subreddit,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
