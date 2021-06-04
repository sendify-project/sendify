var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const { createProxyMiddleware } = require('http-proxy-middleware')

if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const ACCOUNT_API = process.env.ACCOUNT_API

var apiRouter = require('./routes/api')

var app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api', apiRouter)
// app.use('/api', createProxyMiddleware({ target: ACCOUNT_API, changeOrigin: true }))

module.exports = app
