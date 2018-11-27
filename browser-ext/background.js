//Initializing Variables

var person = new Object();
var responses = 0;
var toServer = {}
var firstTime = false
var complete = false
var myPopUp = -1;
var loggedInGoogle = false;
var videoNumberIterator = 0;
var videoDumpIndex = 0;
var videoRecommendations = {};
var singleVideoRecommendation = new Object(); 
var surveyResultsComplete;
var userSubscriberList;
var GOOGLE_SEARCH = []
var a = 0;
var b = 0;
var Googlecomplete = false;
var Videoscomplete = false;
var Surveycomplete = false;
var youTubeCommentsDone = false;
var check3 = true
var YouTubeWatchHistory = [];
var YouTubeSearchHistory = [];
var GoogleActivity = [];
var NumberofDaysToGoBackForGoogleSearch = 190//Set the number of days here
var monthsToGoBackComments = 6
var userComments = []
var restrictionType = ""
var iterator = 0;

//List of videos whose recommendations are crawled

var videoList = ["https://www.youtube.com/watch?v=L0MK7qz13bU",
				"https://www.youtube.com/watch?v=aKuivabiOns",
				"https://www.youtube.com/watch?v=kJQP7kiw5Fk",
				"https://www.youtube.com/watch?v=V4dl1iiu2jA",
				"https://www.youtube.com/watch?v=UeG1ftTmLAg",
				"https://www.youtube.com/watch?v=thjrV-HR34A",
				"https://www.youtube.com/watch?v=8dVt7eE3BAo",
				"https://www.youtube.com/watch?v=nntGTK2Fhb0",
				"https://www.youtube.com/watch?v=fVqOyXdDQTc",
				"https://www.youtube.com/watch?v=jjd-BeTX6U0",
				"https://www.youtube.com/watch?v=lsbqH5bJURc",
				"https://www.youtube.com/watch?v=_9YMpuLDnwo",
				"https://www.youtube.com/watch?v=HP-MbfHFUqs",
				"https://www.youtube.com/watch?v=IGJ2jMZ-gaI",
				"https://www.youtube.com/watch?v=WRzEzLlD8Nk",
				"https://www.youtube.com/watch?v=lx4O4K6CozY",//
				"https://www.youtube.com/watch?v=WPtuMfyVak8",
				"https://www.youtube.com/watch?v=evYan65Xs7Q",//
				"https://www.youtube.com/watch?v=1vnzNUP7Jbg",
				"https://www.youtube.com/watch?v=kp9_Z7touRQ",
			    "https://www.youtube.com/watch?v=jsF0o5YLwDk",//
				"https://www.youtube.com/watch?v=hnlA1tsY-lI",//
				"https://www.youtube.com/watch?v=uor1b6VD5Zc",
				"https://www.youtube.com/watch?v=1o-oWUCpTKQ",
				"https://www.youtube.com/watch?v=KYniUCGPGLs",
				"https://www.youtube.com/watch?v=Xi6BjmipH58"]
						

var videoListWithRepeats = []; 

for (var i=0; i <videoList.length ; i++) 
{
	videoListWithRepeats.push(videoList[i]);
	videoListWithRepeats.push(videoList[i]);
	videoListWithRepeats.push(videoList[i]);
}

videoList = videoListWithRepeats;


var requestFilter = {
    urls: ["https://www.youtube.com/related_ajax*"]
},

extraInfoSpec = ['requestHeaders', 'blocking'],
handler = function(details) {
  var isRefererSet = false;
  var headers = details.requestHeaders,
      blockingResponse = {};

	var headerVal;
  for (var i = 0, l = headers.length; i < l; ++i) {
	if (headers[i].name == 'x-spf-previous') {
          headerVal = headers[i].value;
          break;
      }
  }
  for (var i = 0, l = headers.length; i < l; ++i) {
      if (headers[i].name == 'referer') {
          headers[i].value = headerVal;
          isRefererSet = true;
          break;
      }
  }

  if (!isRefererSet) {
      headers.push({
          name: "referer",
          value: headerVal
      });
  }
  blockingResponse.requestHeaders = headers;
  return blockingResponse;
};


