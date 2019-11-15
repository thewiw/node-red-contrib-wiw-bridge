module.exports = function (RED) {
    function wiw2ValuesObjectNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.configuration = RED.nodes.getNode(config.configuration);
        var node = this;
        node.on('input', function (msg) {
            if ((typeof msg.payload === 'string' || msg.payload instanceof String)) // due to node v6 on IOT 2040
                msg.payload = JSON.parse(msg.payload);

            if ((msg.payload.msgId === undefined) || (msg.payload.msgId === null) || (msg.payload.vals === undefined) || (msg.payload.vals === null) || (this.configuration === undefined) || (this.configuration === null))
                return null;

            

            var msgId = msg.payload.msgId;


            var msgs = [];

            var values = new Map(), value, valueKey;

            var splittedId;
            var msgVal, valSource, valName, valTstamp;

            for (var idxVal = 0; idxVal < Object.keys(msg.payload.vals).length; idxVal++) {
                msgVal = msg.payload.vals[idxVal];
                if (msgVal.length == 3) {
                    splittedId = msgVal[0].split('#');
                    if (splittedId && splittedId.length == 2) {
                        valSource = splittedId[0];
                        valName = splittedId[1];
                        valTstamp = parseInt(msgVal[1]);

                        valueKey = valSource + '#' + valTstamp;
                        value = values.get(valueKey);
                        if (!value) {
                            value = {};
                            values.set(valueKey, value);
                        }
                        value[valName] = msgVal[2];
                    }
                }
            }
            for (var [key, val] of values.entries()) {
                splittedId = key.split('#');
                msgs.push({
                    wiwMsgId: msgId,
                    wiwSource: splittedId[0],
                    wiwTstamp: Number(splittedId[1]),
                    wiwValues: val
                });
            }
            node.send([msgs]);

        });
    }
    RED.nodes.registerType("wiw2ValuesObject", wiw2ValuesObjectNode);
}