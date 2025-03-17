# IYUU浏览器助手

IYUU浏览器助手，简称IYUU助手；是安装在谷歌浏览器上的一个插件，用于抓取站点Cookie和配置信息，简化您的操作。

## 使用

1. 克隆本仓库.
2. 浏览器开发者模式加载 文件夹

## 支持浏览器

- Chromium内核的所有浏览器
- Chrome
- Edge
- Firefox

## 二次开发

### 开发环境
1. Clone this repository.
2. 安装依赖 `npm install`
3. 浏览器开发者模式加载 文件夹

### 内置模块类

```cli
|   api.js       API 与服务器通信
|   command.js   插件内部通信命令枚举
|   context.js   TAB 上下文管理
|   cookies.js   站点 Cookie 管理
|   helper.js    浏览器扩展 API 封装
|   request.js   请求封装
|   response.js  响应封装
|   sessions.js  TAB Session 管理
|   storage.js   浏览器扩展存储管理
|   store.js     数据仓封装
|   utils.js     工具封装
|
\---sites
        config.js   站点配置对象
        driver.js   自定义站点驱动
        factory.js  站点驱动工厂
        sites.js    站点驱动基类
```

### 自定义站点

1. 定义首个页面 `assets/module/sites/config.js` 的 `firstPageUrl` 方法
2. 定义抓取字段 `assets/module/sites/config.js` 的 `requiredOptionsKeys` 方法
3. 站点驱动基类 `assets/module/sites/sites.js`，您自定义的站点类需继承驱动基类
4. 自定义站点类 `assets/module/sites/driver.js`，您可以在这里定义需要抓取的字段，生成方法名 `Site.stringToMethodName(fields)`
