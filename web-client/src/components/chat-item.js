const setImg = (e) => {
  alert('hi')
  document.getElementById('photo').src = e.target.src
}
function ChatItem({ content, type, s3_url, time, sender, left, filesize }) {
  // console.log(text, type, s3_url, time, sender, left, filesize)
  if (left) {
    if (type === 'file') {
      return (
        <div class='chat chat-left'>
          <div class='chat-body'>
            <div class='chat-message'>
              <div class='avatar'>
                <img
                  src={`https://avatars.dicebear.com/api/identicon/${sender}.svg?mood[]=happy`}
                  alt=''
                  style={{ 'background-color': 'white' }}
                />
                &nbsp; {sender}
              </div>
              <div class='row'>
                <div class='col-md-4'>
                  <i class='bi bi-file-earmark-text fs-1'></i>
                </div>
                <div class='col-md-8'>
                  {content} <br />
                  <span class='small'>{filesize}</span>
                </div>
              </div>
              <span style={{ fontSize: 'small' }}>
                |{' '}
                <a href={`${s3_url}`} style={{ border: 0 + 'px;' }}>
                  Save
                </a>{' '}
                |{' '}
              </span>
              <span style={{ fontSize: 'xx-small' }}>{new Date(time).toLocaleTimeString()}</span>
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
                  src={`https://avatars.dicebear.com/api/identicon/${sender}.svg?mood[]=happy`}
                  alt=''
                  style={{ 'background-color': 'white' }}
                />
                &nbsp; {sender}
              </div>
              <a type='button' data-bs-toggle='modal' data-bs-target='#photoPreview' style={{ border: 0 + 'px;' }}>
                <img src={`${s3_url}`} onClick={{ setImg }} />
              </a>
              <br />
              <span style={{ fontSize: 'small' }}>
                |{' '}
                <a href={`${s3_url}`} style={{ border: 0 + 'px;' }}>
                  Save
                </a>{' '}
                |{' '}
              </span>
              <span style={{ fontSize: 'xx-small' }}>{new Date(time).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div class='chat chat-left'>
          <div class='chat-body'>
            <div class='chat-message'>
              <div class='avatar'>
                <img
                  src={`https://avatars.dicebear.com/api/identicon/${sender}.svg?mood[]=happy`}
                  alt=''
                  style={{ 'background-color': 'white' }}
                />
                &nbsp; {sender}
              </div>
              {content}
              <br />
              <span style={{ fontSize: 'xx-small' }}>{new Date(time).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )
    }
  } else {
    if (type === 'file') {
      return (
        <div class='chat'>
          <div class='chat-body'>
            <div class='chat-message'>
              <div class='avatar'>
                <img
                  src={`https://avatars.dicebear.com/api/identicon/${sender}.svg?mood[]=happy`}
                  alt=''
                  style={{ 'background-color': 'white' }}
                />
                &nbsp; {sender}
              </div>
              <div class='row'>
                <div class='col-md-4'>
                  <i class='bi bi-file-earmark-text fs-1'></i>
                </div>
                <div class='col-md-8'>
                  {content} <br /> <span class='small'>{filesize}</span>
                </div>
              </div>
              <span style={{ fontSize: 'small' }}>
                |{' '}
                <a href={`${s3_url}`} style={{ border: 0 + 'px;' }}>
                  Save
                </a>{' '}
                |{' '}
              </span>
              <span style={{ fontSize: 'xx-small' }}>{new Date(time).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )
    } else if (type === 'img') {
      return (
        <div class='chat'>
          <div class='chat-body'>
            <div class='chat-message'>
              <div class='avatar'>
                <img
                  src={`https://avatars.dicebear.com/api/identicon/${sender}.svg?mood[]=happy`}
                  alt=''
                  style={{ 'background-color': 'white' }}
                />
                &nbsp; {sender}
              </div>
              <a type='button' data-bs-toggle='modal' data-bs-target='#photoPreview' style={{ border: 0 + 'px;' }}>
                <img src={`${s3_url}`} onClick={{ setImg }} />
              </a>
              <br />
              <span style={{ fontSize: 'small' }}>
                |{' '}
                <a href={`${s3_url}`} style={{ border: 0 + 'px;' }}>
                  Save
                </a>{' '}
                |{' '}
              </span>
              <span style={{ fontSize: 'xx-small' }}>{new Date(time).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div class='chat'>
          <div class='chat-body'>
            <div class='chat-message'>
              <div class='avatar'>
                <img
                  src={`https://avatars.dicebear.com/api/identicon/${sender}.svg?mood[]=happy`}
                  alt=''
                  style={{ 'background-color': 'white' }}
                />
                &nbsp; {sender}
              </div>
              {content}
              <br />
              <span style={{ fontSize: 'xx-small' }}>{new Date(time).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )
    }
  }
}

export default ChatItem
