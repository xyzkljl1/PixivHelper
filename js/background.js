SendCookie();
window.setInterval(SendCookie, 12*60*1000);
function SendCookie() {
    //先访问一次刷新cookie(不知道有没有用)
    $.ajax({
        url: 'https://www.pixiv.net/',
        type: 'HEAD',
        cache: false
    }).done(function (result) {
        chrome.cookies.getAll({ "url": "https://www.pixiv.net/" }, function (cookies) {
            var ret = "";
            for (let cookie of cookies)
                ret += cookie.name + "=" + cookie.value + "; ";
            $.ajax({
                url: 'http://127.0.0.1:5678/',
                type: 'POST',
                data: ret,
                cache: false
            }).done(function (result) {
                console.log("Send Success\n");
            });
        });
    });
}