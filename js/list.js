function contextHeight(){var e=0;return $.each(arguments,function(t,a){e+=1*$(a).height()}),document.documentElement.clientHeight-e}var page=1;scrollDown=!0,complete=!1,$(function(){function e(l,s,o,i,c,r,n){WPBridge.callMethod("JsInvokeNative","wpEncrypt",{key:l,params:[a,1,r,s]},function(a){codeValue=a.data.result,$.ajax({type:"post",url:wpCommon.Url+"/wpwl/product/listByPage",dataType:"json",cache:!1,data:{brandId:codeValue[0],categoryId:codeValue[3],pageIndex:codeValue[1],pageSize:codeValue[2],versionId:"27"},async:!0,timeout:1e4,success:function(a){if("AES加密解密失败"==a.errMsg)aesFail||($.ajax({type:"post",url:wpCommon.Url+"/wpwl/getKey",success:function(t){l=t.data,localStorage.setItem("key",t.data),e(l)}}),aesFail=!0);else if(a.success){str="";var s=a.data.list;str+='<ul class="ul">',str+="<p class='backG'></p>",str+=1==n?'<li class="li listTitle" resultName="'+o.categoryName+'" resultid="'+o.categoryId+'"><i class="bgLift">'+o.categoryName+"</i></li>":'<li class="li listTitle" resultName="'+o.categoryName+'" resultid="'+o.categoryId+'"><i class="bgLift">'+o.categoryName+'</i><span resultName="'+o.categoryName+'" resultid='+o.categoryId+' class="more">更多</span><i resultName="'+o.categoryName+'" resultid='+o.categoryId+' class="bgRight"></i></li>',str+='<li class="two"><i class="lineL"></i><span class="center"></span><i class="lineR"></i></li>',str+='<li class="three">';for(var r in s)s.length>1?"1"==s[r].saleStatus?(str+='<dl dataid="'+s[r].productId+'">',str+='<dt><i class="hot"></i><img src="'+s[r].iconUrl+'" /></dt><dd><p class="lines"></p><p searchName="'+s[r].productName+'" class="p1">'+s[r].productName+'</p><p class="p2">'+s[r].standard+"</p></dd>",str+="</dl>"):str+="<dl dataid="+s[r].productId+'><dt><img src="'+s[r].iconUrl+'" /></dt><dd><p class="lines"></p><p searchName="'+s[r].productName+'" class="p1">'+s[r].productName+'</p><p class="p2">'+s[r].standard+"</p></dd></dl>":(str+="<dl dataid="+s[r].productId+'><dt><img src="'+s[r].iconUrl+'" /></dt><dd><p class="lines"></p><p searchName="'+s[r].productName+'" class="p1">'+s[r].productName+'</p><p class="p2">'+s[r].standard+"</p></dd></dl>",str+='<div class="end"></div>');str+="</li>",str+="</ul>",$(".con").append(str),Iscroll.scroll(),t(),WPBridge.callMethod("JsInvokeNative","wpShowWebView",{},function(){}),WPBridge.callMethod("JsInvokeNative","wpDismissLoadingDialog",{},function(){}),c&&c(i)}else $("#content").hide(),$(".search").hide(),$(".top .name").html("异常页面"),$("#wrongs img").attr("src","img/error_else.png"),$("#wrongs .sorry").html("出错了，请稍后再试"),$("#wrongs").show(),wpCommon.viewShow()},error:function(e,t,a){"timeout"==t&&($("#content").hide(),$(".search").hide(),$(".top .name").html("网络异常"),$("#wrongs").show()),WPBridge.callMethod("JsInvokeNative","wpShowWebView",{},function(){}),WPBridge.callMethod("JsInvokeNative","wpDismissLoadingDialog",{},function(){}),WPBridge.callMethod("JsInvokeNative","wpNetError",{url:wpCommon.Url+"/h5/list.html"},function(){})}})})}function t(){$(".con dl ").on("click",function(){var e=$(this).attr("dataid"),t=$(this).attr("searchName");localStorage.setItem("searchName",t),window.location.href="detail.html?type=1&pageId=H5_A008&productId="+e})}WPBridge.callMethod("JsInvokeNative","wpShowLoadingDialog",{},function(){}),window.aesFail="";var a=localStorage.getItem("brandid"),l=(localStorage.getItem("resultName"),localStorage.getItem("resultid"),localStorage.getItem("brandname"));$(".name").html(l),$.ajax({type:"post",url:wpCommon.Url+"/wpwl/getKey",success:function(e){key=e.data,localStorage.setItem("key",e.data),listByPage.getMes()}});var s=new Array;window.listByPage={getMes:function(t){s=new Array;WPBridge.callMethod("JsInvokeNative","wpEncrypt",{key:key,params:[a,page,4]},function(t){codeValue=t.data.result,$.ajax({type:"post",url:wpCommon.Url+"/wpwl/category/listByPage",data:{brandId:codeValue[0],pageIndex:codeValue[1],pageSize:codeValue[2]},async:!0,success:function(t){function a(t){var s=t+1;l[s]?(e(key,l[s].categoryId,l[s],s,a,2),scrollDown=!1):scrollDown=!0}if("AES加密解密失败"==t.errMsg)aesFail||($.ajax({type:"post",url:wpCommon.Url+"/wpwl/getKey",success:function(t){key=t.data,localStorage.setItem("key",t.data),e(key)}}),aesFail=!0);else{var l=t.data.list;l.length<4&&(complete=!0),1==l.length?e(key,l[0].categoryId,l[0],0,a,1e3,1):e(key,l[0].categoryId,l[0],0,a,2)}page++}})})}},$(".search").click(function(){document.activeElement.blur(),window.location.href="search.html?pageId=H5_A000"}),$(".con").on("click","ul .more",function(){var e=$(this).attr("resultName"),t=$(this).attr("resultid");localStorage.setItem("resultName",e),localStorage.setItem("resultid",t),window.location.href="result.html?pageId=H5_A007&otherId="+t}),$(".con").on("click","ul .bgRight",function(){var e=$(this).attr("resultName"),t=$(this).attr("resultid");localStorage.setItem("resultName",e),localStorage.setItem("resultid",t),window.location.href="result.html?pageId=H5_A007&otherId="+t})}),$(function(){$(".back").click(function(){WPBridge.callMethod("JsInvokeNative","wpFinishH5",{},function(){})})}),$(function(){myScroll=new IScroll("#content",{click:!0,fixedScrollbar:!0,disableTouch:!1,disablePointer:!0,mouseWheel:!0,disableMouse:!1,scrollBars:!0,probeType:3}),myScroll.on("scroll",function(){if(this.y>=0)$(".backG").hide(),$(".ul").eq(0).find(".listTitle").css({position:"relative",top:"0rem",zIndex:1});else{var e=this,t=$(".ul").height();$(".ul").each(function(a){Math.abs(e.y)>a*t&&Math.abs(e.y)<(a+1)*t?($(this).find(".backG").show(),0==a?$(this).find(".listTitle").css({position:"fixed",zIndex:1e8,top:Math.abs(e.y)-12+"px",background:"white"}):$(this).find(".listTitle").css({position:"fixed",zIndex:1e8,top:Math.abs(e.y)-1+"px",background:"white"})):($(this).find(".backG").hide(),$(this).find(".listTitle").css({position:"relative",zIndex:1,top:0}))})}}),myScroll.on("scrollEnd",function(){Math.abs(myScroll.y)>Math.abs(myScroll.maxScrollY+15)&&!complete&&scrollDown&&listByPage.getMes()}),document.addEventListener("touchmove",function(e){e.preventDefault()},!1)});var Iscroll={scroll:function(){var e=contextHeight("#head",".search");$("#content").css("height",e+"px"),myScroll.refresh()}};