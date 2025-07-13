import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

let client;
let isConnected = false;

const initRedis = async () => {
  try {
    client = redis.createClient({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT)
    });

    client.on('connect', () => {
      console.log('Client connected to Redis...');
      isConnected = true;
    });

    client.on('ready', () => {
      console.log('Client ready to use...');
    });

    client.on('error', (err) => {
      console.error('Redis error:', err.message);
    });

    client.on('end', () => {
      console.log('Client disconnected');
      isConnected = false;
    });
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    throw err;
  }
  return client;
};

const redisPromise = initRedis().catch(err => {
  console.error('Redis connection failed:', err);
  process.exit(1);
});

export { client, redisPromise, isConnected };