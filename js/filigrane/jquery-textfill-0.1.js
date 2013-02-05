; (function($) {
	/**
	* Resizes an inner element's font so that the inner element completely fills the outer element.
	* @author Russ Painter WebDesign@GeekyMonkey.com
	* @version 0.1
	* @param {Object} Options which are maxFontPixels (default=40), innerTag (default='span')
	* @return All outer elements processed
	* @example <div class='mybigdiv filltext'><span>My Text To Resize</span></div>
	*/
	$.fn.textfill = function(options) {
		var defaults = {
			maxFontPixels: 1000,
			innerTag: 'span'
		};
		var Opts = jQuery.extend(defaults, options);
		return this.each(function() {
			var fontSize = 1;
			var ourText = $(Opts.innerTag + ':visible:first', this);
			ourText.css("display", "inline");
			var maxHeight = $(this).height();
			var maxWidth = $(this).width();
			var textHeight;
			var textWidth;

            var low = 1;
            var high = Opts.maxFontPixels;
            while(low <= high) {
                var mid = Math.floor(low+high)/2;
                ourText.css('font-size', mid);
				textHeight = ourText.height();
				textWidth = ourText.width();

                if(textHeight < maxHeight && textWidth < maxWidth) {
                    fontSize = mid;
                    low = mid+1;
                }
                else {
                    high = mid-1;
                }
            }


            do {
                ourText.css('font-size', fontSize);
				textHeight = ourText.height();
				textWidth = ourText.width();
				fontSize = fontSize + 0.5;
            } while((textHeight < maxHeight && textWidth < maxWidth) && fontSize < Opts.maxFontPixels);
            ourText.css('font-size', fontSize-1);

			ourText.css("display", "block").css("width", "100%").height("100%");
		});
	};
	$.fn.imagefill = function(options) {
		var defaults = {
			innerTag: 'img'
		};
		var Opts = jQuery.extend(defaults, options);
		return this.each(function() {
			var image = $(Opts.innerTag + ':visible:first' ,this);
			image.css("width", $(this).width() + "px");
			image.css("height", $(this).height() + "px");
		});
	}
	$.fn.imageadjust = function(options) {
		var defaults = {
			innerTag: 'img'
		};
		var Opts = jQuery.extend(defaults, options);
		return this.each(function() {
			var image = $(Opts.innerTag + ':visible:first', this);
            wWidth = $(this).width();
            wHeight = $(this).height();
			var mw = image.width();
    		var mh = image.height();
    		var rw = wWidth/mw;
    		var rh = wHeight/mh;
    		var ratio = rw < rh ? rw : rh;
    		if(ratio < 1) {
    			image.css("width", Math.floor(mw*ratio) + "px");
    			image.css("height", Math.floor(mh*ratio) + "px");
    		}
    		else {
    			image.css("width", "auto");
    			image.css("height", "auto");
    		}
		});
	}
})(jQuery);

