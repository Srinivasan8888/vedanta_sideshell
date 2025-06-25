import sensormodel from "../Models/sensorModel.js";

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
  constructor() {
    // Bind methods to maintain 'this' context
    this.getallsensor = this.getallsensor.bind(this);
    this.AverageTempbyHour = this.AverageTempbyHour.bind(this);
  }
  // Helper function to calculate average of an array
  _calculateAverage(values) {
    if (!values || values.length === 0) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    return parseFloat((sum / values.length).toFixed(2));
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

  async getallsensorNoLimit(req, res) {
    try {
      console.log('Fetching all sensor data...');
      
      // Fetch all documents from the database
      const allDocuments = await sensormodel
        .find({})  // Empty query object to match all documents
        .lean();
      
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

  // Helper function to convert date to database time string format
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
      const startTime = new Date(endTime);
      startTime.setMinutes(endTime.getMinutes() - config.duration);

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

      // Convert dates
      const start = new Date(startDate);
      const end = new Date(endDate);

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
            ),
            count: { $sum: 1 }
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
            ),
            count: 1
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

      // Convert dates
      const start = new Date(startDate);
      const end = new Date(endDate);

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

      // Parse dates
      const start = new Date(startDate);
      const end = new Date(endDate);

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

  async reportCountData(req, res) {
    console.log('reportCountData called with params:', req.query);
    console.log('Headers:', req.headers);
    try {
      const id = req.headers['x-user-id'] || req.headers['X-User-ID'];
      if (!id) {
        return res.status(400).json({ error: 'User ID is required in headers' });
      }
  
      // Get query parameters
      const { sensorrange, sides, count } = req.query;
  
      // Validate parameters
      if (!sensorrange || !sides || !count) {
        return res.status(400).json({ 
          error: 'Missing required parameters',
          required: ['sensorrange', 'sides', 'count']
        });
      }
  
      // Parse and validate count
      let recordLimit = parseInt(count, 10);
      if (isNaN(recordLimit) || recordLimit <= 0) {
        return res.status(400).json({ 
          error: 'Invalid count parameter. Must be a positive integer.',
          validExamples: [100, 500, 1000]
        });
      }
  
      // Set a maximum limit to prevent excessive load
      const MAX_LIMIT = 5000;
      if (recordLimit > MAX_LIMIT) {
        return res.status(400).json({ 
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
  
      res.json({
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
}

export const apiController = new ApiController();


