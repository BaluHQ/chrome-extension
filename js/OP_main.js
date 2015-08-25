/********
 * Init *
 ********/

/*
 * Global variables
 */

var gvScriptName_OPMain = 'OP_main';
var gvTestWebsiteURL = 'balutestwebsite.html';

/*
 *
 */
(function initialise(){

    log(gvScriptName_OPMain + '.initialise: Start','INITS');
    window.addEventListener('DOMContentLoaded', DOMContentLoadedListener);

})();

function DOMContentLoadedListener(event){

    log(gvScriptName_OPMain + '.DOMContentLoadedListener: Start','LSTNR');
    createOptionsPage();
    userLog('OPTIONS: SHOW_OPTIONS');

}

/**************************
 * Options HTML Functions *
 **************************/

function createOptionsPage(){

    log(gvScriptName_OPMain + '.createOptionsPage: Start','PROCS');

    var contentDiv = document.getElementById('contentDiv');

    // First half of page is the log in form (log out button, or log in / sign up form) and the settings (if logged in)

    var userFormHTML = '';
    var settingsHTML = '';

    var userLoggedIn = chrome.extension.getBackgroundPage().isUserLoggedIn();

    if(userLoggedIn) {

        userFormHTML += '<br />';
        userFormHTML += '<div class="row">';
        userFormHTML += '  <div class="large-4 columns end">';
        userFormHTML += '    <a id="logOutButton" href="#" class="button radius tiny">Log Out</a>';
        userFormHTML += '  </div>';
        userFormHTML += '</div>';

        // Settings //

        // Title

        settingsHTML += '<div class="row">';
        settingsHTML += '  <div class="large-4 columns end">';
        settingsHTML += '    <h3>Settings</h3>';
        settingsHTML += '  </div>';
        settingsHTML += '</div>';

        // Sidebar show/hide

        settingsHTML += '<div class="row">';
        settingsHTML += '  <div class="large-4 columns end">';
        settingsHTML += '    <h4>Default sidebar behaviour</h4>';
        settingsHTML += '  </div>';
        settingsHTML += '</div>';

        settingsHTML += '<div class="row">';
        settingsHTML += '  <div class="large-8 columns end">';
        settingsHTML += '    <input type="radio" name="defaultShowOption" id="alwaysShow" value="alwaysShow"><label for="alwaysShow">Always open sidebar when Balu has recommendations available</label>';
        settingsHTML += '  </div>';
        settingsHTML += '</div>';

        settingsHTML += '<div class="row">';
        settingsHTML += '  <div class="large-8 columns end">';
        settingsHTML += '    <input type="radio" name="defaultShowOption" id="alwaysHide" value="alwaysHide"><label for="alwaysHide">Keep sidebar hidden, display recommendation count on Balu icon instead</label>';
        settingsHTML += '  </div>';
        settingsHTML += '</div>';

        // Balu on/off

        settingsHTML += '<div class="row">';
        settingsHTML += '  <div class="large-4 columns end">';
        settingsHTML += '    <h4>Turn Balu on or off</h4>';
        settingsHTML += '  </div>';
        settingsHTML += '</div>';

        settingsHTML += '<div class="row">';
        settingsHTML += '  <div class="large-8 columns end">';
        settingsHTML += '    <input type="radio" name="turnBaluOnAndOff" id="baluOn" value="on"><label for="baluOn">Balu is active and will alert you when it has recommendations available</label>';
        settingsHTML += '  </div>';
        settingsHTML += '</div>';

        settingsHTML += '<div class="row">';
        settingsHTML += '  <div class="large-8 columns end">';
        settingsHTML += '    <input type="radio" name="turnBaluOnAndOff" id="baluOff" value="off"><label for="baluOff">Balu is off - no recommendations will be shown for any websites</label>';
        settingsHTML += '  </div>';
        settingsHTML += '</div>';

    } else {

        // Log in form

        userFormHTML += '<div class="row">';
        userFormHTML += '  <div class="large-4 columns end">';
        userFormHTML += '    <h4>Sign In to Balu</h4>';
        userFormHTML += '  </div>';
        userFormHTML += '</div>';
        userFormHTML += '<form id="logInuserFormHTML">';
        userFormHTML += '  <div class="row">';
        userFormHTML += '    <div class="large-4 columns">';
        userFormHTML += '      <label>Email';
        userFormHTML += '        <input type="text" id="fieldLogInEmail" placeholder="Email" required="yes">';
        userFormHTML += '      </label>';
        userFormHTML += '    </div>';
        userFormHTML += '    <div class="large-4 columns end">';
        userFormHTML += '      <label>Password';
        userFormHTML += '        <input type="password" id="fieldLogInPassword" placeholder="Password" required="yes">';
        userFormHTML += '      </label>';
        userFormHTML += '    </div>';
        userFormHTML += '  </div>';
        userFormHTML += '  <div class="row">';
        userFormHTML += '    <div class="large-4 columns end">';
        userFormHTML += '      <input id="logInUserButton" class="button radius" type="button" value="Log In">';
        userFormHTML += '    </div>';
        userFormHTML += '  </div>';
        userFormHTML += '</form>';

        // Sign up form

        userFormHTML += '<br />';
        userFormHTML += '<div class="row">';
        userFormHTML += '  <div class="large-4 columns end">';
        userFormHTML += '    <h4>Create a New Account</h4>';
        userFormHTML += '  </div>';
        userFormHTML += '</div>';
        userFormHTML += '<form id="signUserUpForm">';
        userFormHTML += '  <div class="row">';
        userFormHTML += '    <div class="large-4 columns">';
        userFormHTML += '      <label>Email';
        userFormHTML += '        <input type="text" id="fieldSignUpEmail" placeholder="Email" required="yes">';
        userFormHTML += '      </label>';
        userFormHTML += '    </div>';
        userFormHTML += '    <div class="large-4 columns end">';
        userFormHTML += '      <label>Password';
        userFormHTML += '        <input type="password" id="fieldSignUpPassword" placeholder="Password" required="yes">';
        userFormHTML += '      </label>';
        userFormHTML += '    </div>';
        userFormHTML += '  </div>';
        userFormHTML += '  <div class="row">';
        userFormHTML += '    <div class="large-4 columns end">';
        userFormHTML += '      <input id="signUserUpButton" class="button radius" type="button" value="Sign Up">';
        userFormHTML += '    </div>';
        userFormHTML += '  </div>';
        userFormHTML += '</form>';

    }

    var topHalfDiv = document.createElement('DIV');
    topHalfDiv.innerHTML = userFormHTML + settingsHTML;
    contentDiv.appendChild(topHalfDiv);

    // Now that it's all added to the DOM we can do the last few tasks:


    if(userLoggedIn) {

        // Create listeners

        document.getElementById("logOutButton").addEventListener('click', logOutButton_listener);

        document.getElementById("alwaysShow").addEventListener('click', baluShowOrHide_listener);
        document.getElementById("alwaysHide").addEventListener('click', baluShowOrHide_listener);

        document.getElementById("baluOn").addEventListener('click', baluOnOrOff_listener);
        document.getElementById("baluOff").addEventListener('click', baluOnOrOff_listener);

        // Set radio buttons

        chrome.storage.sync.get('isBaluOnOrOff',function (obj) {
            if(obj.isBaluOnOrOff === 'ON') {
                document.getElementById("baluOn").checked = true;
            } else if (obj.isBaluOnOrOff === 'OFF'){
                document.getElementById("baluOff").checked = true;
            }

            chrome.storage.sync.get('isBaluShowOrHide',function(obj){
                if(obj.isBaluShowOrHide === 'SHOW') {
                    document.getElementById("alwaysShow").checked = true;
                } else if (obj.isBaluShowOrHide === 'HIDE'){
                    document.getElementById("alwaysHide").checked = true;
                }
            });
        });

    } else {
        // Create listeners
        document.getElementById("logInUserButton").addEventListener('click', logInButton_listener);
        document.getElementById("fieldLogInPassword").addEventListener('keydown', logInPasswordField_keydown_listener);
        document.getElementById("signUserUpButton").addEventListener('click', signUpButton_listener);
        document.getElementById("fieldSignUpPassword").addEventListener('keydown', signUpPasswordField_keydown_listener);
    }

    // Website list

    if(userLoggedIn) {

        var websiteListHTML = '';

        websiteListHTML += '<div class="row">';
        websiteListHTML += '  <div class="large-4 columns end">';
        websiteListHTML += '    <h4>Websites</h4>';
        websiteListHTML += '  </div>';
        websiteListHTML += '</div>';


        websiteListHTML += '<div class="row">';
        websiteListHTML += '  <div class="large-8 columns end">';

        Parse.initialize('mmhyD9DKGeOanjpRLHCR3bX8snue22oOd3NGfWKu', 'IRfKgjMWYJqaHhgK3AUFNu2KsXrNnorzRZX1hmuY');

        var CategoryWebsiteJoin = Parse.Object.extend("CategoryWebsiteJoin");
        var categoryWebsiteQuery = new Parse.Query(CategoryWebsiteJoin);

        categoryWebsiteQuery.include('searchCategory');
        categoryWebsiteQuery.include('website');

        categoryWebsiteQuery.ascending('categoryName_sort,websiteURL_sort');

        categoryWebsiteQuery.notEqualTo('website',{__type: "Pointer",className: "Website", objectId: 'Z5y6RkdrX1'}); // To do, can I not use dot notation here to filter on the website name?

        categoryWebsiteQuery.find({
            success: function(categoryWebsites){

                websiteListHTML += '<ul>';

                var previousSearchCategory = "-1";
                var currentSearchCategory = "-1";
                var nextSearchCategory = "-1";

                for (var i = 0; i < categoryWebsites.length; i++) {
                    currentSearchCategory = categoryWebsites[i].get('searchCategory').get('categoryName');
                    if(i < categoryWebsites.length-1){
                        nextSearchCategory = categoryWebsites[i+1].get('searchCategory').get('categoryName') ;
                    }
                    if(currentSearchCategory != previousSearchCategory) {
                        websiteListHTML += '   <li><label>' + currentSearchCategory + '</label>';
                        websiteListHTML += '   <ul>';
                    }
                    if(categoryWebsites[i].get('website').get('isWebsiteOnOrOff') === 'ON') {
                        websiteListHTML += '      <li><label><a href="http://' + categoryWebsites[i].get('website').get('websiteURL') + '">' + categoryWebsites[i].get('website').get('websiteURL') + '</a></label></li>';
                    }
                    if(currentSearchCategory != nextSearchCategory) {
                        websiteListHTML += '    </ul>';
                    }
                    previousSearchCategory = currentSearchCategory;
                }
                websiteListHTML += '</ul></ul>';

                websiteListHTML += '  </div>';
                websiteListHTML += '</div>';

                // Add to DOM

                var websiteListDiv = document.createElement('DIV');
                websiteListDiv.innerHTML = websiteListHTML;
                contentDiv.appendChild(websiteListDiv);

            },
            error: chrome.extension.getBackgroundPage().parseErrorFind
        });
    }
}


