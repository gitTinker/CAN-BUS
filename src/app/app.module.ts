//
// https://medium.com/@anant.lalchandani/dead-simple-mqtt-example-over-websockets-in-angular-b9fd5ff17b8e
//
// 1st:  ng new TrafficCounter    //create this project
// 2nd:  cd TrafficCounter
// 3rd:  npm i ngx-mqtt --save    // install dependancy
// 2020601 TIM

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from "@angular/forms";
import { AppComponent } from './app.component';
import { MqttModule, IMqttServiceOptions } from "ngx-mqtt";
import { MQTTmessagesComponent } from './mqttmessages/mqttmessages.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
export const MQTT_SERVICE_OPTIONS: IMqttServiceOptions = {
  hostname: '10.0.3.139',
  port: 9001,
  path: ''
}

@NgModule({
  declarations: [
    AppComponent,
    MQTTmessagesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MqttModule.forRoot(MQTT_SERVICE_OPTIONS),
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
