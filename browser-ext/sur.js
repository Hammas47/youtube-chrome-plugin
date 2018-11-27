console.log("loading")
var counter = 0;
var loggedInGoogle = false;
var consent = false;
var surveyDat  = {};
var responseSent = false;
var dataCollectionStart = false;
var startVideoCrawling = false;



chrome.runtime.sendMessage({type:'init', data:'making sure that this content script has been injected'});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if(request.type == "Page End Signal Received"){
      var pg = survey.getPageByName("page2");
      pg.scrollToTop();
      survey.render();
    }
    if(request.type == "logStatus"){
      loggedInGoogle = request.msgg;
      alterSurvey();
    }
	if(request.type == "CONVERT"){
	 alert("Here")
      var x = new Object();
	  var userData = JSON.stringify(request.data);
	  console.log("Data: ");
	  console.log(userData)
	  x.googleActivity = LZString.compressToUTF16(userData);
      chrome.runtime.sendMessage({type:'ConvertedData', data: x});
    } 	
    if(request.type === "ACK"){
      console.log(request.MESSAGE)
	  alert("Done")
	  responseSent = true;
      if(request.MESSAGE === "FAILURE"){
		 document.querySelector('#surveyElement').innerHTML = "<h3>Thank You for your cooperation.</h3>"
         document.querySelector('#surveyResult').innerHTML = "<br/>Please download the generated file and share it with us.<br/> Thank you for your help!";
		 var x = JSON.stringify(request.data);
         var compressedX = x;
		 
         var blob = new Blob([compressedX], {type: "application/json;charset=utf-8;",});
		 var zip = new JSZip();
			zip.file(request.data['id'] + ".json", blob);
			zip.generateAsync({type:"blob", compression: "DEFLATE"})
			.then(function(content) {
				// see FileSaver.js
				saveAs(content, request.data['id'] + "response.zip");
			});
	   } 
	   else 
	   {
		    document.querySelector('#surveyElement').innerHTML = "<h3>Thank You for your cooperation.</h3>"
	  	    document.querySelector('#surveyResult').innerHTML = "<br/>Your response has been recieved. Thank you for your patience! <br />"
	   }
    }
    console.log("gg: " + loggedInGoogle);
    
    if(loggedInGoogle === true && consent === true && responseSent === false && dataCollectionStart === false){
	  dataCollectionStart = true;
      chrome.runtime.sendMessage({type:'dataCollection'}); 
    }
});



function saveText(filename, text) {
    var tempElem = document.createElement('a');
    tempElem.setAttribute('href', 'data:text/plain,' + encodeURIComponent(text));
    tempElem.setAttribute('download', filename);
    tempElem.click();
}

function myfunc(val){
  console.log(val);
  if(val === "I Agree"){
    consent = true;
  }
  if(loggedInGoogle === true && consent === true && responseSent === false && dataCollectionStart === false){
	  dataCollectionStart = true;
      chrome.runtime.sendMessage({type:'dataCollection'}); 
  }
}

function alterSurvey(){
  var gg = survey.getQuestionByName("gg", true);
  var gg1 = survey.getQuestionByName("gg1", true);
  var gg2 = survey.getQuestionByName("gg2", true);

  if(loggedInGoogle === true){
    gg1.visible = true;
    gg2.visible = false;
    gg.visible = false;
    
  } else {
    gg2.visible = true;
    gg1.visible = false;
    gg.visible = true;
  }

  survey.render();
}

Survey.Survey.cssType = "bootstrap";
Survey.defaultBootstrapCss.navigationButton = "btn btn-blue";
Survey.defaultBootstrapCss.progressBar = "progress-bar progress-bar-custom";

var MyTextValidator = (function (_super) {
    Survey.__extends(MyTextValidator, _super);
    function MyTextValidator() {
        _super.call(this);
    }
    MyTextValidator.prototype.getType = function () { return "mytextvalidator"; };
    MyTextValidator.prototype.validate = function (value, name) {
        if(value === "Yes") {
            //report an error
            return new Survey.ValidatorResult(null, new Survey.CustomError(this.getErrorText("gg")));
        }
        if(value === "Yes!"){
          return new Survey.ValidatorResult(null, new Survey.CustomError(this.getErrorText("fb")));
        }
        if(value === "No"){
          return new Survey.ValidatorResult(null, new Survey.CustomError(this.getErrorText("no")));
        }
        if(value === "I Agree" || value === " I do not Agree"){
          myfunc(value);
          return null
        }
        return null;
    };
    //the default error text. It shows if user do not set the 'text' property
    MyTextValidator.prototype.getDefaultErrorText = function(name) {
        if(name === "no"){
          return "Please sign in to proceed";
        } 
        if(name === "gg"){
          return "I'm afraid you haven't logged into Google";
        } 
        if(name === "fb"){
          return "I'm afraid you haven't logged into Facebook";
        } 
    }
    return MyTextValidator;
})(Survey.SurveyValidator);

