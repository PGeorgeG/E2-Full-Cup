const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const APP_PASSWORD = process.env.APP_PASSWORD || '';

const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

app.use((req, res, next) => {
  if (!APP_PASSWORD) return next();
  const cookies = Object.fromEntries(
    (req.headers.cookie || '').split(';').map(c => c.trim().split('=').map(decodeURIComponent))
  );
  if (cookies['fc_auth'] === APP_PASSWORD) return next();
  if (req.query.p === APP_PASSWORD) {
    res.setHeader('Set-Cookie', `fc_auth=${APP_PASSWORD}; Path=/; HttpOnly; Max-Age=2592000`);
    return res.redirect('/');
  }
  res.setHeader('Content-Type', 'text/html');
  res.status(401).send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Full Cup</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #faf6f1; color: #2c1f14; font-family: 'DM Sans', sans-serif;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .box { background: #ffffff; border: 1px solid #e8ddd4; border-radius: 16px;
           padding: 36px 32px; width: 320px; text-align: center;
           box-shadow: 0 4px 24px rgba(44,31,20,0.08); }
    h1 { font-family: Georgia, serif; font-size: 28px; color: #c1694f; margin-bottom: 6px; }
    p { font-size: 13px; color: #9a8070; margin-bottom: 24px; }
    input { width: 100%; background: #faf6f1; border: 1px solid #e8ddd4; border-radius: 8px;
            color: #2c1f14; font-size: 15px; padding: 12px 14px; outline: none;
            text-align: center; letter-spacing: 2px; margin-bottom: 14px; }
    button { width: 100%; background: #c1694f; color: white; border: none; border-radius: 8px;
             font-size: 15px; font-weight: 600; padding: 13px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Full Cup</h1>
    <p>you can't pour from an empty cup.</p>
    <form method="GET" action="/">
      <input type="password" name="p" placeholder="password" autofocus />
      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`);
});

app.get('*', (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  const injected = html.replace(
    '<!-- __API_KEY_INJECT__ -->',
    apiKey ? `<script>window.__ANTHROPIC_API_KEY__ = ${JSON.stringify(apiKey)};</script>` : ''
  );
  res.setHeader('Content-Type', 'text/html');
  res.send(injected);
});

app.listen(PORT, () => console.log(`Full Cup running on port ${PORT}`));
