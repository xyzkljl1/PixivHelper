let lifeline;
console.log("start keep alive loop");
SendCookie();
setInterval(SendCookie, 12*60*60*1000);
//防止service worker自己关闭
keepAlive();

function SendCookie() {
    //先访问一次刷新cookie(不知道有没有用)
    fetch('https://www.pixiv.net/', {
        method: 'HEAD',
        headers: { 'Cache-Control': 'no-cache' }
    }).then(_r => {
        chrome.cookies.getAll({ "url": "https://www.pixiv.net/" }, function (cookies) {
            var ret = "";
            for (let cookie of cookies)
                ret += cookie.name + "=" + cookie.value + "; ";
            fetch('http://127.0.0.1:5678/', {
                method: 'POST',
                body: ret,
                headers: { 'Cache-Control': 'no-cache' }
            }).then(result => {
                console.log("Send Success\n", ret);
            });
        });
    });
}

chrome.runtime.onConnect.addListener(port => {
    if (port.name === 'keepAlive') {
        lifeline = port;
        setTimeout(keepAliveForced, 295e3); // 5 minutes minus 5 seconds
        port.onDisconnect.addListener(keepAliveForced);
    }
});

function keepAliveForced() {
    lifeline?.disconnect();
    lifeline = null;
    keepAlive();
}

async function keepAlive() {
    if (lifeline) return;
    for (const tab of await chrome.tabs.query({ url: '*://*/*' })) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => chrome.runtime.connect({ name: 'keepAlive' }),
                // `function` will become `func` in Chrome 93+
            });
            chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
            return;
        } catch (e) { }
    }
    chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

async function retryOnTabUpdate(tabId, info, tab) {
    if (info.url && /^(file|https?):/.test(info.url)) {
        keepAlive();
    }
}