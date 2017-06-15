//图片出错处理
function imgError(src){ //出错图片路径 若经特殊设置可不传
	$('img').on('error',function(){
		var $t=$(this);
		if(src){
			$t.attr('src',src)
		}else{
			$t.attr('src','images/'+$t.attr('errType')+'_error.png');
		}
	})
}
//ajax完成处理 resetFn为返回解密失败触发的函数 fn为返回成功时触发的函数 res为后台返回的数据
function ajaxComplete(res,resetFn,fn,err){
    if(res.errMsg=='AES加密解密失败'){
        resetFn();
    }else if(!res.success){
        if(!err){
            $(".content").hide();
            $('#share').hide()
            $(".loadEffect").hide().siblings(".middle").show().find('img').attr('src','images/notFound.png').siblings('p').html('活动异常<br />关联产品或活动已下架')
        }else{
            err();
            $(".loadEffect").hide();
        }
        
    }else{
        try{
            fn && fn();
        }catch(e){
            $(".loadEffect").hide().siblings(".middle").show();
            $(".middle img").attr('src',"images/error_else.png");
            $(".middle p").html("出错了，请稍后再试");
            $(".content").hide();
            $('#share').hide()
        }
    }
}
//ajax出错处理
function ajaxError(jqXHR, textStatus, errorThrown){
	$('#share').hide();
	$(".content").hide();
	$(".loadEffect").hide().siblings(".middle").show().find('img').attr('src','images/notFound.png').siblings('p').html('活动异常')
}
//获取url中"?"符后的字串
function getUrlRequest() {
    var url = location.search; 
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        if (str.indexOf("&") != -1) {
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        } else {
            theRequest[str.split("=")[0]] = unescape(str.split("=")[1]);
        }
    }
    return theRequest;
}
//时间格式化
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
//获取session
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
//加密
function doEncrypt(plaintText,baseKeyStr){//提出wpCommon
    keyStr = base64decode(baseKeyStr);
    var key = CryptoJS.enc.Utf8.parse(keyStr);
    var encryptedData = CryptoJS.AES.encrypt(plaintText, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });
    var encryptedBase64Str = encryptedData.toString();
    return encryptedBase64Str;
}
//判断手机机型
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
//cookie操作
function getCookie(name){
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg)){
        return unescape(arr[2]);
    }else{
        return null;
    }
}
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
    date.setTime(date.getTime()-10000); //设定一个过去的时间
    document.cookie=name+"=v; expires="+date.toGMTString(); 
}
//倒计时函数只到天为止 传入endDate:2017.04.19
function countDownDay(endDate){
    var startTime=new Date().getTime();
    var endDateArray=endDate.split('.');
    var end=new Date();
    end.setFullYear(endDateArray[0],endDateArray[1]-1,endDateArray[2]);
    var endTime =end.getTime();
    var countTime=endTime-startTime;
    var day=Math.floor(countTime/(60*60*1000*24));
    return day;
}
//屏蔽手机号中间四位
function encryptyPhone(phone){
    phone=phone+'';
    var newPhone=phone.substring(0,3)+'****'+phone.substring(7);
    return newPhone;
}