
// Script to receive sensor data from ESP32 and log it to Google Sheets 
function doGet(e) { 
  return handleResponse(e); 
} 

function doPost(e) { 
  return handleResponse(e); 
} 

function handleResponse(e) { 
  // Process the incoming request 
  var lock = LockService.getScriptLock(); 

  try {
    lock.waitLock(10000); // Wait 10 seconds for other processes to complete 

    // Get the active sheet 
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SensorData"); 

    // Parse the incoming data 
    var payload; 

    if (e.postData && e.postData.contents) { 
      payload = JSON.parse(e.postData.contents); 
    } else if (e.parameter) { 
      payload = e.parameter; 
    } else { 
      return ContentService.createTextOutput(JSON.stringify({ 
        'status': 'error', 
        'message': 'No data received' 
      })).setMimeType(ContentService.MimeType.JSON); 
    } 

    // Prepare data array for the sheet 
    var timestamp = new Date(); 
    var data = [timestamp]; 

    // Validate temperature and humidity
    var temperature = parseFloat(payload.temperature);
    var humidity = parseFloat(payload.humidity);

    if (!isFinite(temperature) ||
        !isFinite(humidity) ||
        temperature < 0 ||
        temperature > 50 ||
        humidity < 0 ||
        humidity > 100) {

      throw new Error("Invalid sensor reading.");
    }
     
    // Get sensor data based on what's available in the payload 
    // Add appropriate sensor values to the data array 
    if (payload.temperature !== undefined) 
      data.push(parseFloat(payload.temperature)); 

    if (payload.humidity !== undefined) 
      data.push(parseFloat(payload.humidity)); 

    if (payload.moisture !== undefined) 
      data.push(parseFloat(payload.moisture)); 

    if (payload.light !== undefined) 
      data.push(parseFloat(payload.light)); 

    if (payload.motion !== undefined) 
      data.push(payload.motion); 

    if (payload.distance !== undefined) 
      data.push(parseFloat(payload.distance)); 
     
    // Insert data into the next row 
    sheet.appendRow(data); 
     
    // Return success response 
    return ContentService.createTextOutput(JSON.stringify({ 
      'status': 'success', 
      'timestamp': timestamp.toString() 
    })).setMimeType(ContentService.MimeType.JSON); 
     
  } catch (error) { 

    // Return error response 
    return ContentService.createTextOutput(JSON.stringify({ 
      'status': 'error', 
      'message': error.toString() 
    })).setMimeType(ContentService.MimeType.JSON); 
     
  } finally { 
    if (lock.hasLock()) {
      lock.releaseLock();
    }
  } 
} 
 
// Function to clear all data except headers 
function clearData() { 
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SensorData"); 
  var lastRow = sheet.getLastRow(); 

  // Confirm before clearing historical data
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    "Clear All Data",
    "Are you sure you want to clear all historical sensor data?",
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return;
  }
   
  if (lastRow > 1) { 
    sheet.deleteRows(2, lastRow - 1); 
  } 
   
  SpreadsheetApp.getUi().alert('All sensor data has been cleared!'); 
}  //Original Code


// Add this function to your existing Google Apps Script

