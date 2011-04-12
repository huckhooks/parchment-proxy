if(!window.console) {
  window.console = {
    log: function(s) {
    }//nop
  };
}
HackHooksFrame = {
  subframe_started: function(subframe) {
    //TODO
    this.subframe = subframe;

  }
};
HackHooks = {
  //config
  AJAX: false,
  BROWSIE_BASE: "../Browsies/",
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

  print: function(line) {
    line = "[" + line + "]";
    console.log(line);
    var ce = $('window' + this.main_winid).childElements();
    var last = ce[ce.length-1];
    last.insert({"before": '<div class="BufferLine">' + line.escapeHTML() + '</div>'});
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
  },
  started: function(image) {
    var DEBUG = this.AJAX_DEBUG && location.hash == "";
    if(DEBUG && this.FAKE_HISTORY) {
      var json; //move choosen last
      json = {"log":[],"base_md5":"c426205835e37dd9b4a4ff445ff662d2"};
      json = {log: ["#fake history"]};
      location.hash = " " + JSON.stringify(json);
    }
    console.log("started " + this.main_winid);
    this.basetitle = document.title;
    this.image = image;
    this.hash = location.hash;
    var me = this;
    window.onhashchange = function() {
      me.hash_change();
    };
    console.log("first indexing");
    this.load_hash();
    this.log = this.next_log;

    this.finish_started = function(json) {
      if(this.AJAX) {
        console.log("finish_started>" + JSON.stringify(json))
        if(json.req_id != this.last_req_id)
          this.error_msg("ajax out of order, ignored " + json.req_id + "/" + this.last_req_id)
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
        this.send_response("line",win,"#fake input",null);
      }
    };
    if(! this.AJAX)
      this.finish_started(null);
    else
      this.index_history("HackHooks.finish_started",{read: true});

  },
  load_hash: function() {
    var json = location.hash.substring(1);
    console.log(json);
    if (json[0] === "%")
      json = unescape(json);
    this.next_log = [];
    console.log(">"+json+"<");
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
      new Ajax.Request(cmd, {
        method: 'post',
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
          this.error_msg("Noe (" + cmd + "): Error " + resp.status + ": " + resp.statusText);
        }
      });
    }
  },
  notify_new_win: function(winid) {
    if(this.main_winid == -1)
      this.main_winid = winid;
  },
  got_line: function(res) {
    console.log(JSON.stringify(res));
    if (this.replaying && (/^save|^transcript/.exec(res["value"]))) {
      res["value"] = "#On replay ignored: " + res["value"] ;
    }
    this.log.push(res["value"]);
    if( ! this.replaying) {
      this.set_url_hash();
      this.update_title();
      //TODO: working on ajax-got_line
      this.index_history("HackHooks.finish_got_line",{write: true});
      this.finish_got_line = function(json) {
        console.log("finish_got_line> " + JSON.stringify(json));
        this.base_md5 = json.base_log_md5;
        this.base_len = json.log_len;
        this.set_url_hash();
      }
    }
    var me = this;
    var ce = $('window' + me.main_winid).childElements();
    var last = ce[ce.length-1];
    last.insert({"before": '<hr>'});

    console.log("got_line> done");
  },
  do_history: function() {
    this.log = [];
    console.log(this.next_log);
    var win = this.windowdic.get(this.main_winid);
    this.replaying = true;
    for(var i=0; i < this.next_log.length;i++) {
      this.send_response("line",win,this.next_log[i],null);
    }
    this.replaying = false;
    //no url-update needed, would be the same
    this.update_title();
  },
  hash_change: function() {
    var changed = this.hash !== location.hash;
    console.log("hashchange " + changed);
    if(changed) {
      console.log("old: " + this.hash);
      console.log("new: " + location.hash);
      if(true || confirm("url-skein has changed, reload?"))
        window.location.reload();
    }
    return true;
  },
  set_url_hash: function() {
    //TODO .clone().splice() stupid but works for now
    var json = JSON.stringify({
      log: this.log.clone().splice(this.base_len), base_md5: this.base_md5
    });
    console.log(json);
    //the space is important. some browsers unescape spaces on lookup, some not.
    //the space allows a check location.hash[1] === "%"
    var hash = "# " + json;
    location.hash = hash;
    this.hash = location.hash;
  },
  update_title: function() {
    var line = this.log.length > 0 ?
    this.log[this.log.length - 1] : "New Game";
    document.title = line + " - "
    + this.log.length + " - "
    + this.basetitle;
  },
  //XXX
  insert_special_text: function(el, val) {
    var url;
    if(url = /^(.*?.). Url: (.*)$/.exec(val)) {
      if (! /.*:.*/.exec(url[2]) )
        url[2] = this.BROWSIE_BASE + url[2];
      var ael = new Element('a', {
        'href': url[2],
        'target': '_blank',
        'title': 'opens in new window/tab'
      } ).update(url[1] + ".");
      el.appendChild(ael);
      return true;
    } else if (url = /^(.*?.). IFrame: (\w*), (.*)/.exec(val)) { // TODO
      if (! /.*:.*/.exec(url[3]) )
        url[3] = this.BROWSIE_BASE + url[3];
      var ael = new Element('a', {
        'href': url[3],
        'target': '_blank',
        'title': 'opens in new window/tab'
      } ).update(url[1] + ".");
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
      if (! /\/|.*:.*/.exec(url[2]) )
        url[2] = this.BROWSIE_BASE + url[2];
      var ael = new Element('a', {
        'href': url[2],
        'target': '_blank',
        'title': 'opens in new window/tab'
      } ).update(url[1] + ".");
      el.appendChild(ael);
      if(! this.replaying) {
        var bel = new Element('br', {} );
        el.appendChild(bel);
        if ( (! this.replaying)
        && confirm(url[1] + ". \n\nOpen in new window/tab?\n\n" + url[2])
        )
          window.open(url[2]);
      }
      return true;
    } else if (url = /^(.*?.). Browse: (.*)/.exec(val)) {
      if (! /.*:.*/.exec(url[2]) )
        url[2] = this.BROWSIE_BASE + url[2];
      var ael = new Element('a', {
        'href': url[2],
        'target': '_blank',
        'title': 'opens in new window/tab'
      } ).update(url[1] + ".");
      el.appendChild(ael);
      var bel = new Element('br', {} );
      el.appendChild(bel);
      if ( (! this.replaying)
      && confirm(url[1] + ". \n\nRemember to use back-button to go back to game.")
      )
        location.href = url[2];
      return true;
    } else if (url = /^(.*?.). Image: (.*)/.exec(val)) {
      if (! /.*:.*/.exec(url[2]) )
        url[2] = this.BROWSIE_BASE + url[2];
      var ael = new Element('a', {
        'href': url[2],
        'target': '_blank',
        'title': 'opens in new window/tab'
      } ).update(url[1] + ".");
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
    } else {
      var match = 0;
      var rx = /(.*?) (\w*)\{(.*?)\}(.*?)/g
      while (url = rx.exec(val)) {
        match = rx.lastIndex;
        var me = this;
        el.appendChild(new Element('span').update(url[1] + " "));
        var ael = new Element('a', {
          'href': 'enter://' + url[2] + " " + url[3],
          'title': url[2] + " " + url[3]
        }).update(url[3]);
        (function (url) {
          ael.observe('click', function(ev) {
            ev.stop();
            var win = me.windowdic.get(me.main_winid);
            me.send_response("line",win,url[2] + " " + url[3],null);
          });
        })(url);
        el.appendChild(ael);
        el.appendChild(new Element('span').update(url[4]));
      }
      if(match)
        el.appendChild(new Element('span').update(val.substr(match)));
      return match;
    }
    return false;
  }
};