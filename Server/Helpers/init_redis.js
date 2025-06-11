import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

let client;
let isConnected = false;

const initRedis = async () => {
  client = createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  });

  client.on('connect', () => {
    console.log('Client connected to Redis...');
  });

  client.on('ready', () => {
    console.log('Client ready to use...');
    isConnected = true;
  });

  client.on('error', (err) => {
    console.error('Redis error:', err.message);
  });

  client.on('end', () => {
    console.log('Client disconnected');
    isConnected = false;
  });

  await client.connect();
  return client;
};

const redisPromise = initRedis().catch(err => {
  console.error('Redis connection failed:', err);
  process.exit(1);
});

export { client, redisPromise, isConnected };