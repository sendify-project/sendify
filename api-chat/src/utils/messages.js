const generateMessage = (channelId, userId, username, text, type, s3_url, filesize) => {
  return {
    channel_id: channelId,
    user_id: userId,
    username,
    type: type,
    content: text,
    createdAt: new Date().getTime(),
    s3_url: s3_url,
    filesize: filesize,
  }
}

module.exports = {
  generateMessage,
}
