function click(){$(".con").on("click","dl",function(){var e=$(this).attr("dataid");localStorage.setItem("dataid",e),WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e039",otherId:e},function(){}),window.location.href="detail.html?&type=1&pageId=H5_A008&productId="+e})}function contextHeight(){var e=0;return $.each(arguments,function(t,o){e+=1*$(o).height()}),document.documentElement.clientHeight-e}$(function(){function e(e){WPBridge.callMethod("JsInvokeNative","wpEncrypt",{key:e,params:[o,t,"1","1000"]},function(e){codeValue=e.data.result,""==o&&(codeValue[0]=""),$.ajax({type:"post",url:wpCommon.Url+"/wpwl/product/searchByPage",async:!0,cache:!1,data:{brandId:codeValue[0],categoryId:"",keyword:codeValue[1],pageIndex:codeValue[2],pageSize:codeValue[3]},success:function(e){if(0==e.success||0==e.data.total)$("#wrong").show(),$("#content").hide(),$(".all").html(),WPBridge.callMethod("JsInvokeNative","wpShowWebView",{},function(){}),WPBridge.callMethod("JsInvokeNative","wpDismissLoadingDialog",{},function(){});else{var t="",o=e.data.list;for(var a in o)t+='<dl dataid="'+o[a].productId+'">',t+='<dt><img src="'+o[a].iconUrl+'" /></dt>',t+='<dd><p class="lines"></p><p class="p1">'+o[a].productName+'</p><p class="p2">'+o[a].standard+"</p></dd>",t+="</dl>";$(".con").html(t),Iscroll.scroll(),click(),WPBridge.callMethod("JsInvokeNative","wpShowWebView",{},function(){}),WPBridge.callMethod("JsInvokeNative","wpDismissLoadingDialog",{},function(){})}},error:function(e){WPBridge.callMethod("JsInvokeNative","wpShowWebView",{},function(){}),WPBridge.callMethod("JsInvokeNative","wpDismissLoadingDialog",{},function(){}),WPBridge.callMethod("JsInvokeNative","wpNetError",{url:wpCommon.Url+"/h5/searchResult.html"},function(){})}})})}var t=localStorage.getItem("searchVal");if($(".all").html(t),localStorage.getItem("brandid"))o=localStorage.getItem("brandid");else var o="";localStorage.getItem("resultid");WPBridge.callMethod("JsInvokeNative","wpShowLoadingDialog",{},function(){}),window.aseFail="",$.ajax({type:"post",url:wpCommon.Url+"/wpwl/getKey",success:function(t){key=t.data,localStorage.setItem("key",t.data),e(key)}})}),$(function(){$(".goback").on("touchstart",function(){WPBridge.callMethod("JsInvokeNative","wpFinishH5",{},function(){})}),$("#wpReload").click(function(){searchResult(key)})}),$(function(){myScroll=new IScroll("#content",{click:!0,fixedScrollbar:!0,disableTouch:!1,disablePointer:!0,mouseWheel:!0,disableMouse:!1,scrollBars:!0})});var Iscroll={scroll:function(){myScroll.refresh()}};