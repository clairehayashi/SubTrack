import 'dotenv/config'
import express from 'express'
import subscriptionsRouter from './routes/subscriptions.js'
import accountsRouter from './routes/accounts.js'
import settingsRouter from './routes/settings.js'
const app = express()
const { PORT = 3001, FRONTEND_URL = 'http://localhost:5173' } = process.env
const origins = FRONTEND_URL.split(',')
  .map((v) => v.trim())
  .filter(Boolean)
app.disable('x-powered-by')
app.use((req, res, next) => {
  const origin = req.headers.origin
  res.vary('Origin')
  if (origin && !origins.includes(origin))
    return res.status(403).json({ error: 'Origin not allowed.' })
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})
app.use(express.json({ limit: '32kb' }))
app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/subscriptions', subscriptionsRouter)
app.use('/api/accounts', accountsRouter)
app.use('/api/settings', settingsRouter)
app.use((_req, res) => res.status(404).json({ error: 'Endpoint not found.' }))
app.use((err, _req, res, _next) => {
  const status =
    err.status ||
    (['23503', '23514', '22P02', '22007', '22008'].includes(err.code)
      ? 400
      : err.code === '23505'
        ? 409
        : err.code === '42501'
          ? 403
          : 500)
  if (status >= 500)
    console.error('API error:', err.code || err.name || 'Unknown')
  res
    .status(status)
    .json({
      error:
        status >= 500
          ? 'Unable to save or load your data. Check the API configuration and database migration.'
          : status === 413
            ? 'Request is too large.'
            : err.message || 'Request could not be completed.'
    })
})
if (!process.env.VERCEL)
  app.listen(PORT, () => console.log(`SubTrack API running on :${PORT}`))
export default app
