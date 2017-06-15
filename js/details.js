//合并之后的详情页的js

$(function(){
	var moreLock = true;
	var isMore = true;
	var noGoods;//是否商品下架
	var netError;//是否网络问题
	var userId='';//用户ID
	var aesFail;//是否加密解密失败
	var aesUserId='';//加密之后的userId
	var prtId;
	var u = navigator.userAgent;
	var consultItem;//咨询列表数据
	WPBridge.callMethod("JsInvokeNative", "wpShowLoadingDialog", {}, "");//调原生方法，显示loading效果

	$("#back").on("touchstart", function() {
		WPBridge.callMethod("JsInvokeNative", "wpH5Back", {}, "")
	});
	
	
	function getVersion(type){
		if(u.indexOf("Android") > -1 || u.indexOf("Linux") > -1){
			WPBridge.callMethod("JsInvokeNative", "wpGetVersionCode", {}, function(msg) {
				version = Number(msg.data.result.replace(".", ""));
				if(type){
					wpwlDetails.method();
				}
			});
		}else{
			version=35.2;
			if(type){
				wpwlDetails.method();
			}
		}
	}
	
	(function(){
		if(urlRequest.fromScan && localStorage.getItem('specialCode')) {
			var codeDoc = localStorage.getItem('specialCode');
			var cusName=localStorage.getItem('customerName');
			if(codeDoc.length>=9){
				if(codeDoc.indexOf("*")==-1){
					$(".product p").eq(0).show();
					$("#number").parents('p').html(codeDoc);					
				}else{
					var num=codeDoc.slice(codeDoc.indexOf("*") + 1, codeDoc.lastIndexOf("*"));
					var afterText=codeDoc.slice(codeDoc.lastIndexOf("*")+1);
					var preText=codeDoc.slice(0,codeDoc.indexOf("*"));
					$(".product p").eq(0).show().html(preText+"<strong id='number'>"+num+"</strong>"+afterText);
				}
				if(cusName != ""){
					$(".product p").eq(1).show();
					$("#customerName").html(cusName);
				}
			}else{
				if(codeDoc != "" && cusName != "") {
					$(".product p").show().find("strong").html(codeDoc.slice(codeDoc.indexOf("*") + 1, codeDoc.lastIndexOf("*")));
					$("#customerName").html(cusName);
				} else {
					if(cusName == "" && codeDoc!= "") {
						$(".product p").eq(0).show().find("strong").html(codeDoc.slice(codeDoc.indexOf("*") + 1, codeDoc.lastIndexOf("*")));
					}
				}
			}
			localStorage.removeItem('specialCode');
			localStorage.removeItem('customerName');
		}
	})();
	
	
	$(".product-share").remove();
	//顶部滑动网上移动
	$(".top").on('touchmove',function(){
		return false;
	});
	
	
	(function(){
//		判断
		if(!urlRequest.productId){
			window.productInfo = JSON.parse(localStorage.getItem("productDetails"));
			window.key = localStorage.getItem("key");
			prtId = productInfo.productDetails.productId;
			WPBridge.callMethod("JsInvokeNative", "wpEncrypt", {
				key: key,
				params: [prtId]
			}, function(msg) {
				window.parValue = msg.data.result[0];
				getUser()
			});
			try {
				$(".nearby_shop").remove();				
				getVersion(true);
			} catch(e) {
				wpwlDetails.errorElse()
			}
			wpCommon.viewShow()
		} else {
			prtId = urlRequest.productId;
			getVersion();
			getKey();
		}
	})()

	$("#more-paras").click(function(){
		var paraObj;
		paraObj={
			productId:[prtId],
			productName:[productInfo.productDetails.productName]
//			orgId:productInfo.orgId
		}
		localStorage.setItem('paraObj',JSON.stringify(paraObj));
		window.location.href='parameter.html';
	});
	
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
					consultContent(1, 5, true);
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

	
	function getInfo(value) {
		prtId = urlRequest.productId;
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
							wpwlDetails.errorElse();
							wpCommon.viewShow();
						}
					} else {
						if(res.errMsg == "找不到指定的产品，请稍后再试，谢谢！" || res.errMsg == "找不到指定的产品") {
							window.noGoods = true;
							wpwlDetails.errorElse("images/notFound.png","该产品已下架");
						} else {
							$("footer").removeClass("hide");
							window.productInfo = res.data;
							try {
								window.productInfo = res.data;
								wpwlDetails.method();
								getUser()
								wpwlDetails.lazyLoad(".detail_area img:visible");
							} catch(e) {
								wpwlDetails.errorElse();
							}
						}
						wpCommon.viewShow()
					}
				},
				error: function(jqXHR, textStatus, errorThrown) {
					wpCommon.viewShow();
					wpwlDetails.errorElse("images/notFound.png","出错了，请稍后再试");
					WPBridge.callMethod("JsInvokeNative", "wpNetError", {
						"url": wpCommon.Url + "/h5/detail.html?type=1&id=" + prtId
					}, "")
				}
			})
		})
	}

	$("#smark").on("touchmove", function() {
		return false
	});
	$("#cancle").click(function() {
		toggleObj("#cancle")
	});
	$("#sure").click(function() {
		toggleObj("#sure")
	});
	
	function toggleObj(clickObj) {
		if(clickObj == "#sure") {
			$(".videoWrap").css("opacity", 1).find("p").show().siblings("span").html("加载中").show();
			$(".videoWrap div").css({
				"background": "black",
				"width": "0.96rem"
			});
			$("video").get(0).play();
			setTimeout(function() {
				$("video").get(0).play();
			}, 0)
		} else {
			if(clickObj == "#cancle") {
				$(".videoWrap").css("opacity", 0.7)
			}
		}
		$("#modal").hide();
		$("#smark").hide()
	}
	
	(function(){
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
	
		$("footer").on("touchmove", function() {
			return false
		});
		$("footer dl").on("touchstart", function(e) {
			return false
		});
		
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
	})();
	
	function getData() {
		WPBridge.callMethod("JsInvokeNative", "wpShowLoadingDialog", {}, function() {});
		WPBridge.callMethod("JsInvokeNative", "wpEncrypt", {
			key: key,
			params: [prtId]
		}, function(msg) {
			parValue = msg.data.result[0];
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
											"rsrc":wpwlDetails.changeImgUrl(data[j].bigImg),
											"index": index++
										}).addClass("play-swipebox");
										imgArr.push(data[j].bigImg);
										var detailData = data[j].detail;
										var length = detailData.length;
										for(var i = 0; i < length; i++) {
											var ele2 = ele.find(".special_intro").eq(0).clone();
											ele2.find("h4 span").html(detailData[i].title);
											if(detailData[i].intro){
												ele2.find("p").html(detailData[i].intro.replace(/\r/g, "<br/>"));	
											}
											ele2.find(".small_img").attr({
												"rsrc": wpwlDetails.changeImgUrl(detailData[i].smallImg),
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
									$(".play_bigImg").eq(1).attr("src", wpwlDetails.changeImgUrl(data[0].bigImg))
								}
								setTimeout(function() {
									myScroll.refresh()
								}, 400);
								wpwlDetails.lazyLoad(".play_area img:visible");
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
								wpwlDetails.errorElse("images/notFound.png","出错了，请稍后再试");
								wpCommon.viewShow()
							}
						}
					}
				},
				error: function(jqXHR, textStatus, errorThrown) {
					netError = true;
					if(jqXHR.status !== ""&&jqXHR.status!=0) {
						wpwlDetails.errorElse("images/notFound.png","出错了，请稍后再试");
					} else {
						$(".loading").show().find('.middle').show();
						$(".top").css('zIndex','99');
						WPBridge.callMethod("JsInvokeNative", "wpShowToast", {
							message: "网络异常"
						}, "")
					}
					wpCommon.viewShow()
				}
			})
		})
	}
	
	$("#wpReload").on("touchstart", function() {
		getData()
	});
	
	$(".share").on("touchstart", function() {
		WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
			eventId: "h5_e047",
			otherId: prtId
		}, "");
		var title = productInfo.productDetails.productName;
		var text = productInfo.productDetails.featureDesc;
		var imgUrl = productInfo.brand.brandIcon;
		WPBridge.callMethod("JsInvokeNative", "wpShareProduct", {
			shareId: prtId,
			type:'1',
			shareTitle: title,
			shareText: text,
			shareUrl: "https://h5.wpwl.org/zpkH5/detail.html?type=2&productId="+ prtId,
			shareImg: imgUrl
		}, "")
	});
	
	$(".nearby_shop").on("touchstart", function() {
		WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
			eventId: "h5_e032",
			otherId: ""
		}, "");
		WPBridge.callMethod("JsInvokeNative", "wpNearShop", {
			productId: prtId
		}, "")
	});
	
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
							aesUserId = msg.data.result[0];
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
	
	
	$(".brand").on("click", function(e) {
		localStorage.setItem("brand", JSON.stringify(productInfo.brand));
		WPBridge.callMethod("JsInvokeNative", "wpHitDotEvent", {
			eventId: "h5_e024",
			otherId: productInfo.brand.brandName
		}, "");
		window.location.href = "company.html?pageId=H5_A009&otherId=" + productInfo.brand.brandName
	});
	
	function getUser() {
		WPBridge.callMethod("JsInvokeNative", "wpGetUserId", {}, function(msg) {
			if (msg.data.result != "") {
				userId = msg.data.result;
				WPBridge.callMethod("JsInvokeNative", "wpIsLiked", {
					productId: prtId
				}, function(msg) {
					if (msg.data.result != "false") {
						$(".like").addClass("liked")
					}
				});
				WPBridge.callMethod("JsInvokeNative", "wpEncrypt", {
					key: key,
					params: [userId]
				}, function(msg) {
					aesUserId = msg.data.result[0]
				})
			}
		})
	}
	
	
	
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
									aesUserId = msg.data.result[0];
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
	//添加到收藏
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
	window.onResume=function() {
		if(!userId){
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
		}	
		if($("#consultant i")[0].className == "bg-icon drop") {
			consultContent(1, 4, true)
		}
	}
	
    function getKey(userFlag, isPlay) {
		$.ajax({
			url: wpCommon.Url + "/wpwl/getKey",
			data: {
				versionId: "27"
			},
			success: function(res) {
				key = res.data;
				if(userFlag) {
					getInfo(key);
				} else {
					if(!isPlay) {
						getInfo(key);						
					}
				}
				localStorage.setItem("key", res.data)
			}
		})
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
							consultItem = res.data;
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
										if(list[0].consultTime){
											$(".consult_time").eq(0).html(list[0].consultTime.slice(0, -3));	
										}
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
											if(list[i].consultTime){
												$(".consult_time").eq(i).html(list[i].consultTime.slice(0, -3));
											}
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
})

	
