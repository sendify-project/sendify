const express = require('express')
const router = express.Router()
const axios = require('axios')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const FormData = require('form-data')
const fs = require('fs')

if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const ACCOUNT_API = process.env.ACCOUNT_API
const OBJECT_API = process.env.OBJECT_API

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
    .get(`${ACCOUNT_API}/api/account`, { headers: { Authorization: req.get('Authorization') } })
    .then((result) => {
      console.log(result.data)
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

router.post('/upload', upload.single('file'), function (req, res, next) {
  const data = new FormData()
  data.append('file', fs.createReadStream(req.file.path))
  axios
    .post(`${OBJECT_API}/upload`, {
      data: data,
      headers: {
        'X-User-Id': req.get('X-User-Id'),
        'X-Channel-Id': req.get('X-Channel-Id'),
        'Content-Type': req.get('Content-Type'),
      },
    })
    .then((result) => {
      console.log(result.data)
      res.send(result.data)
    })
    .catch((err) => {
      console.log({
        data: data,
        headers: {
          'X-User-Id': req.get('X-User-Id'),
          'X-Channel-Id': req.get('X-Channel-Id'),
          'Content-Type': req.get('Content-Type'),
        },
      })
      if (err.response) res.send(err.response.data).status(err.response.status)
      else res.send('internal error').status(500)
    })
})

module.exports = router
