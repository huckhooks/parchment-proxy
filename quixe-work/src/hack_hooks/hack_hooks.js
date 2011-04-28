/* Credits:
 * contains base64-code from http://www.webtoolkit.info/javascript-base64.html

 */

if(!window.console) {
  window.console = {
    log: function(s) {
    }//nop
  };
}

HackHooks = {
  //config
  AJAX: false,
  BROWSIE_BASE: "../Browsies/",
  PARTNER_FRAME_ORIGIN: "*",

  AJAX_DEBUG: false,
  FAKE_HISTORY: false,
  FAKE_INPUT: false,

  //"exported" from modules
  main_winid: -1,
  windowdic: null,
  image: null,
  send_response: null,
  quixe_options: null,

  //own vars

  log: [],
  next_log: [],
  hash: null,
  replaying: null,
  basetitle: null,

  base_md5: null,
  base_len: 0,

  last_req_id: 0,

  post_parent: function( message ) {
    if (parent != window) {
      //parent.postMessage(JSON.stringify(message), this.PARTNER_FRAME_ORIGIN);
      parent.HackHooksFrame.receiveMessage( message, document.location );
    }
  },
  print: function(line) {
    line = "[" + line + "]";
    console.log("print> " + line);
    var ce = $('window' + this.main_winid).childElements();
    var last = ce[ce.length-1];
    last.insert({
      "before": '<div class="BufferLine">' + line.escapeHTML()
      + '</div>'
    });
  },
  set_quixe_options: function(quixe_options) {
    this.quixe_options = quixe_options;
  },
  proxy_url: function() {
    return "/proxy/";
  },
  error_msg: function(msg) {
    //alert(msg);
    console.log(msg);
    this.print(msg)
  },
  started: function(image) {
    this.post_parent(["started",null])
    var DEBUG = this.AJAX_DEBUG && location.hash == "";
    if(DEBUG && this.FAKE_HISTORY) {
      var json; //move choosen last
      location.hash = " " + Base64.encode(JSON.stringify(this.FAKE_HISTORY));
    }
    console.log("started " + this.main_winid);
    this.basetitle = document.title;
    this.image = image;
    this.hash = location.hash;
    var me = this;
    window.onhashchange = function() {
      //console.log("hashchange detected");
      me.hash_change();
    };
    console.log("first indexing");
    this.load_hash();
    this.log = this.next_log;

    this.finish_started = function(json) {
      if(this.AJAX) {
        console.log("finish_started")
        if(json.req_id != this.last_req_id)
          this.error_msg("ajax out of order, ignored " + json.req_id + "/"
          + this.last_req_id)
        else {
          this.next_log = json.full_log;
          this.base_md5 = json.base_log_md5;
          this.base_len = json.full_log.length;
          //this.set_url_hash(); //not necessarily needed, repeatable with md5
        }
      }
      console.log("replay");
      this.do_history();

      //TODO
      if(this.AJAX)
        if (parent != window && parent["HackHooksFrame"]) {
          parent.HackHooksFrame.subframe_started(this);
        }

      if(DEBUG && this.FAKE_INPUT) {
        console.log("fake input");
        var win = this.windowdic.get(this.main_winid);
        this.send_response("line",win,this.FAKE_INPUT,null);
      }
    };
    if(! this.AJAX)
      this.finish_started(null);
    else
      this.index_history("HackHooks.finish_started", {
        read: true
      });

  },
  load_hash: function() {
    var json = location.hash.substring(1);
    this.next_log = [];
    json = Base64.decode(json);
    if (json !== "") {
      try {
        json = JSON.parse(json);
        this.next_log = json["log"];
        this.base_md5 = json["base_md5"];
      } catch (e) {
        //shrug, defaults
      }
    }
  },
  index_history: function(jsonp, opt) {
    if (this.AJAX) {
      var cmd = "/index_history";
      this.last_req_id ++ ;
      var me = this;
      new Ajax.Request(cmd, {
        method: 'get',
        parameters: {
          json: JSON.stringify({
            jsonp: jsonp,
            req_id: this.last_req_id,
            opt: opt,
            history: {
              log: this.log.slice(this.base_len),
              base_md5: this.base_md5,
            },
          })
        },
        evalJS: 'force',
        onFailure: function(resp) {
          me.error_msg("Server-problem, history not saved. Error " + resp.status + ": "
          + resp.statusText);
        }
      });
    }
  },
  notify_new_win: function(winid) {
    if(this.main_winid == -1)
      this.main_winid = winid;
  },
  got_line: function(res) {
    console.log("got_line> " + res["value"])
    if (this.replaying && (/^save|^transcript/.exec(res["value"]))) {
      res["value"] = "#On replay ignored: " + res["value"] ;
    }
    this.log.push(res["value"]);
    if( ! this.replaying) {
      this.set_url_hash();
      this.update_title();
      this.index_history("HackHooks.finish_got_line", {
        write: true
      });
      this.finish_got_line = function(json) {
        this.base_md5 = json.base_log_md5;
        this.base_len = json.log_len;
        this.set_url_hash();
      }
    }
    var me = this;
    var ce = $('window' + me.main_winid).childElements();
    var last = ce[ce.length-1];
    last.insert({
      "before": '<hr>'
    });
  },
  do_history: function() {
    this.log = [];
    var win = this.windowdic.get(this.main_winid);
    this.replaying = true;
    for(var i=0; i < this.next_log.length;i++) {
      //console.log("replaying>" + this.next_log[i]);
      this.send_response("line",win,this.next_log[i],null);
    }
    this.replaying = false;
    //no url-update needed, would be the same
    this.update_title();
  },
  hash_change: function() {
    console.log("player.hash_change");
    var changed = this.hash !== location.hash;
    if(changed) {
      if(true || confirm("url-skein has changed, reload?"))
        window.location.reload();
    }
    return true;
  },
  set_url_hash: function() {
    //TODO .clone().splice() stupid but works for now
    var json = JSON.stringify({
      log: this.log.clone().splice(this.base_len),
      base_md5: this.base_md5
    });
    var hash = Base64.encode(json);
    location.hash = hash;
    this.hash = location.hash;
    HackHooks.post_parent(["subframe_sets_hash",this.hash.substring(1)]);
  },
  update_title: function() {
    var line = this.log.length > 0 ?
    this.log[this.log.length - 1] : "New Game";
    document.title = line + " - "
    + this.log.length + " - "
    + this.basetitle;
  },
  clean_hyper: function(val) {
    val = val.escapeHTML();
    var match = 0;
    var res = "";
    var rx = /(.*?)(\w\+)?(\w*)\{(.*?)\}(.*?)/g
    while (url = rx.exec(val)) {
      match = rx.lastIndex;
      if(!url[4]) {
        url[4] = url[3];
        url[3] = "";
      }
      res += url[1] + url[4] + url[5];
    }
    if(match)
      res += val.substr(match);
    return res;
  },
  insert_special_text: function(el, val) {
    //console.log("insert_text>" + val);
    var url;
    if(url = /^(.*?.). Url: (.*)$/.exec(val)) {
      if (! /^\/|.*:.*/.exec(url[2]) )
        url[2] = this.BROWSIE_BASE + url[2];
      var ael = new Element('a', {
        'href': url[2],
        'target': '_blank',
        'title': 'opens in new window/tab'
      } ).update(this.clean_hyper(url[1]) + ".");
      el.appendChild(ael);
      return true;
    } else if (url = /^(.*?.). IFrame: (\w*), (.*)/.exec(val)) { // TODO
      if (! /^\/|.*:.*/.exec(url[3]) )
        url[3] = this.BROWSIE_BASE + url[3];
      var ael = new Element('a', {
        'href': url[3],
        'target': '_blank',
        'title': 'opens in new window/tab'
      } ).update(this.clean_hyper(url[1]) + ".");
      el.appendChild(ael);
      if(! this.replaying) {
        var bel = new Element('br', {} );
        el.appendChild(bel);
        var fel = new Element('iframe', {
          'src': url[3],
          'style': 'width: 100%; height: ' + url[2] //TODO: disable injection
        } );
        el.appendChild(fel);
      }
      return true;
    } else if (url = /^(.*?.). Popup: (.*)/.exec(val)) {  //TODO
      if (! /^\/|.*:.*/.exec(url[2]) )
        url[2] = this.BROWSIE_BASE + url[2];
      var ael = new Element('a', {
        'href': url[2],
        'target': '_blank',
        'title': 'opens in new window/tab'
      } ).update(this.clean_hyper(url[1]) + ".");
      el.appendChild(ael);
      if(! this.replaying) {
        var bel = new Element('br', {} );
        el.appendChild(bel);
        if ( (! this.replaying)
        && confirm(this.clean_hyper(url[1]) + ". \n\nOpen in new window/tab?\n\n" + url[2])
        )
          window.open(url[2]);
      }
      return true;
    } else if (url = /^(.*?.). Browse: (.*)/.exec(val)) {
      if (! /^\/|.*:.*/.exec(url[2]) )
        url[2] = this.BROWSIE_BASE + url[2];
      var ael = new Element('a', {
        'href': url[2],
        'target': '_blank',
        'title': 'opens in new window/tab'
      } ).update(this.clean_hyper(url[1]) + ".");
      el.appendChild(ael);
      var bel = new Element('br', {} );
      el.appendChild(bel);
      if ( (! this.replaying)
      && confirm(this.clean_hyper(url[1])
      + ". \n\nRemember to use back-button to go back to game.")
      )
        location.href = url[2];
      return true;
    } else if (url = /^(.*?.). Image: (.*)/.exec(val)) {
      if (! /^\/|.*:.*/.exec(url[2]) )
        url[2] = this.BROWSIE_BASE + url[2];
      var ael = new Element('a', {
        'href': url[2],
        'target': '_blank',
        'title': 'opens in new window/tab'
      } ).update(this.clean_hyper(url[1]) + ".");
      el.appendChild(ael);
      if(! this.replaying) {
        var bel = new Element('br', {} );
        el.appendChild(bel);
        var fel = new Element('img', {
          'src': url[2]
        } );
        el.appendChild(fel);
      }
      return true;
    } else if ((url = /^\/edit .*\{(.*)\}.$/.exec(val))) {
        this.print(val);
      if(this.replaying) {
        //pass
      } else {
        this.post_parent(["edit",url[1]]);
      }
      return true;
    } else {
      var match = -1;
      var rx = /(.*?)(\w\+)?(\w*)\{(.*?)\}(.*?)/g
      while (url = rx.exec(val)) {
        match = rx.lastIndex;
        if(!url[4]) {
          url[4] = url[3];
          url[3] = "";
        }
        var me = this;
        el.appendChild(new Element('span').update(url[1] + " "));
        var ael = new Element('a', {
          'href': 'enter://' + url[3] + " " + url[4],
          'title': url[3] + " " + url[4]
        }).update(url[4].escapeHTML());
        (function (url) {
          ael.observe('click', function(ev) {
            ev.stop();
            var win = me.windowdic.get(me.main_winid);
            me.send_response("line",win,url[3] + " " + url[4],null);
          });
        })(url);
        el.appendChild(ael);
        el.appendChild(new Element('span').update(url[5].escapeHTML()));
      }
      if(match != -1)
        el.appendChild(new Element('span').update(val.substr(match).escapeHTML()));
      else
        el.appendChild(new Element('span').update(val.escapeHTML()));
      return true;
    }
    return false;
  }
};

/**
 *
 *  Base64 encode / decode
 *  http://www.webtoolkit.info/
 *  http://www.webtoolkit.info/javascript-base64.html
 *
 * TODO: shortcut to atob, btoa, if available
 *
 **/

var Base64 = {

  // private property
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  // public method for encoding
  encode : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {

      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output +
      this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
      this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

    }

    return output;
  },
  // public method for decoding
  decode : function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {

      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }

    }

    output = Base64._utf8_decode(output);

    return output;

  },
  // private method for UTF-8 encoding
  _utf8_encode : function (string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }

    }

    return utftext;
  },
  // private method for UTF-8 decoding
  _utf8_decode : function (utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;

    while ( i < utftext.length ) {

      c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i+1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i+1);
        c3 = utftext.charCodeAt(i+2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }

    }

    return string;
  }
}