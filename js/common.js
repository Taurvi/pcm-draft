"use strict";

//initialize Parse library with your application ID and your app's JavaScript library key
Parse.initialize('gL6CptrtxgnFF16KIK4yiuwKHoSOOcxipWzpoXhH', 'QQSCuwKNGnEON8tCSgWUROI7yRBXg3mWsGQWhrRx');


var debugMode = true;

// Global Vars
var leagueKey = '48cf3dc2-9638-4c1b-900f-1aae5f63c8d3';

// Debug function
var debugMsg = function(msg) {
    if (debugMode)
        console.log("<<<|DEBUG|>>> " + msg);
}

/**
 * Shows an error in an element on the page with the class 'error-message'
 * @param err {Object} the error to be shown
 */
function showError(msg) {
    $('.error-message').html('<i class="fa fa-exclamation-triangle"></i> ' + msg).fadeIn();
}

/**
 * Clears any currently showing error
 */
function clearError() {
    $('.error-message').fadeOut().empty();
}