// const generateMessage = (channelId, userId, username, text) => {
//   return {
//     channel_id: channelId,
//     user_id: userId,
//     username,
//     type: 'text',
//     content: text,
//     createdAt: new Date().getTime(),
//   }
// }
const generateMessage = (channelId, userId, username, text, type, s3_url, filesize) => {
  return {
    channel_id: channelId,
    user_id: userId,
    username,
    type: type,
    content: text,
    createdAt: new Date().getTime(),
    s3_url: s3_url,
    filesize: filesize
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
