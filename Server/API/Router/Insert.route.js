import express from 'express'
const router = express.Router()
import { createSensor1, createSensor2, createSensor3, createSensor4, createSensor5, createSensor6, createSensor7, createSensor8, createSensor9, createSensor10, CreateAvg } from '../Controller/Insert.Controller.js'

router.post('/createSensor1', createSensor1)
router.post('/createSensor2', createSensor2)
router.post('/createSensor3', createSensor3)
router.post('/createSensor4', createSensor4)
router.post('/createSensor5', createSensor5)
router.post('/createSensor6', createSensor6)
router.post('/createSensor7', createSensor7)
router.post('/createSensor8', createSensor8)
router.post('/createSensor9', createSensor9)
router.post('/createSensor10', createSensor10)
router.post('/avgTemp', CreateAvg)

export default router;