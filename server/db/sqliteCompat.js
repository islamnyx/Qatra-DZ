/**
 * better-sqlite3-compatible wrapper around Node.js built-in node:sqlite.
 * No native addons — works on any Node 22+ without rebuild.
 */
import { DatabaseSync } from "node:sqlite";

function isNamedParams(arg) {
  return arg !== null && typeof arg === "object" && !Array.isArray(arg);
}

function execStmt(stmt, method, args) {
  if (args.length === 1 && isNamedParams(args[0])) {
    return stmt[method](args[0]);
  }
  return stmt[method](...args);
}

class CompatStatement {
  constructor(db, sql) {
    this._stmt = db.prepare(sql);
  }

  get(...args) {
    const row = execStmt(this._stmt, "get", args);
    return row === undefined ? undefined : row;
  }

  all(...args) {
    return execStmt(this._stmt, "all", args);
  }

  run(...args) {
    execStmt(this._stmt, "run", args);
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
