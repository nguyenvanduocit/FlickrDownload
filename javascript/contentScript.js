chrome.extension.onRequest.addListener( function(request, sender, sendResponse) {
    
        /**
         * Used to avoid problems when opening many photos
         */
        if (request.msg == "openAllPhotos")
        {
            
            if( confirm("Are you sure you want to open " + request.imgs.length + " tab(s)? It may take a while to download everything.") )
            {
                chrome.windows.create({url: request.imgs[0]}, function(win) {
                    for( var i = 1; i < request.imgs.length; i++ )
                    {
                        chrome.tabs.create({windowId: win.id, url: request.imgs[i]});
                    }
                });
            }
            
        }
        
});