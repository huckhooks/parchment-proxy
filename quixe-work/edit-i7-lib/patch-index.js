(function() {
  var imgs = $$('img');
  var rx = /inform\:\//;
  var base = "inform7/Documentation/"
  for (var i = 0; i < imgs.length; i++) {
    var href = imgs[i].src;
    if (href.match(rx)) {
      var r = href.replace(rx,"../../edit-i7-lib/" + base);
      imgs[i].src = r;
    }
  }
})();

