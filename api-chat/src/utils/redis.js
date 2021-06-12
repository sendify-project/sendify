const Redis = require('ioredis')
if (process.env.NODE_ENV !== 'production') require('dotenv').config()

const REDIS_ENDPOINT = process.env.REDIS_ENDPOINT

if (!REDIS_ENDPOINT) throw new Error('REDIS_ENDPOINT is not found!')

const redis = {
  pub: new Redis.Cluster([
    {
      port: parseInt(REDIS_ENDPOINT.split(':')[1]),
      host: REDIS_ENDPOINT.split(':')[0],
    },
  ]),
  sub: new Redis.Cluster([
    {
      port: parseInt(REDIS_ENDPOINT.split(':')[1]),
      host: REDIS_ENDPOINT.split(':')[0],
    },
  ]),
}

module.exports.default = redis
