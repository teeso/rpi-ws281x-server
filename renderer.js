var events = require('events');
var util = require('util');

function Renderer(nextFrame) {
  var self = this;
  events.EventEmitter.call(this);

  var ledLength = 1;
  var count = 0;
  var handle = null;
  var pixelData = new Uint32Array();
  var pollStats = false;

  function render(){
    var begin = process.hrtime()
    nextFrame(pixelData, count++)
    self.emit("frame",pixelData);
    handle = setImmediate(render);
    if( pollStats ) {
      var diff = process.hrtime(begin);
      var duration = diff[0] * 1e3 + diff[1] / 1e6;
      self.emit("timing", duration );
      pollStats = false;
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

  this.pollStats = function(){
    pollStats = true;
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
