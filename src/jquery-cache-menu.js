/*!
 * jQuery cache menu plugin
 * This plugin needs Modernizr with the 'cookies' and 'localStorage' detectors
 */
// if browser does not manage localstorage
// // do nothing and stop
// if not cookie
// // get menu from webpage
// // store menu into localstorage
// // set cookie
// if cookie and nothing into localstorage
// // we have a problem !
// // remove cookie
// if event menu-injection triggers for the first time
// // get menu from localstorage
// // inject menu into webpage
// // call init callback
(function ($, window, document, undefined) {
	'use strict';

	var docCookies = window.docCookies;

	var pluginName = "cacheMenu";
	var defaults = {
		cookieInfo : {
			name : 'skipMenuTransfer',
			durationInSec : 3600,
			path : '/'
		},
		storageCacheName : 'menuToCache',
		reloadOnError : true,
		initAtStartup : true
	};

	function Plugin (element, options) {
		this.element = element;
		this.options = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	var manageWithoutCookie = function ($container, cookieInfo, storageCacheName) {
		console.log('[jquery-cache-menu] no cookie : disable initialisation trigger');
		$container.off('menu-initialization-todo');
		console.log('[jquery-cache-menu] no cookie : get menu from webpage');
		var menuToCache = $container.html();
		console.log('[jquery-cache-menu] no cookie : store menu into localstorage');
		window.localStorage.setItem(storageCacheName, menuToCache);
		console.log('[jquery-cache-menu] no cookie : set cookie');
		docCookies.setItem(cookieInfo.name, 1, cookieInfo.durationInSec, cookieInfo.path);
		console.log('[jquery-cache-menu] no cookie : trigger menu-initialization-done on container');
		$container.trigger('menu-initialization-done');
	};

	var manageWithCookie = function ($container, initAtStartup) {
		if (initAtStartup) {
			console.log('[jquery-cache-menu] cookie and storage : init at startup');
			$container.trigger('menu-initialization-todo');
		}
	};

	var errorWithCookie = function (cookieInfo, reloadOnError) {
		console.log('[jquery-cache-menu] cookie but no storage : we have a problem !');
		console.log('[jquery-cache-menu] cookie but no storage : remove cookie');
		docCookies.removeItem(cookieInfo.name, cookieInfo.path);
		if (reloadOnError) {
			window.location.reload();
		} else {
			console.log('[jquery-cache-menu] cookie but no storage : reloadOnError is set to false, so that we will not do anything');
		}
	};

	Plugin.prototype = {
		init : function () {
			console.log('[jquery-cache-menu] init');

			var options = this.options;
			var $container = $(this.element);
			var cookie, cachedMenu;
			var Modernizr = window.Modernizr;

			if (!Modernizr.cookies) {
				console.log('Cookies are not available, do nothing');
				$container.trigger('menu-initialization-done');
				return false;
			}

			if (!Modernizr.localstorage) {
				console.log('Localstorage is not available, do nothing');
				$container.trigger('menu-initialization-done');
				return false;
			}

			$container.on('menu-initialization-todo', function () {
				console.log('[jquery-cache-menu] menu-initialization-todo : get menu data from storage');
				var cachedMenu = window.localStorage.getItem(options.storageCacheName);
				console.log('[jquery-cache-menu] menu-initialization-todo : inject menu into webpage');
				$container.html(cachedMenu);
				console.log('[jquery-cache-menu] menu-initialization-todo : trigger menu-initialization-done on container');
				$container.trigger('menu-initialization-done');
			});

			cookie = docCookies.getItem(options.cookieInfo.name);
			if (!cookie) {
				manageWithoutCookie($container, options.cookieInfo, options.storageCacheName);
			} else {
				cachedMenu = window.localStorage.getItem(options.storageCacheName);
				if (!cachedMenu) {
					errorWithCookie(options.cookieInfo, options.reloadOnError);
				} else {
					manageWithCookie($container, options.initAtStartup);
				}
			}
		}
	};

	$.fn[pluginName] = function (options) {
		return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));
			}
		});
	};
})(jQuery, window, document);
