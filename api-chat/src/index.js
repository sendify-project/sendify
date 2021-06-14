const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const redisAdapter = require('@socket.io/redis-adapter')
const redis = require('./utils/redis')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

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

    socket.emit('message', generateMessage('Admin', 'Welcome!'))
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))
    nsp.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    })

    callback()
  })

  socket.on('sendMessage', ({ message, room }, callback) => {
    // const user = getUser(socket.id)
    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!')
    }

    console.log(`A user "${username}" send message: "${message}" from room ${room}`)
    nsp.to(room).emit('message', generateMessage(userId, username, message))
    callback()
  })

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id)
    nsp
      .to(user.room)
      .emit(
        'locationMessage',
        generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
      )
    callback()
  })

  socket.on('disconnect', () => {
    console.log('A user disconnected')
    const user = removeUser(socket.id)

    if (user) {
      nsp.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
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
