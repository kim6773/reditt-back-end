import express from "express";
import { prisma } from "../index.js";

export const postRouter = express.Router();

postRouter.get("/", async (req, res) => {
  const allPosts = await prisma.post.findMany({
    select: {
      id: true,
      text: true,
      title: true,
      userId: true,
      subredditId: true,
      parentId: true,
      user: true,
      subreddit: true,
      upvotes: true,
      downvotes: true,
      children: {
        select: {
          id: true,
          text: true,
          title: true,
          userId: true,
          subredditId: true,
          parentId: true,
        },
      },
    },
  });
  console.log(allPosts);
  res.json({
    success: true,
    posts: allPosts,
  });
});

postRouter.post("/", async (req, res) => {
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
    const newPost = await prisma.post.create({
      data: {
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

postRouter.put("/:postId", async (req, res) => {
  const { postId } = req.params;
  const { text, title } = req.body;

  try {
    if (!req.user) {
      return res.send({
        success: false,
        error: "You must be logged in to update a post.",
      });
    }

    const existingPost = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!existingPost) {
      return res.send({
        success: false,
        error: "Post not found",
      });
    }

    if (existingPost.userId !== req.user.id) {
      return res.send({
        success: false,
        error: "User is not authorized to update this post",
      });
    }

    const updatedPost = await prisma.post.update({
      where: {
        id: postId,
      },
      data: {
        userId: req.user.id,
        text,
        title,
      },
    });

    res.send({
      success: true,
      updatedPost: updatedPost,
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});

postRouter.delete("/:postId", async (req, res) => {
  const { postId } = req.params;

  try {
    const postToDelete = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!postToDelete) {
      return res.send({
        success: false,
        error: "Post not found",
      });
    }
    if (postToDelete.userId !== req.user.id) {
      return res.send({
        success: false,
        error: "User is not authorized to delete this post",
      });
    }
    const deletedPost = await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    res.send({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.send({
      success: false,
      error: error.message,
    });
  }
});
