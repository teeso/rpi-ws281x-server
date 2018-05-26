var events = require('events');
var util = require('util');
var WebSocket = require('ws');
var _ = require('lodash');
var moment = require('moment');
var persist = require("./persist");
const socketio = require('socket.io-client');

var Session = function(url){
  var session = this;
  var ws = null;
  const MAX_BACKOFF = 60;//seconds
  events.EventEmitter.call(this);
  
  function hello() {
    session.send({msg:"hello",id:persist.getId()});
  }

  function open() {
    ws = socketio('wss://thinis.codingwell.net',{path:'/leds'});

    ws.on("connect",function(){
      hello();
      session.log("Connected to Server");
    });
    ws.on("message",function(message){
      try {
        message = JSON.parse(message);
      } catch(e) {
        session.error('Non-JSON Message:', message);
        return;
      }
      switch(message.msg) {
        case "changeId":
          if(message.id && message.id != "") {
            persist.setId(message.id);
            hello();
          } else {
            session.error("Invalid ID change request", message.id);
          }
          break;
        case "pollStats":
          session.emit("pollStats");
          break;
        default:
          session.error('Unkown Message:', message);
      }
    });
    ws.on("error",function(){
      if(ws && ws.readyState === WebSocket.CONNECTING) return;
      session.error("WS error",arguments);
    });
    ws.on('ping', function(){ ws.emit('pong')});
  }

this.send = function(message) {
  if(ws) {
    ws.send(JSON.stringify(message),function ack(error){
      if(error) {
        session.error("send error")
      }
    });
  }
}

 this.log = function(){
   var args = _.toArray(arguments);
   var now = new Date();
   args.unshift('[' + moment(now).format("YYYYMMDD-HHmmss") + ']');
   console.log.apply(console,args);
 }
 this.error = function(){
   var args = _.toArray(arguments);
   var now = new Date();
   args.unshift('[' + moment(now).format("YYYYMMDD-HHmmss") + ']');
   console.error.apply(console,args);
 }

 open();
}
util.inherits(Session, events.EventEmitter);

module.exports = Session;
/* vim:set ts=2 sw=2: */
