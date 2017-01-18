"use strict";
process.title = 'Embedded-Server';
var webSocketsServerPort = 1337;

// websocket and http servers
var webSocketServer = require('websocket').server;
var http = require('http');

var client_map={};
var server = http.createServer(function(request, response) {});
const EventEmitter = require('events');
const myEmitter = new EventEmitter();
var name=["1","2","3"];

myEmitter.on('register', function(json,connection) {
  var reply={};
  reply.type="Register";
  if(name.indexOf(json.name)!=-1){
    client_map[json.name]={socket:connection};
    reply.status="success";
  }
  else {
    reply.status="fail";
  }
  json=JSON.stringify(reply);
  connection.sendUTF(json);
});


server.listen(webSocketsServerPort, function() {
    console.log((new Date()) + " Server is listening on port " + webSocketsServerPort);
});

var wsServer = new webSocketServer({httpServer: server});

wsServer.on('connection', function(ws) {
    console.log("url: ", ws.upgradeReq.url);
});

wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
    var connection = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function(message) {
        if (message.type === 'utf8') { // accept only text
            try{
              var json = JSON.parse(message.utf8Data);
              switch(json.type){
                case 'Register':
                                myEmitter.emit('register', json,connection);
                                break;
                case 'Message':
                                try{
                                  (client_map[json.to]).socket.sendUTF(JSON.stringify(json));
                                }
                                catch(e){
                                  console.log("Error");
                                  var json = JSON.stringify({ type:'Error',message:"Recipient does not exist" });
                                  connection.sendUTF(json);
                                }
                                break;
                default:        console.log('Unknown');
                                break;
              }
            }
            catch(e){
              json = JSON.stringify({ type:'Register', status: "fail" });
              connection.sendUTF(json);
              console.log(e);
            }
        }
    });
    // user disconnected
    connection.on('close', function(connection) {
            console.log((new Date()) + " Peer "
                + connection.remoteAddress + " disconnected.");
            delete client_map[userName];
    });

});
