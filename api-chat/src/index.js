const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const axios = require('axios')
const JSONbig = require('json-bigint')
const Filter = require('bad-words')
const redisAdapter = require('@socket.io/redis-adapter')
const redis = require('./utils/redis')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
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

const nsp = io.of('/sendify')
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

nsp.on('connection', (socket) => {
  console.log('New WebSocket connection')
  console.log(socket.request.headers)
  const userId = socket.request.headers['x-user-id']
  const username = socket.request.headers['x-username']

  socket.on('join', (options, callback) => {
    const user = {
      id: socket.id,
      userId,
      username,
      room: options.room,
    }
    console.log({ user })

    try {
      const { originRoom } = addUser(user)
      console.log({ originRoom })
      if (originRoom) {
        console.log(`${username} leave room ${originRoom}`)
        socket.leave(originRoom)
      }
    } catch (err) {
      console.log(err)
      return callback(err)
    }

    socket.join(user.room)
    console.log('A new user joined' + JSON.stringify(user))

    // socket.emit('message', generateMessage('Admin', 'Welcome!'))
    // socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
    nsp.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    })

    callback()
  })

  socket.on('sendMessage', ({ content, type, s3_url, filesize, room, channelId }, callback) => {
    // const user = getUser(socket.id)
    const filter = new Filter()

    if (filter.isProfane(content)) {
      return callback('Profanity is not allowed!')
    }

    let data = {
      channel_id: BigInt(channelId),
      user_id: BigInt(userId),
      type: type,
      content: content
    }
    if (type === "file" || type === "img") {
      data.content = `${s3_url}#${data.content}#${filesize}`
    }
    console.log(toJson(data))
    axios
      .post(`${STORE_API}/api/message`, toJson(data))
      .then((res) => {
        console.log(res.data)
        if (res.data.msg !== 'ok') {
          throw new Error(res.data.msg)
        } else {
          console.log(`A user "${username}" send message: "${content}" from room ${room}`)
          // nsp.to(room).emit('message', generateMessage(channelId, userId, username, message))
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
    console.log('A user disconnected')
    const user = removeUser(socket.id)

    if (user) {
      // nsp.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
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
