$(function(){
	var addIdArr=[];
	var addNameArr=[];
	WPBridge.callMethod("JsInvokeNative", "wpShowLoadingDialog", {},function() {});	
	//加密getKey(params,sus)params是需要加密的参数
//	var orgId=getUrlRequest().orgId;
/*	function getKey(params){
		$.ajax({
			url:wpCommon.Url+"/wpwl/getKey",
			type:'post',
			success:function(res){
				key=res.data;
				getData(params);
			}
		})
	}
	getKey(orgId);*/
	wpCommon.viewShow();
	getData();
	function getData(params){		
//		WPBridge.callMethod("JsInvokeNative", "wpEncrypt", {
//			key: key,
//			params: [params]
//		},function(msg){
			$.ajax({
				url:"JSON/add_product.json",
				type:"get",
				timeout:10000,
				success:function(res){
					if(res.errMsg == "AES加密解密失败"){
//						if(!keyFlag){
//							getKey(params);
//							keyFlag=true;
//						}
					}else if(res.success==false){
						$("#content").hide();
						$(".loading").show();
						$(".middle img").attr('src',"images/error_else.png");
						$(".middle p").html("出错了，请稍后再试");
//						wpCommon.viewShow();
					}else{
						try{
							if(res.success){
								addData= res.data;
								for(var i=0;i<addData.length;i++){
									var category=addData[i].categoryValues;
									var str="";
									str+='<p class="com series">'+addData[i].categoryName+'</p>'
									str+='<ul class="conts">'
									for(var j=0;j<category.length;j++){
										//清除json中的空格在存储
										var pro=category[j].proName;
										proN=pro.replace(/\s/g,'')
										str+='<li class="com cont" productId='+category[j].proId+' productName='+proN+'>'+category[j].proName+'</li>'	
									}
									str+='</ul>'
									$(".content-cont").append(str);
								}
							}
						}catch(e){
							$("#content").hide();
							$(".loading").show();
							$(".middle img").attr('src',"images/error_else.png");
							$(".middle p").html("出错了，请稍后再试");
							$(".top div").html("异常页面")
						}
//						wpCommon.viewShow();
					}
				},
				error:function(jqXHR, textStatus, errorThrown){
					if(textStatus=="timeout"){
						$("#content").hide();
						$(".loading").show();
						$(".loading").show();
						$(".top div").html("网络异常")
					}
//					wpCommon.viewShow();
				}
			})
//		})		
	}
	//点击li跳转变色
	$("#content").on("click",".cont",function(){	
		//如果productId已经存储就进入if
		if(localStorage.getItem("productId")){
			addIdArr=JSON.parse(localStorage.getItem("productId"));
			addIdArr.push($(this).attr("productId"));
			addNameArr=JSON.parse(localStorage.getItem("productName"))
			addNameArr.push($(this).attr("productName"));
		}else{
			addIdArr.push($(this).attr("productId"));
			addNameArr.push($(this).attr("productName"));
//			alert(JSON.stringify(addNameArr))
		}
		addNameArr=unique(addNameArr);//去重的产品名
		addIdArr=unique(addIdArr);//去重的产品id
		localStorage.setItem("productId",JSON.stringify(addIdArr));
		localStorage.setItem("productName",JSON.stringify(addNameArr));
		//去重
		function unique(arr){
		    var newArr = [];//新建一个数组
		    for(var i=0,len=arr.length;i<len;i++){
		        if(newArr.indexOf(arr[i]) == -1){//若新数组中未包含该项则将其存入新数组
		          newArr.push(arr[i]);
		      	}
		    }
		    return newArr;
		}    
		$(this).css("background","#f5f5f5");
		window.location.href="product_item.html"					
	})
	//返回上一页
	$("#back").click(function(){
		WPBridge.callMethod('JsInvokeNative','wpH5Back',{},'');
	})
	//点击重新加载
	/*$("#wpReload").click(function(){
		getData();
		getKey(workOrder,cId);
	})*/
})