chrome.webRequest.onBeforeSendHeaders.addListener(handler, requestFilter, extraInfoSpec);


function nextRequest(res, itct, id_token, client_version, page_label, page_cl, checksum, currentUrl, refreshNumber, pageHtml)
{
	var relatedURL = "https://www.youtube.com/related_ajax?ctoken=" + res + "&continuation=" + res + "&itct=" + itct;
	var xhttp;
	xhttp=new XMLHttpRequest();
	xhttp.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) {
			try{
				response = xhttp.responseText;
				response = JSON.parse(response);
				var responseCheck = 0;
				if(response[1]['response']['continuationContents']['watchNextSecondaryResultsContinuation'] == undefined)
					responseCheck = 1
				
				myUrl = currentUrl.slice(32);
				var tmp = new Object;
				tmp[0] = pageHtml; //Temporarily stores page html
				if(responseCheck == 0)
					tmp[1] = response //Stores response of 'Show More' button if available
			
				if(videoRecommendations[myUrl] == undefined)
					videoRecommendations[myUrl] = [];
				
				videoRecommendations[myUrl][refreshNumber] = tmp;
				
				if(iterator == videoList.length-1)
				{	
					Videoscomplete = true;
					console.log(videoRecommendations)
					if(Googlecomplete === true)
					{	
						console.log("Download Request when Videos Done");
						downloadFile(person);
					}
				}
				iterator = iterator + 1
			}	
			catch(exception)
			{
				console.log("Related Request: " + exception)
			}
		}
		else
		{
			requestFailure();
		}
	};
  
	xhttp.open("GET", relatedURL, true);
	xhttp.setRequestHeader("x-spf-previous", currentUrl);
	xhttp.setRequestHeader("x-spf-referer", currentUrl);
	xhttp.setRequestHeader("x-youtube-client-name", "1");
	xhttp.setRequestHeader("x-youtube-client-version", client_version);
	xhttp.setRequestHeader("x-youtube-identity-token", id_token);
	xhttp.setRequestHeader("x-youtube-page-cl", page_cl);
	xhttp.setRequestHeader("x-youtube-page-label", page_label);
	xhttp.setRequestHeader("x-youtube-utc-offset", "300");
	xhttp.setRequestHeader("x-youtube-variants-checksum", checksum);
	xhttp.send(JSON.stringify({"ctoken": res, "continuation": res, "itct": itct}));
	
}


function videoCrawl(url, refreshNo)
{
	var xhttp;
	xhttp=new XMLHttpRequest();
	xhttp.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) {
			try{
				receivedHTML = xhttp.responseText
				var z = receivedHTML.indexOf('"INNERTUBE_CONTEXT_CLIENT_VERSION"')
				client_version = receivedHTML.substring(z+36, z+500)
				z = receivedHTML.indexOf('"ID_TOKEN"')
				id_token = receivedHTML.substring(z+12, z+500)
				z = receivedHTML.indexOf('"PAGE_BUILD_LABEL"')
				page_label = receivedHTML.substring(z+20, z+500)
				z = receivedHTML.indexOf('"PAGE_CL"')
				page_cl = receivedHTML.substring(z+10, z+500)
				var y = receivedHTML.indexOf('"VARIANTS_CHECKSUM"')
				checksum = receivedHTML.substring(y+21, y+500)
				var x = receivedHTML.indexOf("itct");
				var itct = receivedHTML.substring(x+7, x+500);
				var n = receivedHTML.lastIndexOf('"continuation":');
				var res = receivedHTML.substring(n+16, n+500);
				
				delimiter = id_token.indexOf('"');
				id_token = id_token.substring(0, delimiter)
				delimiter = client_version.indexOf('"');
				client_version = client_version.substring(0, delimiter)
				delimiter =  page_label.indexOf('"');
				page_label = page_label.substring(0, delimiter)
				delimiter = page_cl.indexOf(',');
				page_cl = page_cl.substring(0, delimiter)
				delimiter = checksum.indexOf('"');
				checksum = checksum.substring(0, delimiter);
				delimiter = itct.indexOf('"');
				itct = itct.substring(0, delimiter);
				delimiter = res.indexOf('"');
				res = res.substring(0, delimiter);
				
				nextRequest(res, itct, id_token, client_version, page_label, page_cl, checksum, url, refreshNo, receivedHTML)
			}	
			catch(exception)
			{
				console.log("Main Request: " + exception)
			}
		}
		else
		{
			requestFailure();
		}
			
	};
	  
	xhttp.open("GET", url, true);
	xhttp.send();	
}

