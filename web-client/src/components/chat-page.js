import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import socketIOClient from 'socket.io-client'
import JSONbig from 'json-bigint'
import SidebarItem from './sidebar-item'
import ChatItem from './chat-item'
import axios from 'axios'
import prettyBytes from 'pretty-bytes'

let UserList = {}

function ChatPage({ user, logout, handleRefresh }) {
  const navigate = useNavigate()
  const chatContentDom = useRef(null)
  const [message, setMessage] = useState([
    { type: 'text', content: 'Welcome! Please choose or create a channel', username: 'System', createdAt: new Date() },
  ])
  const [newMsg, setNewMsg] = useState('')
  const [currentChannel, setCurrentChannel] = useState({
    name: '',
    members: [],
    id: '',
  })
  const [channels, setChannels] = useState([])
  const [socket, setSocket] = useState(
    socketIOClient('/api/chat', {
      extraHeaders: {
        Authorization: `bearer ${user.accessToken}`,
        'X-User-Id': user.userId,
        'X-Username': user.firstname || 'Unknown',
      },
      autoConnect: false,
    })
  )

  useEffect(() => {
    socket.open()
    socket.on('connect_failed', () => {
      navigate('/')
    })
    socket.on('message', (data) => {
      setMessage((prev) => [...prev, data])
      chatContentDom.current.scrollTo({
        top: chatContentDom.current.scrollHeight,
        left: 0,
        behavior: 'smooth',
      })
    })
    socket.on('roomData', (data) => {
      setCurrentChannel((prev) => ({
        name: data.room,
        members: data.users,
        id: prev.id,
      }))
    })
    // fetch channel list
    fetchChannels()

    return () => socket.disconnect()
  }, [])

  useEffect(() => {
    if (currentChannel.name !== '') {
      socket.emit('join', { room: currentChannel.name }, (error) => {
        if (error) {
          console.log(error)
        } else {
          fetchMsgByChannels(currentChannel.id)
        }
      })
      setMessage([])
    }
  }, [currentChannel.name])

  const fetchChannels = () => {
    axios
      .get('/api/channels', {
        transformResponse: (res) => {
          return JSONbig({ storeAsString: true }).parse(res)
        },
      })
      .then((res) => {
        if (res.data.channels) {
          setChannels(res.data.channels)
        }
      })
      .catch((err) => {
        console.log(err)
        alert('Fail to get channels list')
      })
  }

  const fetchUsernameById = async (userId) => {
    return axios
      .get(`/api/account/name/${userId}`)
      .then((res) => {
        return res.data.firstname || 'Unknown'
      })
      .catch((err) => {
        console.log(err)
        return 'Unknown'
      })
  }

  const fetchMsgByChannels = (channelId) => {
    axios
      .get('/api/messages', {
        params: {
          'channel-id': channelId,
        },
        transformResponse: (res) => {
          return JSONbig({ storeAsString: true }).parse(res)
        },
      })
      .then(async (res) => {
        if (res.data.messages) {
          const msg = res.data.messages
          for (let i = 0; i < msg.length; i++) {
            if (msg[i].type === 'file' || msg[i].type === 'img') {
              let objectPayload = msg[i].content.split('#')
              msg[i].s3_url = objectPayload[0]
              msg[i].content = objectPayload[1]
              msg[i].filesize = objectPayload[2]
            }
            if (!UserList[msg[i].user_id]) {
              UserList[msg[i].user_id] = await fetchUsernameById(msg[i].user_id)
              msg[i].username = UserList[msg[i].user_id]
            } else {
              msg[i].username = UserList[msg[i].user_id]
            }
          }

          setMessage(msg.reverse())
          chatContentDom.current.scrollTo({
            top: chatContentDom.current.scrollHeight,
            left: 0,
            behavior: 'smooth',
          })
        }
      })
      .catch((err) => {
        console.log(err)
        alert('Fail to get channels list')
      })
  }

  const handleDeleteChannel = (id) => {
    axios
      .delete('/api/channel/' + id)
      .then(async (res) => {
        fetchChannels()
        setCurrentChannel({ members: [], name: '', id: '' })
      })
      .catch((err) => {
        console.log(err)
        alert('Something wrong happened when deleting channel')
      })
  }

  const handleInputKeyPress = (e) => {
    if (e.target.value !== '' && e.key === 'Enter') {
      socket.emit(
        'sendMessage',
        {
          content: e.target.value,
          type: 'text',
          s3_url: '',
          filesize: '',
          room: currentChannel.name,
          channelId: currentChannel.id,
        },
        (error) => {
          if (error) {
            console.log(error)
            alert('Fail to send message')
          }
        }
      )
      setNewMsg('')
    }
  }

  const handleNewChannelKeyPress = (e) => {
    if (channels.some((c) => c.name === e.target.value)) {
      return alert('Channel already exists')
    } else if (e.target.value !== '' && e.key === 'Enter') {
      axios
        .post('/api/channel', { name: e.target.value })
        .then((res) => {
          if (res.data.msg !== 'ok') {
            throw new Error(res.data.msg)
          } else {
            fetchChannels()
            e.target.value = ''
          }
        })
        .catch((err) => {
          console.log(err)
          alert('Fail to create new channel')
        })
    }
  }

  const handleUploadKeyDown = (file) => {
    if (file !== '') {
      const data = new FormData()
      data.append('file', file)
      axios
        .post('/api/upload', data, {
          headers: {
            Authorization: `bearer ${user.accessToken}`,
            'X-Channel-Id': currentChannel.id,
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(async (res) => {
          // call sendMsg
          const filesize = prettyBytes(file.size)
          socket.emit(
            'sendMessage',
            {
              content: res.data.orginal_filename,
              type: res.data.type,
              s3_url: res.data.s3_url,
              filesize: filesize,
              room: currentChannel.name,
              channelId: currentChannel.id,
            },

            (error) => {
              if (error) {
                console.log(error)
                alert('Fail to send message')
              }
            }
          )
        })
        .catch(async (err) => {
          if (err.response.status === 401) {
            try {
              await handleRefresh(user.refreshToken)
            } catch (err) {
              console.log(err)
              logout()
            }
          } else {
            alert('Something wrong happened')
          }
        })
    }
  }

  return (
    <>
      <div id='app'>
        <div id='sidebar' class='active'>
          <div class='sidebar-wrapper active'>
            <div class='sidebar-header'>
              <div class='d-flex justify-content-between'>
                <div class='logo'>
                  <Link to='/'>
                    <img src='assets/images/logo/logo.png' alt='Logo' />
                  </Link>
                </div>
                <div class='toggler d-sm-none'>
                  <a href='#' class='sidebar-hide d-xl-none d-block'>
                    <i class='bi bi-x bi-middle'></i>
                  </a>
                </div>
              </div>
            </div>

            <div className='sidebar-menu'>
              <ul className='menu'>
                <li className='sidebar-title'>
                  <input
                    type='text'
                    class='form-control'
                    placeholder='Create new channel'
                    onKeyPress={handleNewChannelKeyPress}
                  />
                </li>
                <li className='sidebar-title'>All Channels</li>
                {channels.map((el) => (
                  <SidebarItem
                    text={el.name}
                    onClick={() => setCurrentChannel({ members: [], name: el.name, id: el.id })}
                    onClickDelete={() => handleDeleteChannel(el.id)}
                  />
                ))}
              </ul>
            </div>
            <button className='sidebar-toggler btn x'>
              <i data-feather='x'></i>
            </button>
            <Link to='/'>
              <button class='btn btn-blue' onClick={logout}>
                Logout
              </button>
            </Link>
          </div>
        </div>
        <div id='main'>
          <header class='mb-3'>
            <a href='#' class='burger-btn d-block d-xl-none'>
              <i class='bi bi-justify fs-3'></i>
            </a>
          </header>

          <div class='page-heading'>
            <section class='section'>
              <div class='row'>
                <div class='col-md-12'>
                  <div class='card' style={{ maxHeight: '80vh' }}>
                    <div class='card-header'>
                      <div class='media d-flex align-items-center'>
                        <div class='avatar me-3'>
                          <img src='assets/images/samples/banana.jpg' alt='' />
                        </div>
                        <div class='name flex-grow-1'>
                          <h6 class='mb-0'># {currentChannel.name}</h6>
                          <span class='text-xs'>
                            {currentChannel.members.map((e, idx) => {
                              if (idx === currentChannel.members.length - 1) return e.username
                              else if (idx === currentChannel.members.length - 2) return e.username + ', and '
                              else return e.username + ', '
                            })}
                          </span>
                        </div>
                        <button class='btn btn-sm'>
                          <i data-feather='x'></i>
                        </button>
                      </div>
                    </div>
                    <div class='card-body pt-4 bg-grey' style={{ overflow: 'auto' }} ref={chatContentDom}>
                      <div class='chat-content'>
                        {message.map((el) => (
                          <ChatItem
                            content={el.content} // {filename if img,file}
                            type={el.type} // TODO {text,img,file}
                            s3_url={el.s3_url} // TODO text -> None
                            filesize={el.filesize} // TODO text,img -> None
                            time={el.createdAt || el.timestamp * 1000}
                            sender={el.username}
                            left={el.user_id !== user.userId}
                          />
                        ))}
                      </div>
                    </div>
                    <div class='card-footer'>
                      <div class='d-flex flex-grow-1 ml-4'>
                        <input
                          type='text'
                          class='form-control'
                          placeholder='Type your message..'
                          value={newMsg}
                          onKeyPress={handleInputKeyPress}
                          onChange={(e) => setNewMsg(e.target.value)}
                          disabled={currentChannel.name === ''}
                        />
                        <label for='file-upload' class='custom-file-upload'>
                          <i class='bi bi-paperclip'></i>
                        </label>
                        <input
                          id='file-upload'
                          type='file'
                          // onClick={(e) => e.target.value = ''}
                          onChange={(e) => handleUploadKeyDown(e.target.files[0])}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <footer>
              <div class='footer clearfix mb-0 text-muted'>
                <div class='float-start'>
                  <p>2021 &copy; Sendify</p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  )
}

export default ChatPage
