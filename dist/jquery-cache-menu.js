/*! jquery-cache-menu - v1.0.1 */
/*\
|*|
|*|  :: cookies.js ::
|*|
|*|  A complete cookies reader/writer framework with full unicode support.
|*|
|*|  Revision #1 - September 4, 2014
|*|
|*|  https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path[, domain]])
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

var docCookies = {
	getItem : function (sKey) {
		if (!sKey) {
			return null;
		}
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	setItem : function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
		if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
			return false;
		}
		var sExpires = "";
		if (vEnd) {
			switch (vEnd.constructor) {
			case Number:
				sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
				break;
			case String:
				sExpires = "; expires=" + vEnd;
				break;
			case Date:
				sExpires = "; expires=" + vEnd.toUTCString();
				break;
			}
		}
		document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "")
				+ (bSecure ? "; secure" : "");
		return true;
	},
	removeItem : function (sKey, sPath, sDomain) {
		if (!this.hasItem(sKey)) {
			return false;
		}
		document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
		return true;
	},
	hasItem : function (sKey) {
		if (!sKey) {
			return false;
		}
		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	},
	keys : function () {
		var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
		for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
			aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
		}
		return aKeys;
	}
};
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
