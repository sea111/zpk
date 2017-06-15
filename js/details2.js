/**正品控详情页js
	Created by huacc .
*/
window.userId = "";//用户id
window.noGoods = "";//商品是否下架
window.netError = "";//网络是否异常
window.aesFail = [0, 0, 0];//加解密是否失败
window.version = "";//版本信息
WPBridge.callMethod("JsInvokeNative", "wpShowLoadingDialog", {}, "");//调原生方法，显示loading效果
//顶部返回
$("#back").on("touchstart", function() {
	WPBridge.callMethod("JsInvokeNative", "wpH5Back", {}, "")
});
//获取版本信息
WPBridge.callMethod("JsInvokeNative", "wpGetVersionCode", {}, function(msg) {
	window.version = Number(msg.data.result.replace(".", ""))
});

//根据网络环境和屏幕大小加载不同的图片
(function() {
	window.type = "";
	var wid = window.screen.width;
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
})();

$(".top").on('touchmove',function(){
	return false;
})

//更新图片遮罩层
function refreshMaskBig() {
	new Swiper(".swiper-mask", {
		zoom: true,
		onClick: function(e) {
			myScroll.scrollTo(0, initY, 0, IScroll.utils.ease.circular);
			$(".swiper-mask").remove();
			WPBridge.callMethod("JsInvokeNative", "wpBackListener", {
				back: true
			}, "")
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

//在遮罩层滑动时避免影响外层scroll
$(".swiper-mask img").on("touchmove", function(e) {
	return false
});

//添加图片遮罩,data:图片的url地址,数组;imgSrc:点击的图片地址;
//imgIndex:点击的图片的序号;
function addMaskImg(data, imgSrc, imgIndex) {
	initY = myScroll.y;
	var html = template("test", data);
	$("#content").append(html);
	var transDis = -document.documentElement.clientWidth * (imgIndex);
	$(".swiper-mask .swiper-wrapper").css("transform", "translate3d(" + transDis + "px, 0px, 0px)");
	refreshMaskBig()
}

function toggleObj(clickObj) {
	if(clickObj == "#sure") {
		$(".videoWrap").css("opacity", 1).find("p").show().siblings("span").html("加载中").show();
		$(".videoWrap div").css({
			"background": "black",
			"width": "0.96rem"
		});
		$("video").get(0).play()
	} else {
		if(clickObj == "#cancle") {
			$(".videoWrap").css("opacity", 0.7)
		}
	}
	$("#modal").hide();
	$("#smark").hide()
}

//改变图片路径，url：图片原地址
function changeImgUrl(url) {
	if(type == "") {
		return url
	} else {
		return url.substring(0, url.length - 4) + type + url.substring(url.length - 3)
	}
}
//设置loading快的高度为whole，whole为屏幕高度减去顶部导航栏的高
$(".loading").css("height", wholeHei + "px");

//初始化iscroll
myScroll = new IScroll("#content", {
	click: true,
	fixedScrollbar: true,
	disableTouch: false,
	disablePointer: true,
	mouseWheel: true
});
myScroll.on("scrollEnd", function(e) {
	if(this.y < -200) {
		$("#backTop").show()
	} else {
		$("#backTop").hide()
	}
	if((this.y <= this.maxScrollY) && (this.pointY < 14)) {
		this.scrollTo(0, this.maxScrollY, 400)
	}
	if($("#detail_btn").hasClass("selected")) {
		lazyLoad(".detail_area img:visible")
	} else {
		lazyLoad(".play_area img:visible")
	}
});
window.winHei = $(window).height();

//懒加载，obj：图片；top：距离顶部距离；
function lazyLoad(obj, top) {
	$(obj).each(function() {
		var $t = $(this);
		if($t.attr("rsrc") !== $t.prop("src")) {
			if($t.offset().top <= winHei + 200) {
				$t.prop("src", $t.attr("rsrc"))
			}
		}
	})
}
//获取key
function getKey(userFlag, isPlay) {
	$.ajax({
		url: wpCommon.Url + "/wpwl/getKey",
		data: {
			versionId: "27"
		},
		success: function(res) {
			key = res.data;
			if(userFlag) {
				WPBridge.callMethod("JsInvokeNative", "wpGetUserId", {}, function(msg) {
					if(msg.data.result != "") {
						userId = msg.data.result;
						WPBridge.callMethod("JsInvokeNative", "wpEncrypt", {
							key: key,
							params: [userId]
						}, function(msg) {
							window.aesUserId = msg.data.result[0]
						})
					}
				})
			} else {
				if(!isPlay) {
					wpwlDetails.getData(key)
				}
			}
			localStorage.setItem("key", res.data)
		}
	})
}
$(function() {
	//判断是否从扫描进入，扫描结果进入的无productId
	if(!getUrlRequest().productId) {
		window.productInfo = JSON.parse(localStorage.getItem("productDetails"));
		window.key = localStorage.getItem("key");
		window.prtId = productInfo.productDetails.productId;
		WPBridge.callMethod("JsInvokeNative", "wpEncrypt", {
			key: key,
			params: [prtId]
		}, function(msg) {
			window.parValue = msg.data.result[0]
		});
		try {
			window.version = Number(localStorage.getItem("version"));
			wpwlDetails.autoPlay();
			if(productInfo.detailType) {
				if(productInfo.detailType == "0") {
					wpwlDetails.brandShow();
					wpwlDetails.special();
					$(".block").show();
					wpwlDetails.paras();
					$("footer").removeClass("hide");
					$(".nearby_shop").hide()
				} else {
					if(productInfo.detailType == "1") {
						$("#content-scroll").css("paddingBottom", "0");
						$(".block").show();
						$(".detail_imgText").hide();
						$("footer").hide();
						wpwlDetails.paras();
						wpwlDetails.longImg(productInfo.detailPicData, $(".detail_longImg"), "dLongImg-swipebox", "detailPicUrl")
					}
				}
			} else {
				wpwlDetails.brandShow();
				wpwlDetails.special();
				$(".block").show();
				wpwlDetails.paras();
				$("footer").removeClass("hide");
				$(".nearby_shop").hide()
			}
			wpwlDetails.scroll();
			wpwlDetails.finish()
		} catch(e) {
			$("#content").hide();
			$("footer").hide();
			$(".btn").hide().siblings(".like").hide().siblings(".share").hide();
			$(".loading").show().find("img").attr("src", "images/error_else.png").siblings("p").html("出错了，请稍后再试");
			wpCommon.viewShow()
		}
	} else {
		window.prtId = getUrlRequest().productId;
		getKey()
	}
});

//详情页的各种方法
var wpwlDetails = {
	getData: function(value) {
		var that = this;
		var block = $(".block");
		var loading = $(".loading");
		var footer = $("footer");
		window.prtId = getUrlRequest().productId;
		WPBridge.callMethod("JsInvokeNative", "wpEncrypt", {
			key: value,
			params: [prtId]
		}, function(msg) {
			parValue = msg.data.result[0];
			$.ajax({
				url: wpCommon.Url + "/wpwl/product/productInfo",
				type: "post",
				data: {
					productId: parValue,
					versionId: "27"
				},
				timeout: 10000,
				success: function(res) {
					if(res.errMsg == "AES加密解密失败") {
						if(!that.aesFail) {
							that.aesFail = true;
							getKey();
							$("#content").hide();
							$("footer").hide();
							$(".btn").hide().siblings(".like").hide().siblings(".share").hide();
							$(".loading").show().find("img").attr("src", "images/error_else.png").siblings("p").html("出错了，请稍后再试");
							wpCommon.viewShow()
						}
					} else {
						if(res.errMsg == "找不到指定的产品，请稍后再试，谢谢！" || res.errMsg == "找不到指定的产品") {
							window.noGoods = true;
							$("#content").hide();
							$("footer").hide();
							$(".btn").hide().siblings(".like").hide().siblings(".share").hide();
							$(".loading").show().find("img").attr("src", "images/notFound.png").siblings("p").html("该产品已下架");
							wpCommon.viewShow()
						} else {
							footer.removeClass("hide");
							window.productInfo = res.data;
							try {
								window.productInfo = res.data;
								wpwlDetails.autoPlay();
								if(productInfo.detailType) {
									if(productInfo.detailType == "0") {
										block.show();
										footer.removeClass("hide");
										wpwlDetails.paras();
										wpwlDetails.brandShow();
										wpwlDetails.special()
									} else {
										if(productInfo.detailType == "1") {
											$("#content-scroll").css("paddingBottom", "0");
											block.show();
											$(".detail_imgText").hide();
											$("footer").hide();
											wpwlDetails.paras();
											wpwlDetails.longImg(productInfo.detailPicData, $(".detail_longImg"), "dLongImg-swipebox", "detailPicUrl")
										}
									}
								} else {
									block.show();
									footer.removeClass("hide");
									wpwlDetails.paras();
									wpwlDetails.brandShow();
									wpwlDetails.special()
								}
								wpwlDetails.scroll();
								wpwlDetails.finish();
								lazyLoad(".detail_area img:visible")
							} catch(e) {
								$(".btn").hide().siblings(".like").hide().siblings(".share").hide();
								$("#content").hide();
								$("footer").hide();
								$(".loading").show().find("img").attr("src", "images/error_else.png").siblings("p").html("出错了，请稍后再试");
								wpCommon.viewShow()
							}
						}
					}
				},
				error: function(jqXHR, textStatus, errorThrown) {
					wpCommon.viewShow();
					$("#content").hide();
					footer.hide();
					$(".btn").hide().siblings(".like").hide().siblings(".share").hide();
					$(".loading").show().find("img").attr("src", "images/error_else.png").siblings("p").html("出错了，请稍后再试");
					WPBridge.callMethod("JsInvokeNative", "wpNetError", {
						"url": wpCommon.Url + "/h5/details.html?productId=" + prtId
					}, "")
				}
			})
		})
	},
	//轮播图和视频
	autoPlay: function() {
		var bigImgUrl = productInfo.productDetails.productUrls;
		if(productInfo.orgInfo.serviceTel) {
			$("#serverTel").show().click(function() {
				WPBridge.callMethod("JsInvokeNative", "wpUpCallTel", {
					tel: productInfo.orgInfo.serviceTel
				}, "")
			})
		}
		if(productInfo.productDetails.playUrl && version >= 35.2) {
			var time = "";
			var videoUrl = productInfo.productDetails.playUrl;
			var str = "<div style='width:100%;height:101%' class='videoWrap'><video preload='none' src=" + videoUrl + " style='display:none' webkit-playsinline='true' controls='controls'></video><div><p></p><span style='display:none'>网络未连接，请检查网络后重试</span><a href='javascript:;' style='display:none'>重新加载</a></div></div>";
			for(var i = 0; i < bigImgUrl.length + 1; i++) {
				var ele = $(".swiper-slide").eq(0).clone();
				if(i >= 1) {
					ele.css("display", "block").find("img").attr({
						"src": changeImgUrl(bigImgUrl[i - 1]),
						"index": i - 1
					}).addClass("big-swipebox")
				} else {
					ele.css("display", "block").append(str).find("img").attr("src", changeImgUrl(bigImgUrl[i])).addClass("big-swipebox")
				}
				$(".autoPlay .swiper-wrapper").append(ele)
			}
			video = document.getElementsByTagName("video")[0];
			video.firstClick = true;
			$(".videoWrap div").on("click", function() {
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
						$("video").get(0).play();
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
				});
				$.ajax({
					url: wpCommon.Url + "/wpwl/productVideo/playCount",
					type: "post",
					data: {
						productId: parValue
					},
					success: function() {}
				})
			});
			$("video").on("click", function() {
				if(video.paused) {
					video.play();
					$("video").show()
				} else {
					video.pause()
				}
			});
			video.addEventListener("error", function() {
				$(".videoWrap div").css({
					"color": "white",
					"background": "black",
					"width": "4rem"
				}).unbind("click").find("p").hide().siblings("span").html("服务异常，请稍后再试。").show();
				$("video").hide()
			});
			video.addEventListener("pause", function() {
				$(".videoWrap").css("opacity", 1);
				$("video").show();
				$(".swiper-pagination").show()
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
				if(this.lock) {
					var that = this;
					$.ajax({
						url: wpCommon.Url + "/wpwl/productVideo/playCount",
						type: "post",
						data: {
							productId: parValue
						},
						success: function() {
							that.lock = false
						}
					})
				}
			});
			video.addEventListener("canplaythrough", function() {
				$("video").show().css({
					"zIndex": "20"
				})
			});
			video.addEventListener("ended", function() {
				$(".videoWrap").css("opacity", 1);
				$(".videoWrap div").css({
					"background": "black",
					"width": "0.96rem"
				});
				this.lock = true
			});
			setTimeout(function() {
				mySwiper = new Swiper(".autoPlay", {
					autoplay: time,
					pagination: ".swiper-pagination",
					paginationClickable: true,
					autoplayDisableOnInteraction: false,
					onTouchMove: function() {
						video.pause()
					}
				})
			}, 0)
		} else {
			var time = 2000;
			for(var i = 0; i < bigImgUrl.length; i++) {
				var ele = $(".swiper-slide").eq(0).clone();
				ele.css("display", "block").find("img").attr({
					"src": changeImgUrl(bigImgUrl[i]),
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
			WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
				eventId: "h5_e027"
			}, "");
			WPBridge.callMethod("JsInvokeNative", "wpBackListener", {
				back: false
			}, function() {
				$(".swiper-mask").remove()
			})
		});
		$("#product_name span").html(productInfo.productDetails.productName).parents("#product_name").siblings("#product_des").html(productInfo.productDetails.featureDesc);
		if(localStorage.getItem("productGoodsInfo") && getUrlRequest().productId == undefined) {
			var productGoodsInfo = JSON.parse(localStorage.getItem("productGoodsInfo"));
			var codeDoc = productGoodsInfo.specialCodeDoc;
			if(productGoodsInfo.specialCodeDoc != "" && productGoodsInfo.customerName != "") {
				$(".product p").show().find("strong").html(codeDoc.slice(codeDoc.indexOf("*") + 1, codeDoc.lastIndexOf("*")));
				$("#customerName").html(productGoodsInfo.customerName)
			} else {
				if(productGoodsInfo.customerName == "" && productGoodsInfo.specialCodeDoc != "") {
					$(".product p").eq(0).show().find("strong").html(codeDoc.slice(codeDoc.indexOf("*") + 1, codeDoc.lastIndexOf("*")));
					$("#customerName").html(productGoodsInfo.customerName)
				}
			}
		}
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
						WPBridge.callMethod("JsInvokeNative", "wpUpCallTel", {
							tel: value
						}, "")
					})
				} else {
					if(params[i].type == 1) {
						var dropText = "";
						var iconEle = "<i class='bg-icon dropText' style='background-position:-1.92rem 0rem;right:0;top:-0.2rem'></i>";
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
							}).addClass("outerLink").find("div").html("<div><p><em style='white-space:nowrap;color:" + fontColor + "'>" + params[i - 1].value + "</em></p><p><em style='white-space:nowrap;font-size:0.295rem;color:" + fontColor + "'>" + params[i - 1].value + "</em></p></div>")
						} else {
							result.find("div").html("<div><p><em style='white-space:nowrap;color:" + fontColor + "'>" + params[i - 1].value + "</em></p><p><em style='white-space:nowrap;color:" + fontColor + "'>" + params[i - 1].value + "</em></p></div>")
						}
					}
					result.find("div").eq(0).width(result.find("em").width() + 30 + "px").addClass("play")
				}
			}
		}
		$(".dropText").on("touchstart", function() {
			var length = $(this).siblings("p").length;
			var pHei = $(this).siblings("p").eq(0).get(0).offsetHeight;
			if(lock) {
				WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
					eventId: "h5_e010"
				}, "");
				$(this).css("background-position", "-2.56rem 0").parents(".para_result").css("height", pHei * (length) + "px");
				lock = 0
			} else {
				$(this).css("background-position", "-1.92rem 0").parents(".para_result").css("height", offHei + "px");
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
					"rsrc": changeImgUrl(data[j].bigImg),
					"index": index++
				}).addClass("spec-swipebox");
				imgArr.push(data[j].bigImg);
				var spec = data[j].detail;
				var length = spec.length;
				for(var i = 0; i < length; i++) {
					var ele2 = ele.find(".special_intro").eq(0).clone();
					ele2.find("h4 span").html(spec[i].title);
					ele2.find("p").css("color", "#666").html(spec[i].intro.replace(/\r/g, "<br/>"));
					ele2.find("img").attr({
						"rsrc": changeImgUrl(spec[i].smallImg),
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
				WPBridge.callMethod("JsInvokeNative", "wpBackListener", {
					back: false
				}, function() {
					$(".swiper-mask").remove()
				});
				WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
					eventId: "h5_e025"
				}, "")
			})
		}
	},
	longImg: function(picData, obj, name, picUrl) {
		if(picData) {
			obj.show();
			var imgArea = obj;
			var imgArr = [];
			var wid = document.documentElement.clientWidth;
			for(var i = 0; i < picData.length; i++) {
				var imgEle = obj.find(".longPic").eq(0).clone();
				imgEle.find("img").css({
					"width": "100%",
					"height": picData[i].height / picData[i].width * wid + "px"
				}).attr({
					"rsrc": changeImgUrl(picData[i][picUrl]),
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
				WPBridge.callMethod("JsInvokeNative", "wpBackListener", {
					back: false
				}, function() {
					$(".swiper-mask").remove()
				})
			});
			lazyLoad(obj.find("img:visible"))
		}
	},
	scroll: function() {
		$("#content").css("height", wholeHei + "px");
		myScroll.refresh();
		$(".outerLink").on("touchstart", function(e) {
			var urlLink = $(this).attr("link");
			if(urlLink.substring(0, 3) == "tel") {
				WPBridge.callMethod("JsInvokeNative", "wpUpCallTel", {
					tel: urlLink.substring(4)
				}, "")
			} else {
				WPBridge.callMethod("JsInvokeNative", "wpDetailsHttp", {
					url: urlLink,
					valueName: urlLink
				}, "")
			}
		})
	},
	finish: function() {
		WPBridge.callMethod("JsInvokeNative", "wpGetUserId", {}, function(msg) {
			if(msg.data.result != "") {
				window.userId = msg.data.result;
				WPBridge.callMethod("JsInvokeNative", "wpIsLiked", {
					productId: prtId
				}, function(msg) {
					if(msg.data.result != "false") {
						$(".like").addClass("liked")
					}
				});
				WPBridge.callMethod("JsInvokeNative", "wpEncrypt", {
					key: key,
					params: [userId]
				}, function(msg) {
					window.aesUserId = msg.data.result[0]
				})
			}
			wpCommon.viewShow()
		});
		$("img").each(function() {
			var b = $.Deferred();
			$(this).bind("load", function() {
				b.resolve()
			}).bind("error", function() {
				$(this).attr("src", "images/default_error2.png")
			})
		})
	}
};
$(function() {
	$("#wpReload").on("touchstart", function() {
		getData()
	});
	$("footer").on("touchmove dblclick", function() {
		return false
	});
	$("footer dl").on("touchstart", function(e) {
		return false
	});
	for(var i = 0; i < 4; i++) {
		var ele = $(".para_name").eq(0).clone();
		ele.css("display", "block").children(".para_name").html("");
		$(".parameters").append()
	}
	$("#backTop").on("touchstart", function(e) {
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
		myScroll.scrollTo(0, 0, 1000, IScroll.utils.ease.circular);
		e.preventDefault()
	});
	window.moreLock = true;
	window.isMore = true;
	$("#watchMore").on("touchstart", function() {
		if(moreLock) {
			moreLock = false;
			setTimeout(function() {
				moreLock = true
			}, 1000);
			if(userId != "") {
				if(isMore) {
					WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
						eventId: "h5_e013"
					}, "");
					consultContent(1, 5, true)
				} else {
					if(isMore == false) {
						WPBridge.callMethod("JsInvokeNative", "wpShowToast", {
							message: "没有更多"
						}, "");
						WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
							eventId: "h5_e013"
						}, "")
					}
				}
			} else {
				consultContent(1, 5, true, "no")
			}
		}
	});
	var flag = 1;
	var lock = 1;
	alert(7)
	$("#consultant").on("click", function(e) {
		if(flag) {
			WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
				eventId: "h5_e012"
			}, "");
			if(userId == "") {
				consultContent(1, 4, true, "no")
			} else {
				if(lock) {
					consultContent(1, 4, true);
					lock = 0
				} else {
					$(".cst_area").addClass("myShow")
				}
			}
			flag = 0
		} else {
			$(".cst_area").removeClass("myShow");
			flag = 1
		}
		e.stopPropagation();
		$("#consultant i").toggleClass("drop");
		$(".cst_item").toggleClass("ani")
	})
});
$("#smark").on("touchmove", function() {
	return false
});
$("#cancle").click(function() {
	toggleObj("#cancle")
});
$("#sure").click(function() {
	toggleObj("#sure")
});
$(function() {
	var playFlag = 1;
	var detailY = 0,
		playY = 0;
	$("#detail_btn").on("touchstart", function() {
		showDetail()
	});
	$("#play_btn").on("touchstart", function() {
		showPlay()
	});

	function GetSlideAngle(dx, dy) {
		return Math.atan2(dy, dx) * 180 / Math.PI
	}

	function GetSlideDirection(startX, startY, endX, endY) {
		var dy = startY - endY;
		var dx = endX - startX;
		var result = 0;
		if(Math.abs(dx) < 50 && Math.abs(dy) < 50) {
			return result
		}
		var angle = GetSlideAngle(dx, dy);
		if(angle >= -45 && angle < 45) {
			result = 1
		} else {
			if((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
				result = 2
			}
		}
		return result
	}
	var startX, startY;
	$("#content-scroll").get(0).addEventListener("touchstart", function(ev) {
		if(ev.target.className == "goods_pic big-swipebox" || ev.target.className == "videoWrap" || ev.target.tagName == "VIDEO" || ev.target.className == "swiper-slide swiper-slide-next") {
			return false
		}
		startX = ev.touches[0].pageX;
		startY = ev.touches[0].pageY
	}, false);
	$("#content-scroll").get(0).addEventListener("touchend", function(ev) {
		var endX, endY;
		if(ev.target.className == "goods_pic" || ev.target.className == "top" || ev.target.tagName == "VIDEO") {
			return false
		}
		endX = ev.changedTouches[0].pageX;
		endY = ev.changedTouches[0].pageY;
		var direction = GetSlideDirection(startX, startY, endX, endY);
		switch(direction) {
			case 2:
				if($("footer").get(0).className == "hide") {} else {
					showPlay()
				}
				break;
			case 1:
				if($("footer").get(0).className == "") {
					return
				} else {
					showDetail()
				}
				break
		}
	}, false);

	function showPlay() {
		if(productInfo.productDetails.playUrl && version >= 35.2) {
			if(!video.paused) {
				video.pause()
			}
		}
		WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
			eventId: "h5_e009",
			otherId: prtId
		}, function() {});
		detailY = myScroll.y;
		$("#play_btn").addClass("selected").siblings(".switch").removeClass("selected");
		$(".play_area").show().siblings(".area").hide();
		$("footer").removeClass().addClass("hide");
		myScroll.refresh();
		if(playFlag) {
			getData();
			playFlag = 0
		}
		if(netError) {
			$(".loading").show();
			if($(".loading").find("p").html() == "网络异常，点击") {
				WPBridge.callMethod("JsInvokeNative", "wpShowToast", {
					message: "网络不给力"
				}, "")
			}
		}
		setTimeout(function() {
			myScroll.scrollTo(0, playY, 0, IScroll.utils.ease.circular)
		}, 0)
	}

	function showDetail() {
		playY = myScroll.y;
		$("#detail_btn").addClass("selected").siblings(".switch").removeClass("selected");
		$(".detail_area").show().siblings(".area").hide();
		$("footer").removeClass();
		if(netError || aesFail) {
			$(".loading").hide()
		}
		myScroll.refresh();
		setTimeout(function() {
			myScroll.scrollTo(0, detailY, 0, IScroll.utils.ease.circular)
		}, 0)
	}
});
//玩转调接口
function getData() {
	WPBridge.callMethod("JsInvokeNative", "wpShowLoadingDialog", {}, function() {});
	WPBridge.callMethod("JsInvokeNative", "wpEncrypt", {
		key: key,
		params: [prtId]
	}, function(msg) {
		window.parValue = msg.data.result[0];
		$.ajax({
			url: wpCommon.Url + "/wpwl/product/getPlay",
			type: "post",
			data: {
				id: parValue,
				versionId: "27"
			},
			timeout: 8000,
			success: function(res) {
				if(res.errMsg == "AES加密解密失败") {
					if(!(aesFail[0] % 2)) {
						aesFail[0]++;
						getKey("", true);
						getData();
						netError = true;
						$(".loading").show().find("img").attr("src", "images/error_else.png").siblings("p").html("出错了，请稍后再试");
						wpCommon.viewShow()
					}
				} else {
					if(noGoods == true) {
						$("#content").hide();
						$("footer").hide();
						$(".loading").show();
						wpCommon.viewShow()
					} else {
						try {
							$(".loading").hide();
							if(res.data.playType) {
								if(res.data.playType == "0") {
									playText()
								} else {
									if(res.data.playType == "1") {
										$(".play_imgText").hide();
										var picData = res.data.playPicDetail;
										wpwlDetails.longImg(picData, $(".play_longImg"), "pLongImg-swipebox", "playPicUrl");
										wpwlDetails.scroll()
									}
								}
							} else {
								playText()
							}

							function playText() {
								var data = res.data.list;
								var index = 0;
								var imgArr = [];
								netError = false;
								for(var j = 0; j < data.length; j++) {
									var ele = $(".big_area").eq(0).clone();
									ele.find(".big_title").html(data[j].title);
									ele.find(".play_bigImg").attr({
										"rsrc": changeImgUrl(data[j].bigImg),
										"index": index++
									}).addClass("play-swipebox");
									imgArr.push(data[j].bigImg);
									var detailData = data[j].detail;
									var length = detailData.length;
									for(var i = 0; i < length; i++) {
										var ele2 = ele.find(".special_intro").eq(0).clone();
										ele2.find("h4 span").html(detailData[i].title);
										ele2.find("p").html(detailData[i].intro.replace(/\r/g, "<br/>"));
										ele2.find(".small_img").attr({
											"rsrc": changeImgUrl(detailData[i].smallImg),
											"index": index++
										}).addClass("play-swipebox");
										imgArr.push(detailData[i].smallImg);
										ele2.show();
										ele.append(ele2)
									}
									ele.show();
									$(".play_area").append(ele)
								}
								var data1 = {
									"imgUrl": imgArr
								};
								$(".play-swipebox").click(function() {
									addMaskImg(data1, $(this).attr("src"), $(this).attr("index"));
									WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
										eventId: "h5_e026"
									}, "");
									WPBridge.callMethod("JsInvokeNative", "wpBackListener", {
										back: false
									}, function() {
										$(".swiper-mask").remove()
									})
								});
								$(".play_bigImg").eq(1).attr("src", changeImgUrl(data[0].bigImg))
							}
							setTimeout(function() {
								myScroll.refresh()
							}, 400);
							lazyLoad(".play_area img:visible");
							$(".play_area img").each(function() {
								var i = $.Deferred();
								$(this).bind("load", function() {
									i.resolve()
								}).bind("error", function() {
									$(this).attr("src", "images/default_error2.png")
								})
							});
							wpCommon.viewShow()
						} catch(e) {
							netError = true;
							$(".btn").hide().siblings(".like").hide().siblings(".share").hide();
							$(".play_area").hide();
							$(".loading").show().find("img").attr("src", "images/error_else.png").siblings("p").html("出错了，请稍后再试");
							wpCommon.viewShow()
						}
					}
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
				window.netError = true;
				if(jqXHR.status !== "") {
					$(".btn").hide().siblings(".like").hide().siblings(".share").hide();
					$(".loading").show().find("img").attr("src", "images/error_else.png").siblings("p").html("出错了，请稍后再试")
				} else {
					$(".loading").show();
					WPBridge.callMethod("JsInvokeNative", "wpShowToast", {
						message: "网络异常"
					}, "")
				}
				wpCommon.viewShow()
			}
		})
	})
}

