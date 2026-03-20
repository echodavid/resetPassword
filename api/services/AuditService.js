class AuditService {
  constructor(db) {
    this.db = db;
    this.insertLog = this.db.prepare('INSERT INTO audit_logs (action, email, ip, timestamp, details) VALUES (?, ?, ?, ?, ?)');
  }

  log(action, email, ip, details) {
    this.insertLog.run(action, email, ip, Date.now(), details);
  }
}

module.exports = AuditService;
