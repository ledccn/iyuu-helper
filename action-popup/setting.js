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
        if (config && config.iyuu_helper_server) {
            console.log('iyuu_helper_server', new URL(config.iyuu_helper_server));
        } else {
            element.tabChange('action_popup', 'settings');
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