
// var orginUrl = "https://h5.wpwl.org";
var orginUrl = "https://share.wpwl.org";

//打点统计将要返回的数据
var pointDatas = [];
var pointDataList = {};
pointDataList.acPointLog = {};
pointDataList.acDevicePositionInfo = {};

//验伪数据
var antifakeDatas = [];
var antifakeDataList = {};
antifakeDataList.acAntifakeLog = {}
antifakeDataList.acDevicePositionInfo = {}


var baseKeyStr = null;
var pointOrder = 0;//打点顺序
//记录点击时间
var pointStartTime=null;
var pointEndTime = null;
var stayTime =null;

$(function(){
    function pushHistory() {
        var state = {
            title: "title",
            url: "#"
        };
        window.history.pushState(state, "title", "#");
    }
    pushHistory();
    var bool=false;
    setTimeout(function(){
        bool=true;
    },1500);
    window.addEventListener("popstate", function(e) {
        if(bool)
        {
            if(WeixinJSBridge){
                WeixinJSBridge.call('closeWindow');
            }
        }
        pushHistory();

    }, false);
});
deleteCookie("JSESSIONID");
function getCookie(name){
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}
editCookie("JSESSIONID",(Math.random()*111).toString(),0);
function editCookie(name,value,expiresHours){
    var cookieString=name+"="+escape(value);
//判断是否设置过期时间,0代表关闭浏览器时失效
    if(expiresHours>0){
        var date=new Date();
        date.setTime(date.getTime+expiresHours*3600*1000); //单位是多少小时后失效
        cookieString=cookieString+"; expires="+date.toGMTString();
    }
    document.cookie=cookieString;
}

function deleteCookie(name){
    var date=new Date();
    date.setTime(date.getTime()-10000); //设定一个过去的时间即可
    document.cookie=name+"=v; expires="+date.toGMTString();
}

//  var labelCode = "32211250000000027";
$("#bottom").on("touchstart click", function (e) {
    var target = e.target;
    if ($(target).attr("id") == "close") {
        $("#bottom").hide();
        $("#content-scroll").css("paddingBottom", "0rem")
    } else {
        if (checkIsAppleDevice()) {
            window.location.href = "http://www.wopuwulian.com/app.html"
        } else {
            window.location.href = "http://www.wopuwulian.com/app.html"
        }
    }
});

//1. 加载页面后立即可以获取的打点数据,
// 会话ID+地区码+手机品牌+手机型号+UUID+系统+系统版本+应用名称+应用版本+时间
(function(){
    //a.地理位置获取-->后台转地区码
    function onSuccess(point){
        //返回用户位置
        //经度
        var longitude =point.coords.longitude;
        //纬度
        var latitude = point.coords.latitude;
        
        pointDataList.acDevicePositionInfo.longitude = longitude;
        pointDataList.acDevicePositionInfo.latitude = latitude;
        antifakeDataList.acDevicePositionInfo.longitude = longitude;
        antifakeDataList.acDevicePositionInfo.latitude = latitude;
    }
    //获取位置失败
    function onError (error){
        pointDataList.acDevicePositionInfo= {};
        antifakeDataList.acDevicePositionInfo={};
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onSuccess,onError);
    } else {
        console.log("不支持此功能");
    }
})();


    //e. 时间格式化
    (function(){
        function dateFormat (time,format){
            var o = {
                "M+" : time.getMonth()+1, //month
                "d+" : time.getDate(), //day
                "h+" : time.getHours(), //hour
                "m+" : time.getMinutes(), //minute
                "s+" : time.getSeconds(), //second
                "q+" : Math.floor((time.getMonth()+3)/3), //quarter
                "S" : time.getMilliseconds() //millisecond
            };
            if(/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (time.getFullYear()+"").substr(4 - RegExp.$1.length));
            }
            for(var k in o) {
                if(new RegExp("("+ k +")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
                }
            }
            return format;
        }
        window.dateFormat = dateFormat;
    })();


