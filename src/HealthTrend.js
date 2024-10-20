// HealthTrends.js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const HealthTrends = ({ data }) => {
    // Map data to include a time key for the X-axis
    const formattedData = data.map((soldier) => ({
        ...soldier,
        time: new Date().toLocaleTimeString(), // Add timestamp for each entry
    }));

    return (
        <LineChart width={600} height={300} data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="BodyTemperature" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="HeartRate" stroke="#82ca9d" />
            <Line type="monotone" dataKey="RespirationRate" stroke="#ff7300" />
        </LineChart>
    );
};

export default HealthTrends;
