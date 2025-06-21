import express from 'express'
const router = express.Router()
import { createSensor,  CreateAvg } from '../Controller/Insert.Controller.js'

router.post('/createSensor', createSensor)
router.post('/avgTemp', CreateAvg)

export default router;