/**********************
 * Listener Functions *
 **********************/


function logOutButton_listener(){
    log(gvScriptName_OPMain + '.logOutButton_listener: Start','PROCS');
    chrome.extension.getBackgroundPage().logUserOut(function(){
        location.reload();
    });
}

function logInPasswordField_keydown_listener(event) {if (event.keyCode == 13) {logInButton_listener();}}
function logInButton_listener(){

    log(gvScriptName_OPMain + '.logInButton_listener: Start','PROCS');

    var email = document.getElementById('fieldLogInEmail').value;
    var password = document.getElementById('fieldLogInPassword').value;

    chrome.extension.getBackgroundPage().logUserIn(null,email,password,function(){
        location.reload();
    });

}

function signUpPasswordField_keydown_listener(event) {if (event.keyCode == 13) {signUpButton_listener();}}
function signUpButton_listener(){

    log(gvScriptName_OPMain + '.signUpButton_listener: Start','PROCS');

    var email = document.getElementById('fieldSignUpEmail').value;
    var password = document.getElementById('fieldSignUpPassword').value;

    chrome.extension.getBackgroundPage().signUserUp(null,email,password,function(){
        location.reload();
    });
}

function baluShowOrHide_listener(){

    log(gvScriptName_OPMain + '.baluShowOrHide_listener: Start','PROCS');

    if (document.getElementById("alwaysShow").checked) {
        chrome.extension.getBackgroundPage().gvIsBaluShowOrHide = 'SHOW';
        chrome.storage.sync.set({'isBaluShowOrHide':'SHOW'}, function(){chrome.extension.getBackgroundPage().refreshTab_allTabs();});
        userLog('OPTIONS: BALU_SET_TO_SHOW');
    }
    if (document.getElementById("alwaysHide").checked) {
        chrome.extension.getBackgroundPage().gvIsBaluShowOrHide = 'HIDE';
        chrome.storage.sync.set({'isBaluShowOrHide':'HIDE'}, function(){chrome.extension.getBackgroundPage().refreshTab_allTabs();});
        userLog('OPTIONS: BALU_SET_TO_HIDE');
    }
}

