'use strict';
//-------------------------------------------------------------------------------------------------------------------//

myPoCApp.controller('MainPageCtrl', function($scope, $location, $http, $window) {
console.log("MainPageCtrl:",$scope);

	$scope.success = false;
	$scope.from    = '';
	$scope.subject = '';
	$scope.text    = '';

	$scope.nlcResponse = {};
	$scope.classes     = [];
/*	
  //call /getEmails
  //input:
  //output: success, text, from, subject


  //call /classify
  //input: text
  //output: text, top_class, classes[class_name, confidence]


  //process the response, identify the top_class and the classes
  //then determine what value should be for the (send) "to"



  var toS = 'Watson PoC Group1 <watson@donotreply.com>';

  //call /sendToGroup
  //input: to, text, subject, from
  //output: status
*/
//-------------------------------------------------------------------------------------------------------------------//
$scope.classify = function() {

	//do not allow calling /classify if there is no text value

	var data = JSON.stringify({
		'text': $scope.text
	});
	var headers = {'Content-Type': 'application/x-www-form-urlencoded'};
	var url = HTTPType+hostname+':'+RESTAPIPort+RESTAPIVersion+'/classify';

	$http.post(url, data, headers).success(function(data) {
		$scope.nlcResponse = data;
console.log("text="+data.text);
/*
{"classifier_id":"9ddfa8x241-nlc-16309",
"url":"https://gateway.watsonplatform.net/natural-language-classifier/api/v1/classifiers/9ddfa8x241-nlc-16309",
"text":"This is a test support email concerning the fact I cannot connect to my wifi and need support assistance. many thanks tony pigram ",
"top_class":"network_access",
"classes":[
{"class_name":"network_access","confidence":0.9790284574324678},
{"class_name":"status","confidence":0.014765075897394087},
{"class_name":"account_access","confidence":0.003280823473231082},
{"class_name":"password_reset","confidence":0.002925643196907013}]
}}
*/
		$scope.top_class = data.top_class;
		$scope.classes.push(data.classes);
		$scope.apply;

	}).error(function() {
		console.log("ERROR doing POST to /v1/classify");
		$window.alert("There was an issue invoking /classify.  Please try again later.");
	});

}
//-------------------------------------------------------------------------------------------------------------------//
$scope.getEmails = function() {

	var returnedData = [];
	var url = HTTPType+hostname+':'+RESTAPIPort+RESTAPIVersion+'/getEmails/';
//console.log("url="+url);

	$http.get(url).success(function(data) {
		returnedData = data;
//		$window.alert("The REST API call was successful for you");
		//check .length just incase do not get a result returned
		for(var i=0; i <returnedData.length; i++) {
/*
			console.log(returnedData[i].success);
			console.log(returnedData[i].text);
			console.log(returnedData[i].from);
			console.log(returnedData[i].subject);
*/
			$scope.text = returnedData[i].text;
			$scope.from = returnedData[i].from;
			$scope.subject = returnedData[i].subject;

		}

		//now reflect change in UI
		$scope.apply;

	}).error(function() {
		console.log("ERROR doing POST to /v1/getEmails");
		$window.alert("There was an issue invoking /getEmails.  Please try again later.");
	});
};

//------------------------------------------------------------------------------------------------------------------//

    $scope.onLoad = function() {
        console.log("MainPageCtrl loaded");
//		$scope.getEmails(); //we should call this when invoked from a button press
    };

//-------------------------------------------------------------------------------------------------------------------//

/***************************************/
	//called when controller is started (when page is loaded/refreshed)
    $scope.onLoad();
/***************************************/

});
