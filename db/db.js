const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Auto-create table on startup
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task TEXT NOT NULL
    )`,
    (err) => {
      if (err) {
        console.error("Error creating tasks table:", err);
      } else {
        console.log("Tasks table ensured.");
      }
    }
  );
});

const server = http.createServer((req, res) => {
  let body = '';

  req.on('error', (err) => {
    console.error('Request error:', err);
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Request error', message: err.message }));
  });

  req.on('data', chunk => body += chunk);

  req.on('end', () => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    let payload;
    try {
      payload = body ? JSON.parse(body) : {};
    } catch (e) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Invalid JSON', message: e.message }));
      return;
    }

    const sql = payload && typeof payload.sql === 'string' ? payload.sql : null;
    if (!sql) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Missing or invalid "sql" in request body' }));
      return;
    }

    try {
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message }));
          return;
        }
        res.statusCode = 200;
        res.end(JSON.stringify(rows));
      });
    } catch (e) {
      console.error('Unexpected error while querying DB:', e);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Unexpected server error', message: e.message }));
    }
  });
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

server.listen(8080, () => console.log('Server running on port 8080'));
