import Sites from "./sites.js";
import * as Driver from "./driver.js";

console.log('import assets/module/sites/factory.js')
/**
 * 工厂类
 * - 根据站点名称创建站点实例
 */
class Factory {
    /**
     * 工厂方法
     * - 根据站点名称创建站点实例
     * @param {Config|Object} config
     * @returns {Sites}
     */
    static create(config) {
        const site = config.site || '';
        if (!site) {
            throw new Error('站点名称无效');
        }

        const classname = Factory.stringToClassName(config.site);
        return new (Driver[classname] || Sites)(config);
    }

    /**
     * 字符串转换为站点类名
     * @param {string} site 站点名称
     * @returns {string} 站点驱动类的名称
     */
    static stringToClassName(site) {
        // 验证字符串是否为空或无效
        if (!site || typeof site !== 'string') {
            throw new Error('Invalid class name string');
        }

        // 将字符串转换为 PascalCase
        const pascalCaseClassName = site.split(/[\s-_]+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join('');

        return 'Driver' + pascalCaseClassName;
    }
}

export {
    Factory
}
export default Factory;