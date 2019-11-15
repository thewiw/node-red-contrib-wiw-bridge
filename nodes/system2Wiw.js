module.exports = function (RED) {
    function system2WiwNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.configuration = RED.nodes.getNode(config.configuration);
        var node = this;
        node.on('input', function (msg) {
            if ((msg.wiwSystem === undefined) || (msg.wiwSystem === null))
                msg.wiwSystem = msg.payload;

            if ((msg.wiwSystem === undefined) || (msg.wiwSystem === null) || (this.configuration === undefined) || (this.configuration === null))
                return null;

            msg.payload = {};

            if ((msg.wiwSystem.resetCom !== undefined) || (msg.wiwSystem.resetCom !== null))
                msg.payload.resetCom = msg.wiwSystem.resetCom;
            if ((msg.wiwSystem.setLogWhiteList !== undefined) || (msg.wiwSystem.setLogWhiteList !== null))
                msg.payload.setLogWhiteList = msg.wiwSystem.setLogWhiteList;

            msg.wiwMqttQos = 2;
            msg.wiwMqttRetain = false;
            this.configuration.mqttManagement(node, msg, this.configuration.getChnlSystemOut(), false, false, this.configuration.reset(), msg.wiwSystem,msg.wiwRespContext);
        });
    }
    RED.nodes.registerType("system2Wiw", system2WiwNode);
}