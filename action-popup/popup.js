import Api from '/assets/module/api.js';
import Helper from "/assets/module/helper.js";
import Command from '/assets/module/command.js';
import Response from '/assets/module/response.js';
import Config from '/assets/module/sites/config.js';
import Storage from '/assets/module/storage.js';

layui.use(['jquery', 'layer', 'util', 'element'], function () {
    let $ = layui.jquery;
    let layer = layui.layer;
    let util = layui.util;
    let element = layui.element;

    //layer.msg('popup.js');
    console.log('popup.js', $(window).width(), $(window).height());
    util.on({
        openPopup: function () {
            window.open(Helper.getChromeUrl('/action-popup/index.html'));
        },
        updatePopup: function () {
            layer.msg('切换Popup');
            chrome.action.setPopup({popup: '/action-popup/index.html'});
        },
        openOptionsPage: function () {
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('/options-page/index.html'));
            }
        },
        reload: function () {
            chrome.runtime.reload();
        },
        clear: function () {
            Storage.local().get(null).then((items) => {
                if (items) {
                    delete items[Api.IYUU_HELPER_CONFIG];
                    const keys = Object.keys(items);
                    console.log('清除的键名', keys);
                    Storage.local().remove(keys).then(() => {
                        console.log('清除成功');
                    });
                }
            });
        },
        createTab: function () {
            Helper.createTab('https://iyuu.cn').then((tab) => {
                console.log('createTab', tab);
            });
        },
        refreshAll: function () {
            chrome.runtime.sendMessage({action: Command.batchRefreshSite}).then((response) => {
                console.log('批量刷新站点，响应', response);
            });
        },
        openSite: function (othis, e) {
            // othis 当前触发事件的元素的 jQuery 对象
            // this 当前触发事件的 DOM 元素
            let site = this.getAttribute('data-site') || othis.data('site');
            Config.make(site).then((config) => {
                window.open(config.getProtocolHost());
            });
        },
        createSiteTab: function (othis, e) {
            // othis 当前触发事件的元素的 jQuery 对象
            // this 当前触发事件的 DOM 元素
            let site = this.getAttribute('data-site') || othis.data('site');
            chrome.runtime.sendMessage({action: Command.createSiteTab, site: site}).then((response) => {
                console.log('创建站点新标签，响应', response);
            });
        },
        getRequest: function () {
            Api.getRequest().then((res) => {
                console.log('同步站点', res);
                const response = new Response(res);
                if (response.isSuccessful()) {
                    Config.allSites(response.data).then(() => {
                        console.log('同步站点成功');
                        location.reload();
                    });
                } else {
                    console.log('同步站点失败', res);
                    layer.alert(response.msg || '同步站点失败', {
                        icon: 0,
                        shadeClose: true,
                        title: '请求错误'
                    });
                }
            }).catch((error) => {
                layer.alert(error.message || '同步站点失败', {
                    icon: 0,
                    shadeClose: true,
                    title: '请求异常'
                }, function (index) {
                    layer.close(index);
                    element.tabChange('action_popup', 'settings');
                });
            });
        },
        backupConfig: function () {
            Api.getConfig().then((config) => {
                download_json_file(config, 'iyuu_helper_config.json');
            });
        },
        recoveryConfig: function () {
            return false;
        },
    });
});