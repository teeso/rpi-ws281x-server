var WebSocket = require('ws');
var ws = new WebSocket("ws://thinis.codingwell.net:8000");

ws.on("open",function(){
  ws.send(JSON.stringify({msg:"connected"}));
});

ws.on("message",function(message){
  message = JSON.parse(message);

  console.log(message);
});

module.exports = Comm;
