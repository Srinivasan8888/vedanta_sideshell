import sensormodel from "../Models/sensorModel.js";
import devicemodel from '../Models/Deviceid.js';
import Threshold from '../Models/Threshold.model.js';

// Helper function to filter out null/undefined/"null" values from an object
const filterNullValues = (obj) => {
  if (!obj) return null;

  // Skip MongoDB internal fields and __v
  const skipFields = ['_id', '__v', 'buffer'];

  return Object.entries(obj).reduce((acc, [key, value]) => {
    // Skip internal fields
    if (skipFields.includes(key)) return acc;

    // Skip null, undefined, empty strings, or string "null"
    if (value === null || value === undefined || value === '' || value === 'null') {
      return acc;
    }

    // Handle nested objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      // Skip the _id buffer object
      if (key === '_id' && value.buffer) return acc;

      const filtered = filterNullValues(value);
      if (filtered && Object.keys(filtered).length > 0) {
        acc[key] = filtered;
      }
    }
    // Handle arrays
    else if (Array.isArray(value)) {
      const filteredArray = value
        .map(item => typeof item === 'object' ? filterNullValues(item) : item)
        .filter(item => item !== null && item !== undefined && item !== '' && item !== 'null');

      if (filteredArray.length > 0) {
        acc[key] = filteredArray;
      }
    }
    // Handle all other values
    else {
      acc[key] = value;
    }

    return acc;
  }, {});
};

class ApiController {

  _calculateTimeRange(interval) {
    const endTime = new Date();
    let startTime = new Date();

    switch (interval) {
      case 'Live':
        startTime.setMinutes(endTime.getMinutes() - 1);
        break;
      case '1h':
        startTime.setHours(endTime.getHours() - 1);
        break;
      case '2h':
        startTime.setHours(endTime.getHours() - 2);
        break;
      case '5h':
        startTime.setHours(endTime.getHours() - 5);
        break;
      case '7h':
        startTime.setHours(endTime.getHours() - 7);
        break;
      case '12h':
        startTime.setHours(endTime.getHours() - 12);
        break;
      case '1D':
        startTime.setDate(endTime.getDate() - 1);
        break;
      case '1W':
        startTime.setDate(endTime.getDate() - 7);
        break;
      case '1M':
        startTime.setMonth(endTime.getMonth() - 1);
        break;
      case '6M':
        startTime.setMonth(endTime.getMonth() - 6);
        break;
      default:
        // Default to 1 hour if interval is not recognized
        console.warn(`Unsupported interval '${interval}', defaulting to 1 hour`);
        startTime.setHours(endTime.getHours() - 1);
    }

    console.log(`[DEBUG] Time range for interval '${interval}': ${startTime.toISOString()} to ${endTime.toISOString()}`);
    return { startTime, endTime };
  }

