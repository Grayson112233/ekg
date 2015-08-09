var app = angular.module('ekg', []);

app.controller('EkgController', EkgController);

function EkgController($scope){
	$scope.name = "Grayson";
}