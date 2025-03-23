import Api from '/assets/module/api.js';
import Utils from '/assets/module/utils.js';

Utils.delayResolve(chrome.runtime.getPlatformInfo(), 10000).then((platform) => {
    console.log('platform', platform);
});

layui.use(['layer', 'element', 'form', 'util'], function () {
    let layer = layui.layer;
    let element = layui.element;
    let form = layui.form;
    let util = layui.util;
    togglePassword();

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

    /**
     * 下载 JSON 文件
     * @type {HTMLElement}
     */
    const fileInput = document.getElementById('recoveryConfig');
    util.on({
        backupConfig: function () {
            Api.getConfig().then((config) => {
                download_json_file(config, 'iyuu_helper_config.json');
            });
        },
        recoveryConfig: function () {
            fileInput.click();
            return false;
        },
    });

    /**
     * 恢复配置
     * 监听文件输入元素的 change 事件
     */
    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                // 创建 FileReader 对象
                const reader = new FileReader();

                // 监听 FileReader 的 load 事件
                reader.addEventListener('load', (e) => {
                    try {
                        // 将读取的内容解析为 JSON
                        const jsonData = JSON.parse(e.target.result);
                        console.log('JSON 数据:', jsonData);
                        if (jsonData['iyuu_helper_server'] && jsonData['x-iyuu-helper']) {
                            Api.setConfig(jsonData).then(() => {
                                layer.msg('恢复成功', {icon: 1});
                            });
                        } else {
                            layer.alert('恢复失败，请检查文件格式', {
                                title: '恢复失败',
                                icon: 2
                            });
                        }
                    } catch (error) {
                        console.error('文件解析错误:', error);
                        layer.alert('文件解析错误:', error, {
                            title: '恢复失败',
                            icon: 2
                        });
                    } finally {
                        fileInput.value = ''; // 清空文件输入
                    }
                });

                // 监听 FileReader 的 error 事件
                reader.addEventListener('error', () => {
                    console.error('文件读取错误');
                    fileInput.value = ''; // 清空文件输入
                });

                // 读取文件内容为文本
                reader.readAsText(file);
            } else {
                console.log('请选择一个有效的 JSON 文件');
                fileInput.value = ''; // 清空文件输入
            }
        } else {
            console.log('没有选择文件');
        }
    });
});