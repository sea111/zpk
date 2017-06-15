//合并的js
$(function(){
	//链接里的内容
	window.urlRequest=getUrlRequest();
	//屏幕高度
	window.winHei = $(window).height();
	var block = $("#content");
	var loading = $(".loading");
	var footer = $("footer");
	var noGoods;//有无产品的标识
	var pageType=urlRequest.type;
	var type='';//图片尺寸
	window.parValue=urlRequest.productId;
	var wid = document.documentElement.clientWidth;
	window.version='';
	var u = navigator.userAgent;
	var isAndroid;
	window.video = "";
	var where;
	(function(){
		if(u.indexOf("Android") > -1 || u.indexOf("Linux") > -1){
			isAndroid=true;
		}else{
			isAndroid=false;
		}
		window.myScroll = new IScroll("#content", {
			click: true,
			vScrollbar: true,
			vScroll: false,
			disableTouch: false,
			disablePointer: true,
			mouseWheel: true,
			disableMouse: false,
			scrollBars: true
		});

		myScroll.on("beforeScrollStart",function(){
			if(isAndroid&&video.paused){
				if(pageType==2||pageType==3){
					$(".videoWrap").css("opacity", 0.7);
	                $(".videoWrap p").hide().siblings("span").hide();
	                $("video").hide();
	                $(".videoWrap div").css({
	                    "background": ""
	                })
				}
			 }
		})
		myScroll.on("scrollEnd", function(e) {
			if(this.y < -200) {
				$("#backTop").show()
			} else {
				$("#backTop").hide()
			}
			if((pageType==1||!pageType)&&$("#play_btn").hasClass("selected")){
				wpwlDetails.lazyLoad(".play_area img:visible")
			}else{
				wpwlDetails.lazyLoad(".detail_area img:visible");
			}
			
			if((this.y <= this.maxScrollY) && (this.pointY < 14)) {
				this.scrollTo(0, this.maxScrollY, 400)
			}
			
		})
	})();
	
	if(pageType==2){
		var ele=document.createElement('script');
		ele.src='js/shareDepend.js';
		where='/share/product'
		$('body').append(ele);
	}else if(pageType==3){
		var ele1=document.createElement('script');
		ele1.src='js/scanDetails.js';
		var ele2=document.createElement('script');
		ele2.src="lib/base64_16.js";
		var ele3=document.createElement('script');
		ele3.src="lib/crypto-js.js";
		where='/share/product';
		$('body').append(ele2);
		$('body').append(ele3);
		$('body').append(ele1);
	}else{
		where='/wpwl/productVideo';
		var ele=document.createElement('script');
		ele.src='js/details.js';
		$('body').append(ele);
	}
	window.wpwlDetails = {
		autoPlay: function() {
			var bigImgUrl = productInfo.productDetails.productUrls;
			if(productInfo.orgInfo) {
				$("#serverTel").show().click(function() {
					if(pageType==1||!pageType){
						WPBridge.callMethod("JsInvokeNative", "wpUpCallTel", {
							tel: productInfo.orgInfo.serviceTel
						}, "")
					}else{
						window.location.href = "tel:" + productInfo.orgInfo.serviceTel
					}
				})
			}
			if(productInfo.productDetails.playUrl && version >= 35.2) {
				var time = "";
				var videoUrl = productInfo.productDetails.playUrl;
				var str = "<div style='width:100%;height:101%;' class='videoWrap'><video preload='none' src=" + videoUrl + " style='display:none' webkit-playsinline='true' controls='controls'></video><div><p></p><span style='display:none'>网络未连接，请检查网络后重试</span><a href='javascript:;' style='display:none'>重新加载</a></div></div>";
				for(var i = 0; i < bigImgUrl.length + 1; i++) {
					var ele = $(".swiper-slide").eq(0).clone();
					if(i >= 1) {
						ele.css("display", "block").find("img").attr({
							"src": bigImgUrl[i - 1],
							"index": i - 1
						}).addClass("big-swipebox")
					} else {
						ele.css("display", "block").append(str).find("img").attr("src",bigImgUrl[i]).addClass("big-swipebox")
					}
					$(".autoPlay .swiper-wrapper").append(ele)
				}
				video = document.getElementsByTagName("video")[0];
				var isFirst= true;
				video.lock=true;
				$(".videoWrap div").on("click", function() {
					if(pageType==1){
						WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
							eventId: "h5_e028"
						}, "");
						WPBridge.callMethod("JsInvokeNative", "wpNetwork", {}, function(msg) {
							if(msg.data.result == "2") {
								$(".videoWrap div").css({
									"background": "black",
									"width": "0.96rem"
								});
								$(".videoWrap").css("opacity", 1).find("p").show().siblings("span").html("加载中").show();
								video.play()
								setTimeout(function() {
									video.play()
								}, 0)
							} else {
								if(msg.data.result == "1") {
									$("#smark").css("display", "block");
									$("#modal").css("display", "block")
								} else {
									if(msg.data.result == "0") {
										$(".videoWrap").css("opacity", 1);
										$(".videoWrap div").css({
											"color": "white",
											"background": "black",
											"width": "4rem"
										}).find("p").hide().siblings().show();
										WPBridge.callMethod("JsInvokeNative", "wpShowToast", {
											message: "无连接，请检查网络"
										}, "")
									}
								}
							}
						})
					}else{
						$(".videoWrap div").css({
							"background": "black"
						});
						$(".videoWrap").css("opacity", 1).find("p").show().siblings("span").html("加载中").show();
						if(video.lock) {
							video.play()
						} else {
							$("video").show().get(0).play()
						}
						setTimeout(function() {
							video.play()
						}, 10)
					}	
				});
				$("video").on("click", function() {
					if (!video.paused) {
	                    video.pause()
	                } else {
	                    video.play()
	                }
				});
				video.addEventListener("error", function() {
					 if (video.error.code != 4) {
	                    $(".videoWrap div").css({
	                        "color": "white",
	                        "background": "black",
	                        "width": "4rem"
	                    }).unbind("click").find("p").hide().siblings("span").html("服务异常，请稍后再试。").show();
	                    $("video").hide()
	                } else {
	                    $(".videoWrap").css("opacity", 1);
	                    $(".videoWrap div").css({
	                        "color": "white",
	                        "background": "black",
	                        "width": "4rem"
	                    }).find("p").hide().siblings("span").html("网络未连接，请检查网络后重试").show().siblings("a").show();
	                    $("video").hide()
	                }
				});
				video.addEventListener("pause", function() {
					 $(".swiper-pagination").show();
				});
				$(".videoWrap a").click(function() {
					$(".videoWrap div").css({
						"background": "",
						"width": "0.96rem"
					});
					$(".videoWrap a").hide().siblings("span").hide();
					$(".videoWrap div").click()
				});
				video.addEventListener("play", function() {
					$(".videoWrap").css("opacity", 1);
					$(".swiper-pagination").hide();
					if(isFirst) {
						var that = this;
						$.ajax({
							url: wpCommon.Url + where+"/playCount",
							type: "post",
							data: {
								productId: parValue
							},
							success: function() {
								
							}
						})
						isFirst = false
					}
				});
				video.addEventListener("canplaythrough", function() {
					video.lock = false;
               	 	$("video").show().css("zIndex", "9")
				});
				video.addEventListener("ended", function() {
					 isFirst = true
				});
				setTimeout(function() {
					mySwiper = new Swiper(".autoPlay", {
						autoplay: time,
						pagination: ".swiper-pagination",
						paginationClickable: true,
						autoplayDisableOnInteraction: false,
						onSlideChangeStart: function() {
							video.pause();
							if(pageType==2||pageType==3){
								$(".videoWrap").css("opacity", 0.7);
		                        $(".videoWrap p").hide().siblings("span").hide();
		                        $("video").hide();
		                        $(".videoWrap div").css({
		                            "background": ""
		                        })
							}  
	                  },
					})
				}, 0)
			 }else {
				var time = 2000;
				for(var i = 0; i < bigImgUrl.length; i++) {
					var ele = $(".swiper-slide").eq(0).clone();
					ele.css("display", "block").find("img").attr({
						"src": wpwlDetails.changeImgUrl(bigImgUrl[i]),
						"index": i
					}).addClass("big-swipebox");
					$(".autoPlay .swiper-wrapper").append(ele)
				}
				setTimeout(function() {
					mySwiper = new Swiper(".autoPlay", {
						autoplay: time,
						pagination: ".swiper-pagination",
						paginationClickable: true,
						autoplayDisableOnInteraction: false
					})
				}, 0)
			}
			var data = {
				imgUrl: bigImgUrl
			};
			$(".swiper-container img").click(function() {
				addMaskImg(data, $(this).attr("src"), $(this).attr("index"));
				if(pageType==1){
					WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
						eventId: "h5_e027"
					}, "");
					WPBridge.callMethod("JsInvokeNative", "wpBackListener", {
						back: false
					}, function() {
						$(".swiper-mask").remove()
					})
				}	
			});
			$(".circle img").attr("src", productInfo.brand.brandIcon);
			$("#product_name span").html(productInfo.productDetails.productName).parents("#product_name").siblings("#product_des").html(productInfo.productDetails.featureDesc);
		},
		paras: function() {
			var params = productInfo.productParams.paramList;
			var lock = 1;
			var offHei = $(".para_name").eq(0).get(0).offsetHeight;
			$(".para_result").css("height", offHei + "px");
			$(".para_result a").eq(0).html(productInfo.productParams.standard).css("color", "#333");
			for(var i = 0; i < params.length; i++) {
				var ele = $(".para_items").eq(0).clone();
				var ele2 = ele.find(".para_name").html(params[i].name).siblings(".para_result");
				if(params[i].type == 4) {
					var src = params[i].value;
					ele2.find("a").css("color", "#19a4fa").addClass("outerLink").html(params[i].valueName).attr({
						"href": "javascript:;",
						"link": src
					})
				} else {
					if(params[i].type == 3) {
						var value = params[i].value;
						ele2.find("a").html(params[i].value).css("color", "#19a4fa").on("touchstart", function() {
							if(pageType==1){
								WPBridge.callMethod("JsInvokeNative", "wpUpCallTel", {
									tel: value
								}, "")
							}else{
								window.location.href="tel:"+value;
							}	
						})
					} else {
						if(params[i].type == 1) {
							var dropText = "";
							var iconEle = "<i class='dropText'></i>";
							for(var k = 0; k < params[i].value.length; k++) {
								dropText += "<p class='noFloat' style='float:none;width:100%'>" + params[i].value[k] + "</p>"
							}
							ele2.find("div").css({
								width: "100%"
							}).html(dropText).append(iconEle)
						} else {
							ele2.find("p").html(params[i].value)
						}
					}
				}
				$(".parameters").append(ele)
			}
			for(var i = 0; i < params.length + 1; i++) {
				if($(".para_result").eq(i).find("p").width() > $(".para_result").eq(i).width()) {
					if($(".para_result").eq(i).find("p").attr("class") != "noFloat") {
						var result = $(".para_result").eq(i);
						var fontColor = "#000";
						if(i == 0) {
							result.find("div").html("<div><p><em style='white-space:nowrap;color:" + fontColor + "'>" + productInfo.productParams.standard + "</em></p><p><em style='white-space:nowrap;color:" + fontColor + "'>" + productInfo.productParams.standard + "</em></p></div>")
						} else {
							if(params[i - 1].type == 3 || params[i - 1].type == 4) {
								var fontColor = "#19a4fa";
								var linkHref = "";
								if(params[i - 1].type == 3) {
									var linkHref = "tel:"
								}
								result.attr({
									"link": linkHref + params[i - 1].value
								}).addClass("outerLink").find("div").html("<div><p><em style='white-space:nowrap;color:" + fontColor + "'>" + params[i - 1].value + "</em></p><p><em style='white-space:nowrap;color:" + fontColor + "'>" + params[i - 1].value + "</em></p></div>")
							} else {
								result.find("div").html("<div><p><em style='white-space:nowrap;color:" + fontColor + "'>" + params[i - 1].value + "</em></p><p><em style='white-space:nowrap;color:" + fontColor + "'>" + params[i - 1].value + "</em></p></div>")
							}
						}
						result.find("div").eq(0).width(result.find("em").width() + 20 + "px").addClass("play")
					}
				}
			}
			$(".dropText").on("touchstart", function() {
				var length = $(this).siblings("p").length;
				var pHei = $(this).siblings("p").eq(0).get(0).offsetHeight;
				if(lock) {
					if(pageType==1){
						WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
							eventId: "h5_e010"
						}, "");
					}
					$(this).css("background-position", "-0.64rem 0").parents(".para_result").css("height", pHei * (length) + "px");
					lock = 0
				} else {
					$(this).css("background-position", "0 0").parents(".para_result").css("height", offHei + "px");
					lock = 1
				}
				myScroll.refresh()
			})
		},
		brandShow: function() {
			var brandInfo = productInfo.brand;
			$("#brand_img").attr("src", brandInfo.brandIcon);
			$("#brand_name").html(brandInfo.brandName)
		},
		special: function() {
			if(productInfo.productSpecList) {
				var imgArr = [];
				var data = productInfo.productSpecList;
				var index = 0;
				for(var j = 0; j < data.length; j++) {
					var ele = $(".special_block").eq(0).clone();
					ele.find(".bigImg").attr({
						"rsrc": wpwlDetails.changeImgUrl(data[j].bigImg),
						"index": index++
					}).addClass("spec-swipebox");
					imgArr.push(data[j].bigImg);
					var spec = data[j].detail;
					var length = spec.length;
					for(var i = 0; i < length; i++) {
						var ele2 = ele.find(".special_intro").eq(0).clone();
						ele2.find("h4 span").html(spec[i].title);
						if(spec[i].intro){
							ele2.find("p").css("color", "#666").html(spec[i].intro.replace(/\r/g, "<br/>"));
						}
						ele2.find("img").attr({
							"rsrc": wpwlDetails.changeImgUrl(spec[i].smallImg),
							"index": index++
						}).addClass("spec-swipebox");
						imgArr.push(spec[i].smallImg);
						ele2.css("display", "block");
						ele.append(ele2)
					}
					ele.show();
					$(".features").append(ele)
				}
				$(".features").show();
				var data = {
					imgUrl: imgArr
				};
				$(".spec-swipebox").click(function() {
					addMaskImg(data, $(this).attr("src"), $(this).attr("index"));
					if(pageType==1){
						WPBridge.callMethod("JsInvokeNative", "wpBackListener", {
							back: false
						}, function() {
							$(".swiper-mask").remove()
						});
						WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
							eventId: "h5_e025"
						}, "")
					}	
				})
			}
		},
		longImg: function(picData, obj, name, picUrl) {
			if(picData) {
				obj.show();
				var imgArea = obj;
				var imgArr = [];
				for(var i = 0; i < picData.length; i++) {
					var imgEle = obj.find(".longPic").eq(0).clone();
					imgEle.find("img").css({
						"width": "100%",
						"height": picData[i].height / picData[i].width * wid + "px"
					}).attr({
						"rsrc": wpwlDetails.changeImgUrl(picData[i][picUrl]),
						"index": i
					}).addClass(name);
					imgArr.push(picData[i][picUrl]);
					imgEle.show();
					imgArea.append(imgEle)
				}
				var data = {
					imgUrl: imgArr
				};
				$("." + name).on("click", function() {
					addMaskImg(data, $(this).attr("src"), $(this).attr("index"));
					if(pageType==1){
						WPBridge.callMethod("JsInvokeNative", "wpBackListener", {
							back: false
						}, function() {
							$(".swiper-mask").remove()
						})
					}
				});
				wpwlDetails.lazyLoad(obj.find("img:visible"));
			}
		},
		loadImg:function(){
			$("img").each(function() {				
				var b = $.Deferred();
				$(this).bind("load", function() {
					b.resolve()
				}).bind("error", function() {
					$(this).attr("src", "images/default_error2.png")
				})
			});
			myScroll.refresh();
		},
		changeImgUrl:function(imgUrl){
			if(type == "") {
				return imgUrl
			} else {
				return imgUrl.substring(0, imgUrl.length - 4) + type + imgUrl.substring(imgUrl.length - 3)
			}
		},
		lazyLoad:function(obj, top){
			$(obj).each(function() {
				var $t = $(this);
				if($t.attr("rsrc") !== $t.prop("src")) {
					if($t.offset().top <= winHei + 200) {
						$t.prop("src", $t.attr("rsrc"))
					}
				}
			})
		},
		errorElse:function(picUrl,word){
			if(!picUrl){
				picUrl="images/error_else.png";
			}
			if(!word){
				word="出错了，请稍后再试";
			}
			$("#content").hide();
			footer.hide();
			$(".top").css('zIndex','99');
			$(".btn").hide().siblings(".like").hide().siblings(".share").hide();
			$(".loadEffect").hide();
			$(".middle").show();
			loading.show().find("img").attr("src", picUrl).siblings("p").html(word);	
		},
		method:function(){
			block.show();
			loading.hide();
			wpwlDetails.autoPlay();
			if(productInfo.detailType) {
				if(productInfo.detailType == "0") {
					wpwlDetails.brandShow();
					wpwlDetails.special();
					wpwlDetails.paras();
					footer.removeClass("hide");
				} else {
					if(productInfo.detailType == "1") {
						if(pageType==1){
							$("#content-scroll").css("paddingBottom", "0");
						}
						$(".detail_imgText").hide();
						footer.hide();
						wpwlDetails.paras();
						wpwlDetails.longImg(productInfo.detailPicData, $(".detail_longImg"), "dLongImg-swipebox", "detailPicUrl")
					}
				}
			} else {
				wpwlDetails.brandShow();
				wpwlDetails.special();				
				wpwlDetails.paras();
				footer.removeClass("hide");	
			}
			wpwlDetails.loadImg();
			}
		};
	
