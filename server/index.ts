import express from 'express'

const app = express()
const port = Number(process.env.PORT ?? 3001)

app.disable('x-powered-by')
app.use(express.json({ limit: '32kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, mode: 'guest', cloudSave: 'disabled-pending-review' })
})

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
