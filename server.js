const express = require('express')
const app = express()
const PORT = process.env.PORT || 5000
const csv = require('csv-parser')
const fs = require('fs')
const cors = require('cors')

const router = express.Router()

app.use(cors())

let results = []

fs.createReadStream('./big-mac-index/data/big-mac-index.csv')
  .pipe(csv())
  .on('data', (data) => {
    results.push(data)
  })
  .on('end', () => {
    console.log(`FIN`)
  })

router.get('/', async (req, res) => {
  const ip = Object.values(require('os').networkInterfaces())
    .flat()
    .filter((item) => !item.internal && item.family === 'IPv4')
    .find(Boolean).address

  res.json({ results, ip })
})

app.use(router)

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
