#include <WiFi.h> 
#include <HTTPClient.h> 
#include <ArduinoJson.h> 
#include <DHT.h> 
 
// WiFi configuration
const char* ssid = "ZfamilyA_2.4G@unifi"; //Wifi connected
const char* password = "25122020"; //Wifi password
 
// Google Script ID - deploy as web app and get the URL 
const char* scriptURL = "https://script.google.com/macros/s/AKfycbybv5XQia1IJSBA4yK3Y-pvREfe5WGaZ82M9s1dHdIe0wGgvC3W3-UJaY8yguxzpI5Ynw/exec"; 
 
 
// DHT sensor configuration 
#define DHTPIN 16       // Digital pin connected to the DHT sensor 
#define DHTTYPE DHT11   // DHT11 sensor type 
DHT dht(DHTPIN, DHTTYPE); 
 
// Data sending interval (in milliseconds) 
const unsigned long sendInterval = 60000;  // 1 minutes 
unsigned long previousMillis = 0; 
 
void setup() { 
  // Initialize serial communication 
  Serial.begin(115200); 
  delay(1000); 
  Serial.println("ESP32 DHT11 Sensor Data Logger"); 
   
  // Initialize DHT sensor 
  dht.begin(); 
   
  // Connect to WiFi 
  WiFi.begin(ssid, password); 
  Serial.print("Connecting to WiFi"); 

  while (WiFi.status() != WL_CONNECTED) { 
    delay(500); 
    Serial.print("."); 
  } 

  Serial.println(); 
  Serial.print("Connected to WiFi with IP: "); 
  Serial.println(WiFi.localIP()); 
} 
 
void loop() { 
  unsigned long currentMillis = millis(); 
   
  // Check if it's time to send data 
  if (currentMillis - previousMillis >= sendInterval) { 
    previousMillis = currentMillis; 
     
    // Read temperature and humidity 
    float humidity = dht.readHumidity(); 
    float temperature = dht.readTemperature(); 
     
    // Check if reading was successful 
    if (isnan(humidity) || isnan(temperature)) { 
      Serial.println("Failed to read from DHT sensor!"); 
      return; 
    } 
     
    Serial.print("Temperature: "); 
    Serial.print(temperature); 
    Serial.print("°C, Humidity: "); 
    Serial.print(humidity); 
    Serial.println("%"); 
     
    // Send data to Google Sheets 
    sendDataToGoogleSheets(temperature, humidity); 
  } 
} 


// Add to your existing ESP32 code

// Data validation function
bool validateSensorReading(float reading, float minValue, float maxValue) {

  // Example for temperature sensor - adjust for your sensor type
  if (isnan(reading)) {
    return false;
  }

  // Check if reading is within reasonable range
  if (reading < minValue || reading > maxValue) {
    return false;
  }

  return true;
}


// Update your existing data sending function
void sendDataToGoogleSheets(float temperature, float humidity) { 

  // Validate reading before sending
  if (!validateSensorReading(temperature, 0.0, 50.0) ||
      !validateSensorReading(humidity, 20.0, 90.0)) {

    Serial.println("Invalid sensor reading detected. Skipping.");
    return;
  }

  // Existing code for sending data to Google Sheets...

  // Check WiFi connection 
  if (WiFi.status() != WL_CONNECTED) { 
    Serial.println("WiFi not connected"); 
    return; 
  } 
   
  HTTPClient http; 
  http.begin(scriptURL); 
  http.addHeader("Content-Type", "application/json"); 
   
  // Create JSON data 
  StaticJsonDocument<200> doc; 
  doc["temperature"] = temperature; 
  doc["humidity"] = humidity; 
   
  String jsonString; 
  serializeJson(doc, jsonString); 
   
  // Send HTTP POST request 
  int httpResponseCode = http.POST(jsonString); 
   
  if (httpResponseCode > 0) { 
    String response = http.getString(); 
    Serial.println("HTTP Response code: " + String(httpResponseCode)); 
    Serial.println("Response: " + response); 
  } else { 
    Serial.print("Error on sending POST: "); 
    Serial.println(httpResponseCode); 
  } 
   
  http.end(); 
}
