var storage = require("node-persist");

function Persist() {
  storage.initSync();

  this.getId = function() {
    var id = storage.getItem("id");
    return id;
  };

  this.setId = function(id) {
    storage.setItem("id",id);
  };
}

module.exports = new Persist();
