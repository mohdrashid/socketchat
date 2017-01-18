Socketchat is a chat application library using websockets, written
in JavaScript for node.js to ease building of chat application easy using websockets.

This library relies on [WebSocket](https://www.npmjs.com/package/websocket) to create websocket server.

<a name="install"></a>
## Installation

```sh
npm install socketchat
```

<a name="example"></a>
## Example

```js
var socketchatlib=require('./app.js');
//Sample users list
var users={
  //"username":"password"
  "rx":"r123",
  "2":"1234",
  "3":"12345"
};
//Sample Authentication function
var auth=function(username,password){
  return (users[username]==password)
}
//Creating a object of the library.
//Passing portnumber and authentication function
var socketchat=new socketchatlib(1337,auth);
//Start listening in the specified port
socketchat.listen();
//Upon successfully listening this event will be fired
socketchat.on('listen',function(message){
  console.log(message);
});
//Whenever a client tries authenticate, this event will be fired
socketchat.on('authentication',function(origin,stat){
  console.log(origin+": "+JSON.stringify(stat));
});
//When users exchange message, this event is also fired
socketchat.on('message',function(message){
  console.log("Message: "+JSON.stringify(message));
});
//Errors can be listener using this event listener
socketchat.on('error',function(err){
  console.log("Error: "+err);
});

```

output:
```
Connected
listening on port 1337

```


<a name="api"></a>
## API

  * <a href="#object"><code>new <b>socketchat()</b></code></a>
  * <a href="#listen"><code>socketchat.<b>listen()</b></code></a>

-------------------------------------------------------
<a name="object"></a>
### new socketchat(port,authenticationFunction)

The passed port number is used for listening and the passed authentication function is used to authenticate users.

-------------------------------------------------------
<a name="request"></a>
### socketchat.listen()

Starts listening on the port number passed in the constructor

-------------------------------------------------------

<a name="Events"></a>
## Events

  * <a href="#object"><code><b>listen</b></code></a>
  * <a href="#listen"><code><b>authenticate</b></code></a>

-------------------------------------------------------
<a name="listen"></a>

Emitted when starting to listen;

-------------------------------------------------------
<a name="request"></a>
### socketchat.listen()

Starts listening on the port number passed in the constructor

-------------------------------------------------------

<a name="license"></a>
## License

MIT
