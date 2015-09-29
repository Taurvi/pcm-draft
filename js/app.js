
//  Create Angular App
var ngApp = angular.module('ngApp', ['ngRoute', 'ngCrossfilter']);

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

ngApp.controller('CtrlHeader', ['$scope', '$location', function($scope, $location) {
    $scope.isActive = function (viewLocation) {
        var active = (viewLocation === $location.path());
        return active;
    };
}]);
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
        if ($scope.agreeCaptain)
            $scope.summonerInfo.captain = $scope.agreeCaptain;
        else
            $scope.summonerInfo.captain = false;
        if($scope.agreeSub)
            $scope.summonerInfo.substitute = $scope.agreeSub;
        else
            $scope.summonerInfo.substitute = false;

        $http.get('https://na.api.pvp.net/api/lol/na/v2.5/league/by-summoner/' + $scope.summonerInfo.id + '/entry?api_key=' + leagueKey)
            .success(function(response) {
                $scope.summonerLeagueData = response;
                var leagueData = $scope.summonerLeagueData[$scope.summonerInfo.id];
                if (leagueData[0].queue == 'RANKED_SOLO_5x5') {
                    $scope.summonerInfo.tier = leagueData[0].tier;
                    $scope.summonerInfo.division = leagueData[0].entries[0].division;
                } else {
                    $scope.summonerInfo.tier = 'UNRANKED';
                    $scope.summonerInfo.division = '';
                }
                $scope.summonerInfo.rawRank = $scope.calculateRank($scope.summonerInfo.tier, $scope.summonerInfo.division);
                $scope.registerToDatabase($scope.summonerInfo);
            })
            .error(function() {
                $scope.summonerInfo.tier = 'UNRANKED';
                $scope.summonerInfo.division = '';
                $scope.summonerInfo.rawRank = 0;
                $scope.registerToDatabase($scope.summonerInfo);
            })
    }

    $scope.calculateRank = function(tier, division) {
        if(tier == 'UNRANKED') {
            return '0';
        } else {
            var ranking = 0;
            switch(tier) {
                case 'BRONZE':
                    ranking += 10;
                    break;
                case 'SILVER':
                    ranking += 20;
                    break;
                case 'GOLD':
                    ranking += 30;
                    break;
                case 'PLATINUM':
                    ranking += 40;
                    break;
                case 'DIAMOND':
                    ranking += 50;
                    break;
                case 'MASTER':
                    ranking += 60;
                    break;
                case 'CHALLENGER':
                    ranking += 70;
                    break;
                default:
                    debugMsg('ERROR! Should not be here!');
            }
            switch(division) {
                case 'V':
                    ranking += 1;
                    break;
                case 'IV':
                    ranking += 2;
                    break;
                case 'III':
                    ranking += 3;
                    break;
                case 'II':
                    ranking += 4;
                    break;
                case 'I':
                    ranking += 5;
                    break;
                default:
                    debugMsg('ERROR! Should not be here!');
            }
            return ranking;
        }
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
        newParticipant.set('summonerRawRank', $scope.summonerInfo.rawRank);
        newParticipant.save().then(function(newParticipant) {
            debugMsg('THIS WORKED')
            $('#register-id').text(newParticipant.id);
            $('#form-signup').css('display', 'none');
            $('#register-success').css('display', 'initial');
        }, function() {
            debugMsg('THIS FAILED')
            $('#form-signup').css('display', 'none');
            $('#register-failure').css('display', 'initial');
        })
    }
}]);

var debugResult;

ngApp.controller('CtrlView', ['$scope', '$http', 'Crossfilter', function($scope, $http, Crossfilter) {

    $scope.participantList = [];
    $scope.$ngc;

    $scope.readDatabase = function () {
        var Participants = Parse.Object.extend("Participants");
        var queryParticipants = new Parse.Query(Participants);
        var tempArray = [];
        queryParticipants.find({
            success: function (results) {
                $scope.participantList = [];
                results.map(function(participant) {
                    tempArray.push(participant.attributes);
                })
                $scope.$apply(function() {
                    debugMsg("apply was run!");
                    $scope.participantList = tempArray;
                    $scope.$ngc = new Crossfilter($scope.participantList, ['summonerName'])
                    $scope.$ngc.addDimension(['summonerTier', 'summonerCaptain', 'summonerSubstitute']);
                });
                debugResult = $scope.participantList;
            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message);
            }

        });
    }

    $scope.fuzzyLowercase = function (expected, actual) {
        var regExp = new RegExp(expected.toLowerCase());
        return actual.toLowerCase().match(regExp, 'i');
    }

    $scope.ranks = ['CHALLENGER', 'MASTER', 'DIAMOND', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'];
    $scope.selection =  ['CHALLENGER', 'MASTER', 'DIAMOND', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE'];

    $scope.toggleMultiSelection = function($ngc, type, option, filterSelection) {
        var idx = $scope.selection.indexOf(option);
        // is currently selected
        if (idx > -1) {
            filterSelection.splice(idx, 1);
        }
        // is newly selected
        else {
            filterSelection.push(option);
        }
        $scope.$ngc.filterBy(type, filterSelection, $ngc.filters.inArray('some'));
    };

    $scope.toggleSelection = function($ngc, checkbox, filterName, expected) {
        console.log(checkbox);
        if (checkbox) {
            $ngc.filterBy(filterName, expected);
        } else {
            $ngc.unfilterBy(filterName);
        }
    }



    debugModel = $scope.multiple;

    $scope.getRankImage = function(league, division) {
        if (league == 'UNRANKED') {
            return "http://lkimg.zamimg.com/images/medals/unknown.png";
        } else {
            var getLeague = league.toLowerCase();
            var getDivision;

            switch(division) {
                case 'I':
                    getDivision = '1';
                    break;
                case 'II':
                    getDivision = '2';
                    break;
                case 'III':
                    getDivision = '3';
                    break;
                case 'IV':
                    getDivision = '4';
                    break;
                case 'V':
                    getDivision = '5';
                    break;
                default:
                    debugMsg("Error! Should not have gotten here!")
            }
            return 'http://lkimg.zamimg.com/images/medals/' + getLeague + '_' + getDivision + '.png';
        }
    }
}]);