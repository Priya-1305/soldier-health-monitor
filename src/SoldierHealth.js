import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './SoldierHealth.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const HealthTrends = ({ data }) => {
    return (
        <LineChart width={600} height={300} data={data}>
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

const SoldierHealth = () => {
    const [soldiers, setSoldiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortKey, setSortKey] = useState("SoldierID");
    const [filter, setFilter] = useState("");
    const [healthTrendsData, setHealthTrendsData] = useState([]);

    const THRESHOLDS = {
        BodyTemperature: { min: 35, max: 38 }, // Example thresholds
        HeartRate: { min: 60, max: 100 },
        RespirationRate: { min: 12, max: 20 },
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/api/soldier_data');
                setSoldiers(response.data);
                setLoading(false); // Stop loading after fetching
                
                // Prepare health trends data
                const trendsData = response.data.map((soldier) => ({
                    time: new Date().toLocaleTimeString(), // Current time for each entry
                    BodyTemperature: soldier.BodyTemperature,
                    HeartRate: soldier.HeartRate,
                    RespirationRate: soldier.RespirationRate,
                }));
                setHealthTrendsData(trendsData);
            } catch (err) {
                setError(err);
                setLoading(false);
            }
        };

        fetchData(); // Initial fetch
        const interval = setInterval(fetchData, 5000); // Fetch every 5 seconds

        return () => clearInterval(interval); // Clean up on unmount
    }, []);

    const handleSort = (key) => {
        setSortKey(key);
    };

    const filteredSoldiers = soldiers.filter((soldier) =>
        soldier.SoldierID.toLowerCase().includes(filter.toLowerCase())
    );

    const sortedSoldiers = filteredSoldiers.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return -1;
        if (a[sortKey] > b[sortKey]) return 1;
        return 0;
    });

    // Detect if the soldier's health metrics are out of the safe range
    const detectAnomalies = (soldier) => {
        const isTemperatureOutOfRange = soldier.BodyTemperature < THRESHOLDS.BodyTemperature.min || soldier.BodyTemperature > THRESHOLDS.BodyTemperature.max;
        const isHeartRateOutOfRange = soldier.HeartRate < THRESHOLDS.HeartRate.min || soldier.HeartRate > THRESHOLDS.HeartRate.max;
        const isRespirationRateOutOfRange = soldier.RespirationRate < THRESHOLDS.RespirationRate.min || soldier.RespirationRate > THRESHOLDS.RespirationRate.max;
        
        return {
            temperatureWarning: isTemperatureOutOfRange,
            heartRateWarning: isHeartRateOutOfRange,
            respirationWarning: isRespirationRateOutOfRange,
        };
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error fetching data: {error.message}</div>;

    return (
        <div>
            <h1>Soldier Health Monitoring</h1>
            <div>
                <label>Filter by Soldier ID:</label>
                <input
                    type="text"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
                
                <label>Sort by:</label>
                <select onChange={(e) => handleSort(e.target.value)}>
                    <option value="SoldierID">Soldier ID</option>
                    <option value="BodyTemperature">Body Temperature</option>
                    <option value="HeartRate">Heart Rate</option>
                    <option value="RespirationRate">Respiration Rate</option>
                </select>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Soldier ID</th>
                        <th>Body Temperature</th>
                        <th>Heart Rate</th>
                        <th>Respiration Rate</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedSoldiers.map((soldier) => {
                        const { temperatureWarning, heartRateWarning, respirationWarning } = detectAnomalies(soldier);
                        return (
                            <tr key={soldier.SoldierID} className={(temperatureWarning || heartRateWarning || respirationWarning) ? 'alert-row' : ''}>
                                <td>{soldier.SoldierID}</td>
                                <td>
                                    {soldier.BodyTemperature} °C 
                                    {temperatureWarning && <span className="alert"> ⚠️</span>}
                                </td>
                                <td>
                                    {soldier.HeartRate} bpm 
                                    {heartRateWarning && <span className="alert"> ⚠️</span>}
                                </td>
                                <td>
                                    {soldier.RespirationRate} breaths/min 
                                    {respirationWarning && <span className="alert"> ⚠️</span>}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Render the Health Trends LineChart */}
            <HealthTrends data={healthTrendsData} />
        </div>
    );
};

export default SoldierHealth;
