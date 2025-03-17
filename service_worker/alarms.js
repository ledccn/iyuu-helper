console.log('import service_worker/alarms.js');
const LAST_HEARTBEAT = 'LAST_HEARTBEAT';

let heartbeatInterval;

/**
 * Runs the heartbeat, which stores the current time in extension storage.
 * @returns {Promise<void>}
 */
async function runHeartbeat() {
    await chrome.storage.local.set({LAST_HEARTBEAT: new Date().getTime()});
}

/**
 * Starts the heartbeat interval which keeps the service worker alive. Call
 * this sparingly when you are doing work which requires persistence, and call
 * stopHeartbeat once that work is complete.
 */
async function startHeartbeat() {
    // Run the heartbeat once at service worker startup.
    runHeartbeat().then(() => {
        // Then again every 20 seconds.
        heartbeatInterval = setInterval(runHeartbeat, 20000);
    });
}

/**
 * Stops the heartbeat interval.
 * @returns {Promise<void>}
 */
async function stopHeartbeat() {
    clearInterval(heartbeatInterval);
}

/**
 * Returns the last heartbeat stored in extension storage, or undefined if
 * the heartbeat has never run before.
 */
async function getLastHeartbeat() {
    return (await chrome.storage.local.get(LAST_HEARTBEAT))[LAST_HEARTBEAT];
}

startHeartbeat();