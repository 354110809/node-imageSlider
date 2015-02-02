//;(function() {
    var win = window;
    var doc = document;
    var body = doc.body;
    var canvas = doc.getElementById('canvas');
	var canvas2 = doc.getElementById('__helper');
    var ctx = canvas.getContext('2d');
	var __helper = canvas2.getContext('2d');
    var images_list = {};
    var tmp_list = {};

    // the status of image loaded
    var NO_START = 0;
    var IN_LOADING = 1;
    var LOADED_SUCCESS = 2;
    var LOADED_ERROR = 3;
    var LOADED_ABORT = 4;

    // is all images downloaded
    var all_image_loaded = false;
    // start global animation
    var is_in_animation = false;

    // the first frame to start
    var first_frame;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
	canvas2.width = canvas2.offsetWidth;
	canvas2.height = canvas2.offsetHeight;

    window.onresize = function() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //load_img('http://raptor.so/img/a.jpg');
    }

    function load_img(url) {
        var img = new Image();
        img.onload = function() {
            var rW = img.width / canvas.offsetWidth;
            var rH = img.height / canvas.offsetHeight;
            var r = Math.max(rW, rH);
            var tW,tH;

            // cache
            images_list[url] = {width: img.width, height: img.height};

            if (r < 1) {
                tW = img.width;
                tH = img.height;
            } else {
                if (r === rH) {
                    tH = canvas.offsetHeight;
                    tW = tH * img.width / img.height;
                } else {
                    tW = canvas.offsetWidth;
                    tH = tW * img.height / img.width;
                }
            }

            var pos = get_center_pos(canvas.width, canvas.height, tW, tH);
            ctx.drawImage(img, 0, 0, tW, tH);
        }
        img.src = url;
    }

    function place_big_img(obj) {
        //var pos = get_center_pos(canvas.width, canvas.height, tW, tH);
        if (typeof obj.x === 'undefined')
            ctx.drawImage(obj.node, 0, 0, obj.width, obj.height);
        else
            //ctx.putImageData(obj.data, obj.tx, obj.ty);
            ctx.putImageData(obj.data, obj.x, obj.y);
    }

    /**
     * targetW <= containerW
     * targetH <= containerH
     */
    function get_center_pos(containerW, containerH, targetW, targetH) {
        return {
            x: (containerW - targetW) / 2,
            y: (containerH - targetH) / 2
        }
    }

    //load_img('http://raptor.so/img/a.jpg');
    function load_images(arr) {
        // set max connection nums to 6
        var len = arr.length;
        var base_img_url = "/img/";
        var MAX_CONNECTIONS = len > 6 ? 6 : len;
        var i;

        // set cache
        for (i = 0; i < len; i++) {
            tmp_list[base_img_url + arr[i]] = NO_START;
        }

        // load images
        console.time('load_time');
        window.__start_load_time = (+new Date());
        for (i = 0; i < MAX_CONNECTIONS; i++) {
            __load(base_img_url + arr[i]);
        }
    }

    function __load(url) {
        var img = new Image();
        img.onload = function() {
            tmp_list[url] = LOADED_SUCCESS;

            // set cache
            images_list[url] = {node: img, width: img.width, height: img.height};

            // start next
            var next = __get_no_start_image();
            next && __load(next);

            // start animation when all images loaded
            if (__check_all_loaded() && !is_in_animation) {
                all_image_loaded = true;
                is_in_animation = true;
                start();
                console.timeEnd('load_time');
                window.__end_load_time = (+new Date());
            }
        }
        img.src = url;
        tmp_list[url] = IN_LOADING;
    }

    function __check_all_loaded() {
        for (var o in tmp_list) {
            if (tmp_list[o] !== LOADED_SUCCESS)
                return false;
        }

        return true;
    }

    function __get_no_start_image() {
        if (all_image_loaded) return false;
        for (var o in tmp_list) {
            if (tmp_list[o] === NO_START)
                return o;
        }
        //all_image_loaded = true;
        return false;
    }

    function start() {
        var order = [];
        var idx = 0;
        var o;
        for (o in images_list) {
            var obj = images_list[o];
            var rW = obj.width / canvas.width;
            var rH = obj.height / canvas.height;
            var r = Math.max(rW, rH);
            var tW, tH;

            //ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (r < 1) {
                tW = obj.width;
                tH = obj.height;
            } else {
                if (r === rH) {
                    tH = canvas.height;
                    tW = tH * obj.width / obj.height;
                } else {
                    tW = canvas.width;
                    tH = tW * obj.height / obj.width;
                }
            }

            images_list[o].width = tW;
            images_list[o].height = tH;
            order.push(o);
        }

        setTimeout(function() {
            //place_big_img(images_list[order[idx]]);
            idx++;

            if (idx > order.length - 1)
                idx = 0;

            /*
            var step = 0.02;
            var label = 0;
            var frame = function() {
                label += step;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.save();
                ctx.transform(label, 0, 0, 1, 0, 0);
                place_big_img(images_list[order[idx]]);
                ctx.restore();
                console.log(label);

                if (label <= 1) {
                    window.requestAnimationFrame(frame);
                    //setTimeout(frame, 20);
                }
            }
            frame();
            */
			var obj = images_list[order[idx]];
			var fn = arguments.callee;
			
			var _animation = ['animation2d', 'turnover'];
			var _a = Math.random() > .5 ? _animation[0] : _animation[1];
			var args = [];
			var _pos = ['top', 'bottom', 'left', 'right', 'center_v', 'center_h', 'window'];
			
			if (_a == 'animation2d') {
				args = [obj, _pos[Math.floor(Math.random() * 7)], 0.02, function() {
					setTimeout(fn, 2000);
				}];
			} else {
				args = [obj, '', Math.ceil(Math.random() * 8), Math.ceil(Math.random() * 8), function() {
					setTimeout(fn, 2000);
				}];
			}
			
			//console.log(_a, args);
			Move[_a].apply(null, args);
			/*
            Move.animation2d(obj, 'center_v', 0.02, function() {
				setTimeout(function() {
					Move.turnover(obj, '', 4, 4, fn);
				}, 2000)
			});
			*/
        }, 0);
    }

    function __jsonp(url) {
        var script = doc.createElement('script');
        var head = doc.getElementsByTagName('head')[0];
        script.type = "text/javascript";
        script.onload = function() {
            head.removeChild(script);
            script = null;
        }
        script.src = url;
        head.appendChild(script);
    }

    function __log(params) {
        var base_log_url = '/log?';
        var query_str = [];
        for (var o in params) {
            query_str.push(o + '=' + params[o]);
        }
        query_str = query_str.join('&');

        var img = new Image();
        img.src = base_log_url + query_str;
    }

    // bind event
    canvas.oncontextmenu = function() {
        return false;
    }

    // get the images list
    __jsonp('/get_list');
    //window.load_images = load_images;
    //window.images_list = images_list;
    // for test
//})();