Survey.MyTextValidator = MyTextValidator;
//add into survey Json metaData
Survey.JsonObject.metaData.addClass("mytextvalidator", [], function () { return new MyTextValidator(name); }, "surveyvalidator");



window.survey = new Survey.Model({

  title: "YouTube Personalization Study", showProgressBar: "bottom", goNextPageAutomatic: false, showNavigationButtons: true, 
  showQuestionNumbers: 'off',
    
   "pages": [
  { 
   "elements": [
    {
     "type": "panel",
     "name": "panel3",
     "elements": [
      {
       "type": "html",
       "html": "<heading> Welcome to our Study </heading>",
       "name": "question2"
      }
     ],
     "title": "Welcome"
    }
   ],
   "name": "page1"
  },
  {
   "elements": [
    {
     "type": "panel",
     "name": "panel2",
     "elements": [
      {
       "type": "html",
       "html":  
`We would like to invite you to participate in a research study. The goal of the study is to understand how one's online behavior impacts the video recommendations they receive from YouTube.
<br/><br/>
Your participation should take no longer than 10-15 minutes.
<br/><br/>
This browser extension will collect your Google Activity, YouTube history (i.e. watch, search and comments), list of subscribed YouTube channels and generated recommendations on a set of videos. 
<br/><br/>
This data will be used to analyze the correlations between your online behavior and your recommendations. We will NOT record any other information, including your username and password for any online services, or personal information like your real name, etc. 
<br/><br/>
While we collect your data in the background, we will ask you several questions about your demographics and web usage. Your responses to these questions are confidential and will be used for research purposes only. We will not share your responses with anyone who is not involved in this research. All data that is collected will be stripped of personally identifiable information to the best of our ability. Our software is designed to upload survey and crawled data directly to our server over an encrypted connection using HTTPS. No data will be stored elsewhere. Once this study is complete, you may uninstall this extension, at which point we will no longer be able to access any of your information. 
<br/><br/>
The decision to participate in this research project is voluntary. You do not have to participate;  there is no penalty if you choose not to participate in this research or if you choose to stop participating at any time.
<br/><br/>
By checking the “I agree” box below, you agree that you have read and understand the information about and voluntarily agree to participate in the survey.
<br/><br/>
`, 
       "name": "consent"
      },
     {
       "type": "radiogroup",
       "choices": [
        "I Agree",
        " I do not Agree"
       ],
       "colCount": 2,
       "isRequired": true,
       "name": "terms",
       "title": "Do you agree to the terms and Conditions",
       validators: [{type: "mytextvalidator"}]
      },
      {
	     "type": "text",
	     "isRequired": false,
	     "name": "review",
	     "title": "Please share why you declined the survey. Your response will help us make our survey better",
	     "visibleIf": "{terms}=' I do not Agree'"
      }
     ],
     "title": "Informed Consent"
    }
   ],
   "name": "page2"
  },
  {
   "elements": [
    {
     "type": "panel",
     "name": "panel1",
     "elements": [
      {
       "type": "html",
       "html": "To proceed with our survey you must have a Google account and be logged-in to it.\n",
       "name": "question3"
      }
     ],
     "title": "Google Login"
    },
    {
     "type": "html",
     "html": "<br/>\n<b>CONGRATS</b> you are  signed in!\n<br/><br/>",
     "name": "gg1",
     "visible": false
    },
    {
     "type": "html",
     "html": "<br/><br/>\n<a href=\"https://accounts.google.com/ServiceLogin\" class=\"button\" target=\"_blank\">Click here to login to Google</a>\n<br/><br/>",
     "name": "gg2",
     "visible": false
    },
    {
     "type": "radiogroup",
     "choices": [
      "Yes",
      "No"
     ],
     // "colCount": 2,
     "isRequired": true,
     "name": "gg",
     "title": "Have you signed in to Google?",
     "visible": false,
      validators: [{type: "mytextvalidator"}]
    }
   ],
   "name": "page3"
  },
   {
   "elements": [
    {
     "type": "radiogroup",
     "choices": [
      "United States",
      "Pakistan"
     ],
     "isRequired": true,
     "name": "loc",
     "title": "Where are you from?"
    }
   ],
   "name": "page4"
  },
  {
   "elements": [
    {
     "type": "panel",
     "name": "panel5",
     "elements": [
      {
       "type": "html",
       "html": "First, we would like to know a bit about you. Remember, your answers to these questions are confidential so please be honest.\n",
       "name": "question1"
      }
     ],
     "title": "Basic Demographics"
    },
    {
     "type": "radiogroup",
     "choices": [
      "18-24",
      "25-44",
      "45-64",
      "65+",
      "I prefer not to say"
     ],
     "isRequired": true,
     "name": "age",
     "title": "How old are you?"
    },
    {
     "type": "radiogroup",
     "choices": [
      "Male",
      "Female",
      "I prefer not to say"
     ],
     "hasOther": true,
     "isRequired": true,
     "name": "gender",
     "title": "Please select your gender:"
    },
    {
     "type": "checkbox",
     "choices": [
      "White/Caucasian",
      "Black/African American",
      "Native American/Alaska Native/Hawaii Native",
      "Latino/Hispanic",
      "Asian",
      "Other",
      "I prefer not to say"
     ],
     "isRequired": true,
     "name": "ethnicity",
     "title": "What is your race or ethnicity (check all that apply)?",
     "visible": false,
     "visibleIf": "{loc}='United States'"
    },
    {
     "type": "checkbox",
     "choices": [
      "Urdu",
      "English",
      "Balochi",
      "Punjabi",
      "Sindhi",
      "Pashtu",
      "I prefer not to say"
     ],
     "isRequired": true,
     "name": "ethnicity-pk",
     "title": "What language do you speak (check all that apply)?",
     "visible": false,
     "visibleIf": "{loc}='Pakistan'"
    },
    {
     "type": "radiogroup",
     "choices": [
      "None",
      "High School",
      "College",
      "Some graduate school",
      "Masters",
      "Doctoral",
      "I prefer not to say"
     ],
     "isRequired": true,
     "name": "education",
     "title": "What is the highest level of education you have completed?"
    },
    {
     "type": "radiogroup",
     "choices": [
      "Never married",
      "Married",
      "Divorced",
      "Separated",
      "Widowed",
      "I prefer not to say"
     ],
     "isRequired": true,
     "name": "marital status",
     "title": "What is your current marital status? "
    },
    {
     "type": "dropdown",
     "choices": [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "I prefer not to say"
     ],
     "isRequired": true,
     "name": "children",
     "title": "How many children do you care for in your household?"
    },
    {
     "type": "radiogroup",
     "choices": [
      "Yes, Full-time",
      "Yes, Part-time",
      "No",
      "I prefer not to say"
     ],
     "isRequired": true,
     "name": "employment status",
     "title": "Are you currently employed?\n"
    },
    {
     "type": "radiogroup",
     "choices": [
      "Under $15,000",
      "$15,000 to 30,000",
      "$30,000 to 45,000",
      "$45,000 to 60,000",
      "$60,000 to 75,000",
      "$75,000 to 100,000",
      "$100,000 to 150,000",
      "$150,000 and over",
      "I prefer not to say"
     ],
     "isRequired": true,
     "name": "income",
     "title": "What is your yearly household income? ",
     "visible": false,
     "visibleIf": "{loc}='United States'"
    },
    {
     "type": "radiogroup",
     "choices": [
      "Under Rs. 3,00,000",
      "Rs. 300,000 to 600,000",
      "Rs. 600,000 to 1,000,000",
      "Rs. 1,000,000 to 15,000,000",
      "Rs. 1,500,000 and over",
      "I prefer not to say"
     ],
     "isRequired": true,
     "name": "income-pk",
     "title": "What is your yearly household income? ",
     "visible": false,
     "visibleIf": "{loc}='Pakistan'"
    },
    {
     "type": "radiogroup",
     "choices": [
      "Pakistan People's Party (PPP)",
      "Pakistan Muslim League (N)",
      "Pakistan Tehreek-e-Insaf (PTI)",
      "Awami National Party (ANP)",
      "Jamaat-e-Islami Pakistan.",
      "Jamiat-e-Ulema-e-Islam (F)",
      "Muttahida Qaumi Movement (MQM)",
      "Pakistan Awami Tehreek (PAT)",
      "Other",
      "Prefer not to say"
     ],
     "isRequired": true,
     "name": "politics-pk",
     "title": "Which of the following best describes your political views?\n",
     "visible": false,
     "visibleIf": "loc='Pakistan'"
    },
    {
     "type": "radiogroup",
     "choices": [
      "Conservative",
      "Moderate",
      "Liberal",
      "Other",
      "Prefer not to say"
     ],
     "isRequired": true,
     "name": "politics",
     "title": "Which of the following best describes your political views?\n",
     "visible": false,
     "visibleIf": "loc='United States'"
    },
    {
     "type": "dropdown",
     "choices": [
      "Alabama",
      "Alaska",
      "Arizona",
      "Arkansas",
      "California",
      "Colorado",
      "Connecticut",
      "Delaware",
      "Florida",
      "Georgia",
      "Hawaii",
      "Idaho",
      "Illinois",
      "Indiana",
      "Iowa",
      "Kansas",
      "Kentucky",
      "Louisiana",
      "Maine",
      "Maryland",
      "Massachusetts",
      "Michigan",
      "Minnesota",
      "Mississippi",
      "Missouri",
      "Montana",
      "Nebraska",
      "Nevada",
      "New Hampshire",
      "New Jersey",
      "New Mexico",
      "New York",
      "North Carolina",
      "North Dakota",
      "Ohio",
      "Oklahoma",
      "Oregon",
      "Pennsylvania",
      "Rhode Island",
      "South Carolina",
      "South Dakota",
      "Tennessee",
      "Texas",
      "Utah",
      "Vermont",
      "Virginia",
      "Washington",
      "West Virginia",
      "Wisconsin",
      "Wyoming",
      "District of Columbia",
      "Puerto Rico",
      "Guam",
      "American Samoa",
      "U.S. Virgin Islands",
      "Northern Mariana Islands"
     ],
     "isRequired": true,
     "name": "state",
     "title": "What state do you live in? ",
     "visible": false,
     "visibleIf": "loc='United States'"
    },
    {
     "type": "radiogroup",
     "choices": [
      "Urban",
      "Suburban",
      "Rural"
     ],
     "isRequired": true,
     "name": "current place",
     "title": "How would you describe the place where you currently live? \n"
    }
   ],
   "name": "page5"
  },
  {
   "elements": [
    {
     "type": "panel",
     "name": "panel6",
     "elements": [
      {
       "type": "html",
       "html": "We would like to know about your usage of the internet in general.\n",
       "name": "question5"
      }
     ],
     "title": "General internet and web usage"
    },
    {
     "type": "text",
     "inputType": "number",
     "isRequired": true,
     "name": "years of internet",
     "title": "How many years have you been using the internet?"
    },
    {
     "type": "radiogroup",
     "choices": [
      "30 minutes or less",
      "30 minutes - 1 hour",
      "1 -2 hours",
      "2 - 4 hours",
      "More than 4 hours"
     ],
     "isRequired": true,
     "name": "Approximately how much time do you spend each day browsing the web on a desktop computer or laptop?",
     "title": "Approximately how much time do you spend each day browsing the web on a desktop computer or laptop? "
    },
    {
     "type": "radiogroup",
     "choices": [
      "Chrome",
      "Firefox",
      "Internet Explorer/Edge",
      "Safari",
      "Brave"
     ],
     "isRequired": true,
     "name": "What Internet browser do you use most often?",
     "title": "What Internet browser do you use most often? "
    },
    {
     "type": "radiogroup",
     "choices": [
      "Google",
      "Bing",
      "DuckDuckGo",
      "Yahoo",
      "AOL",
      "Baidu",
	  "Naver",
	  "Yandex",
      "Other"
     ],
     "isRequired": true,
     "name": "Which search engines do you use most often?",
     "title": "Which search engines do you use most often? "
    },
    {
     "type": "radiogroup",
     "choices": [
      "less than 10",
      "10-50",
      "50-100",
      "100 or more"
     ],
     "isRequired": true,
     "name": "Approximately how many web searches do you conduct each day?",
     "title": "Approximately how many web searches do you conduct each day?"
    },
   ],
   "name": "page6"
  },
    {
   "elements": [
    {
     "type": "panel",
     "elements": [
      {
       "type": "html",
       "html": "We have a few questions about things you may have done to enhance your online privacy.\n",
       "name": "question5"
      }
     ],
     "name": "panel11",
     "title": "Tracking and Privacy\n"
    },
    {
     "type": "radiogroup",
     "choices": [
      "Yes",
      "No",
      "I don't know"
     ],
     // "colCount": 3,
     "isRequired": true,
     "name": "Do you have 'Do Not Track' enabled in your web browser?",
     "title": "Do you have 'Do Not Track' enabled in your web browser?"
    },
	{
     "type": "radiogroup",
     "choices": [
      "Yes",
      "No",
      "I don't know"
     ],
     "isRequired": true,
     "name": "Have you disabled YouTube 'Watch' history tracking on your Google account?",
     "title": "Have you disabled YouTube 'Watch' history tracking on your Google account?"
    },
	{
     "type": "radiogroup",
     "choices": [
      "Yes",
      "No",
      "I don't know"
     ],
     "isRequired": true,
     "name": "Have you disabled YouTube 'Search' history tracking on your Google account?",
     "title": "Have you disabled YouTube 'Search' history tracking on your Google account?"
    },
    {
     "type": "radiogroup",
     "choices": [
      "Yes",
      "No",
      "I don't know"
     ],
     // "colCount": 3,
     "isRequired": true,
     "name": "Have you ever opted-out of online tracking?",
     "title": "Have you ever opted-out of online tracking?"
    },
    {
     "type": "radiogroup",
     "choices": [
      "Yes",
      "No",
      "I don't know"
     ],
     // "colCount": 3,
     "isRequired": true,
     "name": "Do you use a proxy, virtual private network (VPN)",
     "title": "Do you use a proxy, virtual private network (VPN), or other anonymous web browsing service such as Tor?"
    },
    {
     "type": "radiogroup",
     "choices": [
      "Never",
      "Monthly",
      "Weekly",
      "Daily",
      "Multiple times a day"
     ],
     "isRequired": true,
     "name": "How often do you browse in private mode",
     "title": "How often do you browse in private mode (e.g. Incognito)?"
    },
    {
     "type": "radiogroup",
     "choices": [
      "Never",
      "Monthly",
      "Weekly",
      "Daily",
      "Multiple times a day"
     ],
     "isRequired": true,
     "name": "How often do you clear your cookies?",
     "title": "How often do you clear your cookies?"
    },
    {
     "type": "radiogroup",
     "choices": [
      "Never",
      "Monthly",
      "Weekly",
      "Daily",
      "Multiple times a day"
     ],
     "isRequired": true,
     "name": "How often do you clear your browsing history?",
     "title": "How often do you clear your browsing history?"
    }
   ],
   "name": "page7"
  }
 ],
 "triggers": [
  {
   "type": "complete",
   "operator": "equal",
   "value": " I do not Agree",
   "name": "terms"
  }
 ]
});

survey.onCurrentPageChanged.add(function (sender, options) {
	if(options["newCurrentPage"]["name"] == "page4")
	{
	  if(loggedInGoogle === true && consent === true && responseSent === false && startVideoCrawling === false)
	  {
			startVideoCrawling = true;
			chrome.runtime.sendMessage({type:'crawlVideosNow'}); 
	  }
	}
    chrome.runtime.sendMessage({type:'Page End Signal'}); 
});

survey.onComplete.add(function(result) {
	surveyDat = result.data;
	document.querySelector('#surveyElement').innerHTML = "<h3>Please wait while we process your response.</h3>"
	document.querySelector('#surveyResult').innerHTML = "<br/>This may take a while. We appreciate your patience."
    chrome.runtime.sendMessage({type:'surveyResult', data:result.data});
});

survey.onUpdateQuestionCssClasses.add(function(survey, options) {
    var classes = options.cssClasses;
    classes.title = "sq-title";
    classes.label = "sq-label";
    var x = options.question.getType();
    if (x === "radiogroup" || x === "checkbox" ) {
     classes.root = "sq-root";
    }

});

ReactDOM.render(< Survey.Survey model = {survey} />, 
		document.getElementById("surveyElement"));





