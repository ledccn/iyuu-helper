console.log('import content_scripts.js', location);
// JavaScript 或 CSS 将尽快注入到标签页中。枚举值：document_start、document_end、document_idle

window.onload = function () {
    console.log('content_scripts.js', 'window.onload');

    try {
        //console.log(get_fields_passkey('密钥'));
        //console.log(get_fields_passkey('密匙'));
    } catch (error) {
        console.error('content_scripts.js Error:', error);
    }

    /**
     * 延迟执行
     */
    setTimeout(async () => {
        try {
            const {Command} = await import('./assets/module/command.js');
            const {Response} = await import('./assets/module/response.js');
            const {Config} = await import('./assets/module/sites/config.js');
            const {Sites} = await import('./assets/module/sites/sites.js');
            const {Factory: SiteFactory} = await import('./assets/module/sites/factory.js');

            const resp = await chrome.runtime.sendMessage({action: Command.initSiteTab});
            console.log('content_scripts.js', resp);
            const response = new Response(resp);
            if (response.isSuccessful()) {
                const config = await Config.make(response.data.site);
                if (config) {
                    console.log('您可以自定义站点驱动类', SiteFactory.stringToClassName(config.site));
                    let driver = SiteFactory.create(config);
                    console.log(driver.constructor.name, '首个页面网址', driver.getConfig().getFirstPageUrl());
                    const methods = Config.requiredOptionsKeys(config.site).map(option => Sites.stringToMethodName(option));
                    console.log(driver.constructor.name, 'async责任链方法名', methods);
                    try {
                        if (await driver.isCookieValid()) {
                            await driver.setCookieStatus(true);
                            await driver.execute();
                        } else {
                            await driver.setCookieStatus(false);
                        }
                    } catch (e) {
                        await driver.setCookieStatus(false);
                        console.error('content_scripts.js Error:', e)
                    }
                }
            }
        } catch (error) {
            console.error('content_scripts.js Error:', error);
        }
    }, 1000);
}

/**
 * content_scripts.js 监听消息
 */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log('content_scripts.js 监听消息', sender.tab ? '来自标签页：' + sender.tab.url : '来自扩展extension', request);

        // 判断是否是标签页
        const isFromTab = sender.hasOwnProperty('tab');
        const tabId = isFromTab ? sender.tab.id : null;
    }
);