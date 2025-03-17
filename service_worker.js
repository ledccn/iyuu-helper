import Config from '/assets/module/sites/config.js';
import Command from '/assets/module/command.js';
import Helper from "/assets/module/helper.js";
import Response from '/assets/module/response.js';
import Sessions from "/assets/module/sessions.js";
import context from '/service_worker/background.js';
import '/service_worker/alarms.js';

console.log('import service_worker.js');

/**
 * service_worker 统一监听消息
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log('[统一监听消息]', sender.tab ? '来自标签页：' + sender.tab.url : '来自扩展extension', request);
        //console.log(sender);

        // 判断是否是标签页
        const isFromTab = sender.hasOwnProperty('tab');
        const tabId = isFromTab ? sender.tab.id : null;

        switch (request.action) {
            // 创建标签页
            case Command.createSiteTab:
                if (context.hasBySite(request.site)) {
                    sendResponse(Response.fail('已存在'));
                } else {
                    createSiteTab(request.site, context).then((tab) => {
                        sendResponse(Response.data({tab_id: tab.id}));
                    })
                }
                break;
            // 初始化标签页
            case Command.initSiteTab:
                if (tabId && context.has(tabId)) {
                    // 必须从上下文获取site
                    let site = context.getTabToSite().get(tabId);
                    sendResponse(Response.data({site: site}));
                } else {
                    sendResponse(Response.fail(request.action + '未找到任务上下文'));
                }
                break;
            // 关闭标签页，删除Session
            case Command.removeSiteTab:
                Helper.removeTab(tabId).then(() => {
                    console.log('关闭标签')
                });
                break;
            // 完成抓取：汇报结果、关闭标签页
            case Command.doneSiteTab:
                Helper.removeTab(tabId).then(() => {
                    console.log('关闭标签')
                });
                break;
            case Command.batchRefreshSite:
                Config.allSites().then((list) => {
                    for (let item of list) {
                        if (!context.hasBySite(item.site)) {
                            context.pushQueue(item.site);
                        }
                    }
                    sendResponse(Response.data({length: context.lengthQueue()}));
                });
                break;
            default:
                sendResponse(Response.fail('unknown'));
                break;
        }

        return true
    }
);

/**
 * 定时调度
 */
setInterval(() => {
    if (0 < context.lengthQueue() && context.getTabToSite().size < 5) {
        const site = context.popQueue();
        if (!context.hasBySite(site)) {
            createSiteTab(site, context).then((tab) => {
                console.log('定时调度', site);
            });
        }
    }
}, 1000);

/**
 * 创建标签页
 * @param {string} site 站点名称
 * @param {Context} context 任务上下文对象
 * @returns {Promise<chrome.tabs.Tab>}
 */
async function createSiteTab(site, context) {
    await Sessions.make(site).remove().then(() => {
        console.log('初始化 Session', site);
    });

    const config = await Config.make(site);
    const tab = await Helper.createTab(config.getFirstPageUrl());
    context.create(tab.id, site);
    setTimeout((tabId) => {
        if (context.has(tabId)) {
            Helper.removeTab(tabId).then(() => {
                console.log('超时关闭标签')
            });
        }
    }, 120000, tab.id);
    console.log('上下文对象', context);
    return tab;
}