  // Fetch historical data for a specific time range, user ID, and waveguide
  async _fetchHistoricalData(userId, waveguide, startTime, endTime) {
    try {
      // Ensure we have valid Date objects
      if (!(startTime instanceof Date) || isNaN(startTime.getTime()) ||
        !(endTime instanceof Date) || isNaN(endTime.getTime())) {
        throw new Error('Invalid date range provided');
      }

      console.log(`[DEBUG] Fetching data for user ${userId}, waveguide ${waveguide} from ${startTime.toISOString()} to ${endTime.toISOString()}`);

      // Format times to match the database format (YYYY-MM-DD HH:mm:ss)
      const formatTimeForDB = (date) => {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
          throw new Error('Invalid date provided to formatTimeForDB');
        }
        return date.toISOString().replace('T', ' ').substring(0, 19);
      };

      // Build the query for the requested time range
      const query = {
        id: userId,
        waveguide: waveguide,
        TIME: {
          $gte: formatTimeForDB(startTime),
          $lte: formatTimeForDB(endTime)
        }
      };

      console.log('[DEBUG] Query:', JSON.stringify(query, null, 2));

      // Execute the query for the requested time range
      let records = await sensormodel.find(query).sort({ TIME: 1 }).lean();

      console.log(`[DEBUG] Records found in requested time range: ${records.length}`);

      // If no records found in the requested time range, get the most recent data
      if (records.length === 0) {
        console.log('[DEBUG] No records found in requested time range, fetching most recent data...');

        // Query for the most recent data regardless of time range
        const recentQuery = {
          id: userId,
          waveguide: waveguide
        };

        records = await sensormodel.find(recentQuery)
          .sort({ TIME: -1 }) // Sort by time descending to get most recent first
          .limit(100) // Limit to most recent 100 records
          .lean();

        console.log(`[DEBUG] Fetched ${records.length} most recent records`);
      }

      if (records.length > 0) {
        console.log('[DEBUG] Sample record:', JSON.stringify(records[0], null, 2));
      } else {
        console.log('[DEBUG] No records found in the database');
        return {
          timestamps: [],
          temperatures: [],
          warning: 'No temperature data available',
          dataAvailable: false
        };
      }

      // Process the records to calculate average temperature per timestamp
      const result = {
        timestamps: [],
        temperatures: [],
        dataAvailable: true,
        recordCount: records.length,
        timeRange: {
          start: records.length > 0 ? records[0].TIME : null,
          end: records.length > 0 ? records[records.length - 1].TIME : null
        }
      };

      // If we have records, process them
      if (records.length > 0) {
        // Sort by time ascending for consistent results
        records.sort((a, b) => (a.TIME > b.TIME ? 1 : -1));

        records.forEach(record => {
          try {
            let sum = 0;
            let count = 0;

            // Sum up all sensor values
            for (let i = 1; i <= 38; i++) {
              const sensorValue = parseFloat(record[`sensor${i}`]);
              if (!isNaN(sensorValue)) {
                sum += sensorValue;
                count++;
              }
            }

            // Calculate average if we have valid sensor values
            if (count > 0) {
              result.timestamps.push(record.TIME);
              result.temperatures.push(parseFloat((sum / count).toFixed(2)));
            }
          } catch (error) {
            console.error(`[ERROR] Error processing record:`, error);
            // Continue with next record even if one fails
          }
        });
      }

      console.log(`[DEBUG] Processed ${result.timestamps.length} data points`);
      return result;
    } catch (error) {
      console.error('[ERROR] Error in _fetchHistoricalData:', error);
      throw error;
    }
  }

  constructor() {
    // Bind methods to maintain 'this' context
    this.getDashboardchart = this.getDashboardchart.bind(this);
    this.getDashboardData = this.getDashboardData.bind(this);
    this.getDashboardAPi = this.getDashboardAPi.bind(this);
  }
  // Helper function to calculate average of an array
  _calculateAverage(values) {
    if (!values || values.length === 0) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    return parseFloat((sum / values.length).toFixed(2));
  }

  _getStatus(temp) {
    if (temp <= 30) return 'Normal';
    if (temp <= 35) return 'Moderate';
    return 'High';
  }

  _formatHour(hour) {
    // Convert 24-hour format to 12-hour format with AM/PM
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHour} ${period}`;
  }

  async _getHourlyData(id, startDate, endDate) {
    // Fetch documents for the given time range
    const docs = await sensormodel.find({
      id: id,
      createdAt: { $gte: startDate, $lt: endDate },
      waveguide: { $in: ['WG1', 'WG2'] }
    }).sort({ createdAt: -1 }).lean();

    // Initialize hourly buckets
    const hourlyData = Array.from({ length: 24 }, () => ({
      WG1: [],
      WG2: []
    }));

    // Process documents into hourly buckets (most recent first)
    for (const doc of docs) {
      const hour = new Date(doc.createdAt).getHours();
      const waveguide = doc.waveguide;

      // Only add if we don't have data for this hour and waveguide yet
      if (hourlyData[hour][waveguide].length === 0) {
        // Collect all sensor values
        const values = [];
        for (let i = 1; i <= 38; i++) {
          const value = parseFloat(doc[`sensor${i}`]);
          if (!isNaN(value)) values.push(value);
        }

        if (values.length > 0) {
          hourlyData[hour][waveguide] = values; // Store the first valid reading we find
        }
      }
    }

    return hourlyData;
  }

  // Fetch and process historical data with hourly bucketing
  async _fetchHistoricalData(userId, waveguide, startTime, endTime) {
    // Fetch documents for the specified time range
    const docs = await sensormodel.find({
      id: userId,
      waveguide: waveguide,
      createdAt: { $gte: startTime, $lt: endTime }
    }).sort({ createdAt: 1 }).lean();

    // Initialize data structures
    const hourlyData = new Map();
    const allSensorValues = [];

    // Process each document into hourly buckets
    docs.forEach(doc => {
      const timestamp = new Date(doc.createdAt);
      const hour = timestamp.getHours();
      const dateKey = timestamp.toISOString().split('T')[0];
      const hourKey = `${dateKey}-${hour.toString().padStart(2, '0')}`;

      if (!hourlyData.has(hourKey)) {
        hourlyData.set(hourKey, {
          timestamp: new Date(timestamp).setMinutes(0, 0, 0),
          dataPoints: []  // Store all data points for this hour
        });
      }

      // Store the complete document for this hour
      const hourData = hourlyData.get(hourKey);

      // Process all sensors for this document
      const sensorReadings = {};
      for (let i = 1; i <= 38; i++) {
        const sensorKey = `sensor${i}`;
        const value = parseFloat(doc[sensorKey]);
        if (!isNaN(value)) {
          sensorReadings[sensorKey] = value;
          allSensorValues.push({
            sensor: sensorKey,
            value: value,
            side: waveguide === 'WG1' ? 'ASide' : 'BSide',
            timestamp: doc.createdAt
          });
        }
      }

      // Only add if we have valid sensor readings
      if (Object.keys(sensorReadings).length > 0) {
        hourData.dataPoints.push({
          timestamp: doc.createdAt,
          sensors: sensorReadings
        });
      }
    });

    // Process hourly data into response format
    const sensorData = [];

    // Convert map to array and sort by timestamp
    const sortedHours = Array.from(hourlyData.entries())
      .sort(([keyA], [keyB]) => new Date(keyA) - new Date(keyB));

    // Process each hour
    for (const [_, hourData] of sortedHours) {
      const timestamp = new Date(hourData.timestamp);
      const hour = timestamp.getHours();

      // Format timestamp for display
      const period = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      const timeString = `${hour12}:00 ${period}`;

      // Prepare sensor data for this hour
      const hourSensorData = {
        timestamp: timeString,
        dataPoints: hourData.dataPoints,  // Include all data points
        stats: {
          avgTemp: 0,
          minTemp: Infinity,
          maxTemp: -Infinity,
          totalReadings: hourData.dataPoints.length
        }
      };

      // Calculate statistics across all data points
      const allTemps = [];

      hourData.dataPoints.forEach(dataPoint => {
        const temps = Object.values(dataPoint.sensors);
        allTemps.push(...temps);

        // Update min/max
        const pointMin = Math.min(...temps);
        const pointMax = Math.max(...temps);
        hourSensorData.stats.minTemp = Math.min(hourSensorData.stats.minTemp, pointMin);
        hourSensorData.stats.maxTemp = Math.max(hourSensorData.stats.maxTemp, pointMax);
      });

      // Calculate average temperature for this hour
      if (allTemps.length > 0) {
        hourSensorData.stats.avgTemp = parseFloat(
          (allTemps.reduce((sum, val) => sum + val, 0) / allTemps.length).toFixed(2)
        );
      } else {
        hourSensorData.stats.minTemp = 0;
        hourSensorData.stats.maxTemp = 0;
      }

      sensorData.push(hourSensorData);
    }

    // Calculate statistics
    const sideValues = allSensorValues.reduce((acc, { sensor, value, side }) => {
      if (!acc[side]) {
        acc[side] = [];
      }
      acc[side].push(value);
      return acc;
    }, {});

    const stats = {};

    // Calculate stats for each side
    for (const [side, values] of Object.entries(sideValues)) {
      if (values.length > 0) {
        stats[side] = {
          maxTemp: Math.max(...values).toFixed(1),
          minTemp: Math.min(...values).toFixed(1),
          avgTemp: (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1)
        };
      }
    }

    return {
      sensorData,
      stats
    };
  }
  v
  // Helper function to calculate average temperature from sensor data
  _calculateAverageTemperature(doc) {
    let sum = 0;
    let count = 0;

    for (let i = 1; i <= 38; i++) {
      const sensorValue = parseFloat(doc[`sensor${i}`]);
      if (!isNaN(sensorValue)) {
        sum += sensorValue;
        count++;
      }
    }

    return count > 0 ? sum / count : 0;
  }

  async getDashboardAPi(req, res) {
    console.log('[DEBUG] getDashboardAPi called with query:', req.query);
    try {
      const id = req.headers['x-user-id'] || req.headers['X-User-ID'];
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required in headers'
        });
      }

      // Get interval from query params (default to '1h' if not provided)
      const { interval = '1h' } = req.query;
      const validIntervals = ['Live', '1h', '2h', '5h', '7h', '12h'];

      if (!validIntervals.includes(interval)) {
        return res.status(400).json({
          success: false,
          message: `Invalid interval. Must be one of: ${validIntervals.join(', ')}`,
        });
      }

      // 1. Get real-time sensor data (from getallsensor)
      const [latestWG1, previousWG1] = await Promise.all([
        sensormodel.findOne({ id, waveguide: 'WG1' }).sort({ updatedAt: -1 }).lean(),
        sensormodel.find({ id, waveguide: 'WG1' }).sort({ updatedAt: -1 }).skip(1).limit(1).lean()
      ]);

      const [latestWG2, previousWG2] = await Promise.all([
        sensormodel.findOne({ id, waveguide: 'WG2' }).sort({ updatedAt: -1 }).lean(),
        sensormodel.find({ id, waveguide: 'WG2' }).sort({ updatedAt: -1 }).skip(1).limit(1).lean()
      ]);

      // Function to calculate differences between current and previous readings
      const calculateDifferences = (current, previous) => {
        if (!current) return null;

        const result = { ...current };
        result.sensors = {};

        // Process each sensor
        for (let i = 1; i <= 38; i++) {
          const sensorKey = `sensor${i}`;
          const sensorValue = current[sensorKey];

          if (sensorValue === undefined) continue;

          const sensorData = {
            value: sensorValue
          };

          // Add difference and trend if previous data exists
          if (previous && previous[0] && previous[0][sensorKey] !== undefined) {
            const currentVal = parseFloat(sensorValue);
            const prevVal = parseFloat(previous[0][sensorKey]);

            if (!isNaN(currentVal) && !isNaN(prevVal)) {
              const diff = currentVal - prevVal;
              sensorData.difference = Math.abs(diff).toFixed(2);
              sensorData.trend = diff >= 0 ? 'up' : 'down';
            }
          }

          result.sensors[sensorKey] = sensorData;
          // Remove the original flat sensor key
          delete result[sensorKey];
        }

        return result;
      };

      // Process both waveguides with their differences
      const realtimeData = [
        latestWG1 ? calculateDifferences(latestWG1, previousWG1) : null,
        latestWG2 ? calculateDifferences(latestWG2, previousWG2) : null
      ].filter(Boolean);

      // 2. Get historical data (from getDashboardchart)
      let historicalWG1, historicalWG2;
      let startTime, endTime;
      if (interval === 'Live') {
        // Only fetch the latest record for each waveguide
        historicalWG1 = await sensormodel.findOne({ id, waveguide: 'WG1' }).sort({ updatedAt: -1 }).lean();
        historicalWG2 = await sensormodel.findOne({ id, waveguide: 'WG2' }).sort({ updatedAt: -1 }).lean();
        // Wrap in array to match expected structure
        historicalWG1 = historicalWG1 ? { sensorData: [{ dataPoints: [historicalWG1] }], stats: {/*...*/ } } : null;
        historicalWG2 = historicalWG2 ? { sensorData: [{ dataPoints: [historicalWG2] }], stats: {/*...*/ } } : null;
        const latestTime = latestWG1?.updatedAt || latestWG2?.updatedAt || new Date();
        startTime = endTime = new Date(latestTime);
      } else {
        const timeRange = this._calculateTimeRange(interval);
        startTime = timeRange.startTime;
        endTime = timeRange.endTime;
        [historicalWG1, historicalWG2] = await Promise.all([
          this._fetchHistoricalData(id, 'WG1', startTime, endTime),
          this._fetchHistoricalData(id, 'WG2', startTime, endTime)
        ]);
      }

      // 3. Get hourly average data (from getAvgTable)
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      const startOfPrevDay = new Date(now);
      startOfPrevDay.setDate(startOfPrevDay.getDate() - 1);
      startOfPrevDay.setHours(0, 0, 0, 0);
      const endOfPrevDay = new Date(startOfPrevDay);
      endOfPrevDay.setDate(endOfPrevDay.getDate() + 1);

      const [currentDayData, prevDayData] = await Promise.all([
        this._getHourlyData(id, startOfDay, endOfDay),
        this._getHourlyData(id, startOfPrevDay, endOfPrevDay)
      ]);

      // Merge data - prefer current day, fall back to previous day
      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        WG1: currentDayData[hour].WG1.length > 0 ? currentDayData[hour].WG1 : prevDayData[hour].WG1,
        WG2: currentDayData[hour].WG2.length > 0 ? currentDayData[hour].WG2 : prevDayData[hour].WG2
      }));

      // Calculate averages and format output for all 24 hours
      const tableData = [];

      for (let hour = 0; hour < 24; hour++) {
        const hourData = hourlyData[hour] || { WG1: [], WG2: [] };
        const wg1Data = hourData.WG1 || [];
        const wg2Data = hourData.WG2 || [];

        const timeString = this._formatHour(hour);
        const entries = [];

        // Process WG1 (ASide) if data exists
        if (wg1Data.length > 0) {
          const avg = wg1Data.reduce((sum, val) => sum + val, 0) / wg1Data.length;
          if (!isNaN(avg)) {
            entries.push({
              side: 'ASide',
              temp: Math.round(avg * 10) / 10,
              status: this._getStatus(avg)
            });
          }
        }

        // Process WG2 (BSide) if data exists
        if (wg2Data.length > 0) {
          const avg = wg2Data.reduce((sum, val) => sum + val, 0) / wg2Data.length;
          if (!isNaN(avg)) {
            entries.push({
              side: 'BSide',
              temp: Math.round(avg * 10) / 10,
              status: this._getStatus(avg)
            });
          }
        }

        // Always add the hour to results, even if no entries
        tableData.push({
          index: hour + 1, // 1-based index
          time: timeString,
          entries
        });
      }

      // Prepare the unified response
      const response = {
        success: true,
        data: {
          metadata: {
            interval,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            timestamp: new Date().toISOString()
          },
          realtime: realtimeData,
          historical: {
            ASide: historicalWG1?.sensorData?.map(item => item.dataPoints)?.flat() || [],
            BSide: historicalWG2?.sensorData?.map(item => item.dataPoints)?.flat() || []
          },
          temperatureStats: {
            ASide: historicalWG1?.stats?.ASide ? {
              maxTemp: `${historicalWG1.stats.ASide.maxTemp}°C`,
              minTemp: `${historicalWG1.stats.ASide.minTemp}°C`,
              avgTemp: `${historicalWG1.stats.ASide.avgTemp}°C`
            } : null,
            BSide: historicalWG2?.stats?.BSide ? {
              maxTemp: `${historicalWG2.stats.BSide.maxTemp}°C`,
              minTemp: `${historicalWG2.stats.BSide.minTemp}°C`,
              avgTemp: `${historicalWG2.stats.BSide.avgTemp}°C`
            } : null
          },
          hourlyAverages: tableData
        },
        message: 'Dashboard data fetched successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('[ERROR] Error in getDashboardAPi:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        details: error.stack
      });
    }
  }

  async getAvgTable(req, res) {
    try {
      const id = req.headers['x-user-id'] || req.headers['X-User-ID'];
      if (!id) {
        return res.status(400).json({ error: 'User ID is required in headers' });
      }

      // Get current day boundaries in server's local time
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      // Get previous day boundaries
      const startOfPrevDay = new Date(now);
      startOfPrevDay.setDate(startOfPrevDay.getDate() - 1);
      startOfPrevDay.setHours(0, 0, 0, 0);
      const endOfPrevDay = new Date(startOfPrevDay);
      endOfPrevDay.setDate(endOfPrevDay.getDate() + 1);

      // Get data for both days in parallel
      const [currentDayData, prevDayData] = await Promise.all([
        this._getHourlyData(id, startOfDay, endOfDay),
        this._getHourlyData(id, startOfPrevDay, endOfPrevDay)
      ]);

      // Merge data - prefer current day, fall back to previous day
      const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
        WG1: currentDayData[hour].WG1.length > 0 ? currentDayData[hour].WG1 : prevDayData[hour].WG1,
        WG2: currentDayData[hour].WG2.length > 0 ? currentDayData[hour].WG2 : prevDayData[hour].WG2
      }));

      // Calculate averages and format output for all 24 hours
      const tableData = [];

      for (let hour = 0; hour < 24; hour++) {
        const hourData = hourlyData[hour] || { WG1: [], WG2: [] };
        const wg1Data = hourData.WG1 || [];
        const wg2Data = hourData.WG2 || [];

        const timeString = this._formatHour(hour);
        const entries = [];

        // Process WG1 (ASide) if data exists
        if (wg1Data.length > 0) {
          const avg = wg1Data.reduce((sum, val) => sum + val, 0) / wg1Data.length;
          if (!isNaN(avg)) {
            entries.push({
              side: 'ASide',
              temp: Math.round(avg * 10) / 10,
              status: this._getStatus(avg)
            });
          }
        }

        // Process WG2 (BSide) if data exists
        if (wg2Data.length > 0) {
          const avg = wg2Data.reduce((sum, val) => sum + val, 0) / wg2Data.length;
          if (!isNaN(avg)) {
            entries.push({
              side: 'BSide',
              temp: Math.round(avg * 10) / 10,
              status: this._getStatus(avg)
            });
          }
        }

        // Always add the hour to results, even if no entries
        tableData.push({
          index: hour + 1, // 1-based index
          time: timeString,
          entries
        });
      }

      res.status(200).json(tableData);
    } catch (error) {
      console.error('Error in getAvgTable:', error);
      res.status(500).json({
        error: 'An error occurred while generating temperature summary',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getDashboardchart(req, res) {
    console.log('[DEBUG] getDashboardchart called with query:', req.query);
    try {
      const { side, interval = '1h' } = req.query;
      const validIntervals = ['Live', '1h', '2h', '5h', '7h', '12h'];
      const validSides = ['Aside', 'Bside'];

      // Validate input parameters
      if (!side || !validSides.includes(side)) {
        return res.status(400).json({
          success: false,
          message: `Invalid or missing side parameter. Must be "Aside" or "Bside"`,
        });
      }

      if (!validIntervals.includes(interval)) {
        return res.status(400).json({
          success: false,
          message: `Invalid interval. Must be one of: ${validIntervals.join(', ')}`,
        });
      }

      const userId = 'XY001'; // Default user ID
      const waveguide = side === 'Aside' ? 'WG1' : 'WG2';

      // Calculate time range based on interval
      const timeRange = this._calculateTimeRange(interval);
      const startTime = timeRange.startTime;
      const endTime = timeRange.endTime;

      // Fetch historical data for the specified time range
      const historicalData = await this._fetchHistoricalData(userId, waveguide, startTime, endTime);

      // Prepare response
      const response = {
        success: true,
        data: {
          side,
          interval,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          ...historicalData
        },
        message: `Historical data for ${interval} interval fetched successfully`,
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('[ERROR] Error in getDashboardchart:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  async getallsensor(req, res) {
    try {
      console.log('All headers received:', req.headers);
      // console.log('Raw headers:', req.rawHeaders);
      const id = req.headers['x-user-id'] || req.headers['X-User-ID'];
      if (!id) {
        console.log('No user ID found in headers');
        return res.status(400).json({ error: 'User ID is required in headers' });
      }
      // console.log('User ID found:', id);
      const latestById = await sensormodel
        .findOne({ id })
        .sort({ updatedAt: -1 })
        .lean();

      const latestWG1 = await sensormodel
        .findOne({
          id: id,  // Filter by the provided ID
          waveguide: 'WG1'
        })
        .sort({ updatedAt: -1 })
        .lean();

      const latestWG2 = await sensormodel
        .findOne({
          id: id,  // Filter by the provided ID
          waveguide: 'WG2'
        })
        .sort({ updatedAt: -1 })
        .lean();

      // Only include waveguide data in the response
      const waveguides = [latestWG1, latestWG2]
        .filter(Boolean)
        .map(wg => filterNullValues(wg))
        .filter(Boolean);

      res.status(200).json(waveguides);
    } catch (error) {
      console.error('Error in getallsensor:', error);
      res.status(500).json({
        error: 'An error occurred while fetching sensor data',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  _calculateTimeRange(interval) {
    const now = new Date();
    let startTime = new Date(now);

    switch (interval) {
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '2h':
        startTime.setHours(now.getHours() - 2);
        break;
      case '5h':
        startTime.setHours(now.getHours() - 5);
        break;
      case '7h':
        startTime.setHours(now.getHours() - 7);
        break;
      case '12h':
        startTime.setHours(now.getHours() - 12);
        break;
      case 'Live':
      default:
        // For live data, get data from the last 5 minutes
        startTime.setMinutes(now.getMinutes() - 5);
        break;
    }

    return { startTime, endTime: now };
  }

  _formatTimeForDB(date) {
    const pad = num => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  async AverageTempbyHour(req, res) {
    try {
      const { Interval = '1Hr' } = req.query;
      const id = req.headers['x-user-id'] || req.headers['X-User-ID'];
      if (!id) {
        return res.status(400).json({ error: 'User ID is required in headers' });
      }

      // Validate interval
      const validIntervals = ['1Hr', '2Hr', '5Hr', '7Hr', '12Hr', '24Hr'];
      if (!validIntervals.includes(Interval)) {
        return res.status(400).json({
          error: 'Invalid interval',
          message: 'Valid intervals are: 1Hr, 2Hr, 5Hr, 7Hr, 12Hr, 24Hr'
        });
      }

      // Get the latest timestamp from the database to determine the time range
      const latestRecord = await sensormodel.findOne({ id }).sort({ TIME: -1 }).lean();
      if (!latestRecord) {
        return res.status(404).json({ error: 'No data found for the specified ID' });
      }

      const latestTime = new Date(latestRecord.TIME);
      const intervalData = [];

      // Define interval configurations
      const intervalConfigs = {
        '1Hr': { duration: 60, points: 12 },    // 60min / 12 = 5min intervals
        '2Hr': { duration: 120, points: 12 },   // 120min / 12 = 10min intervals
        '5Hr': { duration: 300, points: 12 },   // 300min / 12 = 25min intervals
        '7Hr': { duration: 420, points: 12 },   // 420min / 12 = 35min intervals
        '12Hr': { duration: 720, points: 12 },  // 720min / 12 = 60min (1hr) intervals
        '24Hr': { duration: 1440, points: 12 }  // 1440min / 12 = 120min (2hr) intervals
      };

      // Get configuration for the selected interval
      const config = intervalConfigs[Interval];
      if (!config) {
        return res.status(400).json({ error: 'Invalid interval specified' });
      }

      // Calculate time range in minutes
      const endTime = new Date(latestTime);
      
      // Set end time to 11:59:59 PM
      endTime.setHours(23, 59, 59, 999);
      
      // Set start time to 12:00:01 AM
      const startTime = new Date(endTime);
      startTime.setHours(0, 0, 1, 0);

      // Calculate minutes between data points
      const minutesBetweenPoints = config.duration / config.points;
      const dataPointsNeeded = config.points;

      // Get data points
      for (let i = 0; i < dataPointsNeeded; i++) {
        // Calculate point time based on minutes from end time
        const pointTime = new Date(endTime);
        pointTime.setMinutes(endTime.getMinutes() - (i * minutesBetweenPoints));

        // Set point end time (next point time - 1 minute)
        const pointEndTime = new Date(pointTime);
        if (i > 0) {
          pointEndTime.setMinutes(pointEndTime.getMinutes() - 1);
        }

        // Format time for display
        const timeLabel = pointEndTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        // Get all records within the current interval
        const startTimeStr = this._formatTimeForDB(pointTime);
        const endTimeStr = this._formatTimeForDB(i === 0 ? new Date() : new Date(pointEndTime.getTime() + 1));

        const [wg1Records, wg2Records] = await Promise.all([
          sensormodel.find({
            id,
            waveguide: 'WG1',
            TIME: { $gte: startTimeStr, $lte: endTimeStr }
          }).sort({ TIME: 1 }).lean(),
          sensormodel.find({
            id,
            waveguide: 'WG2',
            TIME: { $gte: startTimeStr, $lte: endTimeStr }
          }).sort({ TIME: 1 }).lean()
        ]);

        // Get the latest record for display
        const wg1Record = wg1Records[wg1Records.length - 1];
        const wg2Record = wg2Records[wg2Records.length - 1];

        // Process WG1 data
        const wg1AllValues = [];
        const wg1Values = [];

        // Process all WG1 records for the interval
        wg1Records.forEach(record => {
          Object.entries(record).forEach(([key, value]) => {
            if (key.startsWith('sensor') && value !== 'null') {
              const num = parseFloat(value);
              if (!isNaN(num)) {
                wg1AllValues.push(num);
                if (record === wg1Record) wg1Values.push(num);
              }
            }
          });
        });

        // Process WG2 data
        const wg2AllValues = [];
        const wg2Values = [];

        // Process all WG2 records for the interval
        wg2Records.forEach(record => {
          Object.entries(record).forEach(([key, value]) => {
            if (key.startsWith('sensor') && value !== 'null') {
              const num = parseFloat(value);
              if (!isNaN(num)) {
                wg2AllValues.push(num);
                if (record === wg2Record) wg2Values.push(num);
              }
            }
          });
        });

        // Calculate statistics for the interval
        const allValues = [...wg1AllValues, ...wg2AllValues];
        const currentValues = [...wg1Values, ...wg2Values];

        // Helper function to calculate statistics
        const calculateStats = (values) => {
          if (values.length === 0) return { average: null, max: null, min: null };
          return {
            average: this._calculateAverage(values),
            max: Math.max(...values),
            min: Math.min(...values)
          };
        };

        const allStats = calculateStats(allValues);
        const wg1Stats = calculateStats(wg1AllValues);
        const wg2Stats = calculateStats(wg2AllValues);

        intervalData.push({
          time: timeLabel,
          timestamp: pointEndTime.toISOString(),
          interval: Interval,
          statistics: {
            average: allStats.average,
            max: allStats.max,
            min: allStats.min,
            totalReadings: allValues.length
          },
          currentTemperature: this._calculateAverage(currentValues),
          currentReadings: currentValues.length,
          waveguides: {
            WG1: {
              ...wg1Stats,
              current: this._calculateAverage(wg1Values),
              readings: wg1AllValues.length,
              currentReadings: wg1Values.length
            },
            WG2: {
              ...wg2Stats,
              current: this._calculateAverage(wg2Values),
              readings: wg2AllValues.length,
              currentReadings: wg2Values.length
            }
          }
        });
      }


      // Sort from oldest to newest
      intervalData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

      res.status(200).json({
        id,
        interval: Interval,
        timeRange: {
          start: startTime.toISOString(),
          end: endTime.toISOString()
        },
        data: intervalData
      });

    } catch (error) {
      console.error('Error in AverageTempbyHour:', error);
      res.status(500).json({
        error: 'An error occurred while calculating hourly average temperatures',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async reportAverageData(req, res) {
    console.log('reportAverageData called with params:', req.query);
    console.log('Headers:', req.headers);
    try {
      const id = req.headers['x-user-id'] || req.headers['X-User-ID'];
      if (!id) {
        return res.status(400).json({ error: 'User ID is required in headers' });
      }

      // Get query parameters
      const { sensorrange, sides, startDate, endDate, averageBy } = req.query;

      // Validate parameters
      if (!sensorrange || !sides || !startDate || !endDate || !averageBy) {
        return res.status(400).json({
          error: 'Missing required parameters',
          required: ['sensorrange', 'sides', 'startDate', 'endDate', 'averageBy']
        });
      }

     
      // Convert dates and adjust to full day range
      const start = new Date(startDate);
      // Set start time to 12:00:01 AM
      start.setHours(0, 0, 1, 0);
      
      const end = new Date(endDate);
      // Set end time to 11:59:59 PM
      end.setHours(23, 59, 59, 999);

      // Validate date range
      if (start >= end) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }

      // Validate sides
      const validSides = ['Aside', 'Bside', 'Allside'];
      if (!validSides.includes(sides)) {
        return res.status(400).json({
          error: 'Invalid side parameter',
          validValues: validSides
        });
      }

      // Validate averageBy
      const validAverageBy = ['Hour', 'Day'];
      if (!validAverageBy.includes(averageBy)) {
        return res.status(400).json({
          error: 'Invalid averageBy parameter',
          validValues: validAverageBy
        });
      }

      // Handle sensor range - support 'All-Data' as a special case and single sensor values
      let startSensor = 1;
      let endSensor = 38;

      if (sensorrange.toLowerCase() === 'all-data') {
        // Use default range 1-38 for All-Data
      } else if (sensorrange.toLowerCase().startsWith('sensor')) {
        // Handle single sensor format like 'sensor1'
        const sensorNum = parseInt(sensorrange.replace(/\D/g, ''));
        if (isNaN(sensorNum) || sensorNum < 1 || sensorNum > 38) {
          return res.status(400).json({
            error: 'Invalid sensor number',
            validRange: '1-38 or sensor1-sensor38 or All-Data'
          });
        }
        startSensor = sensorNum;
        endSensor = sensorNum;
      } else {
        // Handle range format like '1-10'
        const rangeParts = sensorrange.split('-');
        if (rangeParts.length !== 2) {
          return res.status(400).json({
            error: 'Invalid sensor range format',
            validFormat: '1-38 or sensor1-sensor38 or All-Data'
          });
        }

        const start = parseInt(rangeParts[0]);
        const end = parseInt(rangeParts[1]);

        if (isNaN(start) || isNaN(end) || start < 1 || end > 38 || start > end) {
          return res.status(400).json({
            error: 'Invalid sensor range',
            validRange: '1-38 or sensor1-sensor38 or All-Data'
          });
        }
        startSensor = start;
        endSensor = end;
      }

      // Build query with user ID filter first
      const query = {
        id: id,
        createdAt: { $gte: start, $lte: end }
      };

      // Add side filter
      if (sides === 'Aside') {
        query.waveguide = 'WG1';
      } else if (sides === 'Bside') {
        query.waveguide = 'WG2';
      } else if (sides === 'Allside') {
        // For Allside, we'll use $in to match either WG1 or WG2
        query.waveguide = { $in: ['WG1', 'WG2'] };
      }

      console.log('Executing query:', JSON.stringify(query, null, 2));

      // Helper function to create sensor field conversion with safe number handling
      const createSensorConversion = (sensorNum) => {
        const sensorKey = `sensor${sensorNum}`;
        return [
          sensorKey,
          {
            $avg: {
              $convert: {
                input: `$${sensorKey}`,
                to: 'double',
                onError: 0,    // Default to 0 if conversion fails
                onNull: 0      // Default to 0 if value is null
              }
            }
          }
        ];
      };

      // Build the aggregation pipeline based on the working MongoDB query
      const pipeline = [
        { $match: query },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
              hour: averageBy === 'Hour' ? { $hour: '$createdAt' } : null,
              date: averageBy === 'Day' ? {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "+05:30" }
              } : null
            },
            // Add avg for each sensor in range with safe conversion
            ...Object.fromEntries(
              Array.from({ length: endSensor - startSensor + 1 }, (_, i) => {
                const sensorNum = startSensor + i;
                return createSensorConversion(sensorNum);
              })
            )
          }
        },
        {
          $project: {
            _id: 0,
            timestamp: {
              $cond: {
                if: { $ne: ['$_id.date', null] },
                then: {
                  $dateFromString: {
                    dateString: '$_id.date',
                    format: '%Y-%m-%d',
                    timezone: "+05:30"
                  }
                },
                else: {
                  $dateFromParts: {
                    year: '$_id.year',
                    month: '$_id.month',
                    day: '$_id.day',
                    ...(averageBy === 'Hour' && { hour: '$_id.hour' })
                  }
                }
              }
            },
            // Include all sensor values with rounding
            ...Object.fromEntries(
              Array.from({ length: endSensor - startSensor + 1 }, (_, i) => {
                const sensorKey = `sensor${startSensor + i}`;
                return [
                  sensorKey,
                  {
                    $cond: {
                      if: { $eq: [`$${sensorKey}`, null] },
                      then: null,
                      else: { $round: [`$${sensorKey}`, 2] }
                    }
                  }
                ];
              })
            )
          }
        },
        { $sort: { timestamp: 1 } }
      ];

      // Remove hour from group if not needed
      if (averageBy === 'Day') {
        pipeline[1].$group._id = {
          date: pipeline[1].$group._id.date
        };
        delete pipeline[1].$group._id.year;
        delete pipeline[1].$group._id.month;
        delete pipeline[1].$group._id.day;
        delete pipeline[1].$group._id.hour;
      }

      console.log('Executing aggregation pipeline:', JSON.stringify(pipeline, null, 2));

      // Execute the aggregation
      let formattedResults;
      try {
        formattedResults = await sensormodel.aggregate(pipeline);
        console.log(`Successfully processed ${formattedResults?.length || 0} time periods`);
      } catch (error) {
        console.error('Aggregation error:', error);
        throw new Error(`Failed to aggregate data: ${error.message}`);
      }

      res.json({
        success: true,
        data: formattedResults,
        metadata: {
          sensorRange: `${startSensor}-${endSensor}`,
          side: sides,
          averageBy: averageBy,
          startDate: startDate,
          endDate: endDate,
          totalRecords: formattedResults.length
        }
      });

    } catch (error) {
      console.error('Error in reportAverageData:', error);
      res.status(500).json({
        error: 'An error occurred while generating the report',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async reportPerData(req, res) {
    console.log('reportPerData called with params:', req.query);
    console.log('Headers:', req.headers);
    try {
      const id = req.headers['x-user-id'] || req.headers['X-User-ID'];
      if (!id) {
        return res.status(400).json({ error: 'User ID is required in headers' });
      }

      // Get query parameters
      const { sensorrange, sides, startDate, endDate, averageBy } = req.query;

      // Validate parameters
      if (!sensorrange || !sides || !startDate || !endDate || !averageBy) {
        return res.status(400).json({
          error: 'Missing required parameters',
          required: ['sensorrange', 'sides', 'startDate', 'endDate', 'averageBy']
        });
      }

      // Convert dates and adjust to full day range
      const start = new Date(startDate);
      // Set start time to 12:00:01 AM
      start.setHours(0, 0, 1, 0);
      
      const end = new Date(endDate);
      // Set end time to 11:59:59 PM
      end.setHours(23, 59, 59, 999);

      // Validate date range
      if (start >= end) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }

      // Validate sides
      const validSides = ['Aside', 'Bside', 'Allside'];
      if (!validSides.includes(sides)) {
        return res.status(400).json({
          error: 'Invalid side parameter',
          validValues: validSides
        });
      }

      // Validate averageBy
      const validAverageBy = ['Hour', 'Day'];
      if (!validAverageBy.includes(averageBy)) {
        return res.status(400).json({
          error: 'Invalid averageBy parameter',
          validValues: validAverageBy
        });
      }

      // Handle sensor range - support 'All-Data' as a special case and single sensor values
      let startSensor = 1;
      let endSensor = 38;

      if (sensorrange.toLowerCase() === 'all-data') {
        // Use default range 1-38 for All-Data
      } else if (sensorrange.toLowerCase().startsWith('sensor')) {
        // Handle single sensor format like 'sensor1'
        const sensorNum = parseInt(sensorrange.replace(/\D/g, ''));
        if (isNaN(sensorNum) || sensorNum < 1 || sensorNum > 38) {
          return res.status(400).json({
            error: 'Invalid sensor number',
            validRange: '1-38 or sensor1-sensor38 or All-Data'
          });
        }
        startSensor = sensorNum;
        endSensor = sensorNum;
      } else {
        // Handle range format like '1-10'
        const rangeParts = sensorrange.split('-');
        if (rangeParts.length !== 2) {
          return res.status(400).json({
            error: 'Invalid sensor range format',
            validFormat: '1-38 or sensor1-sensor38 or All-Data'
          });
        }

        const start = parseInt(rangeParts[0]);
        const end = parseInt(rangeParts[1]);

        if (isNaN(start) || isNaN(end) || start < 1 || end > 38 || start > end) {
          return res.status(400).json({
            error: 'Invalid sensor range',
            validRange: '1-38 or sensor1-sensor38 or All-Data'
          });
        }
        startSensor = start;
        endSensor = end;
      }

      // Build query with user ID filter first
      const query = {
        id: id,
        createdAt: { $gte: start, $lte: end }
      };

      // Add side filter
      if (sides === 'Aside') {
        query.waveguide = 'WG1';
      } else if (sides === 'Bside') {
        query.waveguide = 'WG2';
      } else if (sides === 'Allside') {
        // For Allside, match either WG1 or WG2
        query.waveguide = { $in: ['WG1', 'WG2'] };
      }

      console.log('Executing query:', JSON.stringify(query, null, 2));

      // Build the aggregation pipeline to get one reading per time period
      const pipeline = [
        { $match: query },
        { $sort: { createdAt: 1 } }, // Sort to get the first reading in each period
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
              ...(averageBy === 'Hour' && { hour: { $hour: '$createdAt' } })
            },
            // Get first reading for each sensor in range
            ...Object.fromEntries(
              Array.from({ length: endSensor - startSensor + 1 }, (_, i) => {
                const sensorNum = startSensor + i;
                const sensorKey = `sensor${sensorNum}`;
                return [sensorKey, { $first: `$${sensorKey}` }];
              })
            ),
            // Keep the original timestamp
            timestamp: { $first: '$createdAt' },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            timestamp: 1,
            // Include all sensor values as-is
            ...Object.fromEntries(
              Array.from({ length: endSensor - startSensor + 1 }, (_, i) => {
                const sensorKey = `sensor${startSensor + i}`;
                return [sensorKey, 1];
              })
            ),
            count: 1
          }
        },
        { $sort: { timestamp: 1 } }
      ];

      console.log('Executing aggregation pipeline:', JSON.stringify(pipeline, null, 2));

      // Execute the aggregation
      let results;
      try {
        results = await sensormodel.aggregate(pipeline);
        console.log(`Found ${results?.length || 0} time periods with data`);
      } catch (error) {
        console.error('Aggregation error:', error);
        throw new Error(`Failed to aggregate data: ${error.message}`);
      }

      res.json({
        success: true,
        data: results,
        metadata: {
          sensorRange: `${startSensor}-${endSensor}`,
          side: sides,
          averageBy: averageBy,
          startDate: startDate,
          endDate: endDate,
          totalRecords: results.length
        }
      });

    } catch (error) {
      console.error('Error in reportPerData:', error);
      res.status(500).json({
        error: 'An error occurred while generating the report',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async reportDateData(req, res) {
    console.log('reportDateData called with params:', req.query);
    console.log('Headers:', req.headers);
    try {
      const id = req.headers['x-user-id'] || req.headers['X-User-ID'];
      if (!id) {
        return res.status(400).json({ error: 'User ID is required in headers' });
      }

      // Get query parameters
      const { sensorrange, sides, startDate, endDate } = req.query;

      // Validate parameters
      if (!sensorrange || !sides || !startDate || !endDate) {
        return res.status(400).json({
          error: 'Missing required parameters',
          required: ['sensorrange', 'sides', 'startDate', 'endDate']
        });
      }

     // Parse dates and adjust to full day range
     const start = new Date(startDate);
     // Set start time to 12:00:01 AM
     start.setHours(0, 0, 1, 0);
     
     const end = new Date(endDate);
     // Set end time to 11:59:59 PM
     end.setHours(23, 59, 59, 999);

      // Validate date format
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          error: 'Invalid date format. Please use ISO 8601 format (e.g., 2023-01-01T00:00:00.000Z)'
        });
      }

      // Build query
      const query = {
        id,
        createdAt: {
          $gte: start,
          $lte: end
        }
      };

      // Handle sides
      if (sides === 'Aside') {
        query.waveguide = 'WG1';
      } else if (sides === 'Bside') {
        query.waveguide = 'WG2';
      } else if (sides === 'Allside') {
        // For Allside, match either WG1 or WG2
        query.waveguide = { $in: ['WG1', 'WG2'] };
      }

      console.log('Executing query:', JSON.stringify(query, null, 2));

      // Fetch all records between the specified dates
      let results;
      try {
        results = await sensormodel.find(query).sort({ createdAt: 1 }).lean();
        console.log(`Found ${results?.length || 0} records`);

        // Process results to remove MongoDB-specific fields and map waveguide values
        results = results.map(doc => {
          // Create a new object with only the fields we want to keep
          const processedDoc = {
            ...doc,
            // Map waveguide values to 'Aside'/'Bside'
            waveguide: doc.waveguide === 'WG1' ? 'Aside' : 'Bside'
          };

          // Remove MongoDB-specific fields
          delete processedDoc._id;
          delete processedDoc.id;
          delete processedDoc.updatedAt;
          delete processedDoc.__v;
          delete processedDoc.createdAt;

          // Filter sensor data based on the requested range if not 'all-data'
          if (sensorrange.toLowerCase() !== 'all-data') {
            let startSensor = 1;
            let endSensor = 38;

            // Parse sensor range if not 'all-data'
            const rangeMatch = sensorrange.match(/^(\d+)-(\d+)$/);
            if (rangeMatch) {
              startSensor = parseInt(rangeMatch[1], 10);
              endSensor = parseInt(rangeMatch[2], 10);
            } else if (sensorrange.toLowerCase().startsWith('sensor')) {
              // Handle single sensor (e.g., 'sensor1')
              const sensorNum = parseInt(sensorrange.replace(/\D/g, ''), 10);
              if (!isNaN(sensorNum)) {
                startSensor = sensorNum;
                endSensor = sensorNum;
              }
            }

            // Remove sensors outside the requested range
            for (let i = 1; i <= 38; i++) {
              if (i < startSensor || i > endSensor) {
                delete processedDoc[`sensor${i}`];
              }
            }
          }

          return processedDoc;
        });
      } catch (error) {
        console.error('Query error:', error);
        throw new Error(`Failed to fetch data: ${error.message}`);
      }

      res.json({
        success: true,
        data: results,
        metadata: {
          sensorRange: sensorrange.toLowerCase() === 'all-data' ? '1-38' : sensorrange,
          side: sides,
          startDate: startDate,
          endDate: endDate,
          totalRecords: results.length
        }
      });

    } catch (error) {
      console.error('Error in reportDateData:', error);
      res.status(500).json({
        error: 'An error occurred while generating the report',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  async reportCountData(req, mres) {
    console.log('reportCountData called with params:', req.query);
    console.log('Headers:', req.headers);
    try {
      const id = req.headers['x-user-id'] || req.headers['X-User-ID'];
      if (!id) {
        return mres.status(400).json({ error: 'User ID is required in headers' });
      }

      // Get query parameters
      const { sensorrange, sides, count } = req.query;

      // Validate parameters
      if (!sensorrange || !sides || !count) {
        return mres.status(400).json({
          error: 'Missing required parameters',
          required: ['sensorrange', 'sides', 'count']
        });
      }

      // Parse and validate count
      let recordLimit = parseInt(count, 10);
      if (isNaN(recordLimit) || recordLimit <= 0) {
        return mres.status(400).json({
          error: 'Invalid count parameter. Must be a positive integer.',
          validExamples: [100, 500, 1000]
        });
      }

      // Set a maximum limit to prevent excessive load
      const MAX_LIMIT = 5000;
      if (recordLimit > MAX_LIMIT) {
        return mres.status(400).json({
          error: `Count exceeds maximum allowed value of ${MAX_LIMIT}`,
          maxAllowed: MAX_LIMIT
        });
      }

      // Build query (without date range)
      const query = {
        id
      };

      // Handle sides
      if (sides === 'Aside') {
        query.waveguide = 'WG1';
      } else if (sides === 'Bside') {
        query.waveguide = 'WG2';
      } else if (sides === 'Allside') {
        query.waveguide = { $in: ['WG1', 'WG2'] };
      }

      console.log('Executing query:', JSON.stringify(query, null, 2));

      // Fetch records with limit applied
      let results;
      try {
        // Fetch records sorted by createdAt descending (newest first)
        results = await sensormodel.find(query)
          .sort({ createdAt: -1 })  // Get newest records first
          .limit(recordLimit)       // Apply count limit
          .lean();

        // Reverse to get chronological order (oldest first)
        results.reverse();

        console.log(`Found ${results?.length || 0} records`);

        // Process results
        results = results.map(doc => {
          const processedDoc = {
            ...doc,
            waveguide: doc.waveguide === 'WG1' ? 'Aside' : 'Bside'
          };

          // Remove unnecessary fields
          delete processedDoc._id;
          delete processedDoc.id;
          delete processedDoc.updatedAt;
          delete processedDoc.__v;
          delete processedDoc.createdAt;

          // Filter sensor data based on requested range
          if (sensorrange.toLowerCase() !== 'all-data') {
            let startSensor = 1;
            let endSensor = 38;

            // Parse sensor range
            const rangeMatch = sensorrange.match(/^(\d+)-(\d+)$/);
            if (rangeMatch) {
              startSensor = parseInt(rangeMatch[1], 10);
              endSensor = parseInt(rangeMatch[2], 10);
            } else if (sensorrange.toLowerCase().startsWith('sensor')) {
              const sensorNum = parseInt(sensorrange.replace(/\D/g, ''), 10);
              if (!isNaN(sensorNum)) {
                startSensor = sensorNum;
                endSensor = sensorNum;
              }
            }

            // Remove sensors outside the requested range
            for (let i = 1; i <= 38; i++) {
              if (i < startSensor || i > endSensor) {
                delete processedDoc[`sensor${i}`];
              }
            }
          }

          return processedDoc;
        });
      } catch (error) {
        console.error('Query error:', error);
        throw new Error(`Failed to fetch data: ${error.message}`);
      }

      mres.json({
        success: true,
        data: results,
        metadata: {
          sensorRange: sensorrange.toLowerCase() === 'all-data' ? '1-38' : sensorrange,
          side: sides,
          recordLimit: recordLimit,
          returnedRecords: results.length
        }
      });

    } catch (error) {
      console.error('Error in reportCountData:', error);
      res.status(500).json({
        error: 'An error occurred while generating the report',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async heatmapData(req, res) {
    try {
      const id = req.headers['x-user-id'] || req.headers['X-User-ID'];
      if (!id) {
        return res.status(400).json({ error: 'User ID is required in headers' });
      }

      // Extract and validate query parameters
      const { side, startDate, endDate, value } = req.query;

      // Validate required parameters
      const sideUpper = side?.toUpperCase();
      if (!side || !['ASIDE', 'BSIDE'].includes(sideUpper)) {
        return res.status(400).json({ error: 'Valid side parameter is required (ASide or BSide)' });
      }

      // Map frontend side values to database waveguide values
      const waveguideMap = {
        'ASIDE': 'WG1',
        'BSIDE': 'WG2'
      };
      const waveguide = waveguideMap[sideUpper];

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Both startDate and endDate parameters are required' });
      }

      if (!value || !['min', 'max'].includes(value.toLowerCase())) {
        return res.status(400).json({ error: 'Valid value parameter is required (min or max)' });
      }

      // Parse dates
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid date format. Please use ISO 8601 format (e.g., 2023-01-01T00:00:00.000Z)' });
      }

      if (start > end) {
        return res.status(400).json({ error: 'startDate must be before endDate' });
      }

      // Create base pipeline stages
      const baseStages = [
        // Match documents within the date range and for the specified side
        {
          $match: {
            waveguide: waveguide,
            TIME: {
              $gte: new Date(start).toISOString(),
              $lte: new Date(end).toISOString()
            }
          }
        },
        // Project to include only the fields we need
        {
          $project: {
            date: { $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$TIME" } } },
            // Convert sensor fields to an array of {k: sensorName, v: value} pairs
            sensors: {
              $objectToArray: {
                sensor1: "$sensor1", sensor2: "$sensor2", sensor3: "$sensor3",
                sensor4: "$sensor4", sensor5: "$sensor5", sensor6: "$sensor6",
                sensor7: "$sensor7", sensor8: "$sensor8", sensor9: "$sensor9",
                sensor10: "$sensor10", sensor11: "$sensor11", sensor12: "$sensor12",
                sensor13: "$sensor13", sensor14: "$sensor14", sensor15: "$sensor15",
                sensor16: "$sensor16", sensor17: "$sensor17", sensor18: "$sensor18",
                sensor19: "$sensor19", sensor20: "$sensor20", sensor21: "$sensor21",
                sensor22: "$sensor22", sensor23: "$sensor23", sensor24: "$sensor24",
                sensor25: "$sensor25", sensor26: "$sensor26", sensor27: "$sensor27",
                sensor28: "$sensor28", sensor29: "$sensor29", sensor30: "$sensor30",
                sensor31: "$sensor31", sensor32: "$sensor32", sensor33: "$sensor33",
                sensor34: "$sensor34", sensor35: "$sensor35", sensor36: "$sensor36",
                sensor37: "$sensor37", sensor38: "$sensor38"
              }
            },
            TIME: 1
          }
        },
        // Unwind the sensors array
        { $unwind: "$sensors" },
        // Filter out null/undefined/empty values
        {
          $match: {
            "sensors.v": { $exists: true, $ne: null, $ne: "" }
          }
        },
        // Convert all values to a consistent number format
        {
          $addFields: {
            numericValue: {
              $let: {
                vars: {
                  // Handle Decimal128, string, and number types
                  rawValue: {
                    $cond: [
                      { $eq: [{ $type: "$sensors.v" }, "object"] },
                      { $toString: "$sensors.v" },
                      { $toString: { $ifNull: ["$sensors.v", ""] } }
                    ]
                  }
                },
                in: {
                  $cond: [
                    { $regexMatch: { input: "$$rawValue", regex: /^[+-]?\d+(\.\d+)?$/ } },
                    { $toDouble: { $trim: { input: "$$rawValue" } } },
                    null
                  ]
                }
              }
            }
          }
        },
        // Filter out any remaining invalid numeric values
        {
          $match: {
            numericValue: { $type: ["number", "decimal"] }
          }
        }
      ];

      // Create separate pipelines for min and max to avoid $cond in $group
      const groupStage = value.toLowerCase() === 'max'
        ? {
          $group: {
            _id: {
              date: "$date",
              sensorName: "$sensors.k"
            },
            date: { $first: "$date" },
            sensorName: { $first: "$sensors.k" },
            value: { $max: "$numericValue" },
            count: { $sum: 1 }
          }
        }
        : {
          $group: {
            _id: {
              date: "$date",
              sensorName: "$sensors.k"
            },
            date: { $first: "$date" },
            sensorName: { $first: "$sensors.k" },
            value: { $min: "$numericValue" },
            count: { $sum: 1 }
          }
        };

      // Combine all stages
      const pipeline = [
        ...baseStages,
        groupStage,
        // Group by date to collect all sensors
        {
          $group: {
            _id: "$date",
            date: { $first: "$date" },
            sensors: {
              $push: {
                sensorName: "$sensorName",
                value: { $round: ["$value", 2] }
              }
            },
            count: { $sum: 1 }
          }
        },
        // Format the output
        {
          $project: {
            _id: 0,
            date: 1,
            sensors: 1
          }
        },
        // Sort by date
        { $sort: { date: 1 } }
      ];

      // First, check if we have any matching documents
      const count = await sensormodel.countDocuments({
        waveguide: waveguide,
        TIME: {
          $gte: new Date(start).toISOString(),
          $lte: new Date(end).toISOString()
        }
      });



      if (count === 0) {
        // Try to find any data to debug the date format
        const sampleDoc = await sensormodel.findOne({ waveguide: waveguide });

      }

      // Execute the main aggregation pipeline for daily data
      let dailyData = [];
      let topValues = [];

      try {
        // Get daily data
        dailyData = await sensormodel.aggregate(pipeline);

        // Create a separate pipeline for top 8 values
        const topValuesPipeline = [
          ...baseStages,
          // Sort by value (ascending for min, descending for max)
          {
            $sort: {
              numericValue: value.toLowerCase() === 'min' ? 1 : -1
            }
          },
          // Group by sensor to get the extreme value for each sensor
          {
            $group: {
              _id: "$sensors.k",
              sensorName: { $first: "$sensors.k" },
              value: { $first: "$numericValue" },
              date: { $first: "$date" }
            }
          },
          // Sort and limit to top 8
          {
            $sort: {
              value: value.toLowerCase() === 'min' ? 1 : -1
            }
          },
          { $limit: 8 },
          // Format the output
          {
            $project: {
              _id: 0,
              sensorName: 1,
              value: { $round: ["$value", 2] },
              date: 1
            }
          }
        ];

        // Get top 8 values
        topValues = await sensormodel.aggregate(topValuesPipeline);

      } catch (error) {
        console.error('Aggregation error:', error);
        throw error;
      }

      const result = {
        side: side.charAt(0).toUpperCase() + side.slice(1),
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        valueType: value.toLowerCase(),
        data: dailyData,
        topValues: topValues  // Add top 8 values to the response
      };

      res.status(200).json(result);
    }
    catch (error) {
      console.error('Error in heatmapData:', error);
      res.status(500).json({
        error: 'An error occurred while generating the heatmap data',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  //testing api for sensor data
  async getallsensorNoLimit(req, res) {
    try {
      console.log('Fetching all sensor data...');

      // Fetch all documents from the database
      const allDocuments = await sensormodel
        .find({})  // Empty query object to match all documents
        .lean()
        .sort({
          updatedAt: -1
        });

      console.log(`Fetched ${allDocuments.length} documents`);

      // Return all documents
      res.status(200).json({
        success: true,
        count: allDocuments.length,
        data: allDocuments
      });
    } catch (error) {
      console.error('Error in getallsensor:', error);
      res.status(500).json({
        error: 'An error occurred while fetching sensor data',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getDashboardData(req, res) {
    console.log('[DEBUG] getDashboardData called with query:', req.query);
    try {
      const { side = 'Aside', interval = '1h' } = req.query;
      const validIntervals = ['Live', '1h', '2h', '5h', '7h', '12h'];
      const validSides = ['Aside', 'Bside'];

      // Validate input parameters
      if (!validSides.includes(side)) {
        return res.status(400).json({
          success: false,
          message: `Invalid side parameter. Must be "Aside" or "Bside"`,
        });
      }

      if (!validIntervals.includes(interval)) {
        return res.status(400).json({
          success: false,
          message: `Invalid interval. Must be one of: ${validIntervals.join(', ')}`,
        });
      }

      const userId = 'XY001'; // Default user ID
      const waveguide = side === 'Aside' ? 'WG1' : 'WG2';

      // Calculate time range based on interval
      const timeRange = this._calculateTimeRange(interval);
      const startTime = timeRange.startTime;
      const endTime = timeRange.endTime;

      // Fetch all required data in parallel
      const [
        realtimeData,
        historicalData,
        avgTableData
      ] = await Promise.all([
        // Get realtime sensor data
        this.getallsensor({ ...req, query: {} }, { json: (data) => data }),
        // Get historical chart data
        this._fetchHistoricalData(userId, waveguide, startTime, endTime),
        // Get hourly average data
        this.getAvgTable({ ...req, query: {} }, { json: (data) => data })
      ]);

      // Prepare consolidated response
      const response = {
        success: true,
        data: {
          metadata: {
            side,
            interval,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            timestamp: new Date().toISOString()
          },
          realtime: realtimeData,
          historical: historicalData,
          averages: avgTableData
        },
        message: 'Dashboard data fetched successfully'
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('[ERROR] Error in getDashboardData:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  async getCollectorbar(req, res) {
    try {
      const id = req.headers['x-user-id'] || req.headers['X-User-ID'];
      const { sensorId, sides: side, interval } = req.query;

      // Validate required parameters
      if (!sensorId || !side || !interval) {
        return res.status(400).json({
          error: 'Missing required parameters: sensorId, side, and interval are required'
        });
      }

      // Validate side parameter
      const validSides = ['Aside', 'Bside'];
      if (!validSides.includes(side)) {
        return res.status(400).json({
          error: 'Invalid side parameter. Must be "Aside" or "Bside"'
        });
      }

      // Validate sensorId format (sensor1 to sensor38)
      const sensorNum = parseInt(sensorId.replace('sensor', ''));
      if (isNaN(sensorNum) || sensorNum < 1 || sensorNum > 38) {
        return res.status(400).json({
          error: 'Invalid sensorId. Must be in format sensor1 to sensor38'
        });
      }

      // Calculate time range based on interval
      let timeRange = new Date();
      let maxDataPoints = 1000;

      switch (interval) {
        case '30Min':
          timeRange.setMinutes(timeRange.getMinutes() - 30);
          maxDataPoints = 300;
          break;
        case '1H':
          timeRange.setHours(timeRange.getHours() - 1);
          maxDataPoints = 600;
          break;
        case '12H':
          timeRange.setHours(timeRange.getHours() - 12);
          maxDataPoints = 720;
          break;
        case '1D':
          timeRange.setDate(timeRange.getDate() - 1);
          maxDataPoints = 480;
          break;
        case '1W':
          timeRange.setDate(timeRange.getDate() - 7);
          maxDataPoints = 336;
          break;
        case '1M':
          timeRange.setMonth(timeRange.getMonth() - 1);
          maxDataPoints = 360;
          break;
        case '6M':
          timeRange.setMonth(timeRange.getMonth() - 6);
          maxDataPoints = 180;
          break;
        default:
          return res.status(400).json({
            error: 'Invalid interval. Valid values are: 30Min, 1H, 12H, 1D, 1W, 1M, 6M'
          });
      }

      // Map side to waveguide
      const waveguide = side === 'Aside' ? 'WG1' : 'WG2';

      // Validate user ID
      if (!id) {
        return res.status(400).json({
          error: 'User ID is required in headers (X-User-ID or x-user-id)'
        });
      }

      // Build the query with user ID filter
      const query = {
        id,
        waveguide,
        createdAt: { $gte: timeRange }
      };

      // Check total count
      const totalCount = await sensormodel.countDocuments(query);

      let sensorData;

      // For larger datasets, use sampling
      if (totalCount > maxDataPoints) {
        // Use aggregation to sample data
        const pipeline = [
          {
            $match: {
              id: id,
              waveguide: waveguide,
              createdAt: { $gte: timeRange }
            }
          },
          { $sort: { createdAt: 1 } },
          {
            $group: {
              _id: null,
              docs: { $push: "$$ROOT" },
              total: { $sum: 1 }
            }
          },
          {
            $project: {
              sampledDocs: {
                $map: {
                  input: { $range: [0, { $min: [maxDataPoints, "$total"] }] },
                  as: "idx",
                  in: {
                    $arrayElemAt: [
                      "$docs",
                      {
                        $floor: {
                          $multiply: [
                            "$$idx",
                            { $divide: ["$total", maxDataPoints] }
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            }
          },
          { $unwind: "$sampledDocs" },
          { $replaceRoot: { newRoot: "$sampledDocs" } },
          { $sort: { createdAt: 1 } }
        ];

        sensorData = await sensormodel.aggregate(pipeline);
      } else {
        // For smaller datasets, fetch normally
        sensorData = await sensormodel.find(query)
          .sort({ createdAt: 1 })
          .lean();
      }

      if (!sensorData || sensorData.length === 0) {
        return res.status(404).json({
          message: 'No data found for the given parameters'
        });
      }

      const result = {
        sensorId,
        side,
        interval,
        dataPoints: sensorData.length,
        totalAvailable: totalCount,
        data: sensorData.map((entry) => {
          const sensorValue = entry[sensorId];

          return {
            timestamp: entry.createdAt,
            value: sensorValue !== undefined && sensorValue !== null ? Number(sensorValue) : null
          };
        }).filter(item => item.value !== null) // Remove entries with null values
      };

      res.json(result);

    } catch (error) {
      console.error('Error in getCollectorbar:', error);
      res.status(500).json({
        error: 'An error occurred while fetching sensor data',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getThresholds(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.headers['X-User-ID'];

      // Validate required parameters
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required in headers (X-User-ID or x-user-id)'
        });
      }

      // Find threshold for the user
      const threshold = await Threshold.findOne({ userId })
        .select('-__v -createdAt -updatedAt');

      // If no threshold exists, return default values
      if (!threshold) {
        return res.json({
          success: true,
          data: null,
          message: 'No threshold settings found for this user'
        });
      }

      res.json({
        success: true,
        data: threshold
      });
    } catch (error) {
      console.error('Error getting thresholds:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve thresholds',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Set thresholds for a user (min/max) and store userId with it.
   * Accepts userId from req.body or req.headers.
   * POST /setThresholds
   * Body: { minThreshold, maxThreshold, userId }
   * Header: X-User-ID (optional)
   */
  async setThresholds(req, res) {
    try {
      // Accept userId from body or headers
      const userId = req.body.userId || req.headers['x-user-id'] || req.headers['X-User-ID'];
      const { minThreshold, maxThreshold } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required in body or headers',
        });
      }
      if (minThreshold === undefined || maxThreshold === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters. Required: minThreshold, maxThreshold',
        });
      }
      if (isNaN(minThreshold) || isNaN(maxThreshold)) {
        return res.status(400).json({
          success: false,
          error: 'Thresholds must be numbers',
        });
      }
      if (Number(maxThreshold) <= Number(minThreshold)) {
        return res.status(400).json({
          success: false,
          error: 'maxThreshold must be greater than minThreshold',
        });
      }
      // Upsert threshold for user
      const threshold = await Threshold.findOneAndUpdate(
        { userId },
        { minThreshold, maxThreshold },
        { new: true, upsert: true, runValidators: true }
      );
      res.status(200).json({
        success: true,
        message: 'Threshold saved successfully',
        data: threshold,
      });
    } catch (error) {
      console.error('Error in setThreshold:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to save threshold',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  

  async getSensorData(req, res) {
    try {
      const id = req.headers['x-user-id'] || req.headers['X-User-ID'];
      const { sensorId, sides: side, interval } = req.query;

      // Validate required parameters
      if (!sensorId || !side || !interval) {
        return res.status(400).json({
          error: 'Missing required parameters: sensorId, side, and interval are required'
        });
      }

      // Validate side parameter
      const validSides = ['Aside', 'Bside'];
      if (!validSides.includes(side)) {
        return res.status(400).json({
          error: 'Invalid side parameter. Must be "Aside" or "Bside"'
        });
      }

      // Validate sensorId format (sensor1 to sensor38)
      const sensorNum = parseInt(sensorId.replace('sensor', ''));
      if (isNaN(sensorNum) || sensorNum < 1 || sensorNum > 38) {
        return res.status(400).json({
          error: 'Invalid sensorId. Must be in format sensor1 to sensor38'
        });
      }

      // Calculate time range based on interval
      let timeRange = new Date();
      let maxDataPoints = 1000;

      switch (interval) {
        case '30Min':
          timeRange.setMinutes(timeRange.getMinutes() - 30);
          maxDataPoints = 300;
          break;
        case '1H':
          timeRange.setHours(timeRange.getHours() - 1);
          maxDataPoints = 600;
          break;
        case '12H':
          timeRange.setHours(timeRange.getHours() - 12);
          maxDataPoints = 720;
          break;
        case '1D':
          timeRange.setDate(timeRange.getDate() - 1);
          maxDataPoints = 480;
          break;
        case '1W':
          timeRange.setDate(timeRange.getDate() - 7);
          maxDataPoints = 336;
          break;
        case '1M':
          timeRange.setMonth(timeRange.getMonth() - 1);
          maxDataPoints = 360;
          break;
        case '6M':
          timeRange.setMonth(timeRange.getMonth() - 6);
          maxDataPoints = 180;
          break;
        default:
          return res.status(400).json({
            error: 'Invalid interval. Valid values are: 30Min, 1H, 12H, 1D, 1W, 1M, 6M'
          });
      }

      // Map side to waveguide
      const waveguide = side === 'Aside' ? 'WG1' : 'WG2';

      // Validate user ID
      if (!id) {
        return res.status(400).json({
          error: 'User ID is required in headers (X-User-ID or x-user-id)'
        });
      }

      // Build the query with user ID filter
      const query = {
        id,
        waveguide,
        createdAt: { $gte: timeRange }
      };

      // Check total count
      const totalCount = await sensormodel.countDocuments(query);

      let sensorData;

      // For larger datasets, use sampling
      if (totalCount > maxDataPoints) {
        // Use aggregation to sample data
        const pipeline = [
          {
            $match: {
              id: id,
              waveguide: waveguide,
              createdAt: { $gte: timeRange }
            }
          },
          { $sort: { createdAt: 1 } },
          {
            $group: {
              _id: null,
              docs: { $push: "$$ROOT" },
              total: { $sum: 1 }
            }
          },
          {
            $project: {
              sampledDocs: {
                $map: {
                  input: { $range: [0, { $min: [maxDataPoints, "$total"] }] },
                  as: "idx",
                  in: {
                    $arrayElemAt: [
                      "$docs",
                      {
                        $floor: {
                          $multiply: [
                            "$$idx",
                            { $divide: ["$total", maxDataPoints] }
                          ]
                        }
                      }
                    ]
                  }
                }
              }
            }
          },
          { $unwind: "$sampledDocs" },
          { $replaceRoot: { newRoot: "$sampledDocs" } },
          { $sort: { createdAt: 1 } }
        ];

        sensorData = await sensormodel.aggregate(pipeline);
      } else {
        // For smaller datasets, fetch normally
        sensorData = await sensormodel.find(query)
          .sort({ createdAt: 1 })
          .lean();
      }

      if (!sensorData || sensorData.length === 0) {
        return res.status(404).json({
          message: 'No data found for the given parameters'
        });
      }

      const result = {
        sensorId,
        side,
        interval,
        dataPoints: sensorData.length,
        totalAvailable: totalCount,
        data: sensorData.map((entry) => {
          const sensorValue = entry[sensorId];

          return {
            timestamp: entry.createdAt,
            value: sensorValue !== undefined && sensorValue !== null ? Number(sensorValue) : null
          };
        }).filter(item => item.value !== null) // Remove entries with null values
      };

      res.json(result);

    } catch (error) {
      console.error('Error in getCollectorbar:', error);
      res.status(500).json({
        error: 'An error occurred while fetching sensor data',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }


  async getSensorComparison(req, res) {
    try {
      const id = req.headers['x-user-id'] || req.headers['X-User-ID'];
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'User ID is required in headers',
        });
      }
      // 24h window
      const endTime = new Date();
      const startTime = new Date(endTime);
      startTime.setHours(endTime.getHours() - 24);

      // Helper to get sensor key for DB
      const getSensorKey = (side, idx) => `sensor${idx}`;
      // Helper to get sensor label for frontend
      const getSensorLabel = (side, idx) =>
        side === 'ASide' ? `ES${idx}` : `WS${idx + 12}`;

      // WG1: ES1-ES12 (sensor1-sensor12)
      // WG2: WS13-WS24 (sensor1-sensor12 in WG2, but label as WS13-WS24)
      const sensors = [];
      for (let i = 1; i <= 12; i++) {
        sensors.push({ side: 'ASide', idx: i });
        sensors.push({ side: 'BSide', idx: i });
      }

      // Fetch all 24h data for both waveguides in parallel
      const [wg1Docs, wg2Docs] = await Promise.all([
        sensormodel.find({ id, waveguide: 'WG1', createdAt: { $gte: startTime, $lte: endTime } }).sort({ createdAt: 1 }).lean(),
        sensormodel.find({ id, waveguide: 'WG2', createdAt: { $gte: startTime, $lte: endTime } }).sort({ createdAt: 1 }).lean(),
      ]);
      // Fetch latest for both waveguides
      const [latestWG1, latestWG2] = await Promise.all([
        sensormodel.findOne({ id, waveguide: 'WG1' }).sort({ createdAt: -1 }).lean(),
        sensormodel.findOne({ id, waveguide: 'WG2' }).sort({ createdAt: -1 }).lean(),
      ]);

      const results = sensors.map(({ side, idx }) => {
        // For ASide: WG1, sensor1-12; For BSide: WG2, sensor1-12
        const docs = side === 'ASide' ? wg1Docs : wg2Docs;
        const sensorKey = getSensorKey(side, idx);
        // 24h average
        const values = docs
          .map((doc) => parseFloat(doc[sensorKey]))
          .filter((v) => !isNaN(v));
        const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
        // Latest value
        const latestDoc = side === 'ASide' ? latestWG1 : latestWG2;
        const latestVal = latestDoc && latestDoc[sensorKey] !== undefined ? parseFloat(latestDoc[sensorKey]) : null;
        // Trend
        let trend = 'normal';
        if (avg !== null && latestVal !== null) {
          if (latestVal < avg) trend = 'low';
          else if (latestVal > avg) trend = 'high';
        }
        // Sensor label
        const label = getSensorLabel(side, idx);
        return {
          sensorId: label,
          average: avg !== null ? Number(avg.toFixed(2)) : null,
          latest: latestVal !== null ? Number(latestVal.toFixed(2)) : null,
          trend,
        };
      });

      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error in getSensorComparison:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
export const apiController = new ApiController();