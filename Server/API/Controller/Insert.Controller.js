import SensorModel1 from "../Models/sensorModel1.js";
import SensorModel2 from "../Models/sensorModel2.js";
import SensorModel3 from "../Models/sensorModel3.js";
import SensorModel4 from "../Models/sensorModel4.js";
import SensorModel5 from "../Models/sensorModel5.js";
import SensorModel6 from "../Models/sensorModel6.js";
import SensorModel7 from "../Models/sensorModel7.js";
import SensorModel8 from "../Models/sensorModel8.js";
import SensorModel9 from "../Models/sensorModel9.js";
import SensorModel10 from "../Models/sensorModel10.js";
import AverageModel from "../Models/AverageModel.js";

export const createSensor1 = async (req, res) => {
  const {
    id,
    busbar,
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
    time,
  } = req.query;

  // Validate required fields
  if (
    !id ||
    !busbar ||
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
    !time
  ) {
    return res.status(400).json({
      error: "All fields are required.",
    });
  }

  try {
    const newSensor = new SensorModel1({
      id: String(id),
      busbar: String(busbar),
      CBT1A1: String(sensor1),
      CBT1A2: String(sensor2),
      CBT2A1: String(sensor3),
      CBT2A2: String(sensor4),
      CBT3A1: String(sensor5),
      CBT3A2: String(sensor6),
      CBT4A1: String(sensor7),
      CBT4A2: String(sensor8),
      CBT5A1: String(sensor9),
      CBT5A2: String(sensor10),
      CBT6A1: String(sensor11),
      CBT6A2: String(sensor12),
      CBT7A1: String(sensor13),
      CBT7A2: String(sensor14),
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

//sensor2
export const createSensor2 = async (req, res) => {
  const {
    id,
    busbar,
    sensor15,
    sensor16,
    sensor17,
    sensor18,
    sensor19,
    sensor20,
    time,
  } = req.query;
  // Validate required fields
  if (
    !id ||
    !busbar ||
    !sensor15 ||
    !sensor16 ||
    !sensor17 ||
    !sensor18 ||
    !sensor19 ||
    !sensor20 ||
    !time
  ) {
    return res.status(400).json({
      error: "All fields are required.",
    });
  }

  try {
    const newSensor = new SensorModel2({
      id: String(id),
      busbar: String(busbar),
      CBT8A1: String(sensor15),
      CBT8A2: String(sensor16),
      CBT9A1: String(sensor17),
      CBT9A2: String(sensor18),
      CBT10A1: String(sensor19),
      CBT10A2: String(sensor20),
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

//sensor3
export const createSensor3 = async (req, res) => {
  const {
    id,
    busbar,
    sensor21,
    sensor22,
    sensor23,
    sensor24,
    sensor25,
    sensor26,
    sensor27,
    sensor28,
    time,
  } = req.query;

  if (
    !id ||
    !busbar ||
    !sensor21 ||
    !sensor22 ||
    !sensor23 ||
    !sensor24 ||
    !sensor25 ||
    !sensor26 ||
    !sensor27 ||
    !sensor28 ||
    !time
  ) {
    return res.status(400).json({
      error: "All fields are required.",
    });
  }

  try {
    const newSensor = new SensorModel3({
      id: String(id),
      busbar: String(busbar),
      CBT11A1: String(sensor21),
      CBT11A2: String(sensor22),
      CBT12A1: String(sensor23),
      CBT12A2: String(sensor24),
      CBT13A1: String(sensor25),
      CBT13A2: String(sensor26),
      CBT14A1: String(sensor27),
      CBT14A2: String(sensor28),
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

//sensor4
export const createSensor4 = async (req, res) => {
  const { id, busbar, sensor29, sensor30, sensor31, sensor32, time } =
    req.query;

  if (
    !id ||
    !busbar ||
    !sensor29 ||
    !sensor30 ||
    !sensor31 ||
    !sensor32 ||
    !time
  ) {
    return res.status(400).json({
      error: "All fields are required.",
    });
  }

  try {
    const newSensor = new SensorModel4({
      id: String(id),
      busbar: String(busbar),
      CBT15A1: String(sensor29),
      CBT15A2: String(sensor30),
      CBT16A1: String(sensor31),
      CBT16A2: String(sensor32),
      TIME: String(time),
    });
    const savedSensor = await newSensor.save();

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

//sensor5
export const createSensor5 = async (req, res) => {
  const {
    id,
    busbar,
    sensor33,
    sensor34,
    sensor35,
    sensor36,
    sensor37,
    sensor38,
    time,
  } = req.query;

  try {
    const newSensor = new SensorModel5({
      id: String(id),
      busbar: String(busbar),
      CBT17A1: String(sensor33),
      CBT17A2: String(sensor34),
      CBT18A1: String(sensor35),
      CBT18A2: String(sensor36),
      CBT19A1: String(sensor37),
      CBT19A2: String(sensor38),
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

//sensor6
export const createSensor6 = async (req, res) => {
  const {
    id,
    busbar,
    sensor39,
    sensor40,
    sensor41,
    sensor42,
    sensor43,
    sensor44,
    sensor45,
    sensor46,
    sensor47,
    sensor48,
    sensor49,
    sensor50,
    sensor51,
    sensor52,
    sensor53,
    sensor54,
    time,
  } = req.query;

  try {
    const newSensor = new SensorModel6({
      id: String(id),
      busbar: String(busbar),
      CBT20A1: String(sensor39),
      CBT20A2: String(sensor40),
      CBT21A1: String(sensor41),
      CBT21A2: String(sensor42),
      CBT22A1: String(sensor43),
      CBT22A2: String(sensor44),
      CBT23A1: String(sensor45),
      CBT23A2: String(sensor46),
      CBT24A1: String(sensor47),
      CBT24A2: String(sensor48),
      CBT25A1: String(sensor49),
      CBT25A2: String(sensor50),
      CBT26A1: String(sensor51),
      CBT26A2: String(sensor52),
      CBT27A1: String(sensor53),
      CBT27A2: String(sensor54),
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

//sensor7
export const createSensor7 = async (req, res) => {
  const {
    id,
    busbar,
    sensor55,
    sensor56,
    sensor57,
    sensor58,
    sensor59,
    sensor60,
    sensor61,
    sensor62,
    sensor63,
    sensor64,
    sensor65,
    sensor66,
    sensor67,
    sensor68,
    sensor69,
    sensor70,
    sensor71,
    sensor72,
    sensor73,
    sensor74,
    time,
  } = req.query;

  try {
    const newSensor = new SensorModel7({
      id: String(id),
      busbar: String(busbar),
      CBT1B1: String(sensor55),
      CBT1B2: String(sensor56),
      CBT2B1: String(sensor57),
      CBT2B2: String(sensor58),
      CBT3B1: String(sensor59),
      CBT3B2: String(sensor60),
      CBT4B1: String(sensor61),
      CBT4B2: String(sensor62),
      CBT5B1: String(sensor63),
      CBT5B2: String(sensor64),
      CBT6B1: String(sensor65),
      CBT6B2: String(sensor66),
      CBT7B1: String(sensor67),
      CBT7B2: String(sensor68),
      CBT8B1: String(sensor69),
      CBT8B2: String(sensor70),
      CBT9B1: String(sensor71),
      CBT9B2: String(sensor72),
      CBT10B1: String(sensor73),
      CBT10B2: String(sensor74),
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

//sensor8
export const createSensor8 = async (req, res) => {
  const {
    id,
    busbar,
    sensor75,
    sensor76,
    sensor77,
    sensor78,
    sensor79,
    sensor80,
    sensor81,
    sensor82,
    time,
  } = req.query;

  try {
    const newSensor = new SensorModel8({
      id: String(id),
      busbar: String(busbar),
      CBT11B1: String(sensor75),
      CBT11B2: String(sensor76),
      CBT12B1: String(sensor77),
      CBT12B2: String(sensor78),
      CBT13B1: String(sensor79),
      CBT13B2: String(sensor80),
      CBT14B1: String(sensor81),
      CBT14B2: String(sensor82),
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

//sensor9
export const createSensor9 = async (req, res) => {
  const {
    id,
    busbar,
    sensor83,
    sensor84,
    sensor85,
    sensor86,
    sensor87,
    sensor88,
    sensor89,
    sensor90,
    time,
  } = req.query;

  try {
    const newSensor = new SensorModel9({
      id: String(id),
      busbar: String(busbar),
      CBT15B1: String(sensor83),
      CBT15B2: String(sensor84),
      CBT16B1: String(sensor85),
      CBT16B2: String(sensor86),
      CBT17B1: String(sensor87),
      CBT17B2: String(sensor88),
      CBT18B1: String(sensor89),
      CBT18B2: String(sensor90),
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

//sensor10
export const createSensor10 = async (req, res) => {
  const {
    id,
    busbar,
    sensor91,
    sensor92,
    sensor93,
    sensor94,
    sensor95,
    sensor96,
    sensor97,
    sensor98,
    sensor99,
    sensor100,
    sensor101,
    sensor102,
    sensor103,
    sensor104,
    sensor105,
    sensor106,
    sensor107,
    sensor108,
    time,
  } = req.query;

  try {
    const newSensor = new SensorModel10({
      id: String(id),
      busbar: String(busbar),
      CBT19B1: String(sensor91),
      CBT19B2: String(sensor92),
      CBT20B1: String(sensor93),
      CBT20B2: String(sensor94),
      CBT21B1: String(sensor95),
      CBT21B2: String(sensor96),
      CBT22B1: String(sensor97),
      CBT22B2: String(sensor98),
      CBT23B1: String(sensor99),
      CBT23B2: String(sensor100),
      CBT24B1: String(sensor101),
      CBT24B2: String(sensor102),
      CBT25B1: String(sensor103),
      CBT25B2: String(sensor104),
      CBT26B1: String(sensor105),
      CBT26B2: String(sensor106),
      CBT27B1: String(sensor107),
      CBT27B2: String(sensor108),
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