//分享
$(".share").on("touchstart", function() {
	WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
		eventId: "h5_e047",
		otherId: prtId
	}, "");
	var title = productInfo.productDetails.productName;
	var text = productInfo.productDetails.featureDesc;
	var imgUrl = productInfo.brand.brandIcon;
	WPBridge.callMethod("JsInvokeNative", "wpShareProduct", {
		productId: prtId,
		shareTitle: title,
		shareText: text,
		shareUrl: "https://prea.wpwl.org/h5/share.html?productId=" + prtId,
		shareImg: imgUrl
	}, "")
});

//附近门店
$(".nearby_shop").on("touchstart", function() {
	WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
		eventId: "h5_e032",
		otherId: ""
	}, "");
	WPBridge.callMethod("JsInvokeNative", "wpNearShop", {
		productId: prtId
	}, "")
});

//点击咨询
$("#cst_btn").on("touchstart", function() {
	if(userId == "") {
		localStorage.setItem("productId", prtId);
		WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
			eventId: "h5_e029",
			otherId: ""
		}, "");
		WPBridge.callMethod("JsInvokeNative", "wpLogin", {}, function(msg) {
			if(msg.data.result != "") {
				userId = msg.data.result;
				WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
					eventId: "h5_e006",
					otherId: prtId
				}, "");
				WPBridge.callMethod("JsInvokeNative", "wpIsLiked", {
					productId: prtId
				}, function(msg) {
					if(msg.data.result != "false") {
						$(".like").addClass("liked")
					}
					WPBridge.callMethod("JsInvokeNative", "wpEncrypt", {
						key: key,
						params: [userId]
					}, function(msg) {
						window.aesUserId = msg.data.result[0];
						onResume()
					})
				})
			}
		})
	} else {
		localStorage.setItem("productId", prtId);
		localStorage.setItem("userId", userId);
		localStorage.removeItem("isFromDetails");
		WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
			eventId: "h5_e029",
			otherId: ""
		}, "");
		WPBridge.callMethod("JsInvokeNative", "wpConsult", {
			productId: prtId
		}, "")
	}
});

