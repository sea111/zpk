$(function(){function t(){$.ajax({type:"post",url:wpCommon.Url+"/wpwl/getKey",success:function(t){key=t.data,localStorage.setItem("key",t.data),u.getMes()}})}function e(){r=[s,4].concat(p)}function a(t,e){n="";for(var a=0;a<t.length;a++){var i=t[a].productList;n+='<ul class="ul">',n+="<p class='backG'></p>",n+=1==e?'<li class="li listTitle" resultName="'+t[a].categoryName+'" resultid="'+t[a].categoryId+'"><i class="bgLift">'+t[a].categoryName+"</i></li>":'<li class="li listTitle" resultName="'+t[a].categoryName+'" resultid="'+t[a].categoryId+'"><i class="bgLift">'+t[a].categoryName+'</i><span resultName="'+t[a].categoryName+'" resultid='+t[a].categoryId+' class="more">更多</span><i resultName="'+t[a].categoryName+'" resultid='+t[a].categoryId+' class="bgRight"></i></li>',n+='<li class="two"><i class="lineL"></i><span class="center"></span><i class="lineR"></i></li>',n+='<li class="three">';for(var s in i)i.length>1?"1"==i[s].saleStatus?(n+='<dl dataid="'+i[s].productId+'">',n+='<dt><i class="hot"></i><img src="'+i[s].iconUrl+'" /></dt><dd><p class="lines"></p><p searchName="'+i[s].productName+'" class="p1">'+i[s].productName+'</p><p class="p2">'+i[s].productType+"</p></dd>",n+="</dl>"):n+="<dl dataid="+i[s].productId+'><dt><img src="'+i[s].iconUrl+'" /></dt><dd><p class="lines"></p><p searchName="'+i[s].productName+'" class="p1">'+i[s].productName+'</p><p class="p2">'+i[s].productType+"</p></dd></dl>":1==i.length&&(n+="<dl dataid="+i[s].productId+'><dt><img src="'+i[s].iconUrl+'" /></dt><dd><p class="lines"></p><p searchName="'+i[s].productName+'" class="p1">'+i[s].productName+'</p><p class="p2">'+i[s].productType+"</p></dd></dl>",n+='<div class="end"></div>');n+="</li></ul>"}o&&(n+='<div class="watch-all"><a href="javascript:;">点击查看所有<span id="brand">'+d+"</span>的产品</a></div>"),$(".con").append(n),h.scroll(),wpCommon.viewShow(),l()}function l(){$(".con dl ").on("click",function(){var t=$(this).attr("dataid"),e=$(this).attr("searchName");localStorage.setItem("searchName",e),window.location.href="detail.html?pageId=H5_A008&type=1&productId="+t})}function i(){var t=0;return $.each(arguments,function(e,a){t+=1*$(a).height()}),document.documentElement.clientHeight-t}var s=1,c=!0,o=!1;WPBridge.callMethod("JsInvokeNative","wpShowLoadingDialog",{},function(){}),window.aesFail="";localStorage.getItem("brandid");var r,n,d=localStorage.getItem("brandname"),p=JSON.parse(localStorage.getItem("categoryId"));$(".top div").html(d),t();new Array;var u={getMes:function(l){e();WPBridge.callMethod("JsInvokeNative","wpEncrypt",{key:key,params:r},function(e){codeValue=e.data.result;var l=codeValue.slice(2);$.ajax({type:"post",url:wpCommon.Url+"/wpwl/scan/listProductByCategoryIds",traditional:!0,data:{pageNow:codeValue[0],pageSize:codeValue[1],categoryIdList:l},success:function(e){if("AES加密解密失败"==e.errMsg)aesFail||(t(),aesFail=!0);else{var l=e.data;1==s?l.length<4?(o=!0,1==l.length?a(l,1):a(l,2)):(a(l,2),s++):l.length<4?(o=!0,a(l,2)):(a(l,2),s++),c=!0}}})})}};$(".search").click(function(){document.activeElement.blur(),window.location.href="search.html?pageId=H5_A000"}),$(".con").on("click","ul .more",function(){var t=$(this).attr("resultName"),e=$(this).attr("resultid");localStorage.setItem("resultName",t),localStorage.setItem("resultid",e),window.location.href="result.html?pageId=H5_A007&otherId="+e}),$(".con").on("click","ul .bgRight",function(){var t=$(this).attr("resultName"),e=$(this).attr("resultid");localStorage.setItem("resultName",t),localStorage.setItem("resultid",e),window.location.href="result.html?pageId=H5_A007&otherId="+e}),$("#back").click(function(){WPBridge.callMethod("JsInvokeNative","wpFinishH5",{},"")}),$(document).on("click",".watch-all",function(){window.location.href="list.html"}),myScroll=new IScroll("#content",{click:!0,fixedScrollbar:!0,disableTouch:!1,disablePointer:!0,mouseWheel:!0,disableMouse:!1,scrollBars:!0,probeType:3}),myScroll.on("scroll",function(){if(this.y>=0)$(".backG").hide(),$(".ul").eq(0).find(".listTitle").css({position:"relative",top:"0rem",zIndex:1});else{var t=this,e=$(".ul").height();$(".ul").each(function(a){Math.abs(t.y)>a*e&&Math.abs(t.y)<(a+1)*e?($(this).find(".backG").show(),0==a?$(this).find(".listTitle").css({position:"fixed",zIndex:1e8,top:Math.abs(t.y)-12+"px",background:"white"}):$(this).find(".listTitle").css({position:"fixed",zIndex:1e8,top:Math.abs(t.y)-1+"px",background:"white"})):($(this).find(".backG").hide(),$(this).find(".listTitle").css({position:"relative",zIndex:1,top:0}))})}}),myScroll.on("scrollEnd",function(){Math.abs(myScroll.y)>Math.abs(myScroll.maxScrollY+15)&&!o&&c&&(c=!1,u.getMes())}),document.addEventListener("touchmove",function(t){t.preventDefault()},!1);var h={scroll:function(){var t=i("#head",".search");$("#content").css("height",t+"px"),myScroll.refresh()}}});