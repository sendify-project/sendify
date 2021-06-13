function ChatItem({ text, type, time, sender, left }) {
  if (left) {
    // TODO
    if (type === 'text') {
      return (
        <div class='chat chat-left'>
          <div class='chat-body'>
            <div class='chat-message'>
              <div class='avatar'>
                <img src={`https://avatars.dicebear.com/api/identicon/${sender}.svg?mood[]=happy`} alt='' />
              </div>
              {text}
              <br />
              <span style={{ fontSize: 'xx-small' }}>{time}</span>
            </div>
          </div>
        </div>
      )
    } else if (type === 'file') {
      return (
        <div class='chat chat-left'>
          <div class='chat-body'>
            <div class='chat-message'>
              <div class='avatar'>
                <img src={`https://avatars.dicebear.com/api/identicon/${sender}.svg?mood[]=happy`} alt='' />
              </div>
              <div class='row'>
                <div class='col-md-4'>
                  <i class='bi bi-file-earmark-text fs-1'></i>
                </div>
                <div class='col-md-8'>
                  test.csv <br />
                  <span class='small'>23.1 MB</span>
                </div>
              </div>
              <span style='font-size:small;'>
                |{' '}
                <a href='#' style='border: 0px;'>
                  Save
                </a>{' '}
                |{' '}
              </span>
              <span style='font-size:xx-small;'>1:30 PM</span>
            </div>
          </div>
        </div>
      )
    } else if (type === 'img') {
      return (
        <div class='chat chat-left'>
          <div class='chat-body'>
            <div class='chat-message'>
              <div class='avatar'>
                <img
                  src='https://avatars.dicebear.com/api/identicon/user-35739758012609632043.svg?mood[]=happy'
                  alt=''
                />
              </div>
              <a type='button' data-bs-toggle='modal' data-bs-target='#photoPreview' style='border: 0px;'>
                <img src='assets/images/samples/building.jpg' onclick='setImg(this)' />
              </a>
              <br />
              <span style='font-size:small;'>
                |{' '}
                <a href='#' style='border: 0px;'>
                  Save
                </a>{' '}
                |{' '}
              </span>
              <span style='font-size:xx-small;'>1:15 PM</span>
            </div>
          </div>
        </div>
      )
    }
  } else {
    return (
      <div class='chat'>
        <div class='chat-body'>
          <div class='chat-message'>
            {text}
            <br />
            <span style={{ fontSize: 'xx-small' }}>{time}</span>
          </div>
        </div>
      </div>
    )
  }
}

export default ChatItem
