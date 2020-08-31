# CAN BUS

Significant equipment utilizes CAN-bus (Controller Area Network): turbines, earth movers, processing equipment, etc. This signaling follows several ISO standards and can thus be ‘hacked’ and translated into modern messaging – in essence, integrating older machines into current protocols. This is an example of translating Honda Odyssey 2011 Body-CAN messages into MQTT

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.6.

This file is intended for my own use though I don't mind sharing.
As-is use at your own risk.

So far, all it does is grab all the traffic from the BCAN bus and send tham to MQTT, hosted on a Mosquitto server.  Note: this floods the little Raspberry Zero hosting Mosquitto)
