// const { verifyRefreshToken } = require("../../Helpers/jwt_helper")

import SensorModel1 from '../Models/sensorModel1.js';
import SensorModel2 from '../Models/sensorModel2.js';
import SensorModel3 from '../Models/sensorModel3.js';
import SensorModel4 from '../Models/sensorModel4.js';
import SensorModel5 from '../Models/sensorModel5.js';
import SensorModel6 from '../Models/sensorModel6.js';
import SensorModel7 from '../Models/sensorModel7.js';
import SensorModel8 from '../Models/sensorModel8.js';
import SensorModel9 from '../Models/sensorModel9.js';
import SensorModel10 from '../Models/sensorModel10.js';
import AlertModel from '../Models/AlertModel.js';
import UserAlertModel from '../Models/UserAlertModel.js';

export const Aside = async (req, res) => {
  try {
    // Fetch all sensor data concurrently
    const projection = {
      _id: 0,
      id: 0,
      busbar: 0,
      TIME: 0,
      createdAt: 0,
      updatedAt: 0,
      __v: 0
    };

    const [data, data1, data2, data3, data4, data5] = await Promise.all([
      SensorModel1.findOne({}, projection).sort({ updatedAt: -1 }),
      SensorModel2.findOne({}, projection).sort({ updatedAt: -1 }),
      SensorModel3.findOne({}, projection).sort({ updatedAt: -1 }),
      SensorModel4.findOne({}, projection).sort({ updatedAt: -1 }),
      SensorModel5.findOne({}, projection).sort({ updatedAt: -1 }),
      SensorModel6.findOne({}, projection).sort({ updatedAt: -1 }),
    ]);


    // Combine sensor data
    const combinedData = [data, data1, data2, data3, data4, data5].filter(Boolean); // Remove null values

    res.status(200).json({ data: combinedData });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
};

export const Bside = async (req, res) => {
  try {
    // Fetch all sensor data concurrently
    const [data, data1, data2, data3] = await Promise.all([
      SensorModel7.find().sort({ updatedAt: -1 }).limit(1),
      SensorModel8.find().sort({ updatedAt: -1 }).limit(1),
      SensorModel9.find().sort({ updatedAt: -1 }).limit(1),
      SensorModel10.find().sort({ updatedAt: -1 }).limit(1)
    ]);

    // Combine all sensor data into a single array
    const combinedData = [
      ...data,
      ...data1,
      ...data2,
      ...data3
    ];

    res.status(200).json({
      //   message: "Data fetched successfully.",
      data: combinedData // Send combined data as a single response
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      error: "An error occurred while fetching data.",
    });
  }
};



// export const getallsensor = async (req, res) => {
//   try {
//     const userId = req.headers['x-user-id'];
//     const { time } = req.query; // Extract `time` and `userId` from query parameters

//     // Array of sensor models
//     const collectionModels = [
//       SensorModel1, SensorModel2, SensorModel3, SensorModel4, SensorModel5,
//       SensorModel6, SensorModel7, SensorModel8, SensorModel9, SensorModel10
//     ];

//     // Helper function to calculate the start time based on the `time` parameter
//     const setChangedTime = (time) => {
//       const currentDateTime = new Date();
//       switch (time) {
//         case "1D":
//           return new Date(currentDateTime.getTime() - (24 * 60 * 60 * 1000)); // 1 day ago
//         case "3D":
//           return new Date(currentDateTime.getTime() - (3 * 24 * 60 * 60 * 1000)); // 3 days ago
//         case "1W":
//           return new Date(currentDateTime.getTime() - (7 * 24 * 60 * 60 * 1000)); // 1 week ago
//         case "1M":
//           return new Date(currentDateTime.getTime() - (30 * 24 * 60 * 60 * 1000)); // 1 month ago
//         case "6M":
//           return new Date(currentDateTime.getTime() - (6 * 30 * 24 * 60 * 60 * 1000)); // 6 months ago
//         default:
//           return new Date(currentDateTime.getTime() - (24 * 60 * 60 * 1000)); // Default to 1 day ago
//       }
//     };

//     const changedTime = setChangedTime(time); // Calculate the start time
//     const limitPerModel = 1;
//     const projection = '-_id -id -TIME -createdAt -updatedAt -__v -busbar';

//     const asideData = {};
//     const bsideData = {};
//     const modelData = [];

//     // Fetch latest document from each model within the specified time range
//     for (let i = 0; i < collectionModels.length; i++) {
//       try {
//         const documents = await collectionModels[i]
//           .find({ updatedAt: { $gte: changedTime } }) // Filter by `updatedAt` >= `changedTime`
//           .sort({ updatedAt: -1 }) // Sort by most recent
//           .limit(limitPerModel) // Limit to one document per model
//           .lean()
//           .select(projection);

//         if (documents.length > 0) {
//           const document = documents[0]; // Get the first (latest) document
//           if (i < 6) {
//             Object.assign(asideData, document); // Models 1 to 5 → Aside
//           } else {
//             Object.assign(bsideData, document); // Models 6 to 10 → Bside
//           }

//           modelData.push(document); // Collect all data in Model
//         }
//       } catch (error) {
//         console.error(`Error fetching data from model ${i + 1}:`, error.message);
//         return res.status(500).json({ error: `Error fetching sensor data from model ${i + 1}`, details: error.message });
//       }
//     }

//     // Function to fetch aggregated data for charts
//     const combinedDataChart = async (startDateTime) => {
//       const allData = {
//         data: {},
//         timestamps: []
//       };

//       for (let i = 0; i < collectionModels.length; i++) {
//         const currentModel = collectionModels[i];
//         const query = {
//           createdAt: { $gte: startDateTime },
//           id: userId,
//         };

//         try {
//           const data = await currentModel.aggregate([
//             { $match: query },
//             { $sort: { createdAt: -1 } },
//             {
//               $project: {
//                 _id: 0,
//                 createdAt: 1,
//                 day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//                 ...Object.keys(currentModel.schema.paths).reduce((acc, key) => {
//                   if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v' && key !== 'busbar' && key !== 'id' && key !== 'TIME' && key !== '_id' && key !== 'timestamps') {
//                     acc[key] = 1;
//                   }
//                   return acc;
//                 }, {}),
//               },
//             },
//             {
//               $group: {
//                 _id: "$day",
//                 createdAt: { $first: "$createdAt" },
//                 ...Object.keys(currentModel.schema.paths).reduce((acc, key) => {
//                   if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v' && key !== 'busbar' && key !== 'id' && key !== 'TIME' && key !== '_id' && key !== 'timestamps') {
//                     acc[key] = { $first: `$${key}` };
//                   }
//                   return acc;
//                 }, {}),
//               },
//             },
//             { $sort: { createdAt: -1 } },
//           ]);

//           // Modified date handling
//           data.forEach((doc) => {
//             const dateString = doc._id; // This is the grouped day string
//             if (!allData.timestamps.includes(dateString)) {
//               allData.timestamps.push(dateString);
//             }

//             Object.keys(doc).forEach((key) => {
//               if (key !== 'createdAt' && key !== '_id') {
//                 if (!allData.data[key]) {
//                   allData.data[key] = [];
//                 }
//                 // Store values in the same order as timestamps
//                 const index = allData.timestamps.indexOf(dateString);
//                 allData.data[key][index] = doc[key];
//               }
//             });
//           });

//         } catch (error) {
//           console.error(`Error fetching data from model ${i + 1}:`, error.message);
//         }
//       }

//       // Sort timestamps chronologically
//       allData.timestamps.sort((a, b) => new Date(a) - new Date(b));

//       // Fill in empty slots in the data arrays
//       Object.keys(allData.data).forEach(key => {
//         allData.data[key] = allData.timestamps.map((ts, index) => 
//           allData.data[key][index] || null
//         );
//       });

//       const calculatePositionalAverages = (sensorData) => {
//         const keys = Object.keys(sensorData);
//         const numPositions = keys.length > 0 ? sensorData[keys[0]].length : 0;
//         const averages = [];

//         for (let i = 0; i < numPositions; i++) {
//           let sum = 0;
//           let count = 0;

//           keys.forEach(key => {
//             const value = parseFloat(sensorData[key][i]);
//             if (!isNaN(value)) {
//               sum += value;
//               count++;
//             }
//           });

//           averages.push(count > 0 ? sum / count : null);
//         }

//         return averages;
//       };

//       // Add averaged data to final output
//       allData.averages = calculatePositionalAverages(allData.data);

//       // After calculating positional averages
//       const validAverages = allData.averages.filter(avg => avg !== null && !isNaN(avg));

//       // Calculate min and max averages
//       allData.minAverage = validAverages.length > 0 ? 
//         Math.min(...validAverages) : 
//         null;

//       allData.Average = validAverages.length > 0 ? 
//         validAverages.reduce((sum, val) => sum + val, 0) / validAverages.length :
//         null;

//       allData.maxAverage = validAverages.length > 0 ? 
//         Math.max(...validAverages) : 
//         null;

//       // Calculate mid average
//       const calculateMinMaxForModel = (modelData) => {
//         const result = {};

//         // Iterate through each object in modelData
//         modelData.forEach((obj) => {
//           Object.entries(obj).forEach(([key, value]) => {
//             const numericValue = parseFloat(value); // Convert value to a number
//             if (!isNaN(numericValue)) {
//               // Initialize the key in the result object if not present
//               if (!result[key]) {
//                 result[key] = {
//                   name: key,
//                   values: [],
//                   maxTemp: null,
//                   minTemp: null,
//                 };
//               }

//               // Add the numeric value to the values array
//               result[key].values.push(numericValue);

//               // Update maxTemp and minTemp
//               if (result[key].maxTemp === null || numericValue > result[key].maxTemp) {
//                 result[key].maxTemp = numericValue;
//               }
//               if (result[key].minTemp === null || numericValue < result[key].minTemp) {
//                 result[key].minTemp = numericValue;
//               }
//             }
//           });
//         });

//         // Convert the result object into an array of key-value pairs
//         return Object.values(result);
//       };

//       // Call the function and include the results in the response
//       const modelWithMinMax = calculateMinMaxForModel(modelData);

//       return {
//         status: 'success',
//         timestamps: allData.timestamps,
//         averages: allData.averages,
//         minAverage: allData.minAverage,
//         Average: allData.Average,
//         maxAverage: allData.maxAverage
//       };
//     };

//     // Fetch aggregated data for charts
//     const aggregatedData = await combinedDataChart(changedTime, userId);

//     // Send response
//     res.status(200).json({
//       status: 'success',
//       Model: modelWithMinMax,
//       Aside: asideData,
//       Bside: bsideData,
//       Average: aggregatedData,
//     });
//   } catch (error) {
//     console.error("Unexpected error:", error.message);
//     return res.status(500).json({ error: "Unexpected server error", details: error.message });
//   }
// };



// collectorbar page

// export const getallsensorw = async (req, res) => {
//   try {
//     const userId = req.headers['x-user-id'];
//     const { time } = req.query; // Extract `time` and `userId` from query parameters
//     console.log("userId", userId);
//     // Array of sensor models
//     const collectionModels = [
//       SensorModel1, SensorModel2, SensorModel3, SensorModel4, SensorModel5,
//       SensorModel6, SensorModel7, SensorModel8, SensorModel9, SensorModel10
//     ];

//     // Helper function to calculate the start time based on the `time` parameter
//     const setChangedTime = (time) => {
//       const currentDateTime = new Date();
//       switch (time) {
//         case "1D":
//           return new Date(currentDateTime.getTime() - (24 * 60 * 60 * 1000)); // 1 day ago
//         case "3D":
//           return new Date(currentDateTime.getTime() - (3 * 24 * 60 * 60 * 1000)); // 3 days ago
//         case "1W":
//           return new Date(currentDateTime.getTime() - (7 * 24 * 60 * 60 * 1000)); // 1 week ago
//         case "1M":
//           return new Date(currentDateTime.getTime() - (30 * 24 * 60 * 60 * 1000)); // 1 month ago
//         case "6M":
//           return new Date(currentDateTime.getTime() - (6 * 30 * 24 * 60 * 60 * 1000)); // 6 months ago
//         default:
//           return new Date(currentDateTime.getTime() - (24 * 60 * 60 * 1000)); // Default to 1 day ago
//       }
//     };
//     const modelMap = {
//       model1: SensorModel1,
//       model2: SensorModel2,
//       model3: SensorModel3,
//       model4: SensorModel4,
//       model5: SensorModel5,
//       model6: SensorModel6,
//       model7: SensorModel7,
//       model8: SensorModel8,
//       model9: SensorModel9,
//       model10: SensorModel10,
//     };

//     const models = {
//       model1: [
//         "CBT1A1", "CBT1A2", "CBT2A1", "CBT2A2",
//         "CBT3A1", "CBT3A2", "CBT4A1", "CBT4A2",
//         "CBT5A1", "CBT5A2", "CBT6A1", "CBT6A2",
//         "CBT7A1", "CBT7A2"
//       ],
//       model2: [
//         "CBT8A1", "CBT8A2", "CBT9A1", "CBT9A2",
//         "CBT10A1", "CBT10A2"
//       ],
//       model3: [
//         "CBT11A1", "CBT11A2", "CBT12A1", "CBT12A2",
//         "CBT13A1", "CBT13A2", "CBT14A1", "CBT14A2"
//       ],
//       model4: [
//         "CBT15A1", "CBT15A2", "CBT16A1", "CBT16A2"
//       ],
//       model5: [
//         "CBT17A1", "CBT17A2", "CBT18A1", "CBT18A2",
//         "CBT19A1", "CBT19A2"
//       ],
//       model6: [
//         "CBT20A1", "CBT20A2", "CBT21A1", "CBT21A2",
//         "CBT22A1", "CBT22A2", "CBT23A1", "CBT23A2",
//         "CBT24A1", "CBT24A2", "CBT25A1", "CBT25A2",
//         "CBT26A1", "CBT26A2", "CBT27A1", "CBT27A2"
//       ],
//       model7: [
//         "CBT1B1", "CBT1B2", "CBT2B1", "CBT2B2",
//         "CBT3B1", "CBT3B2", "CBT4B1", "CBT4B2",
//         "CBT5B1", "CBT5B2", "CBT6B1", "CBT6B2",
//         "CBT7B1", "CBT7B2", "CBT8B1", "CBT8B2",
//         "CBT9B1", "CBT9B2", "CBT10B1", "CBT10B2"
//       ],
//       model8: [
//         "CBT11B1", "CBT11B2", "CBT12B1", "CBT12B2",
//         "CBT13B1", "CBT13B2", "CBT14B1", "CBT14B2"
//       ],
//       model9: [
//         "CBT15B1", "CBT15B2", "CBT16B1", "CBT16B2",
//         "CBT17B1", "CBT17B2", "CBT18B1", "CBT18B2"
//       ],
//       model10: [
//         "CBT19B1", "CBT19B2", "CBT20B1", "CBT20B2",
//         "CBT21B1", "CBT21B2", "CBT22B1", "CBT22B2",
//         "CBT23B1", "CBT23B2", "CBT24B1", "CBT24B2",
//         "CBT25B1", "CBT25B2", "CBT26B1", "CBT26B2",
//         "CBT27B1", "CBT27B2"
//       ]
//     };
//     const changedTime = setChangedTime(time); // Calculate the start time
//     const limitPerModel = 2; // Get current and previous value
//     const projection = '-_id -id -TIME -createdAt -updatedAt -__v -busbar';

//     const asideData = {};
//     const bsideData = {};

//     // Fetch latest document from each model within the specified time range
//     for (let i = 0; i < collectionModels.length; i++) {
//       try {
//         const documents = await collectionModels[i]
//           .find({ id: userId })
//           .sort({ updatedAt: -1 }) // Sort by most recent
//           .limit(limitPerModel) // Get 2 documents (current and previous)
//           .lean()
//           .select(projection);

//         if (documents.length > 0) {
//           const current = documents[0]; // Current value
//           const previous = documents[1]; // Previous value
          
//           // Get the relevant CBT value based on model index
//           const cbtName = nameMapping[i];
          
//           // Compare current and previous values
//           const currentValue = current[cbtName];
//           const previousValue = previous ? previous[cbtName] : null;
          
//           // Calculate trend
//           let trend = 'stable';
//           if (previousValue !== null) {
//             if (currentValue > previousValue) {
//               trend = 'up';
//             } else if (currentValue < previousValue) {
//               trend = 'down';
//             }
//           }
          
//           // Format the data with trend
//           const formattedValue = {
//             value: currentValue,
//             trend: trend
//           };
          
//           if (i < 6) {
//             asideData[cbtName] = formattedValue; // Models 1 to 5 → Aside
//           } else {
//             bsideData[cbtName] = formattedValue; // Models 6 to 10 → Bside
//           }
//         }
//       } catch (error) {
//         console.error(`Error fetching data from model ${i + 1}:`, error.message);
//         return res.status(500).json({ error: `Error fetching sensor data from model ${i + 1}`, details: error.message });
//       }
//     }
//     const nameMapping = [
//       "CBT1A1", "CBT1A2", "CBT2A1", "CBT2A2",
//       "CBT3A1", "CBT3A2", "CBT4A1", "CBT4A2",
//       "CBT5A1", "CBT5A2", "CBT6A1", "CBT6A2",
//       "CBT7A1", "CBT7A2", "CBT8A1", "CBT8A2", "CBT9A1", "CBT9A2",
//       "CBT10A1", "CBT10A2", "CBT11A1", "CBT11A2", "CBT12A1", "CBT12A2",
//       "CBT13A1", "CBT13A2", "CBT14A1", "CBT14A2",

//       "CBT15A1", "CBT15A2", "CBT16A1", "CBT16A2",
//       "CBT17A1", "CBT17A2", "CBT18A1", "CBT18A2",
//       "CBT19A1", "CBT19A2",
//       "CBT20A1", "CBT20A2", "CBT21A1", "CBT21A2",
//       "CBT22A1", "CBT22A2", "CBT23A1", "CBT23A2",
//       "CBT24A1", "CBT24A2", "CBT25A1", "CBT25A2",
//       "CBT26A1", "CBT26A2", "CBT27A1", "CBT27A2",

//       "CBT1B1", "CBT1B2", "CBT2B1", "CBT2B2",
//       "CBT3B1", "CBT3B2", "CBT4B1", "CBT4B2",
//       "CBT5B1", "CBT5B2", "CBT6B1", "CBT6B2",
//       "CBT7B1", "CBT7B2", "CBT8B1", "CBT8B2",
//       "CBT9B1", "CBT9B2", "CBT10B1", "CBT10B2",
//       "CBT11B1", "CBT11B2", "CBT12B1", "CBT12B2",
//       "CBT13B1", "CBT13B2", "CBT14B1", "CBT14B2",
//       "CBT15B1", "CBT15B2", "CBT16B1", "CBT16B2",
//       "CBT17B1", "CBT17B2", "CBT18B1", "CBT18B2",
//       "CBT19B1", "CBT19B2", "CBT20B1", "CBT20B2",
//       "CBT21B1", "CBT21B2", "CBT22B1", "CBT22B2",
//       "CBT23B1", "CBT23B2", "CBT24B1", "CBT24B2",
//       "CBT25B1", "CBT25B2", "CBT26B1", "CBT26B2",
//       "CBT27B1", "CBT27B2"];

//     // Fetch sensor data using the new getSensorData function
//     const getSensorData = async (changedTime) => {
//       try {
//         const maxMinValues = [];
//         const parameterModelMap = Object.entries(models).reduce((acc, [modelKey, params]) => {
//           params.forEach(param => acc[param] = modelMap[modelKey]);
//           return acc;
//         }, {});

//         await Promise.all(nameMapping.map(async (parameter) => {
//           const model = parameterModelMap[parameter];
//           if (!model) {
//             maxMinValues.push({ name: parameter, value: null, maxTemp: null, minTemp: null });
//             return;
//           }

//           try {
//             const data = await model.aggregate([
//               {
//                 $facet: {
//                   inTimeRange: [
//                     {
//                       $match: {
//                         id: userId,
//                         createdAt: { $gte: changedTime },
//                         [parameter]: { $exists: true, $ne: null, $type: ["number", "string"] }
//                       }
//                     },
//                     {
//                       $limit: 1
//                     },
//                     {
//                       $addFields: {
//                         numericValue: {
//                           $convert: {
//                             input: `$${parameter}`,
//                             to: "double",
//                             onError: null,
//                             onNull: null
//                           }
//                         }
//                       }
//                     },
//                     {
//                       $group: {
//                         _id: null,
//                         max: { $max: "$numericValue" },
//                         min: { $min: "$numericValue" }
//                       }
//                     }
//                   ],
//                   latest: [
//                     {
//                       $match: {
//                         id: userId,
//                         [parameter]: { $exists: true, $ne: null }
//                       }
//                     },
//                     { $sort: { TIME: -1 } },
//                     { $limit: 1 },
//                     {
//                       $project: {
//                         value: {
//                           $convert: {
//                             input: `$${parameter}`,
//                             to: "double",
//                             onError: null,
//                             onNull: null
//                           }
//                         }
//                       }
//                     }
//                   ]
//                 }
//               }
//             ]);

//             const result = data[0];
//             let entry = { name: parameter, value: null, maxTemp: null, minTemp: null };

//             // Set latest value first
//             if (result.latest.length > 0 && result.latest[0].value !== null) {
//               entry.value = result.latest[0].value;
//             }

//             // Set max/min temperatures
//             if (result.inTimeRange.length > 0 && result.inTimeRange[0].max !== null) {
//               entry.maxTemp = result.inTimeRange[0].max;
//               entry.minTemp = result.inTimeRange[0].min;
//             }

//             maxMinValues.push(entry);
//           } catch (error) {
//             console.error(`Error processing ${parameter}:`, error);
//             maxMinValues.push({ name: parameter, value: null, maxTemp: null, minTemp: null });
//           }
//         }));

//         return maxMinValues;
//       } catch (error) {
//         console.error("Error in getSensorData:", error);
//         return [];
//       }
//     };

//     // Fetch aggregated sensor data
//     const sensorData = await getSensorData(changedTime);

//     // Function to fetch aggregated data for charts
//     const combinedDataChart = async (startDateTime) => {
//       const allData = {
//         data: {},
//         timestamps: []
//       };

//       for (let i = 0; i < collectionModels.length; i++) {
//         const currentModel = collectionModels[i];
//         const query = {
//           createdAt: { $gte: startDateTime },
//           id: userId,
//         };

//         try {
//           const data = await currentModel.aggregate([
//             { $match: query },
//             { $sort: { createdAt: -1 } },
//             {
//               $project: {
//                 _id: 0,
//                 createdAt: 1,
//                 day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//                 ...Object.keys(currentModel.schema.paths).reduce((acc, key) => {
//                   if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v' && key !== 'busbar' && key !== 'id' && key !== 'TIME' && key !== '_id' && key !== 'timestamps') {
//                     acc[key] = 1;
//                   }
//                   return acc;
//                 }, {}),
//               },
//             },
//             {
//               $group: {
//                 _id: "$day",
//                 createdAt: { $first: "$createdAt" },
//                 ...Object.keys(currentModel.schema.paths).reduce((acc, key) => {
//                   if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v' && key !== 'busbar' && key !== 'id' && key !== 'TIME' && key !== '_id' && key !== 'timestamps') {
//                     acc[key] = { $first: `$${key}` };
//                   }
//                   return acc;
//                 }, {}),
//               },
//             },
//             { $sort: { createdAt: -1 } },
//           ]);

//           // Modified date handling
//           data.forEach((doc) => {
//             const dateString = doc._id; // This is the grouped day string
//             if (!allData.timestamps.includes(dateString)) {
//               allData.timestamps.push(dateString);
//             }

//             Object.keys(doc).forEach((key) => {
//               if (key !== 'createdAt' && key !== '_id') {
//                 if (!allData.data[key]) {
//                   allData.data[key] = [];
//                 }
//                 // Store values in the same order as timestamps
//                 const index = allData.timestamps.indexOf(dateString);
//                 allData.data[key][index] = doc[key];
//               }
//             });
//           });

//         } catch (error) {
//           console.error(`Error fetching data from model ${i + 1}:`, error.message);
//         }
//       }

//       // Sort timestamps chronologically
//       allData.timestamps.sort((a, b) => new Date(a) - new Date(b));

//       // Fill in empty slots in the data arrays
//       Object.keys(allData.data).forEach(key => {
//         allData.data[key] = allData.timestamps.map((ts, index) =>
//           allData.data[key][index] || null
//         );
//       });

//       const calculatePositionalAverages = (sensorData) => {
//         const keys = Object.keys(sensorData);
//         const numPositions = keys.length > 0 ? sensorData[keys[0]].length : 0;
//         const averages = [];

//         for (let i = 0; i < numPositions; i++) {
//           let sum = 0;
//           let count = 0;

//           keys.forEach(key => {
//             const value = parseFloat(sensorData[key][i]);
//             if (!isNaN(value)) {
//               sum += value;
//               count++;
//             }
//           });

//           averages.push(count > 0 ? sum / count : null);
//         }

//         return averages;
//       };

//       // Add averaged data to final output
//       allData.averages = calculatePositionalAverages(allData.data);

//       // After calculating positional averages
//       const validAverages = allData.averages.filter(avg => avg !== null && !isNaN(avg));

//       // Calculate min and max averages
//       allData.minAverage = validAverages.length > 0 ?
//         Math.min(...validAverages) :
//         null;

//       allData.Average = validAverages.length > 0 ?
//         validAverages.reduce((sum, val) => sum + val, 0) / validAverages.length :
//         null;

//       allData.maxAverage = validAverages.length > 0 ?
//         Math.max(...validAverages) :
//         null;

//       return {
//         status: 'success',
//         timestamps: allData.timestamps,
//         averages: allData.averages,
//         minAverage: allData.minAverage,
//         Average: allData.Average,
//         maxAverage: allData.maxAverage
//       };
//     };

//     // Fetch aggregated data for charts
//     const aggregatedData = await combinedDataChart(changedTime);

//     // Send response
//     res.status(200).json({
//       status: 'success',
//       Model: sensorData, // Include the computed min/max data
//       Aside: asideData, // Include Aside data
//       Bside: bsideData, // Include Bside data
//       Average: aggregatedData,
//     });
//   } catch (error) {
//     console.error("Unexpected error:", error.message);
//     return res.status(500).json({ error: "Unexpected server error", details: error.message });
//   }
// };

export const getallsensor = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { time } = req.query; // Extract `time` and `userId` from query parameters
    console.log("userId", userId);
    // Array of sensor models
    const collectionModels = [
      SensorModel1, SensorModel2, SensorModel3, SensorModel4, SensorModel5,
      SensorModel6, SensorModel7, SensorModel8, SensorModel9, SensorModel10
    ];

    // Helper function to calculate the start time based on the `time` parameter
    const setChangedTime = (time) => {
      const currentDateTime = new Date();
      switch (time) {
        case "1D":
          return new Date(currentDateTime.getTime() - (24 * 60 * 60 * 1000)); // 1 day ago
        case "3D":
          return new Date(currentDateTime.getTime() - (3 * 24 * 60 * 60 * 1000)); // 3 days ago
        case "1W":
          return new Date(currentDateTime.getTime() - (7 * 24 * 60 * 60 * 1000)); // 1 week ago
        case "1M":
          return new Date(currentDateTime.getTime() - (30 * 24 * 60 * 60 * 1000)); // 1 month ago
        case "6M":
          return new Date(currentDateTime.getTime() - (6 * 30 * 24 * 60 * 60 * 1000)); // 6 months ago
        default:
          return new Date(currentDateTime.getTime() - (24 * 60 * 60 * 1000)); // Default to 1 day ago
      }
    };
    const modelMap = {
      model1: SensorModel1,
      model2: SensorModel2,
      model3: SensorModel3,
      model4: SensorModel4,
      model5: SensorModel5,
      model6: SensorModel6,
      model7: SensorModel7,
      model8: SensorModel8,
      model9: SensorModel9,
      model10: SensorModel10,
    };

    const models = {
      model1: [
        "CBT1A1", "CBT1A2", "CBT2A1", "CBT2A2",
        "CBT3A1", "CBT3A2", "CBT4A1", "CBT4A2",
        "CBT5A1", "CBT5A2", "CBT6A1", "CBT6A2",
        "CBT7A1", "CBT7A2"
      ],
      model2: [
        "CBT8A1", "CBT8A2", "CBT9A1", "CBT9A2",
        "CBT10A1", "CBT10A2"
      ],
      model3: [
        "CBT11A1", "CBT11A2", "CBT12A1", "CBT12A2",
        "CBT13A1", "CBT13A2", "CBT14A1", "CBT14A2"
      ],
      model4: [
        "CBT15A1", "CBT15A2", "CBT16A1", "CBT16A2"
      ],
      model5: [
        "CBT17A1", "CBT17A2", "CBT18A1", "CBT18A2",
        "CBT19A1", "CBT19A2"
      ],
      model6: [
        "CBT20A1", "CBT20A2", "CBT21A1", "CBT21A2",
        "CBT22A1", "CBT22A2", "CBT23A1", "CBT23A2",
        "CBT24A1", "CBT24A2", "CBT25A1", "CBT25A2",
        "CBT26A1", "CBT26A2", "CBT27A1", "CBT27A2"
      ],
      model7: [
        "CBT1B1", "CBT1B2", "CBT2B1", "CBT2B2",
        "CBT3B1", "CBT3B2", "CBT4B1", "CBT4B2",
        "CBT5B1", "CBT5B2", "CBT6B1", "CBT6B2",
        "CBT7B1", "CBT7B2", "CBT8B1", "CBT8B2",
        "CBT9B1", "CBT9B2", "CBT10B1", "CBT10B2"
      ],
      model8: [
        "CBT11B1", "CBT11B2", "CBT12B1", "CBT12B2",
        "CBT13B1", "CBT13B2", "CBT14B1", "CBT14B2"
      ],
      model9: [
        "CBT15B1", "CBT15B2", "CBT16B1", "CBT16B2",
        "CBT17B1", "CBT17B2", "CBT18B1", "CBT18B2"
      ],
      model10: [
        "CBT19B1", "CBT19B2", "CBT20B1", "CBT20B2",
        "CBT21B1", "CBT21B2", "CBT22B1", "CBT22B2",
        "CBT23B1", "CBT23B2", "CBT24B1", "CBT24B2",
        "CBT25B1", "CBT25B2", "CBT26B1", "CBT26B2",
        "CBT27B1", "CBT27B2"
      ]
    };
    const changedTime = setChangedTime(time); // Calculate the start time
    const limitPerModel = 1;
    const projection = '-_id -id -TIME -createdAt -updatedAt -__v -busbar';

    const asideData = {};
    const bsideData = {};

    // Fetch latest and previous document from each model within the specified time range
    for (let i = 0; i < collectionModels.length; i++) {
      try {
        // Fetch latest document
        const latestDocuments = await collectionModels[i]
          .find({ id: userId })
          .sort({ updatedAt: -1 })
          .limit(2) // Get 2 documents to compare current and previous
          .lean()
          .select(projection);

        if (latestDocuments.length > 0) {
          const currentDoc = latestDocuments[0]; // Current document
          const previousDoc = latestDocuments[1] || {}; // Previous document, or empty if no previous

          // Function to compare values and determine trend
          const getTrend = (current, previous) => {
            const currentValue = parseFloat(current) || 0;
            const previousValue = parseFloat(previous) || 0;
            
            if (currentValue > previousValue) return 'up';
            if (currentValue < previousValue) return 'down';
            return 'stable';
          };

          // Process Aside data (models 1-5)
          if (i < 6) {
            Object.entries(currentDoc).forEach(([key, value]) => {
              if (key.startsWith('CBT')) {
                asideData[key] = {
                  value: value,
                  trend: getTrend(value, previousDoc[key])
                };
              }
            });
          }
          // Process Bside data (models 6-10)
          else {
            Object.entries(currentDoc).forEach(([key, value]) => {
              if (key.startsWith('CBT')) {
                bsideData[key] = {
                  value: value,
                  trend: getTrend(value, previousDoc[key])
                };
              }
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching data from model ${i + 1}:`, error.message);
        return res.status(500).json({ error: `Error fetching sensor data from model ${i + 1}`, details: error.message });
      }
    }
    const nameMapping = [
      "CBT1A1", "CBT1A2", "CBT2A1", "CBT2A2",
      "CBT3A1", "CBT3A2", "CBT4A1", "CBT4A2",
      "CBT5A1", "CBT5A2", "CBT6A1", "CBT6A2",
      "CBT7A1", "CBT7A2", "CBT8A1", "CBT8A2", "CBT9A1", "CBT9A2",
      "CBT10A1", "CBT10A2", "CBT11A1", "CBT11A2", "CBT12A1", "CBT12A2",
      "CBT13A1", "CBT13A2", "CBT14A1", "CBT14A2",

      "CBT15A1", "CBT15A2", "CBT16A1", "CBT16A2",
      "CBT17A1", "CBT17A2", "CBT18A1", "CBT18A2",
      "CBT19A1", "CBT19A2",
      "CBT20A1", "CBT20A2", "CBT21A1", "CBT21A2",
      "CBT22A1", "CBT22A2", "CBT23A1", "CBT23A2",
      "CBT24A1", "CBT24A2", "CBT25A1", "CBT25A2",
      "CBT26A1", "CBT26A2", "CBT27A1", "CBT27A2",

      "CBT1B1", "CBT1B2", "CBT2B1", "CBT2B2",
      "CBT3B1", "CBT3B2", "CBT4B1", "CBT4B2",
      "CBT5B1", "CBT5B2", "CBT6B1", "CBT6B2",
      "CBT7B1", "CBT7B2", "CBT8B1", "CBT8B2",
      "CBT9B1", "CBT9B2", "CBT10B1", "CBT10B2",
      "CBT11B1", "CBT11B2", "CBT12B1", "CBT12B2",
      "CBT13B1", "CBT13B2", "CBT14B1", "CBT14B2",
      "CBT15B1", "CBT15B2", "CBT16B1", "CBT16B2",
      "CBT17B1", "CBT17B2", "CBT18B1", "CBT18B2",
      "CBT19B1", "CBT19B2", "CBT20B1", "CBT20B2",
      "CBT21B1", "CBT21B2", "CBT22B1", "CBT22B2",
      "CBT23B1", "CBT23B2", "CBT24B1", "CBT24B2",
      "CBT25B1", "CBT25B2", "CBT26B1", "CBT26B2",
      "CBT27B1", "CBT27B2"];

    // Fetch sensor data using the new getSensorData function
    const getSensorData = async (changedTime) => {
      try {
        const maxMinValues = [];
        const parameterModelMap = Object.entries(models).reduce((acc, [modelKey, params]) => {
          params.forEach(param => acc[param] = modelMap[modelKey]);
          return acc;
        }, {});

        await Promise.all(nameMapping.map(async (parameter) => {
          const model = parameterModelMap[parameter];
          if (!model) {
            maxMinValues.push({ name: parameter, value: null, maxTemp: null, minTemp: null });
            return;
          }

          try {
            const data = await model.aggregate([
              {
                $facet: {
                  inTimeRange: [
                    {
                      $match: {
                        id: userId,
                        createdAt: { $gte: changedTime },
                        [parameter]: { $exists: true, $ne: null, $type: ["number", "string"] }
                      }
                    },
                    {
                      $limit: 1
                    },
                    {
                      $addFields: {
                        numericValue: {
                          $convert: {
                            input: `$${parameter}`,
                            to: "double",
                            onError: null,
                            onNull: null
                          }
                        }
                      }
                    },
                    {
                      $group: {
                        _id: null,
                        max: { $max: "$numericValue" },
                        min: { $min: "$numericValue" }
                      }
                    }
                  ],
                  latest: [
                    {
                      $match: {
                        id: userId,
                        [parameter]: { $exists: true, $ne: null }
                      }
                    },
                    { $sort: { TIME: -1 } },
                    { $limit: 1 },
                    {
                      $project: {
                        value: {
                          $convert: {
                            input: `$${parameter}`,
                            to: "double",
                            onError: null,
                            onNull: null
                          }
                        }
                      }
                    }
                  ]
                }
              }
            ]);

            const result = data[0];
            let entry = { name: parameter, value: null, maxTemp: null, minTemp: null };

            // Set latest value first
            if (result.latest.length > 0 && result.latest[0].value !== null) {
              entry.value = result.latest[0].value;
            }

            // Set max/min temperatures
            if (result.inTimeRange.length > 0 && result.inTimeRange[0].max !== null) {
              entry.maxTemp = result.inTimeRange[0].max;
              entry.minTemp = result.inTimeRange[0].min;
            }

            maxMinValues.push(entry);
          } catch (error) {
            console.error(`Error processing ${parameter}:`, error);
            maxMinValues.push({ name: parameter, value: null, maxTemp: null, minTemp: null });
          }
        }));

        return maxMinValues;
      } catch (error) {
        console.error("Error in getSensorData:", error);
        return [];
      }
    };

    // Fetch aggregated sensor data
    const sensorData = await getSensorData(changedTime);

    // Function to fetch aggregated data for charts
    const combinedDataChart = async (startDateTime) => {
      const allData = {
        data: {},
        timestamps: []
      };

      for (let i = 0; i < collectionModels.length; i++) {
        const currentModel = collectionModels[i];
        const query = {
          createdAt: { $gte: startDateTime },
          id: userId,
        };

        try {
          const data = await currentModel.aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } },
            {
              $project: {
                _id: 0,
                createdAt: 1,
                day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                ...Object.keys(currentModel.schema.paths).reduce((acc, key) => {
                  if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v' && key !== 'busbar' && key !== 'id' && key !== 'TIME' && key !== '_id' && key !== 'timestamps') {
                    acc[key] = 1;
                  }
                  return acc;
                }, {}),
              },
            },
            {
              $group: {
                _id: "$day",
                createdAt: { $first: "$createdAt" },
                ...Object.keys(currentModel.schema.paths).reduce((acc, key) => {
                  if (key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v' && key !== 'busbar' && key !== 'id' && key !== 'TIME' && key !== '_id' && key !== 'timestamps') {
                    acc[key] = { $first: `$${key}` };
                  }
                  return acc;
                }, {}),
              },
            },
            { $sort: { createdAt: -1 } },
          ]);

          // Modified date handling
          data.forEach((doc) => {
            const dateString = doc._id; // This is the grouped day string
            if (!allData.timestamps.includes(dateString)) {
              allData.timestamps.push(dateString);
            }

            Object.keys(doc).forEach((key) => {
              if (key !== 'createdAt' && key !== '_id') {
                if (!allData.data[key]) {
                  allData.data[key] = [];
                }
                // Store values in the same order as timestamps
                const index = allData.timestamps.indexOf(dateString);
                allData.data[key][index] = doc[key];
              }
            });
          });

        } catch (error) {
          console.error(`Error fetching data from model ${i + 1}:`, error.message);
        }
      }

      // Sort timestamps chronologically
      allData.timestamps.sort((a, b) => new Date(a) - new Date(b));

      // Fill in empty slots in the data arrays
      Object.keys(allData.data).forEach(key => {
        allData.data[key] = allData.timestamps.map((ts, index) =>
          allData.data[key][index] || null
        );
      });

      const calculatePositionalAverages = (sensorData) => {
        const keys = Object.keys(sensorData);
        const numPositions = keys.length > 0 ? sensorData[keys[0]].length : 0;
        const averages = [];

        for (let i = 0; i < numPositions; i++) {
          let sum = 0;
          let count = 0;

          keys.forEach(key => {
            const value = parseFloat(sensorData[key][i]);
            if (!isNaN(value)) {
              sum += value;
              count++;
            }
          });

          averages.push(count > 0 ? sum / count : null);
        }

        return averages;
      };

      // Add averaged data to final output
      allData.averages = calculatePositionalAverages(allData.data);

      // After calculating positional averages
      const validAverages = allData.averages.filter(avg => avg !== null && !isNaN(avg));

      // Calculate min and max averages
      allData.minAverage = validAverages.length > 0 ?
        Math.min(...validAverages) :
        null;

      allData.Average = validAverages.length > 0 ?
        validAverages.reduce((sum, val) => sum + val, 0) / validAverages.length :
        null;

      allData.maxAverage = validAverages.length > 0 ?
        Math.max(...validAverages) :
        null;

      return {
        status: 'success',
        timestamps: allData.timestamps,
        averages: allData.averages,
        minAverage: allData.minAverage,
        Average: allData.Average,
        maxAverage: allData.maxAverage
      };
    };

    // Fetch aggregated data for charts
    const aggregatedData = await combinedDataChart(changedTime);

    // Send response
    res.status(200).json({
      status: 'success',
      Model: sensorData, // Include the computed min/max data
      Aside: asideData, // Include Aside data
      Bside: bsideData, // Include Bside data
      Average: aggregatedData,
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({ error: "Unexpected server error", details: error.message });
  }
};

export const collectorbar = async (req, res) => {
  const modelMap = {
    model1: SensorModel1,
    model2: SensorModel2,
    model3: SensorModel3,
    model4: SensorModel4,
    model5: SensorModel5,
    model6: SensorModel6,
    model7: SensorModel7,
    model8: SensorModel8,
    model9: SensorModel9,
    model10: SensorModel10,
  };

  const models = {
    model1: [
      "CBT1A1", "CBT1A2", "CBT2A1", "CBT2A2",
      "CBT3A1", "CBT3A2", "CBT4A1", "CBT4A2",
      "CBT5A1", "CBT5A2", "CBT6A1", "CBT6A2",
      "CBT7A1", "CBT7A2"
    ],
    model2: [
      "CBT8A1", "CBT8A2", "CBT9A1", "CBT9A2",
      "CBT10A1", "CBT10A2"
    ],
    model3: [
      "CBT11A1", "CBT11A2", "CBT12A1", "CBT12A2",
      "CBT13A1", "CBT13A2", "CBT14A1", "CBT14A2"
    ],
    model4: [
      "CBT15A1", "CBT15A2", "CBT16A1", "CBT16A2"
    ],
    model5: [
      "CBT17A1", "CBT17A2", "CBT18A1", "CBT18A2",
      "CBT19A1", "CBT19A2"
    ],
    model6: [
      "CBT20A1", "CBT20A2", "CBT21A1", "CBT21A2",
      "CBT22A1", "CBT22A2", "CBT23A1", "CBT23A2",
      "CBT24A1", "CBT24A2", "CBT25A1", "CBT25A2",
      "CBT26A1", "CBT26A2", "CBT27A1", "CBT27A2"
    ],
    model7: [
      "CBT1B1", "CBT1B2", "CBT2B1", "CBT2B2",
      "CBT3B1", "CBT3B2", "CBT4B1", "CBT4B2",
      "CBT5B1", "CBT5B2", "CBT6B1", "CBT6B2",
      "CBT7B1", "CBT7B2", "CBT8B1", "CBT8B2",
      "CBT9B1", "CBT9B2", "CBT10B1", "CBT10B2"
    ],
    model8: [
      "CBT11B1", "CBT11B2", "CBT12B1", "CBT12B2",
      "CBT13B1", "CBT13B2", "CBT14B1", "CBT14B2"
    ],
    model9: [
      "CBT15B1", "CBT15B2", "CBT16B1", "CBT16B2",
      "CBT17B1", "CBT17B2", "CBT18B1", "CBT18B2"
    ],
    model10: [
      "CBT19B1", "CBT19B2", "CBT20B1", "CBT20B2",
      "CBT21B1", "CBT21B2", "CBT22B1", "CBT22B2",
      "CBT23B1", "CBT23B2", "CBT24B1", "CBT24B2",
      "CBT25B1", "CBT25B2", "CBT26B1", "CBT26B2",
      "CBT27B1", "CBT27B2"
    ]
  };

  const parseTimeToDate = (time) => {
    const now = Date.now(); // Get current timestamp in milliseconds
    const num = parseInt(time.match(/\d+/)?.[0] || 0, 10); // Extract numeric value
    const unit = time.match(/[a-zA-Z]+/)?.[0] || ''; // Extract time unit

    let seconds = 0;

    switch (unit.toLowerCase()) {
      case 'min': seconds = num * 60; break; // Minutes
      case 'h': seconds = num * 60 * 60; break; // Hours
      case 'd': seconds = num * 24 * 60 * 60; break; // Days
      case 'w': seconds = num * 7 * 24 * 60 * 60; break; // Weeks
      case 'm': seconds = num * 30 * 24 * 60 * 60; break; // Months (approximate)
      default:
        console.warn("Invalid time format:", time);
        return new Date(now); // Return current time if invalid
    }

    return new Date(now - seconds * 1000); // Convert to milliseconds
  };

  const getModelKeyFromSensorId = (sensorId) => {
    for (const [key, sensors] of Object.entries(models)) {
      if (sensors.includes(sensorId)) {
        return key; // Return the model key if the sensor ID is found
      }
    }
    return null; // Return null if no model is found
  };

  try {
    const { sensorId, time } = req.query;
    const userId = req.headers['x-user-id'];

    if (!sensorId || !time || !userId) {
      return res.status(400).json({ message: "Invalid parameters: sensor ID, time, and user ID are required" });
    }

    const modelKey = getModelKeyFromSensorId(sensorId);
    if (!modelKey) {
      return res.status(404).json({ message: `No model found for sensor ID: ${sensorId}` });
    }

    const model = modelMap[modelKey];
    if (!model) {
      return res.status(404).json({ message: `Model ${modelKey} not found` });
    }
    const date = parseTimeToDate(time);
    const query = { createdAt: { $gte: date }, id: userId };
    const projection = { _id: 0, createdAt: 1, [sensorId]: 1 };

    const data = await modelMap[modelKey].aggregate([{ $match: query }, { $project: projection }]);
    const sensorValues = data.map(entry => parseFloat(entry[sensorId])).filter(value => value !== undefined);
    const createdAtDates = data.map(entry => entry.createdAt);

    if (sensorValues.length === 0) {
      return res.status(404).json({ message: `No data found for sensor ID: ${sensorId}, user ID: ${userId}, and time range: ${time}` });
    }

    const minValue = Math.min(...sensorValues);
    const maxValue = Math.max(...sensorValues);
    const averageValue = sensorValues.reduce((sum, value) => sum + value, 0) / sensorValues.length;

    res.status(200).json({
      [sensorId]: sensorValues,
      createdAt: createdAtDates,
      minValue,
      maxValue,
      averageValue
    });
  } catch (error) {
    console.error("Error fetching collector bar data:", error);
    res.status(500).json({ message: "Failed to retrieve data" });
  }
};

export const getLatestTimestamp = async (req, res) => {
    const models = [
        SensorModel1, SensorModel2, SensorModel3, SensorModel4, SensorModel5,
        SensorModel6, SensorModel7, SensorModel8, SensorModel9, SensorModel10
    ];

    // Helper function to format the date from IST timestamp
    const formatDateFromIST = (timestamp) => {
        try {
            // Parse the timestamp directly (since it's already in IST)
            const date = new Date(timestamp);
            
            const hours = date.getUTCHours();
            const minutes = date.getUTCMinutes();
            const day = date.getUTCDate();
            const month = date.getUTCMonth() + 1;
            const year = date.getUTCFullYear();

            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            const formattedMinutes = String(minutes).padStart(2, '0');

            return `${formattedHours}:${formattedMinutes} ${ampm} ${String(day).padStart(2, '0')}.${String(month).padStart(2, '0')}.${year}`;
        } catch (error) {
            console.error("Error formatting date:", error);
            return null;
        }
    };

    try {
        // Fetch the latest document from each model in parallel using TIME field
        const latestDocuments = await Promise.all(
            models.map(model =>
                model.findOne()
                    .sort({ TIME: -1 })
                    .select({ TIME: 1 })
                    .lean()
            )
        );

        // Extract TIME values and find the latest one
        const timestamps = latestDocuments
            .filter(doc => doc && doc.TIME)
            .map(doc => doc.TIME);

        if (timestamps.length === 0) {
            return res.status(404).json({ error: "No timestamps found" });
        }

        // Find the latest timestamp
        const latestTimestamp = timestamps.reduce((latest, current) => {
            return new Date(current) > new Date(latest) ? current : latest;
        });

        // Format the timestamp (no conversion needed since it's already IST)
        const formattedIST = formatDateFromIST(latestTimestamp);

        if (!formattedIST) {
            return res.status(500).json({ error: "Error formatting timestamp" });
        }

        res.status(200).json({ 
            latestTimestamp: formattedIST,
            rawTimestamp: latestTimestamp
        });
    } catch (error) {
        console.error("Error fetching latest timestamp:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


//heatmap page
export const getHeatmap = async (req, res) => {
  try {
    const { startDate, endDate, side, value = 'max' } = req.query;
    const userId = req.headers['x-user-id'];

    // Validate parameters
    if (!['ASide', 'BSide'].includes(side) || !['max', 'min'].includes(value)) {
      return res.status(400).json({ error: "Invalid parameters" });
    }
    if (!startDate || !endDate || !userId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Date validation
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Model configuration
    const modelConfig = {
      ASide: {
        models: [SensorModel1, SensorModel2, SensorModel3, SensorModel4, SensorModel5, SensorModel6],
        sensorKeys: [
          ["CBT1A1", "CBT1A2", "CBT2A1", "CBT2A2",
            "CBT3A1", "CBT3A2", "CBT4A1", "CBT4A2",
            "CBT5A1", "CBT5A2", "CBT6A1", "CBT6A2",
            "CBT7A1", "CBT7A2"],
          ["CBT8A1", "CBT8A2", "CBT9A1", "CBT9A2",
            "CBT10A1", "CBT10A2"], [
            "CBT11A1", "CBT11A2", "CBT12A1", "CBT12A2",
            "CBT13A1", "CBT13A2", "CBT14A1", "CBT14A2"
          ], [
            "CBT15A1", "CBT15A2", "CBT16A1", "CBT16A2"
          ], [
            "CBT17A1", "CBT17A2", "CBT18A1", "CBT18A2",
            "CBT19A1", "CBT19A2"
          ], [
            "CBT20A1", "CBT20A2", "CBT21A1", "CBT21A2",
            "CBT22A1", "CBT22A2", "CBT23A1", "CBT23A2",
            "CBT24A1", "CBT24A2", "CBT25A1", "CBT25A2",
            "CBT26A1", "CBT26A2", "CBT27A1", "CBT27A2"
          ],
        ]
      },
      BSide: {
        models: [SensorModel7, SensorModel8, SensorModel9, SensorModel10],
        sensorKeys: [
          [
            "CBT1B1", "CBT1B2", "CBT2B1", "CBT2B2",
            "CBT3B1", "CBT3B2", "CBT4B1", "CBT4B2",
            "CBT5B1", "CBT5B2", "CBT6B1", "CBT6B2",
            "CBT7B1", "CBT7B2", "CBT8B1", "CBT8B2",
            "CBT9B1", "CBT9B2", "CBT10B1", "CBT10B2"
          ], [
            "CBT11B1", "CBT11B2", "CBT12B1", "CBT12B2",
            "CBT13B1", "CBT13B2", "CBT14B1", "CBT14B2"
          ], [
            "CBT15B1", "CBT15B2", "CBT16B1", "CBT16B2",
            "CBT17B1", "CBT17B2", "CBT18B1", "CBT18B2"
          ], [
            "CBT19B1", "CBT19B2", "CBT20B1", "CBT20B2",
            "CBT21B1", "CBT21B2", "CBT22B1", "CBT22B2",
            "CBT23B1", "CBT23B2", "CBT24B1", "CBT24B2",
            "CBT25B1", "CBT25B2", "CBT26B1", "CBT26B2",
            "CBT27B1", "CBT27B2"
          ]
        ]
      }
    };

    const { models, sensorKeys } = modelConfig[side];
    const allData = [];
    const sensorStats = {};

    console.log(`Processing ${models.length} model groups for ${side}`);

    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      const keys = sensorKeys[i];

      console.log(`\nProcessing model group ${i + 1}:`);
      console.log('Model:', model.modelName || 'Unnamed Model');
      console.log('Sensor keys:', keys);

      try {
        const aggregationPipeline = [
          {
            $match: {
              createdAt: { $gte: start, $lte: end },
              id: userId
            }
          },
          { $sort: { createdAt: -1 } },
          {
            $project: {
              _id: 0,
              createdAt: 1,
              day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              ...Object.fromEntries(keys.map(k => [k, 1]))
            }
          },
          {
            $group: {
              _id: "$day",
              createdAt: { $first: "$createdAt" },
              ...Object.fromEntries(keys.map(k => [k, { $first: `$${k}` }]))
            }
          },
          { $sort: { createdAt: -1 } }
        ];

        console.log('Aggregation pipeline:', JSON.stringify(aggregationPipeline, null, 2));

        const data = await model.aggregate(aggregationPipeline);
        console.log(`Found ${data.length} documents in model group ${i + 1}`);

        if (data.length > 0) {
          console.log('Sample document:', JSON.stringify(data[0], null, 2));
        }

        // Process documents
        data.forEach(doc => {
          keys.forEach(key => {
            const rawValue = doc[key];
            const numValue = parseFloat(rawValue);

            if (!isNaN(numValue)) {
              allData.push({
                key,
                value: numValue,
                date: doc._id,  // Changed from doc.createdAt to doc._id (which is the grouped day)
                createdAt: doc.createdAt
              });
            } else {
              console.warn(`Invalid value for ${key}:`, rawValue);
            }
          });
        });

        console.log(`Added ${data.length * keys.length} entries from model group ${i + 1}`);

      } catch (error) {
        console.error(`Error in model group ${i + 1}:`, error.message);
        console.error('Error stack:', error.stack);
      }
    }

    console.log(`\nTotal entries collected: ${allData.length}`);
    console.log('Sample entries:', allData.slice(0, 3));

    // Group by sensor key and calculate min/max
    allData.forEach(entry => {
      if (!sensorStats[entry.key]) {
        sensorStats[entry.key] = {
          values: [],
          dates: []
        };
      }
      sensorStats[entry.key].values.push(entry.value);
      sensorStats[entry.key].dates.push(entry.date);  // Changed from entry.createdAt to entry.date
    });

    // Prepare final results
    const results = Object.entries(sensorStats).map(([key, data]) => ({
      key,
      values: data.values,
      dates: data.dates
    }));
    const originalOrderKeys = modelConfig[side].sensorKeys.flat();

    // Create ordered data array based on original sensorKeys configuration
    const orderedData = originalOrderKeys.map(key => ({
      key,
      values: sensorStats[key]?.values || [] // Handle missing data safely
    }));

    // Get all unique dates sorted descending
    const allDates = [...new Set(allData.map(entry => entry.date))].sort((a, b) =>
      new Date(b) - new Date(a)  // Sort dates as Date objects
    );

    // Create min/max values object
    const valueObject = Object.fromEntries(
      Object.entries(sensorStats).map(([key, data]) => [
        key,
        value === 'max'
          ? Math.max(...data.values)
          : Math.min(...data.values)
      ])
    );

    // Sort and get top 8 keys based on requested value
    const sortedKeys = Object.keys(valueObject).sort((a, b) =>
      value === 'max' ? valueObject[b] - valueObject[a] : valueObject[a] - valueObject[b]
    );

    res.status(200).json({
      data: orderedData,  // This maintains your configured order
      dates: allDates,
      [value === 'max' ? 'maxvalue' : 'minvalue']: Object.fromEntries(
        sortedKeys.map(key => [key, valueObject[key]]).slice(0, 8)
      )
    });

  } catch (error) {
    console.error("Final error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message
    });
  }
};

export const cbname = async (req, res) => {
  const collectionModels = [
    SensorModel1, SensorModel2, SensorModel3, SensorModel4, SensorModel5,
    SensorModel6, SensorModel7, SensorModel8, SensorModel9, SensorModel10
  ];

  try {
    // Run all queries in parallel
    const results = await Promise.all(
      collectionModels.map((model) =>
        model
          .find({})
          .sort({ updatedAt: -1 })
          .limit(1)
          .lean()
          .select('-_id -id -TIME -createdAt -updatedAt -__v -busbar')
      )
    );

    // Merge results
    const combinedData = {};
    results.forEach((documents) => {
      if (documents.length > 0) {
        Object.assign(combinedData, documents[0]);
      }
    });

    res.status(200).json(Object.keys(combinedData));
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getNotifications = async (req, res) => {
  try {
    // Fetch the latest alert thresholds
    const alertThresholds = await UserAlertModel.find().sort({ createdAt: -1 }).limit(1);
    const thresholds = alertThresholds.length > 0 ? alertThresholds[0] : {
      info: "370",
      warning: "450",
      critical: "700"
    };

    const models = {
      model1: [
          "CBT1A1", "CBT1A2", "CBT2A1", "CBT2A2",
          "CBT3A1", "CBT3A2", "CBT4A1", "CBT4A2",
          "CBT5A1", "CBT5A2", "CBT6A1", "CBT6A2",
          "CBT7A1", "CBT7A2"
      ],
      model2: [
          "CBT8A1", "CBT8A2", "CBT9A1", "CBT9A2",
          "CBT10A1", "CBT10A2"
      ],
      model3: [
          "CBT11A1", "CBT11A2", "CBT12A1", "CBT12A2",
          "CBT13A1", "CBT13A2", "CBT14A1", "CBT14A2"
      ],
      model4: [
          "CBT15A1", "CBT15A2", "CBT16A1", "CBT16A2"
      ],
      model5: [
          "CBT17A1", "CBT17A2", "CBT18A1", "CBT18A2",
          "CBT19A1", "CBT19A2"
      ],
      model6: [
          "CBT20A1", "CBT20A2", "CBT21A1", "CBT21A2",
          "CBT22A1", "CBT22A2", "CBT23A1", "CBT23A2",
          "CBT24A1", "CBT24A2", "CBT25A1", "CBT25A2",
          "CBT26A1", "CBT26A2", "CBT27A1", "CBT27A2"
      ],
      model7: [
          "CBT1B1", "CBT1B2", "CBT2B1", "CBT2B2",
          "CBT3B1", "CBT3B2", "CBT4B1", "CBT4B2",
          "CBT5B1", "CBT5B2", "CBT6B1", "CBT6B2",
          "CBT7B1", "CBT7B2", "CBT8B1", "CBT8B2",
          "CBT9B1", "CBT9B2", "CBT10B1", "CBT10B2"
      ],
      model8: [
          "CBT11B1", "CBT11B2", "CBT12B1", "CBT12B2",
          "CBT13B1", "CBT13B2", "CBT14B1", "CBT14B2"
      ],
      model9: [
          "CBT15B1", "CBT15B2", "CBT16B1", "CBT16B2",
          "CBT17B1", "CBT17B2", "CBT18B1", "CBT18B2"
      ],
      model10: [
          "CBT19B1", "CBT19B2", "CBT20B1", "CBT20B2",
          "CBT21B1", "CBT21B2", "CBT22B1", "CBT22B2",
          "CBT23B1", "CBT23B2", "CBT24B1", "CBT24B2",
          "CBT25B1", "CBT25B2", "CBT26B1", "CBT26B2",
          "CBT27B1", "CBT27B2"
      ]
  };
  const modelMap = {
      SensorModel1,
      SensorModel2,
      SensorModel3,
      SensorModel4,
      SensorModel5,
      SensorModel6,
      SensorModel7,
      SensorModel8,
      SensorModel9,
      SensorModel10,
  };

  const modelFieldMap = {
      SensorModel1: models.model1,
      SensorModel2: models.model2,
      SensorModel3: models.model3,
      SensorModel4: models.model4,
      SensorModel5: models.model5,
      SensorModel6: models.model6,
      SensorModel7: models.model7,
      SensorModel8: models.model8,
      SensorModel9: models.model9,
      SensorModel10: models.model10
  };

      const results = [];
      const uniqueIds = new Set();
      const alertsToSave = [];

      // Collect all unique IDs
      const idPromises = Object.values(modelMap).map(async (model) => {
          const docs = await model.find().select('id -_id').lean();
          docs.forEach(doc => doc.id && uniqueIds.add(doc.id));
      });

      await Promise.all(idPromises);

      // Process each ID
      const processIdPromises = Array.from(uniqueIds).map(async (id) => {
          const modelPromises = Object.entries(modelMap).map(async ([modelName, model]) => {
              const sensorFields = modelFieldMap[modelName];
              if (!sensorFields?.length) return;

              const doc = await model.findOne({ id })
                  .sort({ createdAt: -1 })
                  .select([...sensorFields, 'createdAt'])
                  .lean();

              if (!doc) return;

              sensorFields.forEach(field => {
                  const value = parseFloat(doc[field]);
                  if (isNaN(value)) return;

                  let severity, message;
                  if (value >= parseFloat(thresholds.critical)) {
                      severity = "critical";
                      message = "Critical: Immediate action required!!!";
                  } else if (value >= parseFloat(thresholds.warning)) {
                      severity = "warning";
                      message = "Attention Required!!!";
                  } else if (value >= parseFloat(thresholds.info)) {
                      severity = "info";
                      message = "Monitoring recommended!!!";
                  } else {
                      return;
                  }

                  const alert = {
                      id,
                      model: modelName,
                      sensor: field,
                      value,
                      severity,
                      message,
                      timestamp: doc.createdAt
                  };

                  results.push(alert);
                  alertsToSave.push(alert);
              });
          });

          await Promise.all(modelPromises);
      });

      await Promise.all(processIdPromises);

      // Save alerts to database
      if (alertsToSave.length > 0) {
          const upsertPromises = alertsToSave.map(alert =>
              AlertModel.updateOne(
                  { id: alert.id, model: alert.model, sensor: alert.sensor, severity: alert.severity, timestamp: alert.timestamp },
                  { $setOnInsert: alert },
                  { upsert: true }
              )
          );
          await Promise.all(upsertPromises);
      }

      // Categorize results by severity
      const categorized = results.reduce((acc, alert) => {
          acc[alert.severity] = acc[alert.severity] || [];
          acc[alert.severity].push(alert);
          return acc;
      }, {});

      res.status(200).json({
          status: "success",
          data: {
              alerts: categorized,
              total: results.length,
              critical: categorized.critical?.length || 0,
              warnings: categorized.warning?.length || 0,
              info: categorized.info?.length || 0
          }
      });

  } catch (error) {
      console.error("Notification error:", error);
      res.status(500).json({
          status: "error",
          message: "Failed to fetch notifications",
          error: error.message
      });
  }
};

// export const getNotifications = async (req, res) => {
//   try {
//     const models = {
//       model1: [
//           "CBT1A1", "CBT1A2", "CBT2A1", "CBT2A2",
//           "CBT3A1", "CBT3A2", "CBT4A1", "CBT4A2",
//           "CBT5A1", "CBT5A2", "CBT6A1", "CBT6A2",
//           "CBT7A1", "CBT7A2"
//       ],
//       model2: [
//           "CBT8A1", "CBT8A2", "CBT9A1", "CBT9A2",
//           "CBT10A1", "CBT10A2"
//       ],
//       model3: [
//           "CBT11A1", "CBT11A2", "CBT12A1", "CBT12A2",
//           "CBT13A1", "CBT13A2", "CBT14A1", "CBT14A2"
//       ],
//       model4: [
//           "CBT15A1", "CBT15A2", "CBT16A1", "CBT16A2"
//       ],
//       model5: [
//           "CBT17A1", "CBT17A2", "CBT18A1", "CBT18A2",
//           "CBT19A1", "CBT19A2"
//       ],
//       model6: [
//           "CBT20A1", "CBT20A2", "CBT21A1", "CBT21A2",
//           "CBT22A1", "CBT22A2", "CBT23A1", "CBT23A2",
//           "CBT24A1", "CBT24A2", "CBT25A1", "CBT25A2",
//           "CBT26A1", "CBT26A2", "CBT27A1", "CBT27A2"
//       ],
//       model7: [
//           "CBT1B1", "CBT1B2", "CBT2B1", "CBT2B2",
//           "CBT3B1", "CBT3B2", "CBT4B1", "CBT4B2",
//           "CBT5B1", "CBT5B2", "CBT6B1", "CBT6B2",
//           "CBT7B1", "CBT7B2", "CBT8B1", "CBT8B2",
//           "CBT9B1", "CBT9B2", "CBT10B1", "CBT10B2"
//       ],
//       model8: [
//           "CBT11B1", "CBT11B2", "CBT12B1", "CBT12B2",
//           "CBT13B1", "CBT13B2", "CBT14B1", "CBT14B2"
//       ],
//       model9: [
//           "CBT15B1", "CBT15B2", "CBT16B1", "CBT16B2",
//           "CBT17B1", "CBT17B2", "CBT18B1", "CBT18B2"
//       ],
//       model10: [
//           "CBT19B1", "CBT19B2", "CBT20B1", "CBT20B2",
//           "CBT21B1", "CBT21B2", "CBT22B1", "CBT22B2",
//           "CBT23B1", "CBT23B2", "CBT24B1", "CBT24B2",
//           "CBT25B1", "CBT25B2", "CBT26B1", "CBT26B2",
//           "CBT27B1", "CBT27B2"
//       ]
//   };
//   const modelMap = {
//       SensorModel1,
//       SensorModel2,
//       SensorModel3,
//       SensorModel4,
//       SensorModel5,
//       SensorModel6,
//       SensorModel7,
//       SensorModel8,
//       SensorModel9,
//       SensorModel10,
//   };

//   const modelFieldMap = {
//       SensorModel1: models.model1,
//       SensorModel2: models.model2,
//       SensorModel3: models.model3,
//       SensorModel4: models.model4,
//       SensorModel5: models.model5,
//       SensorModel6: models.model6,
//       SensorModel7: models.model7,
//       SensorModel8: models.model8,
//       SensorModel9: models.model9,
//       SensorModel10: models.model10
//   };

//       const results = [];
//       const uniqueIds = new Set();

//       // Collect all unique IDs
//       const idPromises = Object.values(modelMap).map(async (model) => {
//           const docs = await model.find().select('id -_id').lean();
//           docs.forEach(doc => doc.id && uniqueIds.add(doc.id));
//       });

//       await Promise.all(idPromises);

//       // Process each ID
//       const processIdPromises = Array.from(uniqueIds).map(async (id) => {
//           const modelPromises = Object.entries(modelMap).map(async ([modelName, model]) => {
//               const sensorFields = modelFieldMap[modelName];
//               if (!sensorFields?.length) return;

//               const doc = await model.findOne({ id })
//                   .sort({ createdAt: -1 })
//                   .select([...sensorFields, 'createdAt'])
//                   .lean();

//               if (!doc) return;

//               sensorFields.forEach(field => {
//                   const value = parseFloat(doc[field]);
//                   if (isNaN(value)) return;

//                   let severity, message;
//                   if (value >= 700) {
//                       severity = "critical";
//                       message = "Critical: Immediate action required!!!";
//                   } else if (value >= 450) {
//                       severity = "warning";
//                       message = "Attention Required!!!";
//                   } else if (value >= 370) {
//                       severity = "info";
//                       message = "Monitoring recommended!!!";
//                   } else {
//                       return;
//                   }

//                   results.push({
//                       id,
//                       model: modelName,
//                       sensor: field,
//                       value,
//                       severity,
//                       message,
//                       timestamp: doc.createdAt
//                   });
//               });
//           });

//           await Promise.all(modelPromises);
//       });

//       await Promise.all(processIdPromises);

//       // Categorize results by severity
//       const categorized = results.reduce((acc, alert) => {
//           acc[alert.severity] = acc[alert.severity] || [];
//           acc[alert.severity].push(alert);
//           return acc;
//       }, {});

//       res.status(200).json({
//           status: "success",
//           data: {
//               alerts: categorized,
//               total: results.length,
//               critical: categorized.critical?.length || 0,
//               warnings: categorized.warning?.length || 0,
//               info: categorized.info?.length || 0
//           }
//       });

//   } catch (error) {
//       console.error("Notification error:", error);
//       res.status(500).json({
//           status: "error",
//           message: "Failed to fetch notifications",
//           error: error.message
//       });
//   }
// };

// for chart page

// for chart page
export const fetchSensorDataByaverage = async (req, res) => {
  const userId = req.headers['x-user-id'];
  // console.log("userId form api", userId)
  const { key, startDate, endDate, average } = req.query; const modelMap = {
    model1: SensorModel1,
    model2: SensorModel2,
    model3: SensorModel3,
    model4: SensorModel4,
    model5: SensorModel5,
    model6: SensorModel6,
    model7: SensorModel7,
    model8: SensorModel8,
    model9: SensorModel9,
    model10: SensorModel10,
  };

  const models = {
    model1: [
      "CBT1A1", "CBT1A2", "CBT2A1", "CBT2A2",
      "CBT3A1", "CBT3A2", "CBT4A1", "CBT4A2",
      "CBT5A1", "CBT5A2", "CBT6A1", "CBT6A2",
      "CBT7A1", "CBT7A2"
    ],
    model2: [
      "CBT8A1", "CBT8A2", "CBT9A1", "CBT9A2",
      "CBT10A1", "CBT10A2"
    ],
    model3: [
      "CBT11A1", "CBT11A2", "CBT12A1", "CBT12A2",
      "CBT13A1", "CBT13A2", "CBT14A1", "CBT14A2"
    ],
    model4: [
      "CBT15A1", "CBT15A2", "CBT16A1", "CBT16A2"
    ],
    model5: [
      "CBT17A1", "CBT17A2", "CBT18A1", "CBT18A2",
      "CBT19A1", "CBT19A2"
    ],
    model6: [
      "CBT20A1", "CBT20A2", "CBT21A1", "CBT21A2",
      "CBT22A1", "CBT22A2", "CBT23A1", "CBT23A2",
      "CBT24A1", "CBT24A2", "CBT25A1", "CBT25A2",
      "CBT26A1", "CBT26A2", "CBT27A1", "CBT27A2"
    ],
    model7: [
      "CBT1B1", "CBT1B2", "CBT2B1", "CBT2B2",
      "CBT3B1", "CBT3B2", "CBT4B1", "CBT4B2",
      "CBT5B1", "CBT5B2", "CBT6B1", "CBT6B2",
      "CBT7B1", "CBT7B2", "CBT8B1", "CBT8B2",
      "CBT9B1", "CBT9B2", "CBT10B1", "CBT10B2"
    ],
    model8: [
      "CBT11B1", "CBT11B2", "CBT12B1", "CBT12B2",
      "CBT13B1", "CBT13B2", "CBT14B1", "CBT14B2"
    ],
    model9: [
      "CBT15B1", "CBT15B2", "CBT16B1", "CBT16B2",
      "CBT17B1", "CBT17B2", "CBT18B1", "CBT18B2"
    ],
    model10: [
      "CBT19B1", "CBT19B2", "CBT20B1", "CBT20B2",
      "CBT21B1", "CBT21B2", "CBT22B1", "CBT22B2",
      "CBT23B1", "CBT23B2", "CBT24B1", "CBT24B2",
      "CBT25B1", "CBT25B2", "CBT26B1", "CBT26B2",
      "CBT27B1", "CBT27B2"
    ]
  };

  const findModelByKey = (key) => {
    for (const [name, keys] of Object.entries(models)) {
      if (keys.includes(key)) return modelMap[name];
    }
    return null;
  };

  try {
    const date1 = new Date(startDate);
    const date2 = new Date(endDate);


    // Handle case for All-Data key (average for all keys)
    if (key === "All-Data") {
      const allData = await Promise.all(
        Object.values(modelMap).map((model) =>
          model.find({ createdAt: { $gte: date1, $lte: date2 } }).lean()
        )
      );
      const combinedData = allData.flat();

      if (combinedData.length === 0) {
        return res.status(404).json({ error: "No data found for the given date range" });
      }

      if (average === "Hour") {
        const allGroupedData = await Promise.all([
          SensorModel1.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 },
                id: userId
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%dT%H:00:00Z",
                    date: "$createdAt"
                  }
                },
                busbar: { $first: "$busbar" },
                avgCBT1A1: { $avg: { $toDouble: "$CBT1A1" } },
                avgCBT1A2: { $avg: { $toDouble: "$CBT1A2" } },
                avgCBT2A1: { $avg: { $toDouble: "$CBT2A1" } },
                avgCBT2A2: { $avg: { $toDouble: "$CBT2A2" } },
                avgCBT3A1: { $avg: { $toDouble: "$CBT3A1" } },
                avgCBT3A2: { $avg: { $toDouble: "$CBT3A2" } },
                avgCBT4A1: { $avg: { $toDouble: "$CBT4A1" } },
                avgCBT4A2: { $avg: { $toDouble: "$CBT4A2" } },
                avgCBT5A1: { $avg: { $toDouble: "$CBT5A1" } },
                avgCBT5A2: { $avg: { $toDouble: "$CBT5A2" } },
                avgCBT6A1: { $avg: { $toDouble: "$CBT6A1" } },
                avgCBT6A2: { $avg: { $toDouble: "$CBT6A2" } },
                avgCBT7A1: { $avg: { $toDouble: "$CBT7A1" } },
                avgCBT7A2: { $avg: { $toDouble: "$CBT7A2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                TIME: 1,
                busbar: 1,
                avgCBT1A1: 1,
                avgCBT1A2: 1,
                avgCBT2A1: 1,
                avgCBT2A2: 1,
                avgCBT3A1: 1,
                avgCBT3A2: 1,
                avgCBT4A1: 1,
                avgCBT4A2: 1,
                avgCBT5A1: 1,
                avgCBT5A2: 1,
                avgCBT6A1: 1,
                avgCBT6A2: 1,
                avgCBT7A1: 1,
                avgCBT7A2: 1

              }
            },
            { $sort: { "_id": 1 } }
          ]),
          SensorModel2.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT8A1: { $avg: { $toDouble: "$CBT8A1" } },
                avgCBT8A2: { $avg: { $toDouble: "$CBT8A2" } },
                avgCBT9A1: { $avg: { $toDouble: "$CBT9A1" } },
                avgCBT9A2: { $avg: { $toDouble: "$CBT9A2" } },
                avgCBT10A1: { $avg: { $toDouble: "$CBT10A1" } },
                avgCBT10A2: { $avg: { $toDouble: "$CBT10A2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                TIME: 1,
                avgCBT8A1: 1,
                avgCBT8A2: 1,
                avgCBT9A1: 1,
                avgCBT9A2: 1,
                avgCBT10A1: 1,
                avgCBT10A2: 1

              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel3.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT11A1: { $avg: { $toDouble: "$CBT11A1" } },
                avgCBT11A2: { $avg: { $toDouble: "$CBT11A2" } },
                avgCBT12A1: { $avg: { $toDouble: "$CBT12A1" } },
                avgCBT12A2: { $avg: { $toDouble: "$CBT12A2" } },
                avgCBT13A1: { $avg: { $toDouble: "$CBT13A1" } },
                avgCBT13A2: { $avg: { $toDouble: "$CBT13A2" } },
                avgCBT14A1: { $avg: { $toDouble: "$CBT14A1" } },
                avgCBT14A2: { $avg: { $toDouble: "$CBT14A2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                TIME: 1,
                avgCBT11A1: 1,
                avgCBT11A2: 1,
                avgCBT12A1: 1,
                avgCBT12A2: 1,
                avgCBT13A1: 1,
                avgCBT13A2: 1,
                avgCBT14A1: 1,
                avgCBT14A2: 1

              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel4.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT15A1: { $avg: { $toDouble: "$CBT15A1" } },
                avgCBT15A2: { $avg: { $toDouble: "$CBT15A2" } },
                avgCBT16A1: { $avg: { $toDouble: "$CBT16A1" } },
                avgCBT16A2: { $avg: { $toDouble: "$CBT16A2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                TIME: 1,
                avgCBT15A1: 1,
                avgCBT15A2: 1,
                avgCBT16A1: 1,
                avgCBT16A2: 1,

              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel5.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT17A1: { $avg: { $toDouble: "$CBT17A1" } },
                avgCBT17A2: { $avg: { $toDouble: "$CBT17A2" } },
                avgCBT18A1: { $avg: { $toDouble: "$CBT18A1" } },
                avgCBT18A2: { $avg: { $toDouble: "$CBT18A2" } },
                avgCBT19A1: { $avg: { $toDouble: "$CBT19A1" } },
                avgCBT19A2: { $avg: { $toDouble: "$CBT19A2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                TIME: 1,
                avgCBT17A1: 1,
                avgCBT17A2: 1,
                avgCBT18A1: 1,
                avgCBT18A2: 1,
                avgCBT19A1: 1,
                avgCBT19A2: 1

              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel6.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT20A1: { $avg: { $toDouble: "$CBT20A1" } },
                avgCBT20A2: { $avg: { $toDouble: "$CBT20A2" } },
                avgCBT21A1: { $avg: { $toDouble: "$CBT21A1" } },
                avgCBT21A2: { $avg: { $toDouble: "$CBT21A2" } },
                avgCBT22A1: { $avg: { $toDouble: "$CBT22A1" } },
                avgCBT22A2: { $avg: { $toDouble: "$CBT22A2" } },
                avgCBT23A1: { $avg: { $toDouble: "$CBT23A1" } },
                avgCBT23A2: { $avg: { $toDouble: "$CBT23A2" } },
                avgCBT24A1: { $avg: { $toDouble: "$CBT24A1" } },
                avgCBT24A2: { $avg: { $toDouble: "$CBT24A2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                TIME: 1,
                avgCBT20A1: 1,
                avgCBT20A2: 1,
                avgCBT21A1: 1,
                avgCBT21A2: 1,
                avgCBT22A1: 1,
                avgCBT22A2: 1,
                avgCBT23A1: 1,
                avgCBT23A2: 1,
                avgCBT24A1: 1,
                avgCBT24A2: 1,

              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel7.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT1B1: { $avg: { $toDouble: "$CBT1B1" } },
                avgCBT1B2: { $avg: { $toDouble: "$CBT1B2" } },
                avgCBT2B1: { $avg: { $toDouble: "$CBT2B1" } },
                avgCBT2B2: { $avg: { $toDouble: "$CBT2B2" } },
                avgCBT3B1: { $avg: { $toDouble: "$CBT3B1" } },
                avgCBT3B2: { $avg: { $toDouble: "$CBT3B2" } },
                avgCBT4B1: { $avg: { $toDouble: "$CBT4B1" } },
                avgCBT4B2: { $avg: { $toDouble: "$CBT4B2" } },
                avgCBT5B1: { $avg: { $toDouble: "$CBT5B1" } },
                avgCBT5B2: { $avg: { $toDouble: "$CBT5B2" } },
                avgCBT6B1: { $avg: { $toDouble: "$CBT6B1" } },
                avgCBT6B2: { $avg: { $toDouble: "$CBT6B2" } },
                avgCBT7B1: { $avg: { $toDouble: "$CBT7B1" } },
                avgCBT7B2: { $avg: { $toDouble: "$CBT7B2" } },
                avgCBT8B1: { $avg: { $toDouble: "$CBT8B1" } },
                avgCBT8B2: { $avg: { $toDouble: "$CBT8B2" } },
                avgCBT9B1: { $avg: { $toDouble: "$CBT9B1" } },
                avgCBT9B2: { $avg: { $toDouble: "$CBT9B2" } },
                avgCBT10B1: { $avg: { $toDouble: "$CBT10B1" } },
                avgCBT10B2: { $avg: { $toDouble: "$CBT10B2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                TIME: 1,
                avgCBT1B1: 1,
                avgCBT1B2: 1,
                avgCBT2B1: 1,
                avgCBT2B2: 1,
                avgCBT3B1: 1,
                avgCBT3B2: 1,
                avgCBT4B1: 1,
                avgCBT4B2: 1,
                avgCBT5B1: 1,
                avgCBT5B2: 1,
                avgCBT6B1: 1,
                avgCBT6B2: 1,
                avgCBT7B1: 1,
                avgCBT7B2: 1,
                avgCBT8B1: 1,
                avgCBT8B2: 1,
                avgCBT9B1: 1,
                avgCBT9B2: 1,
                avgCBT10B1: 1,
                avgCBT10B2: 1
              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel8.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT11B1: { $avg: { $toDouble: "$CBT11B1" } },
                avgCBT11B2: { $avg: { $toDouble: "$CBT11B2" } },
                avgCBT12B1: { $avg: { $toDouble: "$CBT12B1" } },
                avgCBT12B2: { $avg: { $toDouble: "$CBT12B2" } },
                avgCBT13B1: { $avg: { $toDouble: "$CBT13B1" } },
                avgCBT13B2: { $avg: { $toDouble: "$CBT13B2" } },
                avgCBT14B1: { $avg: { $toDouble: "$CBT14B1" } },
                avgCBT14B2: { $avg: { $toDouble: "$CBT14B2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                TIME: 1,
                avgCBT11B1: 1,
                avgCBT11B2: 1,
                avgCBT12B1: 1,
                avgCBT12B2: 1,
                avgCBT13B1: 1,
                avgCBT13B2: 1,
                avgCBT14B1: 1,
                avgCBT14B2: 1
              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel9.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT15B1: { $avg: { $toDouble: "$CBT15B1" } },
                avgCBT15B2: { $avg: { $toDouble: "$CBT15B2" } },
                avgCBT16B1: { $avg: { $toDouble: "$CBT16B1" } },
                avgCBT16B2: { $avg: { $toDouble: "$CBT16B2" } },
                avgCBT17B1: { $avg: { $toDouble: "$CBT17B1" } },
                avgCBT17B2: { $avg: { $toDouble: "$CBT17B2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                TIME: 1,
                avgCBT15B1: 1,
                avgCBT15B2: 1,
                avgCBT16B1: 1,
                avgCBT16B2: 1,
                avgCBT17B1: 1,
                avgCBT17B2: 1
              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel10.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT19B1: { $avg: { $toDouble: "$CBT19B1" } },
                avgCBT19B2: { $avg: { $toDouble: "$CBT19B2" } },
                avgCBT20B1: { $avg: { $toDouble: "$CBT20B1" } },
                avgCBT20B2: { $avg: { $toDouble: "$CBT20B2" } },
                avgCBT21B1: { $avg: { $toDouble: "$CBT21B1" } },
                avgCBT21B2: { $avg: { $toDouble: "$CBT21B2" } },
                avgCBT22B1: { $avg: { $toDouble: "$CBT22B1" } },
                avgCBT22B2: { $avg: { $toDouble: "$CBT22B2" } },
                avgCBT23B1: { $avg: { $toDouble: "$CBT23B1" } },
                avgCBT23B2: { $avg: { $toDouble: "$CBT23B2" } },
                avgCBT24B1: { $avg: { $toDouble: "$CBT24B1" } },
                avgCBT24B2: { $avg: { $toDouble: "$CBT24B2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                TIME: 1,
                avgCBT19B1: 1,
                avgCBT19B2: 1,
                avgCBT20B1: 1,
                avgCBT20B2: 1,
                avgCBT21B1: 1,
                avgCBT21B2: 1,
                avgCBT22B1: 1,
                avgCBT22B2: 1,
                avgCBT23B1: 1,
                avgCBT23B2: 1,
                avgCBT24B1: 1,
                avgCBT24B2: 1

              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ])
        ]);

        // Log the results of each aggregation
        console.log("Grouped Data from SensorModel1:", allGroupedData[0]);
        console.log("Grouped Data from SensorModel2:", allGroupedData[1]);
        console.log("Grouped Data from SensorModel3:", allGroupedData[2]);
        console.log("Grouped Data from SensorModel4:", allGroupedData[3]);
        console.log("Grouped Data from SensorModel5:", allGroupedData[4]);
        console.log("Grouped Data from SensorModel6:", allGroupedData[5]);
        console.log("Grouped Data from SensorModel7:", allGroupedData[6]);
        console.log("Grouped Data from SensorModel8:", allGroupedData[7]);
        console.log("Grouped Data from SensorModel9:", allGroupedData[8]);
        console.log("Grouped Data from SensorModel10:", allGroupedData[9]);

        const combinedGroupedData = allGroupedData.flat();

        if (combinedGroupedData.length === 0) {
          return res.status(404).json({ error: "No data found for the given date range" });
        }

        return res.status(200).json(combinedGroupedData);
      }
      else if (average === "Day") {
        const allGroupedData = await Promise.all([
          SensorModel1.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%dT%H:00:00Z",
                    date: "$createdAt"
                  }
                },
                avgCBT1A1: { $avg: { $toDouble: "$CBT1A1" } },
                avgCBT1A2: { $avg: { $toDouble: "$CBT1A2" } },
                avgCBT2A1: { $avg: { $toDouble: "$CBT2A1" } },
                avgCBT2A2: { $avg: { $toDouble: "$CBT2A2" } },
                avgCBT3A1: { $avg: { $toDouble: "$CBT3A1" } },
                avgCBT3A2: { $avg: { $toDouble: "$CBT3A2" } },
                avgCBT4A1: { $avg: { $toDouble: "$CBT4A1" } },
                avgCBT4A2: { $avg: { $toDouble: "$CBT4A2" } },
                avgCBT5A1: { $avg: { $toDouble: "$CBT5A1" } },
                avgCBT5A2: { $avg: { $toDouble: "$CBT5A2" } },
                avgCBT6A1: { $avg: { $toDouble: "$CBT6A1" } },
                avgCBT6A2: { $avg: { $toDouble: "$CBT6A2" } },
                avgCBT7A1: { $avg: { $toDouble: "$CBT7A1" } },
                avgCBT7A2: { $avg: { $toDouble: "$CBT7A2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                avgCBT1A1: 1,
                avgCBT1A2: 1,
                avgCBT2A1: 1,
                avgCBT2A2: 1,
                avgCBT3A1: 1,
                avgCBT3A2: 1,
                avgCBT4A1: 1,
                avgCBT4A2: 1,
                avgCBT5A1: 1,
                avgCBT5A2: 1,
                avgCBT6A1: 1,
                avgCBT6A2: 1,
                avgCBT7A1: 1,
                avgCBT7A2: 1,
                TIME: 1
              }
            },
            { $sort: { "_id": 1 } }
          ]),
          SensorModel2.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT8A1: { $avg: { $toDouble: "$CBT8A1" } },
                avgCBT8A2: { $avg: { $toDouble: "$CBT8A2" } },
                avgCBT9A1: { $avg: { $toDouble: "$CBT9A1" } },
                avgCBT9A2: { $avg: { $toDouble: "$CBT9A2" } },
                avgCBT10A1: { $avg: { $toDouble: "$CBT10A1" } },
                avgCBT10A2: { $avg: { $toDouble: "$CBT10A2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                avgCBT8A1: 1,
                avgCBT8A2: 1,
                avgCBT9A1: 1,
                avgCBT9A2: 1,
                avgCBT10A1: 1,
                avgCBT10A2: 1,
                TIME: 1
              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel3.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT11A1: { $avg: { $toDouble: "$CBT11A1" } },
                avgCBT11A2: { $avg: { $toDouble: "$CBT11A2" } },
                avgCBT12A1: { $avg: { $toDouble: "$CBT12A1" } },
                avgCBT12A2: { $avg: { $toDouble: "$CBT12A2" } },
                avgCBT13A1: { $avg: { $toDouble: "$CBT13A1" } },
                avgCBT13A2: { $avg: { $toDouble: "$CBT13A2" } },
                avgCBT14A1: { $avg: { $toDouble: "$CBT14A1" } },
                avgCBT14A2: { $avg: { $toDouble: "$CBT14A2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                avgCBT11A1: 1,
                avgCBT11A2: 1,
                avgCBT12A1: 1,
                avgCBT12A2: 1,
                avgCBT13A1: 1,
                avgCBT13A2: 1,
                avgCBT14A1: 1,
                avgCBT14A2: 1,
                TIME: 1
              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel4.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT15A1: { $avg: { $toDouble: "$CBT15A1" } },
                avgCBT15A2: { $avg: { $toDouble: "$CBT15A2" } },
                avgCBT16A1: { $avg: { $toDouble: "$CBT16A1" } },
                avgCBT16A2: { $avg: { $toDouble: "$CBT16A2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                avgCBT15A1: 1,
                avgCBT15A2: 1,
                avgCBT16A1: 1,
                avgCBT16A2: 1,
                TIME: 1
              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel5.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT17A1: { $avg: { $toDouble: "$CBT17A1" } },
                avgCBT17A2: { $avg: { $toDouble: "$CBT17A2" } },
                avgCBT18A1: { $avg: { $toDouble: "$CBT18A1" } },
                avgCBT18A2: { $avg: { $toDouble: "$CBT18A2" } },
                avgCBT19A1: { $avg: { $toDouble: "$CBT19A1" } },
                avgCBT19A2: { $avg: { $toDouble: "$CBT19A2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                avgCBT17A1: 1,
                avgCBT17A2: 1,
                avgCBT18A1: 1,
                avgCBT18A2: 1,
                avgCBT19A1: 1,
                avgCBT19A2: 1,
                TIME: 1
              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel6.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT20A1: { $avg: { $toDouble: "$CBT20A1" } },
                avgCBT20A2: { $avg: { $toDouble: "$CBT20A2" } },
                avgCBT21A1: { $avg: { $toDouble: "$CBT21A1" } },
                avgCBT21A2: { $avg: { $toDouble: "$CBT21A2" } },
                avgCBT22A1: { $avg: { $toDouble: "$CBT22A1" } },
                avgCBT22A2: { $avg: { $toDouble: "$CBT22A2" } },
                avgCBT23A1: { $avg: { $toDouble: "$CBT23A1" } },
                avgCBT23A2: { $avg: { $toDouble: "$CBT23A2" } },
                avgCBT24A1: { $avg: { $toDouble: "$CBT24A1" } },
                avgCBT24A2: { $avg: { $toDouble: "$CBT24A2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                avgCBT20A1: 1,
                avgCBT20A2: 1,
                avgCBT21A1: 1,
                avgCBT21A2: 1,
                avgCBT22A1: 1,
                avgCBT22A2: 1,
                avgCBT23A1: 1,
                avgCBT23A2: 1,
                avgCBT24A1: 1,
                avgCBT24A2: 1,

              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel7.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT1B1: { $avg: { $toDouble: "$CBT1B1" } },
                avgCBT1B2: { $avg: { $toDouble: "$CBT1B2" } },
                avgCBT2B1: { $avg: { $toDouble: "$CBT2B1" } },
                avgCBT2B2: { $avg: { $toDouble: "$CBT2B2" } },
                avgCBT3B1: { $avg: { $toDouble: "$CBT3B1" } },
                avgCBT3B2: { $avg: { $toDouble: "$CBT3B2" } },
                avgCBT4B1: { $avg: { $toDouble: "$CBT4B1" } },
                avgCBT4B2: { $avg: { $toDouble: "$CBT4B2" } },
                avgCBT5B1: { $avg: { $toDouble: "$CBT5B1" } },
                avgCBT5B2: { $avg: { $toDouble: "$CBT5B2" } },
                avgCBT6B1: { $avg: { $toDouble: "$CBT6B1" } },
                avgCBT6B2: { $avg: { $toDouble: "$CBT6B2" } },
                avgCBT7B1: { $avg: { $toDouble: "$CBT7B1" } },
                avgCBT7B2: { $avg: { $toDouble: "$CBT7B2" } },
                avgCBT8B1: { $avg: { $toDouble: "$CBT8B1" } },
                avgCBT8B2: { $avg: { $toDouble: "$CBT8B2" } },
                avgCBT9B1: { $avg: { $toDouble: "$CBT9B1" } },
                avgCBT9B2: { $avg: { $toDouble: "$CBT9B2" } },
                avgCBT10B1: { $avg: { $toDouble: "$CBT10B1" } },
                avgCBT10B2: { $avg: { $toDouble: "$CBT10B2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                avgCBT1B1: 1,
                avgCBT1B2: 1,
                avgCBT2B1: 1,
                avgCBT2B2: 1,
                avgCBT3B1: 1,
                avgCBT3B2: 1,
                avgCBT4B1: 1,
                avgCBT4B2: 1,
                avgCBT5B1: 1,
                avgCBT5B2: 1,
                avgCBT6B1: 1,
                avgCBT6B2: 1,
                avgCBT7B1: 1,
                avgCBT7B2: 1,
                avgCBT8B1: 1,
                avgCBT8B2: 1,
                avgCBT9B1: 1,
                avgCBT9B2: 1,
                avgCBT10B1: 1,
                avgCBT10B2: 1,
                TIME: 1
              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel8.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT11B1: { $avg: { $toDouble: "$CBT11B1" } },
                avgCBT11B2: { $avg: { $toDouble: "$CBT11B2" } },
                avgCBT12B1: { $avg: { $toDouble: "$CBT12B1" } },
                avgCBT12B2: { $avg: { $toDouble: "$CBT12B2" } },
                avgCBT13B1: { $avg: { $toDouble: "$CBT13B1" } },
                avgCBT13B2: { $avg: { $toDouble: "$CBT13B2" } },
                avgCBT14B1: { $avg: { $toDouble: "$CBT14B1" } },
                avgCBT14B2: { $avg: { $toDouble: "$CBT14B2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                avgCBT11B1: 1,
                avgCBT11B2: 1,
                avgCBT12B1: 1,
                avgCBT12B2: 1,
                avgCBT13B1: 1,
                avgCBT13B2: 1,
                avgCBT14B1: 1,
                avgCBT14B2: 1,
                TIME: 1
              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel9.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT15B1: { $avg: { $toDouble: "$CBT15B1" } },
                avgCBT15B2: { $avg: { $toDouble: "$CBT15B2" } },
                avgCBT16B1: { $avg: { $toDouble: "$CBT16B1" } },
                avgCBT16B2: { $avg: { $toDouble: "$CBT16B2" } },
                avgCBT17B1: { $avg: { $toDouble: "$CBT17B1" } },
                avgCBT17B2: { $avg: { $toDouble: "$CBT17B2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                avgCBT15B1: 1,
                avgCBT15B2: 1,
                avgCBT16B1: 1,
                avgCBT16B2: 1,
                avgCBT17B1: 1,
                avgCBT17B2: 1
              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel10.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT19B1: { $avg: { $toDouble: "$CBT19B1" } },
                avgCBT19B2: { $avg: { $toDouble: "$CBT19B2" } },
                avgCBT20B1: { $avg: { $toDouble: "$CBT20B1" } },
                avgCBT20B2: { $avg: { $toDouble: "$CBT20B2" } },
                avgCBT21B1: { $avg: { $toDouble: "$CBT21B1" } },
                avgCBT21B2: { $avg: { $toDouble: "$CBT21B2" } },
                avgCBT22B1: { $avg: { $toDouble: "$CBT22B1" } },
                avgCBT22B2: { $avg: { $toDouble: "$CBT22B2" } },
                avgCBT23B1: { $avg: { $toDouble: "$CBT23B1" } },
                avgCBT23B2: { $avg: { $toDouble: "$CBT23B2" } },
                avgCBT24B1: { $avg: { $toDouble: "$CBT24B1" } },
                avgCBT24B2: { $avg: { $toDouble: "$CBT24B2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                avgCBT19B1: 1,
                avgCBT19B2: 1,
                avgCBT20B1: 1,
                avgCBT20B2: 1,
                avgCBT21B1: 1,
                avgCBT21B2: 1,
                avgCBT22B1: 1,
                avgCBT22B2: 1,
                avgCBT23B1: 1,
                avgCBT23B2: 1,
                avgCBT24B1: 1,
                avgCBT24B2: 1,
                TIME: 1
              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ])
        ]);

        const combinedGroupedData = allGroupedData.flat();

        if (combinedGroupedData.length === 0) {
          return res.status(404).json({ error: "No data found for the given date range" });
        }

        return res.status(200).json(combinedGroupedData);
      }

    }

    // Handle case for a specific key
    const model = findModelByKey(key);
    if (!model) {
      return res.status(404).json({ error: "Key not found in any model" });
    }

    const data = await model.find({
      createdAt: { $gte: date1, $lte: date2 },
      [key]: { $exists: true },
    }).lean();

    if (data.length === 0) {
      return res.status(404).json({ error: "No data found for the given key" });
    }

    if (average === "Day") {
      const groupedData = await model.aggregate([
        {
          $match: {
            createdAt: { $gte: date1, $lt: date2 }, id: userId
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            TIME: { $first: '$TIME' },
            [key]: { $first: `$${key}` } // Using dynamic key
          }
        },
        {
          $project: {
            _id: 0,
            [key]: 1,
            date: '$_id',
            TIME: 1

          }
        }
      ]);
      return res.status(200).json(groupedData);
    } else if (average === "Hour") {
      const groupedData = await model.aggregate([
        {
          $match: {
            createdAt: { $gte: date1, $lt: date2 }, id: userId
          },
        },
        {
          $project: {
            [key]: 1, // Using dynamic key
            TIME: 1,
            createdAt: 1
          }
        },
        {
          $sort: {
            createdAt: 1
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%dT%H:00:00',
                date: '$createdAt'
              }
            },
            [key]: {
              $first: `$${key}` // Using dynamic key
            },
            TIME: {
              $first: '$TIME'
            }
          }
        },
        {
          $project: {
            _id: 0,
            TIME: 1,
            [key]: 1,
            hour: '$_id'
          }
        },
        {
          $sort: {
            hour: 1
          }
        }
      ]);
      return res.status(200).json(groupedData);
    }

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const fetchSensorDataByinterval = async (req, res) => {
  const { key, startDate, endDate, average } = req.query;
  const userId = req.headers['x-user-id'];

  const modelMap = {
    model1: SensorModel1,
    model2: SensorModel2,
    model3: SensorModel3,
    model4: SensorModel4,
    model5: SensorModel5,
    model6: SensorModel6,
    model7: SensorModel7,
    model8: SensorModel8,
    model9: SensorModel9,
    model10: SensorModel10,
  };

  const models = {
    model1: [
      "CBT1A1", "CBT1A2", "CBT2A1", "CBT2A2",
      "CBT3A1", "CBT3A2", "CBT4A1", "CBT4A2",
      "CBT5A1", "CBT5A2", "CBT6A1", "CBT6A2",
      "CBT7A1", "CBT7A2"
    ],
    model2: [
      "CBT8A1", "CBT8A2", "CBT9A1", "CBT9A2",
      "CBT10A1", "CBT10A2"
    ],
    model3: [
      "CBT11A1", "CBT11A2", "CBT12A1", "CBT12A2",
      "CBT13A1", "CBT13A2", "CBT14A1", "CBT14A2"
    ],
    model4: [
      "CBT15A1", "CBT15A2", "CBT16A1", "CBT16A2"
    ],
    model5: [
      "CBT17A1", "CBT17A2", "CBT18A1", "CBT18A2",
      "CBT19A1", "CBT19A2"
    ],
    model6: [
      "CBT20A1", "CBT20A2", "CBT21A1", "CBT21A2",
      "CBT22A1", "CBT22A2", "CBT23A1", "CBT23A2",
      "CBT24A1", "CBT24A2", "CBT25A1", "CBT25A2",
      "CBT26A1", "CBT26A2", "CBT27A1", "CBT27A2"
    ],
    model7: [
      "CBT1B1", "CBT1B2", "CBT2B1", "CBT2B2",
      "CBT3B1", "CBT3B2", "CBT4B1", "CBT4B2",
      "CBT5B1", "CBT5B2", "CBT6B1", "CBT6B2",
      "CBT7B1", "CBT7B2", "CBT8B1", "CBT8B2",
      "CBT9B1", "CBT9B2", "CBT10B1", "CBT10B2"
    ],
    model8: [
      "CBT11B1", "CBT11B2", "CBT12B1", "CBT12B2",
      "CBT13B1", "CBT13B2", "CBT14B1", "CBT14B2"
    ],
    model9: [
      "CBT15B1", "CBT15B2", "CBT16B1", "CBT16B2",
      "CBT17B1", "CBT17B2", "CBT18B1", "CBT18B2"
    ],
    model10: [
      "CBT19B1", "CBT19B2", "CBT20B1", "CBT20B2",
      "CBT21B1", "CBT21B2", "CBT22B1", "CBT22B2",
      "CBT23B1", "CBT23B2", "CBT24B1", "CBT24B2",
      "CBT25B1", "CBT25B2", "CBT26B1", "CBT26B2",
      "CBT27B1", "CBT27B2"
    ]
  };

  const findModelByKey = (key) => {
    for (const [name, keys] of Object.entries(models)) {
      if (keys.includes(key)) return modelMap[name];
    }
    return null;
  };

  try {
    const date1 = new Date(startDate);
    const date2 = new Date(endDate);
    // Handle case for All-Data key (average for all keys)
    if (key === "All-Data") {
      const allData = await Promise.all(
        Object.values(modelMap).map((model) =>
          model.find({ createdAt: { $gte: date1, $lte: date2 } }).lean()
        )
      );
      const combinedData = allData.flat();

      if (combinedData.length === 0) {
        return res.status(404).json({ error: "No data found for the given date range" });
      }
      // ... existing code ...
      if (average === "Hour") {
        const allGroupedData = await Promise.all([
          SensorModel1.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                  day: { $dayOfMonth: "$createdAt" },
                  hour: { $hour: "$createdAt" },
                },
                TIME: { $first: "$TIME" },
                busbar: { $first: "$busbar" },
                CBT1A1: { $first: "$CBT1A1" },
                CBT1A2: { $first: "$CBT1A2" },
                CBT2A1: { $first: "$CBT2A1" },
                CBT2A2: { $first: "$CBT2A2" },
                CBT3A1: { $first: "$CBT3A1" },
                CBT3A2: { $first: "$CBT3A2" },
                CBT4A1: { $first: "$CBT4A1" },
                CBT4A2: { $first: "$CBT4A2" },
                CBT5A1: { $first: "$CBT5A1" },
                CBT5A2: { $first: "$CBT5A2" },
                CBT6A1: { $first: "$CBT6A1" },
                CBT6A2: { $first: "$CBT6A2" },
                CBT7A1: { $first: "$CBT7A1" },
                CBT7A2: { $first: "$CBT7A2" },
              },
            },
            {
              $project: {
                _id: 0,
                TIME: 1,
                busbar: 1,
                CBT1A1: 1,
                CBT1A2: 1,
                CBT2A1: 1,
                CBT2A2: 1,
                CBT3A1: 1,
                CBT3A2: 1,
                CBT4A1: 1,
                CBT4A2: 1,
                CBT5A1: 1,
                CBT5A2: 1,
                CBT6A1: 1,
                CBT6A2: 1,
                CBT7A1: 1,
                CBT7A2: 1,
              },
            },
          ]),
          SensorModel2.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                  day: { $dayOfMonth: "$createdAt" },
                  hour: { $hour: "$createdAt" },
                },
                TIME: { $first: "$TIME" },
                busbar: { $first: "$busbar" },
                CBT8A1: { $first: "$CBT8A1" },
                CBT8A2: { $first: "$CBT8A2" },
                CBT9A1: { $first: "$CBT9A1" },
                CBT9A2: { $first: "$CBT9A2" },
                CBT10A1: { $first: "$CBT10A1" },
                CBT10A2: { $first: "$CBT10A2" },
              },
            },
            {
              $project: {
                _id: 0,
                TIME: 1,
                busbar: 1,
                CBT8A1: 1,
                CBT8A2: 1,
                CBT9A1: 1,
                CBT9A2: 1,
                CBT10A1: 1,
                CBT10A2: 1,
              },
            },
          ]),
          SensorModel3.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                  day: { $dayOfMonth: "$createdAt" },
                  hour: { $hour: "$createdAt" },
                },
                TIME: { $first: "$TIME" },
                busbar: { $first: "$busbar" },
                CBT11A1: { $first: "$CBT11A1" },
                CBT11A2: { $first: "$CBT11A2" },
                CBT12A1: { $first: "$CBT12A1" },
                CBT12A2: { $first: "$CBT12A2" },
                CBT13A1: { $first: "$CBT13A1" },
                CBT13A2: { $first: "$CBT13A2" },
                CBT14A1: { $first: "$CBT14A1" },
                CBT14A2: { $first: "$CBT14A2" },
              },
            },
            {
              $project: {
                _id: 0,
                TIME: 1,
                busbar: 1,
                CBT11A1: 1,
                CBT11A2: 1,
                CBT12A1: 1,
                CBT12A2: 1,
                CBT13A1: 1,
                CBT13A2: 1,
                CBT14A1: 1,
                CBT14A2: 1,
              },
            },
          ]),
          SensorModel4.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                  day: { $dayOfMonth: "$createdAt" },
                  hour: { $hour: "$createdAt" },
                },
                TIME: { $first: "$TIME" },
                busbar: { $first: "$busbar" },
                CBT15A1: { $first: "$CBT15A1" },
                CBT15A2: { $first: "$CBT15A2" },
                CBT16A1: { $first: "$CBT16A1" },
                CBT16A2: { $first: "$CBT16A2" },
              },
            },
            {
              $project: {
                _id: 0,
                TIME: 1,
                busbar: 1,
                CBT15A1: 1,
                CBT15A2: 1,
                CBT16A1: 1,
                CBT16A2: 1
              },
            },
          ]),
          SensorModel5.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                  day: { $dayOfMonth: "$createdAt" },
                  hour: { $hour: "$createdAt" },
                },
                TIME: { $first: "$TIME" },
                busbar: { $first: "$busbar" },
                CBT17A1: { $first: "$CBT17A1" },
                CBT17A2: { $first: "$CBT17A2" },
                CBT18A1: { $first: "$CBT18A1" },
                CBT18A2: { $first: "$CBT18A2" },
                CBT19A1: { $first: "$CBT19A1" },
                CBT19A2: { $first: "$CBT19A2" },
              },
            },
            {
              $project: {
                _id: 0,
                TIME: 1,
                busbar: 1,
                CBT17A1: 1,
                CBT17A2: 1,
                CBT18A1: 1,
                CBT18A2: 1,
                CBT19A1: 1,
                CBT19A2: 1,
              },
            },
          ]),
          SensorModel6.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                  day: { $dayOfMonth: "$createdAt" },
                  hour: { $hour: "$createdAt" },
                },
                TIME: { $first: "$TIME" },
                busbar: { $first: "$busbar" },
                CBT20A1: { $first: "$CBT20A1" },
                CBT20A2: { $first: "$CBT20A2" },
                CBT21A1: { $first: "$CBT21A1" },
                CBT21A2: { $first: "$CBT21A2" },
                CBT22A1: { $first: "$CBT22A1" },
                CBT22A2: { $first: "$CBT22A2" },
                CBT23A1: { $first: "$CBT23A1" },
                CBT23A2: { $first: "$CBT23A2" },
                CBT24A1: { $first: "$CBT24A1" },
                CBT24A2: { $first: "$CBT24A2" },
                CBT25A1: { $first: "$CBT25A1" },
                CBT25A2: { $first: "$CBT25A2" },
                CBT26A1: { $first: "$CBT26A1" },
                CBT26A2: { $first: "$CBT26A2" },
                CBT27A1: { $first: "$CBT27A1" },
                CBT27A2: { $first: "$CBT27A2" },
              },
            },
            {
              $project: {
                _id: 0,
                TIME: 1,
                busbar: 1,
                CBT20A1: 1,
                CBT20A2: 1,
                CBT21A1: 1,
                CBT21A2: 1,
                CBT22A1: 1,
                CBT22A2: 1,
                CBT23A1: 1,
                CBT23A2: 1,
                CBT24A1: 1,
                CBT24A2: 1,
                CBT25A1: 1,
                CBT25A2: 1,
                CBT26A1: 1,
                CBT26A2: 1,
                CBT27A1: 1,
                CBT27A2: 1,
              },
            },
          ]),
          SensorModel7.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT1B1: { $avg: { $toDouble: "$CBT1B1" } },
                avgCBT1B2: { $avg: { $toDouble: "$CBT1B2" } },
                avgCBT2B1: { $avg: { $toDouble: "$CBT2B1" } },
                avgCBT2B2: { $avg: { $toDouble: "$CBT2B2" } },
                avgCBT3B1: { $avg: { $toDouble: "$CBT3B1" } },
                avgCBT3B2: { $avg: { $toDouble: "$CBT3B2" } },
                avgCBT4B1: { $avg: { $toDouble: "$CBT4B1" } },
                avgCBT4B2: { $avg: { $toDouble: "$CBT4B2" } },
                avgCBT5B1: { $avg: { $toDouble: "$CBT5B1" } },
                avgCBT5B2: { $avg: { $toDouble: "$CBT5B2" } },
                avgCBT6B1: { $avg: { $toDouble: "$CBT6B1" } },
                avgCBT6B2: { $avg: { $toDouble: "$CBT6B2" } },
                avgCBT7B1: { $avg: { $toDouble: "$CBT7B1" } },
                avgCBT7B2: { $avg: { $toDouble: "$CBT7B2" } },
                avgCBT8B1: { $avg: { $toDouble: "$CBT8B1" } },
                avgCBT8B2: { $avg: { $toDouble: "$CBT8B2" } },
                avgCBT9B1: { $avg: { $toDouble: "$CBT9B1" } },
                avgCBT9B2: { $avg: { $toDouble: "$CBT9B2" } },
                avgCBT10B1: { $avg: { $toDouble: "$CBT10B1" } },
                avgCBT10B2: { $avg: { $toDouble: "$CBT10B2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                avgCBT1B1: 1,
                avgCBT1B2: 1,
                avgCBT2B1: 1,
                avgCBT2B2: 1,
                avgCBT3B1: 1,
                avgCBT3B2: 1,
                avgCBT4B1: 1,
                avgCBT4B2: 1,
                avgCBT5B1: 1,
                avgCBT5B2: 1,
                avgCBT6B1: 1,
                avgCBT6B2: 1,
                avgCBT7B1: 1,
                avgCBT7B2: 1,
                avgCBT8B1: 1,
                avgCBT8B2: 1,
                avgCBT9B1: 1,
                avgCBT9B2: 1,
                avgCBT10B1: 1,
                avgCBT10B2: 1,
                TIME: 1
              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel8.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT11B1: { $avg: { $toDouble: "$CBT11B1" } },
                avgCBT11B2: { $avg: { $toDouble: "$CBT11B2" } },
                avgCBT12B1: { $avg: { $toDouble: "$CBT12B1" } },
                avgCBT12B2: { $avg: { $toDouble: "$CBT12B2" } },
                avgCBT13B1: { $avg: { $toDouble: "$CBT13B1" } },
                avgCBT13B2: { $avg: { $toDouble: "$CBT13B2" } },
                avgCBT14B1: { $avg: { $toDouble: "$CBT14B1" } },
                avgCBT14B2: { $avg: { $toDouble: "$CBT14B2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                avgCBT11B1: 1,
                avgCBT11B2: 1,
                avgCBT12B1: 1,
                avgCBT12B2: 1,
                avgCBT13B1: 1,
                avgCBT13B2: 1,
                avgCBT14B1: 1,
                avgCBT14B2: 1,
                TIME: 1
              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel9.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT15B1: { $avg: { $toDouble: "$CBT15B1" } },
                avgCBT15B2: { $avg: { $toDouble: "$CBT15B2" } },
                avgCBT16B1: { $avg: { $toDouble: "$CBT16B1" } },
                avgCBT16B2: { $avg: { $toDouble: "$CBT16B2" } },
                avgCBT17B1: { $avg: { $toDouble: "$CBT17B1" } },
                avgCBT17B2: { $avg: { $toDouble: "$CBT17B2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                avgCBT15B1: 1,
                avgCBT15B2: 1,
                avgCBT16B1: 1,
                avgCBT16B2: 1,
                avgCBT17B1: 1,
                avgCBT17B2: 1,
                TIME: 1
              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ]),
          SensorModel10.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId
              },
            },
            {
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$createdAt"
                  }
                },
                hour: {
                  $dateToString: {
                    format: "%H",
                    date: "$createdAt"
                  }
                }
              }
            },
            {
              $group: {
                _id: { date: "$date", hour: "$hour" },
                avgCBT19B1: { $avg: { $toDouble: "$CBT19B1" } },
                avgCBT19B2: { $avg: { $toDouble: "$CBT19B2" } },
                avgCBT20B1: { $avg: { $toDouble: "$CBT20B1" } },
                avgCBT20B2: { $avg: { $toDouble: "$CBT20B2" } },
                avgCBT21B1: { $avg: { $toDouble: "$CBT21B1" } },
                avgCBT21B2: { $avg: { $toDouble: "$CBT21B2" } },
                avgCBT22B1: { $avg: { $toDouble: "$CBT22B1" } },
                avgCBT22B2: { $avg: { $toDouble: "$CBT22B2" } },
                avgCBT23B1: { $avg: { $toDouble: "$CBT23B1" } },
                avgCBT23B2: { $avg: { $toDouble: "$CBT23B2" } },
                avgCBT24B1: { $avg: { $toDouble: "$CBT24B1" } },
                avgCBT24B2: { $avg: { $toDouble: "$CBT24B2" } },
                TIME: { $first: "$TIME" }
              }
            },
            {
              $project: {
                _id: 0,
                avgCBT19B1: 1,
                avgCBT19B2: 1,
                avgCBT20B1: 1,
                avgCBT20B2: 1,
                avgCBT21B1: 1,
                avgCBT21B2: 1,
                avgCBT22B1: 1,
                avgCBT22B2: 1,
                avgCBT23B1: 1,
                avgCBT23B2: 1,
                avgCBT24B1: 1,
                avgCBT24B2: 1,
                TIME: 1
              }
            },
            { $sort: { "date": 1, "hour": 1 } }
          ])
        ]);

        const combinedGroupedData = allGroupedData.flat();

        if (combinedGroupedData.length === 0) {
          return res.status(404).json({ error: "No data found for the given date range" });
        }

        return res.status(200).json(combinedGroupedData);
      }
      //need to work on this.....
      else if (average === "Day") {
        const allGroupedData = await Promise.all([
          SensorModel1.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId // Filter by date range
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d", // Group by day
                    date: "$createdAt",
                  },
                },
                entry: { $first: "$$ROOT" }, // Keep the first document for each day
              },
            },
            {
              $replaceRoot: {
                newRoot: "$entry", // Replace the root with the stored document
              },
            },
            {
              $project: {
                _id: 0, // Exclude the default _id field
                TIME: 1, // Include TIME field
                CBT1A1: 1,
                CBT1A2: 1,
                CBT2A1: 1,
                CBT2A2: 1,
                CBT3A1: 1,
                CBT3A2: 1,
                CBT4A1: 1,
                CBT4A2: 1,
                CBT5A1: 1,
                CBT5A2: 1,
                CBT6A1: 1,
                CBT6A2: 1,
                CBT7A1: 1,
                CBT7A2: 1,

              },
            },
            { $sort: { createdAt: 1 } }, // Sort by date ascending
          ]),
          SensorModel2.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId // Filter by date range
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d", // Group by day
                    date: "$createdAt",
                  },
                },
                entry: { $first: "$$ROOT" }, // Keep the first document for each day
              },
            },
            {
              $replaceRoot: {
                newRoot: "$entry", // Replace the root with the stored document
              },
            }, {
              $project: {
                _id: 0, // Exclude the default _id field
                TIME: 1, // Include TIME field
                busbar: 1, CBT8A1: 1,
                CBT8A2: 1,
                CBT9A1: 1,
                CBT9A2: 1,
                CBT10A1: 1,
                CBT10A2: 1,
                // Include createdAt for reference
              }
            },
            { $sort: { date: 1 } }
          ]),
          SensorModel3.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId // Filter by date range
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d", // Group by day
                    date: "$createdAt",
                  },
                },
                entry: { $first: "$$ROOT" }, // Keep the first document for each day
              },
            },
            {
              $replaceRoot: {
                newRoot: "$entry", // Replace the root with the stored document
              },
            },
            {
              $project: {
                _id: 0, // Exclude the default _id field
                TIME: 1, // Include TIME field
                busbar: 1, CBT11A1: 1,
                CBT11A2: 1,
                CBT12A1: 1,
                CBT12A2: 1,
                CBT13A1: 1,
                CBT13A2: 1,
                CBT14A1: 1,
                CBT14A2: 1,
                createdAt: 1, // Include createdAt for reference
              }
            },
            { $sort: { date: 1 } }
          ]),
          SensorModel4.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId // Filter by date range
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d", // Group by day
                    date: "$createdAt",
                  },
                },
                entry: { $first: "$$ROOT" }, // Keep the first document for each day
              },
            },
            {
              $replaceRoot: {
                newRoot: "$entry", // Replace the root with the stored document
              },
            },
            {
              $project: {
                _id: 0, // Exclude the default _id field
                TIME: 1, // Include TIME field
                busbar: 1,
                CBT15A1: 1,
                CBT15A2: 1,
                CBT16A1: 1,
                CBT16A2: 1,
                created: 1,
              }
            },
            { $sort: { date: 1 } }
          ]),
          SensorModel5.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId // Filter by date range
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d", // Group by day
                    date: "$createdAt",
                  },
                },
                entry: { $first: "$$ROOT" }, // Keep the first document for each day
              },
            },
            {
              $replaceRoot: {
                newRoot: "$entry", // Replace the root with the stored document
              },
            },
            {
              $project: {
                _id: 0, // Exclude the default _id field
                TIME: 1, // Include TIME field
                busbar: 1,
                CBT17A1: 1,
                CBT17A2: 1,
                CBT18A1: 1,
                CBT18A2: 1,
                CBT19A1: 1,
                CBT19A2: 1,
                created: 1,
              }
            },
            { $sort: { date: 1 } }
          ]),
          SensorModel6.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId // Filter by date range
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d", // Group by day
                    date: "$createdAt",
                  },
                },
                entry: { $first: "$$ROOT" }, // Keep the first document for each day
              },
            },
            {
              $replaceRoot: {
                newRoot: "$entry", // Replace the root with the stored document
              },
            },
            {
              $project: {
                _id: 0, // Exclude the default _id field
                TIME: 1, // Include TIME field
                busbar: 1, CBT20A1: 1,
                CBT20A2: 1,
                CBT21A1: 1,
                CBT21A2: 1,
                CBT22A1: 1,
                CBT22A2: 1,
                CBT23A1: 1,
                CBT23A2: 1,
                CBT24A1: 1,
                CBT24A2: 1,
                CBT25A1: 1,
                CBT25A2: 1,
                CBT26A1: 1,
                CBT26A2: 1,
                CBT27A1: 1,
                CBT27A2: 1,
                created: 1,
              }
            },
            { $sort: { date: 1 } }
          ]),
          SensorModel7.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId // Filter by date range
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d", // Group by day
                    date: "$createdAt",
                  },
                },
                entry: { $first: "$$ROOT" }, // Keep the first document for each day
              },
            },
            {
              $replaceRoot: {
                newRoot: "$entry", // Replace the root with the stored document
              },
            },
            {
              $project: {
                _id: 0, // Exclude the default _id field
                TIME: 1, // Include TIME field
                busbar: 1, CBT1B1: 1,
                CBT1B2: 1,
                CBT2B1: 1,
                CBT2B2: 1,
                CBT3B1: 1,
                CBT3B2: 1,
                CBT4B1: 1,
                CBT4B2: 1,
                CBT5B1: 1,
                CBT5B2: 1,
                CBT6B1: 1,
                CBT6B2: 1,
                CBT7B1: 1,
                CBT7B2: 1,
                CBT8B1: 1,
                CBT8B2: 1,
                CBT9B1: 1,
                CBT9B2: 1,
                CBT10B1: 1,
                CBT10B2: 1,
                created: 1,
              }
            },
            { $sort: { date: 1 } }
          ]),
          SensorModel8.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId // Filter by date range
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d", // Group by day
                    date: "$createdAt",
                  },
                },
                entry: { $first: "$$ROOT" }, // Keep the first document for each day
              },
            },
            {
              $replaceRoot: {
                newRoot: "$entry", // Replace the root with the stored document
              },
            },
            {
              $project: {
                _id: 0, // Exclude the default _id field
                TIME: 1, // Include TIME field
                busbar: 1, CBT11B1: 1,
                CBT11B2: 1,
                CBT12B1: 1,
                CBT12B2: 1,
                CBT13B1: 1,
                CBT13B2: 1,
                CBT14B1: 1,
                CBT14B2: 1,
                created: 1,
              }
            },
            { $sort: { date: 1 } }
          ]),
          SensorModel9.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId // Filter by date range
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d", // Group by day
                    date: "$createdAt",
                  },
                },
                entry: { $first: "$$ROOT" }, // Keep the first document for each day
              },
            },
            {
              $replaceRoot: {
                newRoot: "$entry", // Replace the root with the stored document
              },
            },
            {
              $project: {
                _id: 0, // Exclude the default _id field
                TIME: 1, // Include TIME field
                busbar: 1, CBT15B1: 1,
                CBT15B2: 1,
                CBT16B1: 1,
                CBT16B2: 1,
                CBT17B1: 1,
                CBT17B2: 1,
                CBT18B1: 1,
                CBT18B2: 1,
                created: 1,
              }
            },
            { $sort: { date: 1 } }
          ]),
          SensorModel10.aggregate([
            {
              $match: {
                createdAt: { $gte: date1, $lt: date2 }, id: userId // Filter by date range
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%m-%d", // Group by day
                    date: "$createdAt",
                  },
                },
                entry: { $first: "$$ROOT" }, // Keep the first document for each day
              },
            },
            {
              $replaceRoot: {
                newRoot: "$entry", // Replace the root with the stored document
              },
            },
            {
              $project: {
                _id: 0, // Exclude the default _id field
                TIME: 1, // Include TIME field
                busbar: 1, CBT19B1: 1,
                CBT19B2: 1,
                CBT20B1: 1,
                CBT20B2: 1,
                CBT21B1: 1,
                CBT21B2: 1,
                CBT22B1: 1,
                CBT22B2: 1,
                CBT23B1: 1,
                CBT23B2: 1,
                CBT24B1: 1,
                CBT24B2: 1,
                created: 1,
              }
            },
            { $sort: { date: 1 } }
          ])
        ]);

        const combinedGroupedData = allGroupedData.flat();


        if (combinedGroupedData.length === 0) {
          return res.status(404).json({ error: "No data found for the given date range" });
        }

        return res.status(200).json(combinedGroupedData);
      }

    }

    // Handle case for a specific key
    const model = findModelByKey(key);
    if (!model) {
      return res.status(404).json({ error: "Key not found in any model" });
    }

    const data = await model.find({
      createdAt: { $gte: date1, $lte: date2 },
      [key]: { $exists: true },
    }).lean();

    if (data.length === 0) {
      return res.status(404).json({ error: "No data found for the given key" });
    }

    if (average === "Day") {
      const groupedData = await model.aggregate([
        {
          $match: {
            createdAt: { $gte: date1, $lt: date2 }, id: userId
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            TIME: { $first: '$TIME' },
            [key]: { $first: `$${key}` } // Using dynamic key
          }
        },
        {
          $project: {
            _id: 0,
            [key]: 1,
            date: '$_id',
            TIME: 1

          }
        }
      ]);
      return res.status(200).json(groupedData);
    } else if (average === "Hour") {
      const groupedData = await model.aggregate([
        {
          $match: {
            createdAt: { $gte: date1, $lt: date2 }, id: userId
          },
        },
        {
          $project: {

            TIME: 1,


            createdAt: 1
          }
        },
        {
          $sort: {
            createdAt: 1
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%dT%H:00:00',
                date: '$createdAt'
              }
            },
            [key]: {
              $first: `$${key}` // Using dynamic key
            },
            TIME: {
              $first: '$TIME'
            }
          }
        },
        {
          $project: {
            _id: 0,
            TIME: 1,
            [key]: 1,
            hour: '$_id'
          }
        },
        {
          $sort: {
            hour: 1
          }
        }
      ]);
      return res.status(200).json(groupedData);
    }

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const fetchSensorDataByDate = async (req, res) => {
  const { key, startDate, endDate } = req.query;
  const userId = req.headers['x-user-id'];
  // Log the incoming parameters for debugging
  console.log("Received parameters:", { key, startDate, endDate });

  const modelMap = {
    model1: SensorModel1,
    model2: SensorModel2,
    model3: SensorModel3,
    model4: SensorModel4,
    model5: SensorModel5,
    model6: SensorModel6,
    model7: SensorModel7,
    model8: SensorModel8,
    model9: SensorModel9,
    model10: SensorModel10,
  };

  const models = {
    model1: [
      "CBT1A1", "CBT1A2", "CBT2A1", "CBT2A2",
      "CBT3A1", "CBT3A2", "CBT4A1", "CBT4A2",
      "CBT5A1", "CBT5A2", "CBT6A1", "CBT6A2",
      "CBT7A1", "CBT7A2"
    ],
    model2: [
      "CBT8A1", "CBT8A2", "CBT9A1", "CBT9A2",
      "CBT10A1", "CBT10A2"
    ],
    model3: [
      "CBT11A1", "CBT11A2", "CBT12A1", "CBT12A2",
      "CBT13A1", "CBT13A2", "CBT14A1", "CBT14A2"
    ],
    model4: [
      "CBT15A1", "CBT15A2", "CBT16A1", "CBT16A2"
    ],
    model5: [
      "CBT17A1", "CBT17A2", "CBT18A1", "CBT18A2",
      "CBT19A1", "CBT19A2"
    ],
    model6: [
      "CBT20A1", "CBT20A2", "CBT21A1", "CBT21A2",
      "CBT22A1", "CBT22A2", "CBT23A1", "CBT23A2",
      "CBT24A1", "CBT24A2", "CBT25A1", "CBT25A2",
      "CBT26A1", "CBT26A2", "CBT27A1", "CBT27A2"
    ],
    model7: [
      "CBT1B1", "CBT1B2", "CBT2B1", "CBT2B2",
      "CBT3B1", "CBT3B2", "CBT4B1", "CBT4B2",
      "CBT5B1", "CBT5B2", "CBT6B1", "CBT6B2",
      "CBT7B1", "CBT7B2", "CBT8B1", "CBT8B2",
      "CBT9B1", "CBT9B2", "CBT10B1", "CBT10B2"
    ],
    model8: [
      "CBT11B1", "CBT11B2", "CBT12B1", "CBT12B2",
      "CBT13B1", "CBT13B2", "CBT14B1", "CBT14B2"
    ],
    model9: [
      "CBT15B1", "CBT15B2", "CBT16B1", "CBT16B2",
      "CBT17B1", "CBT17B2", "CBT18B1", "CBT18B2"
    ],
    model10: [
      "CBT19B1", "CBT19B2", "CBT20B1", "CBT20B2",
      "CBT21B1", "CBT21B2", "CBT22B1", "CBT22B2",
      "CBT23B1", "CBT23B2", "CBT24B1", "CBT24B2",
      "CBT25B1", "CBT25B2", "CBT26B1", "CBT26B2",
      "CBT27B1", "CBT27B2"
    ]
  };

  const findModelByKey = (key) => {
    for (const [name, keys] of Object.entries(models)) {
      if (keys.includes(key)) return modelMap[name];
    }
    return null;
  };

  try {
    const date1 = new Date(startDate);
    const date2 = new Date(endDate);

    // Log the parsed dates
    console.log("Parsed dates:", { date1, date2 });

    if (key === "All-Data") {
      console.log("Key is 'All-Date', proceeding with data retrieval.");

      const allData = await Promise.all(
        Object.values(modelMap).map((model) =>
          model.find({}).lean()
        )
      );
      const combinedData = allData.flat();

      if (combinedData.length === 0) {
        return res.status(404).json({ error: "No data found for the given date range" });
      }

      const allGroupedData = await Promise.all([
        SensorModel1.aggregate([
          {
            $match: {
              createdAt: { $gte: date1, $lt: date2 }, id: userId
            },
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT1A1: 1,
              CBT1A2: 1,
              CBT2A1: 1,
              CBT2A2: 1,
              CBT3A1: 1,
              CBT3A2: 1,
              CBT4A1: 1,
              CBT4A2: 1,
              CBT5A1: 1,
              CBT5A2: 1,
              CBT6A1: 1,
              CBT6A2: 1,
              CBT7A1: 1,
              CBT7A2: 1,
            },
          },
        ]),
        SensorModel2.aggregate([
          {
            $match: {
              createdAt: { $gte: date1, $lt: date2 }, id: userId
            },
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT8A1: 1,
              CBT8A2: 1,
              CBT9A1: 1,
              CBT9A2: 1,
              CBT10A1: 1,
              CBT10A2: 1,
            },
          },
        ]),
        SensorModel3.aggregate([
          {
            $match: {
              createdAt: { $gte: date1, $lt: date2 }, id: userId
            },
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT11A1: 1,
              CBT11A2: 1,
              CBT12A1: 1,
              CBT12A2: 1,
              CBT13A1: 1,
              CBT13A2: 1,
              CBT14A1: 1,
              CBT14A2: 1,
            },
          },
        ]),
        SensorModel4.aggregate([
          {
            $match: {
              createdAt: { $gte: date1, $lt: date2 }, id: userId
            },
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT15A1: 1,
              CBT15A2: 1,
              CBT16A1: 1,
              CBT16A2: 1
            },
          },
        ]),
        SensorModel5.aggregate([
          {
            $match: {
              createdAt: { $gte: date1, $lt: date2 }, id: userId
            },
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT17A1: 1,
              CBT17A2: 1,
              CBT18A1: 1,
              CBT18A2: 1,
              CBT19A1: 1,
              CBT19A2: 1,
            },
          },
        ]),
        SensorModel6.aggregate([
          {
            $match: {
              createdAt: { $gte: date1, $lt: date2 }, id: userId
            },
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT20A1: 1,
              CBT20A2: 1,
              CBT21A1: 1,
              CBT21A2: 1,
              CBT22A1: 1,
              CBT22A2: 1,
              CBT23A1: 1,
              CBT23A2: 1,
              CBT24A1: 1,
              CBT24A2: 1,
              CBT25A1: 1,
              CBT25A2: 1,
              CBT26A1: 1,
              CBT26A2: 1,
              CBT27A1: 1,
              CBT27A2: 1,
            },
          },
        ]),
        SensorModel7.aggregate([
          {
            $match: {
              createdAt: { $gte: date1, $lt: date2 }, id: userId
            },
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT1B1: 1,
              CBT1B2: 1,
              CBT2B1: 1,
              CBT2B2: 1,
              CBT3B1: 1,
              CBT3B2: 1,
              CBT4B1: 1,
              CBT4B2: 1,
              CBT5B1: 1,
              CBT5B2: 1,
              CBT6B1: 1,
              CBT6B2: 1,
              CBT7B1: 1,
              CBT7B2: 1,
              CBT8B1: 1,
              CBT8B2: 1,
              CBT9B1: 1,
              CBT9B2: 1,
              CBT10B1: 1,
              CBT10B2: 1,
            },
          },
        ]),
        SensorModel8.aggregate([
          {
            $match: {
              createdAt: { $gte: date1, $lt: date2 }, id: userId
            },
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT11B1: 1,
              CBT11B2: 1,
              CBT12B1: 1,
              CBT12B2: 1,
              CBT13B1: 1,
              CBT13B2: 1,
              CBT14B1: 1,
              CBT14B2: 1,
            },
          },
        ]),
        SensorModel9.aggregate([
          {
            $match: {
              createdAt: { $gte: date1, $lt: date2 }, id: userId
            },
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT15B1: 1,
              CBT15B2: 1,
              CBT16B1: 1,
              CBT16B2: 1,
              CBT17B1: 1,
              CBT17B2: 1,
              CBT18B1: 1,
              CBT18B2: 1,

            },
          },
        ]),
        SensorModel10.aggregate([
          {
            $match: {
              createdAt: { $gte: date1, $lt: date2 }, id: userId
            },
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT19B1: 1,
              CBT19B2: 1,
              CBT20B1: 1,
              CBT20B2: 1,
              CBT21B1: 1,
              CBT21B2: 1,
              CBT22B1: 1,
              CBT22B2: 1,
              CBT23B1: 1,
              CBT23B2: 1,
              CBT24B1: 1,
              CBT24B2: 1,
            },
          },
        ]),
      ]);

      const combinedGroupedData = allGroupedData.flat();

      if (combinedGroupedData.length === 0) {
        return res.status(404).json({ error: "No data found for the given date range" });
      }

      return res.status(200).json(combinedGroupedData);
    } else {
      console.log("Key is not 'All-Date', checking for specific key.");

      if (key !== "All-Data") {

        const model = findModelByKey(key);
        if (!model) {
          return res.status(404).json({ error: "Key not found in any model" });
        }
        const data = await model.find({
          createdAt: { $gte: date1, $lte: date2 },
          [key]: { $exists: true },
        }).lean();


        if (data.length === 0) {
          return res.status(404).json({ error: "No data found for the given key" });
        }
        const groupedData = await model.aggregate([
          {
            $match: {
              createdAt: { $gte: date1, $lt: date2 }, id: userId
            },
          },
          {
            $project: {
              _id: 0,
              busbar: 1,
              [key]: 1,
              TIME: 1
            }
          }
        ]);
        return res.status(200).json(groupedData);
      }
    }
  }
  catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const fetchSensorDataBylimit = async (req, res) => {
  const { key, limit } = req.query;
  const userId = req.headers['x-user-id'];
  const modelMap = {
    model1: SensorModel1,
    model2: SensorModel2,
    model3: SensorModel3,
    model4: SensorModel4,
    model5: SensorModel5,
    model6: SensorModel6,
    model7: SensorModel7,
    model8: SensorModel8,
    model9: SensorModel9,
    model10: SensorModel10,
  };

  const models = {
    model1: [
      "CBT1A1", "CBT1A2", "CBT2A1", "CBT2A2",
      "CBT3A1", "CBT3A2", "CBT4A1", "CBT4A2",
      "CBT5A1", "CBT5A2", "CBT6A1", "CBT6A2",
      "CBT7A1", "CBT7A2"
    ],
    model2: [
      "CBT8A1", "CBT8A2", "CBT9A1", "CBT9A2",
      "CBT10A1", "CBT10A2"
    ],
    model3: [
      "CBT11A1", "CBT11A2", "CBT12A1", "CBT12A2",
      "CBT13A1", "CBT13A2", "CBT14A1", "CBT14A2"
    ],
    model4: [
      "CBT15A1", "CBT15A2", "CBT16A1", "CBT16A2"
    ],
    model5: [
      "CBT17A1", "CBT17A2", "CBT18A1", "CBT18A2",
      "CBT19A1", "CBT19A2"
    ],
    model6: [
      "CBT20A1", "CBT20A2", "CBT21A1", "CBT21A2",
      "CBT22A1", "CBT22A2", "CBT23A1", "CBT23A2",
      "CBT24A1", "CBT24A2", "CBT25A1", "CBT25A2",
      "CBT26A1", "CBT26A2", "CBT27A1", "CBT27A2"
    ],
    model7: [
      "CBT1B1", "CBT1B2", "CBT2B1", "CBT2B2",
      "CBT3B1", "CBT3B2", "CBT4B1", "CBT4B2",
      "CBT5B1", "CBT5B2", "CBT6B1", "CBT6B2",
      "CBT7B1", "CBT7B2", "CBT8B1", "CBT8B2",
      "CBT9B1", "CBT9B2", "CBT10B1", "CBT10B2"
    ],
    model8: [
      "CBT11B1", "CBT11B2", "CBT12B1", "CBT12B2",
      "CBT13B1", "CBT13B2", "CBT14B1", "CBT14B2"
    ],
    model9: [
      "CBT15B1", "CBT15B2", "CBT16B1", "CBT16B2",
      "CBT17B1", "CBT17B2", "CBT18B1", "CBT18B2"
    ],
    model10: [
      "CBT19B1", "CBT19B2", "CBT20B1", "CBT20B2",
      "CBT21B1", "CBT21B2", "CBT22B1", "CBT22B2",
      "CBT23B1", "CBT23B2", "CBT24B1", "CBT24B2",
      "CBT25B1", "CBT25B2", "CBT26B1", "CBT26B2",
      "CBT27B1", "CBT27B2"
    ]
  };

  const findModelByKey = (key) => {
    for (const [name, keys] of Object.entries(models)) {
      if (keys.includes(key)) return modelMap[name];
    }
    return null;
  };

  try {

    const limitNumber = parseInt(limit, 10) || 10;



    if (key === "All-Data") {
      console.log("Key is 'All-Date', proceeding with data retrieval.");

      const allData = await Promise.all(
        Object.values(modelMap).map((model) =>
          model.find({}).lean()
        )
      );
      const combinedData = allData.flat();

      if (combinedData.length === 0) {
        return res.status(404).json({ error: "No data found for the given date range" });
      }

      const allGroupedData = await Promise.all([
        SensorModel1.aggregate([
          {
            '$sort': {
              'createdAt': -1
            }
          },
          {
            '$limit': limitNumber // Use the parsed limit directly
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT1A1: 1,
              CBT1A2: 1,
              CBT2A1: 1,
              CBT2A2: 1,
              CBT3A1: 1,
              CBT3A2: 1,
              CBT4A1: 1,
              CBT4A2: 1,
              CBT5A1: 1,
              CBT5A2: 1,
              CBT6A1: 1,
              CBT6A2: 1,
              CBT7A1: 1,
              CBT7A2: 1,
            },
          },
        ]),
        SensorModel2.aggregate([
          {
            '$sort': {
              'createdAt': -1
            }
          }, {
            '$limit': limitNumber
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT8A1: 1,
              CBT8A2: 1,
              CBT9A1: 1,
              CBT9A2: 1,
              CBT10A1: 1,
              CBT10A2: 1,
            },
          },
        ]),
        SensorModel3.aggregate([
          {
            '$sort': {
              'createdAt': -1
            }
          }, {
            '$limit': limitNumber
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT11A1: 1,
              CBT11A2: 1,
              CBT12A1: 1,
              CBT12A2: 1,
              CBT13A1: 1,
              CBT13A2: 1,
              CBT14A1: 1,
              CBT14A2: 1,
            },
          },
        ]),
        SensorModel4.aggregate([
          {
            '$sort': {
              'createdAt': -1
            }
          }, {
            '$limit': limitNumber
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT15A1: 1,
              CBT15A2: 1,
              CBT16A1: 1,
              CBT16A2: 1
            },
          },
        ]),
        SensorModel5.aggregate([
          {
            '$sort': {
              'createdAt': -1
            }
          }, {
            '$limit': limitNumber
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT17A1: 1,
              CBT17A2: 1,
              CBT18A1: 1,
              CBT18A2: 1,
              CBT19A1: 1,
              CBT19A2: 1,
            },
          },
        ]),
        SensorModel6.aggregate([
          {
            '$sort': {
              'createdAt': -1
            }
          }, {
            '$limit': limitNumber
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT20A1: 1,
              CBT20A2: 1,
              CBT21A1: 1,
              CBT21A2: 1,
              CBT22A1: 1,
              CBT22A2: 1,
              CBT23A1: 1,
              CBT23A2: 1,
              CBT24A1: 1,
              CBT24A2: 1,
              CBT25A1: 1,
              CBT25A2: 1,
              CBT26A1: 1,
              CBT26A2: 1,
              CBT27A1: 1,
              CBT27A2: 1,
            },
          },
        ]),
        SensorModel7.aggregate([
          {
            '$sort': {
              'createdAt': -1
            }
          }, {
            '$limit': limitNumber
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT1B1: 1,
              CBT1B2: 1,
              CBT2B1: 1,
              CBT2B2: 1,
              CBT3B1: 1,
              CBT3B2: 1,
              CBT4B1: 1,
              CBT4B2: 1,
              CBT5B1: 1,
              CBT5B2: 1,
              CBT6B1: 1,
              CBT6B2: 1,
              CBT7B1: 1,
              CBT7B2: 1,
              CBT8B1: 1,
              CBT8B2: 1,
              CBT9B1: 1,
              CBT9B2: 1,
              CBT10B1: 1,
              CBT10B2: 1,
            },
          },
        ]),
        SensorModel8.aggregate([
          {
            '$sort': {
              'createdAt': -1
            }
          }, {
            '$limit': limitNumber
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT11B1: 1,
              CBT11B2: 1,
              CBT12B1: 1,
              CBT12B2: 1,
              CBT13B1: 1,
              CBT13B2: 1,
              CBT14B1: 1,
              CBT14B2: 1,
            },
          },
        ]),
        SensorModel9.aggregate([
          {
            '$sort': {
              'createdAt': -1
            }
          }, {
            '$limit': limitNumber
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT15B1: 1,
              CBT15B2: 1,
              CBT16B1: 1,
              CBT16B2: 1,
              CBT17B1: 1,
              CBT17B2: 1,
              CBT18B1: 1,
              CBT18B2: 1,

            },
          },
        ]),
        SensorModel10.aggregate([
          {
            '$sort': {
              'createdAt': -1
            }
          }, {
            '$limit': limitNumber
          },
          {
            $project: {
              _id: 0,
              TIME: 1,
              busbar: 1,
              CBT19B1: 1,
              CBT19B2: 1,
              CBT20B1: 1,
              CBT20B2: 1,
              CBT21B1: 1,
              CBT21B2: 1,
              CBT22B1: 1,
              CBT22B2: 1,
              CBT23B1: 1,
              CBT23B2: 1,
              CBT24B1: 1,
              CBT24B2: 1,
            },
          },
        ]),
      ]);

      const combinedGroupedData = allGroupedData.flat();

      if (combinedGroupedData.length === 0) {
        return res.status(404).json({ error: "No data found for the given date range" });
      }

      return res.status(200).json(combinedGroupedData);
    } else {
      console.log("Key is not 'All-Date', checking for specific key.");

      if (key !== "All-Data") {

        const model = findModelByKey(key);
        if (!model) {
          return res.status(404).json({ error: "Key not found in any model" });
        }
        const data = await model.find({
          createdAt: -1,
          [key]: { $exists: true },
        }).lean();


        if (data.length === 0) {
          return res.status(404).json({ error: "No data found for the given key" });
        }
        const groupedData = await model.aggregate([
          {
            '$sort': {
              'createdAt': -1
            }
          }, {
            '$limit': limitNumber
          },
          {
            $project: {
              _id: 0,
              busbar: 1,
              [key]: 1,
              TIME: 1
            }
          }
        ]);
        return res.status(200).json(groupedData);
      }
    }
  }
  catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// for analytics page
export const fetchSensorDataByaveragegraph = async (req, res) => {
  const { key, startDate, endDate, average } = req.query;
  const userId = req.headers['x-user-id'];
  // console.log("userId", userId);
  // Map keys to their respective models
  const modelMap = {
    sensormodel1: SensorModel1,
    sensormodel2: SensorModel2,
    sensormodel3: SensorModel3,
    sensormodel4: SensorModel4,
    sensormodel5: SensorModel5,
    sensormodel6: SensorModel6,
    sensormodel7: SensorModel7,
    sensormodel8: SensorModel8,
    sensormodel9: SensorModel9,
    sensormodel10: SensorModel10,
  };

  try {
    const date1 = new Date(startDate);
    const date2 = new Date(endDate);

    // Log dates for debugging
    console.log("Start Date:", date1);
    console.log("End Date:", date2);

    // Get the model based on the key
    const model = modelMap[key];
    if (!model) {
      return res.status(404).json({ error: "Invalid key. Key must be between sensormodel1 and sensormodel10." });
    }

    // Fetch data based on the average type (Hour, Day, or Minute)
    let groupedData;
    if (average === "Minute") {
      groupedData = await model.aggregate([
        {
          $match: {
            createdAt: { $gte: date1, $lte: date2 },
            id: userId
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%dT%H:%M:00", // Minute-level grouping
                date: "$createdAt",
              },
            },
            TIME: { $first: "$TIME" },
            ...Object.keys(model.schema.paths).reduce((acc, field) => {
              if (field !== "_id" && field !== "createdAt" && field !== "TIME" && field !== "busbar" && field !== "id" && field !== "__v" && field !== "updatedAt") {
                acc[field] = {
                  $avg: {
                    $cond: {
                      if: {
                        $and: [
                          { $ne: [`$${field}`, null] }, // Skip null values
                          { $ne: [`$${field}`, ""] }, // Skip empty strings
                          { $regexMatch: { input: `$${field}`, regex: /^-?\d+(\.\d+)?$/ } }, // Check if the value is a valid number string
                        ],
                      },
                      then: { $toDouble: `$${field}` }, // Convert to double if valid
                      else: null, // Skip invalid values
                    },
                  },
                };
              }
              return acc;
            }, {}),
          },
        },
        {
          $project: {
            _id: 0,
            TIME: 1,
            timestamp: "$_id",
            ...Object.keys(model.schema.paths).reduce((acc, field) => {
              if (field !== "_id" && field !== "createdAt" && field !== "TIME" && field !== "busbar" && field !== "id" && field !== "__v" && field !== "updatedAt") {
                acc[field] = 1;
              }
              return acc;
            }, {}),
          },
        },
        { $sort: { timestamp: 1 } },
      ]);
    } else if (average === "Hour") {
      groupedData = await model.aggregate([
        {
          $match: {
            createdAt: { $gte: date1, $lte: date2 }, id: userId
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%dT%H:00:00", // Hour-level grouping
                date: "$createdAt",
              },
            },
            TIME: { $first: "$TIME" },
            ...Object.keys(model.schema.paths).reduce((acc, field) => {
              if (field !== "_id" && field !== "createdAt" && field !== "TIME" && field !== "busbar" && field !== "id" && field !== "__v" && field !== "updatedAt") {
                acc[field] = {
                  $avg: {
                    $cond: {
                      if: {
                        $and: [
                          { $ne: [`$${field}`, null] }, // Skip null values
                          { $ne: [`$${field}`, ""] }, // Skip empty strings
                          { $regexMatch: { input: `$${field}`, regex: /^-?\d+(\.\d+)?$/ } }, // Check if the value is a valid number string
                        ],
                      },
                      then: { $toDouble: `$${field}` }, // Convert to double if valid
                      else: null, // Skip invalid values
                    },
                  },
                };
              }
              return acc;
            }, {}),
          },
        },
        {
          $project: {
            _id: 0,
            TIME: 1,
            timestamp: "$_id",
            ...Object.keys(model.schema.paths).reduce((acc, field) => {
              if (field !== "_id" && field !== "createdAt" && field !== "TIME" && field !== "busbar" && field !== "id" && field !== "__v" && field !== "updatedAt") {
                acc[field] = 1;
              }
              return acc;
            }, {}),
          },
        },
        { $sort: { timestamp: 1 } },
      ]);
    } else if (average === "Day") {
      groupedData = await model.aggregate([
        {
          $match: {
            createdAt: { $gte: date1, $lte: date2 }, id: userId
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d", // Day-level grouping
                date: "$createdAt",
              },
            },
            TIME: { $first: "$TIME" },
            ...Object.keys(model.schema.paths).reduce((acc, field) => {
              if (field !== "_id" && field !== "createdAt" && field !== "TIME" && field !== "busbar" && field !== "id" && field !== "__v" && field !== "updatedAt") {
                acc[field] = {
                  $avg: {
                    $cond: {
                      if: {
                        $and: [
                          { $ne: [`$${field}`, null] }, // Skip null values
                          { $ne: [`$${field}`, ""] }, // Skip empty strings
                          { $regexMatch: { input: `$${field}`, regex: /^-?\d+(\.\d+)?$/ } }, // Check if the value is a valid number string
                        ],
                      },
                      then: { $toDouble: `$${field}` }, // Convert to double if valid
                      else: null, // Skip invalid values
                    },
                  },
                };
              }
              return acc;
            }, {}),
          },
        },
        {
          $project: {
            _id: 0,
            TIME: 1,
            timestamp: "$_id",
            ...Object.keys(model.schema.paths).reduce((acc, field) => {
              if (field !== "_id" && field !== "createdAt" && field !== "TIME" && field !== "busbar" && field !== "id" && field !== "__v" && field !== "updatedAt") {
                acc[field] = 1;
              }
              return acc;
            }, {}),
          },
        },
        { $sort: { timestamp: 1 } },
      ]);
    } else {
      return res.status(400).json({ error: "Invalid average type. Use 'Hour', 'Day', or 'Minute'." });
    }

    if (groupedData.length === 0) {
      return res.status(404).json({ error: "No data found for the given date range." });
    }

    // Format data for charting
    const chartData = {
      labels: groupedData.map((entry) => entry.timestamp), // x-axis labels (timestamps)
      datasets: Object.keys(groupedData[0])
        .filter((key) => key !== "TIME" && key !== "timestamp")
        .map((field) => ({
          label: field, // Sensor field name (e.g., CBT1A1, CBT1A2)
          data: groupedData.map((entry) => entry[field]), // y-axis data
          // borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random color for each dataset
          // fill: false,
        })),
    };

    return res.status(200).json(chartData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const fetchSensorDataByintervalgraph = async (req, res) => {
  const { key, startDate, endDate, average } = req.query;
  const userId = req.headers['x-user-id'];
  console.log("userId for interval data", userId);
  //  console.log("Checking for userid ", userId);
  // Map keys to their respective models
  const modelMap = {
    sensormodel1: SensorModel1,
    sensormodel2: SensorModel2,
    sensormodel3: SensorModel3,
    sensormodel4: SensorModel4,
    sensormodel5: SensorModel5,
    sensormodel6: SensorModel6,
    sensormodel7: SensorModel7,
    sensormodel8: SensorModel8,
    sensormodel9: SensorModel9,
    sensormodel10: SensorModel10,
  };

  try {
    const date1 = new Date(startDate);
    const date2 = new Date(endDate);

    // Log dates for debugging
    console.log("Start Date:", date1);
    console.log("End Date:", date2);

    // Get the model based on the key
    const model = modelMap[key];
    if (!model) {
      return res.status(404).json({ error: "Invalid key. Key must be between sensormodel1 and sensormodel10." });
    }

    // Log the model being used
    console.log("Using model:", key);

    // Fetch data based on the average type (Hour, Day, or Minute)
    let groupedData;
    const matchStage = {
      createdAt: { $gte: date1, $lte: date2 },
    };

    // Log the match stage
    console.log("Match Stage:", matchStage);

    const groupStage = {
      _id: {
        $dateToString: {
          format: average === "Minute" ? "%Y-%m-%dT%H:%M:00" : average === "Hour" ? "%Y-%m-%dT%H:00:00" : "%Y-%m-%d",
          date: "$createdAt",
        },
      },
      ...Object.keys(model.schema.paths).reduce((acc, field) => {
        if (field !== "_id" && field !== "createdAt" && field !== "TIME" && field !== "busbar" && field !== "id" && field !== "__v" && field !== "updatedAt") {
          acc[field] = {
            $avg: {
              $cond: {
                if: {
                  $and: [
                    { $ne: [`$${field}`, null] }, // Skip null values
                    { $ne: [`$${field}`, ""] }, // Skip empty strings
                    { $regexMatch: { input: `$${field}`, regex: /^-?\d+(\.\d+)?$/ } }, // Check if the value is a valid number string
                  ],
                },
                then: { $toDouble: `$${field}` }, // Convert to double if valid
                else: null, // Skip invalid values
              },
            },
          };
        }
        return acc;
      }, {}),
    };

    // Log the group stage
    console.log("Group Stage:", groupStage);

    const projectStage = {
      _id: 0,
      timestamp: "$_id",
      ...Object.keys(model.schema.paths).reduce((acc, field) => {
        if (field !== "_id" && field !== "createdAt" && field !== "TIME" && field !== "busbar" && field !== "id" && field !== "__v" && field !== "updatedAt") {
          acc[field] = 1;
        }
        return acc;
      }, {}),
    };

    // Log the project stage
    console.log("Project Stage:", projectStage);

    groupedData = await model.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $project: projectStage },
      { $sort: { timestamp: 1 } },
    ]);

    // Log the grouped data for debugging
    console.log("Grouped Data:", groupedData);

    if (groupedData.length === 0) {
      return res.status(404).json({ error: "No data found for the given date range." });
    }

    // Format data for charting
    const chartData = {
      labels: groupedData.map((entry) => entry.timestamp), // x-axis labels (timestamps)
      datasets: Object.keys(groupedData[0])
        .filter((key) => key !== "timestamp") // Exclude the timestamp field
        .map((field) => ({
          label: field, // Sensor field name (e.g., CBT1A1, CBT1A2)
          data: groupedData.map((entry) => entry[field]), // y-axis data
        })),
    };

    return res.status(200).json(chartData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


// export const fetchSensorDataByintervalgraph = async (req, res) => {
//   const { key, startDate, endDate, average } = req.query;
//   const userId = req.headers['x-user-id'];
//   // Map keys to their respective models
//   const modelMap = {
//     sensormodel1: SensorModel1,
//     sensormodel2: SensorModel2,
//     sensormodel3: SensorModel3,
//     sensormodel4: SensorModel4,
//     sensormodel5: SensorModel5,
//     sensormodel6: SensorModel6,
//     sensormodel7: SensorModel7,
//     sensormodel8: SensorModel8,
//     sensormodel9: SensorModel9,
//     sensormodel10: SensorModel10,
//   };

//   try {
//     const date1 = new Date(startDate);
//     const date2 = new Date(endDate);

//     // Log dates for debugging
//     console.log("Start Date:", date1);
//     console.log("End Date:", date2);

//     // Get the model based on the key
//     const model = modelMap[key];
//     if (!model) {
//       return res.status(404).json({ error: "Invalid key. Key must be between sensormodel1 and sensormodel10." });
//     }

//     // Log the model being used
//     console.log("Using model:", key);

//     // Fetch data based on the average type (Hour, Day, or Minute)
//     let groupedData;
//     const matchStage = {
//       createdAt: { $gte: date1, $lte: date2 }, id: userId
//     };

//     // Log the match stage
//     console.log("Match Stage:", matchStage);

//     const groupStage = {
//       _id: {
//         $dateToString: {
//           format: average === "Minute" ? "%Y-%m-%dT%H:%M:00" : average === "Hour" ? "%Y-%m-%dT%H:00:00" : "%Y-%m-%d",
//           date: "$createdAt",
//         },
//       },
//       ...Object.keys(model.schema.paths).reduce((acc, field) => {
//         if (field !== "_id" && field !== "createdAt" && field !== "TIME" && field !== "busbar" && field !== "id" && field !== "__v" && field !== "updatedAt") {
//           acc[field] = {
//             $avg: {
//               $cond: {
//                 if: {
//                   $and: [
//                     { $ne: [`$${field}`, null] }, // Skip null values
//                     { $ne: [`$${field}`, ""] }, // Skip empty strings
//                     { $regexMatch: { input: `$${field}`, regex: /^-?\d+(\.\d+)?$/ } }, // Check if the value is a valid number string
//                   ],
//                 },
//                 then: { $toDouble: `$${field}` }, // Convert to double if valid
//                 else: null, // Skip invalid values
//               },
//             },
//           };
//         }
//         return acc;
//       }, {}),
//     };

//     // Log the group stage
//     console.log("Group Stage:", groupStage);

//     const projectStage = {
//       _id: 0,
//       timestamp: "$_id",
//       ...Object.keys(model.schema.paths).reduce((acc, field) => {
//         if (field !== "_id" && field !== "createdAt" && field !== "TIME" && field !== "busbar" && field !== "id" && field !== "__v" && field !== "updatedAt") {
//           acc[field] = 1;
//         }
//         return acc;
//       }, {}),
//     };

//     // Log the project stage
//     console.log("Project Stage:", projectStage);

//     groupedData = await model.aggregate([
//       { $match: matchStage },
//       { $group: groupStage },
//       { $project: projectStage },
//       { $sort: { timestamp: 1 } },
//     ]);

//     // Log the grouped data for debugging
//     console.log("Grouped Data:", groupedData);

//     if (groupedData.length === 0) {
//       return res.status(404).json({ error: "No data found for the given date range." });
//     }

//     // Format data for charting
//     const chartData = {
//       labels: groupedData.map((entry) => entry.timestamp), // x-axis labels (timestamps)
//       datasets: Object.keys(groupedData[0])
//         .filter((key) => key !== "timestamp") // Exclude the timestamp field
//         .map((field) => ({
//           label: field, // Sensor field name (e.g., CBT1A1, CBT1A2)
//           data: groupedData.map((entry) => entry[field]), // y-axis data
//         })),
//     };

//     return res.status(200).json(chartData);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

export const fetchSensorDataByDategraph = async (req, res) => {
  const { key, startDate, endDate } = req.query;
  const userId = req.headers['x-user-id'];
  // Map keys to their respective models
  const modelMap = {
    sensormodel1: SensorModel1,
    sensormodel2: SensorModel2,
    sensormodel3: SensorModel3,
    sensormodel4: SensorModel4,
    sensormodel5: SensorModel5,
    sensormodel6: SensorModel6,
    sensormodel7: SensorModel7,
    sensormodel8: SensorModel8,
    sensormodel9: SensorModel9,
    sensormodel10: SensorModel10,
  };

  try {
    const date1 = new Date(startDate);
    const date2 = new Date(endDate);

    // Log dates for debugging
    console.log("Start Date:", date1);
    console.log("End Date:", date2);

    // Get the model based on the key
    const model = modelMap[key];
    if (!model) {
      return res.status(404).json({ error: "Invalid key. Key must be between sensormodel1 and sensormodel10." });
    }

    // Log the model being used
    console.log("Using model:", key);

    // Fetch all raw data within the date range
    const rawData = await model.find({
      createdAt: { $gte: date1, $lte: date2 },
      id: userId// Filter data between startDate and endDate
    }).sort({ createdAt: 1 }); // Sort by createdAt in ascending order

    // Log the raw data for debugging
    console.log("Raw Data:", rawData);

    if (rawData.length === 0) {
      return res.status(404).json({ error: "No data found for the given date range." });
    }

    // Extract unique timestamps for labels
    const labels = rawData.map((entry) => entry.createdAt.toISOString());

    // Initialize datasets
    const datasets = Object.keys(model.schema.paths)
      .filter((field) => field.startsWith("CBT")) // Only include CBT fields
      .map((field) => ({
        label: field,
        data: rawData.map((entry) => parseFloat(entry[field])), // Extract and parse sensor values
      }));

    // Format data for charting
    const chartData = {
      labels,
      datasets,
    };

    return res.status(200).json(chartData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const fetchSensorDataBylimitgraph = async (req, res) => {
  const { key, limit } = req.query;
  const userId = req.headers['x-user-id'];

  const modelMap = {
    sensormodel1: SensorModel1,
    sensormodel2: SensorModel2,
    sensormodel3: SensorModel3,
    sensormodel4: SensorModel4,
    sensormodel5: SensorModel5,
    sensormodel6: SensorModel6,
    sensormodel7: SensorModel7,
    sensormodel8: SensorModel8,
    sensormodel9: SensorModel9,
    sensormodel10: SensorModel10,
  };

  try {
    const limitNumber = parseInt(limit, 10) || 10;
    if (isNaN(limitNumber) || limitNumber <= 0) {
      return res.status(400).json({ error: "Invalid limit value" });
    }

    // Check if the key is a single model or a range
    if (key.startsWith("sensormodel")) {
      // Handle single model or range
      const modelKeys = key.split("-"); // Split if it's a range (e.g., "sensormodel1-sensormodel4")
      const startModel = modelKeys[0];
      const endModel = modelKeys[1] || startModel; // If no range, use the same model

      // Extract model numbers from keys (e.g., "sensormodel1" -> 1)
      const startIndex = parseInt(startModel.replace("sensormodel", ""), 10);
      const endIndex = parseInt(endModel.replace("sensormodel", ""), 10);

      if (isNaN(startIndex) || isNaN(endIndex) || startIndex > endIndex || startIndex < 1 || endIndex > 10) {
        return res.status(400).json({ error: "Invalid model range" });
      }

      // Fetch data for the specified range of models
      const modelsToFetch = [];
      for (let i = startIndex; i <= endIndex; i++) {
        const modelKey = `sensormodel${i}`;
        if (modelMap[modelKey]) {
          modelsToFetch.push(modelMap[modelKey]);
        }
      }

      if (modelsToFetch.length === 0) {
        return res.status(404).json({ error: "No valid models found for the given range" });
      }

      // Fetch and format data for each model
      const allChartData = await Promise.all(
        modelsToFetch.map(async (model) => {
          // Define the aggregation pipeline
          const projectStage = {
            _id: 0,

            timestamp: "$TIME", // Use the TIME field as the timestamp
            ...Object.keys(model.schema.paths).reduce((acc, field) => {
              if (
                field !== "_id" &&
                field !== "createdAt" &&
                field !== "TIME" &&
                field !== "busbar" &&
                field !== "id" &&
                field !== "__v" &&
                field !== "updatedAt"
              ) {
                acc[field] = 1; // Include all other fields in the projection
              }
              return acc;
            }, {}),
          };

          const groupedData = await model.aggregate([
            { $match: { id: userId, } },
            { $sort: { TIME: -1 } }, // Sort by TIME in descending order
            { $limit: limitNumber }, // Apply limit
            { $project: projectStage }, // Project only required fields
            { $sort: { timestamp: 1 } }, // Sort by timestamp in ascending order for charting
          ]);

          if (groupedData.length === 0) {
            return null; // No data found for this model
          }

          // Format data for charting
          const chartData = {
            labels: groupedData.map((entry) => entry.timestamp), // x-axis labels (timestamps)
            datasets: Object.keys(groupedData[0])
              .filter((key) => key !== "timestamp") // Exclude the timestamp field
              .map((field) => ({
                label: field, // Sensor field name (e.g., CBT1A1, CBT1A2)
                data: groupedData.map((entry) => parseFloat(entry[field])), // Convert data to numbers
              })),
          };

          return chartData;
        })
      );

      // Filter out null results (models with no data)
      const filteredChartData = allChartData.filter((data) => data !== null);

      if (filteredChartData.length === 0) {
        return res.status(404).json({ error: "No data found for the given models" });
      }

      // Combine all data into a single object
      const combinedData = {
        labels: filteredChartData[0].labels, // Use labels from the first model (assuming all models have the same timestamps)
        datasets: filteredChartData.flatMap((data) => data.datasets), // Combine datasets from all models
      };

      return res.status(200).json(combinedData); // Return a single object
    } else {
      return res.status(400).json({ error: "Invalid key format. Expected 'sensormodelX' or 'sensormodelX-sensormodelY'" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// for different parciter
export const getUniqueIds = async (req, res) => {
  const models = [
    SensorModel1, SensorModel2, SensorModel3, SensorModel4, SensorModel5,
    SensorModel6, SensorModel7, SensorModel8, SensorModel9, SensorModel10
  ];

  try {
    const uniqueIds = new Set();

    // Query all models sequentially
    for (const model of models) {
      const data = await model.find().select({ id: 1 }).lean();
      data.forEach(item => item.id && uniqueIds.add(item.id));
    }

    const uniqueIdsArray = Array.from(uniqueIds);

    if (uniqueIdsArray.length === 0) {
      return res.status(404).json({ error: "No IDs found" });
    }

    return res.status(200).json({ ids: uniqueIdsArray });

  } catch (error) {
    console.error("Error fetching unique IDs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const ApiController = { Aside, getLatestTimestamp, getNotifications, Bside, getallsensor, cbname, collectorbar, getHeatmap, fetchSensorDataByaverage, fetchSensorDataByinterval, fetchSensorDataByDate, fetchSensorDataBylimit, fetchSensorDataByaveragegraph, fetchSensorDataByintervalgraph, fetchSensorDataByDategraph, fetchSensorDataBylimitgraph, getUniqueIds };
