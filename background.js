chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "MYPICTUREHELPERQUEUED",
        title: "关注(Queue)"
    })

})
function Notify(tab, msg, type) {
    chrome.scripting.executeScript({
        target: { tabId: tab, allFrames: true },
        files: ["js/jquery-1.8.3.js", "js/notify.js"]
    }, function () {
        chrome.scripting.executeScript({
            target: { tabId: tab, allFrames: true },
            func: function (msg, type) { $.notify(msg, type) },
            args: [msg, type]
        });
    });
}

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
    if (info.menuItemId != "MYPICTUREHELPERQUEUED")
        return;
    try {
        // .to和.net内容完全一样，但是用nhentai.to获取不到cookie导致后端下载失败
        var url = tab.url;
        if (url.match("https://www.pixiv.net/.*") || url.match("https://hitomi.la/.*"))
        {
            var res = await fetch('http://127.0.0.1:5678/' + encodeURIComponent(tab.url), {
                method: 'GET',
                headers: { 'Cache-Control': 'no-cache' }
            });
            Notify(tab.id, res.ok ? 'Done.' : 'Fail.', res.ok ? 'success' : 'error');
            console.log((res.ok ? "Done " : "Fail ") + tab.url);
        }
    }
    catch (err) {
        Notify(tab.id, 'Fail:' + err, 'error');
        console.log("Fail " + tab.url + " " + err);
    }
});


SendCookie();
setInterval(SendCookie, 12*60*60*1000);

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

console.log("Service Worker Start keep alive loop");
// 25sec，如果30秒没有新事件service worker就会关闭 #https://developer.chrome.com/blog/longer-esw-lifetimes/
// calling any asynchronous chrome API keeps the worker running for 30 seconds more #https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 25e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();