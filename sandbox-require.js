
var concat = require("concat-stream");
var check = require("syntax-error");
var http = require("http");
var https = require("https");
var _ = require("lodash");
var url = require("url");
var vm = require("vm");
const request = require('request');

/**
* Builds a require() method that can loads asyncronously but returns syncronously.
*
* If the library is not cached, require will throw and start loading the library
*
* @param 
:vs*/
function Sandbox() {
   var cache = {};
   var inFlight = {};
   var timeout = 30000;

   //setInterval(function(){cache={}},10000);

   this.onLoad = function(lib){ console.log("Sandbox cached library ", lib); }
   this.onSyntaxError = function(lib, se){ console.log("Sandbox syntax error ", se); }
   this.onHttpError = function(lib, err){ console.log("Sandbox http error ", err); }
   this.onNetworkError = function(lib, err){ console.log("Sandbox network error ", err); }
   this.onRuntimeError = function(lib, err){
     console.log("Sandbox runtime error")
     console.log("  Lib: ", lib);
     console.log("  Err: ", err);
     console.log("  Stack top: ", err.stack.split("\n")[1]);
   }

   var sandbox = this;

   function cacheScript(lib,data) {
      delete inFlight[lib];

      var exports = {};
      var context = {
         "require": makeRequire(lib),
         "exports": exports,
         "module": { id: lib, exports: exports },
         "log":console.log
      };

      var se = check(data);
      if(se) {
         sandbox.onSyntaxError(lib, se);
      }

      try {
        var scriptOptions = {filename:lib};
        var contextOptions = {timeout:timeout};
        var script = new vm.Script(data, scriptOptions);
        script.runInNewContext(context,contextOptions);

        cache[lib] = context.module.exports;
        sandbox.onLoad(lib);
      } catch (err) {
         sandbox.onRuntimeError(lib, err);
      }
   }

   function makeRequire(relative) {
      return function(lib) {
         lib = url.resolve(relative,lib);
         console.log("Requiring: ", lib);
         return req(lib);
      }
   }

   function req(lib) {
      if( lib in cache ) {
         return cache[lib];
      }

      function httpError(err) {
         delete inFlight[lib];
         console.log("Http error loading: ", lib);
         sandbox.onHttpError(lib, err);
      }

      function networkError() {
         delete inFlight[lib];
         console.log("Network error loading: ", lib);
         sandbox.onNetworkError(lib, err);
      }

      if( !(lib in inFlight) ) {
         inFlight[lib] = true;
         console.log("Loading",lib)
            function gotData(buffer) {
               console.log("Loaded: ", lib);
               cacheScript(lib,buffer);
            }
         request.get(lib)
         .on('error', httpError)
         .pipe( concat(gotData) );
/*
         var requester = lib.startsWith("https") ? https : http;
         requester.get(lib, function(res){
            function gotData(buffer) {
               console.log("Loaded: ", lib);
               cacheScript(lib,buffer);
            }

            res.pipe( concat(gotData) );
            res.on('error',networkError);
         }).on('error', httpError);
*/
      }
      var error = new Error("Library not in cache: " + lib);
      error.sandbox = true;
      throw error;
   };

   req.isLoading = function() {
      return Object.keys(inFlight).length > 0;
   };

   return req;
}

module.exports = Sandbox
