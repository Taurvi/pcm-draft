//  Create Angular App
var ngApp = angular.module('appSignUp', []);

// Creates Angular Controller
ngApp.controller('ctrlSignup', ['$scope', '$http', function($scope, $http) {
    $scope.summonerBasicData = {};
    $scope.errorName = false;
    $scope.verified = false;
    $scope.selectedFirstRole = 'Any';
    $scope.selectedSecondRole = 'Any';
    $scope.agreeTerms = false;

    $scope.searchSummoner = function (){
        clearError();
        $scope.error = false;
        $http.get('https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/' + $scope.inputSummonerName + '?api_key=' + leagueKey)
            .success(function(response) {
                $scope.summonerBasicData = response;
                $scope.verified = true;
            })
            .error(function() {
                showError('Error, summoner not found!');
                $scope.errorName = true;
            })
    }

    $scope.unverify = function() {
        $scope.errorName = false;
        $scope.verified = false;
    }

    $scope.getData = {};
    $scope.signUp = function() {
        var key;
        for (item in $scope.summonerBasicData)
            key = item;
        $scope.getData.id = $scope.summonerBasicData[key].id;
        $scope.getData.name = $scope.summonerBasicData[key].name;
        $scope.getData.profileIconId = $scope.summonerBasicData[key].profileIconId;

        $http.get('https://na.api.pvp.net/api/lol/na/v1.4/summoner/by-name/' + $scope.inputSummonerName + '?api_key=' + leagueKey)
            .success(function(response) {
                $scope.summonerBasicData = response;
                $scope.verified = true;
            })
            .error(function() {
                showError('Error, summoner not found!');
                $scope.errorName = true;
            })
    }
}]);