// 在Q5项目中，自动填写日报功能
(function () {
    var container = document.getElementById('divResult');
    if (container && container.style.display === 'none') {
        container.style.display = 'block';
        console.log('已显示隐藏的 divResult');
    }

    console.log('开始查找未填写链接...');
    const links = document.querySelectorAll('a.rtdpurple, a[class~="rtdpurple"]');
    console.log(links);

    function delay(callback, ms) {
        setTimeout(callback, ms);
    }

    function handleLink(link, next) {
        if (link.textContent.trim() === '未填写') {
            console.log('找到未填写链接，准备点击：', link.textContent.trim());
            link.click();

            delay(function () {
                const inputElement = document.evaluate('//*[@id="tr_PMS_ReportDetail"]/td[6]/nobr/input', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                console.log(inputElement);
                if (inputElement) {
                    setTimeout(1000);
                    console.log('找到输入框，填入8');
                    inputElement.focus();
                    inputElement.value = '8';
                    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                    inputElement.dispatchEvent(new Event('change', { bubbles: true }));

                    const saveButton = document.querySelector('a[title="保存"]');
                    if (saveButton) {
                        console.log('点击保存按钮');
                        saveButton.click();

                        delay(function () {
                            const confirmButton = document.querySelector('button.ui-button');
                            if (confirmButton) {
                                console.log('点击确认按钮');
                                confirmButton.click();

                                delay(function () {
                                    const closeButton = document.evaluate('/html/body/div[8]/div[1]/div/a[3]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                                    if (closeButton) {
                                        console.log('点击关闭按钮');
                                        closeButton.click();

                                        delay(next, 2000); // 处理下一个链接
                                    } else {
                                        console.log('未找到关闭按钮');
                                        next();
                                    }
                                }, 2000);
                            } else {
                                console.log('未找到确认按钮');
                                next();
                            }
                        }, 2000);
                    } else {
                        console.log('未找到保存按钮');
                        next();
                    }
                } else {
                    console.log('未找到输入框');
                    next();
                }
            }, 5000);
        } else {
            next();
        }
    }

    function processLinks(index) {
        if (index < links.length) {
            handleLink(links[index], function () {
                //processLinks(index + 1);
            });
        } else {
            console.log('所有链接处理完成！');
        }
    }

    // 使用 for 循环逻辑，逐步处理每个链接
    processLinks(0);
})();