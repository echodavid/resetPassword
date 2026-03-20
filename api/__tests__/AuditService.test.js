const AuditService = require('../services/AuditService');
const Database = require('better-sqlite3');

describe('AuditService', () => {
	let db;
	let service;

	beforeEach(() => {
		db = new Database(':memory:');
		db.exec(`CREATE TABLE audit_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, action TEXT, email TEXT, ip TEXT, timestamp INTEGER, details TEXT)`);
		service = new AuditService(db);
	});

	afterEach(() => {
		db.close();
	});

	test('log should insert into DB', () => {
		service.log('action', 'email', 'ip', 'details');
		const row = db.prepare('SELECT * FROM audit_logs WHERE action = ?').get('action');
		expect(row).toEqual({
			id: 1,
			action: 'action',
			email: 'email',
			ip: 'ip',
			timestamp: expect.any(Number),
			details: 'details'
		});
	});
});
// ...existing code from __tests__/AuditService.test.js...
