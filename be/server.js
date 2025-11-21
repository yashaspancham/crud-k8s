const http = require('http');

const DB_URL = process.env.DB_URL || 'http://localhost:8080';

const query = async (sql) => {
  const res = await fetch(DB_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql })
  });
  return res.json();
};

const listTasks = async (req, res) => {
  const tasks = await query('SELECT * FROM tasks');
  res.end(JSON.stringify(tasks));
};

const createTask = async (req, res) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    const { task } = JSON.parse(body);
    await query(`INSERT INTO tasks (task) VALUES ("${task}")`);
    res.end(JSON.stringify({ success: true }));
  });
};

const updateTask = async (req, res, id) => {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    const { task } = JSON.parse(body);
    await query(`UPDATE tasks SET task="${task}" WHERE id=${id}`);
    res.end(JSON.stringify({ success: true }));
  });
};

const deleteTask = async (req, res, id) => {
  await query(`DELETE FROM tasks WHERE id=${id}`);
  res.end(JSON.stringify({ success: true }));
};

http.createServer(async (req, res) => {

  // ✅ CORS HEADERS FIX
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    return res.end();
  }

  res.setHeader('Content-Type', 'application/json');

  const [_, endpoint, id] = req.url.split('/');
  
  try {
    if (endpoint === 'listTasks' && req.method === 'GET') {
      await listTasks(req, res);
    } else if (endpoint === 'tasks' && req.method === 'POST') {
      await createTask(req, res);
    } else if (endpoint === 'tasks' && req.method === 'PUT' && id) {
      await updateTask(req, res, id);
    } else if (endpoint === 'tasks' && req.method === 'DELETE' && id) {
      await deleteTask(req, res, id);
    } else {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message }));
  }

}).listen(3000, () => console.log('API server running on port 3000'));
