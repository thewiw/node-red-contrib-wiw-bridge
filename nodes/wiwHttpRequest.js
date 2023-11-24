"use strict";

module.exports = function (RED) {
    function wiwHttpRequestNode(config) {
        RED.nodes.createNode(this, config);

        var node = this;

        this.name = config.name;
        this.method = ( config.method && config.method.trim().length > 0 ) ? config.method.trim().toUpperCase() : null;
        this.endpoint = ( config.endpoint && config.endpoint.trim().length > 0 ) ? config.endpoint : null;
        this.contentType = ( config.contenttype && config.contenttype.trim().length > 0 ) ? config.contenttype : null;
        this.timeout = config.timeout;
        this.configuration = RED.nodes.getNode(config.configuration);

        if ( this.method && this.method == "MSG.METHOD" )
            this.method = null;

        node.on("input", function (msg) {
            var data = null;

            try {
                if ( !data && msg.payload )
                    data = msg.payload;
            }
            catch ( err ) {
            }

            try {
                if ( !data && msg.body )
                    data = msg.body;
            }
            catch ( err ) {
            }

            try {
                if ( !data && msg.data )
                    data = msg.data;
            }
            catch ( err ) {
            }

            var query = {
                method: ( node.method ) ? node.method : msg.method,
                endpoint: ( node.endpoint ) ? node.endpoint : msg.endpoint,
                contentType : ( node.contentType ) ? node.contentType : msg.contentType,
                params: msg.params,
                data: data,
                timeout: ( node.timeout ) ? node.timeout : msg.timeout
            };

            node.configuration.query(msg, node, query);
        });
    }

    RED.nodes.registerType("wiwHttpRequest", wiwHttpRequestNode);
}