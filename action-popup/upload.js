layui.use(['jquery', 'layer', 'util'], function () {
    let $ = layui.jquery;
    let layer = layui.layer;

    const uploadButton = document.getElementById('upload_sites_json');
    const fileInput = document.getElementById('upload_sites_json_file');

    // 监听按钮点击事件
    uploadButton.addEventListener('click', () => {
        console.log('上传按钮被点击')
        fileInput.click();
    });

    // 监听文件输入元素的 change 事件
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
                    } catch (error) {
                        console.error('文件解析错误:', error);
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