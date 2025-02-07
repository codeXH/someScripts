(function () {
    console.log('🔍 开始处理未填写链接...');

    // 显示隐藏的 divResult
    var container = document.getElementById('divResult');
    if (container && container.style.display === 'none') {
        container.style.display = 'block';
        console.log('✅ 已显示隐藏的 divResult');
    }

    // 递归查找所有子文档中的链接
    function findLinksInDocument(doc) {
        const results = [];
        const links = doc.querySelectorAll('a.rtdpurple');
        links.forEach(link => {
            if (link.textContent.trim() === '未填写') {
                results.push(link);
            }
        });

        const iframes = doc.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    results.push(...findLinksInDocument(iframeDoc));
                }
            } catch (e) {
                console.warn('⚠️ 无法访问 iframe：', e);
            }
        });

        const nestedHtmls = doc.getElementsByTagName('html');
        Array.from(nestedHtmls).forEach(nestedHtml => {
            if (nestedHtml !== doc.documentElement) {
                results.push(...findLinksInDocument(nestedHtml));
            }
        });

        return results;
    }

    // 递归查找输入框
    function findInputInDocument(doc) {
        const input = doc.querySelector('#tr_PMS_ReportDetail td:nth-child(6) nobr input');
        if (input) {
            return input;
        }

        const iframes = doc.querySelectorAll('iframe');
        for (const iframe of iframes) {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    const inputInIframe = findInputInDocument(iframeDoc);
                    if (inputInIframe) {
                        return inputInIframe;
                    }
                }
            } catch (e) {
                console.warn('⚠️ 无法访问 iframe：', e);
            }
        }

        const nestedHtmls = doc.getElementsByTagName('html');
        for (const nestedHtml of nestedHtmls) {
            if (nestedHtml !== doc.documentElement) {
                const inputInNestedHtml = findInputInDocument(nestedHtml);
                if (inputInNestedHtml) {
                    return inputInNestedHtml;
                }
            }
        }

        return null;
    }

    // 递归查找按钮（通用方法）
    function findButtonInDocument(doc, selector, buttonName) {
        const button = doc.querySelector(selector);
        if (button) {
            console.log(`✅ 找到 ${buttonName} 按钮`);
            return button;
        }

        const iframes = doc.querySelectorAll('iframe');
        for (const iframe of iframes) {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    const buttonInIframe = findButtonInDocument(iframeDoc, selector, buttonName);
                    if (buttonInIframe) {
                        return buttonInIframe;
                    }
                }
            } catch (e) {
                console.warn(`⚠️ 无法访问 iframe 查找 ${buttonName} 按钮：`, e);
            }
        }

        const nestedHtmls = doc.getElementsByTagName('html');
        for (const nestedHtml of nestedHtmls) {
            if (nestedHtml !== doc.documentElement) {
                const buttonInNestedHtml = findButtonInDocument(nestedHtml, selector, buttonName);
                if (buttonInNestedHtml) {
                    return buttonInNestedHtml;
                }
            }
        }

        console.warn(`❌ 未找到 ${buttonName} 按钮`);
        return null;
    }

    // 专门查找关闭按钮的方法
    function findCloseButton(doc) {
        // 按照 aria-label 或类名匹配关闭按钮
        const closeButton = doc.querySelector('a[aria-label="Close"], a.k-window-action.k-i-close');
        if (closeButton) {
            console.log('✅ 找到关闭按钮');
            return closeButton;
        }

        const iframes = doc.querySelectorAll('iframe');
        for (const iframe of iframes) {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc) {
                    const buttonInIframe = findCloseButton(iframeDoc);
                    if (buttonInIframe) {
                        return buttonInIframe;
                    }
                }
            } catch (e) {
                console.warn('⚠️ 无法访问 iframe 查找关闭按钮：', e);
            }
        }

        const nestedHtmls = doc.getElementsByTagName('html');
        for (const nestedHtml of nestedHtmls) {
            if (nestedHtml !== doc.documentElement) {
                const buttonInNestedHtml = findCloseButton(nestedHtml);
                if (buttonInNestedHtml) {
                    return buttonInNestedHtml;
                }
            }
        }

        console.warn('❌ 未找到关闭按钮');
        return null;
    }

    // 延迟执行
    function delay(callback, ms) {
        setTimeout(callback, ms);
    }

    // 处理单个链接
    function handleLink(link, next) {
        console.log('👉 找到未填写链接，准备点击：', link.textContent.trim());
        link.click();

        delay(function () {
            const inputElement = findInputInDocument(document);

            if (inputElement) {
                console.log('📝 找到输入框，填入 8');
                inputElement.focus();
                inputElement.value = '8';
                inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                inputElement.dispatchEvent(new Event('change', { bubbles: true }));

                const saveButton = findButtonInDocument(document, 'a[title="保存"]', '保存');
                if (saveButton) {
                    console.log('💾 点击保存按钮');
                    saveButton.click();

                    delay(function () {
                        const confirmButton = findButtonInDocument(document, 'button.ui-button', '确认');
                        if (confirmButton) {
                            console.log('✅ 点击确认按钮');
                            confirmButton.click();

                            delay(function () {
                                const closeButton = findCloseButton(document);
                                if (closeButton) {
                                    console.log('❌ 点击关闭按钮');
                                    closeButton.click();
                                    delay(next, 2000); // 处理下一个链接
                                } else {
                                    next();
                                }
                            }, 2000);
                        } else {
                            next();
                        }
                    }, 2000);
                } else {
                    next();
                }
            } else {
                next();
            }
        }, 5000);
    }

    // 处理链接列表
    function processLinks(links, index) {
        if (index < links.length) {
            handleLink(links[index], function () {
                processLinks(links, index + 1); // 递归处理下一个链接
            });
        } else {
            console.log('🎉 所有链接处理完成！');
        }
    }

    // 开始处理
    const allLinks = findLinksInDocument(document);
    console.log(`🔗 共找到 ${allLinks.length} 个未填写链接`);

    if (allLinks.length > 0) {
        processLinks(allLinks, 0);
    } else {
        console.log('✅ 没有未填写的链接需要处理');
    }
})();