Parchment-proxy
===============

Parchment-proxy is a simple Google App Engine server for proxying Interactive Fiction files for web interpreters like Parchment.

You may install your own, or use ours at http://zcode.appspot.com/proxy/

How to use
----------

Examples:
-	http://zcode.appspot.com/proxy/?url=http://mirror.ifarchive.org/if-archive/games/springthing/2007/Fate.z8
-	http://zcode.appspot.com/proxy/?callback=jsonp12754&encode=base64&url=http://mirror.ifarchive.org/if-archive/games/springthing/2007/Fate.z8

Access the proxy by the /proxy/ URL. The / URL will still work, but has a depreciated API.

Parameters:
-	url  
	required, the URL of the story to access
   
-	encode  
	set encode=base64 to base64 encode the story file
   
-	callback  
	a callback function for JSONP
	
	If you're using jQuery, set the dataType to 'jsonp' and it will automatically create the callback function and add this parameter for you. Other libraries may do the same.
	
	If you use a callback, also set encode=base64.

Parchment-proxy will send the data with a Content-Type header of 'text/plain; charset=ISO-8859-1' and an Access-Control-Allow-Origin header of '*' for cross-site AJAX requests. Similarly, it will handle an OPTIONS request if you need to preflight your cross-site requests.

There is currently a limit no limit for requested files, but as big files aren't cached, please be gentle!