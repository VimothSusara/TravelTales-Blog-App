const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt.utils");
const fs = require("fs");
const slugify = require("slugify");

const Blog = require("../models/blog.model");
const { v4: uuidv4 } = require("uuid");

const createBlog = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "No data provided." });
    }

    const { title, content, country_name } = req.body;
    const user_id = req.user.id;

    if (!title || !content || !country_name) {
      return res
        .status(400)
        .json({ message: "Title, Content and Country are required." });
    }

    const excerpt =
      content.substring(0, 150) + (content.length > 150 ? "..." : content);

    let sluggedTitle = slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });
    const slug = `${sluggedTitle}-${uuidv4()}`;

    const image_url = req.file
      ? `/uploads/blogs/${req.file.filename}`
      : `https://via.placeholder.com/600x400`;

    const newBlog = await Blog.createBlog({
      user_id,
      title,
      slug,
      content,
      image_url,
      excerpt,
      country_name,
    });

    return res.status(200).json({
      message: "Blog created successfully.",
      user: {
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

    res
      .status(500)
      .json({ message: error?.message || "Error while creating blog" });
  }
};

const updateBlog = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "No data provided." });
    }

    const { id: blog_id } = req.params;

    const { title, content, country_name } = req.body;

    const user_id = req.user.id;

    if (!title || !content || !country_name) {
      return res
        .status(400)
        .json({ message: "Title, Content and Country are required." });
    }

    const excerpt =
      content.substring(0, 150) + (content.length > 150 ? "..." : content);

    let sluggedTitle = slugify(title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g,
    });

    const slug = `${sluggedTitle}-${uuidv4()}`;

    const image_url = req.file
      ? `/uploads/blogs/${req.file.filename}`
      : `https://via.placeholder.com/600x400`;

    const blog = await Blog.getBlogById(blog_id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    const updatedBlog = await Blog.updateBlog(blog_id, {
      user_id,
      title,
      slug,
      content,
      image_url,
      country_name,
      excerpt,
    });

    console.log("Blog: ", updatedBlog);

    return res.status(200).json({
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
  }
};

const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.getBlogById(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    return res.status(200).json({
      message: "Blog fetched successfully.",
      blog,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error?.message || "Error while fetching blog" });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await Blog.getBlogBySlug(slug);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }

    return res.status(200).json({
      message: "Blog fetched successfully.",
      blog,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: error?.message || "Error while fetching blog" });
  }
};

module.exports = {
  createBlog,
  getBlogById,
  getBlogBySlug,
  updateBlog,
};
