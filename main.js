console.log("Starting...");

var ws281x = require('rpi-ws281x-native');
var _ = require('lodash');
var base64 = require('base64-js')
var sleep = require('sleep');

const debugtiming = true;

var NUM_LEDS = parseInt(process.argv[2], 10) || 50*4;
var pixelData = new Uint32Array(NUM_LEDS);

ws281x.init(NUM_LEDS);

var abort = false;

function quit() {
  if(!abort) {
    ws281x.reset();
    abort=true;
    setTimeout(function () { process.exit(0); },50);
    console.log("Parent exiting");
  }
}

// ---- trap the Signals and reset before exit
process.on('SIGINT', quit);
process.on('SIGTERM', quit);

process.on("exit", quit);

const fps = 1;
const framems = 1000 / fps;

// ---- animation-loop
const hrstart = process.hrtime();
const starttime = hrstart[0] * 1e3 + hrstart[1] / 1e6;
var pollStats = false;

var flast = hrstart;
var fdiff = null;

var msnext = starttime;

function doit()
{
  var fstart = process.hrtime();
  if(abort) return;

  var msnow = fstart[1] / 1e6 + fstart[0] * 1e3;
  if( msnow < msnext)
  {
    if( msnext - msnow < 3 ) {
      setImmediate(doit);
      sleep.usleep(100);
    } else {
      setTimeout(doit,1);
    }
    return;
  } else {
    setTimeout(doit,Math.max(1,framems - 10));
  }
  msnext = msnext + framems;

  ws281x.render(pixelData);

  if( pollStats ) {
    var period = ((fstart[0] - flast[0]) * 1e3 + (fstart[1] - flast[1]) / 1e6);
    var duration = fdiff[0] * 1e3 + fdiff[1] / 1e6;
    child.send({"msg":"timing","period":period,"duration":duration });
    pollStats = false;
  }
  flast = fstart;

  var frame = display.takeFrame();
  if(frame) {
    var buffer = base64.toByteArray(frame).buffer;
    pixelData = new Uint32Array( buffer );
  }
  fdiff = process.hrtime(fstart);
}


var child_process = require("child_process");
var events = require('events');
var Queue = require("./Queue");
var util = require('util');

function Display(maxQueueLength) {
  events.EventEmitter.call(this);
  //XOFF
  //XON
  //bufferUnderrun

  var frameQueue = new Queue();

  this.bufferFrame = function(frame){
    frameQueue.enqueue(frame);
    var length = frameQueue.getLength()
    if( length >= maxQueueLength ) {
      this.emit("XOFF");
    }
  }
  this.takeFrame = function(){
    var length = frameQueue.getLength()
    if( length === maxQueueLength ) {
      this.emit("XON");
    }
    if( length === 0 ) {
      this.emit("bufferUnderrun");
    }
    return frameQueue.dequeue();
  }
}
util.inherits(Display, events.EventEmitter);

var display = new Display(5);
var child = child_process.fork("./child");

var primed = false;

display.on("bufferUnderrun",function(){
  if(primed) {
    child.send({msg:"underrun"});
    primed = false;
  }
});

display.on("XON",function(){
  child.send({msg:"XON"});
});

display.on("XOFF",function(){
  if(!primed) {
    child.send({msg:"primed"});
    primed = true;
  }
  child.send({msg:"XOFF"});
});

child.on('message', function(m) {
  switch(m.msg) {
    case "frame":
      display.bufferFrame(m.frame);
      break;
    case "pollStats":
      pollStats = true;
      break;
    default:
      console.error("Unknown message from child process:", m);
  }
});

child.on("disconnect", function(){
  console.log("Child disconnected");
  process.exit();
});

child.once("message",function(){
  setImmediate(doit);
})

child.send({msg:"ledLength", length:NUM_LEDS });
child.send({msg:"XON"});//Start the renderer

// vim: set ts=2 sw=2 :
