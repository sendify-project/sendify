import { useState } from 'react'
import { Link } from 'react-router-dom'
import SidebarItem from 'components/sidebar-item'
import ChatItem from 'components/chat-item'

function ChatPage() {
  const [currentChannel, setCurrentChannel] = useState({
    name: 'ntuim',
    members: [{ name: 'Katherine' }, { name: 'Wendy' }, { name: 'Ming' }, { name: 'Sam' }],
    message: [], // TODO {text, time, sender}
    channals: [], // TODO 
  })

  const handleClick = (e) => {
    console.log(e)
  }

  return (
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
              <div class='toggler'>
                <a href='#' class='sidebar-hide d-xl-none d-block'>
                  <i class='bi bi-x bi-middle'></i>
                </a>
              </div>
            </div>
          </div>
          <div class='sidebar-menu'>
            <ul class='menu'>
              {/* <li class='sidebar-title'>Pinned Channels</li>

              <li class='sidebar-item'>
                <a href='index.html' class='sidebar-link'>
                  <span># ntuim</span>
                </a>
              </li> */}

              <li class='sidebar-title'>All Channels</li>
              {/* TODO */}
              <SidebarItem text='ntuim' />
              <SidebarItem text='family' />
              <SidebarItem text='wendy' />
            </ul>
          </div>
          <button class='sidebar-toggler btn x'>
            <i data-feather='x'></i>
          </button>
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
                            if (idx === currentChannel.members.length - 1) return e.name
                            else if (idx === currentChannel.members.length - 2) return e.name + ', and '
                            else return e.name + ', '
                          })}
                        </span>
                      </div>
                      <button class='btn btn-sm'>
                        <i data-feather='x'></i>
                      </button>
                    </div>
                  </div>
                  <div class='card-body pt-4 bg-grey' style={{ overflow: 'auto' }}>
                    <div class='chat-content'>
                      {/* TODO */}
                      <ChatItem text='Hi Alfy, how can i help you?' time='1:05 PM' sender='me' />
                      <ChatItem text='幹你娘?' time='1:05 PM' sender='A' />
                    </div>
                  </div>
                  <div class='card-footer'>
                    <div class='d-flex flex-grow-1 ml-4'>
                      <input type='text' class='form-control' placeholder='Type your message..' />
                      <input id='file' type='file' onchange='upload(this)' style={{ display: 'none' }} />
                      <button class='btn btn-outline-secondary' type='button' id='button' onclick='file.click()'>
                        <i class='bi bi-paperclip'></i>
                      </button>
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
  )
}

export default ChatPage
