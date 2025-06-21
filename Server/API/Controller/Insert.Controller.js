import SensorModel from "../Models/sensorModel.js";
import AverageModel from "../Models/AverageModel.js";

export const createSensor = async (req, res) => {
  const {
    id,
    waveguide,
    sensor1,
    sensor2,
    sensor3,
    sensor4,
    sensor5,
    sensor6,
    sensor7,
    sensor8,
    sensor9,
    sensor10,
    sensor11,
    sensor12,
    sensor13,
    sensor14,
    sensor15,
    sensor16,
    sensor17,
    sensor18,
    sensor19,
    sensor20,
    sensor21,
    sensor22,
    sensor23,
    sensor24,
    sensor25,
    sensor26,
    sensor27,
    sensor28,
    sensor29,
    sensor30,
    sensor31,
    sensor32,
    sensor33,
    sensor34,
    sensor35,
    sensor36,
    sensor37,
    sensor38,
    time,
  } = req.query;

  // Validate required fields
  if (
    !id ||
    !waveguide ||
    !sensor1 ||
    !sensor2 ||
    !sensor3 ||
    !sensor4 ||
    !sensor5 ||
    !sensor6 ||
    !sensor7 ||
    !sensor8 ||
    !sensor9 ||
    !sensor10 ||
    !sensor11 ||
    !sensor12 ||
    !sensor13 ||
    !sensor14 ||
    !sensor15 ||
    !sensor16 ||
    !sensor17 ||
    !sensor18 ||
    !sensor19 ||
    !sensor20 ||
    !sensor21 ||
    !sensor22 ||
    !sensor23 ||
    !sensor24 ||
    !sensor25 ||
    !sensor26 ||
    !sensor27 ||
    !sensor28 ||
    !sensor29 ||
    !sensor30 ||
    !sensor31 ||
    !sensor32 ||
    !sensor33 ||
    !sensor34 ||
    !sensor35 ||
    !sensor36 ||
    !sensor37 ||
    !sensor38 ||
    !time
  ) {
    return res.status(400).json({
      error: "All fields are required.",
    });
  }

  try {
    const newSensor = new SensorModel({
      id: String(id),
      waveguide: String(waveguide),
      sensor1: String(sensor1),
      sensor2: String(sensor2),
      sensor3: String(sensor3),
      sensor4: String(sensor4),
      sensor5: String(sensor5),
      sensor6: String(sensor6),
      sensor7: String(sensor7),
      sensor8: String(sensor8),
      sensor9: String(sensor9),
      sensor10: String(sensor10),
      sensor11: String(sensor11),
      sensor12: String(sensor12),
      sensor13: String(sensor13),
      sensor14: String(sensor14),
      sensor15: String(sensor15),
      sensor16: String(sensor16),
      sensor17: String(sensor17),
      sensor18: String(sensor18),
      sensor19: String(sensor19),
      sensor20: String(sensor20),
      sensor21: String(sensor21),
      sensor22: String(sensor22),
      sensor23: String(sensor23),
      sensor24: String(sensor24),
      sensor25: String(sensor25),
      sensor26: String(sensor26),
      sensor27: String(sensor27),
      sensor28: String(sensor28),
      sensor29: String(sensor29),
      sensor30: String(sensor30),
      sensor31: String(sensor31),
      sensor32: String(sensor32),
      sensor33: String(sensor33),
      sensor34: String(sensor34),
      sensor35: String(sensor35),
      sensor36: String(sensor36),
      sensor37: String(sensor37),
      sensor38: String(sensor38),
      TIME: String(time),
    });

    // Save to the database
    const savedSensor = await newSensor.save();

    // Respond with the created document
    res.status(201).json({
      message: "Sensor data created successfully.",
      data: savedSensor,
    });
  } catch (error) {
    console.error("Error saving sensor data:", error);
    res.status(500).json({
      error: "An error occurred while saving sensor data.",
    });
  }
};

export const CreateAvg = async (req, res) => {
  const {
    id,
    Avgtemp,
    time,
  } = req.query;

  try {
    const newSensor = new AverageModel({
      id: String(id),
      Avgtemp: String(Avgtemp),
      TIME: String(time),
    });
    const savedSensor = await newSensor.save();

    // Respond with the created document
    res.status(201).json({
      message: "Sensor data created successfully.",
      data: savedSensor,
    });
  } catch (error) {
    console.error("Error saving sensor data:", error);
    res.status(500).json({
      error: "An error occurred while saving sensor data.",
    });
  }
};