//进入公司页面
$(".brand").on("click", function(e) {
	localStorage.setItem("brand", JSON.stringify(productInfo.brand));
	WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
		eventId: "h5_e024",
		otherId: productInfo.brand.brandName
	}, "");
	window.location.href = "company.html?pageId=H5_A009&otherId=" + productInfo.brand.brandName
});

//点击收藏，判断是否收藏
$(".like").on("touchstart", function() {
	var that = this;
	if(this.className == "like bg-icon") {
		if(userId == "") {
			WPBridge.callMethod("JsInvokeNative", "wpLogin", {}, function(msg) {
				if(msg.data.result != "") {
					userId = msg.data.result;
					WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
						eventId: "h5_e006",
						otherId: prtId
					}, "");
					WPBridge.callMethod("JsInvokeNative", "wpIsLiked", {
						productId: prtId
					}, function(msg) {
						if(msg.data.result != "false") {
							$(".like").addClass("liked");
							WPBridge.callMethod("JsInvokeNative", "wpShowToast", {
								message: "已收藏"
							}, "")
						} else {
							WPBridge.callMethod("JsInvokeNative", "wpEncrypt", {
								key: key,
								params: [userId]
							}, function(msg) {
								window.aesUserId = msg.data.result[0];
								addStore()
							})
						}
					})
				}
			})
		} else {
			addStore(that);
			WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
				eventId: "h5_e006",
				otherId: prtId
			}, "")
		}
	} else {
		deleteStore(that);
		WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
			eventId: "h5_e007",
			otherId: prtId
		}, "")
	}
});
//添加收藏
function addStore(ele) {
	$.ajax({
		url: wpCommon.Url + "/wpwl/member/addStore",
		data: {
			id: aesUserId,
			productId: parValue,
			versionId: "27"
		},
		type: "post",
		success: function(res) {
			if(res.errMsg == "AES加密解密失败") {
				if(!ele.aesFail) {
					ele.aesFail = true;
					getKey(true);
					addStore(ele)
				}
			} else {
				$(".like").toggleClass("liked");
				WPBridge.callMethod("JsInvokeNative", "wpAddLike", {
					productId: prtId
				}, "");
				WPBridge.callMethod("JsInvokeNative", "wpShowToast", {
					message: "收藏成功"
				}, "")
			}
		}
	})
}
//取消收藏
function deleteStore(ele) {
	$.ajax({
		url: wpCommon.Url + "/wpwl/member/deleteStore",
		data: {
			id: aesUserId,
			productId: parValue,
			versionId: "27"
		},
		type: "post",
		success: function(res) {
			if(res.errMsg == "AES加密解密失败") {
				if(!ele.aesFail) {
					ele.aesFail = true;
					getKey(true);
					deleteStore(ele)
				}
			} else {
				$(".like").toggleClass("liked");
				WPBridge.callMethod("JsInvokeNative", "wpRemoveLike", {
					productId: prtId
				}, "");
				WPBridge.callMethod("JsInvokeNative", "wpShowToast", {
					message: "取消收藏"
				}, "")
			}
		}
	})
}
//咨询完返回详情页的刷新功能
function onResume() {
	if($("#consultant i")[0].className == "bg-icon drop") {
		consultContent(1, 4, true)
	}
}
//咨询 index:页数 size：每页显示数量 flag:是否能点击 isLogin：是否登陆
function consultContent(index, size, flag, isLogin) {
	if(isLogin == "no") {
		aesUserId = ""
	}
	WPBridge.callMethod("JsInvokeNative", "wpEncrypt", {
		key: key,
		params: [index, size]
	}, function(msg) {
		var aesIndex = msg.data.result[0];
		var aesSize = msg.data.result[1];
		$.ajax({
			url: wpCommon.Url + "/wpwl/message/listConsultByPage",
			type: "post",
			data: {
				"userId": aesUserId,
				"productId": parValue,
				"pageIndex": aesIndex,
				"pageSize": aesSize,
				"versionId": "27"
			},
			success: function(res) {
				if(res.errMsg == "AES加密解密失败") {
					if(!(aesFail[1] % 2)) {
						getKey(true);
						consultContent(index, size, flag);
						aesFail[1]++
					}
				} else {
					if(res.data.success == false) {
						WPBridge.callMethod("JsInvokeNative", "wpShowToast", {
							message: "没有更多"
						}, "")
					} else {
						window.consultItem = res.data;
						if(flag) {
							var list = consultItem.list;
							var total = consultItem.total;
							if(size == 5 && total > 0) {
								localStorage.setItem("consultContent", JSON.stringify(consultItem));
								localStorage.setItem("isFromDetails", true);
								localStorage.removeItem("productId");
								localStorage.removeItem("userId");
								localStorage.setItem("productId", prtId);
								if(userId) {
									localStorage.setItem("userId", userId)
								}
								window.location.href = "consult.html?pageId=H5_A014&otherId=" + prtId
							} else {
								if(size == 5 && total == 0) {
									WPBridge.callMethod("JsInvokeNative", "wpShowToast", {
										message: "没有更多"
									}, "");
									isMore = false
								}
							}
							if(total == 0) {
								$(".cst_area").css({
									height: 0,
									overflow: "hidden"
								})
							} else {
								isMore = true;
								if(total == 1) {
									$(".consult_time").eq(0).html(list[0].consultTime.slice(0, -3));
									$(".my_consult").eq(0).html(list[0].consult);
									if(list[0].message == "") {
										$(".reply").eq(0).html("等待企业答复...")
									} else {
										$(".reply").eq(0).html(list[0].message)
									}
									if(list[0].userId != userId) {
										if(list[0].mobile){
											$(".account").eq(0).html(list[0].mobile.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"));
										}else{
											$(".account").eq(0).html(list[0].email)
										}
										$(".account").eq(0).siblings(".bg-icon").css("backgroundPosition", "-7.04rem 0")
									} else {
										$(".account").eq(0).html("我的咨询")
									}
									$(".cst_area").find("dt").eq(1).hide();
									$(".cst_area").find("dd").eq(1).hide()
								} else {
									for(var i = 0; i < 2; i++) {
										$(".consult_time").eq(i).html(list[i].consultTime.slice(0, -3));
										$(".my_consult").eq(i).html(list[i].consult);
										if(list[i].message == "") {
											$(".reply").eq(i).html("等待企业答复...")
										} else {
											$(".reply").eq(i).html(list[i].message)
										}
										if(isLogin != "no") {
											if(list[i].userId != userId) {
												if(list[i].mobile){
													$(".account").eq(i).html(list[i].mobile.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"));
												}else{
													$(".account").eq(i).html(list[i].email);
												}
												$(".account").eq(i).siblings(".bg-icon").css("backgroundPosition", "-7.04rem 0")
											} else {
												$(".account").eq(i).siblings(".bg-icon").css("backgroundPosition", "-8.32rem 0");
												$(".account").eq(i).html("我的咨询")
											}
										} else {
											if(list[i].mobile){
												$(".account").eq(i).html(list[i].mobile.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"));
											}else{
												$(".account").eq(i).html(list[i].email);
											}
											$(".account").eq(i).siblings(".bg-icon").css("backgroundPosition", "-7.04rem 0")
										}
										$(".cst_area").find("dt").eq(1).show();
										$(".cst_area").find("dd").eq(1).show()
									}
								}
								$(".cst_area").css({
									"height": "",
									"overflow": "auto"
								}).addClass("myShow")
							}
						}
					}
				}
			}
		})
	})
};