function requestFailure()
{
	if(iterator == videoList.length-1)
	{	
		Videoscomplete = true;
		console.log(videoRecommendations)
		if(Googlecomplete === true)
		{	
			console.log("Download Request when Videos Done");
			downloadFile(person);
		}
	}
	iterator = iterator + 1
	
}


function requestNextCommentsData(continuationToken, idToken, clientVersion, pageLabel, pageCL, variantChecksum)
{
	var relatedURL = "https://www.youtube.com/browse_ajax?ctoken=" + continuationToken + "&continuation=" + continuationToken;
	console.log()
	var xhttp;
	xhttp=new XMLHttpRequest();
	xhttp.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) {
			try{
				response = xhttp.responseText;
				response = JSON.parse(response);
				comments = response[1]['response']['continuationContents']['itemSectionContinuation']['contents']
				for(var y in comments)
					userComments.push(comments[y])
				timeAgo = response[1]['response']['continuationContents']['itemSectionContinuation']['contents']
				timeAgo = timeAgo[timeAgo.length - 1]['commentHistoryEntryRenderer']['timestamp']['simpleText'].split(" ")
				if((timeAgo[0] > monthsToGoBackComments && timeAgo[1] == "months") || response[1]['response']['continuationContents']['itemSectionContinuation']['continuations'] == undefined)
				{
					console.log("Finish Comment Crawling")
					youTubeCommentsDone = true;
					for(var l = 0; l<userComments.length; l++)
					{
						commentText = userComments[l]['commentHistoryEntryRenderer']['content']['simpleText']
						commentDate = userComments[l]['commentHistoryEntryRenderer']['timestamp']['simpleText']
						commentVideoID = userComments[l]['commentHistoryEntryRenderer']['summary']['runs'][0]['navigationEndpoint']['watchEndpoint']['videoId']
						commentArray = []
						commentArray.push(commentText)
						commentArray.push(commentVideoID)
						commentArray.push(commentDate)
						userComments[l] = commentArray
					}
						
					downloadFile(person);
				}
				else
				{
					continuationToken = response[1]['response']['continuationContents']['itemSectionContinuation']['continuations'][0]['nextContinuationData']['continuation']
					requestNextCommentsData(continuationToken, idToken, clientVersion, pageLabel, pageCL, variantChecksum)
				}
			}	
			catch(exception)
			{
				console.log("Related Request: " + exception)
			}
		}
		else
		{
			youTubeCommentsDone = true;
			downloadFile(person);
		}
	};
  
	xhttp.open("POST", relatedURL, true);
	xhttp.setRequestHeader("x-spf-previous", "https://www.youtube.com/feed/history/comment_history");
	xhttp.setRequestHeader("x-spf-referer", "https://www.youtube.com/feed/history/comment_history");
	xhttp.setRequestHeader("x-youtube-client-name", "1");
	xhttp.setRequestHeader("x-youtube-client-version", clientVersion);
	xhttp.setRequestHeader("x-youtube-identity-token", idToken);
	xhttp.setRequestHeader("x-youtube-page-cl", pageCL);
	xhttp.setRequestHeader("x-youtube-page-label", pageLabel);
	xhttp.setRequestHeader("x-youtube-utc-offset", "300");
	xhttp.setRequestHeader("x-youtube-variants-variantChecksum", variantChecksum);
	xhttp.send();
	
}


