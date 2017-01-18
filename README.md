Socketchat is a chat application library using websockets, written
in JavaScript for node.js to ease building of chat application easy using websockets.

This library relies on [WebSocket](https://www.npmjs.com/package/websocket) to create websocket server.

<a name="format"></a>
## Message format
The client communicate with server using JSON format with some important fields.
The server supports two operations as of now: authentication and messaging.
Clients cannot exchange messages without authenticating themselves.

Steps #1
--------
Authentication is used to register client's socket information in server, so that others can communicate using username of the user.
Authentication Message must be in the format : {type:'authenticate',username:'xyz',password:'1234'}

Steps #2
--------
Messaging also follows a certain format. Messages must be in the format
{type:'message',to:'username',message:'xyz'}


<a name="install"></a>
## Installation

```sh
npm install socketchat
```

<a name="example"></a>
## Server-side Example

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

## Client-side Example

```html

<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <title>Sample of web_socket.js</title>
  <link href="css/bootstrap.min.css" rel="stylesheet">
  <link href="css/style.css" rel="stylesheet">


</head>
<body onload="init();">
  <div class="login">
    <form onsubmit="login(); return false;" id="login">
      <input type="text" id="username" placeholder="username">
      <input type="password" id="password" placeholder="password">
      <button type="submit" class="btn btn-primary btn-block btn-large">Let me in.</button>
    </form>
    <form onsubmit="onSubmit(); return false;" id="message" style="display:none">
      <input type="text" id="to" placeholder="To">
      <textarea type="text" id="input" placeholder="message"></textarea>
      <button type="submit" class="btn btn-primary btn-block btn-large">Send</button><br>
      <button onclick="onCloseClick(); return false;" class="btn btn-primary btn-block btn-large">close</button>
    </form>
    <div id="log" style="color:white;height:300px;overflow-y: auto;overflow-x:hidden;"></div>
</div>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
<script src="js/bootstrap.min.js"></script>

  <script type="text/javascript" src="web_socket.js"></script>
  <script type="text/javascript">
    var ws;
    function init() {
      ws = new WebSocket("ws://localhost:1337/");

      // Set event handlers.
      ws.onopen = function() {
        output("Connection established");
      };
      ws.onmessage = function(e) {
        // e.data contains received string.
        var json=JSON.parse(e.data);
        console.log(json);
        if(json.type=='authentication'&&json.status=='success')
        {
          document.getElementById("login").style.display = "none";
          document.getElementById("message").style.display = "block";
        }
        else if(json.type=='authentication'&&json.status=='fail'){
          output("Login Failed");
        }
        else if(json.type=='message'){
          output("Message from " + json.from+" : "+json.message);
        }
      };
      ws.onclose = function() {
        output("onclose");
      };
      ws.onerror = function() {
        output("onerror");
      };

    }

    function onSubmit() {
      var input = document.getElementById("input");
      var to = document.getElementById("to");
      var data={type:'message'};
      data.message=input.value;
      data.to=to.value;
      // You can send message to the Web Socket using ws.send.
      if(input.value.length>0){
        ws.send(JSON.stringify(data));
        output("Send to "+to.value+" : "+input.value);
        input.value = "";
        input.focus();
      }

    }

    function login() {
      var username = document.getElementById("username");
      var password = document.getElementById("password");
      var data={type:'authenticate'};
      data.username=username.value;
      data.password=password.value;
      ws.send(JSON.stringify(data));
    }

    function onCloseClick() {
      ws.close();
    }

    function output(str) {
      var log = document.getElementById("log");
      log.innerHTML = "<strong>"+str + "</strong><br>"+new Date()+"<br><br>" + log.innerHTML;
    }

  </script>
</body>
</html>


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

  * <a href="#listen"><code><b>listen</b></code></a>
  * <a href="#authentication"><code><b>authentication</b></code></a>
  * <a href="#message"><code><b>message</b></code></a>
  * <a href="#error"><code><b>error</b></code></a>


-------------------------------------------------------
<a name="listen"></a>
## listen

Emitted when starting to listen
-------------------------------------------------------
<a name="authentication"></a>
### authentication

Emitted whenever a user tries to authenticate. Emits origin of the connection and status of authentication.
socketchat.on('authentication',function(origin,stat){
});
stat is a JSON in the format: {type:'authentication',status:'success'} if authentication is successful
otherwise  {type:'authentication',status:'fail'}
-------------------------------------------------------
<a name="message"></a>
### message

Emitted whenever a user sends message.
Messages are in the format:
{type:'message',to:'username',message:'xyz'}
-------------------------------------------------------
<a name="error"></a>
### error

Emitted when error occurs.
-------------------------------------------------------

<a name="license"></a>
## License

MIT
