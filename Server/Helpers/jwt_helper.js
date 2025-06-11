import JWT from 'jsonwebtoken';
import createError from "http-errors";
import { client } from './init_redis.js'

export const signAccessToken = (userId, role) => {
  return new Promise((resolve, reject) => {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      return reject(
        createError.InternalServerError("Access token secret is not defined")
      );
    }
    const payload = {
      audience: userId,
      name: "c3Jpbml2YXNhbg==",
      issuer: "vedanta.xyma.live",
      role
    };
    const options = {
      expiresIn: "2d",
      // expiresIn: "5m",
    };
    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        reject(createError.InternalServerError());
      }
      
      // Use user-specific key for storage
      const redisKey = `accessToken:${userId}`;
      console.log("Setting access token in Redis...");
      
      client.SETEX(redisKey, 24 * 60 * 60, token)
      // client.SETEX(redisKey, 60, token)
        .then(reply => {
          console.log("Finished setting access token in Redis.");
          resolve(token);
        })
        .catch(err => {
          console.log("Error setting access token in Redis:", err.message);
          reject(createError.InternalServerError());
        });
    });
  });
};

export const verifyAccessToken = async (req, res, next) => {
  try {
    // Authorization header check
    const authHeader = req.headers?.["authorization"];
    if (!authHeader) {
      return next(createError.Unauthorized("Missing authorization header"));
    }

    // Token extraction
    const [bearer, token] = authHeader.split(" ");
    if (bearer !== "Bearer" || !token) {
      return next(createError.Unauthorized("Invalid authorization format"));
    }

    // Secret verification
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
      throw createError.InternalServerError("Access token secret not configured");
    }

    // JWT verification
    const payload = await new Promise((resolve, reject) => {
      JWT.verify(token, secret, async (err, decoded) => {
        if (err) {
          const message =
            err.name === "TokenExpiredError"
              ? "Token expired"
              : err.name === "JsonWebTokenError"
              ? "Invalid token"
              : err.message;
          return reject(createError.Unauthorized(message));
        }
        resolve(decoded);
      });
    });

    // Validate audience claim
    const userId = payload.audience; // Use 'audience' instead of 'aud'
    if (!userId) {
      return next(createError.Unauthorized("Invalid audience claim"));
    }

    // Redis token validation
    const redisKey = `accessToken:${userId}`;
    const storedToken = await client.GET(redisKey).catch((err) => {
      // console.error("Redis error:", err.message);
      throw createError.InternalServerError("Session validation failed");
    });

    if (token !== storedToken) {
      // Send unauthorized response if tokens do not match
      return res.status(401).json({ message: "Unauthorized: Session expired or invalid" });
    }

    // Attach payload and continue
    req.payload = payload;
    next();
  } catch (error) {
    // console.error("Token verification error:", error.message);
    if (!error.status) {
      error = createError.InternalServerError("Token verification failed");
    }
    return next(error);
  }
};

export const signRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    if (!secret) {
      return reject(
        createError.InternalServerError("Refresh token secret is not defined")
      );
    }
    const payload = {
      audience: userId.toString()
    };
    const options = {
      expiresIn: "30d",
      issuer: "vedanta.xyma.live",
    };
    JWT.sign(payload, secret, options, (err, token) => {
      if (err) {
        console.log(err.message);
        reject(createError.InternalServerError());
      }
      console.log("Setting refresh token in Redis...");
      const redisKey = `refreshToken:${userId.toString()}`;
      client.SETEX(redisKey, 24 * 60 * 60, token)
        .then(reply => {
          console.log("Successfully stored refresh token");
          resolve(token);
        })
        .catch(err => {
          console.log("Redis storage error:", err.message);
          reject(createError.InternalServerError("Token storage failed"));
        });
    });
  });
};

// Standalone refresh token verification (returns Promise)
export const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    if (!refreshToken) return reject(createError.BadRequest("Refresh token required"));

    JWT.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, payload) => {
        try {
          if (err) {
            const message = err.name === 'TokenExpiredError' 
              ? 'Refresh token expired' 
              : 'Invalid refresh token';
            return reject(createError.Unauthorized(message));
          }

          const userId = payload.aud;
          const redisKey = `refreshToken:${userId}`;
          const storedToken = await client.GET(redisKey);
          
          if (!storedToken || storedToken !== refreshToken) {
            return reject(createError.Unauthorized("Refresh token revoked"));
          }
          
          resolve(userId);
        } catch (error) {
          reject(createError.InternalServerError("Token verification failed"));
        }
      }
    );
  });
};

// Middleware version for Express
export const verifyRefreshTokenMiddleware = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const userId = await verifyRefreshToken(refreshToken);
    req.userId = userId;
    next();
  } catch (error) {
    next(error);
  }
};

// Updated generateAccessToken function
export const generateAccessToken = async (refreshToken) => {
  try {
    const userId = await verifyRefreshToken(refreshToken);
    const newAccessToken = await signAccessToken(userId);
    return newAccessToken;
  } catch (error) {
    throw error;
  }
};
// export const verifyRefreshToken = (refreshToken) => {
//   return new Promise((resolve, reject) => {
//     JWT.verify(
//       refreshToken,
//       process.env.REFRESH_TOKEN_SECRET,
//       (err, payload) => {
//         if (err) return reject(createError.Unauthorized());
//         const userId = payload.aud;
//         client.GET(userId)
//           .then(result => {
//             if (refreshToken === result) return resolve(userId);
//             reject(createError.Unauthorized());
//           })
//           .catch(err => {
//             console.log(err.message);
//             reject(createError.InternalServerError());
//           });
//       }
//     );
//   });
// };