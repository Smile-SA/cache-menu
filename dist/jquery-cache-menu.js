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
// Macro behavior
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
		storage : {
			cacheName : 'menuToCache',
			hashName : 'menuHash'
		},
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
		return options.namespace + options.storage.cacheName;
	};

	Plugin.prototype.getStorageMenuHashName = function () {
		var options = this.options;
		return options.namespace + options.storage.hashName;
	};

	Plugin.prototype.getCookieName = function () {
		var options = this.options;
		return options.namespace + options.cookieInfo.name;
	};

	/**
	 * This workflow is triggered when there is no cookie set, that means when
	 * the browser is officially virgin of all this plugin features.
	 * 
	 * Menu is retrieved from the HTML stream, also, a hash associated to the
	 * menu is extracted. Both hash and menu data are stored into localstorage.
	 * 
	 * Finally an 'menu-initialization-done' event is triggered to allow user to
	 * add their own logic.
	 */
	Plugin.prototype.manageWithoutCookie = function () {
		console.log('[jquery-cache-menu] no cookie : disable initialisation trigger');
		var $container = $(this.element);
		$container.off('menu-initialization-todo');
		console.log('[jquery-cache-menu] no cookie : get menu from webpage');
		var options = this.options;
		var cookieInfo = options.cookieInfo;
		// manage menu hash
		var storageMenuHashName = this.getStorageMenuHashName();
		var menuHash = $container.data().menuHash;
		if (menuHash) {
			console.log('[jquery-cache-menu] no cookie : store menu hash into localstorage');
			window.localStorage.setItem(storageMenuHashName, menuHash);
		}
		var storageCacheName = this.getStorageMenuItemName();
		// manage menu data
		console.log('[jquery-cache-menu] no cookie : store menu into localstorage');
		var menuToCache = $container.html();
		window.localStorage.setItem(storageCacheName, menuToCache);
		// set cookie
		console.log('[jquery-cache-menu] no cookie : set cookie');
		docCookies.setItem(this.getCookieName(), 1, cookieInfo.durationInSec, cookieInfo.path);
		// internal initialization is done
		console.log('[jquery-cache-menu] no cookie : trigger menu-initialization-done on container');
		// trigger this event for business logic initialization
		$container.trigger('menu-initialization-done');
	};

	/**
	 * This workflow does nothing if lazy initialisation is set to true. If set
	 * to false, it automatically trigger the internal initialization.
	 */
	Plugin.prototype.manageWithCookie = function () {
		if (this.options.initAtStartup) {
			console.log('[jquery-cache-menu] cookie and storage : init at startup');
			$(this.element).trigger('menu-initialization-todo');
		}
	};

	/**
	 * This workflow manage behavior while encountering an error.
	 * 
	 * Error can be having a cookie but no stored menu data which is
	 * inconsistent. In that case, the cookie is removed and will be fixed at
	 * the next page initialization.
	 * 
	 * Also, you may have the page reload if 'reloadOnError' is set to true. If
	 * false, it does nothing.
	 */
	Plugin.prototype.errorWithCookie = function () {
		console.log('[jquery-cache-menu] errorWithCookie : we have a problem !');
		console.log('[jquery-cache-menu] errorWithCookie : remove cookie');
		var options = this.options;
		var cookieInfo = options.cookieInfo;
		var reloadOnError = options.reloadOnError;
		docCookies.removeItem(this.getCookieName(), cookieInfo.path);
		if (reloadOnError) {
			window.location.reload();
		} else {
			console.log('[jquery-cache-menu] errorWithCookie : reloadOnError is set to false, so that we will not do anything');
		}
	};

	/**
	 * If you're using menu hash (attribute data-menu-hash on the menu root
	 * element), you can invalidate cache by providing a new hash.
	 * 
	 * If hash does not change from the previous value, there is no action.
	 * 
	 * If hashes are not the same, the error workflow is executed.
	 */
	Plugin.prototype.manageCacheValidity = function () {
		var $container = $(this.element);
		var newHash = $container.data().menuHash;
		if (newHash) {
			// check if menu is still valid
			var oldHash = window.localStorage.getItem(this.getStorageMenuHashName());
			if (newHash !== oldHash) {
				console.log('[jquery-cache-menu] manageCacheValidity : hash are not the same', oldHash, newHash);
				this.errorWithCookie();
			}
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
			this.manageCacheValidity();
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
