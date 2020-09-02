const API_ADD_HISTORY_PATH = '/api/history/add';

chrome.storage.sync.get(
    {
        historianBackendUrl: null,
        historianUsername: null,
        historianPassword: null
    },
    function (savedPrefs) {
        if (!savedPrefs.historianBackendUrl || !savedPrefs.historianUsername || !savedPrefs.historianPassword) {
            console.error('[historian] options are not set! fast-failing...');
            return;
        } else {
            // console.log('[historian] savedPrefs - ', savedPrefs);
        }

        submitToHistorian(savedPrefs, generateRequestBody());
    }
);

function generateRequestBody() {
    let pageUrl = window.location.href;
    // console.log('[historian] pageUrl - ', pageUrl);

    let title = document.title;
    // console.log('[historian] title - ', title);

    return [
        {
            metadata: {
                title: title,
                content_url: pageUrl
            },
            type: 'web_history'
        }
    ];
}

function submitToHistorian(savedPrefs, requestBody) {
    let requestHeaders = new Headers();
    requestHeaders.append(
        'Authorization',
        createBasicAuthHeader(savedPrefs.historianUsername, savedPrefs.historianPassword)
    );
    requestHeaders.append('Content-Type', 'application/json');

    let requestOptions = {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody),
        redirect: 'follow'
    };

    fetch(savedPrefs.historianBackendUrl + API_ADD_HISTORY_PATH, requestOptions)
        .then((response) => response.text())
        .then((result) => console.log('[historian] submitted to historian! - ', result))
        .catch((error) => console.error('[historian] caught error when posting web_history - ', error));
}

/**
 * Decodes the HTTP Authorization header
 * @param {*} username
 * @param {*} password
 */
function createBasicAuthHeader(username, password) {
    var encodedCreds = btoa(username + ':' + password);
    var basicAuthHeader = 'Basic ' + encodedCreds;
    return basicAuthHeader;
}
