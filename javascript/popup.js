const apiUrl = "https://api.flickr.com/services/rest/?method=";
const apiKeyParam = "&api_key=0381296ffa92ae62d6f5b889e6e41085";
const perPage = "&per_page=1000";
var page = 1;
/**
 * Get all picture sizes and create thumbnail
 */
function getPicture(id)
{
	$.ajax({
		url: apiUrl + 'flickr.photos.getSizes&photo_id=' + id + apiKeyParam,
		dataType: "xml",
		
		success: function(xml) {
			var downloadlink = "<tr><td><img src='"+$(xml).find('size').first().attr("source")+"' /></td><td>";
			$(xml).find('size').each(function(){
				downloadlink += "<a class='downloadlink' target='_blank' href='"+getPhotoURL($(this).attr("source"))+"'>"+$(this).attr("label")+"</a> | ";
			});
			downloadlink+="</td></tr>";

			localStorage["lastID"] = id;
			localStorage["lastContent"] = downloadlink;

			$("#imgContainer").append(downloadlink);		
		}
		
	});
}

/**
 * Get all pictures inside some Photoset
 */
function getPhotoset(id)
{
	$.ajax({
		url: apiUrl + 'flickr.photosets.getPhotos&media=photos&photoset_id=' + id + perPage + "&page=" + page + apiKeyParam,
		dataType: "xml",
		
		success: function(xml) {
			var total=$(xml).find('photoset').attr("total");
			var process = 0;
			$(xml).find('photo').each(function(){
					$.ajax({
						url: apiUrl + 'flickr.photos.getSizes&photo_id=' + $(this).attr('id') + apiKeyParam,
						dataType: "xml",
						success: function(xml) {
							var downloadlink = "<tr><td><img src='"+$(xml).find('size').first().attr("source")+"' /></td><td>";

							$(xml).find('size').each(function(){
								downloadlink += "<a class='downloadlink' target='_blank' href='"+getPhotoURL($(this).attr("source"))+"'>"+$(this).attr("label")+"</a> | ";
							});
							downloadlink+="</td></tr>";
							localStorage["lastContent"]+=downloadlink;	
							$("#imgContainer").append(downloadlink);
							$("#setOk").html((++process)+"/"+total);
						}
						
					});
			});

			localStorage["lastID"] = id;
			page++;
			$("#setOk").html("+30");

		}
		
	});	
}

/**
 * Get the URL to open or download the big photo
 */
function getPhotoURL(url)
{
	var urlArr = url.split(".");
	urlArr[urlArr.length - 2] += "_d";
	return urlArr.join(".");
}

function restoreLast()
{
	if(localStorage["lastContent"])
	{

		$("#imgContainer").append(localStorage["lastContent"]);
	}
}
/**
 * Button handlers
 */
$(document).ready(function()
{
    chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
        console.log(response.farewell);
    });

    chrome.runtime.sendMessage({method: "getTabURL"}, function (response) {
        console.log(response);
        processImage(response.url);
    });

    function processImage(url) {
        if (url.indexOf('flickr.com\/photos') > -1) {
            var urlParts = url.split("/");

            // Set
            if (urlParts[5] == "sets") {
                if (localStorage["lastID"] == urlParts[6]) {
                    restoreLast();
                }
                else {
                    localStorage["lastAction"] = "set";
                    getPhotoset(urlParts[6]);
                }
            }
            // Photo
            else if (urlParts.length >= 6) {
                if (localStorage["lastID"] == urlParts[5]) {
                    restoreLast();
                }
                else {
                    localStorage["lastAction"] = "photo";
                    getPicture(urlParts[5]);
                }
            }
        }
        else {
            restoreLast();
        }
    }
});