var labelCode =getUrlRequest().toString();//云服务器需要开启
console.log(labelCode);
//32211250
if(labelCode.substring(0,8)=="32211250"){
	$("#bottom").hide();
}
pointDataList.acPointLog.pointParam = labelCode;
//获取到key
getKeyStr();
//获取key
function getKeyStr(){
    $.ajax({
        // http://192.168.199.14/wpwl/getKey?clientType=5
        url: orginUrl + "/wpwl/getKey?clientType=5",
        type:"POST",
        success: function (res) {
            baseKeyStr = res.data;
            if(typeof arguments[0] == "function"){
                arguments[0]();
            }
            wpwlDetails.getData();
            verrifyFake(baseKeyStr);
        }
    });
}

function verrifyFake(baseKeyStr){
    //验伪
    antifakeDataList.acAntifakeLog.scanTime="0";
    antifakeDataList.acAntifakeLog.verifyTime=dateFormat(new Date(),"yyyy-MM-dd hh:mm:ss");
    antifakeDataList.acAntifakeLog.serialNo = getUrlRequest()//标签号
	antifakeDataList.acAntifakeLog.verifyResult = "1";	//验伪结果  
   	antifakeDataList.sessionId = getSessionId();
    //点击进入进行验伪打点
    var pointData = wpwlDetails.doEncrypt(JSON.stringify(pointDatas),baseKeyStr);
        $.ajax({
            url: orginUrl + "/wpwl/acAntifakeLog/saveAntifakeLog",
            type:"POST",
            data:{pointDatas:pointData},
            success:function(res1){
                console.log(res1.success);
            }
        });
}
//打点
$("body").on("click",".swiper-slide img",function(e){
    //$(".mask-shadow").show();
    //destoryTouch();
    pointStartTime = new Date().getTime();
    pointDataList.acPointLog.pointType="0";
    pointDataList.acPointLog.pointName="点击产品主图";
    pointDataList.acPointLog.pointCode="e027";
    pointDataList.acPointLog.pointStartTime=dateFormat(new Date(),"yyyy-MM-dd hh:mm:ss");
    pointDataList.acPointLog.pointOrder = pointOrder++;
});

//点击长图图片打点
$(".share_longImg").on("click",".longPic img", function (e) {
    //var target = e.target;
    //destoryTouch();
    pointDataList.acPointLog.pointStartTime=dateFormat(new Date(),"yyyy-MM-dd hh:mm:ss");
    pointStartTime = new Date().getTime();
    pointDataList.acPointLog.pointType="0";
    pointDataList.acPointLog.pointName="点击产品长图";
    pointDataList.acPointLog.pointCode="e025";
    pointDataList.acPointLog.pointOrder = pointOrder++;
});

