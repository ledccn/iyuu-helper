console.log('import options-page/options-page.js');

layui.use(['form', 'laydate', 'util', 'table'], function () {
    const form = layui.form;
    const layer = layui.layer;

    // 指定开关事件
    form.on('switch(switchTest)', function (data) {
        layer.msg('开关 checked：' + (this.checked ? 'true' : 'false'), {
            offset: '6px'
        });
        layer.tips('温馨提示：请注意开关状态的文字可以随意定义，而不仅仅是 ON|OFF', data.othis)
    });

    // 提交事件
    form.on('submit(demo1)', function (data) {
        const field = data.field; // 获取表单字段值
        // 显示填写结果，仅作演示用
        layer.alert(JSON.stringify(field), {
            title: '当前填写的字段值'
        });
        // 此处可执行 Ajax 等操作
        // …
        return false; // 阻止默认 form 跳转
    });
});