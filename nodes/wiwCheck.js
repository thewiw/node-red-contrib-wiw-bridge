module.exports = function (RED) {
    function wiwCheckNode(config) {
        RED.nodes.createNode(this, config);
        this.name = config.name;
        this.configuration = RED.nodes.getNode(config.configuration);
        this.sendMsgsCount = 0;
        this.sendMsgsLostCount = 0;
        this.sendMsgsTotalLostCount = 0;
        var node = this;
        node.on('input', function (msg) {
            if ((this.configuration === undefined) || (this.configuration === null))
                return null;

            var connectionChanged = false;

            var sendMsgs = null;
            if ((msg.wiwConnected !== undefined) && (msg.wiwConnected !== null)){
                if((this.configuration.isConnected() === false) && (msg.wiwConnected===true))
                    sendMsgs = this.configuration.popSendMsgs();

                
                connectionChanged = ( this.configuration.isConnected() != msg.wiwConnected );

                this.configuration.setConnected(msg.wiwConnected);
            }

            if ( ( connectionChanged ) ||
                 ( this.sendMsgsCount != this.configuration.sendMsgs.length ) ||
                 ( this.sendMsgsLostCount != this.configuration.sendMsgsLostCount ) ||
                 ( this.sendMsgsTotalLostCount != this.configuration.sendMsgsTotalLostCount ) ) {
                this.sendMsgsCount = this.configuration.sendMsgs.length;
                this.sendMsgsLostCount = this.configuration.sendMsgsLostCount;
                this.sendMsgsTotalLostCount = this.configuration.sendMsgsTotalLostCount;

                msg.payload = {
                    connected : this.configuration.isConnected(),
                    sendMsgsCount : this.sendMsgsCount,
                    sendMsgsLostCount : this.sendMsgsLostCount,
                    sendMsgsTotalLostCount : this.sendMsgsTotalLostCount
                }
            }
            else
                msg = null;

            node.send([msg,sendMsgs]);
        });
    }
    RED.nodes.registerType("wiwCheck", wiwCheckNode);
}