module.exports = function (RED) {
    function wiwLogsNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.configuration = RED.nodes.getNode(config.configuration);
        var node = this;
        node.on('input', function (msg) {
            
            if (msg.payload === "MSG TIMEOUT")
                    this.configuration.checkRespMsgsTimeout(this);
            else {
                if ((typeof msg.payload === 'string' || msg.payload instanceof String)) // due to node v6 on IOT 2040
                    msg.payload = JSON.parse(msg.payload);

                var logMsg = msg.payload;
            
                if ((logMsg !== undefined) && (logMsg !== null) && (logMsg.length === 3) && (!(this.configuration === undefined) || (!(this.configuration === null)))) {
                    //matchng expected format
                    msg.payload = {};

                    if (logMsg[0] === "RES") { //type = "RES"
                        var splittedMsg = JSON.parse(logMsg[2]);
                        if ( ( splittedMsg !== undefined ) && ( splittedMsg !== null ) && ( splittedMsg.length >= 1 ) ) {
                            var msgId = splittedMsg[0];
                            
                            if (this.configuration.hasMessage(msgId)) { //known msgId
                                msg.payload = this.configuration.createLogMsg(msgId,
                                                                            ( splittedMsg.length >= 2 ) ? splittedMsg[1] : undefined,
                                                                            Date.parse(logMsg[1]),
                                                                            ( splittedMsg.length >= 3 ) ? splittedMsg[2] : undefined,
                                                                            logMsg[0], 
                                                                            this.configuration.expectedMsgId.get(msgId)) ;
                                this.configuration.rmvMessage(msgId);
                                node.send([null, msg, null, null,null]);
                            }
                            else //unknown msgId
                            {
                                msg.payload = this.configuration.createLogMsg(msgId,
                                                                            ( splittedMsg.length >= 2 ) ? splittedMsg[1] : undefined,
                                                                            Date.parse(logMsg[1]),
                                                                            ( splittedMsg.length >= 3 ) ? splittedMsg[2] : undefined,
                                                                            logMsg[0],
                                                                            undefined);
                                node.send([null, null, msg, null,null]);
                            }
                        }
                        else {
                            msg.payload = this.configuration.createLogMsg(undefined,
                                                                        undefined,
                                                                        Date.parse(logMsg[1]),
                                                                        undefined,
                                                                        logMsg[0], undefined);
                            node.send([null, null, msg, null,null]);
                        }
                    }
                    else { //type != "RES"
                        msg.payload = this.configuration.createLogMsg(undefined, 
                                                                    undefined, 
                                                                    Date.parse(logMsg[1]), 
                                                                    logMsg[2], 
                                                                    logMsg[0],
                                                                    undefined);
                        node.send([msg, null, null, null,null]);
                    }
                }
                else // not matching expected format
                    node.send([null, null, null, msg, null]);
        }
        });
    }
    RED.nodes.registerType("wiwLogs", wiwLogsNode);
}