// Function to generate forecasts (runs on time trigger or manual execution)
function generateForecasts() {

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SensorData");
  var forecastSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Forecasts");

  // If forecast sheet doesn't exist, create it
  if (!forecastSheet) {
    forecastSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Forecasts");
  }

  // Check if historical data is available
  if (!sheet || sheet.getLastRow() < 2) {
    throw new Error("No historical sensor data available.");
  }

  // Get historical data (last 24 hours or maximum available)
  // This implementation uses all available historical data
  var dataRange = sheet.getRange(
    2, 1, sheet.getLastRow()-1, 3
  );

  var values = dataRange.getValues();

  // Extract timestamps and sensor values
  var timestamps = [];
  var temperatureValues = [];
  var humidityValues = [];

  // Sort historical data by timestamp
  values.sort(function(a, b) {
    return new Date(a[0]) - new Date(b[0]);
  });

  for (var i = 0; i < values.length; i++) {

    // Validate timestamp and sensor value
    if (
      values[i][0] instanceof Date &&
      !isNaN(values[i][0].getTime()) &&

      typeof values[i][1] === "number" &&
      isFinite(values[i][1]) &&
      values[i][1] >= 0 &&
      values[i][1] <= 50 &&

      typeof values[i][2] === "number" &&
      isFinite(values[i][2]) &&
      values[i][2] >= 0 &&
      values[i][2] <= 100
    ) {

      timestamps.push(values[i][0]); // Assuming timestamp is in column A

      temperatureValues.push(values[i][1]); // Temperature in column B

      humidityValues.push(values[i][2]); // Humidity in column C
    }
  }

  // Check if valid sensor readings are available
  if (temperatureValues.length === 0 ||
      humidityValues.length === 0) {

    throw new Error("No valid sensor readings available.");
  }

  // Calculate forecasts using your chosen algorithm
  var temperatureForecasts = calculateForecasts(
    timestamps,
    temperatureValues
  );

  var humidityForecasts = calculateForecasts(
    timestamps,
    humidityValues
  );

  // Clear previous forecasts
  forecastSheet.clearContents();

  // Add headers based on your sensor type
  forecastSheet.appendRow([
    "Timestamp",
    "Temperature Forecast",
    "Temperature Upper Bound",
    "Temperature Lower Bound",
    "Humidity Forecast",
    "Humidity Upper Bound",
    "Humidity Lower Bound"
  ]);

  // Add new forecasts
  var forecastRows = [];

  for (var i = 0; i < temperatureForecasts.length; i++) {

    forecastRows.push([
      temperatureForecasts[i].timestamp,

      temperatureForecasts[i].forecastValue,

      temperatureForecasts[i].upperBound,

      temperatureForecasts[i].lowerBound,

      humidityForecasts[i].forecastValue,

      Math.min(100, humidityForecasts[i].upperBound),

      Math.max(0, humidityForecasts[i].lowerBound)
    ]);
  }

  // Write all forecasts into Google Sheets
  forecastSheet.getRange(
    2, 1, forecastRows.length, 7
  ).setValues(forecastRows);

  // Display forecasted values to 2 decimal places
  forecastSheet.getRange(
    2, 2, forecastRows.length, 6
  ).setNumberFormat("0.00");

  // Format timestamp
  forecastSheet.getRange(
    2, 1, forecastRows.length, 1
  ).setNumberFormat("dd/MM/yyyy HH:mm:ss");

  // Format headers
  forecastSheet.getRange(1, 1, 1, 7)
    .setFontWeight("bold");

  // Automatically resize columns
  forecastSheet.autoResizeColumns(1, 7);

  // Display completion message in execution log
  Logger.log("Temperature and Humidity forecasts generated successfully.");
}


// Implement your chosen forecasting algorithm
function calculateForecasts(timestamps, values) {

  var forecasts = [];

  // EXAMPLE: Simple Moving Average implementation
  // Replace with your chosen algorithm

  // EMA smoothing factor
  var smoothingFactor = 0.3;

  // Check if historical data is available
  if (values.length === 0 || timestamps.length === 0) {
    return forecasts;
  }

  // Generate forecasts for next 24 hours (at 1-hour intervals)
  var lastTimestamp = new Date(
    timestamps[timestamps.length - 1]
  );

  // Calculate forecast using your algorithm
  var forecastValue = calculateEMA(
    values,
    smoothingFactor
  );

  for (var i = 1; i <= 24; i++) {

    // Calculate next timestamp (1 hour intervals)
    var nextTimestamp = new Date(
      lastTimestamp.getTime() + (i * 60 * 60 * 1000)
    );

    // Add forecast with confidence bounds
    // These bounds are estimated margins, not statistical confidence intervals
    forecasts.push({
      timestamp: nextTimestamp,

      forecastValue: forecastValue,

      upperBound: forecastValue * 1.1, // Simple 10% upper bound

      lowerBound: forecastValue * 0.9  // Simple 10% lower bound
    });
  }

  return forecasts;
}


// Add menu to sheet
// Add button to sheet menu to generate forecasts manually
function onOpen() {

  var ui = SpreadsheetApp.getUi();

  ui.createMenu('Sensor Data')
    .addItem('Generate Forecasts', 'generateForecasts')
    .addItem('Clear All Data', 'clearData')
    .addToUi();
}


//EMA
function calculateEMA(values, smoothingFactor) {

  if (values.length < 1) {
    return null;
  }

  // Validate smoothing factor
  if (!isFinite(smoothingFactor) ||
      smoothingFactor <= 0 ||
      smoothingFactor > 1) {

    throw new Error("Invalid EMA smoothing factor.");
  }

  var ema = values[0];

  for (var i = 1; i < values.length; i++) {

    ema = smoothingFactor * values[i]
        + (1 - smoothingFactor) * ema;
  }

  return ema;
}
