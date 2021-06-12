function ChatItem({ text, time, sender, left }) {
  if (sender !== 'me' || left)
    // TODO
    return (
      <div class='chat chat-left'>
        <div class='chat-body'>
          <div class='chat-message'>
            <div class='avatar'>
              <img src='assets/images/faces/1.jpg' alt='' />
              <span class='avatar-status bg-success'></span>
            </div>
            {text}
            <br />
            <span style={{ fontSize: 'xx-small' }}>{time}</span>
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
            <span style={{ fontSize: 'xx-small' }}>{time}</span>
          </div>
        </div>
      </div>
    )
}

export default ChatItem
