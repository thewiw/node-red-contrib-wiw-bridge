"use strict";

module.exports = function (RED) {
    const axios = require("axios");
    const asyncMutex = require('async-mutex');

    const FormData = require('form-data');

    function wiwHttpConfigNode(config) {
        RED.nodes.createNode(this, config);

        this.mutex = new asyncMutex.Mutex();

        //console.log("wiwHttpConfigNode()", config);

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

        node._onRequestResponse = function _onRequestResponse(msg, resp, loginIfNeeded, callback, callbackContext, callbackParam) {
            if ( resp.status >= 200 && resp.status < 300 )
                callback(msg, callbackContext, callbackParam, resp);
            else if ( resp.status >= 400 && resp.status < 600 ) {
                //console.log(resp);
                if ( loginIfNeeded && ( resp.status == 403 || resp.status == 500 ) )
                    node._login(msg, callbackContext, callbackParam);
                else
                    callback(msg, callbackContext, callbackParam, resp);
            }
            else {
                resp.status = 0;
                callback(msg, callbackContext, callbackParam, resp);
            }
        }

        node._request = function _request(msg, query, loginIfNeeded, callback, callbackContext, callbackParam) {
            console.log('request 1');

            if ( !query.method || !query.endpoint ) {
                console.log('request error', query);
                return;
            }

            query.method = query.method.trim().toUpperCase();

            query.url = node.url;
            query.url += ( query.endpoint.startsWith('/') ) ? query.endpoint : '/' + query.endpoint;

            query.timeout = ( query.timeout && query.timeout > 0 ) ? query.timeout : node.timeout;
            query.headers = { 'Content-Type': ( query.contentType ) ? query.contentType : 'application/json' };
            if ( node.bearerToken )
                query.headers['Authorization'] = 'Bearer ' + node.bearerToken;

            // Limit to 1 query at a time
            /*
            this.mutex.acquire(function (release) {
                console.log("mutex : ", query);
                axios(query)
                    .then(function (response) {
                        console.log(response);
                        release();
                    })
                    .catch(function (error) {
                        console.log(error);
                        release();
                    });
            });
            */

            console.log('request 2');

            if ( query.contentType == 'multipart/form-data' && query.data ) {
                const queryForm = new FormData();
                
                var keys = Object.keys(query.data);
                for ( var idx = 0; idx < keys.length; idx++ )
                    queryForm.append(keys[idx], query.data[keys[idx]]);
                query.data = queryForm;
            }

            console.log('request 3');

            axios(query)
                .then(function (resp) {
                    node._onRequestResponse(msg, resp, loginIfNeeded, callback, callbackContext, callbackParam);
                })
                .catch(function (err) {
                    console.log("axios error", err);
                });
        }

        node._onQueryResp = function _onQueryResp(msg, context, param, resp) { // Called when query is done
            console.log('onQueryResp');

            msg.status = resp.status;
            msg.payload = resp.data;

            console.log('done', msg);
            context.send(msg);
        }

        node._handleQuery = function _handleQuery(msg, callNode, query, loginIfNeeded) { // Call query
            console.log('handleQuery');

            node._request(msg, query, loginIfNeeded, node._onQueryResp, callNode, null);
        }

        node._onLoginResp = function _onLoginResp(msg, context, param, resp) { // Called when login is done
            console.log('onLoginResp');

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
            console.log('login');

            node.bearerToken = null;
            node.bearerTokenTstamp = null;
            node._request(msg, { method: 'POST', endpoint: 'api/v1/logintoken', data: { token: node.token } }, false, node._onLoginResp, callNode, query );
        }

        node.query = function query(msg, callNode, query) { // Do query, try to login if not done yet
            console.log('query');

            if ( !node.bearerToken ) // Login not done yet
                node._login(msg, callNode, query);
            else // Login done
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