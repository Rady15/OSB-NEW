export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const targetUrl = 'https://ach.runasp.net' + url.pathname + url.search;
  const auth = req.headers.authorization;
  const body = req.method !== 'GET' ? JSON.stringify(req.body) : undefined;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const response = await fetch(targetUrl, { method: req.method, headers: { 'Content-Type': 'application/json', ...(auth && { Authorization: auth }) }, ...(body && { body }) });
  const data = await response.text();
  res.status(response.status).send(data);
}