Zotero.Hello = {
	
    prefs: null,
    wm: null,
    pane : Components.classes["@mozilla.org/appshell/window-mediator;1"]
        .getService(Components.interfaces.nsIWindowMediator)
        .getMostRecentWindow("navigator:browser").ZoteroPane,

    
    mergeObserver: {
	observe: function(a, b, c){
	    //this should get called when the dynamic overlay loading in createUI is complete.
	    //we adjust UI stuff according to preferences here.
	    document.getElementById("z-hello-usetags").setAttribute("checked",
				                                    Zotero.Hello.prefs.getBoolPref("useTags").toString());
	}		
 	},	

	createUI: function() {
	    document.loadOverlay("chrome://z-hello/content/overlay.xul", this.mergeObserver);
	},       
    
    Preferences: function (paneID, action) {
	var io = {
	    pane: paneID,
	    action: action
	};
	window.openDialog('chrome://z-hello/content/options.xul',
			  'z-hello-options',
			  'chrome,titlebar,toolbar,centerscreen'
			  + Zotero.Prefs.get('browser.preferences.instantApply', true) ? 'dialog=no' : 'modal',
			  io);   
    },	
    
    init: function () {
	//set up preferences
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"].
	    getService(Components.interfaces.nsIPrefService);
	this.prefs = this.prefs.getBranch("extensions.z-hello.");
        
	this.ffPrefs = Components.classes["@mozilla.org/preferences-service;1"].
	    getService(Components.interfaces.nsIPrefService).getBranch("browser.download.");
	
	this.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
	    .getService(Components.interfaces.nsIWindowMediator);		   		
    	if (this.prefs.getBoolPref("firstuse")) { 
            alert("First Use!");
	    this.prefs.setBoolPref("firstuse",false);
	}
    },   
    
    GetSelectedItems: function() {
        this.AlertItems(this.pane.getSelectedItems());
    },

    AlertItems: function(items) {
        var results =  items.length + " items Selected\n"
            for (i in items) {
                var item = items[i]
                results = results +  "* " + item.getField('title') + "\n";
            }
        alert(results);
    },
    

    GetCollectionItems: function() {
        var collection= this.pane.getSelectedCollection();
        var items = collection.getChildItems();
        this.AlertItems(items);
    },

    HelloWorld: function() {
        alert ("Hello World");
    },

};





