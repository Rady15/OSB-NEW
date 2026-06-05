export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  const backend = 'https://ach.runasp.net/api';
  const targetUrl = backend + req.url;
  const body = req.method !== 'GET' ? JSON.stringify(req.body) : undefined;
  const auth = req.headers.authorization;
  const response = await fetch(targetUrl, {
    method: req.method,
    headers: { 'Content-Type': 'application/json', ...(auth && { Authorization: auth }) },
    ...(body && { body })
  });
  const data = await response.text();
  res.status(response.status);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  res.send(data);
}