//	wpwlDetails.getData();
	window.addMaskImg=function(data, imgSrc, imgIndex) {
		if(pageType==3){
			data={
				imgUrl:[imgSrc]
			}
			imgIndex=0;
		}
		isTapIn = true;
		initY = myScroll.y;
		var html = template("test", data);
		$("#content").append(html);
		$("#bottom").hide();
		var transDis = -document.documentElement.clientWidth * (imgIndex);
		$(".swiper-mask .swiper-wrapper").css("transform", "translate3d(" + transDis + "px, 0px, 0px)");
		refreshMaskBig();
	}
	
	//刷新遮罩
	function refreshMaskBig() {
		new Swiper(".swiper-mask", {
			zoom: true,
			onClick: function(e) {
				myScroll.scrollTo(0, initY, 0, IScroll.utils.ease.circular);
				if(pageType!=1){
					$("#bottom").show();
					if(pageType==3){
						finishPoint()
					}	
				}
				$(".swiper-mask").remove();
			},
			onSlideChangeEnd: function(swiper) {
				$(".swiper-mask img").each(function() {
					var $t = $(this);
					if($t.css("transform") != "none") {
						$t.css("transition-duration", 0)
					}
				})
			}
		})
	}
	
	function method(){	
		
		wpwlDetails.autoPlay();
		loading.hide();
		if(productInfo.detailType) {
			if(productInfo.detailType == "0") {
				wpwlDetails.brandShow();
				wpwlDetails.special();
				block.show();
				wpwlDetails.paras();
				footer.removeClass("hide");
			} else {
				if(productInfo.detailType == "1") {
					$("#content-scroll").css("paddingBottom", "0");
					block.show();
					$(".detail_imgText").hide();
					footer.hide();
					wpwlDetails.paras();
					wpwlDetails.longImg(productInfo.detailPicData, $(".detail_longImg"), "dLongImg-swipebox", "detailPicUrl")
				}
			}
		} else {
			wpwlDetails.brandShow();
			wpwlDetails.special();
			block.show();
			wpwlDetails.paras();
			footer.removeClass("hide");	
		}
		wpwlDetails.loadImg();
	}
	
	$("#backTop").on("touchstart", function(e) {
		if(pageType==1){
			if($("footer")[0].className == "hide") {
				WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
					eventId: "h5_e038",
					otherId: ""
				}, "")
			} else {
				WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
					eventId: "h5_e011",
					otherId: ""
				}, "")
			}
		}
		myScroll.scrollTo(0, 0, 1000, IScroll.utils.ease.circular)
		e.preventDefault()
	});
	
	$(document).on("click", ".outerLink", function() {
		var urlLink = $(this).attr("link");
		if(urlLink.substring(0, 3) == "tel") {
			if(pageType==1||!pageType){
				WPBridge.callMethod("JsInvokeNative", "wpUpCallTel", {
					tel: urlLink.substring(4)
				}, "")
			}else{
				window.location.href=urlLink;
			}	
		} else {
			if (!pageType||pageType == 1) {
				if(urlRequest.fromScan){
					urlLink = urlLink + "?" + getUrlRequest().labelCode
				}
				WPBridge.callMethod("JsInvokeNative", "wpDetailsHttp", {
					url: urlLink,
					valueName: urlLink
				}, "")
			} else if(pageType==2){
				window.location.href = urlLink
			}else if(pageType==3){
				window.location.href = urlLink+"?"+getUrlRequest().code;
			}
		}
	});
	
	(function(){
		if(!pageType||pageType==1){
			$("#bottom").remove();
			$(".top").show().css('zIndex','99');
			$(".loadEffect").remove();
			$("#content").css("height", wholeHei + "px");
			$(".bg-icon").css({
				'backgroundImage':'url(images/detail-sprite4.png)',
				'backgroundSize':'9.6rem 0.64rem',
				'width':'0.64rem',
				'height':'0.64rem'
			});
			WPBridge.callMethod("JsInvokeNative", "wpNetwork", {}, function(msg) {
				if(msg.data.result == "1") {
					if(wid <= 360) {
						type = "_480."
					} else {
						type = "_720."
					}
				} else {
					if(wid <= 240) {
						type = "_480."
					} else {
						if(wid <= 360) {
							type = "_720."
						} else {
							type = "_1080."
						}
					}
				}
			})			
		}else{
			$(".top").remove();
			$("footer").remove();
			$(".brand").remove();
			$(".nearby_shop").remove();
			$(".product-details").remove();
			$("#content").height($("body").height());
			$(".bg-icon").css({
				'backgroundImage':'url(images/share-sprite.png)',
				'backgroundSize':'1.56rem 0.78rem',
				'width':'0.78rem',
				'height':'0.78rem'
			})
			if(wid <= 240) {
				type = "_480."
			} else {
				if(wid <= 375) {
					type = "_720."
				} else {
					type = "_1080."
				}
			}
			version=35.2;
			if(pageType==3){
				//分享出去的版本信息默认为35.2		
				if(urlRequest.code.substring(0,8)=="32211250"){
					$("#bottom").remove();
				}
			}	
		}		
	})()
	
	
	
	$("#bottom").on("touchstart click", function(e) {
		var target = e.target;
		if($(target).attr("id") == "close") {
			$("#bottom").hide();
			$("#content-scroll").css("paddingBottom", "0rem")
		} else {
			window.location.href = "http://www.wopuwulian.com/app.html"
		}
	});
})
