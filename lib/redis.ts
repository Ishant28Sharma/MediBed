import Redis from 'ioredis'

const redisClientSingleton = () => {
  return new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 2) return null; // stop retrying after 2 attempts
      return Math.min(times * 200, 1000);
    }
  })
}

declare global {
  var redisGlobal: undefined | ReturnType<typeof redisClientSingleton>
}

const redis = globalThis.redisGlobal ?? redisClientSingleton()

export default redis

if (process.env.NODE_ENV !== 'production') globalThis.redisGlobal = redis