function baluOnOrOff_listener(){

    log(gvScriptName_OPMain + '.baluOnOrOff_listener: Start','PROCS');

    if (document.getElementById("baluOn").checked) {
        chrome.extension.getBackgroundPage().gvIsBaluOnOrOff = 'ON';
        chrome.storage.sync.set({'isBaluOnOrOff': 'ON'}, function(){
            chrome.browserAction.setIcon({path: chrome.extension.getURL('images/icon-browser_action.png')});
            log(gvScriptName_OPMain + '.baluOnOrOffListener: baluOn checked, storage.sync.isBaluOnOrOff set to ON','DEBUG');
        });
        userLog('OPTIONS: BALU_TURNED_ON');
    }
    if (document.getElementById("baluOff").checked) {
        chrome.extension.getBackgroundPage().gvIsBaluOnOrOff = 'OFF';
        chrome.storage.sync.set({'isBaluOnOrOff': 'OFF'}, function(){
            chrome.browserAction.setIcon({path: chrome.extension.getURL('images/icon-browser_action-off.png')});
            log(gvScriptName_OPMain + '.baluOnOrOffListener: baluOff checked, storage.sync.isBaluOnOrOff set to OFF','DEBUG');
        });
        userLog('OPTIONS: BALU_TURNED_OFF');
    }
}


/**************************
 * Error and Log handling *
 **************************/

function log(message, level) {
    chrome.extension.getBackgroundPage().log(message, level);
}

function userLog(eventName, data) {
    var noTabId;
    chrome.extension.getBackgroundPage().userLog(noTabId, eventName, data);
}
