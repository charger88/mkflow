/*
MKFlow v1.0.4
Copyright (c) 2013, 2014 Mikhail Kelner
Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*/

(function($){
    jQuery.fn.mkflow = function(options){
        options = $.extend({
			columnsNumber: -1,
			columnWidthMin: -1,
			columnWidth: -1,
			directionStart: 'left',
			rebuildTimeout: -1,
			itemsStrongOrder: false,
			flowBlockPageEnd: false,
			flowURL: '',
			flowSkipPages: 0,
			onFlowSuccess: function(response){
				$plugin.append(response)
			}
        }, options);
		var $plugin = this;
		var update_blocking = false;
		var columns_current = -1;
		var column_last = 0;
		var make = function(){
			$plugin.addClass('mkflow');
			$plugin.css({
				position: 'relative'
			});
			$plugin.process();
			if (options.flowURL.length > 0){
				$(window).scroll(function(){
					if (!$plugin.update_blocking){
						flowendposition = $plugin.height() + $plugin.offset().top + ($('body').outerHeight(true) - $('body').outerHeight()) / 2;
						scrollposition  = $(document).scrollTop() + $(window).height();
						documentheight  = $(document).height();
						if (
							( (flowendposition < scrollposition) && (flowendposition < documentheight) && (scrollposition < documentheight) )
							||
							( ( (flowendposition == scrollposition) || (!options.flowBlockPageEnd) ) && (scrollposition == documentheight) )
						){
							$plugin.update_blocking = true;
							$.ajax({
								url: options.flowURL,
								data: 'skip_pages=' + (options.flowSkipPages + 1),
								type: 'POST',
								success: function(response){
									options.onFlowSuccess(response);
									$plugin.columns_current = -1;
									$plugin.process();
									options.flowSkipPages += 1;
									if (response || response.length){
										$plugin.update_blocking = false;
									}
								}
							});
						}
					}
				});
			}
			return $plugin;
		};
		$plugin.process = function(){
			if ($plugin.find('*').length > 0){
				if (options.columnsNumber > 0){
					columns = options.columnsNumber;
					do {
						diff = $plugin.children().eq(0).outerWidth(true) - $plugin.children().eq(0).width();
						width = Math.floor($plugin.width() / columns);
					} while ( (options.columnWidthMin > 0) && ( (width - diff) < options.columnWidthMin) && (--columns) );
					$plugin.children().css('width', (width - diff) + 'px');
					$plugin.columns_current = -1;
				} else {
					if (options.columnWidth > 0){
						$plugin.children().css('width',options.columnWidth + 'px');
					}
					width = $plugin.children().eq(0).outerWidth(true);
					columns = Math.floor($plugin.width() / width);
				}
				if ($plugin.columns_current != columns){
					$plugin.columns_current = columns;
					columns_height = new Array();
					if (options.itemsStrongOrder){
						column_last = 0;
					}
					for (i = 0; i < columns; i++){
						columns_height[i] = 0;
					}
					$plugin.children().css({
						position: 'absolute'
					}).each(function(){
						cmv = columns_height[cmi = 0];
						for (i = 1; i < columns; i++){
							if (columns_height[i] < cmv){
								cmv = columns_height[cmi = i];
							}
						}
						if (options.itemsStrongOrder){
							cmi = column_last;
							column_last = (cmi + 1) % columns;
						}
						$(this).css(options.directionStart,cmi * width + 'px').css('top',columns_height[cmi] + 'px');
						columns_height[cmi] += $(this).outerHeight(true);
					});
					cmv = 0;
					for (i = 0; i < columns; i++){
						if (columns_height[i] > cmv){
							cmv = columns_height[i];
						}
					}
					$plugin.css('height', cmv + 'px');
				}
				if (options.rebuildTimeout > 0){
					setTimeout(function(){
						options.rebuildTimeout = 0;
						$plugin.columns_current = -1;
						$plugin.process();
					},options.rebuildTimeout);
				}
			}
		}
		$(window).resize(function(){
			$plugin.columns_current = -1;
			$plugin.process();
		});
		return $plugin.each(make);
	};
})(jQuery);