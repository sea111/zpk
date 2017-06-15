$(function(){
	wpCommon.viewShow()
	var urlRequest=getUrlRequest;
	var paraObj;//详情页存入的paraObj的内容
	var productIdArr;//产品id数组
	var productNameArr;//产品名字数组
	if(localStorage.getItem('productIdArr')){
		productIdArr=JSON.parse(localStorage.getItem('productIdArr'));
		productNameArr=JSON.parse(localStorage.getItem('productNameArr'));
	}else{
		paraObj=JSON.parse(localStorage.getItem('paraObj'));
		productIdArr=paraObj.productId;
		productNameArr=paraObj.productName;
	}
	var length=productIdArr.length;//产品长度
//	length=2;
	
	if(length==1){
		$(".main .inner").width('5.46rem')
	}else if(length==2){
		$(".main .inner").width('2.73rem')
	}
	$("#back").on("touchstart", function() {
		WPBridge.callMethod("JsInvokeNative", "wpH5Back", {}, "")
	});
	
	
	 /* 2.顶部跟随。（高度不定）
     */
    var $paramCars = $('.parameter-detail');
    var $paramHeader = $paramCars.find('header');
    var $paramDetail = $paramCars.find('.detail');
    var $paramItem = $paramDetail.find('.left .group');
    var $paramItem2 = $paramDetail.find('.main .data>h4'); // 图片、口碑 顶部
    var $paramGroup = $paramDetail.find('.main .group');
    var $paramHeaderStand = $paramHeader.next('.header-stand').height($paramHeader.height());
    
    var $paramMarkbar = $paramHeader.find('.markbar');
    var selectAnchorIndex;
    var selectAnchorTimer;

    // var timerScroll;
    $(window).on('scroll.paramSticky', function () {
      // if (timerScroll) {
      //     clearTimeout(timerScroll);
      // }

      // timerScroll = setTimeout(function () {
	    var docScrollTop = document.body.scrollTop;
	    var paramHeaderRect = $paramHeader.offset();
	    var paramHeaderTop = paramHeaderRect.top;
	    var paramHeaderStandRect = $paramHeaderStand.offset();
	    var paramHeaderStandRectTop = paramHeaderStandRect.top;
	    var paramHeaderStandRectHeight = paramHeaderStandRect.height;
	
	    if (docScrollTop && docScrollTop >= paramHeaderTop && !paramHeaderStandRectHeight) {
	        $paramHeader.addClass('sticky');
	        $paramHeaderStand.removeClass('fn-hide');
	    } else if (!paramHeaderStandRectTop || docScrollTop < paramHeaderStandRectTop) {
	        $paramHeader.removeClass('sticky');
	        $paramHeaderStand.addClass('fn-hide');
	      }
      var paramHeaderHeight = $paramHeader.height();
      $paramItem = $paramDetail.find('.left .group'); // dom 变更后需重新获取节点
      $paramItem2 = $paramDetail.find('.group h4'); // 图片、口碑 顶部
//    console.log($paramItem2)
      $paramItem.each(function (index, item) {
        var clientRect = this.getBoundingClientRect();
        if (clientRect.height + clientRect.top >= paramHeaderHeight) {
          $paramMarkbar.html($(this).find('h4').html());
          selectAnchorIndex = index;
          return false;
        }
      });

//       图片、口碑 顶部
      $paramItem2.each(function (index, item) {
        var clientRect = $(this).parents('.group')[0].getBoundingClientRect();
        if (clientRect.height +clientRect.top>= paramHeaderHeight ) {
          $paramMarkbar.html(this.innerHTML);
          selectAnchorIndex = index;
          return false;
        }
      });

      // 选中相应目录项
      clearTimeout(selectAnchorTimer);
      selectAnchorTimer = setTimeout(function() {
        $('.parameter-anchor .cont .item').eq(selectAnchorIndex)
          .addClass('activate')
          .siblings('.activate').removeClass('activate');
      }, 60);

      // }, 60);
    });
    //添加数据
    
	$("#param-pk").click(function(){
		window.location.href='product_item.html';
	})

    var wpwlParams={
    	getParams:function(){
    		var that=this;
//  		WPBridge.callMethod("JsInvokeNative", "wpEncrypt", {
//				key: value,
//				params: productIdArr
//			}, function(msg) {
//				parValue = msg.data.result;
//				$.ajax({
//					url: wpCommon.Url + "/wpwl/product/productInfo",
//					type: "post",
//					traditional:true,
//					data: {
//						productId: parValue,
//						versionId: "27"
//					},
//					timeout: 10000,
//					success:function(res){
//						that.paramList=res.data;
//					},
//					error: function(jqXHR, textStatus, errorThrown) {
//						wpCommon.viewShow();
//						wpwlDetails.errorElse("images/notFound.png","出错了，请稍后再试");
//						WPBridge.callMethod("JsInvokeNative", "wpNetError", {
//							"url": wpCommon.Url + "/h5/detail.html?type=1&id=" + prtId
//						}, "")
//					}
//				})
//  		})
			$.ajax({
				url:"JSON/new_file.json",
				type:"get",
				success:function(res){
					that.paramList=res;
					that.showParams()
				}
			})
		},
		showParams:function(){
			var dataList=this.paramList.param;
			for(var n=0;n<length;n++){
				var nameEle=$("#title li").eq(0).clone();
//				nameEle.html(productNameArr[m]).show();
				$("#title ul").append(nameEle);
			}
			for(var i=0,j=dataList.length;i<j;i++){
				//左边group克隆
				var lGroupEle=$(".left .group").eq(0).clone();
				//右边group克隆
				var rGroupEle=$(".data .group").eq(0).clone();
				var paramItem=dataList[i].paramitems;
				lGroupEle.find('h4 strong').html(dataList[i].name)
				for(var k=0,l=paramItem.length;k<l;k++){
					//左边group下的item克隆
					var lItemEle=lGroupEle.find('.item').eq(0).clone();
					var rItemEle=rGroupEle.find(".item").eq(0).clone();
					lItemEle.find(".inner").html(paramItem[k].name).css('display','tableCell');
					lItemEle.css('display','table');
					lGroupEle.append(lItemEle);
					for(var m=0;m<length;m++){
						var rInnerEle=rItemEle.find('.inner').eq(0).clone();
						rInnerEle.html(paramItem[k].valueitems[m].value);
						rInnerEle.css('display','tableCell');
						rItemEle.append(rInnerEle);
					}
					rItemEle.css('display','table');
					rGroupEle.append(rItemEle)
				}
				lGroupEle.show();
				rGroupEle.show()
				$(".left").append(lGroupEle);
				$(".data").append(rGroupEle);
			}
		}    
	}
    wpwlParams.getParams()
	function getKey(){
    	$.ajax({
    		url:"",
    		type:'post',
    		success:function(res){
    			key=res.data;
    			wpwlParams.getParams();
    		}
    	})
    }
//  getKey();
    
})
