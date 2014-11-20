'use strict';

module.exports = function (grunt) {

	var isAlreadyCacheForThisExample = function (cookie, url) {
		// TODO complete this conf
		var confs = {
			'demo1.html' : 'demo1-skipMenuTransfer',
			'demo2.html' : 'demo2-skipMenuTransfer',
			'demo3-hash1.html' : 'demo3-skipMenuTransfer',
			'demo3-hash2.html' : 'demo3-skipMenuTransfer'
		};
		var conf;
		var result = false;
		for (conf in confs) {
			result = result || (cookie.indexOf(confs[conf]) !== -1 && url.indexOf(conf) !== -1);
		}
		return result;
	};

	var cookieManagementMiddleware = function (req, res, next) {
		var accept = req.headers.accept;
		if (accept && accept.indexOf('text/html') !== -1) {
			res.setHeader('Vary', 'Cookie');
			var cookie = req.headers.cookie;
			if (cookie && cookie.indexOf('skipMenuTransfer') !== -1 && isAlreadyCacheForThisExample(cookie, req.url)) {
				var insertionIndex = req.url.indexOf('.html');
				if (insertionIndex !== -1) {
					console.log('Skip menu transfer');
					req.url = req.url.substring(0, insertionIndex) + '-withcookie.html';
					console.log('--', req.url);
				}
			}
		}
		next();
	};

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Configurable paths for the application
	var appConfig = {
		app : require('./bower.json').appPath || 'app',
		dist : 'dist',
		tmp : '.tmp',
		src : 'src'
	};

	var banner = '/*! <%= pkg.name %> - v<%= pkg.version %> */\n';

	// Define the configuration for all the tasks
	grunt.initConfig({

		// Project settings
		pkg : require('./bower.json'),
		yeoman : appConfig,

		// Watches files for changes and runs tasks based on the changed files
		watch : {
			js : {
				files : [ '<%= yeoman.src %>/*.js' ],
				tasks : [ 'jshint:all' ],
				options : {
					livereload : '<%= connect.options.livereload %>'
				}
			},
			html : {
				files : [ '<%= yeoman.app %>/*.html' ],
				tasks : [ 'targethtml:dev' ],
				options : {
					livereload : '<%= connect.options.livereload %>'
				}
			}
		},

		// The actual grunt server settings
		connect : {
			options : {
				port : 9000,
				// Change this to '0.0.0.0' to access the server from outside.
				hostname : '0.0.0.0',
				livereload : 35729
			},
			livereload : {
				options : {
					middleware : function (connect) {
						return [ cookieManagementMiddleware, connect.static(appConfig.tmp), connect().use('/bower_components', connect.static('./bower_components')),
								connect().use('/src', connect.static(appConfig.src)), connect().use('/dist', connect.static(appConfig.dist)), connect.static(appConfig.app) ];
					}
				}
			}
		},

		// Make sure code styles are up to par and there are no obvious mistakes
		jshint : {
			options : {
				jshintrc : '.jshintrc',
				reporter : require('jshint-stylish')
			},
			all : {
				src : [ 'Gruntfile.js', '<%= yeoman.src %/*.js' ]
			}
		},

		// Empties folders to start fresh
		clean : {
			dist : {
				files : [ {
					dot : true,
					src : [ '<%= yeoman.dist %>/{,*/}*' ]
				} ]
			},
			dev : '<%= yeoman.tmp %>'
		},

		concat : {
			dist : {
				dest : '<%= yeoman.dist %>/jquery-cache-menu.js',
				src : [ '<%= yeoman.src %>/docCookies.js', '<%= yeoman.src %>/jquery-cache-menu.js' ]
			}
		},

		bump : {
			options : {
				files : [ 'package.json', 'bower.json' ],
				commitFiles : [ 'package.json', 'bower.json' ],
				pushTo : 'origin'
			}
		},

		removelogging : {
			dist : {
				src : '<%= yeoman.dist %>/jquery-cache-menu.js',
				dest : '<%= yeoman.tmp %>/jquery-cache-menu-without-console.js'
			}
		},

		uglify : {
			dist : {
				dest : '<%= yeoman.dist %>/jquery-cache-menu-min.js',
				src : '<%= yeoman.tmp %>/jquery-cache-menu-without-console.js'
			}
		},

		targethtml : {
			dev : {
				files : [ {
					expand : true,
					dot : true,
					cwd : '<%= yeoman.app %>',
					dest : '<%= yeoman.tmp %>',
					src : [ '*.html' ],
					ext : '-withcookie.html'
				} ]
			}
		},

		usebanner : {
			dist : {
				options : {
					position : 'top',
					banner : banner,
					linebreak : false
				},
				expand : true,
				cwd : 'dist',
				src : '*.js',
				dest : 'dist'
			}
		}
	});

	grunt.registerTask('serve', 'Compile then start a connect web server', function () {
		grunt.task.run([ 'clean:dev', 'targethtml', 'connect:livereload', 'watch' ]);
	});

	grunt.registerTask('default', [ 'clean:dist', 'jshint', 'concat:dist', 'removelogging:dist', 'uglify:dist', 'usebanner' ]);
};
