module.exports = function (RED) {
    function entities2WiwNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.reqResp = config.reqResp;
        this.configuration = RED.nodes.getNode(config.configuration);
        var node = this;

        node.on('input', function (msg) {
            if ((msg.wiwEntities === undefined) || (msg.wiwEntities === null))
                msg.wiwEntities = msg.payload;
            if ((msg.wiwEntities === undefined) || (msg.wiwEntities === null) || (this.configuration === undefined) || (this.configuration === null))
                return null;

            var msgEntity, msgProperty;
            msg.payload = {};
            msg.payload.datasources = [];
            msg.payload.entities = [];
            var dataSave={wiwSource:[], datasourcesIds : [], entitiesIds: []};

            for (var idxEntity = 0; idxEntity < msg.wiwEntities.length; idxEntity++) {
                var entityProperties = [];
                msgEntity = msg.wiwEntities[idxEntity];

                if (msgEntity.properties) {
                    for (var idxProperty = 0; idxProperty < msgEntity.properties.length; idxProperty++) {
                        msgProperty = msgEntity.properties[idxProperty];
                        var entityProperty = { name: msgProperty.dispName, type: msgProperty.type, unit: msgProperty.unit };

                        if (msgProperty.datasource) {
                            var id = msgProperty.datasource.source.concat("#", msgProperty.datasource.name);
                            entityProperty.dsId = id;
                            if(! dataSave.wiwSource.includes(msgProperty.datasource.source))
                                dataSave.wiwSource.push(msgProperty.datasource.source);
                        
                            if (msgProperty.datasource.dispName) {
                                dataSave.datasourcesIds.push(id);
                                msg.payload.datasources.push({
                                    id: id,
                                    name: msgProperty.datasource.dispName,
                                    type: msgProperty.datasource.type,
                                    unit: msgProperty.datasource.unit,
                                    twoWay: (msgProperty.datasource.twoWay === true) ? true : false
                                });
                            }
                        }
                        else if (msgProperty.value)
                            entityProperty.value = msgProperty.value;

                        entityProperties.push(entityProperty);
                    }
                }
                dataSave.entitiesIds.push(msgEntity.dispName);
                msg.payload.entities.push({
                    name: msgEntity.dispName,
                    description: msgEntity.dispDescription,
                    reference: msgEntity.reference,
                    template: msgEntity.template,
                    parent: msgEntity.parent,
                    properties: entityProperties
                });
            }

            this.configuration.mqttManagement(node, msg, this.configuration.getChnlDeclareOut(), true, true, undefined, dataSave,msg.wiwRespContext);
        });
    }
    RED.nodes.registerType("entities2Wiw", entities2WiwNode);
}