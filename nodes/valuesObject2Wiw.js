module.exports = function (RED) {
    function valuesObject2WiwNode(config) {

        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.reqResp = config.reqResp;
        this.configuration = RED.nodes.getNode(config.configuration);
        var node = this;

        node.on('input', function (msg) {
            if ((msg.wiwValues === undefined) || (msg.wiwValues === null))
                msg.wiwValues = msg.payload;

            if ((msg.wiwSource === undefined) || (msg.wiwSource === null) || (msg.wiwValues === undefined) || (msg.wiwValues === null) || (this.configuration === undefined) || (this.configuration === null))
                return null;

            if ((msg.wiwTstamp === undefined) || (msg.wiwTstamp === null))
                msg.wiwTstamp = new Date().getTime();
            
            var arrayOfVals = [];
            var keys = Object.keys(msg.wiwValues);
            var values = Object.keys(msg.wiwValues).map(function(key){ // due to node v6 on IOT 2040
                return msg.wiwValues[key];
            });

            for (var idxVal = 0; idxVal < Object.keys(msg.wiwValues).length; idxVal++) {
                arrayOfVals.push([msg.wiwSource.concat("#", keys[idxVal]), msg.wiwTstamp, values[idxVal]]);
            }

            msg.payload = {
                vals: arrayOfVals
            }
            var dataSave  = { vals : msg.payload.vals};

            this.configuration.mqttManagement(node, msg, this.configuration.getChnlValueOut(), false, undefined, undefined,dataSave,msg.wiwRespContext);
        });
    }
    RED.nodes.registerType("valuesObject2Wiw", valuesObject2WiwNode);
}