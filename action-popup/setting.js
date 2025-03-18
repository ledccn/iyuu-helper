import Api from '/assets/module/api.js';
import Utils from '/assets/module/utils.js';

Utils.delayResolve(chrome.runtime.getPlatformInfo(), 10000).then((platform) => {
    console.log('platform', platform);
});

layui.use(['jquery', 'layer', 'element', 'form'], function () {
    let $ = layui.jquery;
    let layer = layui.layer;
    let element = layui.element;
    let form = layui.form;

    // 给表单初始化数据
    Api.getConfig().then((config) => {
        form.val('setting_filter', config || {});
        if (config && config.iyuu_helper_server) {
            console.log('iyuu_helper_server', new URL(config.iyuu_helper_server));
        } else {
            element.tabChange('action_popup', 'settings');
        }
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