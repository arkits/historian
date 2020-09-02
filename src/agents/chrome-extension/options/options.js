// Saves options to chrome.storage
function saveOptions() {
    var historianBackendUrl = document.getElementById('historianBackendUrl').value;
    var historianUsername = document.getElementById('historianUsername').value;
    var historianPassword = document.getElementById('historianPassword').value;

    chrome.storage.sync.set(
        {
            historianBackendUrl: historianBackendUrl,
            historianUsername: historianUsername,
            historianPassword: historianPassword
        },
        function () {
            // Update status to let user know options were saved.
            var status = document.getElementById('status');
            status.textContent = 'Options saved.';
            setTimeout(function () {
                status.textContent = '';
            }, 750);
        }
    );
}

// Restores select box and checkbox state using the preferences stored in chrome.storage.
function restoreOptions() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get(
        {
            historianBackendUrl: '',
            historianUsername: '',
            historianPassword: ''
        },
        function (items) {
            document.getElementById('historianBackendUrl').value = items.historianBackendUrl;
            document.getElementById('historianUsername').value = items.historianUsername;
            document.getElementById('historianPassword').value = items.historianPassword;
        }
    );
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
