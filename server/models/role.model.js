const db = require("../config/db");

class Role {
  static createTable() {
    const sql = `
                CREATE TABLE IF NOT EXISTS roles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    role_name TEXT NOT NULL,
                    created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            `;
    return db.run(sql);
  }

  static createRole(role_name) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO roles (role_name) VALUES (?)`;
      db.run(sql, [role_name], function (err) {
        if (err) {
          return reject(err);
        }
        resolve({ role_id: this.lastID, role_name });
      });
    });
  }
}

module.exports = Role;
