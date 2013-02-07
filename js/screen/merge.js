(function(){

	var loadUriList = [];
	ImportJS = {
		url:function(url){
			loadUriList.push(url);
		}
	}
	setTimeout(function(){
		if(loadUriList.length > 0){
			AsyncLoader.js.apply(this, loadUriList);
		}
	}, 100);
})();

ImportJS.url("http://127.0.0.1/watermark/js/libs/jquery-1.6.4.min.js");
ImportJS.url("http://127.0.0.1/watermark/js/libs/seed/core.js");

ImportJS.url("http://127.0.0.1/watermark/js/plugins/jquery.jclass.js");
ImportJS.url("http://127.0.0.1/watermark/js/plugins/jquery.tmpl.min.js");
ImportJS.url("http://127.0.0.1/watermark/js/plugins/knockout-1.2.1.js");
ImportJS.url("http://127.0.0.1/watermark/js/plugins/jquery-textfill-0.1.js");
ImportJS.url("http://127.0.0.1/watermark/js/plugins/jquery-rotate.2.2.js");
ImportJS.url("http://127.0.0.1/watermark/js/plugins/jquery.mousewheel.min.js");
ImportJS.url("http://127.0.0.1/watermark/js/plugins/jpicker-1.1.6.js");
ImportJS.url("http://127.0.0.1/watermark/js/plugins/jquery.cookie.js");
ImportJS.url("http://127.0.0.1/watermark/js/plugins/jquery.zclip.min.js");
ImportJS.url("http://127.0.0.1/watermark/js/plugins/jquery.jqtransform.js");
ImportJS.url("http://127.0.0.1/watermark/js/plugins/ajaxfileupload.js");
ImportJS.url("http://127.0.0.1/watermark/js/plugins/jquery-ui-1.10.0.custom.min.js");
ImportJS.url("http://127.0.0.1/watermark/js/json.js");
ImportJS.url("http://127.0.0.1/watermark/js/swfobject.js");

ImportJS.url("http://127.0.0.1/watermark/js/mod/wmBasic.js");
ImportJS.url("http://127.0.0.1/watermark/js/mod/wm.js");
ImportJS.url("http://127.0.0.1/watermark/js/mod/wmProduct.js");
ImportJS.url("http://127.0.0.1/watermark/js/mod/text.js");
ImportJS.url("http://127.0.0.1/watermark/js/mod/edit.js");
ImportJS.url("http://127.0.0.1/watermark/js/mod/start.js");
