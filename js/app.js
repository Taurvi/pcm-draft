
//  Create Angular App
var ngApp = angular.module('ngApp', ['ngRoute']);

ngApp.config(function($routeProvider) {
    $routeProvider
        .when('/', {
           templateUrl: 'templates/signup.html',
           controller: 'CtrlSignup'
       })
       .when('/view/', {
           templateUrl: 'templates/view.html',
           controller: 'CtrlView'
       })
});

var debug;
var debugArray2;
// Creates Angular Controller
ngApp.controller('CtrlSignup', ['$scope', '$http', function($scope, $http) {
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
        $scope.summonerInfo.captain = $scope.agreeCaptain;
        $scope.summonerInfo.substitute = $scope.agreeSub;

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
                $scope.registerToDatabase($scope.summonerInfo);
            })
            .error(function() {
                $scope.summonerInfo.tier = 'UNRANKED';
                $scope.summonerInfo.division = 'N/A';
                $scope.registerToDatabase($scope.summonerInfo);
            })
    }

    $scope.registerToDatabase = function(summonerInfo) {
        // Adds new database, Sample Tournament
        var Participants = Parse.Object.extend("Participants");

        var newParticipant = new Participants();
        newParticipant.set('summonerId', summonerInfo.id);
        newParticipant.set('summonerName', summonerInfo.username);
        newParticipant.set('summonerProfileIconId', summonerInfo.profileIconId);
        newParticipant.set('summonerTier', summonerInfo.tier);
        newParticipant.set('summonerDivision', summonerInfo.division);
        newParticipant.set('summonerPrimaryRole', summonerInfo.primaryRole);
        newParticipant.set('summonerSecondaryRole', summonerInfo.secondaryRole);
        newParticipant.set('summonerCaptain', summonerInfo.captain);
        newParticipant.set('summonerSubstitute', summonerInfo.substitute);
        newParticipant.save().then(function(newParticipant) {
            debugMsg('THIS FUCKING WORKED')
            $('#register-id').text(newParticipant.id);
            $('#form-signup').css('display', 'none');
            $('#register-success').css('display', 'initial');
        }, function() {
            debugMsg('THIS FUCKING FAILED')
            $('#form-signup').css('display', 'none');
            $('#register-failure').css('display', 'initial');
        })
    }
}]);

var debugResult;

ngApp.controller('CtrlView', ['$scope', '$http', function($scope, $http) {
    $scope.participantList = [];
    $scope.readDatabase = function () {
        var Participants = Parse.Object.extend("Participants");
        var queryParticipants = new Parse.Query(Participants);

        queryParticipants.find({
            success: function (results) {
                $scope.participantList = [];
                debugResults2 = results;
                results.map(function(participant) {
                    $scope.participantList.push(participant.attributes);
                })
                debugResult = $scope.participantList;
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message);
            }
        });
    }
}]);