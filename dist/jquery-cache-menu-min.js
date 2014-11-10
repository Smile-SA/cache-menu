/*! jquery-cache-menu - v1.0.0 - 2014-11-10 */
var docCookies={getItem:function(a){return a?decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*"+encodeURIComponent(a).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=\\s*([^;]*).*$)|^.*$"),"$1"))||null:null},setItem:function(a,b,c,d,e,f){if(!a||/^(?:expires|max\-age|path|domain|secure)$/i.test(a))return!1;var g="";if(c)switch(c.constructor){case Number:g=1/0===c?"; expires=Fri, 31 Dec 9999 23:59:59 GMT":"; max-age="+c;break;case String:g="; expires="+c;break;case Date:g="; expires="+c.toUTCString()}return document.cookie=encodeURIComponent(a)+"="+encodeURIComponent(b)+g+(e?"; domain="+e:"")+(d?"; path="+d:"")+(f?"; secure":""),!0},removeItem:function(a,b,c){return this.hasItem(a)?(document.cookie=encodeURIComponent(a)+"=; expires=Thu, 01 Jan 1970 00:00:00 GMT"+(c?"; domain="+c:"")+(b?"; path="+b:""),!0):!1},hasItem:function(a){return a?new RegExp("(?:^|;\\s*)"+encodeURIComponent(a).replace(/[\-\.\+\*]/g,"\\$&")+"\\s*\\=").test(document.cookie):!1},keys:function(){for(var a=document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g,"").split(/\s*(?:\=[^;]*)?;\s*/),b=a.length,c=0;b>c;c++)a[c]=decodeURIComponent(a[c]);return a}};!function(a,b){"use strict";function c(b,c){this.element=b,this.options=a.extend({},f,c),this._defaults=f,this._name=e,this.init()}var d=b.docCookies,e="cacheMenu",f={cookieInfo:{name:"skipMenuTransfer",durationInSec:3600,path:"/"},storageCacheName:"menuToCache",reloadOnError:!0,initAtStartup:!0},g=function(a,c,e){a.off("menu-initialization-todo");var f=a.html();b.localStorage.setItem(e,f),d.setItem(c.name,1,c.durationInSec,c.path),a.trigger("menu-initialization-done")},h=function(a,b){b&&a.trigger("menu-initialization-todo")},i=function(a,c){d.removeItem(a.name,a.path),c&&b.location.reload()};c.prototype={init:function(){var c,e,f=this.options,j=a(this.element),k=b.Modernizr;return k.cookies&&k.localstorage?(j.on("menu-initialization-todo",function(){var a=b.localStorage.getItem(f.storageCacheName);j.html(a),j.trigger("menu-initialization-done")}),c=d.getItem(f.cookieInfo.name),void(c?(e=b.localStorage.getItem(f.storageCacheName),e?h(j,f.initAtStartup):i(f.cookieInfo,f.reloadOnError)):g(j,f.cookieInfo,f.storageCacheName))):(j.trigger("menu-initialization-done"),!1)}},a.fn[e]=function(b){return this.each(function(){a.data(this,"plugin_"+e)||a.data(this,"plugin_"+e,new c(this,b))})}}(jQuery,window,document);