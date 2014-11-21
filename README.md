# jquery-cache-menu

> This plugins aims to reduce html data transfered between client and server on recurring page calls (while browsing a site).

This is a common issue with e-commerce websites that used to have the whole catalog into their menus ...
The idea is to lighten webpage serve by the application by removing all the menu data that is hidden from user by default (only displayed to user after hovering on a menu for example).


## Theory

### Advantages

* less data transfered : faster page downloading
* no useless DOM initialization if menu is not needed : faster page rendering
* images stored into the menu are not retrieved : faster page loading (and no need for lazy loading mecanism for the images)

### Some thing to be aware of

* you'll need a policy for menu update : right now it is depending of the cookie lifecycle which is set to last 3600 seconds (1h) by default
* you may need a way to validate the client version and the server one to be sure that both menu data are identical

### Constraint

#### Technical

* you'll need localStorage (http://caniuse.com/#feat=namevalue-storage), withou it, plugin won't do anything
* to detect localStorage, you'll need Modernizr (but for a modern website, it is quite a thing to have anyway ...)

#### Functional

* Menu has to be the same on every page you want to use this plugin
* So that menu can be the result of the browing context or user information

### How it works

#### Backend flow

* request with no cookie for a webpage
   * Magento serves a webpage with the menu

* request with the cookie for a webpage
   * Magento serves a webpage without the menu

#### Frontend flow

* a page with a menu is retrieved and the client does not have the cookie set
   * menu is stored into localStorage
   * the cookie is set

* a page without a menu is retrieved and the client have the cookie set
   * nothing to do as long as menu initialization is not triggered (this event can be triggered at startup (default behavior) or manually to deffer it)

* as soon as the initialization event is triggered
   * retrieve menu data from localStorage and set it in the DOM


## Technical solution in jQuery

We want a plugin that :

* does not need much init code to work
* allows manual initialization triggering
* allows a way to set specific behavior on the menu 

Of course, all of this, without modifying the plugin itself =)


## Example flow

Check the console to see the log flow.

First access to the page with jquery-cache-menu :

```
[jquery-cache-menu] init
[jquery-cache-menu] no cookie : get menu from webpage
[jquery-cache-menu] no cookie : store menu into localstorage
[jquery-cache-menu] no cookie : set cookie
[jquery-cache-menu] no cookie : trigger menu-initialization-done on container
Menu is ready, go for its initialization
```

Second access :

```
[jquery-cache-menu] init
[jquery-cache-menu] cookie with storage : inject menu into webpage
[jquery-cache-menu] cookie with storage : trigger menu-initialization-done on container
Menu is ready, go for its initialization
```

What has changed ?

* the newly retrieved HTML stream is way lighter (6Ko versus original 329Ko).
* a new cookie is defined : skipMenuTransfer (its value is not relevant)


## How to set up ?

### Plugin definitions

You'll need to declare some JS libraries :

```html
<!-- Needed for feature detection -->
<script src="bower_components/modernizr/modernizr.js"></script>
<!-- This is a jquery plugin, so it needs jquery ... -->
<script src="bower_components/jquery/dist/jquery.js"></script>
<!-- Here is the plugin code -->
<script src="src/docCookies.js"></script>
<script src="src/jquery-cache-menu.js"></script>
```

For your information, docCookies.js and jquery-cache-menu.js are minified into a single file : jquery-cache-menu-min.js.
Modernizr is only needed to detect localStorage, be sure to size it the right way for your own needs.

### Plugin configuration

```js
<script>
	(function($){
		$(document).ready(function(){
			$('#nav')
				.on('menu-initialization-done', function () {
					// this code will be executed on
					// this is where you need to put your menu logic
					console.log('Menu is ready, go for its initialization');
				})
				// trigger the magic
				.cacheMenu()
			;
		});
	}(jQuery));
</script>
```

HTML menu data is stored into localStorage (default key : 'menuToCache').
A new cookie is created for a 1h lifespan and for the path '/'.

### Options

```js
$elem.cacheMenu({
	cookieInfo : { // cookie information that will transfer between back and frontend
		name : 'skipMenuTransfer',
		durationInSec : 60*60*24*365, // 1 year in second
		path : '/' // perimeter
	},
	storage : {
		cacheName : 'menuToCache', // the menu will be saved in this localstorage key
		hashName : 'menuHash' // the menu hash will be saved in this localstorage key
	},
	reloadOnError : true, // if anything go badly, the plugin purge its cache, you can have the page reload then
	initAtStartup : true, // set to false if you want to manage init manually
	namespace : '' // prefix for cookie name and storage keys
});
```

If initAtStartup is set to false, you'll need to manually trigger menu initialization :

```js
$('#nav').trigger('menu-initialization-todo');
```

### Deffered initialization

It can be interesting to deffer menu loading as user may not always need it (navigation into search facets, into the product galery, ...). 
The plugin proposes a way to manually trigger the menu initialization.

You first need to disable initialization at startup :

```js
.cacheMenu({
	initAtStartup: false
})
```

Then, you'll need to trigger the 'menu-initialization-todo' event.

```js
(function($){
	$(document).ready(function(){
		$('#nav')
			.on('menu-initialization-done', function () {
				console.log('Menu is ready, go for its initialization');
			})
			.one('mouseenter', function(){
				$(this).trigger('menu-initialization-todo');
			})
			.cacheMenu({
				initAtStartup: false
			})
		;
	});
}(jQuery));
```

Once initialization is done, the plugin will trigger the 'menu-initialization-done' event.

### Deffered initialization

By setting the 'data-menu-hash' on the element's root, you add a version information.

```html
<div class="myNavigation" data-menu-hash="azerty">
	Menu to cache
</div>
```

If another page is load with a different version (different hash value), then the cookie will be discarded and the next will process as there is no cache.
In that case, it will refresh the cache.


## How to build the source

### Test development

```
grunt serve
```

### Build project

```
grunt
```

### Release a new version

```
grunt bump
```
