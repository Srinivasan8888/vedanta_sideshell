import express from 'express'
import {ApiController} from '../Controller/Api.Controller.js';
import { verifyAccessToken } from '../../Helpers/jwt_helper.js';

const router = express.Router();

router.get('/getAside', verifyAccessToken, ApiController.Aside);
router.get('/getBside', verifyAccessToken, ApiController.Bside);
router.get('/getallsensor', verifyAccessToken, ApiController.getallsensor);
router.get('/getcollectorbar', verifyAccessToken, ApiController.collectorbar);
router.get('/getHeatmap', verifyAccessToken, ApiController.getHeatmap);
router.get('/getcbname', ApiController.cbname);
router.get('/getAverageExcel', verifyAccessToken, ApiController.fetchSensorDataByaverage)
router.get('/getIntervalExcel', verifyAccessToken, ApiController.fetchSensorDataByinterval)
router.get('/getDateExcel', verifyAccessToken, ApiController.fetchSensorDataByDate)
router.get('/getLimit', verifyAccessToken, ApiController.fetchSensorDataBylimit)
router.get('/getAverageChart', verifyAccessToken, ApiController.fetchSensorDataByaveragegraph)
router.get('/getIntervalChart', verifyAccessToken, ApiController.fetchSensorDataByintervalgraph)
router.get('/getDateChart', verifyAccessToken, ApiController.fetchSensorDataByDategraph)
router.get('/getLimitChart', verifyAccessToken, ApiController.fetchSensorDataBylimitgraph)
router.get('/getuniqueids', ApiController.getUniqueIds)
router.get('/getLatestTimestamp', ApiController.getLatestTimestamp)
router.get('/getNotifications', ApiController.getNotifications)
export default router;