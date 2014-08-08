chrome.tabs.onUpdated.addListener(function(id, info, tab){
    if(tab.url.indexOf("flickr.com")!== -1) {
        chrome.pageAction.show(tab.id);
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {

    if (request.method == "getTabURL") {

        // Get the current active tab in the lastly focused window
        chrome.tabs.query({
            active: true,
            windowId : chrome.windows.WINDOW_ID_CURRENT
        }, function(tabs) {
            // and use that tab to fill in out title and url
            var tab = tabs[0];
            console.log(tab.url);
            sendResponse({url : tab.url});
        });
    }
    else {
        sendResponse({}); // snub them.
    }

    return true;
});
