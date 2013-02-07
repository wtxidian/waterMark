!(function($){
	
	var Sandbox,
	configs = {
		end:0
	};

	function TextPanel( info ) {
		this.init(info);
	}
	
	$.extend(TextPanel.prototype,{	
			
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
			
			$(".wmShelf .tabs .tab").bind("click", function() {
				var anchor = $(this);
				instance._changeToTab(anchor);
			});
			
		},
		refreshTextBasic: function() {
			var text = this.textArea.val();
			var color = this.colorArea.css("background-color");
			var fonttype = $("option:selected", this.fonttypeArea).val();

			if($.trim(text) === "") {
				if(!this.confirmBtn.is(":visible")) {
					this.previewObj.removeBasic(this.previewObj.selectedBasic);
				}
				else {
					alert("文字内容不能为空哦");
				}
				return false;
			}

			if(typeof this.textbasic === "undefined" || typeof this.previewObj.selectedBasic === "undefined" || this.textbasic.hash !== this.previewObj.selectedBasic.hash) {
				var textbasic = new SaleKing.Business.WMBasic(0, 'text', 200, 200, 200, 200, 0, 100, {'text': text, 'color': color, 'fonttype': fonttype, 'fontSize': 100});
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

			this._changeToTab($(".wmShelf .tabs a[rel='#texttab']"));

		},
		deselect: function() {
			this.confirmBtn.show();
			this.editBtn.hide();
		},
		_editText: function() {
			if(!this.confirmBtn.is(":visible")) {
				this.refreshTextBasic();
				this.previewObj._applyWMBasics();
				this.previewObj.domelement.trigger("changed");
			}
		},
		
		_changeToTab:function(anchor) {
		
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

		},
		end:0
	});

	SaleKing.Business.TextPanel = TextPanel;

})(jQuery);