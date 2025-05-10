const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class Blog {
  static init() {
    this.createBlogTable();
    this.createCommentTable();
    this.createLikesTable();
    this.createTagsTable();
    this.createBlogTagsTable();
  }

  static createBlogTable() {
    const sql = `
            CREATE TABLE IF NOT EXISTS blogs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                slug TEXT NOT NULL,
                content TEXT NOT NULL,
                image_url TEXT,
                country_name TEXT NOT NULL,
                active INTEGER NOT NULL DEFAULT 1,
                created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`;
    return db.run(sql);
  }

  static createCommentTable() {
    const sql = `
            CREATE TABLE IF NOT EXISTS comments (
                id TEXT PRIMARY KEY,
                blog_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                content TEXT NOT NULL,
                active INTEGER NOT NULL DEFAULT 1,
                created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
        )`;
    return db.run(sql);
  }

  static createLikesTable() {
    const sql = `
            CREATE TABLE IF NOT EXISTS likes (
                id TEXT PRIMARY KEY,
                blog_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                active INTEGER NOT NULL DEFAULT 1,
                created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
        )`;
    return db.run(sql);
  }

  static createTagsTable() {
    const sql = `
            CREATE TABLE IF NOT EXISTS tags (
                id TEXT PRIMARY KEY,
                tag_name TEXT NOT NULL,
                active INTEGER NOT NULL DEFAULT 1,
                created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`;
    return db.run(sql);
  }

  static createBlogTagsTable() {
    const sql = `
            CREATE TABLE IF NOT EXISTS blog_tags (
                id TEXT PRIMARY KEY,
                blog_id TEXT NOT NULL,
                tag_id TEXT NOT NULL,
                active INTEGER NOT NULL DEFAULT 1,
                created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE
                FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )`;
    return db.run(sql);
  }

  static alterBlogTable() {
    const sql = `
            ALTER TABLE blogs ADD COLUMN excerpt TEXT;
        `;
    return db.run(sql);
  }

  static async createBlog(blogData) {
    const { user_id, title, slug, content, image_url, country_name, excerpt } =
      blogData;
    const id = uuidv4();

    return new Promise(async (resolve, reject) => {
      try {
        await new Promise((transactionResolve, transactionReject) => {
          db.run("BEGIN TRANSACTION", function (err) {
            if (err) {
              return transactionReject(err);
            }
            transactionResolve();
          });
        });

        await new Promise((insertResolve, insertReject) => {
          const sql = `INSERT INTO blogs (id, user_id, title, slug, content, image_url, country_name, excerpt) VALUES (?,?,?,?,?,?,?, ?)`;
          db.run(
            sql,
            [
              id,
              user_id,
              title,
              slug,
              content,
              image_url,
              country_name,
              excerpt,
            ],
            function (err) {
              if (err) {
                return insertReject(err);
              }
              insertResolve(this);
            }
          );
        });

        const user = await new Promise((getUserResolve, getUserReject) => {
          const sql = `
                SELECT u.id, ud.username, ud.avatar_url
                FROM users u 
                LEFT JOIN user_details ud ON u.id = ud.user_id
                WHERE u.id = ?
            `;
          db.get(sql, [user_id], (err, row) => {
            if (err) {
              return getUserReject(err);
            }
            getUserResolve(row);
          });
        });

        await new Promise((commitResolve, commitReject) => {
          db.run("COMMIT", function (err) {
            if (err) {
              return commitReject(err);
            }
            commitResolve();
          });
        });

        resolve({
          id,
          title,
          slug,
          content,
          image_url,
          country_name,
          excerpt,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
          author: user,
          likes: 0,
          comments: 0,
          liked: false,
          comment_records: [],
        });
      } catch (err) {
        try {
          await new Promise((rollBackResolve, rollBackReject) => {
            db.run("ROLLBACK", function (err) {
              if (err) {
                return rollBackReject(err);
              }
              rollBackResolve();
            });
          });
        } catch (err) {
          console.log(err);
        }

        reject(err);
      }
    });
  }

  static async updateBlog(blog_id, blogData) {
    const { user_id, title, slug, content, image_url, country_name, excerpt } =
      blogData;

    try {
      await new Promise((transactionResolve, transactionReject) => {
        db.run("BEGIN TRANSACTION", function (err) {
          if (err) {
            return transactionReject(err);
          }
          transactionResolve();
        });
      });

      await new Promise((updateResolve, updateReject) => {
        const sql = `UPDATE blogs SET title = ?, slug = ?, content = ?, image_url = ?, country_name = ?, excerpt = ?, updated = CURRENT_TIMESTAMP WHERE id = ? AND active = 1`;
        db.run(
          sql,
          [title, slug, content, image_url, country_name, excerpt, blog_id],
          function (err) {
            if (err) {
              return updateReject(err);
            }
            updateResolve(this);
          }
        );
      });

      const updatedBlog = this.getBlogById(blog_id, user_id);

      await new Promise((commitResolve, commitReject) => {
        db.run("COMMIT", function (err) {
          if (err) {
            return commitReject(err);
          }
          commitResolve();
        });
      });

      return updatedBlog;
    } catch (err) {
      try {
        await new Promise((rollBackResolve, rollBackReject) => {
          db.run("ROLLBACK", function (err) {
            if (err) {
              return rollBackReject(err);
            }
            rollBackResolve();
          });
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  static async getBlogById(blog_id, current_user_id = null) {
    try {
      const blog = await new Promise((resolve, reject) => {
        const sql = `SELECT * FROM blogs WHERE id = ? AND active = 1`;
        db.get(sql, [blog_id], (err, row) => {
          if (err) {
            return reject(err);
          }
          resolve(row);
        });
      });

      if (!blog) return null;

      const author = await new Promise((resolve, reject) => {
        const sql = `
          SELECT u.id, ud.username, ud.avatar_url
          FROM users u 
          LEFT JOIN user_details ud ON u.id = ud.user_id
          WHERE u.id = ?
      `;
        db.get(sql, [blog.user_id], (err, row) => {
          if (err) return reject(err);
          resolve(row);
        });
      });

      const likeCount = await new Promise((resolve, reject) => {
        const sql = `
          SELECT 
            COUNT(*) AS like_count,
            EXISTS(
              SELECT 1 FROM likes 
              WHERE blog_id = ? AND user_id = ? AND active = 1
            ) AS is_liked
          FROM likes 
          WHERE blog_id = ? AND active = 1`;
        db.get(sql, [blog_id, current_user_id, blog_id], (err, row) => {
          if (err) {
            return reject(err);
          }
          resolve({
            like_count: row.like_count,
            is_liked: Boolean(row.is_liked),
          });
        });
      });

      const comments = await new Promise((resolve, reject) => {
        const sql = `
            SELECT 
              c.*,
              ud.username AS author_username,
              ud.avatar_url AS author_avatar
            FROM comments c
            LEFT JOIN user_details ud ON c.user_id = ud.user_id
            WHERE c.blog_id = ? AND c.active = 1
            ORDER BY c.created DESC
        `;
        db.all(sql, [blog_id], (err, rows) => {
          if (err) {
            return reject(err);
          }

          const commentRecords =
            rows.length > 0
              ? rows.map((comment) => ({
                  id: comment.id,
                  content: comment.content,
                  created: comment.created,
                  updated: comment.updated,
                  author: {
                    id: comment.user_id,
                    username: comment.author_username,
                    avatar_url: comment.author_avatar,
                  },
                }))
              : [];

          resolve({
            comment_count: rows.length || 0,
            comments: commentRecords,
          });
        });
      });

      return {
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        image_url: blog.image_url,
        country_name: blog.country_name,
        excerpt: blog.excerpt,
        created: blog.created,
        updated: blog.updated,
        author,
        likes: likeCount.like_count,
        liked: likeCount.is_liked,
        comments: comments.comment_count,
        comment_records: comments.comments,
      };
    } catch (error) {
      reject(error);
    }
  }
}

module.exports = Blog;
