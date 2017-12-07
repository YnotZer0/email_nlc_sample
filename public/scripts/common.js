'use strict';

//these are currently global variables - should really move into a Service
var ENV             = "dev";
var HTTPType        = "http://"; //https://"; //http://";   //switch over when working locally(HTTP) or Bluemix(HTTPS)
var HTTPPort        = "6013"; //443"; //"6012"; //when running locally on localhost
var RESTAPIPort     = "6013"; //443"; //"6012"; //when running locally on localhost
var RESTAPIVersion  = "/v1";
var hostname        = "localhost"; //"myEmailPoc.eu-gb.mybluemix.net"; //localhost";

var myPoCApp = angular.module('myPoCApp',[
    'ngRoute'
    ])

.config(function($routeProvider) {
    $routeProvider
    .when('/mainpage', {
        templateUrl: "views/mainpage.html",
        controller: 'MainPageCtrl'
    })
    .when('/page1', {
        templateUrl: "views/page1.html",
        controller: 'Page1Ctrl'
    })
    .otherwise({
      redirectTo: '/mainpage'
    });
});
