import Config from '/assets/module/sites/config.js';
import Status from '/assets/module/status.js';

layui.use(['layer', 'jquery', 'util', 'element', 'form'], function () {
    /**
     * 初始化站点表格
     */
    Config.allSites().then(async (sites) => {
        let status;
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
});