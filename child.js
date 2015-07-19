console.log("Sandbox process starting...");

var Sandbox = require("./sandbox-require");
var sandbox = new Sandbox();

/*
try {
var untrusted = sandbox("http://127.0.0.1:8080/effect.js");
} catch( err ) {
  console.error("Error requiring untrusted.js", err);
}
*/

//var effect = require('./effect');

var base64 = require('base64-js')

var Renderer = require('./renderer');

function invokeUntrusted(buffer,count) {
  try {
    var untrusted = sandbox("http://127.0.0.1:8080/effect.js");
    untrusted.nextFrame(buffer,count);
  } catch (e) {
    console.error(e);
  }
}

var renderer = new Renderer( invokeUntrusted );

renderer.on("frame",function(frame){
  var encoded = base64.fromByteArray(Uint8Array(frame.buffer))
  process.send({msg:"frame", "frame":encoded});
})

process.on('message', function(m) {
  switch(m.msg) {
    case "ledLength":
      renderer.setLedLength(m.length);
      break;
    case "XON":
      renderer.xON();
      break;
    case "XOFF":
      renderer.xOFF();
      break;
    default:
      console.error("Unknown message from parent process:", m);
  }
});

console.log("Sandbox process started.");

process.on("exit", function(){
  console.log("Child exiting");
});

process.on("disconnect", function(){
  console.log("Parent disconnected");
  process.exit();
});

/* vim:set ts=2 sw=2: */
