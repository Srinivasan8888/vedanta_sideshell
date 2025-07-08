import mongoose from 'mongoose';

const thresholdSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  sensorId: {
    type: String,
    required: true,
    match: /^sensor([1-9]|[12][0-9]|3[0-8])$/
  },
  side: {
    type: String,
    required: true,
    enum: ['Aside', 'Bside']
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
