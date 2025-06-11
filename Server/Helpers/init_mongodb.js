import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: process.env.dbName,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB is connected to database:', process.env.dbName);
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        throw error;
    }
};

mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected...');
});

mongoose.connection.on('error', (err) => {
    console.log(err.message);
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
})