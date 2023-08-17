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