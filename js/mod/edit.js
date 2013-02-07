!(function($){
	var Sandbox,
		configs = {
			debugMode:false,
			end:0
		},
		self;
	
	function CombineEdit(sb) {
		Sandbox = sb;
		return CombineEdit;
	}
	
	$.extend(CombineEdit,{
		init:function(cfg){
			
			self = this;
			self.config = $.extend(true, {}, configs, cfg);

			swfobject.embedSWF("http://127.0.0.1/watermark/flex/iComb.swf", "iComb", "100", "100", "10.0.0", "http://127.0.0.1/watermark/flex/expressInstall.swf");
			
			var wmbasicMap = {};

			/** page functions **/
			function findProductInList(id) {
				for(var i=0, max=productList.length; i<max; i++) {
					if(productList[i].id == id) {
						return productList[i];
					}
				}
				return false;
			}
			function packBasicToWatermark(basics) {
				var ret = [];
				for(var i=0,max=basics.length; i<max; i++) {
					var elem = [];
					elem.push(basics[i]);
					ret.push(elem);
				}
				return ret;
			}
			function sendProductWMToServer() {
			
				var info = [];
				for(var i=0,max=productList.length; i<max; i++) {
					var product = productList[i];
					var wm = [];
					for(var j=0,maxj=product.wm.basics.length; j<maxj; j++) {
						wm.push(product.wm.basics[j].toJSONObject());
					}

					if(wm.length > 0) {
						var item = {};
						item.id = product.id;
						item.imageurl = product.imageurl;
						item.wm = wm;
						info.push(item);
					}
				}	
				var infoJson = $.toJSON(info);
				var swf = document.getElementById("iComb");
				console.log(infoJson);
				swf.iCombineImage(infoJson);
			}
			
			var currentWatermarks = []; // 当前显示的水印列表
			var watermarkPerPage = 12;
			$(".wmtype a").live("click", function() {
				var wmstab = $("#wmstab");
				var anchor = $(this);

				$("li.active", wmstab).removeClass("active");
				anchor.parent().addClass("active");

				var type = anchor.attr("rel").substr(8);
				toWatermarkPage(+type, 1);
				
				if($(".wmtype a").index(anchor) !== 0) {
					$(".tabs a").removeClass("active")
					$(".tabs a").eq(0).addClass("active");
				}

				return false;
			});
			function toWatermarkPage(type, number) {
				var wmstab = $("#wmstab");
				var wmContainer = $(".wmList", wmstab);
				var wmSpecialContainer = $(".wmSpecialList", wmstab);

				if(type == 0) { // 上传页
					updateWMMap(type, number, 8);
				}
				else {
					updateWMMap(type, number, watermarkPerPage);
				}

				var wms = wmMap;
				var totalPages = wmMapPages;
				var container = null;


				$(".watermark", wmContainer).remove();
				$(".watermark", wmSpecialContainer).remove();

				// 处理特殊的type
				if(type >= 1000 || type <= 0) {
					wmContainer.hide();
					container = wmSpecialContainer.hide().filter("[id='wmtype_" + type + "']").show();
				}
				else {
					wmSpecialContainer.hide();
					container = wmContainer.show();
				}

				// 处理number
				var start = 0;
				var end = wms.length;//number*watermarkPerPage;
				if(end > wms.length) {
					end = wms.length;
				}

				// generate wm content
				currentWatermarks = [];
				for(var i=start; i<end; i++) {
					var watermark = new SaleKing.Business.wmWatermark();
					var wm = wms[i];
					for(var j=0, maxj=wm.length; j<maxj; j++) {
						var b = wm[j];
						var basic = {};
						if(b.type === 'image') {
							basic = new SaleKing.Business.WMBasic(b.id, b.type, b.x, b.y, b.w, b.h, b.a, b.o, {'image': wmbasicMap[b.id].image, 'imagewidth': wmbasicMap[b.id].width, 'imageheight': wmbasicMap[b.id].height});
						}
						else if(b.type === 'text') {
							basic = new SaleKing.Business.WMBasic(b.id, b.type, b.x, b.y, b.w, b.h, b.a, b.o, {'text': b.text, 'color': b.color, 'fontSize': b.fontSize, 'fonttype': b.fontType, 'angle': wmbasicMap[b.id].angle});
						}
						if(type < 500) { // basic element type
							basic.setIsElement(1);
							basic.centralize();
						}
						watermark.wm.addBasic(basic);
					}
					watermark.type = type;
					watermark.generateDomElement(container, i);
					currentWatermarks.push(watermark);
				}

				// update pagination
				updateWatermarkPagination(totalPages, number, container);

				return true;
			}
			function updateWatermarkPagination(total, number, wrapper) {

				var prevPage = $(".prevPage", wrapper);
				var nextPage = $(".nextPage", wrapper);

				$(".page", wrapper).remove();

				if(number == 1) {
					prevPage.addClass("disabled");
				}
				else {
					prevPage.removeClass("disabled");
				}
				if(number >= total) {
					nextPage.addClass("disabled");
				}
				else {
					nextPage.removeClass("disabled");
				}
				if(total == 0) {
					nextPage.hide();
					prevPage.hide();
				}
				else {
					nextPage.show();
					prevPage.show();
				}
				// display 5 pages
				var start = Math.max(1, number-2);
				var end = Math.min(total, number+2);
				for(var i=start; i<=end; i++) {
					var p = $('<a href="javascript:;" rel="#page' + i + '" class="page">' + i + '</a>');
					if(i == number) {
						p.addClass("currentPage");
					}
					nextPage.before(p);
				}
			}
			$("#wmstab .wmList .page").live("click", function() {
				var type = $("#wmstab li.active a").attr("rel").substr(8);
				var page = $(this).attr("rel").substr(5);
				toWatermarkPage(type, +page);
				return false;
			});
			$("#wmstab .wmList .prevPage").live("click", function() {
				if($(this).hasClass("disabled")) {
					return false;
				}
				var type = $("#wmstab li.active a").attr("rel").substr(8);
				var page = $("#wmstab .wmList .currentPage").attr("rel").substr(5);
				toWatermarkPage(type, +page-1);
				return false;
			});
			$("#wmstab .wmList .nextPage").live("click", function() {
				if($(this).hasClass("disabled")) {
					return false;
				}
				var type = $("#wmstab li.active a").attr("rel").substr(8);
				var page = $("#wmstab .wmList .currentPage").attr("rel").substr(5);
				toWatermarkPage(type, +page+1);
				return false;
			});
			$("#wmstab .wmSpecialList .page").live("click", function() {
				var type = $("#wmstab li.active a").attr("rel").substr(8);
				var page = $(this).attr("rel").substr(5);
				toWatermarkPage(type, +page);
				return false;
			});
			$("#wmstab .wmSpecialList .prevPage").live("click", function() {
				if($(this).hasClass("disabled")) {
					return false;
				}
				var type = $("#wmstab li.active a").attr("rel").substr(8);
				var page = $("#wmstab .wmSpecialList .currentPage").attr("rel").substr(5);
				toWatermarkPage(type, +page-1);
				return false;
			});
			$("#wmstab .wmSpecialList .nextPage").live("click", function() {
				if($(this).hasClass("disabled")) {
					return false;
				}
				var type = $("#wmstab li.active a").attr("rel").substr(8);
				var page = $("#wmstab .wmSpecialList .currentPage").attr("rel").substr(5);
				toWatermarkPage(type, +page+1);
				return false;
			});

			$("#wmstab .watermark").live("click", function() {
				var id = $(this).attr("id").substr(3);
				var item = currentWatermarks[+id].wm.clone();

				for(var i=0, max=item.length; i<max; i++) {
					if(item[i].getIsElement() === 1) {
						item[i].addAsElement();
						previewProduct.selectedBasic = item[i];
					}
				}
				previewProduct.domelement.trigger("addnewwatermark", [item]);
			});
			$(document).bind("keydown", function(evt) {
				if($(evt.target).attr("id") !== 'textcontent' && (evt.keyCode == 46 || evt.keyCode == 8)) {
					previewProduct.removeBasic(previewProduct.selectedBasic);
					return false;
				}
			});
			
			$(".product").live("click", function() {
				var anchor = $(this);
				// highlight this product
				$(".productShelf .product").removeClass("active");
				anchor.addClass("active");
				// update preview area
				var product = findProductInList(anchor.attr("id"));
				previewProduct.showProduct(product);

				if(textPanel) textPanel.deselect();
			});
			$(".deleteProduct").live("click", function() {
				var anchor = $(this);
				var pid = anchor.prev().attr("id");
				var product = findProductInList(pid);
				$.get("delp/a", {'id': pid}, function(result) {
					if(result.success == 0) {
						alert("与服务器连接失败");
						location.reload();
					}
					else {
						for(var i=0, max=productList.length; i<max; i++) {
							if(productList[i].id == pid) {
								productList.splice(i,1);
								break;
							}
						}
						getProductPage(currentProductNumber);
						$(".productShelf .product:eq(0)").trigger("click");

					}
				});
			});

			var productList = [];
			var productPerPage = 9;
			var currentProductNumber = 1;
			function getProductPage(number) {
				currentProductNumber = number;

				var start = (number-1)*productPerPage;
				var end = number*productPerPage;
				if(end > productList.length) {
					end = productList.length;
				}

				var container = $(".productShelf");
				$(".productWrapper", container).remove();
				for(var i=start; i<end; i++) {
					var now = productList[i];
					now.generateDomElement(container);
				}
				updateProductPagination(productList.length, number);
			}
			
			function updateProductPagination(length, number) {
				var wrapper = $(".productShelf");
				var prevPage = $(".mzc_toleft", wrapper);
				var nextPage = $(".mzc_toright", wrapper);

				var total = Math.floor(length/productPerPage);
				if(length % productPerPage !== 0) {
					total++;
				}
				if(number == 1) {
					prevPage.hide();
				}
				else {
					prevPage.show();
				}
				if(number == total) {
					nextPage.hide();
				}
				else {
					nextPage.show();
				}
			}
			$(".productShelf .mzc_toleft").live("click", function() {
				getProductPage(currentProductNumber-1);
			});
			$(".productShelf .mzc_toright").live("click", function() {
				getProductPage(currentProductNumber+1);
			});

			// 初始化preview模块
			var previewProduct = new SaleKing.Business.wmProductPreview($(".mzc_preview"), $("#previewimg"), $(".imgdetail:first"), $(".textdetail:first"),findProductInList);


			// 获得商品列表
			$.ajax({
				type: 'get',
				url: 'http://127.0.0.1/watermark/data/product.json',
				success: function(result) {
					if(result.success == 0) {
						alert("与服务器连接失败。");
						location.reload();
					}
					else {
						for(var i=0, max=result.prds.length; i<max; i++) {
							var product = new SaleKing.Business.wmProduct(result.prds[i]);
							productList.push(product);
						}
					}
				},
				dataType: 'json',
				async: false
			});

			// 获得商品水印列表 hash
			var productwmslist = {};
			// 获得水印的map
			var wmMap = [];
			var wmMapPages = 0;
			function updateWMMap(type, page, pagesize) {
				wmMap = [];
				wmMapPages = 0;
				$.ajax({
					type: 'get',
					url: 'http://127.0.0.1/watermark/data/wm.json',
					data: {'page': page, 'type': type, 'pagesize': pagesize}, // 得到第一页，常用的元素列表
					success: function(result) {
						if(result.success == 0) {
							alert("与服务器连接失败。");
							location.reload();
						}
						else {
							var wml = result.data.wml;
							// 把元素列表包装成水印
							wmMap = packBasicToWatermark(wml);
							wmMapPages = result.data.pages;

							for(var i=0, max=wml.length; i<max; i++) {
								wmbasicMap[wml[i].id] = {'image': wml[i].image, 'width': wml[i].w, 'height': wml[i].h};
							}
						}
					},
					dataType: 'json',
					async: false
				});
			}

			// 把商品水印应用于商品列表
			for(var i=0, max=productList.length; i<max; i++) {
				var now = productList[i];
				if(typeof productwmslist[now.id] !== "undefined") {
					var wms = productwmslist[now.id];
					for(var j=0, maxj=wms.wm.length; j<maxj; j++) {
						var wm = wms.wm[j];
						var wmbasic = {};
						if(wm.type === 'image') {
							wmbasic = new SaleKing.Business.WMBasic(wm.id, 'image', wm.x, wm.y, wm.w, wm.h, wm.a, wm.o, {'image': wmbasicMap[wm.id].image, 'imagewidth': wmbasicMap[wm.id].width, 'imageheight': wmbasicMap[wm.id].height});
						}
						else if(wm.type === 'text') {
							wmbasic = new SaleKing.Business.WMBasic(wm.id, wm.type, wm.x, wm.y, wm.w, wm.h, wm.a, wm.o, {'text': wm.text, 'color': wm.color, 'fontSize': wm.fontSize, 'fonttype': wm.fontType});
						}
						now.wm.addBasic( wmbasic );
					}
				}
			}

			/* 初始化页面初始状态 */
			getProductPage(1); // 初始化商品列表第一页
			$(".product:first").trigger("click"); // 选中第一个商品
			$("#wmstab li").eq(1).find('a').trigger("click"); // 显示第一个水印type

			// 水印编辑区域
			$(".previewButtons .cancel").live("click", function() {
				// apply wm in the original product to preview product
				var pid = previewProduct.productid;
				var product = findProductInList(pid);
				product.wm.basics = [];
				previewProduct.showProduct(product);
				delete previewProduct.selectedBasic;
				textPanel.deselect();
				previewProduct.domelement.trigger("changed");
			});
			
			$(".previewButtons .applyToAll").live("click", function() {
				// apply the preview product wm to all
				for(var i=0,max=productList.length; i<max; i++) {
					var basics = previewProduct.wm.clone();
					productList[i].wm.basics = basics;
					productList[i]._applyWMBasics();
				}
			});


			// upload watermark
			$("#wmtype_0 .upload a").live("click", function() {
				var input = $("#uploadWMInput");
				var button = $("#uploadWMBtn");
				button.text("上传中");
				$.ajaxFileUpload({
					url: '/promotion/upload',
					secureuri: false,
					fileElementId: 'uploadWMInput',
					dataType: 'json',
					success: function(data, status) {
						if(data.success == 0) {
							alert("上传失败");
							$("#uploadWMInput").val("");
						}
						else {
							button.text("确认上传");
							wmbasicMap[data.image.id] = {'image': data.image.image, 'width': data.image.w, 'height': data.image.h};
							toWatermarkPage(0, 1) // 已经上传了，刷新水印列表
						}
					}
				});
			});

			$("#colorPicker").jPicker({
				window: {
					expandable: true
				},
				images: {
					clientPath: '/static/i/'
				},
				color: {
					active: new $.jPicker.Color({ahex: 'ff0000ff'})
				}
			});

			
			var textPanel = new SaleKing.Business.TextPanel(previewProduct);
			previewProduct.setText(textPanel);
			
			$("#confirmText").live("click", function() {
				textPanel.refreshTextBasic();
				previewProduct._applyWMBasics();
				previewProduct.domelement.trigger("changed");
			});

			var sending = false;
			$("#startPromotionBtn").click(function() {
				if(sending) {
					return false;
				}
				sending = true;
				$("p.mzc_errorMsg").html('正在同步您设置的水印，请稍候...');
				$("p.mzc_errorMsg").show();
		   
				sendProductWMToServer();

				$.get('/promotion/complete/a', function(result) {
					if(result.success == 0) {
						$("p.mzc_errorMsg").hide();
					}
					else {
						window.location.href = '/promotion/complete';
					}
					sending = false;
				}, 'json');
			});
		},
		end:0
	});
	
	SaleKing.Business.CombineEdit = CombineEdit;
 	AppCore.register("sw_mod_editor", SaleKing.Business.CombineEdit);
	
 })(jQuery)