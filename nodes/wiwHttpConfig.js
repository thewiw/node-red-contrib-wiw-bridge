"use strict";

module.exports = function (RED) {
    const axios = require("axios");
    const asyncMutex = require('async-mutex');

    const FormData = require('form-data');

    function wiwHttpConfigNode(config) {
        RED.nodes.createNode(this, config);

        this.mutex = new asyncMutex.Mutex();

        this.name = config.name;
        this.url = config.url;
        this.timeout = ( config.timeout && config.timeout > 0 ) ? config.timeout : 30000;
        this.followRedirect = config.followRedirect;
        this.token = this.credentials.token;

        this.bearerToken = null;
        this.bearerTokenTstamp = null;

        if ( this.url ) {
            this.url = this.url.trim();
            while ( this.url.endsWith('/') || this.url.endsWith('?') || this.url.endsWith('&') || this.url.endsWith('#') )
                this.url = this.url.substring(0, this.url.length - 1);
        }

        var node = this;

        node._onQueryResp = function _onQueryResp(msg, context, param, resp) { // Called when query is done
            if ( !context ) {
                console.log("wiwHttp critical error : context does not exist");
                return;
            }

            if ( msg && resp && resp.status >= 400 )
                context.error ( "Failed query to endpoint '" + msg.endpoint + "' : " + resp.status );

            if ( !node.bearerToken )
                context.status ( { fill:"red", shape:"ring", text:"disconnected" } );
            else
                context.status ( { fill:"green", shape:"dot", text:"connected" } );

            if ( !msg )
                msg = { status:-1, endpoint:"", payload:null };

            if ( resp ) {
                msg.status = resp.status;
                msg.payload = resp.data;
            }
            else {
                context.warn("wiwHttp warning for '" + msg.method + " " + msg.endpoint + "' : response does not exist");

                msg.status = -1;
                msg.payload = null;
            }

            context.send(msg);
        }

        node._onRequestResp = function _onRequestResp(msg, resp, loginIfNeeded, callback, callbackContext, callbackParam) {
            if ( !resp || !callback ) {
                node._onQueryResp(msg, callbackContext, callbackParam, resp);
                return;
            }

            if ( resp.status >= 200 && resp.status <= 299 ) { // Success
                callback(msg, callbackContext, callbackParam, resp);
                return;
            }
            else if ( resp.status >= 400 && resp.status <= 599 ) { // Error
                try {
                    if ( loginIfNeeded && resp.data && resp.data.toLowerCase().includes("passed token is not") )
                        node._login(msg, callbackContext, callbackParam);
                    else
                        node._onQueryResp(msg, callbackContext, callbackParam, resp);
                }
                catch ( err ) {
                    node._onQueryResp(msg, callbackContext, callbackParam, resp);
                }
                return;
            }
            else { // What's this ?
                node._onQueryResp(msg, callbackContext, callbackParam, resp);
                return;
            }
        }

        node._request = function _request(msg, query, loginIfNeeded, callback, callbackContext, callbackParam) {
            if ( !query || !query.method || !query.endpoint ) {
                if ( callbackContext )
                    callbackContext.error("wiwHttp error for '" + ( ( msg ) ? msg.method + " " + msg.endpoint : "" ) + "' : query is empty or is missing some attributes");
                else
                    console.log("wiwHttp error for '" + ( ( msg ) ? msg.method + " " + msg.endpoint : "" ) + "' : query is empty or is missing some attributes");
                node._onQueryResp(msg, callbackContext, callbackParam, {status: -1});
                return;
            }

            query.method = query.method.trim().toUpperCase();

            query.url = node.url;
            query.url += ( query.endpoint.startsWith('/') ) ? query.endpoint : '/' + query.endpoint;

            query.timeout = ( query.timeout && query.timeout > 0 ) ? query.timeout : node.timeout;
            query.headers = { 'Content-Type': ( query.contentType ) ? query.contentType : 'application/json' };
            if ( node.bearerToken )
                query.headers['Authorization'] = 'Bearer ' + node.bearerToken;

            if ( query.contentType == 'multipart/form-data' && query.data ) {
                const queryForm = new FormData();
                
                var keys = Object.keys(query.data);
                for ( var idx = 0; idx < keys.length; idx++ )
                    queryForm.append(keys[idx], query.data[keys[idx]]);
                query.data = queryForm;
            }

            // Limit to 1 query at a time
            /*
            console.log(node.mutex);
            node.mutex.acquire(function (release) {
                console.log("mutex : ", query);
                axios(query)
                    .then(function (resp) {
                        release();
                        node._onRequestResp(msg, resp, loginIfNeeded, callback, callbackContext, callbackParam);
                    })
                    .catch(function (err) {
                        release();
                        node._onRequestResp(msg, err.response, loginIfNeeded, callback, callbackContext, callbackParam);
                    });
            });
            */
            axios(query)
                .then(function (resp) {
                    node._onRequestResp(msg, resp, loginIfNeeded, callback, callbackContext, callbackParam);
                })
                .catch(function (err) {
                    if ( err.response )
                        node._onRequestResp(msg, err.response, loginIfNeeded, callback, callbackContext, callbackParam);
                    else
                        node._onRequestResp(msg, {status: -1}, loginIfNeeded, callback, callbackContext, callbackParam);
                });
        }

        node._handleQuery = function _handleQuery(msg, callNode, query, loginIfNeeded) { // Call query
            node._request(msg, query, loginIfNeeded, node._onQueryResp, callNode, query);
        }

        node._onLoginResp = function _onLoginResp(msg, context, param, resp) { // Called when login is done
            if ( resp.status == 200 && resp.data && resp.data.token ) {
                node.bearerToken = resp.data.token;
                node.bearerTokenTstamp = Date.now();
                node._handleQuery(msg, context, param, false);
            }
            else {
                node.bearerToken = null;
                node.bearerTokenTstamp = null;
                node._onQueryResp(msg, context, param, resp);
            }
        }

        node._login = function _login(msg, callNode, query) { // Call login
            node.bearerToken = null;
            node.bearerTokenTstamp = null;
            node._request(msg, { method: 'POST', endpoint: 'api/v1/logintoken', data: { token: node.token } }, false, node._onLoginResp, callNode, query );
        }

        node.query = function query(msg, callNode, query) { // Do query, try to login if not done yet
            if ( !node.bearerToken ) // Login not done yet
                node._login(msg, callNode, query);
            else // Login already done
                node._handleQuery(msg, callNode, query, true);
        } 
    }

    RED.nodes.registerType("wiwHttpConfig", wiwHttpConfigNode, {
        credentials: {
            token: {
              type: "password"
            }
        }
    });
}