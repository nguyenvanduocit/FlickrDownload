const apiUrl = "https://api.flickr.com/services/rest/?method=";
const apiKeyParam = "&api_key=0381296ffa92ae62d6f5b889e6e41085&format=json&nojsoncallback=1";

/**
 *
 * @param query
 * @param successCallback
 * @param failCallback
 */
var totalRequest = 0;
function sendRequest(option) {
    $.ajax({
        url: apiUrl + option.query + apiKeyParam,
        dataType: "json",
        global : option.global,
        success: function (response) {
            if (option.onSuccess && typeof(option.onSuccess) === "function") {
                option.onSuccess(response);
            }
        },
        fail: function () {
            if (option.onFail && typeof(option.onFail) === "function") {
                option.onFail(response);
            }
        }

    });
}


/*
 * @ param
 *  sizes array of size : { "label": "[String]", "width": [int], "height": [int], "source": "[url]", "url": "[URL]", "media": "[photo|video]" },
 */
function generatePhotoLink(sizes) {
    var result = "";
    var photos = "";
    var videos = "";

    $.each(sizes, function (index, photo) {
        if (photo.media == "photo") {
            photos += "<a class='downloadlink' target='_blank' href='" + getPhotoURL(photo.source) + "'>" + photo.width + "x" + photo.height + "</a>";
        }
        else {
            videos += "<a class='downloadlink' target='_blank' href='" + photo.source + "'>" + photo.width + "x" + photo.height + "</a>";
        }
    });

    result += '<image class="thumbnail" src="' + sizes[0].source + '">';
    result += '<div class="links">';

    if (photos != '') {
        result += '<div class="photolink"><span class="linkname">Photo : </span><span>' + photos + '</span></div>';
    }
    if (videos != '') {
        result += '<div class="videolink"><span class="linkname">Video : </span><span>' + videos + '</span></div>';
    }
    result += "</div>";
    return result;
}

/**
 * Get the URL to open or download the big photo
 */
function getPhotoURL(url) {
    var urlArr = url.split(".");
    urlArr[urlArr.length - 2] += "_d";
    return urlArr.join(".");
}

function updateLast(id, content) {
    localStorage["lastID"] = id;
    localStorage["lastContent"] = content;
}

function restoreLast() {
    if (localStorage["lastContent"]) {
        $("#imgContainer").html(localStorage["lastContent"]);
    }
    else {

    }
}

function getPhotoset(option) {
    var query = 'flickr.photosets.getPhotos&per_page=500&page=' + option.page + '&photoset_id=' + option.id;
    sendRequest({
        query: query,
        global:false,
        onSuccess: function (response) {
            var html = "";
            if (response.stat == "ok") {
                if (response.photoset.photo) {
                    $.each(response.photoset.photo, function (index, photo) {
                        getPhoto({id: photo.id});
                    });
                }
                if (option.page < response.photoset.pages) {
                    getPhotoset({id: option.id, page: (option.page+1)});
                }
            }
        }
    });
}

function getPhoto(option) {
    totalRequest++;
    var query = 'flickr.photos.getSizes&photo_id=' + option.id;
    sendRequest({
        query: query,
        global:true,
        onSuccess: function (response) {
            if (response.stat == "ok") {
                if (response.sizes) {
                    var container = $("#imgContainer");
                    var html = '<div class="row">' + generatePhotoLink(response.sizes.size) + '</div>';
                    container.append(html);
                }
            }
        }
    });
}
/**
 * Button handlers
 */
$(document).ready(function () {
chrome.tabs.query({
    active: true,
    windowId: chrome.windows.WINDOW_ID_CURRENT
}, function (tabs) {
    // and use that tab to fill in out title and url
    var tab = tabs[0];
    processImage(tab.url);
});
$(document).ajaxComplete(function() {
    totalRequest--;
    if(totalRequest == 0)
    {
        localStorage["lastContent"] = $("#imgContainer").html();
    }
});
function processImage(url) {

    var parser = document.createElement('a');
    parser.href = url;
    var pathnames = parser.pathname.split('/');
    // Set
    if (isElEqual(pathnames[3], "sets")) {
        if ((localStorage["lastID"] == pathnames[4]) && ( localStorage["lastContent"] )) {
            restoreLast();
        }
        else {
            localStorage["lastID"] = pathnames[4];
            getPhotoset({id: pathnames[4], page: 1});
        }
    }
    // Photo
    else if (isNumber(pathnames[3])) {
        if (( localStorage["lastID"] == pathnames[3] ) && ( localStorage["lastContent"] )) {
            restoreLast();
        }
        else {
            localStorage["lastID"] = pathnames[3];
            getPhoto({id: pathnames[3]});
        }
    }
}

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
});