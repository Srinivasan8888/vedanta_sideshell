import mongoose from 'mongoose';

const thresholdSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },

  minThreshold: {
    type: Number,
    required: true
  },
  maxThreshold: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.minThreshold;
      },
      message: 'maxThreshold must be greater than minThreshold'
    }
  }
}, {
  timestamps: true
});

// Create a compound unique index on userId, sensorId, and side
thresholdSchema.index({ userId: 1, sensorId: 1, side: 1 }, { unique: true });

const Threshold = mongoose.model('Threshold', thresholdSchema);

export default Threshold;
