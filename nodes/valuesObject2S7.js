module.exports = function (RED) {
    function valuesObject2S7Node(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        var node = this;
        node.on('input', function (msg) {
            

            msg.variable = Object.keys(msg.wiwValues);
            msg.payload = Object.keys(msg.wiwValues).map(function(key){ // due to node v6 on IOT 2040
                return msg.wiwValues[key];
            });
            node.send(msg);
        });
    }
    RED.nodes.registerType("valuesObject2S7", valuesObject2S7Node);
}