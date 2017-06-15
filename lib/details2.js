		window.userId='';
		window.noGoods='';
		window.netError = "";
		window.aesFail = [0,0,0];
		WPBridge.callMethod("JsInvokeNative","wpShowLoadingDialog",{},function(){});
		$("#back").on("touchstart",function(){
			if(!getUrlRequest().productId){
				WPBridge.callMethod('JsInvokeNative','wpH5Back',{},function(){});
			}else {
				WPBridge.callMethod('JsInvokeNative','wpFinishH5',{},function(){});
			}		
		})
			
		function toggleObj(clickObj,elements,changObj){
			$(clickObj).click(function(){
				$(elements).css("display",changObj);
				if(clickObj=="#sure"){
					$('video').show().get(0).play();
				}
			})	
		}
		//流畅滑动
		 $(function(){	
	 		myScroll = new IScroll( "#content",{
		 		click:true,
		 		fixedScrollbar:true,
		 		disableTouch:false,
				disablePointer:true,
				mouseWheel:true
		 	});
		 	myScroll.on("scrollEnd",function(e){
		 		if(this.y<-200){
		 			$("#backTop").show();
		 		}else{
		 			$("#backTop").hide();
		 		}
		 		if((this.y <=this.maxScrollY) && (this.pointY <14)){
		 			this.scrollTo(0, this.maxScrollY, 400);
		 		}
		 		if($('#detail_btn').hasClass('selected')){
		 			lazyLoad('.detail_area img:visible')
		 		}else{
		 			lazyLoad('.play_area img:visible')
		 		}
		 	})
		 	window.winHei=$(window).height();
		 })
		 //懒加载
		 function lazyLoad(obj,top){
			$(obj).each(function(){
				var $t=$(this)
				if($t.attr('rsrc')!==$t.prop('src')){
					if($t.offset().top<=winHei+200){
						$t.prop('src',$t.attr('rsrc'));
					}
				}
			})
		}
		 function getKey(userFlag,isPlay){
		 	$.ajax({
				url:wpCommon.Url+'/wpwl/getKey',
				data:{
					versionId:"27"
				},
				success:function(res){
					key=res.data;
					if(userFlag){
						WPBridge.callMethod('JsInvokeNative','wpGetUserId',{},function(msg){
							if(msg.data.result!=''){
								userId=msg.data.result;
								WPBridge.callMethod('JsInvokeNative','wpEncrypt',{key:key,params:[userId]},function(msg){window.aesUserId=msg.data.result[0];})	
							}
						})
					}else if(!isPlay){
						wpwlDetails.getData(key);	
					}
					localStorage.setItem('key',res.data);	
				}
			})
		 }
		//判断是否从商品列表中进入详情页
		$(function(){
			if(!getUrlRequest().productId){
				window.productInfo=JSON.parse(localStorage.getItem('productDetails'));
				window.key=localStorage.getItem("key");
				window.prtId=productInfo.productDetails.productId;
				WPBridge.callMethod("JsInvokeNative","wpEncrypt",{key:key,params:[prtId]},function(msg){window.parValue=msg.data.result[0]});
				try{
					wpwlDetails.autoPlay();
					if(productInfo.detailType){
						if(productInfo.detailType=='0'){
							wpwlDetails.brandShow();
							wpwlDetails.special();
							$(".block").show();
							wpwlDetails.paras();
							$("footer").removeClass("hide");
							$(".nearby_shop").hide();
						}else if(productInfo.detailType=='1'){
							$(".block").show();
							$(".detail_imgText").hide();
							$('footer').hide();
							wpwlDetails.paras();
							wpwlDetails.longImg(productInfo.detailPicData,$(".detail_longImg"),'dLongImg-swipebox','detailPicUrl')
						}
					}else{
						wpwlDetails.brandShow();
						wpwlDetails.special();
						$(".block").show();
						wpwlDetails.paras();
						$("footer").removeClass("hide");
						$(".nearby_shop").hide();
					}
					wpwlDetails.scroll();
					wpwlDetails.finish()
				}catch(e){
					$("#content").hide();
					$("footer").hide();
					//$(".btn").hide().siblings(".like").hide().siblings(".share").hide();
					$(".loading").show().css("height", wholeHei + "px").find("img").attr("src", "images/error_else.png").siblings("p").html("出错了，请稍后再试");
					wpCommon.viewShow();
				}
				
			}else {			
				window.prtId=getUrlRequest().productId;
				getKey();
			}
		})

		//details中的各种方法
		var wpwlDetails={
			getData:function(value){
				var that=this;
				var block=$(".block");
				var loading=$(".loading");
				var footer=$("footer");
				window.prtId=getUrlRequest().productId;
//				var keyValue=localStorage.getItem('key');
				WPBridge.callMethod("JsInvokeNative","wpEncrypt",{key:value,params:[prtId]},function(msg){parValue=msg.data.result[0];
					$.ajax({
						url:wpCommon.Url+"/wpwl/product/productInfo",
						type:"post",
						data:{
							productId:parValue,
							versionId:'27'
						},
						timeout:10000,
						success:function(res){
							if(res.errMsg=="AES加密解密失败"){
								if(!that.aesFail) {
									that.aesFail = true;
									getKey();
									$("#content").hide();
									$("footer").hide();
									//$(".btn").hide().siblings(".like").hide().siblings(".share").hide();
									$(".loading").show().css("height", wholeHei + "px").find("img").attr("src", "images/error_else.png").siblings("p").html("出错了，请稍后再试");
									wpCommon.viewShow()
								}
							}else if(res.errMsg=="找不到指定的产品，请稍后再试，谢谢！"||res.errMsg=="找不到指定的产品"){
								window.noGoods=true;
								$("#content").hide();
								$('footer').hide();
								$(".btn").hide().siblings(".like").hide().siblings(".share").hide();
								$(".loading").show().css("height", wholeHei+ "px").find("img").attr("src", "images/notFound.png").siblings("p").html("该产品已下架");
								wpCommon.viewShow();
							}else {
								
								footer.removeClass("hide");
//								loading.hide();
								window.productInfo=res.data;
								try{
									window.productInfo = res.data;
									wpwlDetails.autoPlay();
									if(productInfo.detailType){
										if(productInfo.detailType=='0'){
											block.show();
											footer.removeClass("hide");
											wpwlDetails.paras();
											wpwlDetails.brandShow();
											wpwlDetails.special();
										}else if(productInfo.detailType=='1'){
											block.show();
											$(".detail_imgText").hide();
											$('footer').hide();
											wpwlDetails.paras();
											wpwlDetails.longImg(productInfo.detailPicData,$(".detail_longImg"),'dLongImg-swipebox','detailPicUrl')
										}
									}else{
										block.show();
										footer.removeClass("hide");
										wpwlDetails.paras();
										wpwlDetails.brandShow();
										wpwlDetails.special();
									}
									wpwlDetails.scroll();
									wpwlDetails.finish();
									lazyLoad('.detail_area img:visible')
								}catch(e){
									$("#content").hide();
									$("footer").hide();
									//$(".btn").hide().siblings(".like").hide().siblings(".share").hide();
									$(".loading").show().css("height", wholeHei + "px").find("img").attr("src", "images/error_else.png").siblings("p").html("出错了，请稍后再试");
									wpCommon.viewShow();
								}	
							}							
						},
						error:function(jqXHR, textStatus, errorThrown){
			              	wpCommon.viewShow();
			              	$("#content").hide();
							footer.hide();
			              	$(".btn").hide().siblings(".like").hide().siblings(".share").hide();
			              	$(".loading").show().css("height", wholeHei + "px").find("img").attr("src", "images/error_else.png").siblings("p").html("出错了，请稍后再试");
							WPBridge.callMethod("JsInvokeNative", "wpNetError", {
								"url": wpCommon.Url+"/h5/details.html?productId=" + prtId
							}, function() {})
				        }
					})
				})
			},
			//轮播图部分
			autoPlay:function(){
				var bigImgUrl=productInfo.productDetails.productUrls;
//				if(productInfo.productDetails.playUrl){
//					var videoUrl=productInfo.productDetails.playUrl;
//					var str="<div style='width:100%;height:100%' class='videoWrap'><video style='display:none' src="+src+" preload='none' webkit-playsinline='true' controls='controls'></video><p></p></div>";				
//					for(var i=0;i<bigImgUrl.length+1;i++){
//						var ele=$(".swiper-slide").eq(0).clone();
//						if(i>=1){
//							ele.css('display','block').find('img').attr('src',bigImgUrl[i-1]).parents('a').attr("href",bigImgUrl[i-1]).addClass('big-swipebox');
//						}else{
//							ele.css('display','block').find('img').attr('src',bigImgUrl[i]).parents('a').attr("href","javascript:;").append(str);
//						}
//						$(".swiper-wrapper").append(ele);
//					}
//					setTimeout(function(){
//						mySwiper = new Swiper ('.swiper-container', {
//							pagination: '.swiper-pagination',
//							paginationClickable: true,
//							autoplayDisableOnInteraction:false
//						})
//					},0)
//				}else{
//					for(var i=0;i<bigImgUrl.length+1;i++){
//						var ele=$(".swiper-slide").eq(0).clone();
//						ele.css('display','block').find('img').attr('src',bigImgUrl[i]).parents('a').attr("href",bigImgUrl[i]).addClass('big-swipebox');
//						$(".swiper-wrapper").append(ele);
//					}
//					setTimeout(function(){
//						mySwiper = new Swiper ('.swiper-container', {
//							autoPlay:'2000',
//							pagination: '.swiper-pagination',
//							paginationClickable: true,
//							autoplayDisableOnInteraction:false
//						})
//					},0)

//				}

				var src="1.mp4";
				var str="<div style='width:100%;height:100%' class='videoWrap'><video style='display:none' src="+src+" preload='none' webkit-playsinline='true' controls='controls'></video><p></p></div>";				
//				var str="<video src="+src+" style='display:block' preload='none'></video>";
				for(var i=0;i<bigImgUrl.length+1;i++){
					var ele=$(".swiper-slide").eq(0).clone();
					if(i>=1){
						ele.css('display','block').find('img').attr('src',bigImgUrl[i-1]).parents('a').attr("href",bigImgUrl[i-1]).addClass('big-swipebox');
					}else{
						ele.css('display','block').find('img').attr('src',bigImgUrl[i]).parents('a').attr("href","javascript:;").append(str);
					}
					$(".swiper-wrapper").append(ele);
				}
				$(".videoWrap p").on('click',function(){
					$(".videoWrap").css('opacity',1);	
					WPBridge.callMethod("JsInvokeNative","wpNetwork",{},function(msg){
						if(msg.data.result=='2'){
							$('video').show().get(0).play();
						}
						if(msg.data.result=='1'){
							$("#smark").css('display','block')
							$("#modal").css('display','block')
						}
					});
//					$.ajax({
//						url:wpCommon.Url+'/wpwl/productVideo/playCount',
//						type:'post',
//						data:{
//							productId:parValue
//						},
//						success:function(){
//							
//						}
//					})
					//alert('是否要继续播放')
//					$("#smark").css('display','block')
//					$("#modal").css('display','block')
				})
				toggleObj("#cancle","#modal","none");
				toggleObj("#cancle","#smark","none");
				toggleObj("#sure","#modal","none");
				toggleObj("#sure","#smark","none");
				video=document.getElementsByTagName('video')[0];
				video.addEventListener('ended', function (e) {
				// 播放结束时触发
				})
				$("video").on('touchstart',function(){
					video.pause();
				})
//				$("video").get(0).addEventListener('play',function(){
//					WPBridge.callMethod("JsInvokeNative","wpNetwork",{},function(msg){
//						if(msg.data.result=='1'){
//							$("#smark").css('display','block')
//							$("#modal").css('display','block')
//						}
//					});
//				})		
				$(".big-swipebox").swipebox();
				$(".big-swipebox").on("click",function(){
					WPBridge.callMethod("JsInvokeNative","wpBackListener",{back:false},function(){
						$("#swipebox-close").click();	
					});
					WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e027"},function(){});
				})
				
				setTimeout(function(){
					mySwiper = new Swiper ('.swiper-container', {
						pagination: '.swiper-pagination',
						paginationClickable: true,
						autoplayDisableOnInteraction:false
					})
				},0)
				$("#product_name span").html(productInfo.productDetails.productName).parents("#product_name").siblings("#product_des").html(productInfo.productDetails.featureDesc);
				if(localStorage.getItem("productGoodsInfo")&&getUrlRequest().productId==undefined){
					var productGoodsInfo=JSON.parse(localStorage.getItem("productGoodsInfo"));
					var codeDoc=productGoodsInfo.specialCodeDoc;
					if(productGoodsInfo.specialCodeDoc!=""&&productGoodsInfo.customerName!=""){
						$('.product p').show().find('strong').html(codeDoc.slice(codeDoc.indexOf("*")+1,codeDoc.lastIndexOf("*")));
						$("#customerName").html(productGoodsInfo.customerName);
					}else if(productGoodsInfo.customerName==""&&productGoodsInfo.specialCodeDoc!=""){
						$(".product p").eq(0).show().find("strong").html(codeDoc.slice(codeDoc.indexOf("*")+1,codeDoc.lastIndexOf("*")));
						$("#customerName").html(productGoodsInfo.customerName);
					}
				}
			},
			paras:function(){
				var params=productInfo.productParams.paramList;
				var lock=1;
				var offHei=$(".para_name").eq(0).get(0).offsetHeight;
				$(".para_result").css("height",offHei+"px");
				
				$(".para_result a").eq(0).html(productInfo.productParams.standard).css("color",'#333');
				for(var i=0;i<params.length;i++){
					var ele=$(".para_items").eq(0).clone();
					// ele.css('display','block').children('img').attr('src',productInfo.productDetails.productUrls[i]);
					var ele2=ele.find('.para_name').html(params[i].name).siblings('.para_result');
					
					if(params[i].type==4){
						var src=params[i].value;
						ele2.find('a').css("color","#19a4fa").attr("id","outerLink").html(params[i].valueName).attr({
							"href":"javascript:;",
							'link':src
						})
					}else if(params[i].type==3){
						var value=params[i].value;
						ele2.find('a').html(params[i].value).css("color","#19a4fa").on("touchstart",function(){
							WPBridge.callMethod("JsInvokeNative","wpUpCallTel",{tel:value},function(){})
						})
					}else if(params[i].type==1){
						var dropText='';
						var iconEle="<i class='bg-icon dropText' style='background-position:-1.92rem 0rem;right:0;top:-0.2rem'></i>";
						for(var k=0;k<params[i].value.length;k++){
							dropText+="<p class='noFloat' style='float:none;width:100%'>"+params[i].value[k]+"</p>";
						}
						ele2.find('div').css({width:"100%"}).html(dropText).append(iconEle);
					}
					else ele2.find('p').html(params[i].value);
					$(".parameters").append(ele);
				}
				for(var i=0;i<params.length+1;i++){
					if($(".para_result").eq(i).find('div').get(0).offsetHeight>$(".para_result").eq(i).get(0).offsetHeight){
						if($(".para_result").eq(i).find('p').attr('class')!='noFloat'){
							var bigHei=$(".para_result").eq(i).find('div').get(0).offsetHeight;
							var smallHei=$(".para_result").eq(i).get(0).offsetHeight;
							var times=bigHei/smallHei;
							var result=$(".para_result").eq(i).find("div");
							result.css({"width":150*times+"%"})
							function loop(){
								result.addClass('play').css('left',-130*times/2+"%")
							}
							loop();
							setInterval(loop,5000)
							var autoP=result.eq(i).find("p").css("whiteSpace","nowrap").clone();
							autoP.appendTo(result.eq(i).find("div"));
						}	
					}	
					
				}
				$(".dropText").on("touchstart",function(){
					var length=$(this).siblings('p').length;
					var pHei=$(this).siblings('p').eq(0).get(0).offsetHeight;
					if(lock){
						WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e010"},function(){})
						$(this).css('background-position','-2.56rem 0').parents('.para_result').css("height",pHei*(length)+'px')
						lock=0;
					}else {
						$(this).css('background-position','-1.92rem 0').parents('.para_result').css("height",offHei+"px")
						lock=1;
					}
				})
			},
			brandShow:function(){
				var brandInfo=productInfo.brand;
				$("#brand_img").attr('src',brandInfo.brandIcon);
				$("#brand_name").html(brandInfo.brandName);
			},
			special:function(){
				if(productInfo.productSpecList){
					var data=productInfo.productSpecList;
					for(var j=0;j<data.length;j++){
						var ele=$(".special_block").eq(0).clone();
						ele.find(".bigImg").attr("rsrc",data[j].bigImg).parents("a").attr("href",data[j].bigImg).addClass("spec-swipebox");
						var spec=data[j].detail;
						var length=spec.length;
						for(var i=0;i<length;i++){
							var ele2=ele.find(".special_intro").eq(0).clone();
							ele2.find('h4 span').html(spec[i].title);
							ele2.find("p").css("color",'#666').html(spec[i].intro.replace(/\r/g, "<br/>"));
							ele2.find('img').attr('rsrc',spec[i].smallImg).parents('a').attr("href",spec[i].smallImg).addClass("spec-swipebox");
							ele2.css("display","block");
							ele.append(ele2);
						}
						ele.show();
						$(".features").append(ele);
					}
					$(".features").show();
					$(".spec-swipebox").swipebox();
					$(".spec-swipebox").on("click",function(){
						WPBridge.callMethod("JsInvokeNative","wpBackListener",{back:false},function(){
							$("#swipebox-close").click();	
						});
						WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e025"},function(){});
					})
				}	
			},
			longImg:function(picData,obj,name,picUrl){
				if(picData){
					obj.show();
					var imgArea=obj;
					var type;
					var wid=document.documentElement.clientWidth;
					if(wid<=240){
						type="_480.";
					}else if(wid<=360){
						type="_720."
					}else{
						type="_1080.";
					}

					for(var i=0;i<picData.length;i++){
						var imgEle=obj.find('.longPic').eq(0).clone();
						imgEle.find('img').css({
							'width':'100%',
							'height':picData[i].height/picData[i].width*wid+'px'
						}).attr('rsrc',picData[i][picUrl]).parent('a').attr('href',picData[i][picUrl]).addClass(name)
						imgEle.show();
						imgArea.append(imgEle)
					}
					$("."+name).swipebox();
					$("."+name).on("click", function() {
						WPBridge.callMethod("JsInvokeNative", "wpBackListener", {
							back: false
						}, function() {
							$("#swipebox-close").click()
						});
					});
					lazyLoad(obj.find('img:visible'))
				}
			},
			scroll:function(){
				$("#content").css("height",wholeHei+'px');
				$(".loading").css("height",wholeHei+'px');
				myScroll.refresh();
				 var strRegex = "^((https|http|ftp|rtsp|mms)?://)"
						        + "?(([0-9a-z_!~*'().&=+$%-]+: )?[0-9a-z_!~*'().&=+$%-]+@)?" //ftp的user@
						        + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184
						        + "|" // 允许IP和DOMAIN（域名）
						        + "([0-9a-z_!~*'()-]+\.)*" // 域名- www.
						        + "([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\." // 二级域名
						        + "[a-z]{2,6})" // first level domain- .com or .museum
						        + "(:[0-9]{1,4})?" // 端口- :80
						        + "((/?)|" // a slash isn't required if there is no file name
						        + "(/[0-9a-z_!~*'().;?:@&=+$,%#-]+)+/?)$";
						        var re=new RegExp(strRegex);
				$("#outerLink").on("touchstart",function(e){
					if(re.test($(this).attr('link'))){
						WPBridge.callMethod('JsInvokeNative','wpDetailsHttp',{url:$(this).attr('link'),valueName:$(this).html()},function(){})		
					}
					
				})
			},
			finish:function(){
				WPBridge.callMethod('JsInvokeNative','wpGetUserId',{},function(msg){
					if(msg.data.result!=""){//已登录
						
						window.userId=msg.data.result;
						WPBridge.callMethod('JsInvokeNative','wpIsLiked',{productId:prtId},function(msg){
							if(msg.data.result!='false'){
								$(".like").addClass('liked');	
							}
						})
						WPBridge.callMethod('JsInvokeNative','wpEncrypt',{key:key,params:[userId]},function(msg){window.aesUserId=msg.data.result[0];})		
					}
					wpCommon.viewShow()
				})
				$("img").each(function() {
					var b = $.Deferred();
					$(this).bind("load", function() {
						b.resolve()
					}).bind("error", function() {
						$(this).attr("src", "images/default_error2.png")
					})
				})
			}
		}
		$(function(){
			//网络异常重新加载
			$("#wpReload").on("touchstart",function(){
				getData();
			})
			
			//阻止ios手指滑动会触发iscroll
			$("footer").on("touchmove",function(){
				return false;
			})
			//产品参数部分
			for(var i=0;i<4;i++){
				var ele=$(".para_name").eq(0).clone();
				ele.css('display','block').children('.para_name').html('');
				$(".parameters").append();
			}
			//	回到顶部
			$("#backTop").on("touchend",function(e){
				if($("footer")[0].className=='hide'){
					WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e038",otherId:''},function(){});
				}else {
					WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e011",otherId:''},function(){});
				}
				myScroll.scrollTo(0,0,1000, IScroll.utils.ease.circular);
				e.preventDefault();
			})
			//查看更多
			window.moreLock=null;
			window.isMore=true;
			 $("#watchMore").on("touchstart", function () {
		        if (moreLock) {
		            moreLock = false;
		            setTimeout(function () {
		                moreLock = true
		            }, 1000);
		            if (userId != "") {
		                if (isMore) {
		                    WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
		                        eventId: "h5_e013"
		                    }, function () {});
		                    consultContent(1, 5, true)
		                } else {
		                    if (isMore == false) {
		                        WPBridge.callMethod("JsInvokeNative", "wpShowToast", {
		                            message: "没有更多"
		                        }, function () {});
		                        WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
		                            eventId: "h5_e013"
		                        }, function () {})
		                    }
		                }
		            } else {
		                consultContent(1, 5, true, "no")
		            }
		        }
		    });
			
			var flag=1;
			var lock=1;
			$("#consultant").on("touchstart",function(e){
				if(flag){
					WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e012"},function(){})
					if(userId==""){
						consultContent(1,4,true,'no')
					}else {
						if(lock){
							consultContent(1,4,true);	
							lock=0;
						}else {
							$(".cst_area").addClass("myShow");
						}
					}
					flag=0;
				}else {	
					$(".cst_area").removeClass("myShow");
					flag=1;
				}
				$("#consultant i").toggleClass("drop");
				$(".cst_item").toggleClass("ani");
			})	
		})


		//
			$("#smark").on('touchmove',function(){
				return false;
			})
		//切换玩转和详情
		$(function(){
			var flag=1;
			var detailY=0,playY=0;
			$("#detail_btn").on("touchstart",function(){
				showDetail()
			})
			$("#play_btn").on("touchstart",function(){
				showPlay();
				
			})
			function GetSlideAngle(dx, dy) {  
            	return Math.atan2(dy, dx) * 180 / Math.PI;  
          }  
          //根据起点和终点返回方向 1：向上，2：向下，3：向左，4：向右,0：未滑动  
         	function GetSlideDirection(startX, startY, endX, endY) {  
		        var dy = startY - endY;  
		        var dx = endX - startX;  
		        var result = 0;  
              //如果滑动距离太短  
	            if(Math.abs(dx) < 50 && Math.abs(dy) < 50) {  
	                return result;  
	            }  
            	var angle = GetSlideAngle(dx, dy);  
            	if(angle >= -45 && angle < 45) {  
              		result = 1;  
          		}else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {  
              		result = 2;  
          		}  
             	return result;  
          	}    
   
	          //滑动处理  
          	var startX, startY;  
         	$("#content").get(0).addEventListener('touchstart',function (ev) {  
         		if(ev.target.className=="goods_pic"||ev.target.className=='videoWrap'||ev.target.tagName=='VIDEO'){
         			return false;
         		}
              	startX = ev.touches[0].pageX;  
             	startY = ev.touches[0].pageY;    
         	}, false);  

          	$("#content").get(0).addEventListener('touchend',function (ev) {  
              	var endX, endY;  
              	if(ev.target.className=="goods_pic"||ev.target.className=="top"||ev.target.tagName=='VIDEO'){
         			return false;
         		}
              	endX = ev.changedTouches[0].pageX;  
              	endY = ev.changedTouches[0].pageY;  
              	var direction = GetSlideDirection(startX, startY, endX, endY);  
              	switch(direction) {  
                  	case 2:  //左滑
						if($('footer').get(0).className=="hide"){
//							return;
						}
						else {
							showPlay();
						}
                      	break;  
                  	case 1:  //右滑
						if($('footer').get(0).className==""){
							return;
						}
						else {
							showDetail();
						}
                      break;        
              	}  
          	}, false);
          	function showPlay(){
          		if(!video.paused){
					video.pause()
				}
          		WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e009",otherId:prtId},function(){})
          		detailY=myScroll.y;
          		$("#play_btn").addClass('selected').siblings('.switch').removeClass('selected');
			  	$(".play_area").show().siblings('.area').hide();
			  	$('footer').removeClass().addClass("hide");
			  	myScroll.refresh();
			  	if(flag){
		  			getData();
		  			flag=0;
			  	}
			  	if(netError){
			  		$(".loading").show();
			  		if($(".loading").find('p').html()=="网络异常，点击"){
			  			WPBridge.callMethod("JsInvokeNative", "wpShowToast", {
							message: "网络不给力"
						}, function() {});
			  		}	
			  	}
			  	setTimeout(function(){
			  		myScroll.scrollTo(0,playY,100,IScroll.utils.ease.circular);
			  	},0);
          	}
          	function showDetail(){
          		playY=myScroll.y;	
          		$("#detail_btn").addClass('selected').siblings('.switch').removeClass('selected')
			  	$(".detail_area").show().siblings('.area').hide();
			  	$('footer').removeClass();
			  	if(netError||aesFail){
			  		$(".loading").hide();
			  	}
			  	myScroll.refresh();
			  	setTimeout(function(){
			  		myScroll.scrollTo(0,detailY,100,IScroll.utils.ease.circular);
			  	},0);
          	}
          	
		})


		//获取玩转信息
		function getData(){
      		WPBridge.callMethod('JsInvokeNative','wpShowLoadingDialog',{},function(){});
      		$.ajax({
      			url:wpCommon.Url+"/wpwl/product/getPlay",
      			type:"post",
      			data:{
      				id:parValue,
      				versionId:'27'
      			},
      			timeout:8000,
      			success:function(res){
      				if(res.errMsg=="AES加密解密失败"){
      					if(!(aesFail[0]%2)){
							aesFail[0]++;
							getKey('',true);
							getData();
							netError=true;
							$(".loading").show().css("height", wholeHei + "px").find("img").attr("src", "images/error_else.png").siblings("p").html("出错了，请稍后再试");
							wpCommon.viewShow()
						}
      				}else if(noGoods==true){         					
						$("#content").hide();
						$('footer').hide();
						$(".loading").show().css("height",wholeHei+"px");
						wpCommon.viewShow()
					}else {
          				try{
          					$(".loading").hide();
          					if(res.data.playType){
          						if(res.data.playType=='0'){
	          						playText();
	          					}else if(res.data.playType=='1'){
	          						$(".play_imgText").hide();
	          						var picData=res.data.playPicDetail;
									wpwlDetails.longImg(picData,$('.play_longImg'),'pLongImg-swipebox','playPicUrl')
									wpwlDetails.scroll()
	          					}
          					}else{
          						playText()
          					}
          					function playText(){
          						var data=res.data.list;
		          				netError=false;
		          				for(var j=0;j<data.length;j++){
		          					var ele=$(".big_area").eq(0).clone();
		          					ele.find('.big_title').html(data[j].title);
		          					ele.find(".play_bigImg").attr("rsrc",data[j].bigImg).parents("a").attr("href",data[j].bigImg).addClass("play-swipebox");
		          					var detailData=data[j].detail;
									var length=detailData.length;
									for(var i=0;i<length;i++){
										var ele2=ele.find('.special_intro').eq(0).clone();
										ele2.find('h4 span').html(detailData[i].title);
										ele2.find('p').html(detailData[i].intro);
										ele2.find('.small_img').attr('rsrc',detailData[i].smallImg).parents('a').attr("href",detailData[i].smallImg).addClass("play-swipebox");
										ele2.show();
										ele.append(ele2);
									}
									ele.show();
									$(".play_area").append(ele);
		          				}
		          				$(".play-swipebox").swipebox();
		          				$(".play_bigImg").eq(1).attr('src',data[0].bigImg)
								$(".play-swipebox").on("click",function(){
									WPBridge.callMethod("JsInvokeNative","wpBackListener",{back:false},function(){
										$("#swipebox-close").click();	
									});
									WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e026"},function(){});
								});
          					}
	          				setTimeout(function(){
								myScroll.refresh();
							},400)
	          				
							lazyLoad('.play_area img:visible')
							$(".play_area img").each(function() {
								var i = $.Deferred();
								$(this).bind("load", function() {
									i.resolve()
								}).bind("error", function() {
									$(this).attr("src", "images/default_error2.png");
								})
							});
							wpCommon.viewShow()
          				}catch(e){
            				netError=true;
          					$(".play_area").hide()
          					$(".loading").show().css("height", wholeHei+ "px").find("img").attr("src", "images/error_else.png").siblings("p").html("出错了，请稍后再试");
							wpCommon.viewShow()
          				}
						
					}
      			},
      			error:function(jqXHR, textStatus, errorThrown){
		            window.netError = true;
					if(textStatus == "timeout") {
						$(".loading").show()
					} else {
						$(".loading").show()
					}
					WPBridge.callMethod("JsInvokeNative", "wpShowToast", {
						message: "网络异常"
					}, function() {});
					wpCommon.viewShow()
		        }
      		})
      	}
			//分享
			$(".share").on("touchstart",function(){
				//原生分享组件
				WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e047",otherId:prtId},function(){})
				var title=productInfo.productDetails.productName;
				var text=productInfo.productDetails.featureDesc;
				var imgUrl=productInfo.brand.brandIcon;
				WPBridge.callMethod('JsInvokeNative','wpShareProduct',{productId:prtId,shareTitle:title,shareText:text,shareUrl:wpCommon.Url+"/zpkH5/share.html?productId="+prtId,shareImg:imgUrl},function(){});
			})
			//附近门店
			$(".nearby_shop").on("touchstart",function(){
				WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e032",otherId:''},function(){});
				WPBridge.callMethod('JsInvokeNative','wpNearShop',{productId:prtId},function(){});
			})
			
			//咨询留言
			$("#cst_btn").on("touchstart",function(){
				if(userId==""){
					localStorage.setItem('productId',prtId);
					WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e029",otherId:''},function(){});
					WPBridge.callMethod('JsInvokeNative','wpLogin',{},function(msg){
						if(msg.data.result!=""){
							userId=msg.data.result;
							WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e006",otherId:prtId},function(){});
							WPBridge.callMethod('JsInvokeNative','wpIsLiked',{productId:prtId},function(msg){
								if(msg.data.result!='false'){
									$(".like").addClass('liked');	
								}
								WPBridge.callMethod("JsInvokeNative","wpEncrypt",{key:key,params:[userId]},function(msg){window.aesUserId=msg.data.result[0];onResume()});
							})	
						}
					});
				}else {
					localStorage.setItem('productId',prtId);
					localStorage.setItem('userId',userId);
					localStorage.removeItem('isFromDetails');
					WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e029",otherId:''},function(){});
					WPBridge.callMethod('JsInvokeNative','wpConsult',{productId:prtId},function(){});
				}
			})
			
			//点击品牌进入公司列表
			$(".brand").on("click",function(e){
				localStorage.setItem('brand',JSON.stringify(productInfo.brand));
				WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e024",otherId:productInfo.brand.brandName},function(){});
				window.location.href="company.html?pageId=H5_A009&otherId="+productInfo.brand.brandName;
			})
		
			//点击爱心收藏/取消收藏
			$(".like").on("touchstart",function(){
				var that=this;
				if(this.className=="like bg-icon"){
					if(userId==""){
						WPBridge.callMethod('JsInvokeNative','wpLogin',{},function(msg){
							if(msg.data.result!=""){
								userId=msg.data.result;
								WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e006",otherId:prtId},function(){});
								WPBridge.callMethod('JsInvokeNative','wpIsLiked',{productId:prtId},function(msg){
									if(msg.data.result!='false'){
										$(".like").addClass('liked');	
										WPBridge.callMethod('JsInvokeNative','wpShowToast',{message:'已收藏'},function(){});
									}else{
										WPBridge.callMethod('JsInvokeNative','wpEncrypt',{key:key,params:[userId]},function(msg){
											window.aesUserId=msg.data.result[0];addStore();		
										})
									}
								})

							}
						});
					}else {
						addStore(that);
						WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e006",otherId:prtId},function(){});
					}				
				}
				else{
					deleteStore(that);
					WPBridge.callMethod("JsInvokeNative","wpHitDotEvent",{eventId:"h5_e007",otherId:prtId},function(){});				
				}
			})
		
		function addStore(ele){
			$.ajax({
				url:wpCommon.Url+"/wpwl/member/addStore",
				data:{
					id:aesUserId,
					productId:parValue,
					versionId:'27'
				},
				type:"post",
				success:function(res){
					if(res.errMsg=="AES加密解密失败"){
						if(!ele.aesFail){
							ele.aesFail=true;
							getKey(true);
							addStore(ele)
						}
					}else {
						$(".like").toggleClass('liked');
						WPBridge.callMethod('JsInvokeNative','wpAddLike',{productId:prtId},function(){});
						WPBridge.callMethod('JsInvokeNative','wpShowToast',{message:'收藏成功'},function(){});
						
					}
				}
			})	
		}
		function deleteStore(ele){
			$.ajax({
				url:wpCommon.Url+"/wpwl/member/deleteStore",
				data:{
					id:aesUserId,
					productId:parValue,
					versionId:'27'
				},
				type:"post",
				success:function(res){
					if(res.errMsg=="AES加密解密失败"){
						if(!ele.aesFail){
							ele.aesFail=true;
							getKey(true);
							deleteStore(ele)
						}
					}else{
						$(".like").toggleClass('liked');
						WPBridge.callMethod('JsInvokeNative','wpRemoveLike',{productId:prtId},function(){});
						WPBridge.callMethod('JsInvokeNative','wpShowToast',{message:'取消收藏'},function(){});
					}	
				}
			})
		}
		
		//刷新咨询留言
		function onResume(){
			if($("#consultant i")[0].className=="bg-icon drop"){
				consultContent(1,4,true);
			}	
		}
				
		function consultContent(index,size,flag,isLogin){
			if(isLogin=='no'){
				aesUserId='';
			}
			WPBridge.callMethod('JsInvokeNative','wpEncrypt',{key:key,params:[index,size]},function(msg){
				var aesIndex=msg.data.result[0];
				var aesSize=msg.data.result[1];
				$.ajax({
					url:wpCommon.Url+"/wpwl/message/listConsultByPage",
					type:"post",
					data:{
						"userId":aesUserId,
						"productId":parValue,
						"pageIndex":aesIndex,
						"pageSize":aesSize,
						"versionId":'27'
					},
					success:function(res){
						if(res.errMsg=='AES加密解密失败'){
							if(!(aesFail[1]%2)){
								getKey(true);
								consultContent(index,size,flag);
								aesFail[1]++;
							}
						}else{
							if(res.data.success==false){
								WPBridge.callMethod('JsInvokeNative','wpShowToast',{message:'没有更多'},function(){});	
							}else {
						 		window.consultItem=res.data;
								if(flag){
									var list=consultItem.list;
									var total=consultItem.total;
									if(size==5&&total>0){
										localStorage.setItem('consultContent',JSON.stringify(consultItem));
										localStorage.setItem('isFromDetails',true);
										localStorage.removeItem('productId');
										localStorage.removeItem('userId');
										localStorage.setItem('productId',prtId);
										if(userId){
											localStorage.setItem('userId',userId);
										}
										window.location.href="consult.html?pageId=H5_A014&otherId="+prtId;
									}else if(size==5&&total==0){
										WPBridge.callMethod('JsInvokeNative','wpShowToast',{message:'没有更多'},function(){});
										isMore=false;
									}
									if(total==0){
										$(".cst_area").css({
											height:0,
											overflow:'hidden'
										})
									}else{
										isMore=true;
										if(total==1){
											$('.consult_time').eq(0).html(list[0].consultTime.slice(0,-3));
											$(".my_consult").eq(0).html(list[0].consult);
											if(list[0].message==''){
												$(".reply").eq(0).html('等待企业答复...')
											}else {
												$(".reply").eq(0).html(list[0].message);
											}	
											if(list[0].userId!=userId){
												$(".account").eq(0).html(list[0].mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'));
												$('.account').eq(0).siblings('.bg-icon').css('backgroundPosition',"-7.04rem 0");
											}else {
												$(".account").eq(0).html('我的咨询')
											}
											$('.cst_area').find('dt').eq(1).hide();
											$('.cst_area').find('dd').eq(1).hide();
										}else{
											for(var i=0;i<2;i++){
												$('.consult_time').eq(i).html(list[i].consultTime.slice(0,-3));
												$(".my_consult").eq(i).html(list[i].consult);
												if(list[i].message==''){
													$(".reply").eq(i).html('等待企业答复...')
												}else {
													$(".reply").eq(i).html(list[i].message);
												}
												if(isLogin!="no"){
													if(list[i].userId!=userId){
														$(".account").eq(i).html(list[i].mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'));
														$('.account').eq(i).siblings('.bg-icon').css('backgroundPosition',"-7.04rem 0");
													}else {
														$('.account').eq(i).siblings('.bg-icon').css('backgroundPosition',"-8.32rem 0");
														$(".account").eq(i).html('我的咨询');
													}
												}else{
													$(".account").eq(i).html(list[i].mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'));
													$('.account').eq(i).siblings('.bg-icon').css('backgroundPosition',"-7.04rem 0");
												}
												$('.cst_area').find('dt').eq(1).show();
												$('.cst_area').find('dd').eq(1).show();
											}
										}
										$(".cst_area").css({
											'height':'',
											'overflow':'auto'
											}).addClass("myShow");
									}
								}									
							}
						}
					}
				})
			});
		}
	

