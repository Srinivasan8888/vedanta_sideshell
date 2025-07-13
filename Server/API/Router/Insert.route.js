import express from 'express'
const router = express.Router()
import { createSensor,  CreateAvg } from '../Controller/Insert.Controller.js'

router.get('/createSensor', createSensor)
router.post('/createSensor', createSensor)
router.get('/avgTemp', CreateAvg)
router.post('/avgTemp', CreateAvg)

export default router;
