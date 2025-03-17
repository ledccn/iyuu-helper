import Api from '/assets/module/api.js';
import Helper from "/assets/module/helper.js";
import Command from '/assets/module/command.js';
import Response from '/assets/module/response.js';
import Config from '/assets/module/sites/config.js';
import Utils from '/assets/module/utils.js';
import Status from '/assets/module/status.js';
import Storage from '/assets/module/storage.js';

console.log('import action-popup/popup.js');

Utils.delayResolve(chrome.runtime.getPlatformInfo(), 10000).then((platform) => {
    console.log('platform', platform);
});

const action_popup = 'action_popup';
layui.use(['layer', 'jquery', 'util', 'element', 'form'], function () {
    let layer = layui.layer;
    let $ = layui.jquery;
    let util = layui.util;
    let element = layui.element;
    let form = layui.form;

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
                    element.tabChange(action_popup, 'settings');
                });
            });
        },
        backupConfig: function () {
            Api.getConfig().then((config) => {
                download_json_file(config, 'iyuu_helper_config.json');
            });
        },
    });

    // 初始化站点表单
    Config.allSites().then(async (sites) => {
        let status = null;
        try {
            status = (await Status.make().get()) || {};
        } catch (e) {
            status = {};
        }

        const rows = [];
        for (let [index, site] of sites.entries()) {
            let state = status[site.site] || false;
            rows.push(`<tr>
                        <td>${index + 1}</td>
                        <td>${site.site}</td>
                        <td>${site.nickname}</td>
                        <td>
                            <i class="layui-icon ${site.cookie ? 'layui-icon-ok layui-font-green' : 'layui-icon-clear layui-font-red'}"></i>
                        </td>
                        <td>
                            <i class="layui-icon layui-icon-username ${state ? 'layui-font-green' : 'layui-font-red'}"></i>
                        </td>
                        <td>
                            <button type="button" class="layui-btn layui-btn-xs layui-bg-purple" lay-on="createSiteTab"
                        data-site="${site.site}"><i class="layui-icon layui-icon-refresh"></i>刷新
                            </button>
                            <button type="button" class="layui-btn layui-btn-xs layui-btn-primary layui-border-purple" lay-on="openSite"
                        data-site="${site.site}"><i class="layui-icon layui-icon-website"></i>访问
                            </button>
                        </td>
                    </tr>`);
        }

        document.getElementById('sites_tbody').innerHTML = rows.join('');
    });

    // 给表单初始化数据
    Api.getConfig().then((config) => {
        if (config && config.iyuu_helper_server) {
            console.log('iyuu_helper_server', new URL(config.iyuu_helper_server));
        } else {
            element.tabChange(action_popup, 'settings');
        }

        layui.each(config, function (key, value) {
            if ('options' === key && value) {
                layui.each(value, function (kk, vv) {
                    try {
                        // 数组（复选框）
                        if (Array.isArray(vv)) {
                            //init_element_attr_value('*[name="options[' + kk + '][]"]', vv)
                            return;
                        }

                        // 对象(输入框、选择框、单选框、复选框等)
                        if ('Object' === Object.prototype.toString.call(vv).slice(8, -1)) {
                            layui.each(vv, function (kkk, vvv) {
                                init_element_attr_value($, '*[name="options[' + kk + '][' + kkk + ']"]', vvv)
                            });
                            return;
                        }
                    } catch (e) {
                        console.error(e)
                        return;
                    }

                    // 基础类型(输入框、选择框、单选框)
                    init_element_attr_value($, '*[name="options[' + kk + ']"]', vv)
                });
            } else {
                init_element_attr_value($, '*[name="' + key + '"]', value)
            }
        });
    });

    // 提交事件
    form.on('submit(save_config)', function (data) {
        const field = data.field; // 获取表单字段值
        Api.setConfig(field).then(() => {
            layer.alert('已存入 chrome.storage.local', {
                title: '保存成功'
            });
        });

        // 阻止默认 form 跳转
        return false;
    });
});