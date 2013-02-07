head.ready(function() {

	if($.browser.msie && $.browser.version == 6) {
		setTimeout("window.location.href='/user/browser'", 1);
	}
	
	swfobject.embedSWF("http://127.0.0.1/watermark/flex/iComb.swf", "iComb", "100", "100", "10.0.0", "http://127.0.0.1/watermark/flex/expressInstall.swf");
	
	var act_id = $("act_id").val();

	var debugMode = false;

	var sendToServerPerSeconds = 5 * 1000;
	var isProductWMUpdated = false;

	var fontTypeList = ['宋体','simhei'];
	var wmbasicMap = {};

	sendToServerPeriodically = function() {
		if(isProductWMUpdated) {
			isProductWMUpdated = false;
			sendProductWMToServer(true);
		}
		setTimeout('sendToServerPeriodically()', sendToServerPerSeconds);
	}
	//sendToServerPeriodically();

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
	function sendProductWMToServer(isAsync) {
	
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
		sendingData = true;
		var swf = document.getElementById("iComb");
		console.log(infoJson);
		swf.iCombineImage(infoJson);
		sendingData = false;
		
	}
	function get_unrotated_left_top(el) {

		var _x = 0; var _y = 0; while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {

		_x += el.offsetLeft; _y += el.offsetTop; el = el.offsetParent;

		} return { top: _y, left: _x };

	}

	/* 水印成分基础模块 */
	var WMBasic = $.jClass(null, {
		init: function(id, type, x, y, width, height, angle, opacity, attrs) { // x, y is the center of the WMBasic object
			/* set key attributes */
			this.id = id;
			this.hash = Math.random().toString(); // random value to distingush this element from others
			this.type = type;
			this.angle = angle;
			if(!this.angle) {
				this.angle = 0;
			}
			this.opacity = opacity;
			if(typeof this.opacity === "undefined") {
				this.opacity = 1;
			}
			this._setPosition(x, y);
			this._setSize(width, height);
			var instance = this;
			if(typeof attrs['image'] !== "undefined") {
				this.imageurl = attrs['image'];
				if(typeof attrs['imagewidth'] === "undefined") {
					$("<img/>").load(function() {
						instance.imagewidth = this.width;
						instance.imageheight = this.height;
					}).attr("src", this.imageurl);
				}
				else {
					this.imagewidth = attrs['imagewidth'];
					this.imageheight = attrs['imageheight'];
				}
			}
			if(typeof attrs['text'] !== "undefined") {
				this.text = attrs['text'];
				this.fonttype = attrs['fonttype'];
				this.color = attrs['color'];
				this.fontSize = attrs['fontSize'];
				this._setTextSize();
			}
		},
		// apply the watermark to a new container
		applyToContainer: function(container, editable) {
			// generate element
			this.element = this._generateWMBasic();
			this.element.data("hash", this.hash);
			this.container = container;
			this.container.append(this.element);

			// reset position
			this.containerWidth = this.container.width();
			this.containerHeight = this.container.height();

			if(this.addAsElement === 1) { // element re-calculate size
				delete this.addAsElement;
				var instance = this;
				if(this.type === 'image' && this.imagewidth < 300 && this.imageheight < 300) {
					instance._setSize(this.imagewidth, this.imageheight);
				}
			}
			this._applyToContainer_do(editable);
				//this._debugit();
		},
		setIsElement: function() {
			this.isElement = 1;
		},
		getIsElement: function() {
			return this.isElement;
		},
		// declear this element should be added as an element next time
		addAsElement: function() {
			this.addAsElement = 1;
		},
		centralize: function() {
			var instance = this;
			if(this.type == 'image') {
				if(typeof instance.imagewidth === "undefined") {
					$("<img/>").load(function() {
						instance.imagewidth = this.width;
						instance.imageheight = this.height;
						instance._center_it();
					}).attr("src", this.imageurl);
				}
				else {
					instance._center_it();
				}
			}
		},
		toJSONObject: function() {
			var ret = {};
			ret['id'] = this.id;
			ret['x'] = Math.floor(this.x);
			ret['y'] = Math.floor(this.y);
			ret['h'] = Math.floor(this.height);
			ret['w'] = Math.floor(this.width);
			ret['a'] = Math.floor(this.angle);
			ret['o'] = (+this.opacity).toFixed(2);
			ret['type'] = this.type;
			if(this.type == 'text') {
				// special attributes for text
				ret['fontSize'] = this.fontSize;
				ret['fontType'] = this.fonttype;
				if(this.color.indexOf("rgb") > -1) {
					ret['color'] = rgb2hex(this.color);
				}
				else {
					ret['color'] = this.color;
				}
				ret['text'] = this.text;
			}
			return ret;
		},
		clone: function() {
			var b = {};
			if(this.type === "image") {
				b = new WMBasic(this.id, this.type, this.x, this.y, this.width, this.height, this.angle, this.opacity,
								{'image': this.imageurl, 'imagewidth': this.imagewidth, 'imageheight': this.imageheight});
				b.setIsElement(this.getIsElement);
			}
			else if(this.type === "text") {
				b = new WMBasic(this.id, this.type, this.x, this.y, this.width, this.height, this.angle, this.opacity,
								{'text': this.text, 'fontSize': this.fontSize, 'fonttype': this.fonttype, 'color': this.color});
			}
			return b;
		},
		updateText: function(attrs) {
			this.fonttype = attrs['fonttype'];
			this.text = attrs['text'];
			this.color = attrs['color'];
			this._setTextSize();
		},
		_center_it: function() {
			var w = this.imagewidth;
			var h = this.imageheight;
			var i = 1.5;
			do {
				aw = w*i;
				ah = h*i;
				i += 0.5;
			} while(aw < 1000 && ah < 1000);
			aw = w*(i-1);
			ah = h*(i-1);
			this._setSize(aw, ah);
			this._setPosition(500, 500);
		},
		_applyToContainer_do: function(editable) {
			this.element.css("left", +this._getRealLeft() + "px")
						.css("top", +this._getRealTop() + "px")
						.css("width", this._getRealWidth() + "px")
						.css("height", this._getRealHeight() + "px");

			this.element.jqrotate(this.angle);
			this.element.css("opacity", this.opacity);
			this.element.css('filter', 'alpha(opacity=' + Math.floor((+this.opacity)*100)  + ')');

			if(editable) {
				this._setDraggable();
				this._setRotatable();
				this._setOpacitable();
			}
			if(this.type === 'image') {
				this._imageInit(editable);
			}
			else if(this.type === 'text') {
				this._textInit(editable);
			}
		},
		/*
		 * initialize as image, inner tag: img
		 */
		_imageInit: function(editable) {
			this.image = $("img", this.element);

			var instance = this;
			this.image.load(function() {
				instance.image.unbind("load");
				instance.element.imagefill();
			});

			if(editable) {
				this._setResizable();
			}
			this.element.imagefill();
		},
		/*
		 * initialize as text, inner tag: span
		 */
		_textInit: function(editable) {
			var w = this._getRealWidth();
			var h = this._getRealHeight();
			this.element.css("width", w + "px");
			this.element.css("height", h + "px");
			//this.fontSize = this._scaleFontSize();

			// resizeable
			if(editable) {
				this._setResizable();
			}
			this.element.textfill();
		},
		/* formalize wmbasic position to 1000*1000 grids  */
		_setPosition: function(x, y) {
			this.x = x;
			this.y = y;
		},
		/* formalize wmbasic size to 1000*1000 grids  */
		_setSize: function(width, height) {
			var w0 = this.width;
			var h0 = this.height;
			this.width = Math.floor(width);
			this.height = Math.floor(height);

			if(typeof w0 !== "undefined") {
				this._setPosition(this.x+(this.width-w0)/2, this.y+(this.height-h0)/2);
			}
		},
		/* 将 width和height转化成实际大小 */
		_getRealWidth: function() {
			return Math.floor(this.width/1000*this.containerWidth);
		},
		_getRealHeight: function() {
			return Math.floor(this.height/1000*this.containerHeight);
		},
		_getRealFontSize: function() {
			return this.fontSize/1000*this.containerWidth;
		},
		_getRealLeft: function() {
			return (this.x-this.width/2)/1000*this.containerWidth;
		},
		_getRealTop: function() {
			return (this.y-this.height/2)/1000*this.containerHeight;
		},
		/* 将 x和y转化成实际x,y */
		_getRealX: function() {
			return this.x/1000*this.containerWidth;
		},
		_getRealY: function() {
			return this.y/1000*this.containerHeight;
		},
		/* 生成水印element的html */
		_generateWMBasic: function() {
			var div = $('<div class="wmBasic"></div>');
			if(this.type === "text") {
				div.append('<span>' + this.text + '</span>')
				   .addClass("textBasic")
				   .find('span')
				   .css('font-family', fontTypeList[this.fonttype])
				   .css('font-size', this.fontSize)
				   .css('color', this.color);
			}
			else if(this.type === "image") {
				div.append('<img src="' + this.imageurl + '"/>')
				   .addClass("imageBasic");
			}
			div.append("<div class='selectedBorder'></div>");
			return div;
		},
		_setDraggable: function() {

			var tolerance = 0;
			if(this.type === 'text') {
				tolerance = 0;
			}

			var instance = this;
			var instanceContainer = this.container;
			// draggable
			this.element.draggable({
				scroll: false,
				snap: ".mzc_preview",
				snapTolerance: tolerance,
				stop: function(event, ui) { /* record new position */
					var stoppos = get_unrotated_left_top($(this)[0]);
					var left = stoppos.left - instance.container.offset().left;
					var top = stoppos.top - instance.container.offset().top;

					instance._setPosition(left/instance.containerWidth*1000+instance.width/2, top/instance.containerWidth*1000+instance.height/2);

					//instance._debugit();
					// drag out of the container, remove the element
					if(left < -1*instance._getRealWidth() || left > instance.containerWidth || top < -1*instance._getRealHeight() || top > instance.containerHeight) {
						instanceContainer.trigger("dragoutside", [instance]);
					}

					//instance.element.trigger("click");

					if(!$.browser.msie) {
						instance.element.jqrotate(instance.angle);
					}

					instanceContainer.trigger("changed");
				}
			});
		},
		_setResizable: function() {
			// resizeable
			var instance = this;
			this.element.resizable({
				aspectRatio: this.width/this.height,
				start: function(event, ui) {
					$("img", instance.element).css("opacity", 0.5);
					if(!($.browser.msie && $.browser.version < 9) ) {
						$("img", instance.element).css('filter', 'alpha(opacity=' + 50  + ')');
					}
				},
				stop: function(event, ui) {
					$("img", instance.element).css("opacity", 1);
					if(!($.browser.msie && $.browser.version < 9) ) {
						$("img", instance.element).css('filter', 'alpha(opacity=' + 100  + ')');
					}
					instance._setSize(instance.element.width()/instance.containerWidth*1000, instance.element.height()/instance.containerHeight*1000);

					if(instance.type === "text") {
						instance.element.textfill({maxFontPixels: 1000});
						instance.fontSize = instance._scaleFontSize();
					}
					else if(instance.type === "image") {
						instance.element.imagefill();
					}
					//instance._debugit();
					instance.container.trigger("changed");
				}
			});
			this.element.css("position", "absolute");
		},
		_setRotatable: function() {
			this.element.append("<div class='ui-rotatable-handle'></div>");

			this.element.data("instance", this);
			$(".ui-rotatable-handle", this.element).hover(
				function(event) {
					$(this).parent().addClass("ui-rotatable-mode");
				},
				function() {
					$(this).parent().removeClass("ui-rotatable-mode");
				}
			);
			var temp = {};
			$(".ui-rotatable-handle", this.element).draggable({
				helper: function() {
					return $('<div class="ui-rotatable-handle ui-draggable" style="visibility:hidden;"></div>');
				},
				start: function(event, ui) {

					if($.browser.msie) {
						return false;
					}

					var instance = $(this).parent().data("instance");
					temp.startx = event.pageX;
					temp.starty = event.pageY;
					var w = instance._getRealWidth();
					var h = instance._getRealHeight();
					temp.x3 = instance.container.position().left + instance._getRealX();
					temp.y3 = instance.container.position().top + instance._getRealY();
					temp.angle = instance.angle;
				},
				drag: function(event, ui) {
					var instance = $(this).parent().data("instance");
					var x1 = event.pageX;
					var y1 = event.pageY;
					var x2 = temp.startx;
					var y2 = temp.starty;
					var x3 = temp.x3;
					var y3 = temp.y3;

					var d1 = Math.sqrt( Math.abs(x3-x2)*Math.abs(x3-x2)+Math.abs(y3-y2)*Math.abs(y3-y2) )
					var d2 = Math.sqrt( Math.abs(x1-x2)*Math.abs(x1-x2)+Math.abs(y1-y2)*Math.abs(y1-y2) );
					var d3 = Math.sqrt( Math.abs(x1-x3)*Math.abs(x1-x3)+Math.abs(y1-y3)*Math.abs(y1-y3) );

					var a = y2-y3, b = x3-x2, c = x2*y3-x3*y2;
					var d = a*x1+b*y1+c;


					var deg = Math.acos( (d1*d1+d3*d3-d2*d2)/(2*d1*d3) );

					deg = deg*180/Math.PI;

					if(d > 0) {
						deg = -1*deg;
					}


					instance.element.addClass("ui-rotatable-mode");
					instance.element.jqrotate(temp.angle + deg);

					instance.angle = temp.angle + deg;

				},
				stop: function(event, ui) {
					var instance = $(this).parent().data("instance");
					instance.element.removeClass("ui-rotatable-mode");
					instance.container.trigger("changed");
				}

			});
		},
		_setOpacitable: function() {
			var instance = this;
			this.element.mousewheel(function(evt, delta) {
				var to = delta * 0.1;
				instance.opacity = (+instance.opacity) + to;
				if(instance.opacity < 0.1) {
					instance.opacity = 0;
				}
				else if(instance.opacity > 0.9) {
					instance.opacity = 1;
				}
				instance.element.css("opacity", instance.opacity);
				instance.element.css('filter', 'alpha(opacity=' + Math.floor((+instance.opacity)*100)  + ')');
				instance.container.trigger("changed");
				return false;
			});
		},
		_scaleFontSize: function() {
			var t = $("<div/>");
			t.css("width", this.width + "px")
				.css("height", this.height + "px")
				.css("opacity", 0)
				.css("position", 'absolute')
				.css("font-family", fontTypeList[this.fonttype])
				.append("<span>" + this.text + "</span>")
				.appendTo($("body"))
				.textfill({maxFontPixels: 1000});

			var size = $("span", t).css("font-size");

			t.remove();
			return +(size.substr(0, size.length-2));

		},
		_setTextSize: function() {
			var t = $("<span>" + this.text + "</span>").css("font-size", this.fontSize+"px")
								.css("opacity", 0)
								.css("position", 'absolute')
								.css('font-family', fontTypeList[this.fonttype])
								.appendTo($("body"));
			this.width = t.width();
			this.height = t.height();

			t.remove();
		},
		_debugit: function() {
			if(debugMode) {
				console.log('width:', this.width, 'height:',
						this.height, 'x:', this.x, 'y:', this.y,
						'containerWidth:', this.containerWidth, 'containerHeight:', this.containerHeight,
						'realX', this._getRealX(), 'realY', this._getRealY(), 'realWidth', this._getRealWidth(), 'realHeight', this._getRealHeight() );
			}
		}
	});

	/* 水印模块 */
	var WM = $.jClass(null, {
		init: function() {
			this.basics = [];
		},
		addBasic: function(basic) {
			this.basics.push(basic);
		},
		removeBasic: function(id) {
			for(var i=0, max=this.basics.length; i<max; i++) {
				if(id === this.basics[i].id) {
					this.basics.splice(i, 1);
					break;
				}
			}
		},
		removeBasicByHash: function(hash) {
			for(var i=0, max=this.basics.length; i<max; i++) {
				if(hash === this.basics[i].hash) {
					this.basics.splice(i, 1);
					break;
				}
			}
		},
		selectBasicByHash: function(hash) {
			for(var i=0, max=this.basics.length; i<max; i++) {
				if(hash === this.basics[i].hash) {
					return this.basics[i];
				}
			}
			return false;
		},
		clone: function() {
			basics = this.basics;
			var ret = [];
			for(var i=0, max=basics.length; i<max; i++) {
				var item = basics[i];
				var b = item.clone();
				ret.push(b);
			}
			return ret;
		}
	});

	/* 水印列表模块，水印列表模块其实就是商品为空的水印商品模块,在水印模块的基础上包一层应用的api */
	var wmWatermark = $.jClass(null, {
		init: function() {
			this.wm = new WM(); // WM on the product
		},
		type: 0,
		generateDomElement: function(container, id) {
			var html = $('<a href="javascript:;" class="watermark" id="wm_' + id + '">' +
						'</a>');
			this.domelement = html;

			container.append(html);

			this._applyWMBasics();

			return html;

		},
		canDragToPreivew: function() {
			var instance = this;
			var instanceContainer = this.container;
			// draggable
			this.domelement.draggable({
				scroll: false,
				snap: ".mzc_preview",
				snapMode: "inner",
				snapTolerance: "8",
				opacity: 0.7,
				helper: "clone",
				stop: function(event, ui) { /* record new position */
					var stoppos = ui.offset;

					var preview = $(".mzc_preview");
					var left = preview.offset().left;
					var top = preview.offset().top;
					var right = left + preview.width();
					var bottom = top + preview.height();

					//console.log(left, top, right, bottom, stoppos.left, stoppos.top, instance.domelement.height(), instance.domelement.width());

					if(stoppos.top >= top && stoppos.left >= left
						&& stoppos.top+instance.domelement.height() <= bottom && stoppos.left+instance.domelement.width() <= right) { // 在preview中创建一个clone

						var item = instance.wm.clone();
						var bleft = stoppos.left - left;
						var btop = stoppos.top - top;
						for(var i=0, max=item.length; i<max; i++) {
							if(item[i].getIsElement() === 1) {
								item[i].addAsElement();
								if(instance.type != 108) {
									item[i]._setPosition(bleft/preview.width()*1000+item[i].width/2, btop/preview.height()*1000+item[i].height/2);
									var ratio = 84/310;
									item[i]._setSize(ratio*item[i].width, ratio*item[i].height);
								}
								else {
									item[i]._setPosition(500, 500);
								}
							}
						}
						preview.trigger("addnewwatermark", [item]);

					}

				}
			});
		},
		_applyWMBasics: function() {
			$(".wmBasic", this.domelement).remove();
			for(var i=0, max=this.wm.basics.length; i<max; i++) {
				this.wm.basics[i].applyToContainer(this.domelement, false);
			}
			this.canDragToPreivew();
		}
	});
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
			var watermark = new wmWatermark();
			var wm = wms[i];
			for(var j=0, maxj=wm.length; j<maxj; j++) {
				var b = wm[j];
				var basic = {};
				if(b.type === 'image') {
					basic = new WMBasic(b.id, b.type, b.x, b.y, b.w, b.h, b.a, b.o, {'image': wmbasicMap[b.id].image, 'imagewidth': wmbasicMap[b.id].width, 'imageheight': wmbasicMap[b.id].height});
				}
				else if(b.type === 'text') {
					basic = new WMBasic(b.id, b.type, b.x, b.y, b.w, b.h, b.a, b.o, {'text': b.text, 'color': b.color, 'fontSize': b.fontSize, 'fonttype': b.fontType, 'angle': wmbasicMap[b.id].angle});
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

	/* 水印商品模块 */
	var wmProduct = $.jClass(null, {
		init: function(info) {
			this.info = info;
			this.id = info.num_iid;
			this.imageurl = info.pic_url;
			this.wm = new WM(); // WM on the product
		},
		generateDomElement: function(container) {
			var html = $('<div class="productWrapper">' +
							'<a href="javascript:;" class="product" id="' + this.id + '">' +
								'<img class="productImage" src="' + this.imageurl + '_70x70.jpg" />' +
							'</a>' +
							'<a href="javascript:;" class="deleteProduct">删除商品</a>' +
						'</div>');


			this.domelement = $(".product", html);

			container.append(html);

			this._applyWMBasics();

			return html;

		},
		_applyWMBasics: function() {
			if(typeof this.domelement === "undefined") {
				return false;
			}
			$(".wmBasic", this.domelement).remove();
			for(var i=0, max=this.wm.basics.length; i<max; i++) {
				this.wm.basics[i].applyToContainer(this.domelement, false);
			}
			return true;
		}
	});

	/* 水印preview模块 */
	var wmProductPreview = $.jClass(null, {
		init: function(domelement, imageelement, imgModifyArea, textModifyArea) {
			this.domelement = domelement;
			this.image = imageelement;
			this.imgModifyArea = imgModifyArea;
			this.textModifyArea = textModifyArea;
			this.productid = -1;
			this.selectedBasic = {};
			this.wm = {};
			this.loading = false;
			var instance = this;
			this.domelement.bind("dragoutside", function(event, basic) {  // remove element
				instance.removeBasic(basic);
			});

			$("body").bind("click", function(event) {
				var target = $(event.target);
				var basic = instance.selectedBasic;
				if(typeof basic !== "undefined") {
					if( basic.type == 'text' && (target.hasClass("mzc_inner") || target.hasClass("mzc_pageWrapper") || target.hasClass("imagewrapper") || target.parent().hasClass("imagewrapper"))) {
						delete instance.selectedBasic;
						textPanel.deselect();
						instance._applyWMBasics();
					}
					else if( basic.type == 'image' && (target[0].tagName !== 'A' || target.attr("rel") !== '#wmstab') ) {
						delete instance.selectedBasic;
						instance._applyWMBasics();
					}
				}
			});
			$(this.domelement).bind("addnewwatermark", function(event, item) {
				for(var i=0, max=item.length; i<max; i++) {
					instance.wm.addBasic(item[i]);
				}
				instance._applyWMBasics();
				instance.domelement.trigger("changed");
			});
			$(this.domelement).bind("changed", function(event) {
				instance._changeProduct();
			});
		},
		removeBasic: function(basic) {
			$("#tooltip").remove();
			this.wm.removeBasicByHash(basic.hash);
			delete this.selectedBasic;
			textPanel.deselect();
			this._applyWMBasics();
			this._changeProduct();
		},
		showProduct: function(product) {
			// update class parameters
			this.wm = new WM();
			this.wm.basics = product.wm.clone();
			this.productid = product.id;

			var instance = this;

			// update dom elements
			$(".wmBasic", this.domelement).remove();
			this.image.attr("src", "./i/loadingPage3.gif");

			$("<img/>").load(function() {

				if(instance.productid != product.id) {
					return false;
				}

				instance.image.attr("src", product.imageurl + "_310x310.jpg");
				instance._applyWMBasics();

			}).attr("src", product.imageurl + "_310x310.jpg");

		},
		_changeProduct: function() {
			// apply wm in preview product wm to the original product
			var pid = this.productid;
			var product = findProductInList(pid);
			product.wm.basics = this.wm.clone();
			product._applyWMBasics();
			isProductWMUpdated = true;
		},
		_applyWMBasics: function() {

			if(typeof this.wm.basics === "undefined") {
				return false;
			}

			$(".wmBasic", this.domelement).remove();
			for(var i=0, max=this.wm.basics.length; i<max; i++) {
				// generate wm in preview area
				this.wm.basics[i].applyToContainer(this.domelement, true);
			}
			if(typeof this.selectedBasic !== "undefined") {
				var basic = this.wm.selectBasicByHash(this.selectedBasic.hash);
				if(typeof basic.element !== "undefined") {
					basic.element.addClass("selected");
				}
			}

			var instance = this;

			$(".wmBasic", this.domelement).bind("click", function(event) { // 单击选中
				instance.loading = true;
				var archor = $(this);
				var hash = archor.data("hash");
				var basic = instance.wm.selectBasicByHash(hash);
				instance.selectedBasic = basic;
				instance._applyWMBasics();

				if(basic.type === "text") { // update textPanel
					textPanel.applyBasic(basic);
				}
				else if(basic.type === "image") {
					$(".wmShelf .tabs a:eq(0)").trigger("click");
				}
				instance.loading = false;
				return false;
			});
		},
		_addToImgModifyList: function(nowwm) {
			var ele = $('<div class="wmimage">' +
							'<div class="imagewrapper">' +
								'<img src="' + nowwm.imageurl + '" />' +
							'</div>' +
						'</div>');

			$(".wmimage:last", this.imgModifyArea).before(ele);
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
				toProductPage(currentProductNumber);
				$(".productShelf .product:eq(0)").trigger("click");

			}
		});
	});

	var productList = [];
	var productPerPage = 9;
	var currentProductNumber = 1;
	function toProductPage(number) {
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
		toProductPage(currentProductNumber-1);
	});
	$(".productShelf .mzc_toright").live("click", function() {
		toProductPage(currentProductNumber+1);
	});

	// 初始化preview模块
	var previewProduct = new wmProductPreview($(".mzc_preview"), $("#previewimg"), $(".imgdetail:first"), $(".textdetail:first"));


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
					var product = new wmProduct(result.prds[i]);
					productList.push(product);
				}
			}
		},
		dataType: 'json',
		async: false
	});



	// 获得商品水印列表 hash
	var productwmslist = {};
	/* var used_ids = [];
	$.ajax({
		type: 'get',
		url: '/promotion/save_get/a',
		data: {'type': 'new3discount'},
		success: function(result) {
			if(result.success == 0) {
				alert("与服务器连接失败");
				location.reload();
			}
			else {
				if(result.data !== "") {
					productwmslist = $.parseJSON(result.data);
				}
				used_ids = result.used_ids
			}
		},
		dataType: 'json',
		async: false
	});

	// 获得水印元素map
	$.ajax({
		type: 'post',
		url: 'http://127.0.0.1/watermark/data/wm_list2.json',
		data: {'ids':used_ids.join(',')},
		success: function(result) {
			if(result.success == 0) {
				alert("与服务器连接失败。");
				location.reload();
			}
			else {
				var list = result.imagelist;
				for(var i=0, max=list.length; i<max; i++) {
					wmbasicMap[list[i].id] = {'image': list[i].image, 'width': list[i].w, 'height': list[i].h};
				}
			}
		},
		dataType: 'json',
		async: false
	}); */
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
					wmbasic = new WMBasic(wm.id, 'image', wm.x, wm.y, wm.w, wm.h, wm.a, wm.o, {'image': wmbasicMap[wm.id].image, 'imagewidth': wmbasicMap[wm.id].width, 'imageheight': wmbasicMap[wm.id].height});
				}
				else if(wm.type === 'text') {
					wmbasic = new WMBasic(wm.id, wm.type, wm.x, wm.y, wm.w, wm.h, wm.a, wm.o, {'text': wm.text, 'color': wm.color, 'fontSize': wm.fontSize, 'fonttype': wm.fontType});
				}
				now.wm.addBasic( wmbasic );
			}
		}
	}



	/* 初始化页面初始状态 */
	toProductPage(1); // 初始化商品列表第一页
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
		isProductWMUpdated = true;
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

	function changeToTab(anchor) {
		var tabs = anchor.parent();
		var content = $(".wmShelf .tabContentDiv");

		$(".tab", tabs).removeClass("active");
		anchor.addClass("active");
		content.hide();

		var links = anchor.attr("rel").split('^');
		
		$("#"+links[0].substr(1)).show();
		
		if(links.length > 1) {
			$("a[rel='"+links[1]+"']").trigger("click");
		}

		return false;

	}
	$(".wmShelf .tabs .tab").bind("click", function() {
		var anchor = $(this);
		changeToTab(anchor);
	});

	// prepare the page
	$(".mzc_roundedImg").each(function() {
		var anchor = $(this);
		anchor.wrap(function(){
			return '<span class="' + anchor.attr('class') +
				'" style="background:url(' + anchor.attr('src') + ') no-repeat center center;" />';
		});
		anchor.css("opacity","0");
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

	/* 文字展示panel对象 */
	var TextPanel = $.jClass(null, {
		init: function(previewObj) {
			this.container = $("#texttab");
			this.textArea = $("#textcontent", this.container);
			this.colorArea = $(".jPickerWrapper .Color", this.contianer);
			this.fonttypeArea = $("#textfont", this.container);
			this.previewObj = previewObj;
			this.confirmBtn = $("#confirmText");
			this.editBtn = $("#editText");
			$("#editText").hide();

			var instance = this;
			$(this.textArea).keyup(function() {
				instance._editText();
			});
			$(this.fonttypeArea).change(function() {
				instance._editText();
			});
			$(".QuickColor").live("hover", function() {
				instance._editText();
			});
		},
		refreshTextBasic: function() {
			var text = this.textArea.val();
			var color = this.colorArea.css("background-color");
			var fonttype = $("option:selected", this.fonttypeArea).val();

			if($.trim(text) === "") {
				if(!this.confirmBtn.is(":visible")) {
					previewProduct.removeBasic(previewProduct.selectedBasic);
				}
				else {
					alert("文字内容不能为空哦");
				}
				return false;
			}

			if(typeof this.textbasic === "undefined" || typeof this.previewObj.selectedBasic === "undefined" || this.textbasic.hash !== this.previewObj.selectedBasic.hash) {
				var textbasic = new WMBasic(0, 'text', 200, 200, 200, 200, 0, 100, {'text': text, 'color': color, 'fonttype': fonttype, 'fontSize': 100});
				textbasic.setIsElement();

				this.textbasic = textbasic;

				this.previewObj.selectedBasic = textbasic;
				this.previewObj.wm.addBasic(textbasic);
			}
			else {
				this.textbasic.updateText({'text': text, 'color': color, 'fonttype': fonttype});
			}
			this.confirmBtn.hide();
			this.editBtn.show();
			return this.textbasic;
		},
		applyBasic: function(basic) {
			this.textbasic = basic;
			var text = basic.text;
			var color = basic.color;
			var fontSize = basic.fontSize;
			var fonttype = basic.fonttype;
			this.textArea.val(text);
			this.colorArea.css("background-color", color);
			$("option[value='" + fonttype + "']", this.fonttypeArea).prop("selected", true);

			this.confirmBtn.hide();
			this.editBtn.show();

			changeToTab($(".wmShelf .tabs a[rel='#texttab']"));

		},
		deselect: function() {
			this.confirmBtn.show();
			this.editBtn.hide();
		},
		_editText: function() {
			if(!this.confirmBtn.is(":visible")) {
				textPanel.refreshTextBasic();
				previewProduct._applyWMBasics();
				previewProduct.domelement.trigger("changed");
			}
		}
	});
	var textPanel = new TextPanel(previewProduct);
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
   
		sendProductWMToServer(false);

		$.get('/promotion/complete/a', function(result) {
			if(result.success == 0) {
				$("p.mzc_errorMsg").hide();
				alert(result.msg);
			}
			else {
				window.location.href = '/promotion/complete';
			}
			sending = false;
		}, 'json');
	});

	$(".removeAllWM").live('click', function() {
		var ok = confirm('您确定要删除所有设置中商品的水印吗？');
		if(ok) {
			$(".previewButtons .cancel").trigger('click');
			$(".previewButtons .applyToAll").trigger('click');
		}
	});


});

// local storage

