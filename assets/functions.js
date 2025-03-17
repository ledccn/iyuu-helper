console.log('import assets/functions.js');

/**
 * 下载JSON文件
 * @param {Object} data
 * @param filename
 */
function download_json_file(data, filename) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * 初始化元素的属性值
 * @param {Object} $ JQuery
 * @param {string} selector 选择器
 * @param {string|int} value 值
 */
function init_element_attr_value($, selector, value) {
    let obj = $(selector);
    if (typeof obj[0] === "undefined" || !obj[0].nodeName) return;

    console.log('初始化' + obj[0].nodeName.toLowerCase() + '属性值', selector, value)
    if (obj[0].nodeName.toLowerCase() === "textarea") {
        obj.val(value);
    } else {
        obj.attr("value", value);
        obj[0].value = value;
        if ('checkbox' === obj.attr('type')) {
            obj.attr('checked', true);
        } else if (obj[0].nodeName.toLowerCase() === "select") {
            obj.find('option[value="' + value + '"]').attr('selected', true);
        }
    }
}

/**
 * 向页面注入JS
 * @param {string} jsPath
 */
function injectCustomJs(jsPath) {
    jsPath = jsPath || 'js/inject.js';
    const temp = document.createElement('script');
    temp.setAttribute('type', 'text/javascript');
    // 获得的地址类似：chrome-extension://10000/js/inject.js
    temp.src = chrome.runtime.getURL(jsPath);
    temp.onload = function () {
        // 放在页面不好看，执行完后移除掉
        //this.parentNode.removeChild(this);
    };
    document.body.appendChild(temp);
}

/**
 * 获取密钥
 * @param {string} keyword
 * @returns {string}
 */
function get_fields_passkey(keyword) {
    const targetTd = getElementByKeyword(keyword);
    if (!targetTd) {
        throw new Error('无法获取到密钥关键字');
    }

    // 获取下一个 td 元素
    const nextTd = targetTd.nextElementSibling;
    if (!nextTd || nextTd.tagName.toLowerCase() !== 'td') {
        console.log(targetTd);
        throw new Error('无法获取到下一个 td 节点');
    }

    let text = nextTd.textContent;

    // 检查下一个 td 元素内是否包含 span 标签
    const span = nextTd.querySelector('span');
    if (span) {
        text = span.textContent;
    }

    console.log('密钥原始文本', text);
    const match = text.match(/[a-zA-Z0-9]+/);
    if (match) {
        return match[0];
    }
    throw new Error('无法获取到密钥');
}

/**
 * 获取密钥
 * @param {string} keyword
 * @returns {string}
 */
function getFieldsPasskey(keyword) {
    const td = $('td:contains(' + keyword + ')');
    if (td.length === 0) {
        throw new Error('无法获取到密钥关键字')
    }

    let text = td.next('td').text();
    const tdNext = td.next('td');
    // 如果包含 span 标签，则获取 span 标签的文本
    if (0 < tdNext.find('span').length) {
        text = tdNext.find('span').text()
    }
    console.log('密钥原始 text 文本', text);
    const match = text.match(/[a-zA-Z0-9]+/);
    if (match) {
        return match[0]
    }
    throw new Error('无法获取到密钥')
}

/**
 * 获取链接的 href
 * - 仅获取第一个匹配的超链接
 * - 如果有索引，则获取索引对应的值
 * @param {HTMLElement|Document} dom 文档Dom
 * @param {RegExp} regex 正则表达式
 * @param {int|null} index 索引
 * @returns {string|null}
 */
function getLinkHrefByDocument(dom, regex, index = null) {
    let match = null;
    const links = dom.querySelectorAll('a');
    for (let link of links) {
        // console.log('链接 href:', link.href);
        if (null === index) {
            if (regex.test(link.href)) {
                return link.href;
            }
        } else {
            match = link.href.match(regex);
            if (match) {
                return match[index];
            }
        }
    }

    return null;
}

/**
 * 获取包含关键字的 Dom 节点
 * @param {string} keyword
 * @param {string} selector
 * @returns {HTMLElement|null}
 */
function getElementByKeyword(keyword, selector = 'td') {
    let list = document.querySelectorAll(selector);
    for (let target of list) {
        if (target.textContent.includes(keyword)) {
            while (target.querySelectorAll(selector).length > 1) {
                let matches = target.querySelectorAll(selector);
                for (let match of matches) {
                    //console.log('包含关键字的元素内容:', match.textContent);
                    if (match.textContent.includes(keyword)) {
                        //console.log('包含关键字的元素内容:', match.textContent);
                        target = match;
                        break;
                    }
                }
            }
            return target;
        }
    }
    return null;
}
