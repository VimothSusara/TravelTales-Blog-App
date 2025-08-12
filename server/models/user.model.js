const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { salt_rounds } = require("../utils/constants.util");

const Blog = require("../models/blog.model");

class User {
  static createTable() {
    const sql = `
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                active INTEGER NOT NULL DEFAULT 1,
                role_id INTEGER NOT NULL DEFAULT 2,
                reset_password_token TEXT,
                reset_password_expires DATETIME,
                created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )`;
    return db.run(sql);
  }

  static createUserDetailsTable() {
    const sql = `
            CREATE TABLE IF NOT EXISTS user_details (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                username TEXT NOT NULL UNIQUE,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                phone_number TEXT NOT NULL UNIQUE,
                avatar_url TEXT,
                created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )`;
    return db.run(sql);
  }

  static async register(
    email,
    password,
    username,
    first_name,
    last_name,
    phone_number,
    avatar_url
  ) {
    //password hashing
    const saltRounds = salt_rounds;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
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

        const userEmailExists = await User.findUserWithEmail(email);
        if (userEmailExists) {
          throw new Error("Email already exists.");
        }

        const usernameExists = await User.findUsername(username);
        if (usernameExists) {
          throw new Error("Username already exists.");
        }

        const user_id = await new Promise((resolve, reject) => {
          const id = uuidv4();
          const sql = `INSERT INTO users (id, email, password) VALUES (?,?,?)`;
          db.run(sql, [id, email, hashedPassword], function (err) {
            if (err) {
              return reject(err);
            } else {
              resolve(id);
            }
          });
        });

        await new Promise((resolve, reject) => {
          const id = uuidv4();
          const sql = `INSERT INTO user_details (id, user_id, username, first_name, last_name, phone_number, avatar_url) VALUES (?,?,?,?,?,?,?)`;
          db.run(
            sql,
            [
              id,
              user_id,
              username,
              first_name,
              last_name,
              phone_number,
              avatar_url,
            ],
            function (err) {
              if (err) {
                return reject(err);
              } else {
                resolve(id);
              }
            }
          );
        });

        await new Promise((transactionResolve, transactionReject) => {
          db.run("COMMIT", function (err) {
            if (err) {
              return transactionReject(err);
            }
            transactionResolve();
          });
        });

        resolve({ user_id, username });
      } catch (error) {
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

        reject(error);
      }
    });
  }

  static findUsername(username) {
    return new Promise((resolve, reject) => {
      const sql = `
            SELECT u.id, u.email, u.password, u.role_id, ud.first_name, ud.last_name, ud.username, ud.phone_number, ud.avatar_url
            FROM users u
            LEFT JOIN user_details ud ON u.id = ud.user_id
            WHERE ud.username = ?`;
      db.get(sql, [username], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  static findUserWithEmail(email) {
    return new Promise((resolve, reject) => {
      const sql = `
            SELECT u.id, u.email, u.password, u.role_id, ud.first_name, ud.last_name, ud.username, ud.phone_number, ud.avatar_url
            FROM users u
            LEFT JOIN user_details ud ON u.id = ud.user_id
            WHERE u.email = ?`;
      db.get(sql, [email], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  static async verifyAccessToken(access_token) {
    return new Promise((resolve, reject) => {
      const decoded = jwt.verify(access_token, process.env.JWT_SECRET);
      if (!decoded) {
        return reject(new Error("Invalid access token"));
      }
      const sql = `
            SELECT u.id, u.email, u.password, u.role_id, ud.first_name, ud.last_name, ud.username, ud.phone_number, ud.avatar_url
            FROM users u
            LEFT JOIN user_details ud ON u.id = ud.user_id
            WHERE u.id = ?`;
      db.get(sql, [decoded.id], (err, row) => {
        if (err) {
          return reject(err);
        }
        resolve(row);
      });
    });
  }

  static async getFollowDetails(user_id) {
    const follower_count = await Blog.getFollowerCount(user_id);
    const following_count = await Blog.getFollowingCount(user_id);
    return { follower_count, following_count };
  }

  static async getProfileWithUsername(username, current_user_id = null) {
    const user = await User.findUsername(username);
    const follow_details = await User.getFollowDetails(user.id);

    if (current_user_id) {
      const isFollowing = await Blog.isFollowing(current_user_id, user.id);
      const isFollower = await Blog.isFollowing(user.id, current_user_id);
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role_id: user.role_id,
        first_name: user.first_name,
        last_name: user.last_name,
        phone_number: user.phone_number,
        avatar_url: user.avatar_url,
        follow_details: follow_details,
        is_following: isFollowing,
        is_followed_by: isFollower,
      };
    }
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      avatar_url: user.avatar_url,
      follow_details: follow_details,
    };
  }
}

module.exports = User;
