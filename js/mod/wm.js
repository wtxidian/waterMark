!(function($){
	
	var Sandbox,
	configs = {
		end:0
	};

	function WM( ops ) {
		this.init(ops);
	}
	
	$.extend(WM.prototype,{	
			
		init: function(ops) {
			
			this.basics = [];
			this.configs = $.extend(true, {}, configs, ops);
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
		},
		end:0
	});

	SaleKing.Business.WM = WM;

})(jQuery);


/////////////////////////////////////////////////////////////////////////////////
//////////////////////////wmWatermark///////////////////////////////////////////
!(function($){
	
	var Sandbox,
	configs = {
		end:0
	};

	function wmWatermark( ops ) {
		this.init(ops);
	}
	
	$.extend(wmWatermark.prototype,{	
			
		init: function() {
			this.wm = new SaleKing.Business.WM(); // WM on the product
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
		},
		end:0
	});

	SaleKing.Business.wmWatermark = wmWatermark;

})(jQuery);