function crawlComments(url, refcontinuationTokenhNo)
{
	var xhttp;
	xhttp=new XMLHttpRequest();
	xhttp.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) {
			
			try{
				receivedHTML = xhttp.responseText
				var z = receivedHTML.indexOf('"INNERTUBE_CONTEXT_CLIENT_VERSION"')
				clientVersion = receivedHTML.substring(z+36, z+500)
				z = receivedHTML.indexOf('"ID_TOKEN"')
				idToken = receivedHTML.substring(z+12, z+500)
				z = receivedHTML.indexOf('"PAGE_BUILD_LABEL"')
				pageLabel = receivedHTML.substring(z+20, z+500)
				z = receivedHTML.indexOf('"PAGE_CL"')
				pageCL = receivedHTML.substring(z+10, z+500)
				var y = receivedHTML.indexOf('"VARIANTS_CHECKSUM"')
				variantChecksum = receivedHTML.substring(y+21, y+500)
				var n = receivedHTML.lastIndexOf('"continuation":');
				var continuationToken = receivedHTML.substring(n+16, n+500);
				
				delimiter = idToken.indexOf('"');
				idToken = idToken.substring(0, delimiter)
				delimiter = clientVersion.indexOf('"');
				clientVersion = clientVersion.substring(0, delimiter)
				delimiter =  pageLabel.indexOf('"');
				pageLabel = pageLabel.substring(0, delimiter)
				delimiter = pageCL.indexOf(',');
				pageCL = pageCL.substring(0, delimiter)
				delimiter = variantChecksum.indexOf('"');
				variantChecksum = variantChecksum.substring(0, delimiter);
				delimiter = continuationToken.indexOf('"');
				continuationToken = continuationToken.substring(0, delimiter);
				
				requestNextCommentsData(continuationToken, idToken, clientVersion, pageLabel, pageCL, variantChecksum)
			}	
			catch(exception)
			{
				console.log("Main Request: " + exception)
			}
		}
	};
	  
	xhttp.open("GET", "https://www.youtube.com/feed/history/comment_history", true);
	xhttp.send();	
}

chrome.cookies.onChanged.addListener(function(info) {
  var cookie1 = JSON.stringify(info)
  // checking if signed into google
     if(cookie1.indexOf("accounts.google.com") !== -1 && cookie1.indexOf("LSID") !== -1){
        if(info.removed === true){
            loggedInGoogle = false;
            console.log("Not Signed in  Google");
        } else {
            loggedInGoogle = true;
            console.log("Signed in  Google");    
        }

        if(myPopUp !== -1)
              chrome.tabs.sendMessage(myPopUp, {"type":"logStatus" , "msgg": loggedInGoogle});  
    }
});

function logStatus(){
  chrome.cookies.get({url:'https://accounts.google.com', name:'LSID'}, function(cookie) {
    if (cookie) {
        // console.log('Sign-in cookie:', cookie);
        loggedInGoogle = true;
    }
    else{
        // console.log("not signed in")
        loggedInGoogle = false;
    }
  });
  chrome.tabs.sendMessage(myPopUp, {"type":"logStatus", "msgg": loggedInGoogle});
}
    
