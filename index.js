"use strict";
var webSocketServer = require('websocket').server;
var http = require('http');
const EventEmitter = require('events');

class SocketChat extends EventEmitter{

    /**
     * Constructor
     * @param port : The port to listen to
     * @param authenticationFunction : The function to authenticate clients
     */
    constructor(port,authenticationFunction){
        super();
        this.port=port;
        //This function will be called during authentication process to verify user
        this.authenticationFunction=authenticationFunction;
    }

    /**
     * The function to call to start http connection
     */
    listen(){
        var self=this;
        this.server = http.createServer(function(request, response) {});
        var fx=this.authenticationFunction;
        //Socket information will stored here. Each socket will be mapped to corresponding user
        var client_map={};

        this.server.listen(self.port, function() {
            self.emit('listen', 'Listening on port '+self.port);
        });

        var wsServer = new webSocketServer({httpServer: this.server});

        wsServer.on('connection', function(ws) {
            self.emit('connection', "url: "+ws.upgradeReq.url);
        });

        wsServer.on('request', function(request) {
            self.emit('request', request);
            var userName;
            var connection = request.accept(null, request.origin);
            connection.on('message', function(message) {
                if (message.type === 'utf8') { // accept only text
                    try{
                        var json = JSON.parse(message.utf8Data);
                        switch(json.type){
                            case 'authenticate':
                                var reply={};
                                reply.type="authentication";
                                if(fx(json.username,json.password))
                                {
                                    userName=json.username;
                                    client_map[json.username]={socket:connection};
                                    reply.status="success";
                                }
                                else {
                                    reply.status="fail";
                                }
                                json=JSON.stringify(reply);
                                connection.sendUTF(json);
                                self.emit('authentication', request.origin, reply);
                                break;
                            case 'message':
                                try{
                                    json.from=userName;
                                    (client_map[json.to]).socket.sendUTF(JSON.stringify(json));
                                    self.emit('message', json);
                                }
                                catch(e){
                                    json = JSON.stringify({ type:'Error',message:"Recipient does not exist" });
                                    self.emit('error', "Recipient does not exist");
                                    connection.sendUTF(json);
                                }
                                break;
                            default:
                                self.emit('error', "Unknown type or no type present");
                                break;
                        }
                    }
                    catch(e){
                        json = JSON.stringify({ type:'Error', status: "Failed to parse JSON" });
                        self.emit('error', e);
                        connection.sendUTF(json);
                    }
                }
            });
            // user disconnected
            connection.on('close', function(connection) {
                self.emit('close', connection);
                delete client_map[userName];
            });
        });
    }
}

module.exports=SocketChat;
