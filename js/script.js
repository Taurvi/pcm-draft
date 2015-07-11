"use strict";

// Debug Mode
var debugMode = true;

// Debug function
var debugMsg = function(msg) {
    if (debugMode)
        console.log("<<<|DEBUG|>>> " + msg);
}



//  Create Angular App
var ngApp = angular.module('pcmApp', []);


//  Creates Controller
ngApp.controller('primary', ['$scope', '$http', function($scope, $http) {
    //* Global controller variables
    //  Used for showing the selected artist
    $scope.summonerLeagueData = {};

    $scope.searchSummoner = function() {
        clearError();
        $http.get('https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/' + $scope.inputSummoner + '?api_key=' + leagueKey)
            .success(function(response) {
                $scope.summonerLeagueData = response;
            })
            .error(function() {
                showError('Error, summoner not found!');
            })
    }


}]);