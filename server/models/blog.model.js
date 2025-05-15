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
                UNIQUE(blog_id, user_id)
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

  static createFollowsTable() {
    const sql = `
            CREATE TABLE IF NOT EXISTS follows (
                id TEXT PRIMARY KEY,
                follower_id TEXT NOT NULL,
                following_id TEXT NOT NULL,
                active INTEGER NOT NULL DEFAULT 1,
                created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE
                FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
                UNIQUE(follower_id, following_id)
        )`;
    return db.run(sql);
  }

  static alterBlogTable() {
    const sql = `
            ALTER TABLE blogs ADD COLUMN excerpt TEXT;
        `;
    return db.run(sql);
  }

  //creating a blog post
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
          author: {
            id: user.id,
            username: user.username,
            avatar_url: user.avatar_url,
          },
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

  // editing a blog post
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

  // get blog by id
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
          SELECT 
            u.id, 
            ud.username, 
            ud.avatar_url,
            ${
              current_user_id
                ? `
              EXISTS(
                SELECT 1 FROM follows 
                WHERE follower_id = ? AND following_id = u.id AND active = 1
              ) AS is_following`
                : `0 AS is_following`
            },
            ${
              current_user_id
                ? `
              EXISTS(
                SELECT 1 FROM follows 
                WHERE follower_id = u.id AND following_id = ? AND active = 1
              ) AS is_followed`
                : `0 AS is_followed_by`
            },
            (SELECT COUNT(*) FROM follows WHERE following_id = u.id AND active = 1) AS follower_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = u.id AND active = 1) AS following_count
          FROM users u 
          LEFT JOIN user_details ud ON u.id = ud.user_id
          WHERE u.id = ?
      `;
        db.get(
          sql,
          current_user_id
            ? [current_user_id, current_user_id, blog.user_id]
            : [blog.user_id],
          (err, row) => {
            if (err) return reject(err);
            resolve({
              id: row.id,
              username: row.username,
              avatar_url: row.avatar_url,
              is_following: Boolean(row.is_following),
              is_followed_by: Boolean(row.is_followed_by),
              follower_count: row.follower_count,
              following_count: row.following_count,
            });
          }
        );
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

  //get blogs
  static async getBlogs({
    sort_by = "popular",
    limit = 10,
    offset = 0,
    tag = null,
    country = null,
    search = null,
    current_user_id = null,
    author = null,
  }) {
    const searchOptions = {
      newest: "b.created DESC",
      popular: "(COUNT(DISTINCT l.id) + COUNT(DISTINCT c.id) * 0.5) DESC",
      most_liked: "COUNT(DISTINCT l.id) DESC",
      most_commented: "COUNT(DISTINCT c.id) DESC",
    };

    // main query string
    let sql = `
      SELECT 
        b.*,
        COUNT(DISTINCT l.id) AS like_count,
        COUNT(DISTINCT c.id) AS comments_count,
        ud.username AS author_username,
        ud.avatar_url AS author_avatar,
        ${
          current_user_id
            ? `EXISTS(
                SELECT 1 FROM likes 
                WHERE blog_id = b.id AND user_id = ? AND active = 1
              ) AS is_liked,
              EXISTS(
                SELECT 1 FROM follows
                WHERE follower_id = ? AND following_id = b.user_id AND active = 1
              ) AS is_following,
              EXISTS(
                SELECT 1 FROM follows
                WHERE follower_id = b.user_id AND following_id = ? AND active = 1
              ) AS is_followed_by`
            : "0 AS is_liked"
        },
        (SELECT COUNT(*) FROM follows WHERE following_id = b.user_id AND active = 1) AS follower_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = b.user_id AND active = 1) AS following_count
      FROM blogs b
      LEFT JOIN user_details ud ON b.user_id = ud.user_id
      LEFT JOIN likes l ON b.id = l.blog_id AND l.active = 1
      LEFT JOIN comments c ON b.id = c.blog_id AND c.active = 1
    `;

    let params = [];

    if (current_user_id)
      params.push(current_user_id, current_user_id, current_user_id);

    if (tag) {
      sql += ` JOIN blog_tags bt ON b.id = bt.blog_id AND bt.tag_id = ?`;
      params.push(tag);
    }

    if (country) {
      sql += ` WHERE b.country_name = ?`;
      params.push(country);
    }

    if (author) {
      sql += ` WHERE ud.username LIKE ? OR ud.first_name LIKE ? OR ud.last_name LIKE ?`;
      params.push(`%${author}%`);
      params.push(`%${author}%`);
      params.push(`%${author}%`);
    }

    if (search) {
      sql += ` AND b.title LIKE ? OR b.content LIKE ?`;
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    sql += `
      GROUP BY b.id
      ORDER BY ${searchOptions[sort_by] || searchOptions.popular}
      LIMIT ? OFFSET ?
    `;

    params.push(limit);
    params.push(offset);

    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) return reject(err);

        const formattedBlogs = rows.map((blog) => ({
          id: blog.id,
          title: blog.title,
          slug: blog.slug,
          content: blog.content,
          image_url: blog.image_url,
          country_name: blog.country_name,
          excerpt: blog.excerpt,
          created: blog.created,
          updated: blog.updated,
          author: {
            id: blog.user_id,
            username: blog.author_username,
            avatar_url: blog.author_avatar,
            follower_count: blog.follower_count,
            following_count: blog.following_count,
            is_following: Boolean(blog.is_following),
            is_followed_by: Boolean(blog.is_followed_by),
          },
          likes: blog.like_count,
          liked: Boolean(blog.is_liked),
          comments: blog.comments_count,
        }));

        resolve(formattedBlogs);
      });
    });
  }

  //like a blog
  static async likeBlog(blog_id, user_id) {
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

        const blogExists = await new Promise((res, rej) => {
          db.get(
            "SELECT 1 FROM blogs WHERE id = ? AND active = 1",
            [blog_id],
            (err, row) => {
              if (err) {
                return rej(err);
              }
              res(!!row);
            }
          );
        });

        if (!blogExists) {
          return reject(new Error("Blog not found."));
        }

        await new Promise((res, rej) => {
          const sql = `
            INSERT INTO likes (id, blog_id, user_id, active) 
            VALUES (?, ?, ?, ?)
            ON CONFLICT (blog_id, user_id) 
            DO UPDATE SET active = 1, updated = CURRENT_TIMESTAMP`;
          db.run(sql, [id, blog_id, user_id, 1], function (err) {
            if (err) {
              return rej(err);
            }
            res(this);
          });
        });

        const likeCount = await new Promise((res, rej) => {
          const sql = `SELECT COUNT(*) AS count FROM likes WHERE blog_id = ? AND active = 1`;
          db.get(sql, [blog_id], function (err, row) {
            if (err) {
              return rej(err);
            }
            res(row.count);
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
          likes: likeCount,
          liked: true,
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

  //unlike a blog
  static async unlikeBlog(blog_id, user_id) {
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

        const blogExists = await new Promise((res, rej) => {
          db.get(
            "SELECT * FROM blogs WHERE id = ? AND active = 1",
            [blog_id],
            (err, row) => {
              if (err) {
                return rej(err);
              }
              res(!!row);
            }
          );
        });

        if (!blogExists) {
          return reject(new Error("Blog not found."));
        }

        const result = await new Promise((res, rej) => {
          const sql = `UPDATE likes SET active = 0, updated = CURRENT_TIMESTAMP WHERE blog_id = ? AND user_id = ? AND active = 1`;
          db.run(sql, [blog_id, user_id], function (err) {
            if (err) {
              return rej(err);
            }
            res(this);
          });
        });

        if (result.changes === 0) {
          return reject(new Error("Blog not found."));
        }

        const likeCount = await new Promise((res, rej) => {
          const sql = `SELECT COUNT(*) AS count FROM likes WHERE blog_id = ? AND active = 1`;
          db.get(sql, [blog_id], function (err, row) {
            if (err) {
              return rej(err);
            }
            res(row.count);
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
          likes: likeCount,
          liked: false,
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

  //comment on a blog
  static async commentBlog(blog_id, user_id, comment) {
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

        const blogExists = await new Promise((res, rej) => {
          db.get(
            "SELECT 1 FROM blogs WHERE id = ? AND active = 1",
            [blog_id],
            (err, row) => {
              if (err) {
                return rej(err);
              }
              res(!!row);
            }
          );
        });

        if (!blogExists) {
          return reject(new Error("Blog not found."));
        }

        await new Promise((insertResolve, insertReject) => {
          const sql = `INSERT INTO comments (id, blog_id, user_id, content) VALUES (?,?,?,?)`;
          db.run(sql, [id, blog_id, user_id, comment], function (err) {
            if (err) {
              return insertReject(err);
            }
            insertResolve();
          });
        });

        const newComment = await new Promise((res, rej) => {
          const sql = `
            SELECT 
              c.*,
              ud.username AS author_username,
              ud.avatar_url AS author_avatar
            FROM comments c
            LEFT JOIN user_details ud ON ud.user_id = c.user_id
            WHERE c.id = ?
          `;
          db.get(sql, [id], function (err, row) {
            if (err) {
              return rej(err);
            }
            res(row);
          });
        });

        const commentCount = await new Promise((res, rej) => {
          const sql = `SELECT COUNT(*) AS count FROM comments WHERE blog_id = ? AND active = 1`;
          db.get(sql, [blog_id], function (err, row) {
            if (err) {
              return rej(err);
            }
            res(row.count);
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
          comment: {
            id: newComment.id,
            content: newComment.content,
            created: newComment.created,
            updated: newComment.updated,
            author: {
              id: newComment.user_id,
              username: newComment.author_username,
              avatar_url: newComment.author_avatar,
            },
          },
          comments: commentCount,
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

  //get comments on a blog
  static async getBlogComments(blog_id) {
    return new promise(async (resolve, reject) => {
      try {
        const blogExists = await new Promise((res, rej) => {
          db.get(
            "SELECT * FROM blogs WHERE id = ? AND active = 1",
            [blog_id],
            (err, row) => {
              if (err) {
                return rej(err);
              }
              res(!!row);
            }
          );
        });

        if (!blogExists) {
          return reject(new Error("Blog not found."));
        }

        const comments = await new Promise((res, rej) => {
          const sql = `
            SELECT 
              c.*,
              ud.username AS author_username,
              ud.avatar_url AS author_avatar,
            FROM comments c
            LEFT JOIN user_details ud ON ud.user_id = c.user_id
            WHERE c.blog_id = ?
          `;
          db.all(sql, [blog_id], function (err, rows) {
            if (err) {
              return rej(err);
            }
            res(rows);
          });
        });

        const commentCount = await new Promise((res, rej) => {
          const sql = `SELECT COUNT(*) AS count FROM comments WHERE blog_id = ? AND active = 1`;
          db.get(sql, [blog_id], function (err, row) {
            if (err) {
              return rej(err);
            }
            res(row.count);
          });
        });

        const commentsWithAuthor = comments.map((comment) => {
          return {
            id: comment.id,
            content: comment.content,
            created: comment.created,
            updated: comment.updated,
            author: {
              id: comment.user_id,
              username: comment.author_username,
              avatar_url: comment.author_avatar,
            },
          };
        });

        resolve({
          comment_records: commentsWithAuthor,
          comments: commentCount,
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  //follow a user
  static async followUser(follower_id, following_id) {
    const id = uuidv4();

    return new Promise(async (resolve, reject) => {
      try {
        if (follower_id === following_id) {
          return reject(new Error("You cannot follow yourself."));
        }

        await new Promise((insertResolve, insertReject) => {
          const sql = `
            INSERT INTO follows (id, follower_id, following_id) 
            VALUES (?,?,?)
            ON CONFLICT  (follower_id, following_id) DO NOTHING`;
          db.run(sql, [id, follower_id, following_id], function (err) {
            if (err) {
              return insertReject(err);
            }
            insertResolve();
          });
        });

        const followingCount = await this.getFollowingCount(follower_id);
        const followerCount = await this.getFollowerCount(following_id);
        const isFollowing = await this.isFollowing(follower_id, following_id);
        const isFollower = await this.isFollowing(following_id, follower_id);

        resolve({
          following_count: followingCount,
          follower_count: followerCount,
          is_following: isFollowing,
          is_followed_by: isFollower,
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  // Unfollow a user
  static async unfollowUser(follower_id, following_id) {
    return new Promise(async (resolve, reject) => {
      try {
        const result = await new Promise((res, rej) => {
          const sql = `DELETE FROM follows WHERE follower_id = ? AND following_id = ?`;
          db.run(sql, [follower_id, following_id], function (err) {
            if (err) {
              return rej(err);
            }
            res(this);
          });
        });

        if (result.changes === 0) {
          throw new Error("Follow relationship not found");
        }

        const followingCount = await this.getFollowingCount(follower_id);
        const followerCount = await this.getFollowerCount(following_id);
        const isFollowing = await this.isFollowing(follower_id, following_id);
        const isFollower = await this.isFollowing(following_id, follower_id);

        resolve({
          following_count: followingCount,
          follower_count: followerCount,
          is_following: isFollowing,
          is_followed_by: isFollower,
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  static async getFollowingCount(user_id) {
    return new Promise((resolve, reject) => {
      try {
        const sql = `SELECT COUNT(*) AS count FROM follows WHERE follower_id = ? AND active = 1`;
        db.get(sql, [user_id], function (err, row) {
          if (err) {
            return reject(err);
          }
          resolve(row.count);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  static async getFollowerCount(user_id) {
    return new Promise((resolve, reject) => {
      try {
        const sql = `SELECT COUNT(*) AS count FROM follows WHERE following_id = ? AND active = 1`;
        db.get(sql, [user_id], function (err, row) {
          if (err) {
            return reject(err);
          }
          resolve(row.count);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  //check a user is following another user
  static async isFollowing(follower_id, following_id) {
    return new Promise((resolve, reject) => {
      try {
        const sql = `SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ? AND active = 1`;
        db.get(sql, [follower_id, following_id], function (err, row) {
          if (err) {
            return reject(err);
          }
          resolve(!!row);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  //get all users that a user is following
  static async getAllFollowings(user_id) {
    return new Promise((resolve, reject) => {
      try {
        const sql = `
          SELECT * 
          FROM follows 
          WHERE follower_id = ? AND active = 1`;
        db.all(sql, [user_id], function (err, rows) {
          if (err) {
            return reject(err);
          }
          resolve(rows);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  //get all users that follow a user
  static async getAllFollowers(user_id) {
    return new Promise((resolve, reject) => {
      try {
        const sql = `
          SELECT * 
          FROM follows 
          WHERE following_id = ? AND active = 1`;
        db.all(sql, [user_id], function (err, rows) {
          if (err) {
            return reject(err);
          }
          resolve(rows);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  static async getUserBlogs(user_id) {
    return new Promise((resolve, reject) => {
      try {
        const sql = `
          SELECT b.*, ud.username, ud.avatar_url, ud.first_name, ud.last_name, ud.phone_number
          FROM blogs b
          LEFT JOIN user_details ud ON ud.user_id = b.user_id
          WHERE b.user_id = ? AND b.active = 1`;
        db.all(sql, [user_id], function (err, rows) {
          if (err) {
            return reject(err);
          }
          resolve(rows);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = Blog;
