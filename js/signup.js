
//  Create Angular App
var ngApp = angular.module('appSignUp', []);

var debug;
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
                $scope.summonerInfo.tier = 'UNRANKED';
                $scope.summonerInfo.division = 'N/A';
                registerToDatabase($scope.summonerInfo);
            })
    }
}]);

var registerToDatabase = function(summonerInfo) {
    // Adds new database, Sample Tournament
    var Sample = Parse.Object.extend("Participants");
    var newSample = new Sample();

    var newSample = new Sample();
    newSample.set('summonerId', summonerInfo.id);
    newSample.set('summonerName', summonerInfo.username);
    newSample.set('summonerProfileIconId', summonerInfo.profileIconId);
    newSample.set('summonerTier', summonerInfo.tier);
    newSample.set('summonerDivision', summonerInfo.division);
    newSample.set('summonerPrimaryRole', summonerInfo.primaryRole);
    newSample.set('summonerSecondaryRole', summonerInfo.secondaryRole);
    newSample.save().then(function(newSample) {
        debugMsg('THIS FUCKING WORKED')
        $('#register-id').text(newSample.id);
        $('#form-signup').css('display', 'none');
        $('#register-success').css('display', 'initial');
    }, function() {
        debugMsg('THIS FUCKING FAILED')
        $('#form-signup').css('display', 'none');
        $('#register-failure').css('display', 'initial');
    })
}
