"use strict";
process.title = 'Embedded-Server';
var webSocketServer = require('websocket').server;
var http = require('http');
const EventEmitter = require('events');

class socketchat extends EventEmitter{

  constructor(port,authenticationFunction){
    super();
    this.port=port;
    //This function will be called during authentication process to verify user
    this.authenticationFunction=authenticationFunction;
  }

  listen(){
    var currClass=this;
    this.server = http.createServer(function(request, response) {});
    var fx=this.authenticationFunction;
    //Socket information will stored here. Each socket will be mapped to corresponding user
    var client_map={};

    this.server.listen(currClass.port, function() {
      currClass.emit('listen', 'Listening on port '+currClass.port);
    });

    var wsServer = new webSocketServer({httpServer: this.server});

    wsServer.on('connection', function(ws) {
        currClass.emit('connection', "url: "+ws.upgradeReq.url);
    });

    wsServer.on('request', function(request) {
        currClass.emit('request', request);
        var userName;
        var connection = request.accept(null, request.origin);
        connection.on('message', function(message) {
            if (message.type == 'utf8') { // accept only text
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
                                    currClass.emit('authentication', request.origin, reply);
                                    break;
                    case 'message':
                                    try{
                                      json.from=userName;
                                      (client_map[json.to]).socket.sendUTF(JSON.stringify(json));
                                      currClass.emit('message', json);
                                    }
                                    catch(e){
                                      var json = JSON.stringify({ type:'Error',message:"Recipient does not exist" });
                                      connection.sendUTF(json);
                                    }
                                    break;
                    default:
                                    currClass.emit('error', "Unknown type or no type present");
                                    break;
                  }
                }
                catch(e){
                  json = JSON.stringify({ type:'Error', status: "Failed to parse JSON" });
                  currClass.emit('error', e);
                  connection.sendUTF(json);
                }
            }
        });
        // user disconnected
        connection.on('close', function(connection) {
          currClass.emit('close', connection);
          delete client_map[userName];
        });
    });
  }
}

// websocket and http servers

module.exports=socketchat;
