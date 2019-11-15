module.exports = function (RED) {
    var asyncMutex = require('async-mutex');

    function wiwMqttConfigNode(config) {
        RED.nodes.createNode(this, config);

        this.mutex = new asyncMutex.Mutex();

        this.name = config.name;
        this.msgId = 0;
        this.chnlSystemOut = config.chnlSystemOut;
        this.chnlDeclareOut = config.chnlDeclareOut;
        this.chnlValueOut = config.chnlValueOut;
        this.chnlValueIn = config.chnlValueIn;
        this.chnlLogIn = config.chnlLogIn;
        this.expectedMsgId = new Map();
        this.qos = config.qos;
        this.connected = config.connected;
        this.sendMsgsMaxCount = config.sendMsgsMaxCount;
        this.sendMsgs = new Array();
        this.sendMsgsLostCount = 0;
        this.sendMsgsTotalLostCount = 0;
        this.sendMsgsKeepMostRecent = config.sendMsgsKeepMostRecent;

        this.reqResp = config.reqResp;
        this.retain = false;

        var node = this;

        node.handleSendMsg = function handleSendMsg(outputNode, msg){
            if((!node.isConnected()) || (this.sendMsgs.length>0)){
                if ( this.sendMsgs.length >= this.sendMsgsMaxCount ) {
                    if ( this.sendMsgsKeepMostRecent ) {
                        this.sendMsgs.splice(0,1);
                        this.sendMsgs.push(msg);
                    }

                    this.sendMsgsLostCount++;
                    this.sendMsgsTotalLostCount++;
                }
                else
                    this.sendMsgs.push(msg);
                return null;
            }
            else
                outputNode.send(msg);
        }

        node.popSendMsgs = function popSendMsgs(){
            var sendMsgs = this.sendMsgs;
            this.sendMsgs = [];
            this.sendMsgsLostCount = 0;
            return sendMsgs;
        }

        node.setConnected = function setConnected(connection){
            this.connected=connection;
        }

        node.isConnected = function isConnected(){
            return this.connected;
        }

        node.getChnlDeclareOut = function getChnlDeclareOut() {
            return this.chnlDeclareOut;
        };

        node.getChnlValueOut = function getChnlValueOut() {
            return this.chnlValueOut;
        };

        node.getChnlValueIn = function getChnlValueIn() {
            return this.chnlValueIn;
        };

        node.getChnlSystemOut = function getChnlSystemOut() {
            return this.chnlSystemOut;
        };

        node.reset = function reset() {
            this.msgId = 0;
            this.expectedMsgId.clear();
            this.sendMsgs = [];
            this.sendMsgsLostCount = 0;
            this.sendMsgsTotalLostCount = 0;
        };

        node.addMessage = function addMessage(msgId, saveObject) {
            this.expectedMsgId.set(msgId,saveObject );
        };

        node.rmvMessage = function rmvMessage(msgId) {
            this.expectedMsgId.delete(msgId);
        };

        node.hasMessage = function hasMessage(msgId) {
            return this.expectedMsgId.has(msgId);
        };

        node.createLogMsg = function createLogMsg(msgId, status, tstamp, message, type, origin) {
            var logMsg = {};
            logMsg.type = type;
            logMsg.tstamp = tstamp;
            logMsg.tstampISO = ( ( tstamp !== undefined ) && ( tstamp !== null ) ) ? new Date(tstamp).toISOString() : undefined;
            if (msgId !== undefined)
                logMsg.msgId = msgId;
            if (status !== undefined)
                logMsg.status = status;
            logMsg.message = message;
            logMsg.origin = origin;
            return logMsg

        };

        node.checkRespMsgsTimeout = function checkRespMsgsTimeout(node) {

            var msgs = [];

            var currentTstamp = new Date().getTime();
            var curThis = this;
            this.mutex.runExclusive(function () {

                for (var [msgID, saveObject] of curThis.expectedMsgId.entries()) {
                    if (saveObject.tstamp < currentTstamp) {
                        curThis.rmvMessage(msgID);
                        msgs.push({ payload: curThis.createLogMsg(msgID, "Timeout", saveObject.tstamp, "Response has not been received", "RES", saveObject) });
                    }
                }
                node.send([null,null,null,null,msgs]);
            });
        };

        node.mqttManagement = function mqttManagement(outputNode, msg, defChnl, withTstamp, withReqResp, onDone, data, wiwRespContext) {
            ////// MQTT Management
            if ((msg.wiwMqttTopic === undefined) || (msg.wiwMqttTopic === null))
                msg.topic = defChnl;
            else
                msg.topic = msg.wiwMqttTopic;

            if ((msg.wiwMqttRetain === undefined) || (msg.wiwMqttRetain === null))
                msg.retain = false;
            else
                msg.retain = msg.wiwMqttRetain;

            if ((msg.wiwMqttQos === undefined) || (msg.wiwMqttQos === null))
                msg.qos = this.qos;
            else
                msg.qos = msg.wiwMqttQos;

            ///// Tstamp Management
            var tstamp = new Date().getTime();
            if (withTstamp)
                msg.payload.tstamp = tstamp;

            var curThis = this;
            this.mutex.runExclusive(function () {
                /////  MSGID Management
                if (curThis.msgId < 0)
                    curThis.msgId = 0;
                msg.payload.msgId = ++curThis.msgId;

                ///// ReqResp Management
                var reqResp;
                if (withReqResp === true) // Want reqResp
                    reqResp = ((msg.wiwReqResp !== undefined) && (msg.wiwReqResp !== null)) ? msg.wiwReqResp : curThis.reqResp ;
                else if (((withReqResp === undefined) || (withReqResp === null)) &&
                    (msg.wiwReqResp !== undefined) && (msg.wiwReqResp !== null)) // Use reqResp only if wiwReqResp is defined
                    reqResp = msg.wiwReqResp;
                else
                    reqResp = null;
                if (reqResp > 0) { // Add an expected message
                    msg.payload.reqResp = reqResp;
                    
                    curThis.addMessage(msg.payload.msgId.toString(), {msgId : msg.payload.msgId.toString(), 
                                                                tstamp : parseInt(tstamp) + parseInt(reqResp),
                                                                nodeName : outputNode.name,
                                                                nodeId : outputNode.id,
                                                                nodeType : outputNode.type, 
                                                                data : data, 
                                                                wiwRespContext : wiwRespContext });
                    }
                
                curThis.handleSendMsg(outputNode, msg);

                if ((onDone !== undefined) && (onDone !== null))
                    onDone();
            });
        };

    }

    RED.nodes.registerType("wiwMqttConfig", wiwMqttConfigNode);
}