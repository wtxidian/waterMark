head.ready(function() {

	if($.browser.msie && $.browser.version < 8) {
		$(".mzc_header a.mzc_logo").hide();
		$(".mzc_header a.mzc_logo").show();
	}

	/** activity page **/
	if($("#newActivityPage").length > 0) {

		$(".mzc_formLine").jqTransform();
		$(".mzc_stepTable .mzc_product .mzc_discount .mzc_editMode .mzc_type").jqTransform({wrapperClass: "mzc_tiny"});
		//$(".mzc_modal .mzc_formLine").jqTransform();

		// step 1
		if($("#step1Form").length > 0) {

            if($.browser.msie && $.browser.version == 6) {
                setTimeout("window.location.href='/user/browser'", 1);
            }

			$("#nextStepBtn, #directRestartBtn").click(function() {

                $("p.mzc_errorMsg").hide();

				var data = {};
				data["name"] = $("#name").val();
				data["start_time"] = "2011-10-24 00:00:00"; //$("#start_time").val() + ":00";
				data["end_time"] = "2016-10-24 00:00:00"; //$("#end_time").val() + ":00";

                data['scids'] = $("#cat").val();
                if(data["scids"] == -2) {
                	data["full_shop"] = 1;
                }
                else {
                	data['full_shop'] = 0;
                }

				// check the parameters locally
				var errMsg = "";
				if( !(minLengthCheck(data["name"], 2) && maxLengthCheck(data["name"], 32)) ) {
					errMsg = "水印组名称的长度要在2到32个汉字之间哦";
				}

				if(errMsg != "") {
					$("p.mzc_errorMsg").text(errMsg);
					$("p.mzc_errorMsg").show();
					return ;
				}


				var nextPage = '/promotion/step2';
				if(data['full_shop'] == 1) {
					nextPage = '/promotion/step3';
				}
				if(data['scids'] != -1) {
					nextPage = '/promotion/step3';
				}

				var direct_restart = false;
				if($("#directRestartBtn").length > 0) {
					if($(this).attr("id") == 'directRestartBtn') {
						nextPage = '/promotion/complete/a';
						direct_restart = true;
					}
					else {
						nextPage = '/promotion/step2?restart=1';
					}
				}

                $("p.mzc_errorMsg").html('正在初始化活动信息，请稍候...');
                $("p.mzc_errorMsg").show();

				$.post('/promotion/step1/a', data, function(result) {

					if(result.success) {
						if(!direct_restart) {
							setTimeout("window.location.href='" + nextPage + "'", 1);
						}
						else {
							$.get('/promotion/complete/a',{},function(data){
			                    if (data.success){
			                        setTimeout("window.location.href='/promotion/complete'", 1);
			                    }else{
			                        alert(data.msg);
			                    }
			                },'json');
						}
					}
					else {
						$("p.mzc_errorMsg").html(result.msg);
						$("p.mzc_errorMsg").show();
					}

				},'json');
			});
            if($('#title').val()!="-1") {
            	$('#custom_title_div').hide();
            }
            $("#title").change(function(){
                if ($("#title").val() == "-1"){
                    $('#custom_title_div').show();
                }else{
                    $('#custom_title_div').hide();
                }
            });

			if($("#isFullShop").val() == "0") {
                $(".mzc_fullshop .mzc_msg1").hide();
                $(".mzc_fullShopLabel a.mzc_no").addClass("mzc_selected")
                $(".mzc_fullShopLabel a.mzc_no").parent().append("<i></i>");
            }
            else {
                $(".mzc_fullShopLabel a.mzc_yes").addClass("mzc_selected")
                $(".mzc_fullShopLabel a.mzc_yes").parent().append("<i></i>");
            }
            $(".mzc_fullShopLabel a").click(function() {
                if($("#user_level").val()*1 < 2) {
                    loadModal("#goldFunctionAlertModal");
                    return false;
                }

                $(".mzc_fullShopLabel a").removeClass("mzc_selected");
                $(".mzc_fullShopLabel i").remove();

                $(this).addClass("mzc_selected");
                $(this).parent().append("<i></i>");

                if($(this).hasClass("mzc_yes")) {
                    $(".mzc_msg1", $(this).parent().parent()).show();
                }
                else {
                    $(".mzc_msg1", $(this).parent().parent()).hide();
                }

            });

		}

		// step 2
		if($(".mzc_productGridView").length > 0) {
			var userLevel = $("#user_level").val();
			var freePerPromo = $("#free_per_promo").val();

			//id of selected items
			var selectedItems = [];
			var currentItems = {};
			var selectedItemNumber = 0;
			var pageNo = 1;
			var pageItemNumber = 40;
			var totalItemNumber = 0;
			var edit_id = $('#change_act_id')[0].value;

            var wm_current = +$("#wm_current").val();
            var wm_limit = +$("#wm_limit").val();
            var wm_tot_limit = +$("#wm_tot_limit").val();
            var wm_limit_span = $(".limit span");
            var leftNumber = Math.min(wm_tot_limit-wm_current, wm_limit);
            var littlebox = $("#littlebox");


			$(".mzc_productTemplate").hide();

            $(".mzc_product.mzc_limited img").live("click", function(evt) {
                littlebox.stop();
                littlebox.css("opacity", 1);
                littlebox.css("left", evt.pageX-100)
                         .css("top", evt.pageY-50);
                littlebox.show();
                littlebox.animate(
                    { 'opacity': 0.25 },
                    2000,
                    function() {
                        littlebox.hide();
                    }
                );
            });

			$(".mzc_product").live({
				mouseenter: function() {
					if(!$(this).hasClass("mzc_disabled") && !$(this).hasClass("mzc_selected") && !$(this).hasClass("mzc_limited")) {
						$(this).addClass("mzc_hover");
					}
				},
				mouseleave: function() {
					$(this).removeClass("mzc_hover");
				}
			});
            littlebox.hover(
                function() {
                    littlebox.stop();
                    littlebox.css("opacity", 1);
                },
                function() {
                    littlebox.animate(
                        { 'opacity': 0.25 },
                        2000,
                        function() {
                            littlebox.hide();
                        }
                    );
                }
            );

			$(".mzc_toSomePage").bind("click, focus", function() {
				$(this).select();
			});
			$(".mzc_toSomePageBtn").click(function() {
				var num = $(".mzc_toSomePage").val();
				var total = $(".mzc_total:eq(0)").text();
				if(isNaN(num) || num <= 0 || num > +total) {
					alert("页数输入错误");
					return false;
				}
				toPage(num);
			});
			$(".mzc_toSomePage").keypress(function(e) {
				if(e.keyCode == 13) {
					$(".mzc_toSomePageBtn").trigger("click");
				}
			});

			$(".mzc_product .mzc_image").live("click", function() {

				var $product = $(this).parent();

				if($product.hasClass("mzc_selected")) {
					if(!$product.hasClass("mzc_disabled") && !$product.hasClass("mzc_limited")) {
						deselectProduct($product, true);
						$product.addClass("mzc_hover");
					}
				}
				else {
					if(!$product.hasClass("mzc_disabled") && !$product.hasClass("mzc_limited")) {
						selectProduct($product, true);
						$product.removeClass("mzc_hover");
					}
				}
			});

			selectProduct = function(obj, sendResult) {
				var id = $(obj).attr("id");
				if(isNaN(id) || id == "") {
					return true;
				}

				addToSelectedItems(id);
				if(sendResult) {
					sendSelectedItems();
				}
				$(obj).addClass("mzc_selected");
				$(".mzc_selectedProducts strong").text(selectedItems.length);
                if(leftNumber == 0) {
                    setLimited();
                }
				return true;
			}

			deselectProduct = function(obj, sendResult) {
				var id = $(obj).attr("id");
				if(isNaN(id) || id == "") {
					return true;
				}
				removeFromSelectedItems(id);
				if(sendResult) {
					sendSelectedItems();
				}
				$(obj).removeClass("mzc_selected");
				$(".mzc_selectedProducts strong").text(selectedItems.length);
                if(leftNumber > 0) {
                    $(".mzc_limited").removeClass("mzc_limited");
                }
			}

            setLimited = function() {
                $(".mzc_product").each(function() {
                    var anchor = $(this);
                    if(!anchor.hasClass("mzc_productTemplate") && !anchor.hasClass("mzc_selected") && !anchor.hasClass("mzc_disabled")) {
                        anchor.addClass("mzc_limited");
                    }
                });
            }
			getProductsType = function() {
				var type = $(".mzc_tabView .mzc_tabs li.mzc_active a").attr("rel");
				return type;
			}

			getTaobaoCategory = function() {
				$now = $("#selectTaobaoCategory option:selected");
				var id = $now.val();
				return id;
			}

			getStoreCategory = function() {
				$now = $("#selectStoreCategory option:selected");
				var id = $now.val();
				return id;
			}

			getSearchString = function () {
				var text = $("#searchInput").val();
				return text;
			}

			startLoading = function() {
				$(".mzc_product").hide();
				$(".mzc_loadingIcon").show();
				$(".mzc_empty").hide();
			}
			stopLoading = function() {
				$(".mzc_loadingIcon").hide();
			}

			loadAlert = function(text) {
				$(".mzc_products .mzc_empty").text(text);
				$(".mzc_products .mzc_empty").show();
			}

			addToSelectedItems = function(id) {
				removeFromSelectedItems(id);
				for(var i=0; i<currentItems.length; i++) {
					var item = currentItems[i];

					if(id == item.num_iid) {
						item.checked = true;
						selectedItems.push(item);
                        selectedItemNumber++;
                        leftNumber = Math.min(wm_tot_limit-wm_current,wm_limit)-selectedItemNumber;
                        wm_limit_span.text(leftNumber);
						break;
					}
				}


				return true;
			}
			removeFromSelectedItems = function (id) {
				for(var i=0; i<selectedItems.length; i++) {
					var item = selectedItems[i];

					if(id == item.num_iid) {
						item.checked = false;
						selectedItems.splice(i, 1);
                        selectedItemNumber--;
                        leftNumber = Math.min(wm_tot_limit-wm_current,wm_limit)-selectedItemNumber;
                        wm_limit_span.text(leftNumber);
						break;
					}
				}
				return true;
			}


			$(".mzc_selectPageAll").click(function() {
				if(!$(this).hasClass("mzc_deselectPageAll")) {

					var ok = true;
					$(".mzc_product").each(function() {
						if(!ok) {
							return false;
						}
						if(!$(this).hasClass("mzc_disabled") && !$(this).hasClass("mzc_limited")) {
							ok = selectProduct(this, false);
						}
					});

					sendSelectedItems();

					$(".mzc_selectPageAll span span").text("取消本页全选");
					$(".mzc_selectPageAll").addClass("mzc_deselectPageAll");
				}
				else {
					$(".mzc_selectPageAll").removeClass("mzc_deselectPageAll");

					$(".mzc_product").each(function() {
						if(!$(this).hasClass("mzc_disabled") && !$(this).hasClass("mzc_limited")) {
							deselectProduct(this, false);
						}
					});

					sendSelectedItems();

					$(".mzc_selectPageAll span span").text("全选本页商品");
					$(".mzc_selectPageAll").addClass("mzc_selectPageAll");
				}
			});

			$(".mzc_loadingIcon").show();



			// get categories
			$.get('/promotion/cats/a', function(catsRes) {

				if(catsRes.success == 0) {
					alert(catsRes.msg);
					stopLoading();
				}
				else {

					// populate category select
					populateCategorySelect(catsRes);

				}

			}, 'json');



			// load content
			loadInitialData = function() {
				$(".mzc_filter").show();
				$(".mzc_selection").show();

				startLoading();

				var type = getProductsType();
				$.get('/promotion/search/a', {'page_size': pageItemNumber, 'type': type,'rnd':Math.random()},
					function(searchRes) {

						if(searchRes.success == 0) {
							alert(searchRes.msg);
							stopLoading();
						}
						else {

							// populate item table
							populateItemTable(searchRes.items, false);
							// update pagination
							populatePagination(1, searchRes.item_count);

							stopLoading();

						}
					}
				, 'json' );
			}

			// get items
			refreshProductView = function() {

				$(".mzc_filter").show();
				$(".mzc_selection").show();

				startLoading();

				var data = generateSelectedItemStr();
				$.post('/promotion/checkin/a'+"?rnd="+Math.random(), {'ids': data},
					function (result) {
						if(result.success == 0) {
							alert("连接服务器失败");
                            location.reload();
						}
						else {
							var type = getProductsType();
							$.get('/promotion/search/a', {'page_size': pageItemNumber, 'type': type,'rnd':Math.random()},
								function(searchRes) {

									if(searchRes.success == 0) {
										loadAlert(searchRes.msg);
										stopLoading();
									}
									else {

										// populate item table
										populateItemTable(searchRes.items, false);
										// update pagination
										populatePagination(1, searchRes.item_count);

										stopLoading();

									}
								}
							, 'json' );
						}
					}
				, 'json' );
			}

			generateSelectedItemStr = function () {

				var data = "";
				for(var i=selectedItems.length-1; i>=0; i--) {
					var item = selectedItems[i];
					data += item.num_iid + ",";
				}
				if(data.length > 0) {
					data = data.substr(0, data.length-1);
				}
				return data;
			}

			sendSelectedItems = function () {
				var data = generateSelectedItemStr();
				$.post('/promotion/checkin/a'+"?rnd="+Math.random(), {'ids': data},
					function (result) {
						if(result.success == 0) {
							alert("与服务器连接失败。");
                            location.reload();
						}
					}
				,'json');
			}
			getSelectedItems = function () {
				$.get('/promotion/checkout/a',
					function (result) {
						if(result.success == 0) {
							alert("与服务器连接失败。");
                            location.reload();
						}
						else {
							selectedItems = result.prds;
							for(var i=selectedItems.length-1; i>=0; i--) {
								selectedItems[i].checked = true;
							}
                            selectedItemNumber = selectedItems.length;
                            leftNumber = Math.min(wm_tot_limit-wm_current,wm_limit)-selectedItemNumber;
                            wm_limit_span.text(leftNumber);
							$(".mzc_selectedProducts strong").text(selectedItemNumber);
						}
					}
				, 'json');
			}

			getSelectedItems();
			loadInitialData();

			populateItemTable = function(items, isSpecial) {

				currentItems = items.slice();

				// remove old items
				$(".mzc_product").each(function() {

					if(!$(this).hasClass("mzc_productTemplate")) {
						$(this).remove();
					}
				});

				$products = $(".mzc_products");

				// get template product
				var $template = $(".mzc_productTemplate").clone();
				$template.removeClass("mzc_productTemplate");
				for(var i=items.length-1; i>=0; i--) {

					var item = items[i];
					var $product = $template.clone();

					// set taobao fields
					$product.attr("title", item.title);
					$product.attr("id", item.num_iid);

					$(".mzc_image img", $product).attr("src", item.pic_url + '_160x160.jpg');
					$(".mzc_image img", $product).attr("alt", item.title);

					$(".mzc_price i", $product).text(item.price);
					if(item.title.length > 24) {
						$(".mzc_name", $product).text(item.title.substr(0, 22) + "......");
					}
					else {
						$(".mzc_name", $product).text(item.title);
					}
					$(".mzc_name", $product).attr("href", 'http://item.taobao.com/item.htm?id=' + item.num_iid);

					// set custom fields
					if(item.checked) {
                        if(!isSpecial) {
                            selectProduct($product, false);
                        }
                        else {
                            $product.addClass("mzc_selected");
                        }
					}
					else if(item.disabled) {
						$product.addClass("mzc_disabled");
					}
                    else if(leftNumber == 0) {
                        $product.addClass("mzc_limited");
                    }

					$product.prependTo($products);
					$product.show();


				}
				$template.remove();


			}

			populateCategorySelect = function(cats) {

				initialCategorySelect($("#selectStoreCategory"), cats.shop);

				initialCategorySelect($("#selectTaobaoCategory"), cats.all);

			}

			initialCategorySelect = function($select, cats) {

				for(var i=0; i<cats.length; i++) {

					var category = cats[i];

					$option = $("<option></option>");

					$option.attr("value", category.id);
					$option.text(category.name);

					$select.append($option);
				}
			}

			populatePagination = function(now, itemCount) {

				var pageNumber = Math.floor(itemCount/pageItemNumber);
				if(itemCount % pageItemNumber != 0) {
					pageNumber++;
				}

				$(".mzc_page .mzc_total").text(pageNumber);
				$(".mzc_page .mzc_now").text(now);
				totalItemNumber = itemCount;

				refreshPageBtn(now);

			}

			doSearch = function(input) { // input[0]: page_no

				data = {}

				startLoading();

				var type = getProductsType();
				var taobao_cid = getTaobaoCategory();
				var store_cid = getStoreCategory();
				var query_str = getSearchString();
				data['type'] = type;
				data['page_size'] = pageItemNumber;
				data['cid'] = taobao_cid;
				data['scid'] = store_cid;
				data['q'] = query_str;


				if(input && input.length > 0 && input[0] != 0) {
					data['page_no'] = input[0];
				}
				else {
					data['page_no'] = 1;
				}

				var selectedItemStr = generateSelectedItemStr();
				$.post('/promotion/checkin/a'+"?rnd="+Math.random(), {'ids': selectedItemStr},
					function (result) {
						if(result.success == 0) {
							alert("连接服务器失败");
                            location.reload();
						}
						else {
                            data['rnd']=Math.random();
							$.get('/promotion/search/a', data,
								function(searchRes) {
									if(searchRes.success == 0) {
										loadAlert(searchRes.msg);
									}
									else {
										// populate item table
										populateItemTable(searchRes.items, false);
										// update pagination
										populatePagination(data['page_no'], searchRes.item_count);
									}

									stopLoading();
								},
							'json' );
						}
					}
				, 'json' );
			}

			toPage = function (page) {
				doSearch([page, '']);
				$(".mzc_page .mzc_now").text(page);

				refreshPageBtn(page);
				$(".mzc_selectPageAll").removeClass("mzc_deselectPageAll");
				$(".mzc_selectPageAll span span").text("全选本页商品");
				$(".mzc_selectPageAll").addClass("mzc_selectPageAll");

			}

			refreshPageBtn = function (page) {
				var total = $(".mzc_page .mzc_total").eq(0).text();
				if(page <= 1) {
					$(".mzc_prevPage").addClass("mzc_disable");
				}
				else {
					$(".mzc_prevPage").removeClass("mzc_disable");
				}
				if(page == total) {
					$(".mzc_nextPage").addClass("mzc_disable");
				}
				else {
					$(".mzc_nextPage").removeClass("mzc_disable");
				}
			}

			showSelectedItems = function() {
				$(".mzc_filter").hide();
				$(".mzc_selection").hide();

				populateItemTable(selectedItems, true);
			}

			$("#selectStoreCategory, #selectTaobaoCategory").change(function() {
				if($(this).attr("id") == "selectTaobaoCategory") {
					$("#selectStoreCategory option:eq(0)").prop("selected", true);
					$("#searchInput").val("");
				}
				else {
					$("#selectTaobaoCategory option:eq(0)").prop("selected", true);
					$("#searchInput").val("");
				}
				doSearch();
			});

			$(".mzc_tabView .mzc_tabs li").click(function() {
				$(".mzc_tabView .mzc_tabs li").removeClass("mzc_active");
				$(this).addClass("mzc_active");


				$("#selectStoreCategory option:eq(0)").prop("selected", true);
				$("#selectTaobaoCategory option:eq(0)").prop("selected", true);
				$("#searchInput").val("");

				if($(this).hasClass("mzc_special")) {
					showSelectedItems();
				}
				else {
					refreshProductView();
				}
			});

			$(".mzc_nextPage").click(function () {

				var now = $(".mzc_page .mzc_now").eq(0).text()*1;
				var total = $(".mzc_page .mzc_total").eq(0).text()*1;

				if(now == total) {
					return false;
				}
				toPage(now+1);

			});
			$(".mzc_prevPage").click(function () {

				var now = $(".mzc_page .mzc_now").eq(0).text()*1;
				var total = $(".mzc_page .mzc_total").eq(0).text()*1;

				if(now <= 1) {
					return false;
				}
				toPage(now-1);

			});

			$(".mzc_searchBtn").click(function() {
				$("#selectStoreCategory option:eq(0)").prop("selected", true);
				$("#selectTaobaoCategory option:eq(0)").prop("selected", true);
				doSearch([0]);
			});

			$("#searchInput").keypress(function(e) {
				if(e.keyCode == 13) {
					$(".mzc_searchBtn").trigger("click");
				}
			});



			var restart_str = "";
			if(getQueryString("restart") === '1') {
				restart_str = '?restart=1';
			}

			$("#nextStepBtn").click(function() {

				if(selectedItems.length == 0) {
					alert("您还没有选择商品哦，请先选好商品");
					return false;
				}

				sendSelectedItems();
				setTimeout('window.location.href="/promotion/step3' + restart_str + '"', 1);
			});
			$("#prevStepBtn").click(function() {
				sendSelectedItems();
				setTimeout('window.location.href="/promotion/step1' + restart_str + '"', 1);
			});
		}

		// step 3
		if($(".mzc_stepTable").length > 0) {

            if($.browser.msie && $.browser.version == 6) {
                setTimeout("window.location.href='/user/browser'", 1);
            }
            
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
            sendToServerPeriodically();

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

                var info = {};
                for(var i=0,max=productList.length; i<max; i++) {
                    var product = productList[i];
                    var wm = [];
                    for(var j=0,maxj=product.wm.basics.length; j<maxj; j++) {
                        wm.push(product.wm.basics[j].toJSONObject());
                    }

                    if(wm.length > 0) {
                        info[product.id] = {};
                        info[product.id]['wm'] = wm;
                    }
                }

                var infoJson = $.toJSON(info);
                sendingData = true;
                $.ajax({
                    type: 'post',
                    url: '/promotion/save_put/a?rnd='+Math.random(),
                    data: {'type': 'new3discount', 'data': infoJson},
                    success: function (result) {
                        if(result.success == 0) {
                            alert("与服务器连接失败");
                            location.reload();
                        }
                        sendingData = false;
                    },
                    dataType: 'json',
                    async: isAsync
                });
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
                    this.image.attr("src", "/static/i/loadingPage3.gif");

                    $("<img/>").load(function() {

                        if(instance.productid != product.id) {
                            return false;
                        }

                        instance.image.attr("src", product.imageurl + "_310x310.jpg");
                        instance._applyWMBasics();

                        // update modification area
                        //this._generateTextModifyList();
                        //this._generateImgModifyList();

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
                _generateTextModifyList: function() {
                    for(var i=0, max = this.wm.basics.length; i<max; i++) {
                        if(this.wm.basics[i].type === 'text') {
                            this._addToTextModifyList(this.wm.basics[i]);
                        }
                    }
                },
                _generateImgModifyList: function() {
                    var last = $(".wmimage:last", this.imgModifyArea);
                    $(".wmimage", this.imgModifyArea).remove();
                    this.imgModifyArea.append(last);

                    for(var i=0, max = this.wm.basics.length; i<max; i++) {
                        if(this.wm.basics[i].type === 'image') {
                            this._addToImgModifyList(this.wm.basics[i]);
                        }
                    }
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
                url: '/promotion/checkout/a',
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
            var used_ids = [];
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
                url: '/promotion/wm_list2/a',
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
            });
            // 获得水印的map
            var wmMap = [];
            var wmMapPages = 0;
            function updateWMMap(type, page, pagesize) {
                wmMap = [];
                wmMapPages = 0;
                $.ajax({
                    type: 'get',
                    url: '/promotion/wmi_list/a',
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
/*
            $(".mzc_preview .wmBasic").live({
                mouseenter: function(event) {
                    $("#tooltip").remove();
                    var tiphtml = '<p id="tooltip" class="big"><strong class="mzc_blue">位置:</strong>按住鼠标拖动<br/><strong class="mzc_blue">缩放:</strong>拖动水印右下角<br/><strong class="mzc_blue">旋转:</strong>拖动水印右上角<br/><strong class="mzc_blue">透明度:</strong>滚动鼠标滚轮<br/><strong class="mzc_blue">删除:</strong>拖动到图片外</p>';
                    var tip = $(tiphtml).css("left", event.pageX + "px")
                                        .css("top", event.pageY + "px")
                                        .appendTo("body");
                    var anchor = $(this);
                    anchor.bind("mousemove", function(e) {
                        $("#tooltip")
                            .css("left",(e.pageX + 5) + "px")
                            .css("top",(e.pageY + 10) + "px");
                    });
                    anchor.bind("mousedown", function(e) {
                        $("#tooltip").remove();
                        anchor.unbind("mousemove");
                    });
                },
                mouseleave: function() {
                    var anchor = $(this);
                    $("#tooltip").remove();
                    anchor.unbind("mousemove");
                }
            });
*/
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

		}
		// end of step 3

	}


	// activity complete page
	if($("#completeActivityPage").length > 0) {
        
	}


	// activity home page
	if($("#activityHomePage").length > 0) {

        if($.browser.msie && $.browser.version == 6) {
            setTimeout("window.location.href='/user/browser'", 1);
        }

		$(".mzc_formLine").jqTransform();
		var NowEditId = "";
		var oldTime = "";
		var oldName = "";
		var shortTitle = "";
		var longTitle = "";
		refreshEndTimeInput = function (startdate, enddate) {
			startdate = Date.parse(startdate.replace(/-/g, "/"));
			startdate = new Date(startdate);
			enddate = Date.parse(enddate.replace(/-/g, "/"));
			enddate = new Date(enddate);

			$('#end_time').datetimepicker('destroy');
	       	$('#end_time').datetimepicker({
	       		minDate: startdate,
	       		setDate: enddate
	       	});

       		if($("#user_level").val() < 2) {
				$('#end_time').datetimepicker('destroy');
			}
		}
		calculateTimeDiff = function (timeold, timenew) {
			timeold = Date.parse(timeold.replace(/-/g, "/"));
			timeold = new Date(timeold);
			timenew = Date.parse(timenew.replace(/-/g, "/"));
			timenew = new Date(timenew);

			var diff = timenew.getTime() - timeold.getTime();
			diff = diff / 1000; // to second

			return diff.toFixed(0);
		}

		$(".mzc_deleteBtn").click(function() {
			if(confirm("您确定要取消这组水印吗？")) {
				var id = $(this).parentsUntil("tr").parent().attr("id");
				$.get('/promotion/dela/' + id+'/a', function(result) {
					setTimeout('window.location.href="/promotion/list"', 1);
				});
			}
		});
        $(".mzc_finishBtn").click(function() {
            if(confirm("您确定要删除这组水印吗？")) {
                var id = $(this).parentsUntil("tr").parent().attr("id");
                $.get('/promotion/dela/' + id+'/a', function(result) {
                    setTimeout('window.location.href="/promotion/list"', 1);
                });
            }
        });
        $(".mzc_delfBtn").click(function() {
            var msg_btn = $(this).text();
            var msg_alert = '';
            var tag = 3;
            if (msg_btn == '永久删除水印活动'){
                msg_alert = '您确定要永久删除掉这个水印活动?'
            }else{
                msg_alert = '您确定要将这个活动恢复到已完成列表中?'
                tag = 4;
            }
            if(confirm(msg_alert)) {
                var id = $(this).parentsUntil("tr").parent().attr("id");
                $.get('/promotion/delfa/a?aid=' + id, function(result) {
                    setTimeout('window.location.href="/promotion/list/'+tag+'"', 1);
                });
            }
        });
        $(".mzc_addBtn").click(function() {
            var id = $(this).parentsUntil("tr").parent().attr("id");

            $.get("/promotion/reload/a?aid=" + id + "&step=1", function(result) {
                setTimeout('window.location.href="/promotion/step2"', 1);
            });

        });
        $(".mzc_restartBtn").click(function() {

       		if($("#user_level").val() < 2) {
       			loadModal("#goldFunctionAlertModal");
       			return false;
       		}
       		setTimeout('window.location.href="/promotion/restart_act/' + $(this).attr("rel")  + '"', 1);

        });

        $('#reset_all_picture').click(function(){
            if (confirm('您确定要还原所有图片到您开始使用美印时的状态吗？')){
                $.post('/promotion/reset_all',{},function(json){
                    alert(json.msg);
                },'json')
            }
        });

       	$(".mzc_editPromoTimeBtn").click(function() {
       		var $tr = $(this).parent().parent();
       		var title = $(".mzc_promotionName", $tr).text();
       		var startTime = $(".mzc_startTime", $tr).text();
       		var endTime = $(".mzc_endTime", $tr).text();

       		var $lines = $("#editTimeModal .mzc_formLine");
       		$(".mzc_desc", $lines).eq(0).val(title);
       		$(".mzc_desc", $lines).eq(1).text(startTime);
       		$("input.mzc_date", $lines).val(endTime);

       		refreshEndTimeInput(startTime, endTime);

       		NowEditId = $tr.attr("id");
       		oldTime = endTime;
       		oldName = title;
       		shortTitle = $(".short_title", $tr).val();
       		longTitle = $(".long_title", $tr).val();

       		$("#title").parent().find("li a").each(function() {
       			if($(this).text() == shortTitle) {
       				$(this).trigger("click");
       			}
       		});
       		var $custom_title_div = $("#custom_title_div");

       		var selected = false;
       		$("#title option").each(function() {
       			if($(this).text() == shortTitle) {
       				$(this).prop("selected", true);
   					$custom_title_div.hide();
   					$("#custom_title").val("");
   					selected = true;
       			}
       		});
       		if(!selected) {
       			$("#title").parent().find("li a:last").trigger("click");
				$("#title option[value='-1']").prop("selected", true);
				$custom_title_div.show();
				$("#custom_title").val(shortTitle);
			}

			$("#desc").val(longTitle);

       		loadModal("#editTimeModal");
       	});

       	$("#title").change(function() {
       		var $custom_title_div = $("#custom_title_div");
       		if($("option:selected", this).val() == -1) {
				$custom_title_div.show();
			}
			else {
				$custom_title_div.hide();
			}
       	});

       	$("#end_time").bind("click focus", function() {
       		if($("#user_level").val() < 2) {
       			closeModal();
       			loadModalAndReset("#goldFunctionAlertModal", "#editTimeModal");
       			return false;
       		}
       	});
       	$("#stitleWrapper, #custom_title, #desc").bind("click focus", function() {
       		if($("#user_level").val() < 2) {
       			$("#stitleWrapper ul").hide();
       			closeModal();
       			loadModalAndReset("#goldFunctionAlertModal", "#editTimeModal");
       			return false;
       		}
       	});
       	var success = [0, 0];
       	$(".mzc_editPromoTimeConfirmBtn").click(function() {

       		var custom_title = $("#custom_title").val();
       		errMsg = "";
       		if ($('#title').val() == "-1"){
                if( !(minLengthCheck(custom_title, 2) && maxLengthCheck(custom_title, 5))){
                    errMsg = "价格标签的长度要在2到5个汉字之间哦";
                }else{
                    if (custom_title.indexOf('聚划算')>=0 || custom_title.indexOf('限时折扣')>=0 || custom_title.indexOf('淘金币')>=0){
                        errMsg = "价格标签不能使用聚划算，淘金币及限时折扣等内容";
                    }
                }
            }
            if(errMsg !== "") {
            	alert(errMsg);
            	return false;
            }

       		checkConfirmResult();

       		var diff = calculateTimeDiff(oldTime, $("#editTimeModal input.mzc_date").val() );

	       	var desc = $("#editTimeModal #desc").eq(0).val();
	       	var title = $('#title option:selected').val();
	       	var short_title = $('#title option:selected').text();
	       	var custom_title = $('#custom_title').val();
	       	if(title == -1) {
	       		short_title = custom_title;
	       	}
       		if(diff == 0 && desc == longTitle && title == shortTitle) {
       			success[1] = 1;
       		}
       		else if(isNaN(diff)) {
       			success[1] = 2;
       		}
       		else {
	       		$.post('/promotion/extend_act/' + NowEditId + '/a', {'len': diff, 'short_title': short_title, 'long_title': desc}, function (result) {
	       			if(result.success == 1) {
	       				success[1] = 1;
	       			}
	       			else {
	       				success[1] = 2;
	       				alert(result.msg);
	       			}
	       		}, 'json');
	       	}

       		var newName = $("#editTimeModal input.mzc_desc").eq(0).val();

       		if(oldName == newName) {
       			success[0] = 1;
       		}
       		else {
	       		$.post('/promotion/change_act_title/' + NowEditId + '/', {'new_name': newName}, function (result) {
	       			if(result.success == 1) {
	       				success[0] = 1;
	       			}
	       			else {
	       				success[0] = 2;
	       				alert(result.msg);
	       			}
	       		}, 'json');
	       	}

       	});

       	checkConfirmResult = function() {
       		valid = true;
       		for(var i=0; i<success.length; i++) {
       			if(success[i] == 0) {
       				setTimeout("checkConfirmResult()", 100);
       				return false;
       			}
       			if(success[i] == 2) {
       				valid = false;
       				alert("您的输入格式有误，请检查后重新提交");
       			}
       		}
       		if(valid) {
       			loadAlertModal("修改成功！您的修改将在五分钟内生效：）<br/>请刷新页面查看。");
       			$("#"+NowEditId + " .mzc_promotionName").text($("#editTimeModal input.mzc_desc").eq(0).val());
       		}
       	}

        var count = 0;
        var hideItem = false;
        $(".mzc_bigTable td.mzc_status").each(function() {
        	if(count > 15 && $(this).hasClass("mzc_gray")) {
	        	$(this).parent().addClass("mzc_finishedRow");
	        	$(this).parent().hide();
	        	hideItem = true;
	        }
        	count++;
        });
        if(hideItem) {
        	$(".mzc_bigTable .mzc_btnLine").show();
        	$(".mzc_showFinishedBtn").click(function() {
        		$(".mzc_finishedRow").show();
        		$(".mzc_bigTable .mzc_btnLine").hide();
        	});
        }

        // change log
        $.get('/news/', function(result) {
        	if(result.success == 1) {
        		var cls = $(".mzc_messageBox #level"+result.level).val();
        		$(".mzc_messageBox").addClass(cls);
        		$(".mzc_messageBox").html("<strong>" + result.title + "</strong>" + " " + result.text);
        		$(".mzc_messageBox").show();
        	}
        	else {
        	}
        	positionInviteLink();
        }, 'json');


        if(isSpread == true) {
        	loadModal("#shangmengModal");
        }
        if(invite_count == true) {
        	loadModal("#msgModal");
        }
	}

	// edit promotion page
	if($("#editActivityPage").length > 0) {

		$(".mzc_globalSetting .mzc_formLine .mzc_button11_large").hide();
		$(".mzc_codLine").hide();
		$(".mzc_molingLine .mzc_inlineMsg").hide();
        $(".mzc_zhekouLine .mzc_errorMsg").hide();
        $(".mzc_product .mzc_discount .mzc_errorMsg").hide();

		$(".mzc_stepTable .mzc_product .mzc_discount .mzc_editMode .mzc_type").jqTransform({wrapperClass: "mzc_tiny"});

		initialData = initialData.replace(/, u'/g, ", '");
		initialData = initialData.replace(/: u'/g, ": '");
		initialData = initialData.replace(/\{u'/g, "\{'");
		initialData = initialData.replace(/L, 'real/g, ", 'real");
		//alert(initialData);
		var oldItems = $.parseJSON("{ data:" + initialData + "}").data;
		//alert(oldItems);
		var newItems = [];
		var pageItemNumber = 20;
		var info = {};
		var selectedItems = [];
		var sendingData = false;

		$(".mzc_nav a, .mzc_logo").click(function() {
			var count = 0;
			for(var i in info) {
				count++;
			}
			if(count > 0) {
				return confirm("您尚未点击“确认修改”按钮，您对商品的修改将不会生效。您确定现在要离开修改商品页面吗？");
			}
			return true;
		});


		$(".mzc_globalSetting .mzc_settings").toggle();
		$(".mzc_globalSetting h3.mzc_toggle").click(function() {
			if($(this).hasClass("mzc_collapse")) {
				$(".mzc_globalSetting .mzc_settings").slideToggle("slow");
				$(this).removeClass("mzc_collapse");
			}
			else {
				$(".mzc_globalSetting .mzc_settings").slideToggle("slow");
				$(this).addClass("mzc_collapse");
			}
		});

		$(".mzc_product span.mzc_name .mzc_editBtn").live("click", function() {
			$(this).parent().hide();
			$(this).parent().parent().find(".mzc_block3").show();
		});
		$(".mzc_product .mzc_block3 .mzc_yesBtn").live("click", function() {
			$(this).parent().hide();
			$(this).parent().parent().find("span.mzc_name").show();
		});

		deselect = function ($obj) {
			$("a", $obj).removeClass("mzc_selected");
			$("i", $obj).remove();
		}

		$(".mzc_molingLabel a").click(function() {
			deselect($(".mzc_molingLabel"));
			$label = $(this).parent();
			$("a", $label).addClass("mzc_selected");
			$label.append("<i></i>");

			$(".mzc_molingLine .mzc_inlineMsg").hide();
			if($(this).hasClass("mzc_moling1")) {
				$(".mzc_molingLine .mzc_inlineMsg:eq(0)").show();
			}
			if($(this).hasClass("mzc_moling2")) {
				$(".mzc_molingLine .mzc_inlineMsg:eq(1)").show();
			}
            $(".mzc_molingLine .mzc_button11_large").show();

		});

		$(".mzc_youfeiLabel a").click(function() {
			deselect($(".mzc_youfeiLabel"));
			$label = $(this).parent();
			$("a", $label).addClass("mzc_selected");
			$label.append("<i></i>");

			if($(this).hasClass("mzc_baoyou2")) {
				$(".mzc_codLine").show();
            	$(".mzc_youfeiLine .mzc_button11_large").hide();
            	$(".mzc_codLine .mzc_button11_large").show();
			}
			else {
				$(".mzc_codLine").hide();
            	$(".mzc_codLine .mzc_button11_large").hide();
            	$(".mzc_youfeiLine .mzc_button11_large").show();
			}
		});
		$(".mzc_codLabel a").click(function() {
			deselect($(".mzc_codLabel"));
			$label = $(this).parent();
			$("a", $label).addClass("mzc_selected");
			$label.append("<i></i>");
            $(".mzc_codLine .mzc_button11_large").show();

		});
		$(".mzc_deaLabel a").click(function() {
			deselect($(".mzc_deaLabel"));
			$label = $(this).parent();
			$("a", $label).addClass("mzc_selected");
			$label.append("<i></i>");
            $(".mzc_deaLine .mzc_button11_large").show();
		});

		refreshTable = function () {

			$(".mzc_product").each(function () {

				if($(this).hasClass("mzc_productTemplate")) {
					return false;
				}

				var id = $(this).attr("id");
				$product = $(this);
				nowInfo = info[id];
				if(typeof nowInfo === "undefined") {
					return false;
				}
				var oldPrice = $(".mzc_oldPrice span:eq(0)", this).text()*1;
				var jianjia = nowInfo.discount;
				if(nowInfo.type === 'D') {
					jianjia = (oldPrice-nowInfo.discount*oldPrice/10).toFixed(2);
				}
				var zhehoujia = (oldPrice - jianjia).toFixed(2);
				var zhekou = (zhehoujia/oldPrice*10).toFixed(2);

				$(".mzc_radio", $product).prop("checked", false);
				if(nowInfo.type === 'D') {
					$(".mzc_radio", $product).eq(0).prop("checked", true);
					$(".mzc_deaSelect", $product).prop("disabled", true);
					$(".mzc_deaSelect option", $product).eq(0).prop("selected", true);
				}
				else {
					$(".mzc_radio", $product).eq(1).prop("checked", true);
					$(".mzc_deaSelect", $product).prop("disabled", false);
				}

            	$('.mzc_zhekou', $product).val(zhekou);
            	$('.mzc_jianjia', $product).val(jianjia);
            	$('.mzc_zhehoujia', $product).val(zhehoujia);

            	inlineBaoyou($(this), nowInfo.postfee);
				inlineXiangou($(this), nowInfo.dn);

			});
		}

		$(".mzc_zhekouLine .mzc_zhekouRadio").click(function() {
			var button = $(this).nextUntil(".mzc_button11_large").next();
			var wrapper = $(this).parent();
			$(".mzc_button11_large", wrapper).hide();
			button.show();
			$(".mzc_zhekouInput", wrapper).addClass("mzc_grayBg");
			$(this).next().next().removeClass("mzc_grayBg");
		});
		$(".mzc_zhekouInput").focus(function(e) {
			var radio = $(this).prev().prev();
			var button = $(this).next().next().next();
			var wrapper = $(this).parent();
			$(".mzc_button11_large", wrapper).hide();
			button.show();
			$(".mzc_zhekouInput", wrapper).addClass("mzc_grayBg");
			$(this).removeClass("mzc_grayBg");
			radio.prop("checked", true);
		});
		$(".mzc_zhekouInput").keyup(function() {
            udpateDiscountExample($(this));
        });
        udpateDiscountExample = function($input) {
            var $ok = $(".mzc_zhekouLine .mzc_okMsg");
            var type = $input.prevUntil(".mzc_zhekouRadio").prev().val();

            var discount = $input.val();
            if(type == 0 && $.trim(discount) != "" && !isNaN(discount) && discount >= 7 && discount <= 10) {
                $("strong:eq(0)", $ok).text(discount);
                $("strong:eq(1)", $ok).text((10*discount).toFixed(2));
                $(".mzc_zhekouLine .mzc_errorMsg").hide();
                $ok.show();
            }
            else if(type == 1) {
            	$(".mzc_zhekouLine .mzc_errorMsg").hide();
                $ok.show();
            }
            else if($.trim(discount) == "") {
                $ok.hide();
                $(".mzc_zhekouLine .mzc_errorMsg").hide();
                $(".mzc_zhekouLine .mzc_errorMsg:eq(0)").show();
            }
            else {
                $ok.hide();
                $(".mzc_zhekouLine .mzc_errorMsg").hide();
                $(".mzc_zhekouLine .mzc_errorMsg:eq(1)").show();
            }
            $input.nextUntil(".mzc_button11_large").next().show();
        }
        doMoling = function (item, type) {

			var id = item.num_iid;

			if(typeof info[id] == 'undefined') {
				var el = new Object();
				el.discount = 0;
				el.postfee = 0;
				el.type = 'P';
				info[id] = el;
			}

			var nowInfo = info[id];

			var oldPrice = item.price;
			var jianjia = nowInfo.discount;
			if(nowInfo.type == 'D') {
				jianjia = ((1-nowInfo.discount/10)*oldPrice).toFixed(2);
			}
			var zhehoujia = (oldPrice - jianjia).toFixed(2);
			var threshold = (oldPrice*0.7).toFixed(2);

			info[id].type = 'P';

			if(type == 1) { // fen
				jianjia = 1*(zhehoujia-Math.floor(zhehoujia*10)/10) + 1*jianjia;
				info[id].discount = jianjia.toFixed(2);
				while(oldPrice-info[id].discount < threshold) {
					info[id].discount -= 0.1;
				}
			}
			else if(type == 2) { // jiao and fen
				jianjia = (zhehoujia-Math.floor(zhehoujia))*1 + 1*jianjia;
				info[id].discount = jianjia.toFixed(2);
				while(oldPrice-info[id].discount < threshold) {
					info[id].discount -= 1;
				}
			}
			if(info[id].discount < 0) {
				info[id].discount = 0;
			}
		}
        $(".mzc_globalSetting .mzc_zhekouLine .mzc_button11_large").click(function () {
        	clearDiscount();

			var $wrapper = $(this).parent();
			var input = $(this).prev().prev().prev();
			var radio = input.prev().prev();

			if($(".mzc_errorMsg:visible", $wrapper).length > 0) {
				return false;
			}

			var type = radio.val();
			var value = input.val();
			var belowseven = 0;

			for(var i=0; i<selectedItems.length; i++) {
				var item = selectedItems[i];
				if(typeof item.old !== "undefined") {
					continue;
				}
				var tret = true;
				if(type == 0) {
					tret = updateItemInfo([item, value, '', ''])
				}
				else {
					tret = updateItemInfo([item, -1*value, '', '']);
				}
				if(!tret) {
					belowseven++;
				}
			}
			if(belowseven > 0) {
				alert("每个商品都减"+value+"元后，您有"+belowseven+"件商品小于7折，请手动设置这些商品的折扣。");
			}
			sendSelectedItemsInfo();
			refreshTable();

			$(this).hide();

		});

		$(".mzc_globalSetting .mzc_molingLine .mzc_button11_large").click(function () {
			clearDiscount();

			var $wrapper = $(this).parent();

			var type = $(".mzc_molingLabel a.mzc_selected", $wrapper).attr("rel")*1;

			for(var i=0; i<selectedItems.length; i++) {
				var item = selectedItems[i];
				if(typeof item.old === "undefined") {
                	doMoling(item, type);
                }

			}
			sendSelectedItemsInfo();
			refreshTable();

			$(this).hide();

		});

		$(".mzc_globalSetting .mzc_youfeiLine .mzc_button11_large").click(function () {
			clearDiscount();

			var $wrapper = $(this).parent();

			var type = $(".mzc_youfeiLabel a.mzc_selected", $wrapper).attr("rel")*1;

			for(var i=0; i<selectedItems.length; i++) {
				var item = selectedItems[i];
				if(typeof item.old === "undefined") {
                	updateItemInfo([item, '', type, '']);
                }
			}
			sendSelectedItemsInfo();
			refreshTable();

			$(this).hide();

		});

		$(".mzc_globalSetting .mzc_codLine .mzc_button11_large").click(function () {
			clearDiscount();

			var $wrapper = $(this).parent();

			var type = $(".mzc_codLabel a.mzc_selected", $wrapper).attr("rel")*1;

			for(var i=0; i<selectedItems.length; i++) {
				var item = selectedItems[i];
				if(typeof item.old === "undefined") {
                	updateItemInfo([item, '', type, '']);
                }
			}
			sendSelectedItemsInfo();
			refreshTable();

			$(this).hide();

		});

		$(".mzc_globalSetting .mzc_deaLine .mzc_button11_large").click(function () {
			clearDiscount();

			var $wrapper = $(this).parent();

			var type = $(".mzc_deaLabel a.mzc_selected", $wrapper).attr("rel")*1;

			for(var i=0; i<selectedItems.length; i++) {
				var item = selectedItems[i];
				if(typeof item.old === "undefined") {
                	updateItemInfo([item, '', '', type]);
                }
			}
			sendSelectedItemsInfo();
			refreshTable();

			$(this).hide();

		});

		$(".mzc_product .mzc_baoyouSelect").live("change", function () {

        	$wrapper = $(this).parent().parent();
        	$product = $wrapper.parent();

        	var type = $("option:selected", this).val();
        	var id = $product.attr("id");

        	inlineBaoyou($wrapper, type);

        	var item;
        	for(var i=selectedItems.length-1; i>=0; i--) {
        		if(id == selectedItems[i].num_iid) {
        			item = selectedItems[i];
        			break;
        		}
        	}
        	updateItemInfo([item, '', type, '']);

			sendSelectedItemsInfo();
        });
        $(".mzc_product .mzc_deaSelect").live("change", function () {

        	$wrapper = $(this).parent().parent();
        	$product = $wrapper.parent();

        	var type = $("option:selected", this).val();
        	var id = $product.attr("id");

        	inlineXiangou($wrapper, type);

        	var item;
        	for(var i=selectedItems.length-1; i>=0; i--) {
        		if(id == selectedItems[i].num_iid) {
        			item = selectedItems[i];
        			break;
        		}
        	}
        	updateItemInfo([item, '', '', type]);

			sendSelectedItemsInfo();
        });

        $(".mzc_paging .mzc_prevPage").click(function () {
        	var now = $(".mzc_paging .mzc_now").eq(0).text()*1;
			var total = $(".mzc_paging .mzc_total").eq(0).text()*1;

			if(now <= 1) {
				return false;
			}
			toPage(now-1);
        });
        $(".mzc_paging .mzc_nextPage").click(function () {
        	var now = $(".mzc_paging .mzc_now").eq(0).text()*1;
			var total = $(".mzc_paging .mzc_total").eq(0).text()*1;

			if(now == total) {
				return false;
			}
			toPage(now+1);
        });
        $(".mzc_product .mzc_radio").live("click", function() {
        	var type = $(this).val();
        	var product = $(this).parent().parent().parent().parent();
        	var id = product.attr("id");
        	var item;
        	for(var i=selectedItems.length-1; i>=0; i--) {
        		if(id == selectedItems[i].num_iid) {
        			item = selectedItems[i];
        			break;
        		}
        	}
        	var val = $(this).next().next().find(".mzc_text").val();
        	// ie6
        	$(".mzc_radio", product).prop("checked", false);
        	$(this).prop("checked", true);
        	// end of ie6
        	if(type == 'P') {
        		updateItemInfo([item, -1*val]);
        		$(".mzc_deaSelect", product).prop("disabled", false);
        	}
        	else {
        		updateItemInfo([item, val]);
        		$(".mzc_deaSelect option", product).eq(0).prop("selected", true);
        		$(".mzc_deaSelect", product).prop("disabled", true);
        	}

			sendSelectedItemsInfo();
        });
        $(".mzc_product .mzc_zhekou").live("focus", function() {
        	var wrapper = $(this).parentsUntil(".mzc_discount").parent();
        	$(".mzc_radio", wrapper).eq(0).trigger("click");
        });
        $(".mzc_product .mzc_jianjia, .mzc_product .mzc_zhehoujia").live("focus", function() {
        	var wrapper = $(this).parentsUntil(".mzc_discount").parent();
        	$(".mzc_radio", wrapper).eq(1).trigger("click");
        });
		$(".mzc_product .mzc_discount .mzc_editMode input").live("keyup", function () {
			var parents = $(this).parentsUntil(".mzc_discount");
			var $wrapper = $(parents[parents.length-1]).parent();
			$wrapper.addClass("mzc_modified");

			var id = $wrapper.parent().attr("id");
			var zhekou,jianjia,zhehoujia;
			var oldPrice = $(".mzc_oldPrice span", $wrapper).eq(0).text();
			var threshold = (oldPrice * 0.7).toFixed(2);

			var val = $(this).val();
			if($.trim(val) == "" || isNaN(val)) {
				$("input", $wrapper).addClass("mzc_darkRed");
				return false;
			}
			$("input", $wrapper).removeClass("mzc_darkRed");

			if($(this).hasClass("mzc_zhekou")) {
				zhekou = val;
				zhehoujia = (zhekou*oldPrice*0.1).toFixed(2);
				jianjia = (oldPrice-zhehoujia).toFixed(2);
			}
			else if($(this).hasClass("mzc_jianjia")) {
				jianjia = val;
				zhehoujia = (oldPrice-jianjia).toFixed(2);
				zhekou = (10*(zhehoujia/oldPrice)).toFixed(2);
			}
			else { // zhehoujia
				zhehoujia = val;
				zhekou = (10*(zhehoujia/oldPrice)).toFixed(2);
				jianjia = (oldPrice-zhehoujia).toFixed(2);
			}

			if(jianjia < 0 || zhehoujia*1 < threshold*1) {
				//$(".mzc_erroMsg", $wrapper).show();
				$("input", $wrapper).addClass("mzc_darkRed");/*
				var item = "";
				for(var i=selectedItems.length-1; i>=0; i--) {
            		if(id == selectedItems[i].num_iid) {
            			item = selectedItems[i];
            			break;
            		}
            	}
        		updateItemInfo([item, 10]);
            	sendSelectedItems();
				sendSelectedItemsInfo();*/
				return false;
			}

			var $zhekou_field = $("input.mzc_zhekou", $wrapper);
			var $jianjia_field = $("input.mzc_jianjia", $wrapper);
			var $zhekoujia_field = $("input.mzc_zhehoujia", $wrapper);
			if($zhekou_field[0] !== $(this)[0]) {
				$zhekou_field.val(zhekou);
			}
			if($jianjia_field[0] !== $(this)[0]) {
				$jianjia_field.val(jianjia);
			}
			if($zhekoujia_field[0] !== $(this)[0]) {
				$zhekoujia_field.val(zhehoujia);
			}
			$(".mzc_zhekouRead", $wrapper).text(zhekou);
			$(".mzc_jianjiaRead", $wrapper).text(jianjia);
			$(".mzc_zhehoujiaRead", $wrapper).text(zhehoujia);

		} );
		/*
		$(".mzc_product .mzc_discount .mzc_editMode input").live("blur", function () {
			$wrapper = $(this).parentsUntil(".mzc_discount").parent();

			//updateItemDiscount($wrapper);
		});
		$(".mzc_product .mzc_discount").live({
			mouseenter: function() {

			},
			mouseleave: function() {

				// update items
				//updateItemDiscount($(this));
			}
		});*/
		$(".mzc_product .mzc_deleteProductBtn").live("click", function() {

			var ok = confirm("您是否要将该商品取消参加活动？");

			if(!ok) {
				return false;
			}

			$product = $(this).parent().parent();
			var id = $product.attr("id");

			var item, idx;
        	for(var i=selectedItems.length-1; i>=0; i--) {
        		if(id == selectedItems[i].num_iid) {
        			item = selectedItems[i];
        			idx = i;
        			break;
        		}
        	}
        	deleteItemInfo(item.num_iid);

        	selectedItems.splice(idx, 1);

			for(var i=0; i<searchingItems.length; i++) {
				if(id == searchingItems[i].num_iid) {
					searchingItems.splice(i, 1);
					break;
				}
			}

			deleteProduct($product);

			sendSelectedItemsInfo();
			sendSelectedItems();

			$products = $product.parent();
			$products.css("height", $products.height());

			$product.animate({opacity: 0, height: 0}, "slow", function() {
			    $product.remove();
				refreshProductView();
				$products.css("height", "auto");
			});


		});

		$(".mzc_addProduct").click(function () {

			if($("#user_level").val() < 1) {
				loadModal("#basicFunctionAlertModal");
				return false;
			}

			clearDiscount();
			var link = $(this).attr("rel");
			setTimeout("window.location.href='" + link + "'", 1);
		});

		$(".mzc_allProduct").hide();
		var searching = false;
		var searchingItems = [];
		$(".mzc_searchBtn").click(function() {
			searching = true;
			var val = $("#searchInput").val();

			searchingItems = [];
			for(var i=0; i<selectedItems.length; i++) {
				var item = selectedItems[i];
				if(item.title.indexOf(val) != -1) {
					searchingItems.push(item);
				}
			}

			populateItemTable(searchingItems, 1);
			populatePagination(1, searchingItems.length);

			$(".mzc_allProduct").show();
		});
		$("#searchInput").keypress(function(e) {
			if(e.keyCode == 13) {
				$(".mzc_searchBtn").trigger("click");
			}
		});
		$(".mzc_allProduct").click(function() {
			$(this).hide();
			searching = false;
			searchingItems = [];
			$("#searchInput").val("");

			populateItemTable(selectedItems, 1);
			populatePagination(1, selectedItems.length);
		});

		var submitting = false;
		var submitted = false;
		$("#editPromotionDoneBtn").click(function() {
			if(!submitting && !submitted) {
				clearDiscount();
			}

			if(sendingData) {
				if(!submitting) {
					loadAlertModal("修改中，请稍侯。");
				}
				submitting = true;
				setTimeout('$("#editPromotionDoneBtn").trigger("click");', 300);
			}
			if(sendingData || submitted) {
				return false;
			}

			if(!validateItemInfo()) {
				reorderSelectedItems();
				alert("您的部分商品折扣设置错误，请修正后再点击确认按钮");
				toPage(1);
				closeModal();
				return false;
			}
			submitted = true;
            $.get('/promotion/complete/a', {}, function(data) {
                if (data.success) {
                    loadAlertModal("设置成功，即将跳回到活动详情页面!");
                    setTimeout('window.location.href="/promotion/detail/' + $("#act_id").val() + '"', 2000);
                    submitted = false;
                } else {
                    alert(data.msg);
                    submitted = false;
                }
            },'json');
		});

		validateItemInfo = function() {
			for(var i=0; i<selectedItems.length; i++) {
				var id = selectedItems[i].num_iid;
				var a = info[id];
				if(typeof info[id] === "undefined") {
					continue;
				}
				if(isNaN(a.discount)) {
//					return false;
				}
				if(a.type == 'D') {
					if(a.discount < 7 || a.discount > 10) {
						return false;
					}
				}
				else {
					var p = selectedItems[i].price;
					var d = ((p-a.discount)/p*10);
					if(d < 7 || d > 10) {
						return false;
					}
				}
			}
			return true;
		}
		reorderSelectedItems = function() {
			var orderedItems = [];
			var wrongItems = [];
			for(var i=0; i<selectedItems.length; i++) {
				var id = selectedItems[i].num_iid;
				var a = info[id];
				var ok = true;
				if(typeof info[id] === "undefined") {
					ok = true;
				}
				else {
					if(isNaN(a.discount)) {
						ok = false;
					}
					if(a.type == 'D') {
						if(a.discount < 7 || a.discount > 10) {
							ok =  false;
						}
					}
					else {
						var p = selectedItems[i].price;
						var d = ((p-a.discount)/p*10);
						if(d < 7 || d > 10) {
							ok = false;
						}
					}
				}
				if(ok) {
					orderedItems.push(selectedItems[i]);
				}
				else {
					wrongItems.push(selectedItems[i]);
				}
			}
			selectedItems = wrongItems;
			selectedItems.push.apply(selectedItems, orderedItems);
		}


		toPage = function (page) {

			if(searching) {
				populateItemTable(searchingItems, page);
			}
			else {
				populateItemTable(selectedItems, page);
			}
			$(".mzc_paging .mzc_now").text(page);

			refreshPageBtn(page);
      	}

		clearDiscount = function () {
			$(".mzc_product .mzc_discount").each(function() {
				updateItemDiscount($(this));
			});
		}

		updateItemDiscount = function ($discount) {
       		if($discount.hasClass("mzc_modified")) {
				var id = $discount.parent().attr("id");
				var jianjia = $("input.mzc_jianjia", $discount).val()*(-1);
				var radios = $(".mzc_radio", $discount);
				if(radios.eq(0).prop("checked")) {
					jianjia = $("input.mzc_zhekou", $discount).val();
				}
				var item;
            	for(var i=selectedItems.length-1; i>=0; i--) {
            		if(id == selectedItems[i].num_iid) {
            			item = selectedItems[i];
            			break;
            		}
            	}
            	updateItemInfo([item, jianjia, '', '']);

				sendSelectedItemsInfo();

				$discount.removeClass("mzc_modified");

			}
       	}
		deleteProduct = function($product) {
			var id = $product.attr("id");
			$.get('/promotion/delp/'+id+'/a', function(result) {
				if(result.success == 1) {
					// ok
				}
				else {
					alert(result.msg);
				}
			}, 'json');
		}
		sendSelectedItems = function () {
			var data = generateSelectedItemStr();
			$.post('/promotion/checkin/a'+"?rnd="+Math.random(), {'ids': data},
				function (result) {
					if(result.success == 0) {
						alert("与服务器连接失败。");
                        location.reload();
					}
				}
			,'json');
		}

		refreshProductView = function () {

       		var itemCount = selectedItems.length;
       		if(searching) {
       			itemCount = searchingItems.length;
       		}
       		var now = $(".mzc_paging .mzc_now").eq(0).text();

       		var pageNumber = Math.floor(itemCount/pageItemNumber);
			if(itemCount % pageItemNumber != 0) {
				pageNumber++;
			}

			if(now > pageNumber) {
				now = pageNumber;
			}

			$(".mzc_paging .mzc_total").text(pageNumber);
			$(".mzc_paging .mzc_now").text(now);

       		if(searching) {
				populateItemTable(searchingItems, now);
			}
			else {
				populateItemTable(selectedItems, now);
			}

       	}

		populatePagination = function (now, itemCount) {

			var pageNumber = Math.floor(itemCount/pageItemNumber);
			if(itemCount % pageItemNumber != 0) {
				pageNumber++;
			}

			if(now > pageNumber) {
				now = pageNumber;
			}

			$(".mzc_paging .mzc_total").text(pageNumber);
			$(".mzc_paging .mzc_now").text(now);

			refreshPageBtn(now);
		}

		refreshPageBtn = function (page) {
			var total = $(".mzc_paging .mzc_total").eq(0).text();
			if(page <= 1) {
				$(".mzc_prevPage").addClass("mzc_disabled");
			}
			else {
				$(".mzc_prevPage").removeClass("mzc_disabled");
			}
			if(page == total) {
				$(".mzc_nextPage").addClass("mzc_disabled");
			}
			else {
				$(".mzc_nextPage").removeClass("mzc_disabled");
			}
		}

		inlineBaoyou = function ($obj, type) {
			var $option = $(".mzc_baoyouSelect option[value='" + type + "']", $obj);

			$option.prop("selected", true);

		}
		inlineXiangou = function ($obj, type) {

			var $option = $(".mzc_deaSelect option[value='" + type + "']", $obj);

			$option.prop("selected", true);

		}

		deleteItemInfo = function (id) {
			delete info[id];
		}
		updateItemInfo = function (input) {
			// input[0] : item
			// input[1] <= 0: jianjia | > 0: zhekou
			// input[2] : baoyou
			// input[3]: decrease_num
			var ok = true;

			var item = input[0];
			var id = item.num_iid;
			if(typeof info[id] == 'undefined') {
				var el = new Object();
				if(typeof item.old === 'undefined') {
					el.discount = 0;
					el.postfee = 0;
					el.type = 'P';
					el.dn = 0;
				}
				info[id] = el;
			}

			if(input[1] !== '') {
				if(input[1] <= 0) {
					if(-1*input[1]/item.price > 0.3) {
						ok = false;
					}
					info[id].discount = -1*input[1];
					info[id].type = 'P';
				}
				else {
					info[id].discount = input[1];
					info[id].type = 'D';
					info[id].dn = 0;
				}
			}
			if(input.length >= 3 && input[2] !== '') {
				info[id].postfee = input[2];
			}
			if(input.length >= 4 && input[3] !== '') {
                if(typeof info[id].type === "undefined" || info[id].type == 'P') {
					info[id].dn = input[3];
				}
			}
			return ok;
		}
		startLoading = function() {
			$(".mzc_product").hide();
			$(".mzc_loadingIcon").show();
		}
		stopLoading = function() {
			$(".mzc_loadingIcon").hide();
		}
		populateItemTable = function (items, page) {
			clearDiscount();

			// remove old items
            $(".mzc_product").each(function() {
                if(!$(this).hasClass("mzc_productTemplate")) {
                    $(this).remove();
                }
            });

            $products = $(".mzc_products");

            // get template product
            var $template = $(".mzc_productTemplate").clone();
            $template.removeClass("mzc_productTemplate");

            var start = (page-1)*pageItemNumber;
            var end = page*pageItemNumber;
            if(end > items.length) {
            	end = items.length;
            }
            if(start < 0) {
            	start = 0;
            }

            var zindex = 1000;

            for(var i=end-1; i>=start; i--) {

                var item = items[i];
                var $product = $template.clone();

                // set taobao fields
                $product.attr("id", item.num_iid);
                $(".mzc_radio", $product).attr("name", "radio"+item.num_iid);

                $(".mzc_image", $product).attr("href", "http://item.taobao.com/item.htm?id=" + item.num_iid);
                $(".mzc_image img", $product).attr("src", item.pic_url + '_160x160.jpg');
                $(".mzc_image img", $product).attr("alt", item.title);

                $("span.mzc_name a.mzc_pName", $product).text(item.title);
                $("span.mzc_name a.mzc_pName", $product).attr("href", "http://item.taobao.com/item.htm?id=" + item.num_iid);

                $(".mzc_oldPrice span", $product).text(item.price);

                // set custom fields
                var id = item.num_iid;
                if(typeof item.type != "undefined") {
                	if(item.type == 'D') {
                		$(".mzc_discount .mzc_radio", $product).eq(0).prop("checked", true);
                		$(".mzc_discount .mzc_radio", $product).eq(1).prop("checked", false);
						$(".mzc_deaSelect", $product).prop("disabled", true);
						$(".mzc_deaSelect option", $product).eq(0).prop("selected", true);
                	}
                	else {
                		$(".mzc_discount .mzc_radio", $product).eq(0).prop("checked", false);
                		$(".mzc_discount .mzc_radio", $product).eq(1).prop("checked", true);
						$(".mzc_deaSelect", $product).prop("disabled", false);
                	}
                }
                if(typeof item.discount != "undefined") {
                	if(item.type == 'D') {
                		var jianjia = (Math.floor((item.price-item.discount*item.price/10)*100)/100).toFixed(2);
                		$('.mzc_zhekou', $product).val(item.discount);
                		$('.mzc_jianjia', $product).val(jianjia);
                		$('.mzc_zhehoujia', $product).val((item.price-jianjia).toFixed(2));
                	}
                	else {
                		var zhehoujia = (item.price - item.discount).toFixed(2);
                		$('.mzc_zhekou', $product).val((zhehoujia/item.price*10).toFixed(2));
                		$('.mzc_jianjia', $product).val(item.discount);
                		$('.mzc_zhehoujia', $product).val(zhehoujia);
                	}
                }
                else {
                	$('.mzc_jianjia', $product).val(0);
                	$('.mzc_zhekou', $product).val(10);
                	$('.mzc_zhehoujia', $product).val(item.price);
					$(".mzc_deaSelect", $product).prop("disabled", true);
					$(".mzc_deaSelect option", $product).eq(0).prop("selected", true);
                }

                if(typeof item.post_fee_type != "undefined") {
                	inlineBaoyou($product, item.post_fee_type);
                }
                else {
                	inlineBaoyou($product, 0);
                }
                if(typeof item.dn != "undefined") {
                	if(item.type === 'P') {
                		inlineXiangou($product, item.dn);
                	}
                }
                else {
                	inlineXiangou($product, 0);
                }

                if(info[id]) {
                	nowInfo = info[id];
					var oldPrice = item.price;
					var jianjia = nowInfo.discount;
					if(nowInfo.type === 'D') {
						jianjia = (Math.floor((oldPrice-nowInfo.discount*oldPrice/10)*100)/100).toFixed(2);
					}
					var zhehoujia = (oldPrice - jianjia).toFixed(2);
					var zhekou = (zhehoujia/oldPrice*10).toFixed(2);

					$(".mzc_radio", $product).prop("checked", false);
					if(nowInfo.type === 'D') {
						$(".mzc_radio", $product).eq(0).prop("checked", true);
						$(".mzc_deaSelect", $product).prop("disabled", true);
						$(".mzc_deaSelect option", $product).eq(0).prop("selected", true);
					}
					else {
						$(".mzc_radio", $product).eq(1).prop("checked", true);
						$(".mzc_deaSelect", $product).prop("disabled", false);
					}

					if(!isNaN(zhekou)) {
                		$('.mzc_zhekou', $product).val(zhekou);
                	}
                	if(!isNaN(jianjia)) {
                		$('.mzc_jianjia', $product).val(jianjia);
                	}
                	if(!isNaN(jianjia)) {
	                	$('.mzc_zhehoujia', $product).val(zhehoujia);
                	}
                	if(!isNaN(nowInfo.postfee)) {
                		inlineBaoyou($product, nowInfo.postfee);
                	}
                	if(!isNaN(nowInfo.dn)) {
                		inlineXiangou($product, nowInfo.dn);
                	}
                	if(isNaN(zhekou) || zhekou < 7 || zhekou > 10) {
						$(".mzc_discount input", $product).addClass("mzc_darkRed");
					}
                }

                if(typeof item.old == "undefined") {
                	$product.addClass("mzc_newItem");
                }

                $product.prependTo($products);
                $product.show();

            }
            $template.remove();


		}

		generateSelectedItemStr = function () {

			var data = "";
			for(var i=selectedItems.length-1; i>=0; i--) {
				var item = selectedItems[i];
				data += item.num_iid + ",";
			}
			if(data.length > 0) {
				data = data.substr(0, data.length-1);
			}
			return data;
		}

		loadInitialData = function () {
			startLoading();
			$.get('/promotion/checkout/a', {'t': Math.random()},
				function (products) {
					if(products.success == 0) {
						alert("与服务器连接失败。");
                        location.reload();
					}
					else {
						$.get('/promotion/save_get/a', {'type': 'new3discount'},
							function (result) {
								if(result.success == 0) {
									alert(result.msg);
								}
								else {

									// mark old items
									for(var i=0; i<oldItems.length; i++) {
										oldItems[i].old = true;
									}

									newItems = products.prds;
									selectedItems = newItems.concat(oldItems);



									if(result.data != "") {
										info = $.parseJSON(result.data);
										clearPromotionInfo();
									}

									populateItemTable(selectedItems ,1);

									populatePagination(1, selectedItems.length);

									stopLoading();
								}
							}
						, 'json');
					}
				}
			, 'json');
		}

		loadInitialData();

		clearPromotionInfo = function () {
				var x = {}
				for(var i=selectedItems.length-1; i>=0; i--) {
					x[selectedItems[i].num_iid] = true;
				}
				for(var a in info) {
					if(typeof x[a] == "undefined") {
						delete info[a];
					}
				}
			}

		sendSelectedItemsInfo = function () {

			var infoJson = $.toJSON(info);
			sendingData = true;
			$.post('/promotion/save_put/a?rnd='+Math.random(), {'type': 'new3discount', 'data': infoJson},
				function (result) {
					if(result.success == 0) {
						alert("与服务器连接失败");
                        location.reload();
					}
					sendingData = false;
				}

			, 'json');

		}
	}
	// end of edit promotion page

	// add product to promotion page
	if($("#addProductPage").length > 0) {

		//id of selected items
		var selectedItems = [];
		var currentItems = {};
		var selectedItemNumber = 0;
		var pageNo = 1;
		var pageItemNumber = 40;
		var totalItemNumber = 0;

		$(".mzc_productTemplate").hide();

		$(".mzc_product").live({
			mouseenter: function() {
				if(!$(this).hasClass("mzc_disabled") && !$(this).hasClass("mzc_selected")) {
					$(this).addClass("mzc_hover");
				}
			},
			mouseleave: function() {
				$(this).removeClass("mzc_hover");
			}
		});

		$(".mzc_toSomePage").bind("click, focus", function() {
			$(this).select();
		});
		$(".mzc_toSomePageBtn").click(function() {
			var num = $(".mzc_toSomePage").val();
			var total = $(".mzc_total:eq(0)").text();
			if(isNaN(num) || num <= 0 || num > +total) {
				alert("页数输入错误");
				return false;
			}
			toPage(num);
		});
		$(".mzc_toSomePage").keypress(function(e) {
			if(e.keyCode == 13) {
				$(".mzc_toSomePageBtn").trigger("click");
			}
		});

		$(".mzc_product .mzc_image").live("click", function() {

			var $product = $(this).parent();

			if($product.hasClass("mzc_selected")) {
				if(!$product.hasClass("mzc_disabled") && !$(this).hasClass("mzc_limited")) {
					deselectProduct($product, true);
					$product.addClass("mzc_hover");
				}
			}
			else {
				if(!$product.hasClass("mzc_disabled") && !$(this).hasClass("mzc_limited")) {
					selectProduct($product, true);
					$product.removeClass("mzc_hover");
				}
			}
		});

		selectProduct = function(obj, sendResult) {
			var id = $(obj).attr("id");
			if(isNaN(id) || id == "") {
				return false;
			}
			addToSelectedItems(id);
			if(sendResult) {
				sendSelectedItems();
			}
			$(obj).addClass("mzc_selected");
			$(".mzc_selectedProducts strong").text(selectedItems.length);
		}

		deselectProduct = function(obj, sendResult) {
			var id = $(obj).attr("id");
			if(isNaN(id) || id == "") {
				return false;
			}
			removeFromSelectedItems(id);
			if(sendResult) {
				sendSelectedItems();
			}
			$(obj).removeClass("mzc_selected");
			$(".mzc_selectedProducts strong").text(selectedItems.length);
		}

		getProductsType = function() {
			var type = $(".mzc_tabView .mzc_tabs li.mzc_active a").attr("rel");
			return type;
		}

		getTaobaoCategory = function() {
			$now = $("#selectTaobaoCategory option:selected");
			var id = $now.val();
			return id;
		}

		getStoreCategory = function() {
			$now = $("#selectStoreCategory option:selected");
			var id = $now.val();
			return id;
		}

		getSearchString = function () {
			var text = $("#searchInput").val();
			return text;
		}

		startLoading = function() {
			$(".mzc_product").hide();
			$(".mzc_loadingIcon").show();
			$(".mzc_empty").hide();
		}
		stopLoading = function() {
			$(".mzc_loadingIcon").hide();
		}

		loadAlert = function(text) {
			$(".mzc_products .mzc_empty").text(text);
			$(".mzc_products .mzc_empty").show();
		}

		addToSelectedItems = function (id) {
			removeFromSelectedItems(id);
			for(var i=0; i<currentItems.length; i++) {
				var item = currentItems[i];

				if(id == item.num_iid) {
					item.checked = true;
					selectedItems.push(item);
					break;
				}
			}
			return true;
		}
		removeFromSelectedItems = function (id) {
			for(var i=0; i<selectedItems.length; i++) {
				var item = selectedItems[i];

				if(id == item.num_iid) {
					item.checked = false;
					selectedItems.splice(i, 1);
					break;
				}
			}
			return true;
		}



		$(".mzc_selectPageAll").click(function() {
			if(!$(this).hasClass("mzc_deselectPageAll")) {

				$(".mzc_product").each(function() {
					if(!$(this).hasClass("mzc_disabled")) {
						selectProduct(this, false);
					}
				});

				sendSelectedItems();

				$(".mzc_selectPageAll span span").text("取消本页全选");
				$(".mzc_selectPageAll").addClass("mzc_deselectPageAll");
			}
			else {
				$(".mzc_selectPageAll").removeClass("mzc_deselectPageAll");

				$(".mzc_product").each(function() {
					if(!$(this).hasClass("mzc_disabled")) {
						deselectProduct(this, false);
					}
				});

				sendSelectedItems();

				$(".mzc_selectPageAll span span").text("全选本页商品");
				$(".mzc_selectPageAll").addClass("mzc_selectPageAll");
			}
		});

		$(".mzc_loadingIcon").show();



		// get categories
		$.get('/promotion/cats/a?rnd='+Math.random(), function(catsRes) {

			if(catsRes.success == 0) {
				alert(catsRes.msg);
				stopLoading();
			}
			else {

				// populate category select
				populateCategorySelect(catsRes);

			}

		}, 'json');



		// load content
		loadInitialData = function() {
			$(".mzc_filter").show();
			$(".mzc_selection").show();

			startLoading();

			var type = getProductsType();
			$.get('/promotion/search/a?rnd='+Math.random(), {'page_size': pageItemNumber, 'type': type,'rnd':Math.random()},
				function(searchRes) {

					if(searchRes.success == 0) {
						alert(searchRes.msg);
						stopLoading();
					}
					else {

						// populate item table
						populateItemTable(searchRes.items, false);
						// update pagination
						populatePagination(1, searchRes.item_count);

						stopLoading();

					}
				}
			, 'json' );
		}

		// get items
		refreshProductView = function() {

			$(".mzc_filter").show();
			$(".mzc_selection").show();

			startLoading();

			var data = generateSelectedItemStr();
			$.post('/promotion/checkin/a'+"?rnd="+Math.random(), {'ids': data},
				function (result) {
					if(result.success == 0) {
						alert("连接服务器失败");
                        location.reload();
					}
					else {
						var type = getProductsType();
						$.get('/promotion/search/a?rnd='+Math.random(), {'page_size': pageItemNumber, 'type': type,'rnd':Math.random()},
							function(searchRes) {

								if(searchRes.success == 0) {
									loadAlert(searchRes.msg);
									stopLoading();
								}
								else {

									// populate item table
									populateItemTable(searchRes.items, false);
									// update pagination
									populatePagination(1, searchRes.item_count);

									stopLoading();

								}
							}
						, 'json' );
					}
				}
			, 'json' );
		}

		generateSelectedItemStr = function () {

			var data = "";
			for(var i=selectedItems.length-1; i>=0; i--) {
				var item = selectedItems[i];
				data += item.num_iid + ",";
			}
			if(data.length > 0) {
				data = data.substr(0, data.length-1);
			}
			return data;
		}

		sendSelectedItems = function () {
			var data = generateSelectedItemStr();
			$.post('/promotion/checkin/a'+"?rnd="+Math.random(), {'ids': data},
				function (result) {
					if(result.success == 0) {
						alert("与服务器连接失败");
                        location.reload();
					}
				}
			,'json');
		}
		getSelectedItems = function () {
			$.get('/promotion/checkout/a?rnd='+Math.random(),
				function (result) {
					if(result.success == 0) {
						alert("与服务器连接失败");
                        location.reload();
					}
					else {
						selectedItems = result.prds;
						$(".mzc_selectedProducts strong").text(selectedItems.length);
					}
				}
			, 'json');
		}

		getSelectedItems();
		loadInitialData();

		populateItemTable = function(items, isSpecial) {

			currentItems = items.slice();

			// remove old items
			$(".mzc_product").each(function() {

				if(!$(this).hasClass("mzc_productTemplate")) {
					$(this).remove();
				}
			});

			$products = $(".mzc_products");

			// get template product
			var $template = $(".mzc_productTemplate").clone();
			$template.removeClass("mzc_productTemplate");
			for(var i=items.length-1; i>=0; i--) {

				var item = items[i];
				var $product = $template.clone();

				// set taobao fields
				$product.attr("title", item.title);
				$product.attr("id", item.num_iid);

				$(".mzc_image img", $product).attr("src", item.pic_url + '_160x160.jpg');
				$(".mzc_image img", $product).attr("alt", item.title);

				$(".mzc_price i", $product).text(item.price);
				if(item.title.length > 24) {
					$(".mzc_name", $product).text(item.title.substr(0, 22) + "......");
				}
				else {
					$(".mzc_name", $product).text(item.title);
				}
				$(".mzc_name", $product).attr("href", 'http://item.taobao.com/item.htm?id=' + item.num_iid);
				// set custom fields
				if(item.checked && !isSpecial) {
					selectProduct($product, false);
				}
				else if(item.checked || isSpecial) {
					$product.addClass("mzc_selected");
				}
				if(item.disabled) {
					$product.addClass("mzc_disabled");
				}

				$product.prependTo($products);
				$product.show();


			}
			$template.remove();

		}

		populateCategorySelect = function(cats) {

			initialCategorySelect($("#selectStoreCategory"), cats.shop);

			initialCategorySelect($("#selectTaobaoCategory"), cats.all);

		}

		initialCategorySelect = function($select, cats) {

			for(var i=0; i<cats.length; i++) {

				var category = cats[i];

				$option = $("<option></option>");

				$option.attr("value", category.id);
				$option.text(category.name);

				$select.append($option);
			}
		}

		populatePagination = function(now, itemCount) {

			var pageNumber = Math.floor(itemCount/pageItemNumber);
			if(itemCount % pageItemNumber != 0) {
				pageNumber++;
			}

			if(now > pageNumber) {
				now = pageNumber;
			}

			$(".mzc_page .mzc_total").text(pageNumber);
			$(".mzc_page .mzc_now").text(now);
			totalItemNumber = itemCount;

			refreshPageBtn(now);

		}

		doSearch = function(input) { // input[0]: page_no

			data = {}

			startLoading();

			var type = getProductsType();
			var taobao_cid = getTaobaoCategory();
			var store_cid = getStoreCategory();
			var query_str = getSearchString();
			data['type'] = type;
			data['page_size'] = pageItemNumber;
			data['cid'] = taobao_cid;
			data['scid'] = store_cid;
			data['q'] = query_str;


			if(input && input.length > 0 && input[0] != 0) {
				data['page_no'] = input[0];
			}
			else {
				data['page_no'] = 1;
			}

			var selectedItemStr = generateSelectedItemStr();
			$.post('/promotion/checkin/a'+"?rnd="+Math.random(), {'ids': selectedItemStr},
				function (result) {
					if(result.success == 0) {
						alert("连接服务器失败");
                        location.reload();

					}
					else {
                        data['rnd']=Math.random();
						$.get('/promotion/search/a?rnd='+Math.random(), data,
							function(searchRes) {
								if(searchRes.success == 0) {
									loadAlert(searchRes.msg);
								}
								else {
									// populate item table
									populateItemTable(searchRes.items, false);
									// update pagination
									populatePagination(data['page_no'], searchRes.item_count);
								}

								stopLoading();
							},
						'json' );
					}
				}
			, 'json' );
		}

		toPage = function (page) {
			doSearch([page, '']);
			$(".mzc_page .mzc_now").text(page);

			refreshPageBtn(page);
			$(".mzc_selectPageAll").removeClass("mzc_deselectPageAll");
			$(".mzc_selectPageAll span span").text("全选本页商品");
			$(".mzc_selectPageAll").addClass("mzc_selectPageAll");
		}

		refreshPageBtn = function (page) {
			var total = $(".mzc_page .mzc_total").eq(0).text();
			if(page <= 1) {
				$(".mzc_prevPage").addClass("mzc_disable");
			}
			else {
				$(".mzc_prevPage").removeClass("mzc_disable");
			}
			if(page == total) {
				$(".mzc_nextPage").addClass("mzc_disable");
			}
			else {
				$(".mzc_nextPage").removeClass("mzc_disable");
			}
		}

		showSelectedItems = function() {
			$(".mzc_filter").hide();
			$(".mzc_selection").hide();

			populateItemTable(selectedItems, true);
		}

		$("#selectStoreCategory, #selectTaobaoCategory").change(function() {
			if($(this).attr("id") == "selectTaobaoCategory") {
				$("#selectStoreCategory option:eq(0)").prop("selected", true);
				$("#searchInput").val("");
			}
			else {
				$("#selectTaobaoCategory option:eq(0)").prop("selected", true);
				$("#searchInput").val("");
			}
			doSearch();
		});
		$(".mzc_tabView .mzc_tabs li").click(function() {
			$(".mzc_tabView .mzc_tabs li").removeClass("mzc_active");
			$(this).addClass("mzc_active");


			$("#selectStoreCategory option:eq(0)").prop("selected", true);
			$("#selectTaobaoCategory option:eq(0)").prop("selected", true);
			$("#searchInput").val("");

			if($(this).hasClass("mzc_special")) {
				showSelectedItems();
			}
			else {
				refreshProductView();
			}
		});

		$(".mzc_nextPage").click(function () {

			var now = $(".mzc_page .mzc_now").eq(0).text()*1;
			var total = $(".mzc_page .mzc_total").eq(0).text()*1;

			if(now == total) {
				return false;
			}
			toPage(now+1);

		});
		$(".mzc_prevPage").click(function () {

			var now = $(".mzc_page .mzc_now").eq(0).text()*1;
			var total = $(".mzc_page .mzc_total").eq(0).text()*1;

			if(now <= 1) {
				return false;
			}
			toPage(now-1);

		});

		$(".mzc_searchBtn").click(function() {
			$("#selectStoreCategory option:eq(0)").prop("selected", true);
			$("#selectTaobaoCategory option:eq(0)").prop("selected", true);
			doSearch([0]);
		});


		$("#searchInput").keypress(function(e) {
			if(e.keyCode == 13) {
				$(".mzc_searchBtn").trigger("click");
			}
		});

		$("#addProductBtn").click(function() {

			sendSelectedItems();
			setTimeout('window.location.href="/promotion/edit/' + $("#act_id").val() + '"' , 1);
		});

	}
	// end of add product to promotion page

	// promotion details page
	if($("#activityDetailsPage").length > 0) {
		var editMode = getQueryString("editMode");
		if(editMode == "yes") {
			editMode = false;
		}
		else {
			// always on readonly mode
			editMode = false;
		}
		var pListPageSize = 10;

		generatePList = function($list) {

			var len = $(".mzc_productWrapper", $list).length;

			if(len == 0) {
				$id = $list.attr("id");
				$list.remove();
				$("a[rel='#" + $id + "']").remove();
				return false;
			}
			var update = false;
			if($("ul", $list).length > 0) {
				var tlen = $("li", $list).length;
				$(".mzc_productWrapper", $list).each(function() {
					$(this).appendTo($list);
					$(this).remove();
				});
				$("ul", $list).remove();
				$("a.mzc_prev", $list).remove();
				$("a.mzc_next", $list).remove();
				update = true;
			}
			$list.append('<ul class="mzc_carousel"><li></li></ul>');

			var liLen = Math.floor(len/pListPageSize);
			if(len%pListPageSize != 0) liLen++;
			for(var i=1; i<liLen; i++) {
				$(".mzc_carousel", $list).append("<li style='display:none;'></li>");
			}
			var cnt = 0;
			$(".mzc_productWrapper", $list).each(function() {
				$("li", $list).eq(Math.floor(cnt/pListPageSize)).append($(this));
				cnt++;
			});
			if(liLen > 1) {
				$list.append("<a herf='javascript:;' class='mzc_prev mzc_disabled'>上一页</a>");
				$list.append("<a herf='javascript:;' class='mzc_next'>下一页</a>");
			}


			hideEditMode($list);
			$(".mzc_deleteBtn", $list).hide();
			if($("#activityStatus").val() >= 3) {
				$(".mzc_cancelPostFree").hide();
				return false;
			}

			var page = $('a[rel="#' + $list.attr("id") + '"] i');
			page.eq(0).text(1);
			page.eq(1).text(liLen);

			if(editMode) {
				$("a.mzc_deleteBtn", $list).show();
				$("a.mzc_editBtn", $list).show();
			}

			// bind
			/*
			$(".mzc_productWrapper", $list).hover(
				function() {
					if(!$("a.mzc_deleteBtn", this).hasClass("mzc_editing")) {
						$("a.mzc_deleteBtn", this).show();
					}
					else {
						$("a.mzc_cancelBtn", this).show();
					}
					$("a.mzc_editBtn", this).show();
				},
				function() {
					if(!editMode) {
						$("a.mzc_deleteBtn", this).hide();
						$("a.mzc_editBtn", this).hide();
						$("a.mzc_cancelBtn", this).hide();
					}
				}
			);*/
			// bind delete event
			$("a.mzc_deleteBtn", $list).click(function() {
				var yes = confirm("您将取消该商品的折扣，并从活动中去除")
				if(yes) {
					var $product = $(this).parent();

					deleteProduct($product);
				}

			});
			// bind edit event
			$("a.mzc_editBtn", $list).click(function() {
				var $product = $(this).parent();
				if($(this).hasClass("mzc_editing")) {
					editProduct($product);
					hideEditMode($product);
					$(this).removeClass("mzc_editing");
				}
				else {
					showEditMode($product);
					$(this).addClass("mzc_editing");
				}
			});
			$(".mzc_editMode input.mzc_text", $list).keyup(function() {
				updateProductPrice($(this).parent().parent(), $(this));
			});
			$(".mzc_cancelBtn").click(function() {
				cancelProductPrice($(this).parent());
			});

		}

		cancelProductPrice = function($product) {
			$(".mzc_editMode.mzc_zhekou input.mzc_text", $product).val($(".mzc_viewMode.mzc_zhekou em", $product).text());
			$(".mzc_editMode.mzc_jianjia input.mzc_text", $product).val($(".mzc_viewMode.mzc_jianjia em", $product).text());
			$(".mzc_newPrice em", $product).text($(".mzc_oldPrice em", $product).text()*1-$(".mzc_viewMode.mzc_jianjia em", $product).text());
			$(".mzc_editBtn", $product).removeClass("mzc_editing");
			hideEditMode($product);
		}

		updateProductPrice = function($product, $input) {
			var oldPrice = $(".mzc_oldPrice em", $product).text()*1;
			var zhekou,jianjia,newPrice;
			if($input.parent().hasClass("mzc_zhekou")) {
				zhekou = $input.val()*1;
				jianjia = (oldPrice-zhekou*oldPrice/10).toFixed(2);
				newPrice = (oldPrice-jianjia).toFixed(2);
				valid = validateDiscount($product, oldPrice, zhekou, jianjia, newPrice, true, false);
			}
			else {
				jianjia = $input.val()*1;
				zhekou = ((oldPrice-jianjia)/oldPrice*10).toFixed(2);
				newPrice = (oldPrice-jianjia).toFixed(2);
				valid = validateDiscount($product, oldPrice, zhekou, jianjia, newPrice, false, true);
			}

			if(!valid) {
				return false;
			}

			// update
			if($input.parent().hasClass("mzc_zhekou")) {
				$(".mzc_editMode.mzc_jianjia input.mzc_text", $product).val(jianjia);
				$(".mzc_newPrice em", $product).text(newPrice);
			}
			else {
				$(".mzc_editMode.mzc_zhekou input.mzc_text", $product).val(zhekou);
				$(".mzc_newPrice em", $product).text(newPrice);
			}
		}

		validateDiscount = function($product, oldPrice, zhekou, jianjia, newPrice, isZhekou, isJianjia) {

			$(".mzc_error", $product).hide();
			$("input.mzc_text", $product).removeClass("mzc_darkRed");
			var threshold = (oldPrice*0.7).toFixed(2);
			// 折扣
			if(isZhekou) {
				if(isNaN(zhekou) || zhekou < 7 || zhekou > 10) {
					$(".mzc_error1", $product).show();
					$(".mzc_editMode.mzc_zhekou input.mzc_text", $product).addClass("mzc_darkRed");
					return false;
				}
				else {
					$(".mzc_error1", $product).hide();
					$(".mzc_editMode.mzc_zhekou input.mzc_zhekou", $product).removeClass("mzc_darkRed");
				}
			}
			// 减价
			if(isJianjia) {
				if(isNaN(jianjia) || oldPrice-jianjia < threshold || oldPrice*1 < newPrice*1) {
					$(".mzc_error2", $product).show();
					$(".mzc_editMode.mzc_jianjia input.mzc_text", $product).addClass("mzc_darkRed");
					return false;
				}
				else {
					$(".mzc_error2", $product).hide();
					$(".mzc_editMode.mzc_jianjia input.mzc_text", $product).removeClass("mzc_darkRed");
				}
			}
			return true;
		}

		showEditMode = function($product) {
			$(".mzc_deleteBtn", $product).hide();
			$(".mzc_deleteBtn", $product).addClass("mzc_editing");
			$(".mzc_viewMode", $product).hide();
			$(".mzc_viewMode", $product).next().hide();
			$(".mzc_editMode", $product).show();
			$(".mzc_editMode", $product).next().show();
			$(".mzc_editBtn", $product).text("确定");
			$(".mzc_cancelBtn", $product).show();
		}
		hideEditMode = function($product) {
			$(".mzc_deleteBtn", $product).show();
			$(".mzc_deleteBtn", $product).removeClass("mzc_editing");
			$(".mzc_editMode", $product).hide();
			$(".mzc_editMode", $product).next().hide();
			$(".mzc_viewMode", $product).show();
			$(".mzc_viewMode", $product).next().show();
			$(".mzc_editBtn", $product).text("修改");
			$(".mzc_cancelBtn", $product).hide();
		}

		toPage = function($list, num) {
			var len = $('li', $list).length;
			if(num >= len) {
				return false;
			}
			$('li', $list).hide();
			$('li', $list).eq(num).show();
			//alert(len + " " + num);
			if(num == 0) {
				$(".mzc_prev", $list).addClass("mzc_disabled");
			}
			else {
				$(".mzc_prev", $list).removeClass("mzc_disabled");
			}
			if(num == len-1) {
				$(".mzc_next", $list).addClass("mzc_disabled");
			}
			else {
				$(".mzc_next", $list).removeClass("mzc_disabled");
			}
		}

		$(".mzc_detailsView:eq(0)").show();
		$(".mzc_bigTableFilter a").click(function() {
			$(".mzc_detailsView").hide();
			var id = $(this).attr("rel");
			$(id).show();
			$(".mzc_bigTableFilter a").removeClass("mzc_active");
			$(this).addClass("mzc_active");
		});

		$(".mzc_simpleNav a").each(function() {
			var id = $(this).attr("rel");
			if($(id + " .mzc_productWrapper").length == 0) {
				$(this).remove();
				$(id).remove();
			}
		});

		$(".mzc_cancelPostFree").click(function() {
			var yes = confirm("您确定要把这个活动中所有商品设置为不包邮吗?");
			if(yes) {
				var id = $(this).attr("rel");
				var url = '/promotion/set_back_post_fee/' + id +'/a';
				$.get(url, {}, function(data) {
					alert(data.msg);
					window.location.reload();
	            },'json');
	        }
		});

		$(".mzc_pList:eq(0)").show();
		$(".mzc_simpleNav a:eq(0)").addClass("mzc_active");
		$(".mzc_simpleNav a").click(function() {
			$(".mzc_pList").hide();
			var id = $(this).attr("rel");
			$(id).show();
			$(".mzc_simpleNav a").removeClass("mzc_active");
			$(this).addClass("mzc_active");
		});

		$(".mzc_pList").each(function() {
			generatePList($(this));
		});

		$(".mzc_pList a.mzc_prev").live("click", function() {
			if($(this).hasClass("mzc_disabled")) {
				return false;
			}
			var $list = $(this).parent();
			var $li = $(".mzc_carousel li:visible", $list);
			$li.hide().prev().show();
			if($li.prev().prev().html() == null) {
				$(this).addClass("mzc_disabled");
			}
			$("a.mzc_next", $list).removeClass("mzc_disabled");

			var page = $("a[rel='#"+ $list.attr("id") +"'] i");
			var now = page.eq(0).text();
			page.eq(0).text((+now)-1);
		});
		$(".mzc_pList a.mzc_next").live("click", function() {
			if($(this).hasClass("mzc_disabled")) {
				return false;
			}
			var $list = $(this).parent();
			var $li = $(".mzc_carousel li:visible", $list);
			$li.hide().next().show();
			if($li.next().next().html() == null) {
				$(this).addClass("mzc_disabled");
			}
			$("a.mzc_prev", $list).removeClass("mzc_disabled");

			var page = $("a[rel='#"+ $list.attr("id") +"'] i");
			var now = page.eq(0).text();
			page.eq(0).text((+now)+1);
		});



		editProduct = function($product) {
			if($(".mzc_error:visible", $product).length > 0) {
				return false;
			}
			var data = {};
			data["act_id"] = $("#activityId").val();
			data["num_iid"] = $product.attr("id");
			data["discount"] = -$(".mzc_editMode.mzc_jianjia input.mzc_text", $product).val();
			$.get("/promotion/updatep/a", data, function(result) {
				$(".mzc_viewMode.mzc_jianjia em", $product).text($(".mzc_editMode.mzc_jianjia input.mzc_text", $product).val());
				$(".mzc_viewMode.mzc_zhekou em", $product).text($(".mzc_editMode.mzc_zhekou input.mzc_text", $product).val());

			},"json");
		}

		deleteProduct = function($product) {
			var id = $product.attr("id");
			$.get('/promotion/delp/'+id+'/a', function(result) {
				if(result.success == 1) {
					var $list = $product.parentsUntil('.mzc_pList').parent();
					var index = $("li", $list).index($product.parent());
					$product.remove();
					generatePList($list);
					toPage($list, index);
				}
				else {
					alert(result.msg);
				}
			}, 'json');
		}
	}

	if($("#invitePage").length > 0) {
		$("textarea").click(function() {
			$(this).select();
		});

		$(".mzc_copyBtn").click(function() {
			$("textarea").select();
		});
		$('.mzc_copyBtn').zclip({
			path:'/static/js/ZeroClipboard.swf',
			copy: function(){
				return $('textarea').val();
			}
		});

        $("#inviteNameBtn").click(function() {
            var msg = $("#inviteNameMsg");
            var input = $("#inviteNameInput");

            var name = input.val();
            name = $.trim(name);
            if(name == "") {
                msg.text("邀请人的用户名不能为空");
                return false;
            }
            $.post('/user/inviteby/a', {'name': name}, function(result) {
                if(result.success) {
                    $("#inviteName").text(name);
                    $(".invitedfield").hide();
                }
                else {
                    msg.text(result.msg);
                }
            }, 'json');
        });

        $("#inviteHelpLink").click(function(evt) {
            var anchor = $(this);
            var offset = anchor.parent().offset();
            $("#inviteHelpBox").css("left", offset.left+305)
                               .css("top", offset.top-255)
                               .toggle();
        });
        $("#inviteHelpBox a").click(function() {
            $("#inviteHelpBox").toggle();
        });

	}

    if($("#versionPage").length > 0) {
        var subscribe = $("#subscribe");
        $("table a").click(function(evt) {
            var anchor = $(this);
            var id = anchor.attr("rel");
            if(id == 'level0') {
                return true;
            }
            subscribe.css("left", evt.pageX-100)
                     .css("top", evt.pageY-40);
            $(".level", subscribe).hide();
            $("#"+id, subscribe).show();
            subscribe.show();
            return false;
        });
        $("body").click(function() {
            subscribe.hide();
        });
    }

	// login page
	if($("#loginPage").length > 0) {
		$(".mzc_aSideBar").hide();
	}
	if($("#loginFailedPage").length > 0) {
		$(".mzc_aSideBar").hide();
	}

	// shuiyin page
	if($("#shuiyinPage").length > 0) {

		var pageItemNumber = 5;
		var sendingData = false;
		var submitting = false;

		var info = {};

		var nowSelectedItem = "";
		var userLevel =  $("#user_level").val();

		var wmCarouselCurrent = 0;
		$("#wmCarousel").tinycarousel({
			duration: 300,
			callback: function(first, current) {
				wmCarouselCurrent = current;
				$(".mzc_shuiyins .mzc_active").parent().trigger("click");
				if(current > 0) {
					$("#wmCarousel .mzc_now").text(2);
				}
				else {
					$("#wmCarousel .mzc_now").text(1);
				}
			}
		});

	 	$(".mzc_products .mzc_product .mzc_image").live("click", function () {
	 		var $product = $(this).parent();

	 		var $nowActive = $(".mzc_products .mzc_active");

	 		if($(".mzc_onImage", $nowActive.parent()).length > 0) {
	 			$nowActive.addClass("mzc_selected");
	 		}
	 		else {
	 			$nowActive.removeClass("mzc_selected");
	 		}

	 		$nowActive.removeClass("mzc_active");
	 		$(".mzc_selectLine .mzc_arrow").hide();

	 		var left = $(this).offset().left-$product.parent().offset().left;
	 		$(this).addClass("mzc_active");
	 		$(this).removeClass("mzc_selected");
	 		$(".mzc_selectLine .mzc_arrow").css("left", left*1+58+"px");
	 		$(".mzc_selectLine .mzc_arrow").show();

			nowSelectedItem = $product.attr("id");

	 		resetShuiyin();
	 	});

	 	$("#selectStoreCategory, #selectTaobaoCategory").change(function() {
			if($(this).attr("id") == "selectTaobaoCategory") {
				$("#selectStoreCategory option:eq(0)").prop("selected", true);
				$("#searchInput").val("");
			}
			else {
				$("#selectTaobaoCategory option:eq(0)").prop("selected", true);
				$("#searchInput").val("");
			}
			doSearch();
		});

		$(".mzc_searchBtn").click(function() {
			$("#selectStoreCategory option:eq(0)").prop("selected", true);
			$("#selectTaobaoCategory option:eq(0)").prop("selected", true);
			doSearch([0]);
		});
		$("#searchInput").keypress(function(e) {
			if(e.keyCode == 13) {
				$(".mzc_searchBtn").trigger("click");
			}
		});

		$(".mzc_page .mzc_prevPage").click(function () {
        	var now = $(".mzc_page .mzc_now").eq(0).text()*1;
			var total = $(".mzc_page .mzc_total").eq(0).text()*1;

			if(now <= 1) {
				return false;
			}
			toPage(now-1);
        });
        $(".mzc_page .mzc_nextPage").click(function () {
        	var now = $(".mzc_page .mzc_now").eq(0).text()*1;
			var total = $(".mzc_page .mzc_total").eq(0).text()*1;

			if(now == total) {
				return false;
			}
			toPage(now+1);
        });

        toPage = function (page) {
			doSearch([page, '']);
			$(".mzc_page .mzc_now").eq(0).text(page);

			refreshPageBtn(page);

		}

		doSearch = function(input) { // input[0]: page_no

			data = {}

			startLoading();

			var type = 0; //getProductsType();
			var taobao_cid = getTaobaoCategory();
			var store_cid = getStoreCategory();
			var query_str = getSearchString();
			data['type'] = type;
			data['page_size'] = pageItemNumber;
			data['cid'] = taobao_cid;
			data['scid'] = store_cid;
			data['q'] = query_str;


			if(input && input.length > 0 && input[0] != 0) {
				data['page_no'] = input[0];
			}
			else {
				data['page_no'] = 1;
			}
            data['rnd']=Math.random();
			$.get('/promotion/search/a', data,
				function(searchRes) {
					if(searchRes.success == 0) {
						loadAlertModal(searchRes.msg);
					}
					else {
						// populate item table
						populateItemCarousel(searchRes.items, false);
						// update pagination
						populatePagination(data['page_no'], searchRes.item_count);
					}

					stopLoading();
				},
			'json' );
		}

	 	getSearchString = function () {
			var text = $("#searchInput").val();
			return text;
		}

		getTaobaoCategory = function() {
			$now = $("#selectTaobaoCategory option:selected");
			var id = $now.val();
			return id;
		}

		getStoreCategory = function() {
			$now = $("#selectStoreCategory option:selected");
			var id = $now.val();
			return id;
		}
		startLoading = function() {
			$(".mzc_product").hide();
			$(".mzc_loadingIcon").show();
			$(".mzc_empty").hide();
		}
		stopLoading = function() {
			$(".mzc_loadingIcon").hide();
		}

	 	// load content
		loadInitialData = function() {

			startLoading();
			$.get('/promotion/search/a', {'page_size': pageItemNumber, 'type': 0, 'rnd':Math.random()},
				function(searchRes) {

					if(searchRes.success == 0) {
						alert(searchRes.msg);
						stopLoading();
					}
					else {

						// populate item table
						populateItemCarousel(searchRes.items, false);
						// update pagination
						populatePagination(1, searchRes.item_count);
						stopLoading();

					}
				}
			, 'json' );
			// get categories
			$.get('/promotion/cats/a', function(catsRes) {

				if(catsRes.success == 0) {
					alert(catsRes.msg);
					stopLoading();
				}
				else {

					// populate category select
					populateCategorySelect(catsRes);

				}

			}, 'json');
		}

		populateCategorySelect = function(cats) {

			initialCategorySelect($("#selectStoreCategory"), cats.shop);

			initialCategorySelect($("#selectTaobaoCategory"), cats.all);

		}

		initialCategorySelect = function($select, cats) {

			for(var i=0; i<cats.length; i++) {

				var category = cats[i];

				$option = $("<option></option>");

				$option.attr("value", category.id);
				$option.text(category.name);

				$select.append($option);
			}
		}

		populateItemCarousel = function(items, isSpecial) {

			currentItems = items;

			$(".mzc_selectLine .mzc_arrow").hide();
			// remove old items
			$("li.mzc_product").each(function() {
				if(!$(this).hasClass("mzc_productTemplate")) {
					$(this).remove();
				}
			});

			$products = $(".mzc_products");

			// get template product
			var $template = $(".mzc_productTemplate").clone();
			$template.removeClass("mzc_productTemplate");
			for(var i=items.length-1; i>=0; i--) {

				var item = items[i];
				var $product = $template.clone();
				var id = item.num_iid;

				// set taobao fields
				$product.attr("id", item.num_iid);

				$(".mzc_image img", $product).attr("src", item.pic_url + '_128x128.jpg');
				$(".mzc_image img", $product).attr("alt", item.title);
				$(".mzc_image img", $product).attr("title", item.title);

				$(".mzc_detail", $product).attr("href", 'http://item.taobao.com/item.htm?id=' + item.num_iid);

				$product.prependTo($products);
				$product.show();

				if(typeof info[id] != "undefined") {
					var type = 'type_' + info[id].sid;
					var color = 'color_' + info[id].color;

					$shuiyin = $(".mzc_shuiyins ." + type).clone();
					$shuiyin.addClass("mzc_onImage");
					$("div", $shuiyin).removeClass($("mzc_colorSelectorrVal", $shuiyin).val());
					$("div", $shuiyin).addClass("mzc_shuiyin");
					$("div", $shuiyin).addClass(color);
					$(".mzc_colorVal", $shuiyin).val(color);

					$("span", $shuiyin).eq(0).text(info[id].a);

					$product.append($shuiyin);
				}

			}
			$template.remove();

			var $selectedItem = $(".mzc_product[id='" + nowSelectedItem + "']");
			if(nowSelectedItem !== "" && $selectedItem.length > 0) {
				$(".mzc_image", $selectedItem).trigger("click");
			}

		}

		populatePagination = function(now, itemCount) {

			var pageNumber = Math.floor(itemCount/pageItemNumber);
			if(itemCount % pageItemNumber != 0) {
				pageNumber++;
			}

			$(".mzc_page .mzc_total").eq(0).text(pageNumber);
			$(".mzc_page .mzc_now").eq(0).text(now);
			totalItemNumber = itemCount;

			refreshPageBtn(now);

		}
		refreshPageBtn = function (page) {
			var total = $(".mzc_page .mzc_total").eq(0).text();
			if(page <= 1) {
				$(".mzc_prevPage").addClass("mzc_disabled");
			}
			else {
				$(".mzc_prevPage").removeClass("mzc_disabled");
			}
			if(page == total) {
				$(".mzc_nextPage").addClass("mzc_disabled");
			}
			else {
				$(".mzc_nextPage").removeClass("mzc_disabled");
			}
		}

		getShuiyinID = function (type, color) {
			var id = "";
			id = type.substr(5) + '_' + color.substr(6);
			return id;
		}

		applyShuiyin = function () {
			var $product = $(".mzc_products .mzc_active").parent();

			if($product.length == 0) {
				return false;
			}

			$(".mzc_onImage", $product).remove();

			var $shuiyin = $(".mzc_shuiyins .mzc_active").clone();
			var id = $product.attr("id");

			if(!$shuiyin.hasClass("type_0")) {
				$shuiyin.removeClass("mzc_active");
				$shuiyin.addClass("mzc_onImage");
				$product.append($shuiyin);
				///////
				var type = $(".mzc_typeVal", $shuiyin).val();
				var color = $(".mzc_colorVal", $shuiyin).val();
				var text = $(".mzc_textClass", $shuiyin).val();
				var pos = $(".mzc_posVal", $shuiyin).val();

				var id = $product.attr("id");
				var shuiyinId = getShuiyinID(type, color);

				if(typeof info[id] == 'undefined') {
					info[id] = new Object();
				}

				info[id].sid = type.substr(5);
                info[id].color = color.substr(6);
                info[id].pos = pos;
				if(type == 'type_1' || type == 'type_3') {
					info[id].a = $('span', $shuiyin).eq(0).text();
				}
				else if(type == 'type_2' || type == 'type_4' || type == 'type_5') {
					info[id].a = $('span', $shuiyin).eq(0).text();
				}
				else {
					delete info[id].a;
				}

			}
			else {
				delete info[id];
			}
		}

		resetShuiyin = function () {
			var $product = $(".mzc_products .mzc_active").parent();

			var $shuiyin = $(".mzc_onImage", $product);

			if($shuiyin.length == 0) {
				selectShuiyinAndColor(['type_0', 'hide', 'hide']);
			}
			else {
				var type = $(".mzc_typeVal", $shuiyin).val();
				var color = $(".mzc_colorVal", $shuiyin).val();
				var text = $(".mzc_textClass", $shuiyin).val();
				var span1 = $("span", $shuiyin).eq(0).text();
				selectShuiyinAndColor([type, color, text, span1]);
			}
		}

		selectShuiyinAndColor = function(input) {
			var type = input[0];
			var color = input[1];
			var text = input[2];
			$(".mzc_shuiyins .mzc_image").removeClass("mzc_active");
			$(".mzc_shuiyins ."+type).addClass("mzc_active");

			if(color == 'hide') {
				$(".mzc_colorSelector").hide();
			}
			else {
				$(".mzc_colorSelector").show();
				$(".mzc_colorSelector li").removeClass("mzc_active");
				$(".mzc_colorSelector ."+color).addClass("mzc_active");
			}

			if(text == 'hide') {
				$(".mzc_textSelector").hide();
			}
			else {
				$(".mzc_textSelector").hide();
				$("."+text).show();
				if(text == 'mzc_zhekouSelector') {
					var zhekou = input[3];
					$(".mzc_zhekouSelector select option[value='" +zhekou+ "']").prop("selected", true);
				}
				else if(text == 'mzc_ziSelector') {
					var zi = input[3];
					$(".mzc_ziSelector select option[value='" +zi+ "']").prop("selected", true);
				}
				else if(text == 'mzc_zi4Selector') {
					var zi = input[3];
					$(".mzc_zi4Selector select option[value='" +zi+ "']").prop("selected", true);
				}
				else if(text == 'mzc_zhe4Selector') {
					var zi = input[3];
					$(".mzc_zhe4Selector select option[value='" +zi+ "']").prop("selected", true);
				}
			}

			if(color != 'hide' || text != 'hide') {
				updateShuiyin();
			}
		}

		$(".mzc_textSelector input").click(function() {
			if($(this).hasClass("mzc_disabled")) {
				$(this).removeClass("mzc_disabled");
				$(this).parent().find('select').eq(0).find("option[value='X']").prop("selected", true);
				$(this).parent().find('select').eq(0).trigger("change");
			}
		});

		updateShuiyin = function () {

			var updated = false;

			// color
	 		var newColor = $(".mzc_colorSelector .mzc_active input[type='hidden']").val();

			var $shuiyin = $(".mzc_shuiyins .mzc_active");
			if($shuiyin.length == 0) {
				return false;
			}

			var position = 1;
			var count = 0;
			$(".mzc_shuiyins .mzc_image").each(function() {
				if($(this).hasClass("mzc_active")) {
					position = count;
				}
				count++;
			});

			position -= wmCarouselCurrent;
			if(position > 1 && position <= 5) {
				$(".mzc_colorSelector").css("margin-left", 135*(position-2)+"px");
				$(".mzc_textSelector").css("margin-left", 135*(position-2)+"px");
			}
			else if(position >= 6 || position <= 1) {
				$(".mzc_colorSelector").hide();
				$(".mzc_textSelector").hide();
			}

			var oldColor = $('.mzc_shuiyin input.mzc_colorVal', $shuiyin).val();
			if(newColor != oldColor) {
				$('.mzc_shuiyin', $shuiyin).removeClass(oldColor);
				$('.mzc_shuiyin', $shuiyin).addClass(newColor);
				$('.mzc_shuiyin input.mzc_colorVal', $shuiyin).val(newColor);
				updated = true;
			}
			// text
			var textClass = $(".mzc_textClass", $shuiyin).val();
			if(textClass == "mzc_zhekouSelector") {
				var newText = $(".mzc_zhekouSelector select:eq(0) option:selected").val();
				var oldText = $('span', $shuiyin).text();
				if(newText != oldText) {
					$('span', $shuiyin).text(newText);
					updated = true;
				}
			}
			else if(textClass == 'mzc_ziSelector') {
				var newText = $(".mzc_ziSelector select:eq(0) option:selected").val();
				var oldText = $('span', $shuiyin).text();
				if(newText != 'X' && newText != oldText) {
					$('span', $shuiyin).text(newText);
					$('.mzc_ziSelector input').addClass("mzc_disabled");

					updated = true;
				}
				else if (newText == 'X' && newText != oldText) {
					var val = $('.mzc_ziSelector input').val();
					$('span', $shuiyin).text(val);
					$('.mzc_ziSelector input').removeClass("mzc_disabled");
					if(val == '') {
						$('.mzc_ziSelector input').focus();
					}

					updated = true;
				}
			}
			else if(textClass == 'mzc_zi4Selector') {
				var newText = $(".mzc_zi4Selector select:eq(0) option:selected").val();
				var oldText = $('span', $shuiyin).text();
				if(newText != 'X' && newText != oldText) {
					$('span', $shuiyin).text(newText);
					$('.mzc_zi4Selector input').addClass("mzc_disabled");

					updated = true;
				}
				else if (newText == 'X' && newText != oldText) {
					var val = $('.mzc_zi4Selector input').val();
					$('span', $shuiyin).text(val);
					$('.mzc_zi4Selector input').removeClass("mzc_disabled");
					if(val == '') {
						$('.mzc_zi4Selector input').focus();
					}

					updated = true;
				}
			}
			else if(textClass == 'mzc_zhe4Selector') {
				var newText = $(".mzc_zhe4Selector select:eq(0) option:selected").val();
				var oldText = $('span', $shuiyin).text();
				if(newText != 'X' && newText != oldText) {
					$('span', $shuiyin).text(newText);
					$('.mzc_zhe4Selector input').addClass("mzc_disabled");

					updated = true;
				}
				else if (newText == 'X' && newText != oldText) {
					var val = $('.mzc_zhe4Selector input').val();
					$('span', $shuiyin).text(val);
					$('.mzc_zhe4Selector input').removeClass("mzc_disabled");
					if(val == '') {
						$('.mzc_zhe4Selector input').focus();
					}

					updated = true;
				}
			}

			// position
			var $pos = $(".mzc_posVal", $shuiyin);
			var pos = $pos.val();
			if(pos != 0 && !$pos.hasClass("mzc_initial")) {
				var p = $("."+textClass+" .mzc_posSelector option:selected").val();
				$shuiyin.removeClass("pos_"+pos);
				$shuiyin.addClass("pos_"+p);
				$(".mzc_posVal", $shuiyin).val(p);
			}
			else if(pos != 0 && $pos.hasClass("mzc_initial")) {
				$("."+textClass+" .mzc_posSelector option").eq(pos-1).prop("selected", true);
				$pos.removeClass("mzc_initial");
			}

		}

		sendToServer = function() {
			var infoJson = $.toJSON(info);

			sendingData = true;
			$.post('/promotion/save_put/a?rnd='+Math.random(), {'type': 'shuiyin', 'data': infoJson},

				function (result) {
					if(result.success == 0) {
						alert("与服务器连接失败");
                        location.reload();
					}
					sendingData = false;
				}

			, 'json');

		}

	 	loadInitialData();

	 	$(".mzc_colorSelector li").click(function() {
	 		$(".mzc_colorSelector li").removeClass("mzc_active");
	 		$(this).addClass("mzc_active");

	 		updateShuiyin();

	 		applyShuiyin();

	 		sendToServer();
	 	});
	 	$(".mzc_shuiyins li").click(function() {

	 		$(".mzc_shuiyins li .mzc_image").removeClass("mzc_active");
	 		$(".mzc_image", this).addClass("mzc_active");
	 		if(!$(".mzc_image", this).hasClass("type_0")) {
	 			$(".mzc_fixed").removeClass("mzc_active2");
	 		}
	 		else {
	 			$(".mzc_fixed").addClass("mzc_active2");
	 		}

			var type = $(".mzc_typeVal", this).val();
			var color = $(".mzc_colorVal", this).val();
			var text = $(".mzc_textClass", this).val();
	 		selectShuiyinAndColor([type, color, text]);

			if($(window).scrollTop() < 170) {
				 $( 'html, body' ).animate( {scrollTop: 170}, 'fast' );
			}
			else {
				// do nothing
			}

	 		applyShuiyin();

	 		sendToServer();
	 	});
	 	$(".mzc_textSelector select").change(function() {
	 		updateShuiyin();
	 		applyShuiyin();

	 		sendToServer();
	 	});
	 	$(".mzc_textSelector input").keyup(function() {
	 		updateShuiyin();
	 		applyShuiyin();
	 	});
	 	$(".mzc_fixed .type_0").click(function() {
	 		$(this).addClass("mzc_active2");
	 		$(".mzc_shuiyins .mzc_carousel .type_0").parent().trigger("click");
	 	});

	 	$("#shuiyinConfirmBtn").click(function() {

	 		if(!sendingData && !submitting) {
	 			sendToServer();
	 		}

	 		if(sendingData) {
				if(!submitting) {
					//loadAlertModal("提交中，请稍侯。");
				}
				submitting = true;
				setTimeout('$("#shuiyinConfirmBtn").trigger("click");', 300);
				return false;
	 		}

	 		// TODO: 跳转到水印处理页面
	 		$.get("/watermark/a", function(result) {

	 			if(result.success == 1) {
	 				loadAlertModal(result.msg);
	 			}
	 			else {
	 				alert(result.msg);
	 			}

	 		}, 'json' );
	 	});
	 	selectShuiyinAndColor(['type_0', 'hide', 'hide']);
	}

	// shuiyin list page
	if($("#shuiyinDetailPage").length > 0) {
        var initialProducts = function() {
            items = $.parseJSON(items);

            var products = [];

            for(var i=0, max=items[1].length; i<max; i++) { // 已设置
                products.push(new productViewModel(items[1][i], 1));
            }
            for(var i=0, max=items[0].length; i<max; i++) { // 正在设置
                products.push(new productViewModel(items[0][i], 0));
            }
            for(var i=0, max=items[3].length; i<max; i++) { // 正在删除
                products.push(new productViewModel(items[3][i], -2));
            }
            for(var i=0, max=items[2].length; i<max; i++) { // 已删除
                products.push(new productViewModel(items[2][i], -1));
            }
            return products;
            //this.products().sort();
        };

        var imageModalViewModel = {
            image: ko.observable(),

            show: function() {
                loadModal("#imageModal");
            },
            hide: function() {
                closeModal();
            }
        };

        var productViewModel = function(item, status) {
            this.id = item.num_iid;
            this.imageUrl = item.pic_url;
            this.backupImageUrl = item.old_pic;
            this.title = item.title;

            // status: 0 正在设置， 1 设置完成， -1 已经删除， -2 正在删除
            this.status = ko.observable(status);

            this.displayedImage = ko.observable(this.imageUrl);
            if(this.status() == -1) {
                this.displayedImage(this.backupImageUrl);
            }

            this.titleShortcut = function() {
                if(this.title.length > 10) {
                    return this.title.substr(0,10) + "...";
                }
                else {
                    return this.title;
                }
            }

            this.deleteFiligrane = function() {
                // 删除水印
                var id = this.id;
                var instance = this;
                $.get('/promotion/delp/a?num_iid='+id, function(result) {

                    if(result.success == 1) {
                        instance.status(-2);    // 标记为正在删除
                    }
                    else {
                        alert(result.msg);
                    }
                }, 'json');
            };

            this.showBackupImage = function() {
                this.displayedImage(this.backupImageUrl);
            };

            this.showNewImage = function() {
                this.displayedImage(this.imageUrl);
            };

            this.showBackupImageBig = function() {
                imageModalViewModel.image(this.backupImageUrl);
                imageModalViewModel.show();
            };

        };

        var pageViewModel = {
            userLevel: 5,
            productPageSize: 20,
            currentActId: $("#cur_act_id").val(),

            products: ko.observableArray(initialProducts()),
            productCurrentPage: ko.observable(1),
            searchString: ko.observable(""),
            searchMode: ko.observable(false),
            imageModal: imageModalViewModel,

            toPrevPage: function() {
                this.productCurrentPage( this.productCurrentPage()-1 );
            },
            toNextPage: function() {
                this.productCurrentPage( this.productCurrentPage()+1 );
            },
            toPage: function(to) {
                this.productCurrentPage( to );
            },
            deleteAllFiligranes: function() {
                if(confirm('您确定要删除所有商品水印吗？')) {

                    var instance = this;

                    $.get('/promotion/dela/' + this.currentActId + '/a', function(result) {

                        if(result.success == 1) {
                            for(var i=0, max=instance.products().length; i<max; i++) {
                                if(instance.products()[i].status() == 1) {
                                    instance.products()[i].status(-2); // 标记为正在删除
                                }
                            }
                        }
                        else {
                            alert(result.msg);
                        }


                    }, 'json');
                }
            },
            search: function() {
                if($.trim(this.searchString()).length > 0) {
                    this.searchMode(true);
                    this.productCurrentPage(1);
                }
            },
            allProduct: function() {
                this.searchMode(false);
                this.productCurrentPage(1);
            }
        };
        pageViewModel.settingProductNumber = ko.dependentObservable(function() {
            var total = 0;
            for(var i=0, max=this.products().length; i<max; i++) {
                if(this.products()[i].status() == 0) { // 正在设置
                    total++;
                }
            }
            return total;
        }, pageViewModel);
        pageViewModel.deletingProductNumber = ko.dependentObservable(function() {
            var total = 0;
            for(var i=0, max=this.products().length; i<max; i++) {
                if(this.products()[i].status() == -2) { // 正在删除
                    total++;
                }
            }
            return total;
        }, pageViewModel);
        pageViewModel.expectFinishTime = ko.dependentObservable(function() {
            return this.settingProductNumber() * this.userLevel;
        }, pageViewModel);
        pageViewModel.expectDeleteTime = ko.dependentObservable(function() {
            return this.deletingProductNumber() * this.userLevel;
        }, pageViewModel);
        pageViewModel.productPageNumber = ko.dependentObservable(function() {
            var ret = 0;
            if(!this.searchMode()) {
                ret = Math.floor(this.products().length/this.productPageSize);
                if((this.products().length % this.productPageSize) != 0) {
                    ret++;
                }
            }
            else {
                ret = Math.floor(this.searchedProducts().length/this.productPageSize);
                if((this.searchedProducts().length % this.productPageSize) != 0) {
                    ret++;
                }
            }
            if(ret < this.productCurrentPage()) {
                this.productCurrentPage(ret);
            }
            return ret;
        }, pageViewModel);
        pageViewModel.showProducts = ko.dependentObservable(function() {
            var page = this.productCurrentPage();

            var start = (page-1)*this.productPageSize;
            var end = page*this.productPageSize;
            if(end > this.products().length) {
            	end = this.products().length;
            }
            if(start < 0) {
            	start = 0;
            }

            if(!this.searchMode()) {
                return this.products().slice(start, end);
            }
            else {
                return this.searchedProducts().slice(start, end);
            }

        }, pageViewModel);
        pageViewModel.enablePrevPage = ko.dependentObservable(function() {
            return this.productCurrentPage() > 1 ? true : false;
        }, pageViewModel);
        pageViewModel.enableNextPage = ko.dependentObservable(function() {
            if(!this.searchMode()) {
                return this.productCurrentPage()*this.productPageSize < this.products().length ? true : false;
            }
            else {
                return this.productCurrentPage()*this.productPageSize < this.searchedProducts().length ? true : false;
            }
        }, pageViewModel);
        pageViewModel.searchedProducts = ko.dependentObservable(function() {
            var ret = ko.observableArray([]);
            var str = this.searchString();
            for(var i=0, max=this.products().length; i<max && $.trim(str) !== ""; i++) {
                var item = this.products()[i];
                if(item.title.indexOf(str) !== -1) {
                    ret.push(item);
                }
            }
            return ret();
        }, pageViewModel);

        ko.applyBindings(pageViewModel);



		$("#searchInput").keypress(function(e) {
			if(e.keyCode == 13) {
				$(".mzc_searchBtn").trigger("click");
			}
		});

	 	if($.browser.msie && $.browser.version == 7) {
	 		$(".mzc_productWaterView .mzc_carouselWrapper ul.mzc_carousel").css("padding-left", "5px");
	 	}
	}

    if($("#browserPage").length > 0) {
        $(".mzc_small").show();
    }


	// invite
	positionInviteLink = function() {
		if($(".mzc_mainBox").length > 0) {
			$("a#inviteLink").css("top", $(".mzc_mainBox").offset().top + 6);
			$("a#inviteLink").css("left", $(".mzc_content").offset().left + $(".mzc_content").width() - 280).show();
			$("a#helpLink").css("top", $(".mzc_mainBox").offset().top + 6);
			$("a#helpLink").css("left", $(".mzc_content").offset().left + $(".mzc_content").width() - 105).show();
			//$("a#feedbackLink").css("top", $(".mzc_mainBox").offset().top + 6);
			//$("a#feedbackLink").css("left", $(".mzc_content").offset().left + $(".mzc_content").width() - 90).show();

			var helpLinks = ['http://bangpai.taobao.com/group/thread/14629359-267635731.htm'];

			var t = Math.random();
			if(t < 1) {
				$("a#helpLink").attr('href', helpLinks[0]);
			}

		}
		else {
			$("a#inviteLink").hide();
			$("a#helpLink").hide();
		}
	}

	positionInviteLink();
	$(window).resize(function() {
		positionInviteLink();
	});

	$("#feedbackLink").click(function() {
		$("#feedbackModal .mzc_message").hide();
		$("#feedbackModal .mzc_form").show();
		loadModal("#feedbackModal");
	});
	$("#feedbackModal .submit").click(function() {
		var adv = $("#fadvice").val();
		var contact = $("#fcontact").val();
		if(adv.length < 1) {
			alert("不能提交空建议哦");
			return false;
		}
		$.post('/feedback/post', {'text': adv, 'contact': contact}, function(result) {
			if(result.success == 1) {
				 $("#feedbackModal .mzc_form").hide();
				 $("#feedbackModal .mzc_message").show();
				 setTimeout(function() {
				 	closeModal();
				 }, 2000);
			}
		}, 'json');
	});
	// add custom tooltip
	tooltip();

	$(".mzc_header a.mzc_logout").click(function() {
    	$.cookie('deadlineMaskTime', null, {path:'/'});
		var link = $(this).attr("rel");
		$.get(link, function(result) {
			if(result.success == 1) {
				jumpTo("/");
			}
			else {

			}
		} , 'json');

		return false;
	});

	$("#addToBookmark").click(function() {
	    BookmarkApp.addBookmark($(this)[0]);
	});

	positionGoTop = function() {
		$(".mzc_goTop").css("left", $(".mzc_content").offset().left + $(".mzc_content").width() + 10);
		$(".mzc_goBottom").css("left", $(".mzc_content").offset().left + $(".mzc_content").width() + 10);
	}
	$(".mzc_goTop a").click(function() {
		 $( 'html, body' ).animate( {scrollTop: 0}, 'fast' );
	});
	$(".mzc_goBottom a").click(function() {
		 $( 'html, body' ).animate( {scrollTop: $(document).height()}, 'fast' );
	});
	positionGoTop();
	if($(".mzc_goTop").length > 0) {
		$(window).scroll(function() {
			if($(window).scrollTop() > 30) {
				$(".mzc_goTop").show();
			}
			else {
				$(".mzc_goTop").hide();
			}
		});
		$(window).scroll(function() {
			if($(document).height()-$(window).scrollTop() > $(window).height()) {
				$(".mzc_goBottom").show();
			}
			else {
				$(".mzc_goBottom").hide();
			}
		});
        if($(document).height()-$(window).scrollTop() > $(window).height()) {
            $(".mzc_goBottom").show();
        }
	}


	// keep the connection alive
	var requestInterval = 3 * 60 * 1000;
	nullRequest = function() {
		$.get("/user/refresh", function(result) {
			if(result.success == 0) {
				alert("您长时间未操作，为了您的账号安全，请重新登录。");
				setTimeout("window.location.href='/'", 1);
			}
			else {
				setTimeout("nullRequest()", requestInterval);
			}
		});
	}
	setTimeout("nullRequest()", requestInterval);

});

// general functions
jumpTo = function(link) {
	setTimeout("window.location.href='" + link + "'", 1);
}
minLengthCheck = function(el, minLen) {
	if(el.length >= minLen) return true;
	else return false;
}
maxLengthCheck = function(el, maxLen) {
	if(el.length <= maxLen) return true;
	else return false;
}
getByteLen = function(val) {
	var len = 0;
	for (var i = 0; i < val.length; i++) {
		if (val.charAt(i).match(/[^\x00-\xff]/ig) != null) //全角
			len += 2;
		else
			len += 1;
	}
	return len;
}
getByteString = function(val, limit) {
	var len = 0;
	var ret = "";
	for (var i = 0; i < val.length; i++) {
		if (val.charAt(i).match(/[^\x00-\xff]/ig) != null) //全角
			len += 2;
		else
			len += 1;
		if(len > limit)
			return ret;
		ret += val.charAt(i);
	}
	return ret;
}
/**
 * remove element from array
 */
removeFromArray = function(arr, el) {
	var idx = arr.indexOf(el);
	if(idx != -1) {
		arr.splice(idx, 1);
	}
	return arr;
}

window.openWindow = function(url){
    var top = (document.body.clientHeight+30);
    var left = (document.body.clientWidth+30);
    var ok = window.open(url, 'connect_window', 'height=0, width=0, toolbar=no, menubar=no, scrollbars=yes, resizable=no,top='+top+',left='+left+', location=no, status=no');
    if(ok == null) {
    	$(".mzc_errorMsg").show();
    }
}

/************** Modal Window Function **************/
positionModal = function() {
	var wWidth  = window.innerWidth;
	var wHeight = window.innerHeight;

	if (wWidth==undefined) {
		wWidth  = document.documentElement.clientWidth;
		wHeight = document.documentElement.clientHeight;
	}

	var boxLeft = parseInt((wWidth / 2) - ( $("#modalContainer").width() / 2 ));
	var boxTop  = parseInt((wHeight / 2) - ( $("#modalContainer").height() / 4 * 3 ));

	// position modal
	$("#modalContainer").css({
		'margin': boxTop + 'px auto 0 ' + boxLeft + 'px'
	});

	if($.browser.msie && $.browser.version == "6.0") {
		$("#modalContainer").css("margin-top", boxTop*1+100 + "px");
	}

	$("#modalBackground").css("opacity", "0.6");
	$("body").css("height", $(".mzc_wrapper").height() + "px");
	if ($("body").height() > $("#modalBackground").height()){
		$("#modalBackground").css("height", $("body").height() + "px");
	}
}
positionStaticModal = function() {
	var wWidth  = window.innerWidth;
	var wHeight = window.innerHeight;

	if (wWidth==undefined) {
		wWidth  = document.documentElement.clientWidth;
		wHeight = document.documentElement.clientHeight;
	}

	var boxLeft = parseInt((wWidth / 2) - ( $("#modalContainer").width() / 2 ));
	var boxTop  = parseInt((wHeight / 2) - ( $("#modalContainer").height() / 4 * 3 ));

	if(boxTop < 120) {
		boxTop = 120
	}
	// position modal
	$("#modalContainer").css({
		'top': boxTop + 'px',
		'left': boxLeft + 'px'
	});

	if($.browser.msie && $.browser.version == "6.0") {
		$("#modalContainer").css("top", boxTop*1+100 + "px");
	}

	$("#modalBackground").css("opacity", "0.3");
	$("body").css("height", $(".mzc_wrapper").height() + "px");
	if ($("body").height() > $("#modalBackground").height()){
		$("#modalBackground").css("height", $("body").height() + "px");
	}
}
loadModal = function(itemId) {
	$('#modalBackground').show();
	$('#modalContainer').show();
	$(itemId).show();
	positionModal();
	$(".mzc_closeModal").click(function() {
		closeModal();
	});
}
loadModalAndReset = function(itemId, resetItemId) {
	$('#modalBackground').show();
	$('#modalContainer').show();
	$('#modalContainer').bgiframe();
	$(itemId).show();
	positionModal();
	$(".mzc_closeModal").click(function() {
		closeModal();
		loadModal(resetItemId);
	});
}
loadStaticModal = function(itemId) {
	$('#modalBackground').show();
	$('#modalContainer').show();
	$('#modalContainer').bgiframe();
	$(itemId).show();
	$('#modalContainer').css('position', 'absolute');
	positionStaticModal();
	$(".mzc_closeModal").click(function() {
		closeModal();
	});
}
closeModal = function() {
	$('.mzc_modal').hide();
	$('#modalContainer').hide();
	$('#modalBackground').hide();
}
loadAlertModal = function(text) {
	closeModal();
	$('#modalBackground').show();
	$('#modalContainer').show();
	$('#modalContainer').bgiframe();
	$("#alertModal").show();
	$("#alertModal .mzc_message").html(text);
	positionModal();
	$(".mzc_closeModal").click(function() {
		closeModal();
	});
}
function getQueryString(name)  {
    if(location.href.indexOf("?")==-1 || location.href.indexOf(name+'=')==-1)  {
        return '';
    }

    var queryString = location.href.substring(location.href.indexOf("?")+1);
    var parameters = queryString.split("&");

    var pos, paraName, paraValue;
    for(var i=0; i<parameters.length; i++)  {
        pos = parameters[i].indexOf('=');
        if(pos == -1) {
			continue;
		}

        paraName = parameters[i].substring(0, pos);
        paraValue = parameters[i].substring(pos + 1);

        if(paraName == name) {
            return unescape(paraValue.replace(/\+/g, " "));
        }
    }
    return '';
}
getUrlParameter = function () {
	var parameter = location.href.substring(location.href.lastIndexOf("/")+1);
	return parameter;
}
isIE6or7 = function () {
	return ($.browser.msie && ($.browser.version == 6 || $.browser.version == 7));
}
var hexDigits = new Array("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");
function rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}
function hex(x) {
    return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
}

this.tooltip = function(){
	/* CONFIG */
		xOffset = 5;
		yOffset = 20;
	/* END CONFIG */
	$(".mzc_tooltip").hover(function(e){
		this.t = this.title;
		this.title = "";
		$("body").append("<p id='tooltip'>"+ this.t +"</p>");
		$("#tooltip")
			.css("left",(e.pageX + xOffset) + "px")
			.css("top",(e.pageY + yOffset) + "px")
			.fadeIn("fast");
    },
	function(){
		this.title = this.t;
		$("#tooltip").remove();
    });
	$(".mzc_tooltip").mousemove(function(e){
		$("#tooltip")
			.css("left",(e.pageX + xOffset) + "px")
			.css("top",(e.pageY + yOffset) + "px");
	});
}


/*****
 * google analytic mouse click record
 */
/*
$(document).ready(function() {
	$("a").live("click", function() {
		var name = $(this).attr("name");
		var page = $("body").attr("id");
		_gaq.push(['_trackEvent', 'ButtonClick', page, name]);
	});
});
*/

BookmarkApp = function () {
    var isIEmac = false; /*@cmzc_on @if(@_jscript&&!(@_win32||@_win16)&&
(@_jscript_version<5.5)) isIEmac=true; @end @*/
//    var isMSIE = (-[1,]) ? false : true;
    var cjTitle = "美印";
    var cjHref = 'meizhe.taovip.com';

    function hotKeys() {
        var ua = navigator.userAgent.toLowerCase();
        var str = '';
        var isWebkit = (ua.indexOf('webkit') != - 1);
        var isMac = (ua.indexOf('mac') != - 1);

        if (ua.indexOf('konqueror') != - 1) {
            str = 'CTRL + B'; // Konqueror
        } else if (window.home || isWebkit || isIEmac || isMac) {
            str = (isMac ? 'Command/Cmd' : 'CTRL') + ' + D'; // Netscape, Safari, iCab, IE5/Mac
        }
        return ('请按住' + str + '来收藏美印:)');
    }

    function isIE8() {
       return $.browser.msie && $.browser.version == 8
    }

    function addBookmark(a) {
        try {
            if (typeof a == "object" && a.tagName.toLowerCase() == "a") {
                a.style.cursor = 'pointer';
                if ((typeof window.sidebar == "object") && (typeof window.sidebar.addPanel == "function")) {
                    window.sidebar.addPanel(cjTitle, cjHref, ""); // Gecko
                } else if (isMSIE && typeof window.external == "object") {
                    if (isIE8()) {
                        window.external.AddToFavoritesBar(cjHref, cjTitle); // IE 8
                    } else {
                        window.external.AddFavorite(cjHref, cjTitle); // IE <=7
                    }
                } else if (window.opera) {
                    a.href = cjHref;
                    a.title = cjTitle;
                    a.rel = 'sidebar'; // Opera 7+
                } else {
                    alert(hotKeys());
                }
            } else {
                throw "收藏失败，可能您的浏览器不支持此操作。请手动收藏：）";
            }
        } catch (err) {
            alert(err);
        }

    }

    return {
        addBookmark : addBookmark
    }
}();

// local storage

