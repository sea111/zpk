function getUrlRequest() {
	var url = location.search;
	var theRequest = new Object();
	if(url.indexOf("?") != -1) {
		var str = url.substr(1);
		if(str.indexOf("&") != -1) {
			strs = str.split("&");
			for(var i = 0; i < strs.length; i++) {
				theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1])
			}
		} else {
			theRequest[str.split("=")[0]] = unescape(str.split("=")[1])
		}
	}
	return theRequest
}

function addMaskImg(data, imgSrc, imgIndex) {
	isTapIn = true;
	initY = myScroll.y;
	var html = template("test", data);
	$("#content").append(html);
	$("#bottom").hide();
	var transDis = -document.documentElement.clientWidth * (imgIndex);
	$(".swiper-mask .swiper-wrapper").css("transform", "translate3d(" + transDis + "px, 0px, 0px)");
	refreshMaskBig()
}

function changeImgUrl(url) {
	return url.substring(0, url.length - 4) + type + url.substring(url.length - 3)
}(function() {
	window.type = "";
	var wid = document.documentElement.clientWidth;
	if(wid <= 240) {
		type = "_480."
	} else {
		if(wid <= 375) {
			type = "_720."
		} else {
			type = "_1080."
		}
	}
})();

function refreshMaskBig() {
	new Swiper(".swiper-mask", {
		zoom: true,
		onClick: function(e) {
			myScroll.scrollTo(0, initY, 0, IScroll.utils.ease.circular);
			$("#bottom").show();
			$(".swiper-mask").remove()
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
$("#bottom").on("touchstart click", function(e) {
	var target = e.target;
	if($(target).attr("id") == "close") {
		$("#bottom").hide();
		$("#content-scroll").css("paddingBottom", "0rem")
	} else {
		window.location.href = "http://www.wopuwulian.com/app.html"
	}
});
var wpwlDetails = {
	getData: function() {
		$.ajax({
			url: "https://prea.wpwl.org/share/product/productInfo?productId=" + getUrlRequest().productId,
			type: "post",
			data: {
				versionId: "27"
			},
			timeout: 10000,
			beforeSend: function() {
				$(".loadEffect").show().siblings(".middle").hide()
			},
			success: function(res) {
				if(res.errMsg == "找不到指定的产品，请稍后再试，谢谢！" || res.errMsg == "找不到指定的产品") {
					$(".loadEffect").hide();
					$(".middle").show().find("p").html("该产品已下架").siblings("img").attr("src", "images/notFound.png")
				} else {
					window.productInfo = res.data;
					$("#content").show();
					$(".loading").hide();
					wpwlDetails.autoPlay();
					if(productInfo.detailType) {
						if(productInfo.detailType == "0") {
							wpwlDetails.special();
							wpwlDetails.paras()
						} else {
							if(productInfo.detailType == "1") {
//								$(".parameters").hide();
								wpwlDetails.paras();
								$(".features").hide().siblings(".share_longImg").show();
								wpwlDetails.longImg($(".share_longImg"), productInfo.detailPicData, "sLongImg-swipebox")
							}
						}
					} else {
						wpwlDetails.paras();
						wpwlDetails.special()
					}
					wpwlDetails.scroll();
					lazyLoad(".detail_area img:visible")
				}
			},
			error: function(jqXHR) {
				$(".loadEffect").hide().siblings(".middle").show()
			}
		})
	},
	autoPlay: function() {
		var bigImgUrl = productInfo.productDetails.productUrls;
		var isFirst = true;
		if(productInfo.orgInfo) {
			$("#serverTel").show().click(function() {
				window.location.href = "tel:" + productInfo.orgInfo.serviceTel
			})
		}
		if(productInfo.productDetails.playUrl) {
			var videoUrl = productInfo.productDetails.playUrl;
			var str = "<div style='width:100%;height:101%' class='videoWrap'><video style='display:none' src=" + videoUrl + " preload='none' webkit-playsinline='true' controls='controls'></video><div><p></p><span style='display:none'>网络未连接，请检查网络后重试</span><a href='javascript:;' style='display:none'>重新加载</a></div></div>";
			for(var i = 0; i < bigImgUrl.length + 1; i++) {
				var ele = $(".swiper-slide").eq(0).clone();
				if(i >= 1) {
					ele.css("display", "block").find("img").attr({
						"src": changeImgUrl(bigImgUrl[i - 1]),
						"index": i - 1
					}).addClass("big-swipebox")
				} else {
					ele.css("display", "block").append(str).find("img").attr("src", changeImgUrl(bigImgUrl[i]))
				}
				$(".swiper-wrapper").append(ele)
			}
			setTimeout(function() {
				mySwiper = new Swiper(".swiper-container", {
					pagination: ".swiper-pagination",
					paginationClickable: true,
					autoplayDisableOnInteraction: false,
					onSlideChangeStart: function() {
						$(".videoWrap").css("opacity", 0.7);
						$(".videoWrap p").hide().siblings("span").hide();
						$("video").hide();
						video.pause();
						$(".videoWrap div").css({
							"background": ""
						})
					}
				})
			}, 0);
			video = document.getElementsByTagName("video")[0];
			video.lock = true;
			$(".videoWrap div").on("click", function() {
				$(".videoWrap div").css({
					"background": "black"
				});
				$(".videoWrap").css("opacity", 1).find("p").show().siblings("span").html("加载中").show();
				if(video.lock) {
					$("video").get(0).play()
				} else {
					$("video").show().get(0).play()
				}
				setTimeout(function() {
					$("video").get(0).play()
				}, 10)
			});
			video.addEventListener("error", function() {
				if(video.error.code != 4) {
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
			$(".videoWrap a").click(function() {
				$(".videoWrap div").css({
					"background": "",
					"width": "0.96rem"
				});
				video.load();
				$(".videoWrap a").hide().siblings("span").hide();
				$(".videoWrap div").click()
			});
			video.addEventListener("pause", function() {
				$(".swiper-pagination").show()
			});
			video.addEventListener("canplaythrough", function() {
				video.lock = false;
				$("video").show().css("zIndex", "9")
			});
			video.addEventListener("ended", function() {
				isFirst = true
			});
			video.addEventListener("play", function() {
				$(".swiper-pagination").hide();
				if(isFirst) {
					$.ajax({
						url: "https://h5.wpwl.org/share/product/playCount",
						data: {
							productId: getUrlRequest().productId
						},
						success: function(res) {}
					});
					isFirst = false
				}
			});
			$("video").on("click", function() {
				if(!video.paused) {
					video.pause()
				} else {
					video.play()
				}
			})
		} else {
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
					autoplay: 2000,
					pagination: ".swiper-pagination",
					paginationClickable: true,
					autoplayDisableOnInteraction: false
				})
			}, 0)
		}
		var data = {
			imgUrl: bigImgUrl
		};
		$(".big-swipebox").click(function() {
			addMaskImg(data, $(this).attr("src"), $(this).attr("index"))
		});
		$("video").bind("contextmenu", function() {
			return false
		});
		$(".circle img").attr("src", productInfo.brand.brandIcon);
		$("#product_name span").html(productInfo.brand.brandName + " · " + productInfo.productDetails.productName).parents("#product_name").siblings("#product_des").html(productInfo.productDetails.featureDesc)
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
				ele2.find("a").css({
					"color": "#19a4fa"
				}).attr("href", src).html(params[i].valueName)
			} else {
				if(params[i].type == 3) {
					var value = params[i].value;
					ele2.find("a").attr("href", "tel:" + value).html(value).css("color", "#19a4fa")
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
								"href": linkHref + params[i - 1].value
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
				$(this).css("background-position", "-0.64rem 0").parents(".para_result").css("height", pHei * (length) + "px");
				lock = 0
			} else {
				$(this).css("background-position", "rem 0").parents(".para_result").css("height", offHei + "px");
				lock = 1
			}
			myScroll.refresh()
		})
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
				addMaskImg(data, $(this).attr("src"), $(this).attr("index"))
			})
		}
	},
	longImg: function(obj, picData, name) {
		if(picData) {
			var imgArea = $(".share_longImg");
			var wid = document.documentElement.clientWidth;
			var imgArr = [];
			for(var i = 0; i < picData.length; i++) {
				var imgEle = obj.find(".longPic").eq(0).clone();
				imgEle.find("img").css({
					"width": "100%",
					"height": picData[i].height / picData[i].width * wid + "px"
				}).attr({
					"rsrc": picData[i].detailPicUrl,
					"index": i
				}).addClass(name);
				imgArr.push(picData[i].detailPicUrl);
				imgEle.show();
				imgArea.append(imgEle)
			}
			var data = {
				imgUrl: imgArr
			};
			$("." + name).on("click", function() {
				addMaskImg(data, $(this).attr("src"), $(this).attr("index"))
			});
			lazyLoad(obj.find("img:visible"))
		}
	},
	scroll: function() {
		myScroll.refresh();
		$("img").each(function() {
			var dfd = $.Deferred();
			$(this).bind("load", function() {
				dfd.resolve()
			}).bind("error", function() {
				$(this).attr("src", "images/default_error2.png")
			})
		})
	}
};
wpwlDetails.getData();
$("#backTop").on("touchend", function(e) {
	myScroll.scrollTo(0, 0, 2000, IScroll.utils.ease.circular)
});
$("#wpReload").click(function() {
	wpwlDetails.getData()
});
$(document).on("touchstart click", ".outerLink", function() {
	window.location.href = $(this).attr("href")
});
$(function() {
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
	myScroll.on("scrollEnd", function(e) {
		if(this.y < -200) {
			$("#backTop").show()
		} else {
			$("#backTop").hide()
		}
		lazyLoad(".detail_area img:visible")
	})
});