import createError from "http-errors";
import User from "../Models/User.model.js";
import { authSchema } from "../../Helpers/validation_schema.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  generateAccessToken,
  verifyAccessToken,
} from "../../Helpers/jwt_helper.js";
import { client as redisClient, redisPromise } from "../../Helpers/init_redis.js";
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import bcrypt from 'bcrypt';
import UserLog from "../Models/UserLogs.js";

const maxWrongAttemptsByIPperDay = 100;
const maxConsecutiveFailsByEmail = 5;

export const getRedisClient = async () => {
  await redisPromise;
  if (!client.isOpen) {
    console.error("Redis client is not connected yet.");
    throw new Error("Redis client is not connected yet.");
  }
  return client;
};


// Initialize rate limiters after connection
let limiterConsecutiveFailsByEmail, limiterSlowBruteByIP;

export const withRateLimiters = (fn) => {
  return async (req, res, next) => {
    await redisPromise;
    createLimiters();
    return fn(req, res, next);
  };
};

const createLimiters = () => {
  limiterConsecutiveFailsByEmail = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'login_fail_consecutive_email',
    points: maxConsecutiveFailsByEmail,
    duration: 60 * 2, // 2 minutes
    blockDuration: 60 * 2, // Block for 2 minutes after 5 attempts
    // duration: 60 * 15, // 15 minutes
    // blockDuration: 60 * 15, // Block for 15 minutes after 5 attempts
    inmemoryBlockOnConsumed: true // Keep tracking even after server restart
  });

  limiterSlowBruteByIP = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'login_fail_ip_per_day',
    points: maxWrongAttemptsByIPperDay,
    duration: 60 * 60 * 24, // 24 hours
    blockDuration: 60 * 60 * 24 // Block for 24 hours after 100 attempts
  });
};

const getIpDetails = async (req, user, method, ipOverride) => {
  let ip = ipOverride ||
           req.headers['x-forwarded-for']?.split(',')[0] ||
           req.connection?.remoteAddress ||
           req.ip;

  if (ip && ip.includes('::ffff:')) {
    ip = ip.split('::ffff:')[1];
  }

  let geoData = {};
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
    geoData = await geoRes.json();
    console.log('Captured IP:', ip);
    console.log('Geo Data:', geoData);
  } catch (err) {
    console.error("GeoIP lookup failed:", err.message);
  }

  try {
    await UserLog.create({
      userId: user._id,
      email: user.email,
      ip: geoData.query || ip,
      city: geoData.city || 'Unknown',
      country: geoData.country || 'Unknown',
      latitude: geoData.lat?.toString() || 'Unknown',
      longitude: geoData.lon?.toString() || 'Unknown',
      service: geoData.isp || 'Unknown',
      region: geoData.regionName || 'Unknown',
      method
    });
    console.log('Successfully logged:', method, 'event');
  } catch (err) {
    console.error("Failed to save login/logout event:", {
      message: err.message,
      stack: err.stack
    });
  }
};

