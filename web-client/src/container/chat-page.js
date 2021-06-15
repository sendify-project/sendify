import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import socketIOClient from 'socket.io-client'
import JSONbig from 'json-bigint'
import SidebarItem from 'components/sidebar-item'
import ChatItem from 'components/chat-item'
import 'index.css'
import axios from 'axios'
import prettyBytes from 'pretty-bytes'

function ChatPage({ user, logout }) {
  const chatContentDom = useRef(null)
  const [message, setMessage] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [currentChannel, setCurrentChannel] = useState({
    name: '',
    members: [],
    id: '',
  })
  const [channels, setChannels] = useState([])
  const [socket, setSocket] = useState(
    socketIOClient('/sendify', {
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
    socket.on('message', (data) => {
      console.log({ message: data })
      setMessage((prev) => [...prev, data])
      chatContentDom.current.scrollTo({
        top: chatContentDom.current.scrollHeight,
        left: 0,
        behavior: 'smooth',
      })
    })
    socket.on('roomData', (data) => {
      console.log({ roomData: data })
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
      console.log({ room: currentChannel.name })
      socket.emit('join', { room: currentChannel.name }, (error) => {
        if (error) {
          console.log(error)
          alert(error)
        } else {
          fetchMsgByChannels(currentChannel.id)
        }
      })
      setMessage([])
    }
  }, [user.name, currentChannel.name])

  const fetchChannels = () => {
    axios
      .get('/api/channels', {
        transformResponse: (res) => {
          return JSONbig({ storeAsString: true }).parse(res)
        },
      })
      .then((res) => {
        console.log({ channelList: res.data })
        if (res.data.channels) {
          setChannels(res.data.channels)
        }
      })
      .catch((err) => {
        console.log(err)
        alert('fail to get channels list')
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
      .then((res) => {
        console.log({ messageList: res.data })
        if (res.data.messages) {
          const msg = res.data.messages
          msg.sort((a, b) => a.createdAt - b.createdAt)
          setMessage(msg)
          chatContentDom.current.scrollTo({
            top: chatContentDom.current.scrollHeight,
            left: 0,
            behavior: 'smooth',
          })
        }
      })
      .catch((err) => {
        console.log(err)
        alert('fail to get channels list')
      })
  }

  const handleInputKeyPress = (e) => {
    if (e.target.value !== '' && e.key === 'Enter') {
      const username = user.firstname
      console.log({ username, room: currentChannel.name, message: e.target.value, channelId: currentChannel.id })
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
            alert('fail to send message')
          }
        }
      )
      setNewMsg('')
    }
  }

  const handleNewChannelKeyPress = (e) => {
    if (e.target.value !== '' && e.key === 'Enter') {
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
          alert('fail to create new channel')
        })
    }
  }

  const handleUploadKeyDown = (file) => {
    if (file !== '') {
      const data = new FormData()
      data.append('file', file)
      axios
        .post('https://sendify-beta.csie.org/upload', data, {
          headers: {
            Authorization: `bearer ${user.accessToken}`,
            'X-Channel-Id': currentChannel.id,
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(async (res) => {
          alert(res.status)
          console.log(res)

          // call sendMsg
          const username = user.firstname
          const filesize = prettyBytes(file.size)
          console.log({
            username,
            room: currentChannel.name,
            content: res.data.orginal_filename,
            type: res.data.type,
            s3_url: res.data.s3_url,
            filesize: filesize,
            room: currentChannel.name,
            channelId: currentChannel.id,
          })
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
                alert('fail to send message')
              }
            }
          )
        })
        .catch((err) => {
          console.log(err)
          alert('Something wrong occurs')
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
                            time={el.createdAt}
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
      <div
        class='modal fade'
        id='photoPreview'
        tabIndex={-1}
        role='dialog'
        aria-labelledby='exampleModalCenterTitle'
        aria-hidden='true'
      >
        <div class='modal-dialog modal-dialog-centered modal-dialog-centered modal-dialog-scrollable' role='document'>
          <img id='photo' style={{ maxWidth: '-webkit-fill-available' }} />
        </div>
      </div>
    </>
  )
}

export default ChatPage
