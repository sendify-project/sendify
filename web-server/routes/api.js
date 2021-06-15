const express = require('express')
const router = express.Router()
const axios = require('axios')
const JSONbig = require('json-bigint')
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware')

if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const ACCOUNT_API = process.env.ACCOUNT_API
const STORE_API = process.env.STORE_API

router.post('/login', function (req, res, next) {
  axios
    .post(`${ACCOUNT_API}/api/login`, req.body)
    .then((result) => {
      console.log(result.data)
      res.send(result.data)
    })
    .catch((err) => {
      console.log(err)
      res.send('internal error').status(500)
    })
})

router.post('/signup', function (req, res, next) {
  axios
    .post(`${ACCOUNT_API}/api/signup`, req.body)
    .then((result) => {
      console.log(result.data)
      res.send(result.data)
    })
    .catch((err) => {
      console.log(err)
      if (err.response) res.send(err.response.data).status(err.response.status)
      else res.send('internal error').status(500)
    })
})

router.get('/account', function (req, res, next) {
  console.log({ Authorization: req.get('Authorization') })
  axios
    .get(`${ACCOUNT_API}/api/account`, {
      headers: { Authorization: req.get('Authorization') },
      transformResponse: (res) => {
        return JSONbig.parse(res)
      },
    })
    .then((result) => {
      if (result.data.id) result.data.id = result.data.id.toString()
      res.send(result.data)
    })
    .catch((err) => {
      if (err.response) {
        console.log(err.response)
        res.send(err.response.data).status(err.response.status)
      } else {
        console.log(err)
        res.send('internal error').status(500)
      }
    })
})

router.use(
  ['/channel', '/channels', '/message', '/messages'],
  createProxyMiddleware({
    target: STORE_API,
    changeOrigin: true,
    ws: false,
    onProxyReq: fixRequestBody,
  })
)

module.exports = router
