/**
 * better-sqlite3-compatible wrapper around Node.js built-in node:sqlite.
 * No native addons — works on any Node 22+ without rebuild.
 */
import { DatabaseSync } from "node:sqlite";

function bindArgs(args) {
  if (args.length === 1 && args[0] !== null && typeof args[0] === "object" && !Array.isArray(args[0])) {
    return args[0];
  }
  return args;
}

class CompatStatement {
  constructor(db, sql) {
    this._stmt = db.prepare(sql);
  }

  get(...args) {
    const row = this._stmt.get(...bindArgs(args));
    return row === undefined ? undefined : row;
  }

  all(...args) {
    return this._stmt.all(...bindArgs(args));
  }

  run(...args) {
    this._stmt.run(...bindArgs(args));
    return { changes: this._stmt.changes ?? 0 };
  }
}

export class SqliteCompatDatabase {
  constructor(path) {
    this._db = new DatabaseSync(path);
  }

  exec(sql) {
    this._db.exec(sql);
  }

  pragma(setting) {
    this._db.exec(`PRAGMA ${setting}`);
  }

  prepare(sql) {
    return new CompatStatement(this._db, sql);
  }

  transaction(fn) {
    return () => {
      this._db.exec("BEGIN");
      try {
        fn();
        this._db.exec("COMMIT");
      } catch (err) {
        this._db.exec("ROLLBACK");
        throw err;
      }
    };
  }

  close() {
    this._db.close();
  }
}
