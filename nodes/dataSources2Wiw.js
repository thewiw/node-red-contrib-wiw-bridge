module.exports = function (RED) {
    function dataSources2WiwNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;

        this.configuration = RED.nodes.getNode(config.configuration);
        var node = this;
        node.on('input', function (msg) {
            if ((msg.wiwDataSources === undefined) || (msg.wiwDataSources === null))
                msg.wiwDataSources = msg.payload;
            if ((msg.wiwDataSources === undefined) || (msg.wiwDataSources === null) || (this.configuration === undefined) || (this.configuration === null))
                return null;

            var arrayOfSources = Array(Object.keys(msg.wiwDataSources).length);
            var valTwoWay;
            var dataSave={datasourcesIds : []};
            
            for (var idxSource = 0; idxSource < Object.keys(msg.wiwDataSources).length; idxSource++) {
                msgSource = msg.wiwDataSources[idxSource]
                if (msgSource.twoWay === false || (msgSource.twoWay === undefined))
                    valTwoWay = false;
                else valTwoWay = true;
                if ((msgSource.displayName === undefined) || (msgSource.displayName === null)) {
                    if ((msg.dispName !== undefined) && (msgSource.dispName !== null)) {
                        msg.displayName = msg.dispName
                    }
                }
                arrayOfSources[idxSource] = { id: msgSource.source.concat("#", msgSource.name), name: ( msgSource.dispName ) ? msgSource.dispName : msgSource.displayName, type: msgSource.type, unit: msgSource.unit, twoWay: valTwoWay };
                dataSave.datasourcesIds.push(msgSource.source.concat("#", msgSource.name));
            }

            msg.payload = {
                datasources: arrayOfSources
            }

            this.configuration.mqttManagement(node, msg, this.configuration.getChnlDeclareOut(), true, true, undefined, dataSave,msg.wiwRespContext);
        });
    }
    RED.nodes.registerType("dataSources2Wiw", dataSources2WiwNode);
}