function update_GoogleSearchBUNDLES(all){
  var arr = [];
  if(all!==undefined && all!==null){
  	for (var i=0; i <all.length ; i++) {
	    sub = all[i][9]
	    sub.push(all[i][4]); //consider timezone, for pakistan this becomes GMT+05:00
		urlString = String(sub[3]);
		if(urlString.indexOf('www.youtube.com') != -1)
		{
			if(sub[2]=="Watched")
			{
				YouTubeWatchHistory.push(sub);
			}
			if(sub[2]=="Searched for")
			{
				YouTubeSearchHistory.push(sub);
			}
		}
		else
		{
			GoogleActivity.push(sub);
		}
	  }	
  }
  b++;
  if(a===b && Googlecomplete == true){
      Finalize({"message": "ALL DONE","data":GOOGLE_SEARCH, "type":"googleSearchTerms"});
  }
}
function sendMoreBundles(bundle){
  var xhr = new XMLHttpRequest();
  xhr.open('POST', "https://myactivity.google.com/bundle-details?utm_source=my-account&utm_medium&utm_campaign=my-acct-promo&jspb=2&jspb=1", true);
  xhr.onerror = function(e){
    console.log("error?")
  	Finalize({"message": "ALL DONE","data":GOOGLE_SEARCH,"Error":"error encountered with responseText = "+e.currentTarget.responseText, "type":"googleSearchTerms"});
  }
  xhr.onreadystatechange = processGoogleSearchRequestBundles;
  xhr.send(JSON.stringify({"bundle":bundle}));

}
function processGoogleSearchRequestBundles(e) {   
  if (e.currentTarget.readyState == 4 && e.currentTarget.status == 200) {
    var response = e.currentTarget.responseText;
    if(e.currentTarget.responseURL.indexOf('myactivity.google.com')!== -1){
       response = response.split("\n")[1]
       var tmp = response
       var ar = eval(tmp);
       var all = ar[0];
       update_GoogleSearchBUNDLES(all)
    }       
  }
  else if(e.currentTarget.readyState == 4 && e.currentTarget.status !== 200){
  	Finalize({"message": "ALL DONE","data":GOOGLE_SEARCH,"Error":e.currentTarget.status, "type":"googleSearchTerms"});
  }
}
function update_GoogleSearch(all){
  var arr = [];
  if (all!==undefined && all!==null){
    for (var i=0; i <all.length ; i++) {
      var sub = all[i][1];
      for (var x=0; x<sub.length ; x++) {
        var sub1 = sub[x][1][2];
        sendMoreBundles(sub[x][1][3])
        a++;
      }
    }
  }
}
function sendMore(ct){
  var xhr = new XMLHttpRequest();
  xhr.open('POST', "https://myactivity.google.com/myactivity?" + restrictionType + "utm_source=my-account&utm_medium&utm_campaign=my-acct-promo&jspb=1", true);
  xhr.onerror = function(e){
  	Finalize({"message": "ALL DONE","data":GOOGLE_SEARCH,"Error":"error encountered with responseText = "+e.currentTarget.responseText, "type":"googleSearchTerms"});
  }
  xhr.onreadystatechange = processGoogleSearchRequest;
  xhr.send(JSON.stringify({"ct":ct}));
}
function processGoogleSearchRequest(e) {      
  if (e.currentTarget.readyState == 4 && e.currentTarget.status == 200) {
    var response = e.currentTarget.responseText;
    if(e.currentTarget.responseURL.indexOf('myactivity.google.com')!== -1){
       response = response.split("\n")[1]
       var tmp = response//.slice(6);
       var ar = eval(tmp);
       var all = ar[0];
       if(all!==undefined && all!==null){
        update_GoogleSearch(all)
         if(GetDiff(Math.floor(ar[0][0][0]/1000)) > NumberofDaysToGoBackForGoogleSearch){
           console.log("Google Data Complete")
		   restrictionType = ""
           Googlecomplete = true
         }
         else{
          sendMore(ar[1]);
         }
       }
       else{
        Googlecomplete = true
       }
    }       
  }
  else if(e.currentTarget.readyState == 4 && e.currentTarget.status !== 200){
  	Finalize({"message": "ALL DONE","data":GOOGLE_SEARCH,"Error":e.currentTarget.status, "type":"googleSearchTerms"})
  }
}


function GetDate(){
  var dateObj = new Date();
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();

  newdate = year + "/" + month + "/" + day;
  return newdate
}
function GetDiff(d1){
  var d2 = GetDate();
  var date1 = new Date(d1);
  var date2 = new Date(d2);
  var timeDiff = date2.getTime() - date1.getTime();
  var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
  return diffDays;
}

