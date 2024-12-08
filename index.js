const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const voterRoutes = require('./routes/voterRoutes');
const officerRoutes = require('./routes/officerRoutes');
const resultRoutes = require('./routes/resultRoutes');
const { setupWebSocketServer } = require('./utils/ws');
const path = require("path");
require('dotenv').config();

const app = express();

app.use(express.static(path.join(__dirname, "dist")));

const allowedOrigins = [
    process.env.DEPLOYED_URI,   // Deployed frontend URL
    'http://localhost:5173'    // Local development URL
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`CORS Error: Origin '${origin}' not allowed.`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, 
}));

app.use(express.json());

app.use('/api/voter', voterRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/results', resultRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const start = async () => {
    try {
        if (!process.env.MONGO_URL || !process.env.PORT || !process.env.DEPLOYED_URI) {
            throw new Error("Environment variables MONGO_URL, PORT, or DEPLOYED_URI are not set.");
        }

        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB.');

        app.listen(process.env.PORT, () => {
            console.log(`Server running on port: ${process.env.PORT}`);
        });

        setupWebSocketServer();
    } catch (err) {
        console.error('Error starting server:', err);
        process.exit(1);
    }
};

start();
