// Only create main object once
if (!Zotero.Hello) {
	var zhelloLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
					.getService(Components.interfaces.mozIJSSubScriptLoader);
	zhelloLoader.loadSubScript("chrome://z-hello/content/z-hello.js");
	window.addEventListener('load', function(e) { Zotero.Hello.init(); }, false);
} 



