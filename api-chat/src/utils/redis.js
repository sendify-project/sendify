const Redis = require('ioredis')
if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const REDIS_ENDPOINT = process.env.REDIS_ENDPOINT
const REDIS_PASSWORD = process.env.REDIS_PASSWORD

if (!REDIS_ENDPOINT) throw new Error('REDIS_ENDPOINT is not found!')
console.log({ REDIS_ENDPOINT, REDIS_PASSWORD })

const redis = {
  pub: new Redis.Cluster(
    [
      {
        port: parseInt(REDIS_ENDPOINT.split(':')[1]),
        host: REDIS_ENDPOINT.split(':')[0],
      },
    ],
    {
      redisOptions: {
        password: REDIS_PASSWORD,
      },
    }
  ),
  sub: new Redis.Cluster(
    [
      {
        port: parseInt(REDIS_ENDPOINT.split(':')[1]),
        host: REDIS_ENDPOINT.split(':')[0],
      },
    ],
    {
      redisOptions: {
        password: REDIS_PASSWORD,
      },
    }
  ),
}

module.exports.default = redis
