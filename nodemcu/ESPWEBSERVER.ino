#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>
#include <SoftwareSerial.h>
#include <Arduino.h>
#include <stdio.h>
int a=10;
char buff1[32];
const char* ssid = "BALL";
const char* password = "01042545";
const char* server_name = "http://192.168.79.86/";

// Create an instance of the server
// specify the port to listen on as an argument
ESP8266WebServer server(80);
SoftwareSerial NodeSerial(D2,D3);



void setup() {
  
  Serial.begin(115200);
  delay(10);
  pinMode(D2,INPUT);
  pinMode(D3,OUTPUT);
  // Connect to WiFi network
  NodeSerial.begin(115200);
  Serial.println();
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

  server.on("/valveOn", handleOn); 
  server.on("/valveOff", handleOff);  
  server.on("/water", handleWater); 
  server.on("/getInfo", handleInfo); 
  
  // Start the server
  server.begin();
  
  Serial.println("Server started");

  // Print the IP address
  Serial.println(WiFi.localIP());
  
}

void handleOn(){
  NodeSerial.write(0);
}

void handleOff(){
  NodeSerial.write(1);
  
}


void handleWater(){
  String val = server.arg("amount");
  Serial.println(val);
  NodeSerial.write( val.toInt());
  
}


void handleInfo(){
  NodeSerial.write(2);
  String light = NodeSerial.readString();
  Serial.print(light);
  
  NodeSerial.write(3);
  String humid = NodeSerial.readString();
  Serial.print(humid);

  NodeSerial.write(4);
  String water = NodeSerial.readString();
  Serial.print(water);

  String response = "{";
  response+= "\"light\": \""+light+"\"";
  response+= ",\"humid\": \""+humid+"\"";
  response+= ",\"water\": \""+water+"\"";  

  if (server.arg("signalStrength")== "true"){
        response+= ",\"signalStrengh\": \""+String(WiFi.RSSI())+"\"";
    }
 
    if (server.arg("chipInfo")== "true"){
        response+= ",\"chipId\": \""+String(ESP.getChipId())+"\"";
        response+= ",\"flashChipId\": \""+String(ESP.getFlashChipId())+"\"";
        response+= ",\"flashChipSize\": \""+String(ESP.getFlashChipSize())+"\"";
        response+= ",\"flashChipRealSize\": \""+String(ESP.getFlashChipRealSize())+"\"";
    }
    if (server.arg("freeHeap")== "true"){
        response+= ",\"freeHeap\": \""+String(ESP.getFreeHeap())+"\"";
    }
    response+="}";
 
    server.send(200, "text/json", response);
}


void loop() {
  
  server.handleClient();
  
}
