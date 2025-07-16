import express from 'express'
import { apiController } from '../Controller/Api.Controller.js';
// import { verifyAccessToken } from '../../Helpers/jwt_helper.js';

const router = express.Router();

router.get('/getDashboardAPi', apiController.getDashboardAPi);
router.get('/getallsensor',  apiController.getallsensor);
router.get('/getAvgTable',  apiController.getAvgTable);
router.get('/getDashboardchart', apiController.getDashboardchart);
router.get('/getallsensorNoLimit',  apiController.getallsensorNoLimit);
router.get('/getAverageTempbyHour',  apiController.AverageTempbyHour);
router.get('/getReportAverageData',  apiController.reportAverageData);
router.get('/getReportPerData',  apiController.reportPerData);
router.get('/getReportDateData',  apiController.reportDateData);
router.get('/getReportCountData', apiController.reportCountData);
router.get('/getHeatmap', apiController.heatmapData);
router.get('/getCollectorbar', apiController.getSensorData);
router.get('/getThresholds', apiController.getThresholds);
router.post('/setThresholds', apiController.setThresholds);
router.get('/getSensorComparison', apiController.getSensorComparison);

// router.get('/getAside', verifyAccessToken, ApiController.Aside);
// router.get('/getBside', verifyAccessToken, ApiController.Bside);
// router.get('/getcollectorbar', verifyAccessToken, ApiController.collectorbar);
// router.get('/getHeatmap', verifyAccessToken, ApiController.getHeatmap);
// router.get('/getcbname', ApiController.cbname);
// router.get('/getAverageExcel', verifyAccessToken, ApiController.fetchSensorDataByaverage)
// router.get('/getIntervalExcel', verifyAccessToken, ApiController.fetchSensorDataByinterval)
// router.get('/getDateExcel', verifyAccessToken, ApiController.fetchSensorDataByDate)
// router.get('/getLimit', verifyAccessToken, ApiController.fetchSensorDataBylimit)
// router.get('/getAverageChart', verifyAccessToken, ApiController.fetchSensorDataByaveragegraph)
// router.get('/getIntervalChart', verifyAccessToken, ApiController.fetchSensorDataByintervalgraph)
// router.get('/getDateChart', verifyAccessToken, ApiController.fetchSensorDataByDategraph)
// router.get('/getLimitChart', verifyAccessToken, ApiController.fetchSensorDataBylimitgraph)
// router.get('/getuniqueids', ApiController.getUniqueIds)
// router.get('/getLatestTimestamp', ApiController.getLatestTimestamp)
// router.get('/getNotifications', ApiController.getNotifications)

 export default router;