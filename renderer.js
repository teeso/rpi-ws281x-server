var events = require('events');
var util = require('util');

function Renderer(nextFrame) {
  var self = this;
  events.EventEmitter.call(this);

  var ledLength = 1;
  var count = 0;
  var handle = null;
  var pixelData = new Uint32Array();

  function render(){
    var begin = process.hrtime()
    nextFrame(pixelData, count++)
    self.emit("frame",pixelData);
    handle = setImmediate(render);
    if( count % 500 == 0 ) {
      console.log("ER", process.hrtime(begin)[1]/1000000 );
    }
  }

  function start(){
    if(!handle) {
      handle = setImmediate(render);
    }
  }
  function stop(){
    clearImmediate(handle);
    handle = null;
  }

  this.xON = function(){
    start();
  }
  this.xOFF = function(){
    stop();
  }
  this.setLedLength = function(length){
    ledLength = length;
    pixelData = new Uint32Array(ledLength);
  }
}
util.inherits(Renderer, events.EventEmitter);

module.exports = Renderer;
