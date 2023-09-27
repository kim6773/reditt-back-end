import express from "express";
import { prisma } from "../index.js";

export const voteRouter = express.Router();

voteRouter.post("/upvotes/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const existingUpVote = await prisma.upvote.findUnique({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId,
        },
      },
    });

    if (existingUpVote) {
      return res.send({
        success: false,
        error: "You have already upvoted this post",
      });
    }

    const upVote = await prisma.upvote.create({
      data: {
        userId: req.user.id,
        postId,
      },
    });

    res.send({
      success: true,
      upVote,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

voteRouter.delete("/upvotes/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const upVote = await prisma.upvote.delete({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId,
        },
      },
    });
    res.send({
      success: true,
      upVote,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

// Downvote a post
voteRouter.post("/downvotes/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const existingDownVote = await prisma.downvote.findUnique({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId,
        },
      },
    });

    if (existingDownVote) {
      return res.send({
        success: false,
        error: "You have already downvoted this post",
      });
    }

    const downVote = await prisma.downvote.create({
      data: {
        userId: req.user.id,
        postId,
      },
    });

    res.send({
      success: true,
      downVote,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
// Delete a downvote
voteRouter.delete("/downvotes/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    // Attempt to delete the downvote
    await prisma.downvote.delete({
      where: {
        userId_postId: {
          userId: req.user.id,
          postId,
        },
      },
    });

    res.send({
      success: true,
      message: "Downvote removed successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
