import React, { useState, useEffect } from "react";
import "../App.css";
import axios from "axios";
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Table,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    TableContainer,
} from "@mui/material";
import { spacing } from "@mui/system";

const WeatherPredictionService = ({ currentUserID }) => {
    const [error, setError] = useState(false);
    const [city, setCity] = useState("");
    const [days, setDays] = useState(5);
    const [results, setResults] = useState(undefined);
    const [loading, setLoading] = useState(true);

    let fetchData = async () => {
        try {
            setLoading(true);
            // const id = checkString(currentUserID);
            if (!city || !days) return;
            const { data } = await axios.get(
                `http://localhost:4000/flask/data/${city}/${days}`
            );
            console.log(data);
            setResults(data.home);
            setLoading(false);
        } catch (e) {
            setError("User is not logged in");
        }
    };

    useEffect(() => {
        console.log("useEffect fired");
        fetchData();
        console.log(results);
    }, [city, days]);

    return (
        <div>
            <h1>Weather Prediction</h1>
            <p>
                The Weather Prediction Service is a custom model that predicts
                the weather up to 30 days from the current day using a time
                series machine learning model. Currently the prediction service
                supports five cities, which can be found in the drop down menu.
                Choose the number of days from the sliding bar found next to the
                city menu.
            </p>
            <div className="predictionForms">
                <FormControl
                    variant="outlined"
                    className="predict-select"
                    sx={{ ml: 5, mr: 5 }}
                >
                    <InputLabel id="city-select-label">City</InputLabel>
                    <Select
                        labelId="city-select"
                        id="city-select"
                        value={city}
                        label="City"
                        onChange={(e) => setCity(e.target.value)}
                    >
                        <MenuItem value="Washington">Washington DC</MenuItem>
                        <MenuItem value="New%20York">New York</MenuItem>
                        <MenuItem value="San%20Francisco">
                            San Francisco
                        </MenuItem>
                        <MenuItem value="Miami">Miami</MenuItem>
                        <MenuItem value="Austin">Austin</MenuItem>
                    </Select>
                </FormControl>
                <FormControl className="predict-select" sx={{ ml: 5, mr: 5 }}>
                    <InputLabel id="days-select">Days</InputLabel>
                    <Slider
                        aria-label="days-select"
                        max={30}
                        min={5}
                        onChange={(e) => setDays(e.target.value)}
                        valueLabelDisplay="auto"
                    />
                </FormControl>
            </div>
            {!loading && (
                <div className="predictionResults">
                    <TableContainer sx={{ ml: 10 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Day</TableCell>
                                <TableCell align="right">
                                    Projected Temperature
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {results.map((row) => (
                                <TableRow key={row.ds}>
                                    <TableCell>{row.ds}</TableCell>
                                    <TableCell align="right">
                                        {Math.round(row.yhat, 2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </TableContainer>
                </div>
            )}
        </div>
    );
};

export default WeatherPredictionService;
