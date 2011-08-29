Zotero.ZotFile = {
    prefs: null,
    wm: null,
    fileMap: {}, //maps collections to their file objects

    mergeObserver: {
	observe: function(a, b, c){
	    //this should get called when the dynamic overlay loading in createUI is complete.
	    //we adjust UI stuff according to preferences here.
	    document.getElementById("zotfile-usetags").setAttribute("checked",
                Zotero.ZotFile.prefs.getBoolPref("useTags").toString());
	}		
    },	

    createUI: function() {
	document.loadOverlay("chrome://zotfile/content/overlay.xul", this.mergeObserver);
    },       
	
    Preferences: function (paneID, action) {
	var io = {
	    pane: paneID,
	    action: action
	};
	window.openDialog('chrome://zotfile/content/options.xul',
			  'zotfile-options',
			  'chrome,titlebar,toolbar,centerscreen'
			  + Zotero.Prefs.get('browser.preferences.instantApply', true) ? 'dialog=no' : 'modal',
			  io
		         );   
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
	    // open website
	    window.open("http://www.columbia.edu/~jpl2136/zotfile.html");  
            //			gBrowser.selectedTab = gBrowser.addTab("http://www.columbia.edu/~jpl2136/zotfile.html");
            
	    // determine OS
	    var windows=false;
	    if (navigator.appVersion.indexOf("Win")!=-1) var windows=true;
            
	    // check preferences source_dir
	    if (this.prefs.getCharPref("source_dir")!="") this.prefs.setBoolPref('source_dir_ff',false);		
	    if (this.prefs.getCharPref("source_dir")=="" &  windows)  this.prefs.setBoolPref('source_dir_ff',true);
	    if (this.prefs.getCharPref("source_dir")=="" & !windows) {                     
		if (this.getFFDownloadDir()==this.createFile("~/Downloads").path) {
		    this.prefs.setBoolPref('source_dir_ff',true);
		}
		else {
		    if(confirm("ZotFile Settings\n\nSome of zotfile's default settings have changed and you should make a decision about the source dir. The source dir is the directory where ZotFile looks for the most recently modified file when you 'Attach New File' using zotfile. It is useful to use the default downloads folder from Firefox (currently is '" + this.getFFDownloadDir() + "').\nDo you want to use FF default downloads folder (recommended)?")) {
			this.prefs.setBoolPref('source_dir_ff',true); 
		    }
		    else {
			this.prefs.setBoolPref('source_dir_ff',false); 
			if (confirm("ZotFile Settings\n\nPlease select a custom source dir.")) this.prefs.setCharPref('source_dir',this.chooseDirectory());
  		    }
                    
		}			   
	    }
            
	    // check whether valid FF default download folder
	    if(this.prefs.getBoolPref('source_dir_ff') &  this.getSourceDir(false)==-1) {
		this.prefs.setBoolPref('source_dir_ff',false);
		this.prefs.setCharPref('source_dir',prompt("ZotFile Settings\n\nZotfile is not able to determine your default FF download folder. Please enter a custom source dir. The source dir is the directory where ZotFile looks for the most recently modified file when you 'Attach New File' using zotfile."));  			
	    }
            
	    // dest_dir   
	    if (this.prefs.getCharPref("dest_dir")!="") this.prefs.setBoolPref('import',false);		
	    if (this.prefs.getCharPref("dest_dir")=="" &  windows)  this.prefs.setBoolPref('import',true);
	    if (this.prefs.getCharPref("dest_dir")=="" & !windows) {                     
		if(confirm("ZotFile Settings\n\nSome of zotfile's default settings have changed and you should make a decision about the way attachments are handled ('Destination'). Do you want to import attachments i.e. store a copy of the file in zotero (recommended)? Otherwise attachments are added as a link to the file.")) {
		    this.prefs.setBoolPref('import',true); 
		}
		else {
		    this.prefs.setBoolPref('import',false);
		    if (confirm("ZotFile Settings\n\nPlease select the folder where you want zotfile to move your attachments.")) this.prefs.setCharPref('dest_dir',this.chooseDirectory());
                    
		}
                
	    } 
            
	    // set firstuse to false
	    this.prefs.setBoolPref("firstuse",false);
	    
	}
	
	
        //		this.wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].
        //				getService(Components.interfaces.nsIWindowMediator);
	
	//this.createUI()
    },   
    
    chooseDirectory: function () {
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
	    .getService(Components.interfaces.nsIWindowMediator);
	var win = wm.getMostRecentWindow('navigator:browser');
        
	var ps = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
	    .getService(Components.interfaces.nsIPromptService);
        
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	while (true) {
	    var fp = Components.classes["@mozilla.org/filepicker;1"]
		.createInstance(nsIFilePicker);
	    fp.init(win, Zotero.getString('dataDir.selectDir'), nsIFilePicker.modeGetFolder);
	    fp.appendFilters(nsIFilePicker.filterAll);
	    if (fp.show() == nsIFilePicker.returnOK) {
		var file = fp.file;
                
		// Set preference  
		//Zotero.ZotFile.prefs.setCharPref(pref,file.path);
		return(file.path);			
	    }
	    else {
		return("");
	    }
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
	
	// truncnate title after : . and ?	
  	if(this.prefs.getBoolPref("truncate_title")) {
	    var truncate = title.search(/:|\.|\?/);
	    if(truncate!=-1) var title = title.substr(0,truncate);
	}
	
	// truncate if to long
	var title_length =  title.length;
	if (title_length>this.prefs.getIntPref("max_titlelength")) {   
	    var max_titlelength=this.prefs.getIntPref("max_titlelength");
	    var before_trunc_char = title.substr(max_titlelength,1);
	    
	    // truncate title at max length
	    var title = title.substr(0,max_titlelength);
	    
	    // remove the last word until a space is found 
	    if(this.prefs.getBoolPref("truncate_smart") & title.search(" ")!=-1 & before_trunc_char.search(/[a-zA-Z0-9]/!=-1)) {
		while (title.substring(title.length-1, title.length) != ' ') title = title.substring(0, title.length-1);
		var title = title.substring(0, title.length-1);
	    }   
	  } else {   
		// remove some non letter characters if they apear at the end of the title that was not truncated
		var endchar = title.substring(title.length-1, title.length);
		if (endchar == ':' || endchar == '?' || endchar == '.' || endchar == '/' || endchar == '\\' || endchar == '>' || endchar == '<' || endchar == '*' || endchar == '|') {
		  var title = title.substring(0, title.length-1);
		}
	  }
		// replace forbidden characters with meaningful alternatives (they can only apear in the middle of the text at this point)
		var title = title.replace(/[\/\\]/g, '-');
		var title = title.replace(/[\*|"<>]/g, ''); // "
		var title = title.replace(/[\?:]/g, ' -');
		return(title);
	},
	
	// Function replaces wildcard both for filename and subfolder definition
	replaceWildcard: function(zitem, rule){
	  // get item type
	  var item_type =  zitem.getType();
	  var item_type_string = Zotero.ItemTypes.getLocalizedString(item_type);
	  
	
	  // get title of selected item 
	  var title = zitem.getField('title');        
	
	  //  truncnate title 
	  var title = this.truncateTitle(title);
	  
	  // get journal
	  var journal = zitem.getField('publicationTitle');

	  // get journal abbreviation
	  var journal_abb = zitem.getField('journalAbbreviation');

	  // get publisher
	  var publisher = zitem.getField('publisher');

	  // get volume and issue
	  var volume = zitem.getField('volume');
	  var issue = zitem.getField('issue');

	  // get patent stuff
	  // var inventor
	  var assignee = zitem.getField('assignee');
	  var patentnr = zitem.getField('patentNumber');
	  var priority_date = patentnr.substr(2,4);

	  // get creator and create authors string
	  var creatorType=1;
	  if (zitem.getType()==19) var creatorType=14;
	  var add_etal=this.prefs.getBoolPref("add_etal");
	  var author = "";
	  var creators = zitem.getCreators();
	  var numauthors = creators.length;
	  for (var i=0; i < creators.length; i++) {
	    if(creators[i].creatorTypeID!=creatorType) var numauthors=numauthors-1;
	  }
	  if (numauthors<=this.prefs.getIntPref("max_authors")) var add_etal=0;
	  if (numauthors>this.prefs.getIntPref("max_authors")) var numauthors = 1;
	  var j=0;
	  for (var i=0; i < creators.length; i++) {
	    if (j<numauthors & creators[i].creatorTypeID==creatorType) {
	      if (author!="") var author = author + "_" + creators[i].ref.lastName;  
	      if (author=="") var author = creators[i].ref.lastName;
	      var j=j+1;
	    }
	  }
	  if (add_etal==1) var author = author + this.prefs.getCharPref("etal");

	  // date
	  var year = zitem.getField('date', true).substr(0,4);
	  if(item_type==19)  var year_issue = zitem.getField('issueDate', true).substr(0,4);
	
	  // create output from rule
	  var field=0;
	  var output='';
	  for (var i=0; i<rule.length; i++) {  
	    var char=rule.charAt(i);
	    switch (char) {
	      case '%':
		 	var field=1;
		  break;

	      case 'a':
	        if (field==1) var output = output + author;
		 	var field=0;
	      break;
	                  
	      case 'A':
	        if (field==1) var output = output + author.substr(0,1).toUpperCase();
		 	var field=0;
	      break;	

	      case 't':
	         if (field==1) var output = output + title;
		 	 var field=0;
	      break;

	      case 'y':
	         if (field==1) var output = output + year;
		 	 var field=0;
		  break;

	      case 'j':
	         if (field==1) var output = output + journal;
		     var field=0;
	      break;

	      case 'p':
	         if (field==1) var output = output + publisher;
		 	 var field=0;
	      break;

	      case 'n':
	         if (field==1) var output = output + patentnr;
		 	 var field=0;
	      break;

	      case 'i':
	         if (field==1) var output = output + assignee;
		 	 var field=0;
	      break;

	      case 'u':
	         if (field==1) var output = output + year_issue;
		 	 var field=0;
	      break;

	      case 'w':
	         if (field==1) {
	            var output = output + journal;
	            if(journal=="") var output = output + publisher;
	         }
		     var field=0;
	      break;

	      case 's':
	         if (field==1) var output = output + journal_abb;
		 	 var field=0;
	      break;

	      case 'v':
	         if (field==1) var output = output + volume;
		 	 var field=0;
	      break;

	      case 'e':
	         if (field==1) var output = output + issue;
		 	 var field=0;
	      break;       
	
		  case 'T':
	         if (field==1) var output = output + item_type_string;
		 	 var field=0;
	      break;       		

	      default: var output = output + char;
	    }
	  }
	return(output);
	
	},
	
	getFolder: function(zitem, dest_dir,subfolder, rule) {
		var subfolderFormat="";
		if(subfolder) {
			subfolderFormat=this.replaceWildcard(zitem, rule);
		}
		
//		var journal = zitem.getField('publicationTitle');
		var folder = dest_dir + subfolderFormat;
		return(folder);
	},
	
//	pref("extensions.zotfile.subfolder", false);
//	pref("extensions.zotfile.subfolderFormat", "%j/%y");
		
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
		
//		file.path!= this.createFile(this.completePath(location, filename)).path
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
		  var filename = filename.replace(/[\/\\\?\*:|"<>\.]/g, ''); \\ "
		  // replace blanks with '_' if option selected 	
		      if (this.prefs.getBoolPref("replace_blanks"))  var filename = filename.replace(/ /g, '_');
		
		}
		if (this.prefs.getBoolPref("useZoteroToRename")) filename=Zotero.Attachments.getFileBaseNameFromItem(item.itemID);
		        
		if(this.prefs.getBoolPref("userInput")) filename=this.addUserInput(filename,filename_org);
		
		return(filename);
		
	},
	
	// Rename & Move Existing Attachments
	RenameAttachment: function(item, att,import_att,dest_dir,subfolder,subfolderFormat) {
		// get link mode and item ID
		var linkmode = att.attachmentLinkMode;
		var itemID = item.id;
	
		// only proceed if linked or imported attachment
		if(att.isImportedAttachment() | linkmode==Zotero.Attachments.LINK_MODE_LINKED_FILE) {
	
			// get object of attached file
			var file = att.getFile();

			// create file name using ZotFile rules
			var filename = this.getFilename(item, file.leafName) + "." + this.getFiletype(file.leafName);
			var filename = Zotero.File.getValidFileName(filename);
			var location = this.getFolder(item,dest_dir,subfolder,subfolderFormat);

			if (import_att | item.libraryID) {	
										
				// rename file associated with attachment
				att.renameAttachmentFile(filename);

				// change title of attachment item
				att.setField('title', filename);
				att.save();
		
				// get object of attached file
				var file = att.getFile();	
			
				// output
				if (linkmode!=Zotero.Attachments.LINK_MODE_LINKED_FILE) this.infoWindow("Zotfile Report","Imported Attachment renamed to \'" + filename + "\'.",8000);	
								
			}
	
			// (a) LINKED ATTACHMENT TO IMPORTED ATTACHMENT
			if (linkmode==Zotero.Attachments.LINK_MODE_LINKED_FILE	& import_att) {	
																	
				// Attach file to selected Zotero item
	            var newAttID=Zotero.Attachments.importFromFile(file, itemID,item.libraryID);
		
				// remove file from hard-drive  
	            file.remove(false);

				// erase old attachment
				att.erase();
		
				// output
				this.infoWindow("Zotfile Report","Imported Attachment \'" + filename + "\'.",8000);	
				
				// return id of attachment
				return newAttID;
			}
		
			// (b) TO LINKED ATTACHMENT (only if library is local and not cloud)
	//		if (linkmode==Zotero.Attachments.LINK_MODE_IMPORTED_FILE & !import_att) {
			if (!import_att & !item.libraryID) {												
				// move pdf file 
				var newfile_path=this.moveFile(file,location, filename);
			
				if (newfile_path!="NULL") {
					    	
			    	// recreate the outfile nslFile Object 
				    var file = this.createFile(newfile_path);
	
					// create linked attachment
					var newAttID=Zotero.Attachments.linkFromFile(file, itemID,item.libraryID);
		
					// erase old attachment
					att.erase();
		
					this.infoWindow("Zotfile Report","Linked Attachment \'" + file.leafName + "\'.",8000);	
					
					// return id of attachment
					return newAttID;
				}
			}
		}
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
			if(message) this.infoWindow("Zotfile Error","The source folder is not valid. Please change the the source folder under Zotero-Actions-Zotfile Preferences. You might have to use a custom folder.",8000);
			return(-1);
		}		
	 	      /* 				browser.download.folderList==2    
						// browser.download.useDownloadDir    
						// indicates whether or not the user's preference is to automatically save files into the download directory. If this value is false, the user is asked what to do.
						// browser.download.folderList
						// 0 indicates the Desktop; 
						// 1 indicates the systems default downloads location; 
						// 2 indicates a custom (see: browser.download.dir) folder
						// browser.download.dir		 
		//				  var source_dir= 
					      //browser.download.getCharPref("dir")       
					//pref.getCharPref('browser.download.dir')              
					      //pref.getCharPref('browser.download.lastDir')         
					// browser.download.useDownloadDir 	      */
	},   
	
HelloWorld: function() {
    alert("Hello World");
},
	
	// FUNCTION: Rename & Move Existing Attachments
	ExistingAttachments: function(){
		var win = this.wm.getMostRecentWindow("navigator:browser"); 
		var items = win.ZoteroPane.getSelectedItems();
//		var items = ZoteroPane.getSelectedItems();
				
		// Loop through selected item
		var confirmed=1;    
		if (this.prefs.getBoolPref("confirmation_batch_ask") & items.length>=this.prefs.getIntPref("confirmation_batch")) var confirmed=confirm("You are about to rename and move the attachments of " + items.length + " items. Do you want to proceed?");  		
		if(confirmed) for (var i=0; i < items.length; i++) {			
			var item = items[i];   	
			var itemID = item.id;

			if(item.isRegularItem()) {
				// get all attachments
				var attachments = item.getAttachments();

				// go through all attachments
				for (var j=0; j < attachments.length; j++) {  
				
					// get current attachments
					var attID = attachments[j];
					var att = Zotero.Items.get(attID);
					
					// preserve attachment note and tags
					var att_note=att.getNote();
				    var att_tags=att.getTagIDs();
				
					// Rename and Move Attachment 
					var file = att.getFile();                                                  
					if(file!=false & (this.checkFiletype(this.getFiletype(file.leafName)) | !this.prefs.getBoolPref("useFilestypesForBatch"))) var attID=this.RenameAttachment(item, att,this.prefs.getBoolPref("import"),this.prefs.getCharPref("dest_dir"),this.prefs.getBoolPref("subfolder"),this.prefs.getCharPref("subfolderFormat"));												
					
					// restore attachments note and tags
					if(att_note!="" | att_tags) {
						var att = Zotero.Items.get(attID);  
						if(att_note!="") att.setNote(att_note);
						if(att_tags) for each (var tag in att_tags) att.addTagByID(tag);
						att.save();                   
					}
				}				
			}						
		}
		
		// Rename individual attachment
		if(items.length==1) {
			var item = items[0];   	

			if(item.getSource()) if(item.isAttachment()) {
				
				// get parent item
				var parent=Zotero.Items.get(item.getSource()); 
				
				// preserve attachment note and tags
				var att_note=item.getNote();
			    var att_tags=item.getTagIDs();				
			
				// Rename and Move Attachment
				if(parent.isRegularItem() & item.getFile()!=false) var attID=this.RenameAttachment(parent, item,this.prefs.getBoolPref("import"),this.prefs.getCharPref("dest_dir"),this.prefs.getBoolPref("subfolder"),this.prefs.getCharPref("subfolderFormat"));
				
				// get new attachment file
				var att = Zotero.Items.get(attID);     
				
				// restore attachments note and tags
				if(att_note!="" | att_tags) {
					 
					if(att_note!="") att.setNote(att_note);
					if(att_tags) for each (var tag in att_tags) att.addTagByID(tag);
					att.save();                   
				}
				
				// select new attachment
				win.ZoteroPane.selectItem(attID,att.libraryID);				
			}
		}		
	}
};



