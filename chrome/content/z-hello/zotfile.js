Zotero.Hello = {
	
    prefs: null,
    wm: null,
    
    mergeObserver: {
	observe: function(a, b, c){
	    //this should get called when the dynamic overlay loading in createUI is complete.
	    //we adjust UI stuff according to preferences here.
	    document.getElementById("zotfile-usetags").setAttribute("checked",
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
			  'zotfile-options',
			  'chrome,titlebar,toolbar,centerscreen'
			  + Zotero.Prefs.get('browser.preferences.instantApply', true) ? 'dialog=no' : 'modal',
			  io);   
    },	
    
    init: function () {
	//set up preferences
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"].
	    getService(Components.interfaces.nsIPrefService);
	this.prefs = this.prefs.getBranch("extensions.zotfile.");
        
	this.ffPrefs = Components.classes["@mozilla.org/preferences-service;1"].
	    getService(Components.interfaces.nsIPrefService).getBranch("browser.download.");
	
	this.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
	    .getService(Components.interfaces.nsIWindowMediator);		   		
    	if (this.prefs.getBoolPref("firstuse")) { 
            alert("First Use!");
	    this.prefs.setBoolPref("firstuse",false);
	}
	
	
    },   
	

	
    infoWindow: function(main, message, time){

	var pw = new (Zotero.ProgressWindow);
	pw.changeHeadline(main); 
	if (main=="error") pw.changeHeadline(Zotero.getString("general.errorHasOccurred"));  pw.addDescription(message);
	pw.show();
	pw.startCloseTimer(time);
        
    },

    addUserInput: function(filename, original_filename){
	var default_str = this.prefs.getCharPref("userInput_Default");   
	if (default_str=="[original filename]") var default_str=original_filename;
	var filesuffix = prompt("Enter file suffix (press Cancel to add nothing)\n\nOriginal Filename\n"+original_filename+"\n\nNew Filename\n"+filename + " (YOUR INPUT)", default_str);
	if (filesuffix != '' & filesuffix != null) {
	    // add file type to the file name
	    filename = filename + " (" + filesuffix + ")";
	}             
	return(filename);	  
    },
	      
    truncateTitle: function(title){
	return(title);
    },
    
    // Function replaces wildcard both for filename and subfolder definition
    replaceWildcard: function(zitem, rule){
	return("stuff");
    },
    
    getFolder: function(zitem, dest_dir,subfolder, rule) {
	var subfolderFormat="";
	if(subfolder) {
	    subfolderFormat=this.replaceWildcard(zitem, rule);
	}
	
	var folder = dest_dir + subfolderFormat;
	return(folder);
    },
    
    getFiletype: function(fname){
	if(fname) {	    
	    var temp = new Array();
	    temp = fname.split('.');
	    return(temp[temp.length-1].toLowerCase());     
	}
	else {
            return("");						
	}
    },
    
    createFile: function(path) { 
	try {
    	    var file = Components.classes["@mozilla.org/file/local;1"].
		createInstance(Components.interfaces.nsILocalFile);
	    file.initWithPath(path);
	    return(file);
	}
	catch (err) {
	    return(-1);
	}
    },
    
    checkFiletype: function (filetype) {
	var type=filetype.search(new RegExp(this.prefs.getCharPref("filetypes").replace(/,/gi,"|")));
	if (type>=0) {
	    return(true);
	}
	else {
	    return(false);    				
	}
    },  	           
    
    allFilesInDir: function(dir_path){          
	var return_files=new Array();
	// create a nslFile Object for the dir 
	try {
	    var dir = this.createFile(dir_path);
	    var success=0;
            
	    // go through all the files in the dir
	    var files = dir.directoryEntries; 
	    while (files.hasMoreElements()) { 
		// get one after the other file
		var file = files.getNext(); 
		file.QueryInterface(Components.interfaces.nsIFile); 
		// only look at files which are neither folders nor hidden
		if(!file.isDirectory() & !file.isHidden()) {    
		    // now we want to check which filetype we are looking at
		    // we only want to consider pdfs, docs, ... 
		    var filetype=this.getFiletype(file.leafName);
		    if (this.checkFiletype(filetype))  {
			return_files[success]=file;
			var success=success+1;
		    }
		}
	    }
	    if (success>0)  return(return_files);   
	    else return(-1);
            
	} catch (e) {  
	    Components.utils.reportError(e);
	    return (-2);
	}	
    },
    
    lastFileInDir: function(dir_path){  
	var return_files=new Array();
 	// create a nslFile Object for the dir 
	try {
	    var dir = this.createFile(dir_path);
	    var lastfile_date=0;
	    var lastfile_path="";
	    var success=0;
	    
	    // go through all the files in the dir
	    var i=0;
	    var files = dir.directoryEntries; 
	    while (files.hasMoreElements()) { 
		// get one after the other file
		var file = files.getNext(); 
		file.QueryInterface(Components.interfaces.nsIFile); 
		// only look at files which are neither folders nor hidden
		if(!file.isDirectory() & !file.isHidden()) {    
		    // now we want to check which filetype we are looking at
		    // we only want to consider pdfs, docs, ... 
		    var filetype=this.getFiletype(file.leafName);
                    //			 var valid_filetypes=new RegExp(this.prefs.getCharPref("filetypes"));
                    //		     var type=filetype.search(valid_filetypes);    
		 	 var type=filetype.search(new RegExp(this.prefs.getCharPref("filetypes").replace(/,/gi,"|")));	    
		    if (type>=0) {  
		        var modtime = file.lastModifiedTime;
		        var i=i+1;
		        // finally, we set return_files to the file with the most recent modification
		        if (modtime>lastfile_date){   
		            var lastfile_date=modtime;  
		            return_files[0]=file;
                            //		          lastfile=file;
		          var success=1;
		        }
		    }
		}
	    } 
	    if (success==1) return(return_files);
	    else return(-1);
            
	} catch (e) {  
	    Components.utils.reportError(e);
	    return (-2);
	}
    },
    
    completePath: function(location,filename) {
	if (navigator.appVersion.indexOf("Win")!=-1) return(location + "\\" + filename);
	else return(location + "/" + filename);
    },
    
    addSuffix: function(filename,k) {
	var temp = new Array();
	temp = filename.split('.');
	return(temp[0] + k + "." + this.getFiletype(filename));
    },
    
    // function to check wether certain file exists in folder
    fileExists: function  (folder, filename) {
	var fileobj_path=this.completePath(folder,filename);
	var fileobj = this.createFile(fileobj_path);
	if (fileobj.exists()) return(1);
	if (!fileobj.exists()) return(0);
    },
	
    moveFile: function(file, destination, filename){
	var filename_temp=filename;
	var k=2;
	while(this.fileExists(destination, filename_temp)) {
	    var filename_temp = this.addSuffix(filename,k);
	    k++;
	}
	var filename=filename_temp;
	
	// create a nslFile Object of the destination folder
	var dir = this.createFile(destination);
        
	// move file to new location  
	file.moveTo(dir, filename);
	return(file.path);
	
    },
    
    getFilename: function(item,filename_org){
	// create the new filename from the selected item
	var item_type =  item.getType();
	var rename_rule=this.prefs.getCharPref("renameFormat");
	if(item_type==19) var rename_rule=this.prefs.getCharPref("renameFormat_patent");
	if (!this.prefs.getBoolPref("useZoteroToRename")) {
	    
	    var filename=this.replaceWildcard(item, rename_rule);
	    //var filename =  author + "_" + year + "_" + title;
            
	    // Strip potentially invalid characters
	    // (code line adopted from Zotero)
//	    var filename = filename.replace(/[\/\\\?\*:|"<>\.]/g, ''); // "
                                              
            // replace blanks with '_' if option selected 	
            if (this.prefs.getBoolPref("replace_blanks"))  var filename = filename.replace(/ /g, '_');
	    
	}
	if (this.prefs.getBoolPref("useZoteroToRename")) filename=Zotero.Attachments.getFileBaseNameFromItem(item.itemID);
	
	if(this.prefs.getBoolPref("userInput")) filename=this.addUserInput(filename,filename_org);
	
	return(filename);
	
    },
	
	// Rename & Move Existing Attachments
    ReturnStuff: function() {
        return "stuff";
	},
	
    getFFDownloadDir: function () { 
	var path="";
        try {
	    if(this.ffPrefs.getBoolPref('useDownloadDir')) {   			
		var downloadManager = Components.classes["@mozilla.org/download-manager;1"]
		    .getService(Components.interfaces.nsIDownloadManager);
		var path=downloadManager.userDownloadsDirectory.path;
	    }
	    if(!this.ffPrefs.getBoolPref('useDownloadDir') & this.ffPrefs.prefHasUserValue('lastDir') ) {									  				
		var path=this.ffPrefs.getCharPref('lastDir');
	    }
	} 
	catch (err) {
	    var path="";
	}		
	return(path);
    }, 
    
    getSourceDir: function(message) {           
	var source_dir="";
	
	if ( this.prefs.getBoolPref("source_dir_ff")) var source_dir=this.getFFDownloadDir();  	                                 		 
	if (!this.prefs.getBoolPref("source_dir_ff")) var source_dir=this.prefs.getCharPref("source_dir");
        
	// test whether valid source dir
	if (source_dir!="" & this.createFile(source_dir)!=-1) {
	    return (source_dir);			
	} else {
	    if(message) this.infoWindow("Blah getSourceDir",8000);
	    return(-1);
		}		
	},   
	
		// FUNCTION: Attach New File(s) from Download Folder
    AttachNewFile: function(){
        return("blah");
    },
    HelloWorld: function() {
        alert("Hello World");
    },
    
    // FUNCTION: Rename & Move Existing Attachments
    ExistingAttachments: function(){
        return "blah";
    }
};



// Initialize the utility
//window.addEventListener('load', function(e) { Zotero.Hello.init(); }, false);


//check whether it really is an bibliographic item (no Attachment, note or collection)
//if (!item.isAttachment() & !item.isCollection() & !item.isNote()) {



//if (item.isAttachment()) {
	// consider that you there are multiple senarios
	// a) attachment is linked, and the goal is to attach it
	// b) attachment is attached, and the goal is to link it
	// make sure that nothing bad happens if the attachment is already named correctly
	
//}
//if (item.isCollection() | item.isNote()) this.infoWindow("Zotfile Error","Selected item is either a note, or a collection.",8000);	

