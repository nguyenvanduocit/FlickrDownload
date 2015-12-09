chrome.tabs.onUpdated.addListener(function (id, info, tab) {
    var parser = document.createElement('a');
    parser.href = tab.url;
    if (parser.hostname == "www.flickr.com") {
        var pathnames = parser.pathname.split('/');

        if (isElEqual(pathnames[1], "photos")) {
            if (isElEqual(pathnames[4], "sets")) {
                if (isNumber(pathnames[5])) {
                    chrome.pageAction.show(tab.id);
                }
            }
            else {
                if (isNumber(pathnames[4])) {
                    chrome.pageAction.show(tab.id);
                }
            }
        }
    }
});

function isElEqual(value1, value2) {
    if (typeof value1 != 'undefined') {
        if (value1 == value2) {
            return true;
        }
    }
    return false
}
function isNumber(value) {
    if (typeof value != 'undefined') {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
    return false
}