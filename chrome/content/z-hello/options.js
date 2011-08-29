function updateSettings(which) {   
	
//	var win = this.wm.getMostRecentWindow("navigator:browser"); 
//	var items = win.ZoteroPane.getSelectedItems();		
//	var item = items[0];    	
//	var filename=Zotero.Hello.getFilename(item, "");
			              
	// Batch Renaming                                                                   
	if(which=="confirm" | which=="all") {	
		var setting = document.getElementById('pref-zotfile-confirmation_batch_ask').value;
		if(which!="all") var setting = !setting;
		document.getElementById('id-zotfile-confirmation_batch').disabled = !setting;  			   
	}      
		
	// Add 'et al' 
	if(which=="etal" | which=="all") {	
		var setting = document.getElementById('pref-zotfile-add_etal').value;
		if(which!="all") var setting = !setting;
		document.getElementById('id-zotfile-etal').disabled = !setting;  
	}            

	// subfolder 
	if(which=="subfolder" | which=="all") {	
		var setting = document.getElementById('pref-zotfile-subfolder').value;
		if(which!="all") var setting = !setting;
		document.getElementById('id-zotfile-subfolderFormat').disabled = !setting;  
	}  
	
	// Source Folder
	if(which=="source" | which=="all") {
		var setting = document.getElementById('pref-zotfile-source_dir_ff').value;
		if(which!="all") var setting = !setting;
		document.getElementById('id-zotfile-source_dir').disabled = setting;  
		document.getElementById('id-zotfile-source_dir-button').disabled = setting;  	   
//		document.getElementById('id-zotfile-source_dir-label').disabled = setting; 	  
  	}

	// Destination Folder
	if(which=="dest" | which=="all") {
		var setting = document.getElementById('pref-zotfile-import').value;
		if(which!="all") var setting = !setting;
		document.getElementById('id-zotfile-dest_dir').disabled = setting;        
		document.getElementById('id-zotfile-dest_dir-button').disabled = setting;  	   		
//		document.getElementById('id-zotfile-dest_dir-label').disabled = setting; 
		document.getElementById('id-zotfile-subfolder').disabled = setting; 
		document.getElementById('id-zotfile-subfolderFormat').disabled = setting; 		 	  
		
		if (!setting) {       
			  document.getElementById('id-zotfile-subfolderFormat').disabled = !document.getElementById('pref-zotfile-subfolder').value;  			
		}		  				 
	}
	          
	// userinput 
	if(which=="userinput" | which=="all") {	
		var setting = document.getElementById('pref-zotfile-userInput').value;
		if(which!="all") var setting = !setting;
		document.getElementById('id-zotfile-userInput_Default').disabled = !setting;  
	} 
	
	// Use Zotero to Rename
	if(which=="zotrename" | which=="all") {				
		var setting = document.getElementById('pref-zotfile-useZoteroToRename').value;	   
		if(which!="all") var setting = !setting;
		document.getElementById('id-zotfile-renameFormat').disabled = setting;  
		document.getElementById('id-zotfile-renameFormat-label').disabled = setting;  
		document.getElementById('id-zotfile-renameFormat-des').disabled = setting;  
		document.getElementById('id-zotfile-renameFormat-des2').disabled = setting;  
		document.getElementById('id-zotfile-renameFormat_patent').disabled = setting;  
		document.getElementById('id-zotfile-renameFormat_patent-label').disabled = setting;  
		document.getElementById('id-zotfile-truncate_title').disabled = setting;  
		document.getElementById('id-zotfile-max_titlelength').disabled = setting;  
		document.getElementById('id-zotfile-max_titlelength-label').disabled = setting;  
		document.getElementById('id-zotfile-max_titlelength-des').disabled = setting;  
		document.getElementById('id-zotfile-max_authors').disabled = setting;  
		document.getElementById('id-zotfile-max_authors-label').disabled = setting;  		
		document.getElementById('id-zotfile-add_etal').disabled = setting;    
  		document.getElementById('id-zotfile-etal').disabled = setting;  
  		document.getElementById('id-zotfile-etal-label').disabled = setting;
//		document.getElementById('id-zotfile-subfolder').disabled = setting;  
//		document.getElementById('id-zotfile-subfolderFormat').disabled = setting;  
		document.getElementById('id-zotfile-userInput').disabled = setting;  
		document.getElementById('id-zotfile-userInput_Default').disabled = setting;  
		document.getElementById('id-zotfile-replace_blanks').disabled = setting;  		
		
		if (!setting) {
			  document.getElementById('id-zotfile-etal').disabled = !document.getElementById('pref-zotfile-add_etal').value;  
//	  		  document.getElementById('id-zotfile-subfolderFormat').disabled = !document.getElementById('pref-zotfile-subfolder').value;  
			  document.getElementById('id-zotfile-userInput_Default').disabled = !document.getElementById('pref-zotfile-userInput').value;  		   			
		}
	}           	
    	
}

function previewFilename() {    
	try {
		var win = Zotero.Hello.wm.getMostRecentWindow("navigator:browser"); 
		var items = win.ZoteroPane.getSelectedItems();		
		var item = items[0];    	
						
		if(item.isRegularItem()) var filename=Zotero.Hello.getFilename(item, "");
		if(item.getSource()) if(item.isAttachment()) var filename=Zotero.Hello.getFilename(Zotero.Items.get(item.getSource()), "");

		return(filename);		
	}
	catch (err) {
		return("[Please select a zotero item to see a preview of your renaming rules]");				
	}
}
      
   