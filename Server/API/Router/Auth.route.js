import express from 'express'
import { register, login, refreshToken, verifyToken, logout, withRateLimiters, refreshAccessToken, getRole } from '../Controller/Auth.Controller.js'
import { verifyAccessToken, verifyRefreshToken, generateAccessToken, verifyRefreshTokenMiddleware } from '../../Helpers/jwt_helper.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', withRateLimiters(login))
router.post('/refresh-token', refreshToken)
router.delete('/logout', logout)
router.post('/get-role', getRole)


//JWT Helper
router.get('/access-token', verifyAccessToken, verifyToken);

router.post('/access-token-generate', refreshAccessToken);

// router.get('/verify-refresh-token', verifyRefreshToken, (req, res) => {
//   res.json({ 
//     success: true,
//     accessToken: req.accessToken
//   });
// });

router.get('/verify', verifyAccessToken, (req, res) => {
  res.json({ 
    success: true,
    accessToken: req.accessToken
  });
});

export default router;