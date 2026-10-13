const express = require('express')
const cors = require('cors')
const { router } = require('./routes')
const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json({ limit: '1mb' }))
app.use('/api', router)
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ success: false, message: 'Unexpected server error' })
})
app.listen(PORT, () => console.log(`Patient transport demo API listening on http://localhost:${PORT}`))
