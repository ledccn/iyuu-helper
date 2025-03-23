import Context from '/assets/module/context.js';
import Sessions from '/assets/module/sessions.js';

console.log('import service_worker/background.js');

/**
 * 任务上下文
 * @type {Context}
 */
const context = new Context();

/**
 * 监听初始化
 */
chrome.runtime.onInstalled.addListener((details) => {
    console.log(details);
    let badge = '';
    const {previousVersion, reason} = details;
    switch (reason) {
        // 安装
        case chrome.runtime.OnInstalledReason.INSTALL:
            badge = 'I';
            chrome.storage.local.set({
                apiSuggestions: ['tabs', 'storage', 'scripting']
            }).then(() => {
            });
            break;
        // 更新
        case chrome.runtime.OnInstalledReason.UPDATE:
            badge = 'U';
            break;
        default:
            badge = 'O';
            break;
    }
    chrome.action.setBadgeText({text: badge,}).then(() => {
    });
});

/**
 * 监听存储库更改
 */
chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, {oldValue, newValue}] of Object.entries(changes)) {
        console.log(
            '监听存储库更改',
            `Storage key "${key}" in namespace "${namespace}" changed.`,
            ' | 旧值：', oldValue,
            ' | 新值：', newValue
        );
    }
});

/**
 * 在用户点击操作图标时触发
 * - 如果操作包含弹出式窗口，此事件将不会触发。
 */
chrome.action.onClicked.addListener((tab) => {
    // 在点击时注入内容脚本
    // chrome.scripting.executeScript({
    //     target: {tabId: tab.id},
    //     files: ['content.js']
    // });
});

/**
 * 在创建标签页时触发
 * - 请注意，在触发此事件时，标签页的网址和标签页分组成员资格可能尚未设置，
 * - 但您可以监听 onUpdated 事件，以便在设置网址或将标签页添加到标签页分组时收到通知。
 */
chrome.tabs.onCreated.addListener(function (tab) {
    console.log('标签创建', tab, context);
});

/**
 * 当窗口中的活动标签页发生变化时触发
 * - 请注意，此事件触发时，标签页的网址可能尚未设置，但您可以监听 onUpdated 事件，以便在设置网址时收到通知。
 */
chrome.tabs.onActivated.addListener(function (activeInfo) {
    console.log('标签变化', activeInfo);
});

/**
 * 在标签页关闭时触发
 */
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    console.log('标签关闭', tabId, removeInfo);
    if (context.has(tabId)) {
        let site = context.getTabToSite().get(tabId);
        Sessions.make(site).remove().then(() => {
            context.remove(tabId);
        });
    }
});

/**
 * 在标签页发送请求时触发
 */
chrome.webRequest.onBeforeSendHeaders.addListener(
    function (details) {
        const headers = details.requestHeaders;
        if (context.has(details.tabId)) {
            console.log('Request Headers:', JSON.parse(JSON.stringify(headers)));
        } else {
            console.log('标签ID不相同-------------');
        }
    },
    {urls: ["<all_urls>"]}, // 监听所有 URL 的请求
    ["requestHeaders"]
);

/**
 * 在标签页发送请求时触发
 * - 在所有扩展程序都有机会修改请求标头后触发，并显示最终版本 (*) 版本。
 * - 该事件在标头发送到广告网络之前触发。此活动是 信息丰富，并异步处理。不允许修改或取消请求。
 */
chrome.webRequest.onSendHeaders.addListener(
    function (details) {
        const tabId = details.tabId;
        let cookie = '';
        let headers = details.requestHeaders;
        if (context.has(tabId)) {
            //console.log('Request Headers:', JSON.parse(JSON.stringify(headers)));
            if ('main_frame' === details.type) {
                let site = context.getTabToSite().get(tabId);
                console.log('标签ID相同');
                if (headers) {
                    context.createHeader(site, headers);
                }
                details.requestHeaders.forEach((item) => {
                    if ('Cookie' === item.name) {
                        cookie = item.value;
                        context.createCookie(site, cookie);
                    }
                })
                //console.log(details.type, details.tabId, cookie)
            }
        } else {
            console.log('标签ID不相同-------------');
        }
    },
    {urls: ['<all_urls>'], types: ['main_frame']},
    ["extraHeaders", "requestHeaders"]
);

export {context}
export default context;