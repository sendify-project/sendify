const generateMessage = (channelId, userId, username, text) => {
  return {
    channel_id: channelId,
    user_id: userId,
    username,
    type: 'text',
    content: text,
    createdAt: new Date().getTime(),
  }
}

const generateLocationMessage = (username, url) => {
  return {
    username,
    url,
    createdAt: new Date().getTime(),
  }
}

module.exports = {
  generateMessage,
  generateLocationMessage,
}