var wpwlDetails = {
    getData: function () {
        $.ajax({
            url:orginUrl + "/wpwl/product/productGoodsInfo",
            type:"POST",
            data:{labelCode:wpwlDetails.doEncrypt(labelCode,baseKeyStr)},
            timeout: 10000,
            beforeSend: function () {
                $(".loadEffect").show().siblings(".middle").hide()
            },
            success: function (res) {
//          	alert("success");
                var sessionId = getSessionId();
                pointDataList.sessionId = sessionId;
                if (res.errMsg == "找不到指定的产品，请稍后再试，谢谢！" || res.errMsg == "找不到指定的产品") {
//              	alert("success:找不到指定的产品");
                    $(".loadEffect").hide();
                    $(".middle").show().find("p").html("该产品已下架").siblings("img").attr("src", "images/notFound.png")
                } else {
//              	alert("success:res");
                    window.productInfo = res.data;
                    console.log(res.data);
                    var serverTel = productInfo.orgInfo.serviceTel;
                    $(".serverTel").attr({
                        href:"tel:"+serverTel
                    });
                    $("#content").show();
                    $(".loading").hide();
                    wpwlDetails.autoPlay();
                    if (productInfo.detailType) {
                        if (productInfo.detailType == "0") {
                            wpwlDetails.special()
//                          alert("success:restype00");
                        } else {
                            if (productInfo.detailType == "1") {
//                          	alert("success:restype11:----"+productInfo.detailType);
                                $(".features").hide().siblings(".share_longImg").show();
                                wpwlDetails.longImg($(".share_longImg"), productInfo.detailPicData, "sLongImg-swipebox");
                                
                                if(productInfo.productParams.paramList.length>0){
                                	try { 
//										alert("success:restype11paramList:----"+productInfo.productParams.paramList.length);
	    								var paramsHtml = document.getElementById('product_paramsID').innerHTML;
										laytpl(paramsHtml).render(productInfo, function(html){
										  document.getElementById('product_params_cont').innerHTML = html;
										});  
									} 
									catch (e) { 
//										alert(e.message); 
									} 
                                }
                            }
                        }
                    } else {
                        wpwlDetails.special();
                    }
                    wpwlDetails.scroll();
                    lazyLoad(".detail_area img:visible")
                }
            },
            error: function (jqXHR) {
                $(".loadEffect").hide().siblings(".middle").show()
            }
        })
    },
    autoPlay: function () {
        var bigImgUrl = productInfo.productDetails.productUrls;
        for (var i = 0; i < bigImgUrl.length; i++) {
            var ele = $(".swiper-slide").eq(0).clone();
            ele.css("display", "block").find("img").attr("src", bigImgUrl[i]).parents("a").attr("href", bigImgUrl[i]).addClass("big-swipebox");
            $(".swiper-wrapper").append(ele)
        }
        $(".big-swipebox").swipebox();
        mySwiper = new Swiper(".swiper-container", {
            autoplay: 2000,
            pagination: ".swiper-pagination",
            autoplayDisableOnInteraction: false
        });
        $(".circle img").attr("src", productInfo.brand.brandIcon);
        $("#product_name span").html(productInfo.brand.brandName + " · " + productInfo.productDetails.productName).parents("#product_name").siblings("#product_des").html(productInfo.productDetails.featureDesc)
    },
    special: function () {
        if (productInfo.productSpecList) {
            var data = productInfo.productSpecList;
            for (var j = 0; j < data.length; j++) {
                var ele = $(".special_block").eq(0).clone();
                ele.find(".bigImg").attr("src", data[j].bigImg).parents("a").attr("href", data[j].bigImg).addClass("spec-swipebox");
                var spec = data[j].detail;
                var length = spec.length;
                for (var i = 0; i < length; i++) {
                    var ele2 = ele.find(".special_intro").eq(0).clone();
                    ele2.find("h4 span").html(spec[i].title);
                    ele2.find("p").css("color", "#666").html(spec[i].intro);
                    ele2.find("img").attr("src", spec[i].smallImg).parents("a").attr("href", spec[i].smallImg).addClass("spec-swipebox");
                    ele2.css("display", "block");
                    ele.append(ele2)
                }
                ele.show();
                $(".features").append(ele)
            }
            $(".features").show();
            $(".spec-swipebox").swipebox()
        }
    },
    longImg: function (obj, picData, name) {
        if (picData) {
            var imgArea = $(".share_longImg");
            var wid = document.documentElement.clientWidth;

            for (var i = 0; i < picData.length; i++) {
                var imgEle = obj.find(".longPic").eq(0).clone();
                imgEle.find("img").css({
                    "width": "100%",
                    "height": picData[i].height / picData[i].width * wid + "px"
                }).attr("rsrc", picData[i].detailPicUrl).parent("a").attr("href", picData[i].detailPicUrl).addClass(name);
                imgEle.show();
                imgArea.append(imgEle);
            }
            $("." + name).swipebox();
   
            lazyLoad(obj.find("img:visible"))
        }
    },
    getSessionId:function(c_name){
        var c_name = c_name || 'JSESSIONID';
        if(document.cookie.length>0){
            c_start=document.cookie.indexOf(c_name + "=");
            if(c_start!=-1){
                c_start=c_start + c_name.length+1;
                c_end=document.cookie.indexOf(";",c_start);
                if(c_end==-1) c_end=document.cookie.length;
                return unescape(document.cookie.substring(c_start,c_end));
            }
        }
    },
    //打点函数
     pointPush:function(pointDatas){
        var pointData = this.doEncrypt(JSON.stringify(pointDatas),baseKeyStr);
        $.ajax({
            url: orginUrl + "/wpwl/acPointLog/savePointLog",
            type:"POST",
            data:{pointDatas:pointData},
            success:function(res1){
            }
        });
    },
    //加密函数
     doEncrypt:function(plaintText,baseKeyStr){
        keyStr = base64decode(baseKeyStr);
        var key = CryptoJS.enc.Utf8.parse(keyStr);
        var encryptedData = CryptoJS.AES.encrypt(plaintText, key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        var encryptedBase64Str = encryptedData.toString();
        return encryptedBase64Str;
    },
    scroll: function () {
        myScroll.refresh();
        $("img").each(function () {
            var dfd = $.Deferred();
            $(this).bind("load", function () {
                dfd.resolve()
            }).bind("error", function () {
                $(this).attr("src", "images/default_error2.png")
            })
        })
    }
};
$(function () {
    $("#backTop").on("touchend", function (e) {
        myScroll.scrollTo(0, 0, 2000, IScroll.utils.ease.circular)
    });
    $("#wpReload").click(function () {
        wpwlDetails.getData()
    })
});

$(function () {
    window.winHei = $(window).height();
    myScroll = new IScroll("#content", {
        click: true,
        vScrollbar: true,
        vScroll: false,
        disableTouch: false,
        disablePointer: true,
        mouseWheel: true,
        disableMouse: false,
        scrollBars: true
    });
    myScroll.on("scrollEnd", function (e) {
        if (this.y < -200) {
            $("#backTop").show()
        } else {
            $("#backTop").hide()
        }
        lazyLoad(".detail_area img:visible")
    })
});

function getUrlRequest() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        var regUrl = /^(\d+)/;
        theRequest = regUrl.exec(str)[1];
    }
    return theRequest;
}

