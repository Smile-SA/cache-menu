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
		initAtStartup : true,
		namespace : ''
	};

	function Plugin (element, options) {
		this.element = element;
		this.options = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	Plugin.prototype.getStorageMenuItemName = function () {
		var options = this.options;
		return options.namespace + options.storageCacheName;
	};

	Plugin.prototype.getCookieName = function () {
		var options = this.options;
		return options.namespace + options.cookieInfo.name;
	};

	Plugin.prototype.manageWithoutCookie = function () {
		console.log('[jquery-cache-menu] no cookie : disable initialisation trigger');
		var $container = $(this.element);
		$container.off('menu-initialization-todo');
		console.log('[jquery-cache-menu] no cookie : get menu from webpage');
		var options = this.options;
		var cookieInfo = options.cookieInfo;
		var menuToCache = $container.html();
		var storageCacheName = this.getStorageMenuItemName();
		console.log('[jquery-cache-menu] no cookie : store menu into localstorage');
		window.localStorage.setItem(storageCacheName, menuToCache);
		console.log('[jquery-cache-menu] no cookie : set cookie');
		docCookies.setItem(this.getCookieName(), 1, cookieInfo.durationInSec, cookieInfo.path);
		console.log('[jquery-cache-menu] no cookie : trigger menu-initialization-done on container');
		$container.trigger('menu-initialization-done');
	};

	Plugin.prototype.manageWithCookie = function () {
		if (this.options.initAtStartup) {
			console.log('[jquery-cache-menu] cookie and storage : init at startup');
			$(this.element).trigger('menu-initialization-todo');
		}
	};

	Plugin.prototype.errorWithCookie = function () {
		console.log('[jquery-cache-menu] cookie but no storage : we have a problem !');
		console.log('[jquery-cache-menu] cookie but no storage : remove cookie');
		var options = this.options;
		var cookieInfo = options.cookieInfo;
		var reloadOnError = options.reloadOnError;
		docCookies.removeItem(this.getCookieName(), cookieInfo.path);
		if (reloadOnError) {
			window.location.reload();
		} else {
			console.log('[jquery-cache-menu] cookie but no storage : reloadOnError is set to false, so that we will not do anything');
		}
	};

	Plugin.prototype.init = function () {
		console.log('[jquery-cache-menu] init');

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

		var $container = $(this.element);
		var plugin = this;
		$container.on('menu-initialization-todo', function () {
			console.log('[jquery-cache-menu] menu-initialization-todo : get menu data from storage');
			var cachedMenu = window.localStorage.getItem(plugin.getStorageMenuItemName());
			console.log('[jquery-cache-menu] menu-initialization-todo : inject menu into webpage');
			$container.html(cachedMenu);
			console.log('[jquery-cache-menu] menu-initialization-todo : trigger menu-initialization-done on container');
			$container.trigger('menu-initialization-done');
		});

		var options = this.options;
		var cachedMenu;
		var cookie = docCookies.getItem(this.getCookieName());
		if (!cookie) {
			this.manageWithoutCookie();
		} else {
			cachedMenu = window.localStorage.getItem(this.getStorageMenuItemName());
			if (!cachedMenu) {
				this.errorWithCookie();
			} else {
				this.manageWithCookie();
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
