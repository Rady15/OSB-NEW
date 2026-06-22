export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const targetUrl = 'https://ach.runasp.net' + url.pathname + url.search;
  const auth = req.headers.authorization;
  const contentType = req.headers['content-type'] || 'application/json';
  const isFormData = contentType.startsWith('multipart/form-data');

  const fetchHeaders = {
    ...(auth && { Authorization: auth }),
  };

  let body;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    if (isFormData) {
      fetchHeaders['Content-Type'] = contentType;
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = Buffer.concat(chunks);
    } else {
      fetchHeaders['Content-Type'] = 'application/json';
      body = JSON.stringify(req.body);
    }
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const response = await fetch(targetUrl, {
    method: req.method,
    headers: fetchHeaders,
    ...(body && { body })
  });

  const data = await response.text();
  res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
  res.status(response.status).send(data);
}
