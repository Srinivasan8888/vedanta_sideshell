import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

let client;
let isConnected = false;

const initRedis = () => {
  return new Promise((resolve, reject) => {
    try {
      client = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            return new Error('The server refused the connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            return undefined; // End reconnecting with built in error
          }
          // Reconnect after this time
          return Math.min(options.attempt * 100, 5000);
        }
      });

      client.on('connect', () => {
        console.log('Client connected to Redis...');
      });

      client.on('ready', () => {
        console.log('Client ready to use...');
        isConnected = true;
        resolve(client);
      });

      client.on('error', (err) => {
        console.error('Redis error:', err.message);
        if (!isConnected) {
          reject(err);
        }
      });

      client.on('end', () => {
        console.log('Client disconnected');
        isConnected = false;
      });
    } catch (error) {
      console.error('Failed to initialize Redis:', error);
      reject(error);
    }
  });
};

const redisPromise = initRedis().catch(err => {
  console.error('Redis connection failed:', err);
  process.exit(1);
});

export { client, isConnected, redisPromise };