function crawlGoogleActivity(request) {
  if( request.message === "clicked_browser_action" ) {
    console.log("Crawling Google Activity")
    var xhr3 = new XMLHttpRequest();
    xhr3.open('POST', "https://myactivity.google.com/myactivity?" + restrictionType+ "utm_source=my-account&utm_medium&utm_campaign=my-acct-promo&jspb=1", true);
    xhr3.onerror = function(e){
      Finalize({"message": "ALL DONE","data":"","Error":"error encountered with responseText = "+e.currentTarget.responseText, "type":"googleSearchTerms"});
    }
    xhr3.onreadystatechange = processRequest;
    xhr3.send();

    function processRequest(e) {      
      if (e.currentTarget.readyState == 4 && e.currentTarget.status == 200) {
        var response = e.currentTarget.responseText;
        if(e.currentTarget.responseURL.indexOf('myactivity.google.com')!== -1 && check3){
          try{
            response = response.split("\n")[1];
            var tmp = response;//.slice(6);
            var ar = eval(tmp);
            var all = ar[0];
            update_GoogleSearch(all);
            check3 = false
            sendMore(ar[1]);  
          }
          catch(exception){
            Finalize({"message": "ALL DONE","data":GOOGLE_SEARCH,"Error":exception,"Response":response, "type":"googleSearchTerms"});
            check3 = false
          }
        }
      }
      else if(e.currentTarget.readyState == 4 && e.currentTarget.status !== 200){
        var response = e.currentTarget.responseText;
        if(e.currentTarget.responseURL.indexOf('myactivity.google.com')!== -1 && check3){
          Finalize({"message": "ALL DONE","data":GOOGLE_SEARCH,"Error":e.currentTarget.status,"Response":response, "type":"googleSearchTerms"});
          check3 = false
        }      	
      }
    }
  }
}

function Finalize(request) {
  if(complete === false){
    if( request.message === "ALL DONE" && toServer[request.type] === undefined) {
      responses++;
      if(request.Error === undefined){
        toServer[request.type] = request.data;  
      }
      else {
       toServer[request.type] = {"Response":request.data,"Error":request.Error}; 
      }
	  if(Videoscomplete === true)
	  {
		console.log("Download Request when Google Activity Done");
		downloadFile(person);
	  }
    } 
  }
}

function crawlSubscribedChannels()
{
	const Http = new XMLHttpRequest();
	const url= "https://www.youtube.com/subscription_manager?action_takeout=1";
	Http.open("GET", url);
	Http.send();
	Http.onreadystatechange=function (){
		if(this.readyState == 4 && this.status == 200)
		{	
			console.log("Storing Subscribers");
			userSubscriberList = Http.responseText;
		}
	}    
}

chrome.browserAction.onClicked.addListener(function () {
	firstTime = true
    console.log("Clicked Browser Action Icon")
	chrome.tabs.create({
		    	url: chrome.extension.getURL('newtab.html'),
		    	active: true
		  	}, function(tab) {
		      	myPopUp = tab.id;
		      	logStatus();
		    });
	
});

function getID(e) {      
  console.log(toServer)
  if (e.currentTarget.readyState == 4 && e.currentTarget.status == 200) {
    var response = e.currentTarget.responseText;
    console.log('CONGRATS!!! YOUR RESPONSE HAS BEEN RECEIVED SUCCESSFULLY')
    chrome.tabs.sendMessage(myPopUp, {"type":"ACK" ,"MESSAGE":"SUCCESS","id":response});
    //chrome.storage.sync.set({'identifierExt': response}, function() {console.log('setting the identifier for future reference (if applicable)')})
    //chrome.cookies.set({ url: "https://chrome.google.com/webstore/detail/web-usage-survey/dcenfdhhmiiaimdgbcbipbkeidginooj", name: "CookieVar", value: response, expirationDate: 1531332073 });
  }
  else if(e.currentTarget.readyState == 4 && e.currentTarget.status == 404){
  	var response = e.currentTarget.responseText;
    console.log('ERROR!!! YOU NEED TO MAIL IT TO US');
    chrome.tabs.sendMessage(myPopUp, {"type":"ACK" ,"MESSAGE":"FAILURE"});
  }
}

