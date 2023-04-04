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

            var valTwoWay;
            var arrayOfSources = Array(Object.keys(msg.wiwDataSources).length);
            var dataSave={datasourcesIds : []};

            for (var idxSource = 0; idxSource < Object.keys(msg.wiwDataSources).length; idxSource++) {
                msgSource = msg.wiwDataSources[idxSource]
                if (msgSource.delete === true) {
                    arrayOfSources[idxSource] = {
                        id: msgSource.source.concat("#", msgSource.name),
                        delete: true
                    };
                }
                else {
                    valTwoWay = (msgSource.twoWay === true) ? true : false;
                    arrayOfSources[idxSource] = {
                        id: msgSource.source.concat("#", msgSource.name),
                        name: ( msgSource.dispName && msgSource.dispName.trim().length > 0 ) ? msgSource.dispName : msgSource.displayName,
                        type: msgSource.type,
                        unit: msgSource.unit,
                        twoWay: valTwoWay
                    };
                }

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