import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { IMqttMessage, MqttService } from 'ngx-mqtt';
import { MQTTmessage } from './MQTTmessage';
import {ThemePalette} from '@angular/material/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Odyssey';
  private subscription: Subscription;
  topicname: any = "Odyssey/BCAN/#";
  msg: any = "";
  direction: any = false;
  isConnected: boolean = false;
  @ViewChild('msglog', { static: true }) msglog: ElementRef;
  messageQueue: MQTTmessage[] =[];
  //trafficResults: TrafficResults = {topic: "", status: "", quantityLeft: 0, quantityRight: 0, occupancy: 0};
  messageCount = 0;
  isLocked = true;
  lockColor: ThemePalette = 'primary';    //or 'accent';
  lockCurrentCode = 0;  // this is updated everytime a new value is redeived at the lock address

  constructor(private _mqttService: MqttService) { }

    ngOnInit(): void {
      //var incomingMsg: MQTTmessage = {topic: "app/le", msg: "04r"}
      //var length = this.messageQueue.push(incomingMsg);
    }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  subscribeNewTopic(): void {
    //console.log('inside subscribe new topic')
    this.subscription = this._mqttService.observe(this.topicname).subscribe((message: IMqttMessage) => {
      //this.msg = message;
      //console.log('msg: ', message)
      //this.logMsg('Message: ' + message.payload.toString() + '<br> for topic: ' + message.topic);
      var incomingMsg: MQTTmessage = {topic: message.topic, msg: message.payload.toString()}
      if (this.messageQueue.length > 21){
        // too many entries in the array, remove the oldest 1 entries
        this.messageQueue = this.messageQueue.slice(1)
      }
      var length = this.messageQueue.push(incomingMsg);
      // if (message.topic == "TrafficCounter/TrafficDetected/Status") {this.trafficResults.status = message.payload.toString()};
      // if (message.topic == "TrafficCounter/TrafficDetected/Left") {
      //   this.trafficResults.quantityLeft = Number(message.payload.toString());
      //   this.trafficResults.occupancy = this.direction ? this.trafficResults.quantityLeft - this.trafficResults.quantityRight : this.trafficResults.quantityRight - this.trafficResults.quantityLeft;
      // };
      // if (message.topic == "TrafficCounter/TrafficDetected/Right") {
      //   this.trafficResults.quantityRight = Number(message.payload.toString())};
      //   this.trafficResults.occupancy = this.direction ? this.trafficResults.quantityLeft - this.trafficResults.quantityRight : this.trafficResults.quantityRight - this.trafficResults.quantityLeft;
      var arbitrationId = message.topic.replace(/^(Odyssey\/BCAN\/)/,"");
      
      if (arbitrationId == "251142160"){    //  318255408
        // this is the code if the door locks/unlocks
        var payload = parseInt(message.payload.toString(), 16);
        this.lockCurrentCode = payload;
        console.log("message.payload[0], raw  ",   message.payload, " toString  ", message.payload.toString(), " payload  ", payload, " p40:  ", message.payload[0] & 40, "  p52 ", message.payload[0] & 52)

        if (payload & 0x40){
          // door has been unlocked
          this.isLocked = false;
          this.lockColor = 'accent';
        }
        if (payload & 0x80){
          // door has been locked
          this.isLocked = true;
          this.lockColor = 'accent';
        }
      }
      this.messageCount++; 

      if (this.topicname == "Odyssey/BCAN/#"){this.topicname = "Odyssey/send";}   //for demo update topic for convenience
    });
    //this.logMsg('subscribed to topic: ' + this.topicname);
    // this.trafficResults.topic = this.topicname;
    var incomingMsg: MQTTmessage = {topic: "subscribed to topic: ", msg: this.topicname}
    var length = this.messageQueue.push(incomingMsg);
}

  sendmsg(): void {
    // use unsafe publish for non-ssl websockets
    this._mqttService.unsafePublish(this.topicname, this.msg, { qos: 1, retain: true })
    this.msg = ''
  }

  logMsg(message): void {
    this.msglog.nativeElement.innerHTML += '<br><hr>' + message;
  }

  // clear(): void {
  //   this.msglog.nativeElement.innerHTML = '';
  // }

  onChangeLock(eventObj) {
    // what to do when the user changes the status of the lock
    // retain all the other settings (bits) but change  the two coresponding to locks
    if (eventObj.checked) {
        // user has requested the door to become LOCKED
        this.lockColor = 'primary';
        // var newCode = this.lockCurrentCode & 0b11111101;   //=253; ensure the 2nd-to-last bit is zero
        // newCode = newCode | 0b00000001;    //=1; ensure the last bit is one
        // newCode = 0x80;
        var newCode = "56, 48"
      } else {
        // unlocked
        this.lockColor = 'primary';
        // var newCode = this.lockCurrentCode & 0b11111110;   //=254; ensure the last bit is zero
        // newCode = newCode | 0b00000010;    //=2; ensure the 2nd-to-last bit is one
        // newCode = 0x40;
        var newCode = "52, 48"
      }
    const topic = "Odyssey/send/0EF82010"   //12F83130
    this._mqttService.unsafePublish(topic, newCode.toString(), { qos: 1, retain: true })
  }


}
