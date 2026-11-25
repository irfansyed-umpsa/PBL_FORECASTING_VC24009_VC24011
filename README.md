# IoT Temperature and Humidity Monitoring and Forecasting System

## 1. Project Overview

This project presents an IoT-based temperature and humidity monitoring and forecasting system using ESP32 and DHT11. Sensor readings are transmitted to Google Sheets through Google Apps Script and visualized using Looker Studio.

The Exponential Moving Average (EMA) algorithm is implemented to generate temperature and humidity forecasts for the next 24 hours at one-hour intervals.

## 2. Project Objectives

- To develop an IoT-based temperature and humidity monitoring system.
- To implement automatic cloud-based sensor data acquisition.
- To generate temperature and humidity forecasts using the EMA algorithm.
- To develop an interactive monitoring and forecasting dashboard.

## 3. Hardware Components

- ESP32 Microcontroller
- DHT11 Temperature and Humidity Sensor
- Jumper Wires
- USB Cable

## 4. Software and Platforms

- Arduino IDE
- Google Apps Script
- Google Sheets
- Looker Studio

## 5. System Architecture

The DHT11 sensor measures temperature and humidity, while the ESP32 processes and transmits the sensor readings through a Wi-Fi connection at one-minute intervals.

Google Apps Script receives and stores the collected data in Google Sheets. The EMA forecasting function processes historical sensor readings to generate forecasted values. Both historical and forecasted data are visualized through the Looker Studio dashboard.

**System Data Flow:**

DHT11 → ESP32 → Wi-Fi → Google Apps Script → Google Sheets → Looker Studio

## 6. Forecasting Algorithm Documentation

### 6.1 Selected Forecasting Algorithm

The Exponential Moving Average (EMA) algorithm was selected as the forecasting method for this project. EMA assigns greater weight to recent sensor readings while retaining the influence of previous readings.

### 6.2 Justification of Algorithm Selection

EMA was selected for the following reasons:

- Simple implementation using Google Apps Script.
- Low computational requirements.
- Greater sensitivity to recent environmental changes compared with a Simple Moving Average (SMA).
- Ability to reduce the influence of short-term fluctuations.
- Suitable for frequently updated IoT sensor data.

### 6.3 Forecasting Formula

The EMA formula used in this project is:

$$EMA_t = 0.3x_t + 0.7EMA_{t-1}$$

Where:

- EMAₜ = Current Exponential Moving Average
- xₜ = Current sensor reading
- EMAₜ₋₁ = Previous Exponential Moving Average
- α = Smoothing factor (0.3)

A smoothing factor of 0.3 assigns 30% weight to the current sensor reading and 70% weight to the previous EMA value. The initial EMA value is set to the first available sensor reading.

### 6.4 Upper and Lower Bounds

An estimated margin of ±10% is applied to the forecasted values.

**Upper Bound:**

$$UB_t = (0.3x_t + 0.7EMA_{t-1}) \times 1.10$$

**Lower Bound:**

$$LB_t = (0.3x_t + 0.7EMA_{t-1}) \times 0.90$$

These bounds provide an estimated forecasting range and do not represent statistically calculated confidence intervals.

### 6.5 Forecasting Implementation

The EMA algorithm is implemented using Google Apps Script to process historical temperature and humidity readings independently.

The system generates 24 forecast records at one-hour intervals. The forecasted values, upper bounds, lower bounds, and corresponding timestamps are stored in the Forecasts worksheet.

### 6.6 Algorithm Limitations

- EMA does not explicitly model seasonal patterns.
- Forecasting performance depends on the selected smoothing factor.
- Sudden environmental changes may affect forecasting accuracy.
- Future forecasts remain constant across the forecasting horizon until new sensor readings are processed.
- Forecast accuracy requires further validation.

## 7. Dashboard Features

- Current temperature and humidity readings.
- Next-hour temperature and humidity forecasts.
- Historical temperature and humidity trends.
- 24-hour forecasting visualization.
- Upper and lower forecasting bounds.
- Latest sensor data timestamp.
- System status indicator (ONLINE, OFFLINE).

## 8. Repository Contents

| File | Description |
|---|---|
| README.md | Project overview and forecasting algorithm documentation |
| PBL_VC24009_VC24011.ino | ESP32 sensor monitoring and data transmission code |
| GoogleAppScript.gs | Google Apps Script data acquisition and forecasting code |

## 9. Future Improvements

- Improve sensor measurement accuracy.
- Implement advanced forecasting algorithms.
- Automate forecast history storage.
- Implement automatic environmental notifications.
- Optimize dashboard refresh intervals.
- Evaluate different EMA smoothing factors.

## 10. Project Links

- Google Sheets: https://docs.google.com/spreadsheets/d/1EITiNYhvSup5A7L_W4hoiLt6WkYmj4RjyEu4q1eRsPY/edit?usp=sharing)
- Looker Studio Dashboard: https://datastudio.google.com/reporting/6ab1984a-6183-4295-b73e-ad4fde5a848c)

## 11. Conclusion

This project demonstrates the integration of IoT technology, cloud-based data acquisition, forecasting algorithms, and interactive dashboard visualization to support environmental monitoring and forecasting.
