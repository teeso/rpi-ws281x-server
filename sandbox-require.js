
var concat = require("concat-stream");
var check = require("syntax-error");
var http = require("http");
var _ = require("lodash");
var url = require("url");
var vm = require("vm");

/**
* Builds a require() method that can loads asyncronously but returns syncronously.
*
* If the library is not cached, require will throw and start loading the library
*
* @param 
*/
function Sandbox() {
   var cache = {};
   var timeout = 30000;

   this.onLoad = function(lib){ console.log("Sandbox cached library ", lib); }
   this.onSyntaxError = function(lib, se){ console.log("Sandbox syntax error ", se); }
   this.onHttpError = function(lib, err){ console.log("Sandbox http error ", err); }
   this.onNetworkError = function(lib, err){ console.log("Sandbox network error ", err); }
   this.onRuntimeError = function(lib, err){ console.log("Sandbox runtime error ", lib, err, err.stack.split("\n")[1]); }

   var sandbox = this;

   function cacheScript(lib,data) {
      var exports = {};
      var context = {
         "require": makeRequire(lib),
         "exports": exports,
         "module": { id: lib, exports: exports }
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

         return req(lib);
      }
   }

   function req(lib) {
      if( lib in cache ){
         return cache[lib];
      }

      function httpError(err) {
         sandbox.onHttpError(lib, err);
      }

      function networkError() {
         sandbox.onNetworkError(lib, err);
      }

      http.get(lib, function(res){
         function gotData(buffer) {
            cacheScript(lib,buffer);
         }

         res.pipe( concat(gotData) );
         res.on('error',networkError);
      }).on('error', httpError);

      var error = new Error("Library not in cache");
      error.sandbox = true;
      throw error;
   };

   return req;
}

module.exports = Sandbox
