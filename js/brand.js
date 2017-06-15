$(function(){
	//加密时获取key值。
	WPBridge.callMethod("JsInvokeNative", "wpShowLoadingDialog", {},function() {});
	window.aseFail = "";
	var key;
	var brandTimer=null;
	var brandCount=0;//1秒触发的次数
	//获取url中的信息
	var urlRequest=getUrlRequest();
	var deviceUUID=urlRequest.deviceUUID || '';//用户设备id	
	if(!deviceUUID){
		try{
			WPBridge.callMethod('JsInvokeNative','wpGetDeviceUUID',{},function(msg) {
				deviceUUID=msg.data.result;
			});
		}catch(e){
			deviceUUID='';
		}	
	}
	$.ajax({
		url:wpCommon.Url+'/wpwl/getKey',
		type:"get",
		dataType:'json',
		success:function(res){
			key = res.data;
			localStorage.setItem('key',res.data);
			brandTimer=setInterval(function(){
				if(deviceUUID || brandCount>=34){
					clearInterval(brandTimer)
					brand(key);
				}
				brandCount++;
			},30)
					
		}
	})
	function brand(key){
		WPBridge.callMethod("JsInvokeNative","wpEncrypt",{key:key,params:["zh",deviceUUID]},function(msg){codeValue=msg.data.result;	
			$.ajax({
				type:"post",
				url:wpCommon.Url+"/wpwl/brand/findAllBrand",
				async:true,
				data:{
					oversea:codeValue[0].trim(),
					deviceUUID:codeValue[1]
				},
				timeout:10000,
				success:function(data){
					if(data.errMsg == "AES加密解密失败"){
						if(!aseFail){
							$.ajax({
								type:"post",
								url:wpCommon.Url+'/wpwl/getKey',
								success:function(res){
									key = res.data;
									localStorage.setItem('key',res.data)
									brand(key);
								}
							})
							aseFail=true;
						}
					}else{
						if(data.success==false){
							$(".loading").show();
							$("#content").hide();
							$(".middle img").attr('src', "images/error_else.png");
							$(".middle p").html("出错了，请稍后再试");
							$(".all").html("页面异常");
							wpCommon.viewShow();
						}else{
							try{
								if(data.success){
									var str="";
									var mess=data.data;
									for(var j in mess){
										var mes=mess[j].brandVOList;
										if(mes.length == 0){
											continue;
										}
										//颜色
										var key = mess[j].breadTypeValue;
										str+="<div class='contents'>"
										str+='<div class="head">'
										str+='<p class="expensive" style="color:'+getColor(key)+'" ><img class="imgLeft" src="images/'+key+'.png" />'+mess[j].breadTypeName+'</p></div>'			
										for(var k in mes){					
											str+='<div class="cont">'
											str+='<dl class="dl" brandname="'+mes[k].brandName+'" brandid="'+mes[k].id+'">'
											if(mes[k].iconUrl){
												str+='<dt class="dt"><img class="brandImg" src="'+mes[k].iconUrl+'" /></dt>'
											}else{
												str+='<dt class="dt"><img class="brandImg" src="images/default_error2.png" /></dt>'
											}
											str+='<dd class="dd">'
											str+="<div class='dds'><p class='brand'>"+mes[k].brandName+"</p>"
											str+="<p class='num'>"+mes[k].brandCount+"个宝贝</p>"
											str+="<p class='starTime'>最近更新："+mes[k].gmtModified+"</p></div>"
											str+='<a href="javascript:;" class="right"></a>'
											//判断是否是新品牌1是新品牌，0是老品牌。
											if(mes[k].isNewBrand=="1"){
												str+='<div class="new">NEW</div>'
											}else if(mes[k].isNewBrand=="0"){
												str+=''
											}
											str+='</dd>'
											str+='</dl>'
											str+='</div>'				
										}
										str+="</div>"				
									}
									$(".list-good").html(str);
									Iscroll.scroll();
									$("#content").on("click","dl",function(){
										var that=$(this);
										setTimeout(function(){
											that.find(".new").hide();
										},500)
										
										var brandId=$(this).attr("brandid");
										var brandName=$(this).attr("brandname");
										localStorage.setItem("brandid",brandId)
										localStorage.setItem("brandname",brandName)
										window.location.href="list.html?pageId=H5_A006&otherId="+brandId;
									})										
								}
							}catch(e){
								$(".loading").show();
								$("#content").hide();
								$(".middle img").attr('src', "images/error_else.png");
								$(".middle p").html("出错了，请稍后再试");
								$(".all").html("页面异常");
							}
						}
						wpCommon.viewShow();
					}	    
				},
				error:function(jqXHR, textStatus, errorThrown){
					if(textStatus=="timeout"){
		            	$(".loading").show();
		            	$("#content").hide();
		            	$(".all").html("网络异常");
		            }
		            WPBridge.callMethod("JsInvokeNative", "wpShowWebView", {},
		            function() {});
		            WPBridge.callMethod("JsInvokeNative", "wpDismissLoadingDialog", {},
		            function() {});
		            WPBridge.callMethod("JsInvokeNative", "wpNetError", {url:wpCommon.Url+"/h5/brand.html"},
		            function() {});
				}
			})
		});
	}
})
$(function(){
	$(".goback").on("touchstart",function() {
        WPBridge.callMethod("JsInvokeNative", "wpFinishH5", {},
        function() {})
    });
/*    $("#wpReload").click(function(){
    	brand(key)
    })*/
})
//iscroll方法
$(function(){	
   	myScroll = new IScroll( "#content",{
   		click:true,
   		fixedScrollbar:true,
		disableTouch: false,
        disablePointer: true,
        mouseWheel: true,
        disableMouse: false,
        scrollBars: true
   	});
})
	function contextHeight(){
		var hight=0;
		$.each(arguments, function(inx,obj) {
			hight+=$(obj).height()*1;	
		});
		return document.documentElement.clientHeight-hight;
	}
	var Iscroll={
		scroll:function(){
			//arguments是要减去的参数例如head,search.
			var wholeHei=contextHeight('#header');
			$("#content").css({
				"height":wholeHei+'px',	
			});
			myScroll.refresh();
		}
	}
	//字体颜色
	function getColor(key){
		var result = "";
		switch(key){		
			case "102701" : 
				result="#e5ae19";
				break;
			case "102702" : 
				result="#fd8317";
				break;
			case "102703" : 
				result="#5f7dff";
				break;
			case "102704" : 
				result="#ff3552";
				break;
			case "102705" : 
				result="#fd8317";
				break;
			case "102706" : 
				result="#ff3552";
				break;
			case "102707" : 
				result="#5f7dff";
				break;
			case "102708" : 
				result="#ff3552";
				break;
			case "102709" : 
				result="#fd8317";
				break;
			case "102710" : 
				result="#5f7dff";
				break;
			case "102711" : 
				result="#5f7dff";
				break;
			case "102712" : 
				result="#fd8317";
				break;
			case "102713" : 
				result="#ff3552";
				break;
			case "102714" : 
				result="#fd8317";
				break;	
			default:
				result="#e51a9";
				break;
		}	
		return result;
	}