export const register = async (req, res, next) => {
  try {
    // const { email, password } = req.body
    // if (!email || !password) throw createError.BadRequest()
    const result = await authSchema.validateAsync(req.body);

    const doesExist = await User.findOne({ email: result.email });
    if (doesExist)
      throw createError.Conflict(
        `${result.email} is already been registered`
      );

    const user = new User(result);
    const savedUser = await user.save();
    const accessToken = await signAccessToken(savedUser.id);
    const refreshToken = await signRefreshToken(savedUser.id);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};

export const login = async (req, res, next) => {
  const ipAddr = req.ip;
  const email = req.body.email;
  const emailKey = `${email}_${ipAddr}`;

  try {
    // Initialize rate limiters first
    await redisPromise;
    createLimiters();

    // Check IP-based limit
    await limiterSlowBruteByIP.consume(ipAddr);

    // Check email+IP attempts
    const resEmail = await limiterConsecutiveFailsByEmail.get(emailKey);

    if (resEmail?.consumedPoints >= maxConsecutiveFailsByEmail) {
      const retrySecs = Math.round(resEmail.msBeforeNext / 1000) || 1;
      res.set('Retry-After', retrySecs);
      return next(createError.TooManyRequests('Too many failed attempts. Please try again later.'));
    }

    // Validate credentials
    const { email: reqEmail, password } = req.body;
    if (!reqEmail || !password) {
      throw createError.BadRequest("Email and password required");
    }

    // Find user with proper error handling
    const user = await User.findOne({ email: reqEmail }).select('+password');
    if (!user) {
      throw createError.NotFound("User not registered");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError.Unauthorized("Invalid credentials");
    }

    // Reset counters on success
    await limiterConsecutiveFailsByEmail.delete(emailKey);
    await limiterSlowBruteByIP.delete(ipAddr);

    // Remove sensitive data before response
    user.password = undefined;


    // Generate tokens
    const accessToken = await signAccessToken(user._id, user.role);
    const refreshToken = await signRefreshToken(user._id);
    user.role = undefined;

    await getIpDetails(req, user, 'login');
    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user
    });
   
  } catch (error) {
    console.error(`Login error for ${email}:`, error.stack);

    // Handle specific error types first
    if (error.name === 'MongoError' || error.name === 'MongoNetworkError') {
      console.error('Database error:', error.message);
      error = createError.InternalServerError('Database connection issue');
      return next(error);
    }

    // Handle rate limiter errors separately
    if (error instanceof RateLimiterRes) {
      const retrySecs = Math.round(error.msBeforeNext / 1000) || 1;
      res.set('Retry-After', retrySecs);
      return next(createError.TooManyRequests('Too many attempts. Please try again later.'));
    }

    // Only apply rate limits for authentication failures
    if (error.status === 401 || error.status === 404) {
      try {
        await Promise.all([
          limiterConsecutiveFailsByEmail.consume(emailKey),
          limiterSlowBruteByIP.consume(ipAddr)
        ]);
        console.log(`Rate limited ${emailKey}`);
      } catch (rlError) {
        const retrySecs = Math.round(rlError.msBeforeNext / 1000) || 1;
        res.set('Retry-After', retrySecs);
        return next(createError.TooManyRequests('Too many attempts. Please try again later.'));
      }
    }

    // Preserve original error status if available
    const status = error.status || 500;
    const message = status === 500 ? 'Internal server error' : error.message;

    next(createError(status, message));
  }
};


export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken);

    const accessToken = await signAccessToken(userId);
    const refToken = await signRefreshToken(userId);
    res.send({ accessToken: accessToken, refreshToken: refToken });
  } catch (error) {
    next(error);
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    res.send({
      success: true,
      message: "Authorized",
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken, email } = req.body;
    if (!refreshToken) throw createError.BadRequest("Refresh token is required");

    const userId = await verifyRefreshToken(refreshToken);
    const user = await User.findById(userId);

    console.log("Calling getIpDetails...");
    await getIpDetails(req, user, 'logout');

    await redisClient.del(userId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.sendStatus(204);
  } catch (error) {
    console.error("Logout error:", error.message);

    // Use email from request if available
    const { email } = req.body;
    await getIpDetails(req, { _id: "unknown", email: email || "unknown" }, 'logout');

    res.clearCookie('refreshToken');
    next(createError.Unauthorized("Session terminated"));
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest("Refresh token required");
    
    // Generate new access token using the refresh token
    const accessToken = await generateAccessToken(refreshToken);
    
    // Explicitly send the access token in the response
    res.json({ 
      accessToken,
      message: "New access token generated successfully"
    });
    
  } catch (error) {
    next(error);
  }
};
  
export const getRole = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user in database
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if the user has admin access
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin or Superadmin role required.'
      });
    }

    return res.status(200).json({
      success: true,
      role: user.role,
      message: 'Access verified'
    });

  } catch (error) {
    console.error('Error in getRole:', error);
    next(error);
  }
}