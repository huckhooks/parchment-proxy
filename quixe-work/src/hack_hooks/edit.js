/*
 * setting the hash is done how?
 * in hack_hooks_frame.
 */
HackHooksFrame.initInParent();

Edit.SKIP_GAME = false; //release
//Edit.SKIP_GAME = true; //debug: no game, loads faster

//TODO: jump to mark
Edit.dump = function() {
  console.log("dump");
  return false;
}
Edit.find = function(name) {
  var lineno = 10;
  var el = $('editdiv').firstChild;
  var found = false;
  var rx = new RegExp("The " + name + " (is|are) ","i");
  while(el) {
    if (el.nodeName === "#text") {
      if (rx.exec(el.textContent)) {
        console.log(el.textContent);
        found = true;
        break;
      }
    }
    el = el.nextSibling;
  }
  if(found) {
    el = el.previousSibling;
    console.log(el);
    var l = $("linemark");
    if (l)
      l.remove();

    //make hash different
    hash = Base64.decode(location.hash.substring(1));
    try {
      hash = JSON.parse(hash);
    } catch(e) {
      console.log(e);
      hash = {};
    }
    console.log(hash);
    if (hash.ct)
      hash.ct ++;
    else
      hash.ct = 1;
    console.log(hash);
    HackHooksFrame.last_hash = Base64.encode(JSON.stringify(hash));

    el.insert({
      "after": '<a name="' + HackHooksFrame.last_hash + '" id="linemark"><hr></a>'
    });
    location.hash = HackHooksFrame.last_hash;
  }
}
Edit.next_mode = function() {
  var val = $("mode").textContent;
  console.log( val );

  if (val == "mix>play") {
    $('mode').update("play>edit");
    $("editdiv").hide();
    $("quixeframe").className = "quixeframe_play";

  } else if (val == "play>edit") {
    $('mode').update("edit>map");
    $("quixeframe").hide();
    $("editdiv").className = "editdiv_edit";
    $("editdiv").show();

  } else if (val == "edit>map") {
    $('mode').update("map>mix");
    $("editdiv").hide();
    $("quixeframe").hide();
    var s = Edit.PROJECT + ".inform/Index/World.html" ;
    console.log(s);
    $("docuframe").src = s;
    $("docuframe").onload = function() {
      //http://www.nczonline.net/blog/2009/09/15/iframes-onload-and-documentdomain/
      var doc = $("docuframe").contentDocument;
      //http://www.dyn-web.com/tutorials/iframes/
      if(Edit.DEBUG_LIBS) {
        var s = "../../src/";
        var s2 = "../../edit-i7-lib/";
        var el = document.createElement("script");
        el.setAttribute('src', s + 'prototype-1.7.js');
        doc.body.appendChild(el);
        var el = document.createElement("script");
        el.setAttribute('src', s2 + 'patch-index.js');
        doc.body.appendChild(el);
      } else {
        var s = "../../edit-i7-lib/";
        var el = document.createElement("script");
        el.setAttribute('src', s + 'js/hack_hooks.min.js');
        doc.body.appendChild(el);
        var el = document.createElement("script");
        el.setAttribute('src', s + 'js/glkote.min.js');
        doc.body.appendChild(el);
        var el = document.createElement("script");
        el.setAttribute('src', s + 'patch-index.js');
        doc.body.appendChild(el);
      }
      //console.log($("docuframe").contentDocument.body.innerHTML);
      console.log($("docuframe").contentDocument.location);

      $("docuframe").show();
    };
  } else if (val == "map>mix") {
    $('mode').update("mix>play");
    $("docuframe").hide();
    $("editdiv").className = "editdiv_mix";
    $("editdiv").show();
    $("quixeframe").className = "quixeframe_mix";
    $("quixeframe").show();
  } else
    alert("bug!");
  return false;
}
Edit.requestSource = function() {

  document.title = document.title + " " + document.location
  window.onhashchange = function() {
    console.log("edit.onhashchange");
    if(location.hash.substring(1) !== HackHooksFrame.last_hash)
      Edit.set_player();
  };
  Edit.set_player();

  this.source_url = Edit.PROJECT_DIR + Edit.PROJECT + '.inform/Source/story.ni'

  me = this;
  new Ajax.Request(this.source_url, {
    method:'get',
    onSuccess: function(transport) {
      var text = transport.responseText;
      text = text.escapeHTML();
      text = text.replace(/\n/g,"<br>");
      text = text.replace(/  /g," &nbsp;");
      text = text.replace(/\t/g,"-- ");
      $('editdiv').update(text);
      $('editdiv').contentEditable = 'true';
      Hotkeys.bind("ctrl+s", function() {
        me.save_and_run();
      })
      Hotkeys.bind("tab", function() {
        //https://developer.mozilla.org/en/rich-text_editing_in_mozilla
        document.execCommand("insertHTML", false,"--&nbsp;");
      });
      Hotkeys.bind("ctrl+1", function() {
        Edit.next_mode();
        return false;
      });
    },
    onFailure: function() {
      alert('Something went wrong...')
    }
  });
}
Edit.set_player = function() {
  if (Edit.SKIP_GAME)
    return;
  var p = Edit.PLAYER + location.hash;
  console.log(p);
  $('quixeframe').src = Edit.PLAYER + location.hash; //#autoincluded
}
Edit.save_and_run = function() {
  try {
    this.save();
    if (! Edit.SKIP_GAME)
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
  s = s.replace(/\u00A0/g," "); //&nbsp;
  //s = s.unescapeHTML();
  s = s.replace(/-- /g,"\t");
  var s2 = encode_utf8(s);
  if(! Edit.SKIP_GAME)
    mozillaSaveFile(q, s2);
  this.save_extension(s);
  return false;
}
//TODO: save_extension
Edit.save_extension = function(s) {
  l = s.split('\n');
  //console.log(s);
  var o = "";
  var ext = null;
  for(var i = 0; i < l.length; i++) {
    var s = l[i];
    var r;
    if (r =/\"(.*)\" by \"(.*)\" \[begins here\]./.exec(s)) {
      console.log(r);
      o += (r[1] + ' by ' + r[2] + ' begins here.');
      ext = r;
    } else if (r = /\[(.* ends here.)\]/.exec(s)) {
      console.log(s);
      o += (r[1] + '\n\n---- DOCUMENTATION ----');
    } else
      o += (s);
    o += ("\n");
  }
  //console.log("-->\n" + o);
  console.log(ext);
  if(ext) {
    var name = ext[1] + " by " + ext[2] + ".i7x";
    var file = "Extensions/" + name;
    file = file.replace(/ /g,"_");
    var file = /.*\//.exec(document.location)[0] + file;
    console.log(file);
    file = getLocalPath(file);
    console.log("saving ext " + file);
    var s2 = encode_utf8(o);
    //if(! Edit.SKIP_GAME)
    mozillaSaveFile(file, s2);

    Edit.EXT_INSTALLER = Edit.DIR + 'edit-i7-lib/edit_install_extension.py';

    var args = [
    '-e', getLocalPath(Edit.EXT_INSTALLER),
    ext[1],ext[2],file
    ];
    console.log(JSON.stringify(args));

    netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");

    // create an nsILocalFile for the executable
    var file = Components.classes["@mozilla.org/file/local;1"]
    .createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(Edit.XTERM);

    // create an nsIProcess
    var process = Components.classes["@mozilla.org/process/util;1"]
    .createInstance(Components.interfaces.nsIProcess);
    process.init(file);

    var me = this;
    process.runAsync(args, args.length);
  }

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

//http://ecmanaut.blogspot.com/2006/07/encoding-decoding-utf8-in-javascript.html
function encode_utf8( s ) {
  return unescape( encodeURIComponent( s ) );
}

function decode_utf8( s ) {
  return decodeURIComponent( escape( s ) );
}