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
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'ID parameter is required' });
      }

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

  // Helper function to convert date to database time string format
  _formatTimeForDB(date) {
    const pad = num => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  async AverageTempbyHour(req, res) {
    try {
      const { id, Interval = '1Hr' } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'ID parameter is required' });
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

        // Get one record per waveguide closest to the point time
        const [wg1Record, wg2Record] = await Promise.all([
          sensormodel.findOne({
            id,
            waveguide: 'WG1',
            TIME: { $lte: this._formatTimeForDB(pointEndTime) }
          }).sort({ TIME: -1 }).lean(),
          sensormodel.findOne({
            id,
            waveguide: 'WG2',
            TIME: { $lte: this._formatTimeForDB(pointEndTime) }
          }).sort({ TIME: -1 }).lean()
        ]);

        // Process WG1 data
        const wg1Values = [];
        if (wg1Record) {
          Object.entries(wg1Record).forEach(([key, value]) => {
            if (key.startsWith('sensor') && value !== 'null') {
              const num = parseFloat(value);
              if (!isNaN(num)) wg1Values.push(num);
            }
          });
        }

        // Process WG2 data
        const wg2Values = [];
        if (wg2Record) {
          Object.entries(wg2Record).forEach(([key, value]) => {
            if (key.startsWith('sensor') && value !== 'null') {
              const num = parseFloat(value);
              if (!isNaN(num)) wg2Values.push(num);
            }
          });
        }

        // Calculate averages
        const allValues = [...wg1Values, ...wg2Values];
        
        intervalData.push({
          time: timeLabel,
          timestamp: pointEndTime.toISOString(),
          interval: Interval,
          averageTemperature: this._calculateAverage(allValues),
          totalReadings: allValues.length,
          waveguides: {
            WG1: {
              average: this._calculateAverage(wg1Values),
              readings: wg1Values.length
            },
            WG2: {
              average: this._calculateAverage(wg2Values),
              readings: wg2Values.length
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
}

export const apiController = new ApiController();


