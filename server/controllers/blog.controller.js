const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt.utils");
const fs = require("fs");
const slugify = require("slugify");

const Blog = require("../models/blog.model");

const generateShortId = require("../utils/short.slug.id");

//sanitizing html content
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const createBlog = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ message: "No data provided.", success: false });
    }

    const { title, content, country_name } = req.body;

    const user_id = req.user.id;

    if (!title || !content || !country_name) {
      return res.status(400).json({
        message: "Title, Content and Country are required.",
        success: false,
      });
    }

    const cleanContent = DOMPurify.sanitize(content);

    const excerpt =
      cleanContent.substring(0, 100).replace(/<[^>]+>/g, "") +
      (content.length > 100 ? "..." : "");

    let sluggedTitle = slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    const shortId = await generateShortId();

    const slug = `${sluggedTitle}-${shortId}`;

    const image_url = req.file
      ? `/uploads/blogs/${req.file.filename}`
      : `/uploads/blogs/placeholder.png`;

    const newBlog = await Blog.createBlog({
      user_id,
      title,
      slug,
      content: cleanContent,
      image_url,
      excerpt,
      country_name,
    });

    return res.status(200).json({
      success: true,
      message: "Blog created successfully.",
      blog: {
        id: newBlog.id,
        title: newBlog.title,
        slug: newBlog.slug,
        content: newBlog.content,
        image_url: newBlog.image_url,
        country_name: newBlog.country_name,
        excerpt: newBlog.excerpt,
        author: newBlog.author,
        created: newBlog.created,
        updated: newBlog.updated,
        likes: newBlog.likes,
        comments: newBlog.comments,
        liked: newBlog.liked,
        comment_records: newBlog.comment_records,
      },
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: error?.message || "Error while creating blog",
      success: false,
    });
  }
};

const updateBlog = async (req, res) => {
  try {
    if (!req.body) {
      return res
        .status(400)
        .json({ message: "No data provided.", success: false });
    }

    const { id: blog_id } = req.params;

    const { title, content, country_name } = req.body;

    const user_id = req.user.id;

    if (!title || !content || !country_name) {
      return res.status(400).json({
        message: "Title, Content and Country are required.",
        success: false,
      });
    }

    const cleanContent = DOMPurify.sanitize(content);

    const excerpt =
      content.substring(0, 100).replace(/<[^>]+>/g, "") +
      (content.length > 100 ? "..." : "");

    let sluggedTitle = slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    const shortId = await generateShortId();

    const slug = `${sluggedTitle}-${shortId}`;

    const image_url = req.file
      ? `/uploads/blogs/${req.file.filename}`
      : `/uploads/blogs/placeholder.png`;

    const blog = await Blog.getBlogById(blog_id);

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found.", success: false });
    }

    const updatedBlog = await Blog.updateBlog(blog_id, {
      user_id,
      title,
      slug,
      content: cleanContent,
      image_url,
      country_name,
      excerpt,
    });

    console.log("Blog: ", updatedBlog);

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully.",
      blog: {
        id: updatedBlog.id,
        title: updatedBlog.title,
        slug: updatedBlog.slug,
        content: updatedBlog.content,
        image_url: updatedBlog.image_url,
        country_name: updatedBlog.country_name,
        excerpt: updatedBlog.excerpt,
        author: updatedBlog.author,
        created: updatedBlog.created,
        updated: updatedBlog.updated,
        likes: updatedBlog.likes,
        comments: updatedBlog.comments,
        liked: updatedBlog.liked,
        comment_records: updatedBlog.comment_records,
      },
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: error?.message || "Error while updating blog",
      success: false,
    });
  }
};

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.query.user_id || null;

    const blog = await Blog.getBlogById(id, user_id);

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found.", success: false });
    }

    return res.status(200).json({
      success: true,
      message: "Blog fetched successfully.",
      blog,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Error while fetching blog",
      success: false,
    });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.getBlogBySlug(slug);

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found.", success: false });
    }

    return res.status(200).json({
      message: "Blog fetched successfully.",
      blog,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Error while fetching blog",
      success: false,
    });
  }
};

const getBlogLists = async (req, res) => {
  try {
    const {
      sort_by = "popular",
      limit = 10,
      page = 1,
      tag = null,
      country = null,
      search = null,
      user_id = null,
      author = null,
    } = req.query;

    const offset = (page - 1) * limit;

    const blogLists = await Blog.getBlogs({
      sort_by,
      limit,
      offset,
      tag,
      country,
      search,
      current_user_id: user_id,
      author,
    });

    return res.status(200).json({
      success: true,
      message: "Blog lists fetched successfully.",
      blogs: blogLists,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Error while fetching blog lists",
      success: false,
    });
  }
};

