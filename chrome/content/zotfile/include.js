// Only create main object once
if (!Zotero.Hello) {
	var zotfileLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
					.getService(Components.interfaces.mozIJSSubScriptLoader);
	zotfileLoader.loadSubScript("chrome://zotfile/content/zotfile.js");
	window.addEventListener('load', function(e) { Zotero.Hello.init(); }, false);
} 



