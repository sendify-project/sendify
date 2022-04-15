const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const axios = require('axios')
const Filter = require('bad-words')
const redisAdapter = require('@socket.io/redis-adapter')
const redis = require('./utils/redis')
const { generateMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const STORE_API = process.env.STORE_API

const app = express()
const server = http.createServer(app)
const io = socketio(server, {
  cors: {
    origin: '*',
  },
})

io.adapter(redisAdapter(redis.pub, redis.sub))

const nsp = io.of('/api/chat')
const port = process.env.PORT || 3000

nsp.on('connection', (socket) => {
  const userId = socket.request.headers['x-user-id']
  const username = socket.request.headers['x-username']

  socket.on('join', (options, callback) => {
    const user = {
      id: socket.id,
      userId,
      username,
      room: options.room,
    }

    try {
      const { originRoom } = addUser(user)
      if (originRoom) {
        socket.leave(originRoom)
      }
    } catch (err) {
      console.log(err)
      return callback(err)
    }

    socket.join(user.room)

    nsp.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    })

    callback()
  })

  socket.on('sendMessage', ({ content, type, s3_url, filesize, room, channelId }, callback) => {
    const filter = new Filter()

    if (filter.isProfane(content)) {
      return callback('Profanity is not allowed!')
    }

    let data = {
      channel_id: BigInt(channelId),
      user_id: BigInt(userId),
      type: type,
      content: content,
    }
    if (type === 'file' || type === 'img') {
      data.content = `${s3_url}#${data.content}#${filesize}`
    }
    axios
      .post(`${STORE_API}/api/message`, toJson(data))
      .then((res) => {
        if (res.data.msg !== 'ok') {
          throw new Error(res.data.msg)
        } else {
          nsp.to(room).emit('message', generateMessage(channelId, userId, username, content, type, s3_url, filesize))
          callback()
        }
      })
      .catch((err) => {
        console.log(err)
        callback(err.response?.data.msg || 'fail to save to db')
      })
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      nsp.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      })
    }
  })
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`)
})

function toJson(data) {
  if (data !== undefined) {
    return JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? `${v}n` : v)).replace(/"(-?\d+)n"/g, (_, a) => a)
  }
}
