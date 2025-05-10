const db = require('../config/db');
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { salt_rounds } = require("../utils/constants.util");

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
        email, password, username, first_name, last_name, phone_number, avatar_url
    ) {
        //password hashing
        const saltRounds = salt_rounds;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        return new Promise((resolve, reject) => {
            const id = uuidv4();
            const sql = `INSERT INTO users (id, email, password) VALUES (?,?,?)`;
            db.run(sql, [id, email, hashedPassword], function (err) {
                if (err) {
                    return reject(err);
                } else {
                    const user_id = id;
                    const sql = `INSERT INTO user_details (id, user_id, username, first_name, last_name, phone_number, avatar_url) VALUES (?,?,?,?,?,?,?)`;
                    db.run(
                        sql,
                        [uuidv4(), user_id, username, first_name, last_name, phone_number, avatar_url],
                        function (err) {
                            if (err) {
                                return reject(err);
                            }
                            resolve({ user_id, username });
                        }
                    );
                }
            });
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
}

module.exports = User;