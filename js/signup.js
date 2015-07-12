
//  Create Angular App
var ngApp = angular.module('appSignUp', []);

var debugArray;
var debugArray2;
// Creates Angular Controller
ngApp.controller('ctrlSignup', ['$scope', '$http', function($scope, $http) {
    $scope.summonerBasicData = {};
    $scope.summonerLeagueData = {};
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
                $scope.summonerBasicData = {};
                $scope.errorName = true;
            })
    }

    $scope.unverify = function() {
        $scope.summonerBasicData = {};
        $scope.errorName = false;
        $scope.verified = false;
    }

    $scope.summonerInfo = {};
    $scope.signUp = function() {
        var key;
        for (item in $scope.summonerBasicData)
            key = item;
        $scope.summonerInfo.id = $scope.summonerBasicData[key].id;
        $scope.summonerInfo.username = $scope.summonerBasicData[key].name;
        $scope.summonerInfo.profileIconId = $scope.summonerBasicData[key].profileIconId;
        $scope.summonerInfo.primaryRole = $scope.selectedFirstRole;
        $scope.summonerInfo.secondaryRole = $scope.selectedSecondRole;

        $http.get('https://na.api.pvp.net/api/lol/na/v2.5/league/by-summoner/' + $scope.summonerInfo.id + '/entry?api_key=' + leagueKey)
            .success(function(response) {
                $scope.summonerLeagueData = response;
                var leagueData = $scope.summonerLeagueData[$scope.summonerInfo.id];
                if (leagueData[0].queue == 'RANKED_SOLO_5x5') {
                    $scope.summonerInfo.tier = leagueData[0].tier;
                    $scope.summonerInfo.division = leagueData[0].entries[0].division;
                } else {
                    $scope.summonerInfo.tier = 'UNRANKED';
                    $scope.summonerInfo.division = 'N/A';
                }
                registerToDatabase($scope.summonerInfo);
            })
            .error(function() {
                $scope.getData.tier = 'UNRANKED';
                $scope.getData.division = 'N/A';
                registerToDatabase($scope.summonerInfo);
            })
    }
}]);

var registerToDatabase = function(summonerInfo) {
    // Adds new database, Sample Tournament
    var Tournament = Parse.Object.extend('SampleTournament');

    var newTournament = new Tournament();
    newTournament.set('id', summonerInfo.id);
    newTournament.set('name', summonerInfo.username);
    newTournament.set('profileIconId', summonerInfo.profileIconId);
    newTournament.set('tier', summonerInfo.tier);
    newTournament.set('division', summonerInfo.division);
    newTournament.set('primaryRole', summonerInfo.primaryRole);
    newTournament.set('secondaryRole', summonerInfo.secondaryRole);

    newTournament.save(null, {
        success: function() {
            // Execute any logic that should take place after the object is saved.
            debugMsg('saved!')
        },
        error: function(err) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
            debugMsg('error!')
        }
    });
}