function checkIsAppleDevice() {
    var u = navigator.userAgent,
        app = navigator.appVersion;
    var ios = !! u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    var iPad = u.indexOf("iPad") > -1;
    var iPhone = u.indexOf("iPhone") > -1 || u.indexOf("Mac") > -1;
    if (ios || iPad || iPhone) {
        return true
    } else {
        return false
    }
}

function lazyLoad(obj) {
    $(obj).each(function () {
        var t = $(this);
        if (t.attr("rsrc") !== t.prop("src")) {
            if (t.offset().top <= winHei + 200) {
                t.prop("src", t.attr("rsrc"))
            }
        }
    })
}

//获取SessionId
function getSessionId(c_name){
    var c_name = c_name || 'JSESSIONID';
    if(document.cookie.length>0){
        c_start=document.cookie.indexOf(c_name + "=");
        if(c_start!=-1){
            c_start=c_start + c_name.length+1;
            c_end=document.cookie.indexOf(";",c_start);
            if(c_end==-1) c_end=document.cookie.length;
            return unescape(document.cookie.substring(c_start,c_end));
        }
    }
}
var isClick = false;
var isFirst = false;

$(".product_params").on("click", "i",function(){
	isClick = !isClick;
	if(!isFirst){
		
		$type_list = $(".type_list div article").clone(true);
	}
	if(isClick){
//		alert("product_params");
		$(".type_list div").html($type_list.first().clone(true));
	}else{
		$(".type_list div").html($type_list);
	}
	myScroll.refresh();
	isFirst = true;
});