const getUserBlogs = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ message: "User id is required.", success: false });
    }

    const userBlogs = await Blog.getUserBlogs(id);

    return res.status(200).json({
      success: true,
      message: "User blogs fetched successfully.",
      blogs: userBlogs,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Error while fetching user blogs",
      success: false,
    });
  }
};

const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.getBlogById(id);

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found.", success: false });
    }

    const user_id = req.user.id || null;

    if (!user_id) {
      return res
        .status(401)
        .json({ message: "User not authenticated.", success: false });
    }

    const liked = await Blog.likeBlog(blog.id, user_id);

    return res.status(200).json({
      success: true,
      message: "Blog liked successfully.",
      liked,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Error while liking blog",
      success: false,
    });
  }
};

const unlikeBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.getBlogById(id);

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found.", success: false });
    }

    const user_id = req.user.id || null;

    if (!user_id) {
      return res
        .status(401)
        .json({ message: "User not authenticated.", success: false });
    }

    const liked = await Blog.unlikeBlog(blog.id, user_id);

    return res.status(200).json({
      success: true,
      message: "Blog unLiked successfully.",
      liked,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Error while unLiking blog",
      success: false,
    });
  }
};

const commentBlog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.body.comment) {
      return res
        .status(400)
        .json({ message: "Comment is required.", success: false });
    }

    const blog = await Blog.getBlogById(id);

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found.", success: false });
    }

    const user_id = req.user.id || null;

    if (!user_id) {
      return res
        .status(401)
        .json({ message: "User not authenticated.", success: false });
    }

    const comment = await Blog.commentBlog(blog.id, user_id, req.body.comment);

    return res.status(200).json({
      success: true,
      message: "Blog commented successfully.",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Error while commenting blog",
      success: false,
    });
  }
};

const getBlogComments = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.getBlogById(id);

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found.", success: false });
    }

    const comments = await Blog.getBlogComments(blog.id);

    return res.status(200).json({
      success: true,
      message: "Blog comments fetched successfully.",
      comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "Error while fetching blog comments",
    });
  }
};

//following a user
const followUser = async (req, res) => {
  try {
    const { id: following_id } = req.params;

    if (!following_id) {
      return res
        .status(400)
        .json({ message: "Following id is required.", success: false });
    }

    const user_id = req.user.id || null;

    if (!user_id) {
      return res
        .status(401)
        .json({ message: "User not authenticated.", success: false });
    }

    const followed = await Blog.followUser(user_id, following_id);

    return res.status(200).json({
      success: true,
      message: "User followed successfully.",
      followed,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Error while following user",
      success: false,
    });
  }
};

//unfollowing a user
const unfollowUser = async (req, res) => {
  try {
    const { id: following_id } = req.params;

    if (!following_id) {
      return res
        .status(400)
        .json({ message: "Following id is required.", success: false });
    }

    const user_id = req.user.id || null;

    if (!user_id) {
      return res
        .status(401)
        .json({ message: "User not authenticated.", success: false });
    }

    const followed = await Blog.unfollowUser(user_id, following_id);

    return res.status(200).json({
      success: true,
      message: "User unfollowed successfully.",
      followed,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Error while unFollowing user",
      success: false,
    });
  }
};

//get all followings
const getAllFollowings = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(404)
        .json({ message: "User not found.", success: false });
    }

    const user_id = req.user.id;

    const followings = await User.getAllFollowings(user_id);

    return res.status(200).json({
      success: true,
      message: "User followings fetched successfully.",
      followings,
    });
  } catch (error) {
    res.status(500).json({
      message: error?.message || "Error while fetching user followings",
      success: false,
    });
  }
};

const getAllFollowers = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(404)
        .json({ message: "User not found.", success: false });
    }

    const user_id = req.user.id;

    const followers = await User.getAllFollowers(user_id);

    return res.status(200).json({
      success: true,
      message: "User followers fetched successfully.",
      followers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error?.message || "Error while fetching user followers",
    });
  }
};

module.exports = {
  createBlog,
  getBlogById,
  getBlogBySlug,
  updateBlog,
  getBlogLists,
  likeBlog,
  unlikeBlog,
  commentBlog,
  getBlogComments,
  followUser,
  unfollowUser,
  getAllFollowings,
  getAllFollowers,
  getUserBlogs,
};
