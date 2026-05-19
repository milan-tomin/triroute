export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: 'Missing path' });

  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });

  const stravaUrl = `https://www.strava.com/api/v3/${Array.isArray(path) ? path.join('/') : path}`;
  const queryParams = { ...req.query };
  delete queryParams.path;

  const queryString = new URLSearchParams(queryParams).toString();
  const fullUrl = queryString ? `${stravaUrl}?${queryString}` : stravaUrl;

  try {
    const stravaRes = await fetch(fullUrl, {
      method: req.method === 'POST' ? 'POST' : 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      ...(req.method === 'POST' ? { body: JSON.stringify(req.body) } : {}),
    });

    const data = await stravaRes.json();
    return res.status(stravaRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
