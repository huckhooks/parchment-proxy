HackHooksFrame.initInParent();

Edit.requestSource = function() {

  window.onhashchange = function() {
    Edit.set_player();
  };
  Edit.set_player();

  this.source_url = Edit.PROJECT_DIR + Edit.PROJECT + '.inform/Source/story.ni'
  me = this;
  new Ajax.Request(this.source_url,
  {
    method:'get',
    onSuccess: function(transport) {
      $('editdiv').update(transport.responseText.escapeHTML().replace(/\n/g,"<br>"));
      $('editdiv').contentEditable = 'true';
      Hotkeys.bind("ctrl+s", function() {
        me.save_and_run();
      });
    },
    onFailure: function() {
      alert('Something went wrong...')
    }
  });
}
Edit.dump = function() {
}
Edit.set_player = function() {
  var p = Edit.PLAYER + location.hash;
  console.log(p);
  $('quixeframe').src = Edit.PLAYER + location.hash; //#autoincluded
}
Edit.save_and_run = function() {
  try {
    this.save();
    this.run();
  } catch(e) {
    alert("Save-error " + e);
  }
  return false;
}
Edit.save = function() {
  var p = /.*\//.exec(document.location)[0] + this.source_url;
  var q = getLocalPath(p);
  var es = $("editdiv").childNodes;
  var s = "";
  for(var i = 0; i < es.length; i++) {
    var e = es[i];
    var sp = e.textContent;
    if (e.nodeName ==="BR")
      sp = "\n";
    s += sp;
  }
  console.log(s);
  mozillaSaveFile(q, s);
  return false;
}

Edit.run = function() {
  
  var args = [
  '-e', getLocalPath(Edit.BUILDER),
  '--wait',
  this.PROJECT_DIR + this.PROJECT,
  ];
  console.log(JSON.stringify(args));

  // run a program
  // https://developer.mozilla.org/en/Code_snippets/Running_applications

  netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

  // create an nsILocalFile for the executable
  var file = Components.classes["@mozilla.org/file/local;1"]
  .createInstance(Components.interfaces.nsILocalFile);
  file.initWithPath(Edit.XTERM);

  // create an nsIProcess
  var process = Components.classes["@mozilla.org/process/util;1"]
  .createInstance(Components.interfaces.nsIProcess);
  process.init(file);

  // get notified when process finishes
  // https://developer.mozilla.org/en/nsIObserver
  
  var topic = "process-finished";

  function myObserver() {
    this.register();
  }

  var me = this;
  myObserver.prototype = {
    observe: function(subject, topic, data) {
      //$('quixeframe').contentDocument.location.reload(true);
      Edit.set_player();
    },
    register: function() {
      var observerService = Components.classes["@mozilla.org/observer-service;1"]
      .getService(Components.interfaces.nsIObserverService);
      observerService.addObserver(this, topic, false);
    },
    unregister: function() {
      var observerService = Components.classes["@mozilla.org/observer-service;1"]
      .getService(Components.interfaces.nsIObserverService);
      observerService.removeObserver(this, topic);
    }
  }
  $('quixeframe').src = "";
  process.runAsync(args, args.length, new myObserver());
  return false;
}

// save string to file
// source von tiddlywiki
// http://www.tiddlywiki.com/

// Returns null if it can't do it, false if there's an error, true if it saved OK
function mozillaSaveFile(filePath,content) {
  if(window.Components) {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(filePath);
    if(!file.exists())
      file.create(0,0664);
    var out = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
    out.init(file,0x20|0x02,00004,null);
    out.write(content,content.length);
    out.flush();
    out.close();
  }
}

function getLocalPath(origPath) {
  var originalPath = convertUriToUTF8(origPath);
  // Remove any location or query part of the URL
  var argPos = originalPath.indexOf("?");
  if(argPos != -1)
    originalPath = originalPath.substr(0,argPos);
  var hashPos = originalPath.indexOf("#");
  if(hashPos != -1)
    originalPath = originalPath.substr(0,hashPos);
  // Convert file://localhost/ to file:///
  if(originalPath.indexOf("file://localhost/") == 0)
    originalPath = "file://" + originalPath.substr(16);
  // Convert to a native file format
  var localPath;
  if(originalPath.charAt(9) == ":") // pc local file
    localPath = unescape(originalPath.substr(8)).replace(new RegExp("/","g"),"\\");
  else if(originalPath.indexOf("file://///") == 0) // FireFox pc network file
    localPath = "\\\\" + unescape(originalPath.substr(10)).replace(new RegExp("/","g"),"\\");
  else if(originalPath.indexOf("file:///") == 0) // mac/unix local file
    localPath = unescape(originalPath.substr(7));
  else if(originalPath.indexOf("file:/") == 0) // mac/unix local file
    localPath = unescape(originalPath.substr(5));
  else // pc network file
    localPath = "\\\\" + unescape(originalPath.substr(7)).replace(new RegExp("/","g"),"\\");
  return localPath;
}

function convertUriToUTF8(uri,charSet) {
  if(window.netscape == undefined || charSet == undefined || charSet == "")
    return uri;
  try {
    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
    var converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(Components.interfaces.nsIUTF8ConverterService);
  } catch(ex) {
    return uri;
  }
  return converter.convertURISpecToUTF8(uri,charSet);
}

