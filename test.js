var socketchatlib=require('./index.js');
//Sample users list
var users={
  //"username":"password"
  "rx":"r123",
  "2":"1234",
  "3":"12345"
};
//Sample Authentication function
var auth=function(username,password){
  return (users[username]===password)
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
