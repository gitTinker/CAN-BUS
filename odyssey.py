#!/usr/bin/python3

# read the BCAN (body control area network)
# on the 2011 Odyssey
#
# connect thru MQTT
# send all traffic
# receive key phrases to send to th Odyssey
import time
import paho.mqtt.client as mqtt
import can
from can import Message as canMsg
import os

#parameters for CAN
os.system('sudo ip link set can0 type can bitrate 125000')
os.system('sudo ifconfig can0 up')
can0 = can.interface.Bus(channel = 'can0', bustype = 'socketcan_ctypes')


#parameters for MQTT
mqtt_broker_address="10.0.3.139"
mqtt_port=1883 
mqtt_client_name = "Odyssey"
mqtt_topic_Received = '{}/BCAN'.format(mqtt_client_name)
mqtt_topic_Send = '{}/send'.format(mqtt_client_name)

def mqtt_on_connect(client, userdata, flags, rc):
    if rc==0:
        client.connected_flag=True    #set flag
        print("MQTT connected OK Returned code=",rc, flush=True)    # the 'flush' empties the stfio buffer so the line appears in the journalctl log https://askubuntu.com/questions/620219/systemd-on-15-04-wont-log-stdout-of-unit
    else:
        client.connected_flag=False    #set flag
        print("Bad connection Returned code=",rc, flush=True)

def mqtt_on_publish(client,userdata,messageId):             #create function for callback
    #print("data published \n")
    pass

def mqtt_on_disconnect(client, userdata, rc):
    logging.info("disconnecting reason  "  +str(rc))
    print("DISCONNECTED Returned code="  +str(rc), flush=True)
    client.connected_flag=False

def mqtt_on_message(client, userdata, message):
    print("message received " ,str(message.payload.decode("utf-8")))
    print("message topic=",message.topic)
    print("message qos=",message.qos)
    print("message retain flag=",message.retain)
    pass
    
def mqtt_on_message_Send(client, userdata, message):
    #write the contents of this message to the CAN bus"
    #aId = message.topic.startswith(mqtt_topic_Send)
    aId = message.topic[len(mqtt_topic_Send)+1:]      # trim off the leading path
    #print("aId, ", aId)
    if (len(aId)>0):
        aId = int(aId,16)   # convert to a number
        sData = str(message.payload.decode("utf-8")).split(",")   #convert from single strine to array of strings
        sData = [int(ns, 16) for ns in sData]      # convert string array to array of numbers
        #print("sData, ", sData)
        m1 = canMsg(is_extended_id=True, arbitration_id=aId, data=sData)
        print("tosend", m1)
        can0.send(m1,.3)     #send, but only wait .3 sec

def mqtt_on_message_ALL(client, userdata, message):
    #used to verify this script works"
    print("c,u,m", client, userdata, message)
    print("message received " ,str(message.payload.decode("utf-8")))
    print("message topic=",message.topic)
    print("message qos=",message.qos)
    print("message retain flag=",message.retain)

#initialize the MQTT Client
# http://www.steves-internet-guide.com/client-objects-python-mqtt/
mqtt.Client.connected_flag=False    #create flag in class
mqttClient = mqtt.Client(mqtt_client_name)    #create new instance
mqttClient.on_connect=mqtt_on_connect    #bind call back function
mqttClient.message_callback_add("{}/#".format(mqtt_topic_Send), mqtt_on_message_Send)
#mqttClient.message_callback_add("#", mqtt_on_message_ALL)
#mqttClient.on_message=mqtt_on_message #attach function to callback
mqttClient.on_publish = mqtt_on_publish    #assign function to callback
mqttClient.on_disconnect=mqtt_on_disconnect    #bind call back function
mqttClient.connect(mqtt_broker_address,mqtt_port)    #establish connection
mqttClient.loop_start() #start the loop
mqttClient.subscribe('{}/#'.format(mqtt_client_name))    #get all messages 

lckCnt = 0
while True:
    msg = can0.recv(.01)
    if (msg is None):
        # there was nothing waiting on the bus
        #mqttClient.publish("{}/{}".format(mqtt_topic_Received,key),value)
        pass
    else:
        key = msg.arbitration_id
        value = msg.data.hex()
        targetID = 0x0EF82010
        if (key == targetID):
            lckCnt +=1
            print("found a lock code, ", targetID, "- ", msg.data, "   c: ", lckCnt)
            print("msg,  ", msg)
        mqttClient.publish("{}/{}".format(mqtt_topic_Received,key),value)

mqttClient.loop_stop()
can0.shutdown()
os.system('sudo ifconfig can0 down')
