function ChatItem({ text, time, sender, left }) {
  if (left)
    // TODO
    return (
      <div class='chat chat-left'>
        <div class='chat-body'>
          <div class='chat-message'>
            <div class='avatar'>
              <span class='avatar-status bg-success'></span>
              <img src='assets/images/faces/1.jpg' alt='' />
              &nbsp; {sender}
            </div>
            {text}
            <br />
            <span style={{ fontSize: 'xx-small' }}>{new Date(time).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    )
  else
    return (
      <div class='chat'>
        <div class='chat-body'>
          <div class='chat-message'>
            {text}
            <br />
            <span style={{ fontSize: 'xx-small' }}>{new Date(time).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    )
}

export default ChatItem