function downloadFile(jsonToSave)
{
	console.log("Google Data: " + Googlecomplete)
	console.log("Video Data: " + Videoscomplete)
	console.log("Survey Data: " + Surveycomplete)
	console.log("Comments Data: " + youTubeCommentsDone)
	if(Googlecomplete === true && Videoscomplete === true && Surveycomplete===true && youTubeCommentsDone === true)
	{	
		console.log("Downloading User Data File");
		person.id = Math.random().toString().slice(2,26); 
		var d = new Date();
		person.createdAt = d.toISOString();
		person.updatedAt = d.toISOString();
		person.subscriberList = userSubscriberList;
		person.searchHistory = YouTubeSearchHistory;
		person.watchHistory = YouTubeWatchHistory;
		person.commentHistory = userComments;
		person.recVideos = videoRecommendations;
		person.surveyResults = surveyResultsComplete;
		person.googleActivity = GoogleActivity;
		//chrome.tabs.sendMessage(myPopUp, {"type":"CONVERT","data":person});

		chrome.tabs.sendMessage(myPopUp, {"type":"ACK" ,"MESSAGE":"FAILURE","data":jsonToSave});
		
		/*var xhr = new XMLHttpRequest();
        xhr.open('POST', "https://radiant-dusk-50026.herokuapp.com/usersInfo", true);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhr.onreadystatechange = getID;//need to comment this out for US participants
		xhr.onerror = function(e){
		        		console.log("please mail it to us")
		        		chrome.tabs.sendMessage(myPopUp, {"type":"ACK" ,"MESSAGE":"FAILURE","data":jsonToSave});
		        	}
		xhr.send(JSON.stringify(jsonToSave));*/
	}
}
function getID(e) {      
  if (e.currentTarget.readyState == 4 && e.currentTarget.status == 201) {
    var response = e.currentTarget.responseText;
    console.log('CONGRATS!!! YOUR RESPONSE HAS BEEN RECEIVED SUCCESSFULLY')
    chrome.tabs.sendMessage(myPopUp, {"type":"ACK" ,"MESSAGE":"SUCCESS","id":response});
    //chrome.storage.sync.set({'identifierExt': response}, function() {console.log('setting the identifier for future reference (if applicable)')})
    //chrome.cookies.set({ url: "https://chrome.google.com/webstore/detail/web-usage-survey/dcenfdhhmiiaimdgbcbipbkeidginooj", name: "CookieVar", value: response, expirationDate: 1531332073 });
  }
  else if(e.currentTarget.readyState == 4 && e.currentTarget.status == 404){
  	var response = e.currentTarget.responseText;
    console.log('ERROR!!! YOU NEED TO MAIL IT TO US');
    chrome.tabs.sendMessage(myPopUp, {"type":"ACK" ,"MESSAGE":"FAILURE"});
  }
}
	

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	if(request.type == "Page End Signal"){
    	chrome.tabs.sendMessage(myPopUp, {"type":"Page End Signal Received"});
    }
	if(request.type == "init"){
      chrome.tabs.sendMessage(myPopUp, {"type":"logStatus" , "msgg": loggedInGoogle});
    }
	if(request.type == "dataCollection"){
        crawlGoogleActivity({"message": "clicked_browser_action"}); 
		crawlSubscribedChannels();
    }
	if(request.type == "surveyResult"){
		 Surveycomplete = true;
		 //person.surveyResults = request.data;
		 surveyResultsComplete = request.data;
		 downloadFile(person);
	}
	if(request.type == "crawlVideosNow"){
		sleep(15000).then(() => {
			crawlComments();
		
			var r = 0;
			for (var z=0;z <videoList.length ; z++) 
			{
				if(r == 3)
					r = 0;
				videoCrawl(videoList[z], r); 
				r = r + 1;
			}
			
		});
	}
	if(request.type == "ConvertedData")
	{
		var xhr = new XMLHttpRequest();
        xhr.open('POST', "https://radiant-dusk-50026.herokuapp.com/usersInfo", true);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhr.onreadystatechange = getID;//need to comment this out for US participants
		xhr.onerror = function(e){
		        		console.log("please mail it to us")
		        		chrome.tabs.sendMessage(myPopUp, {"type":"ACK" ,"MESSAGE":"FAILURE","data":person});
		        	}
		console.log("Sent data: ")
		console.log(request.data)
		xhr.send(JSON.stringify(request.data))
	}
 
});

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}



