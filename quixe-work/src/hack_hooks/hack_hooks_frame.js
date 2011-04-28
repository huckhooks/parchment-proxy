HackHooksFrame = {
  last_hash: null,
  initInParent: function() {
    //disabled real postmessage
    if(false) {
      var me = this;
      window.addEventListener("message", function(ev) {
        console.log(JSON.stringify([ev.data, ev.origin]));
        var json = JSON.parse(ev.data);
        me.receiveMessage(json  ,ev);
      }, false);
    }
  },
  receiveMessage: function(data, ev) {
    console.log("receiveMessage>" + JSON.stringify(data));
    console.log("handle_" + data[0]);
    this["handle_" + data[0]](data[1],ev);
  },
  handle_started: function() {
  },
  handle_subframe_sets_hash: function(hash) {
    console.log("handle_subframe_sets_hash>" + hash)
    location.hash = hash;
    last_hash = hash;
  },
  handle_edit: function(name) {
    Edit.find(name);
  }
};