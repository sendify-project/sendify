const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const { createProxyMiddleware } = require('http-proxy-middleware')

if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const SOCKET_URL = process.env.SOCKET_URL

const apiRouter = require('./routes/api')

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
// app.use(express.static(path.join(__dirname, 'public')))

app.use('/api', apiRouter)
app.use(
  '/socket.io',
  createProxyMiddleware({
    target: SOCKET_URL,
    changeOrigin: true, // needed for virtual hosted sites
    ws: true, // proxy websockets
  })
)

module.exports = app
