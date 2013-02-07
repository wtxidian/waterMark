!(function($){
	
	var Sandbox,
	configs = {
		debugMode:false,
		fontTypeList:['宋体','simhei'],
		end:0
	};

	function WMBasic( id, type, x, y, width, height, angle, opacity, attrs ) {
		this.init(id, type, x, y, width, height, angle, opacity, attrs);
	}
	
	$.extend(WMBasic.prototype,{	
			
		// x, y is the center of the WMBasic object	
		init: function(id, type, x, y, width, height, angle, opacity, attrs) {
			
			this.config = $.extend(true, {}, configs, {});
			
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
			this._debugit();
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

			this.element.rotate(this.angle);
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
				   .css('font-family', this.config.fontTypeList[this.fonttype])
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
					var stoppos = instance._get_unrotated_left_top($(this)[0]);
					var left = stoppos.left - instance.container.offset().left;
					var top = stoppos.top - instance.container.offset().top;

					instance._setPosition(left/instance.containerWidth*1000+instance.width/2, top/instance.containerWidth*1000+instance.height/2);

					instance._debugit();
					// drag out of the container, remove the element
					if(left < -1*instance._getRealWidth() || left > instance.containerWidth || top < -1*instance._getRealHeight() || top > instance.containerHeight) {
						instanceContainer.trigger("dragoutside", [instance]);
					}

					if(!$.browser.msie) {
						instance.element.rotate(instance.angle);
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
					
					instance.container.trigger("changed");
				}
			});
			this.element.css("position", "absolute");
		},
		_setRotatable: function() {
			
			if($.browser.msie) {
				return false;
			}
					
			this.element.append("<div class='ui-rotatable-handle'></div>");

			this.element.data("instance", this);
		
			$(".ui-rotatable-handle", this.element).hover(
				function() {
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
				start: function(e, ui) {

					var instance = $(this).parent().data("instance");
					temp.startx = e.pageX;
					temp.starty = e.pageY;
					var w = instance._getRealWidth();
					var h = instance._getRealHeight();
					temp.x3 = instance.container.position().left + instance._getRealX();
					temp.y3 = instance.container.position().top + instance._getRealY();
					temp.angle = instance.angle;
				},
				drag: function(e, ui) {
					var instance = $(this).parent().data("instance");
					var x1 = e.pageX;
					var y1 = e.pageY;
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
					instance.element.rotate(temp.angle + deg);
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
				.css("font-family", this.config.fontTypeList[this.fonttype])
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
								.css('font-family', this.config.fontTypeList[this.fonttype])
								.appendTo($("body"));
			this.width = t.width();
			this.height = t.height();

			t.remove();
		},
			
		_get_unrotated_left_top:function(el) {

			var _x = 0; var _y = 0; while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {

			_x += el.offsetLeft; _y += el.offsetTop; el = el.offsetParent;

			} return { top: _y, left: _x };
		},
			
		_debugit: function() {
			if(this.config.debugMode) {
				console.log('width:', this.width, 'height:',
						this.height, 'x:', this.x, 'y:', this.y,
						'containerWidth:', this.containerWidth, 'containerHeight:', this.containerHeight,
						'realX', this._getRealX(), 'realY', this._getRealY(), 'realWidth', this._getRealWidth(), 'realHeight', this._getRealHeight() );
			}
		},

		end:0
	});

	SaleKing.Business.WMBasic = WMBasic;

})(jQuery);