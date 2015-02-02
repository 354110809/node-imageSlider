var Move = {
    /**
     * 水平方向的动画
     * @param {Object} obj
     * @param {String} align /left/center/right/window
     * @param {Float} step
     */
    animation2d: function(obj, align, step, cb) {
        align = align || "left";
        step = step || 0.02;

        var width = obj.width;
        var height = obj.height;

        var label = 0;
        var index = 0;

        var n = Math.ceil(1 / step);
        var c = width / n;
        var l = height / n;

        // 以下为transform的控制参数
        var hScall = 1; //1
        var hMove = 0; //0
        var hRotate = 0; //0
        var vScall = 1; //1
        var vMove = 0; //0
        var vRotate = 0; //0

        var frame = function() {
            label += step;
            index++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();

            switch(align) {
                case "top":
                    vScall = label;
                    break;
                case "left":
                    hScall = label;
                    break;
                case "bottom":
                    vScall = label;
                    ctx.translate(0, height - index * l);
                    break;
                case "right":
                    hScall = label;
                    ctx.translate(width - index * c, 0);
                    break;
                case "center_h":
                    hScall = label;
                    ctx.translate((width - index * c) / 2, 0);
                    break;
                case "center_v":
                    vScall = label;
                    ctx.translate(0, (height - index * l) / 2);
                    break;
                case "window":
                    hScall = label;
                    ctx.translate((width - index * c) / 2, (height - index * l) / 2);
                    vScall = label;
                    break;
                default:
                    hScall = label;
                    break;
            }
            ctx.transform(hScall, hRotate, vRotate, vScall, hMove, vMove);
            place_big_img(obj);
            ctx.restore();

            if (label <= 1) {
                window.requestAnimationFrame(frame);
            } else {
				cb();
			}
        }
        frame();
    },

    __animation: function(obj, index) {
        //step = step || 0.02;
        var step = 0.02;

        var width = obj.width;
        var height = obj.height;

        //var label = 0;
        //var index = 0;

        var n = Math.ceil(1 / step);
        var c = width / n;
        var l = height / n;

        // 以下为transform的控制参数
        var hScall = 1; //1
        var hMove = 0; //0
        var hRotate = 0; //0
        var vScall = 1; //1
        var vMove = 0; //0
        var vRotate = 0; //0

        //console.log('__index:', index);
        var label = index * step;
        //console.log(n, c, l, index, step);
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        //ctx.save();
        var dx,dy;

        switch(obj.align) {
            case "top":
                vScall = label;
                dx = obj.x;
                dy = obj.y;
                break;
            case "left":
                hScall = label;
                dx = obj.x;
                dy = obj.y;
                break;
            case "bottom":
                vScall = label;
                ctx.translate(0, height - index * l);
                dx = obj.x;
                //dy = obj.y + obj.height * (1 - vScall);
                dy = obj.y + height - index * l;
                break;
            case "right":
                hScall = label;
                ctx.translate(width - index * c, 0);
                //dx = obj.x + width * (1 - hScall);
                dx = obj.x + width - index * c;
                dy = obj.y;
                break;
            case "center_h":
                hScall = label;
                ctx.translate((width - index * c) / 2, 0);
                break;
            case "center_v":
                vScall = label;
                ctx.translate(0, (height - index * l) / 2);
                break;
            case "window":
                hScall = label;
                ctx.translate((width - index * c) / 2, (height - index * l) / 2);
                vScall = label;
                break;
            default:
                hScall = label;
                break;
        }
        //console.log('hScall:', hScall);
        //ctx.transform(hScall, hRotate, vRotate, vScall, hMove, vMove);
        //place_big_img(obj);
        ctx.putImageData(obj.data, dx, dy, 0, 0, obj.width * hScall, obj.height * vScall);
        //ctx.drawImage(canvas, obj.x, obj.y, obj.width, obj.height, obj.x, obj.y, obj.width, obj.height);
        //ctx.restore();
    },

    /**
     * 条状翻转
     * @param {Object} obj
     * @param {String} dir
     * @param {Number} lineX X轴方向分块
     * @param {Number} lineY Y轴方向分块
     */
    turnover: function(obj, dir, lineX, lineY, cb) {
        // default params
        dir = dir || 'horizon'; // vertical
        lineX = lineX || 1;
        lineY = lineY || 1;

        var width = obj.width;
        var height = obj.height;

        var gapX = width / lineX;
        var gapY = height / lineY;

        // store image data
        var split_datas = [];
        var data;
		
		Move.createHelper(obj);

        for (var j = 0; j < lineY; j++) {
            for (var i = 0; i < lineX; i++) {
                data = __helper.getImageData(i * gapX, j * gapY, gapX, gapY);
                split_datas.push({x: i * gapX, y: j * gapY, data: data, tx:0, ty: 0, width:gapX, height:gapY, align: Math.random() > 0.5 ? 'left' : 'top'});
            }
        }

        var index = 0;
        var frame = function() {
            index++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (var i = 0, len = split_datas.length; i < len; i++) {
                var tmp = split_datas[i];
                Move.__animation(tmp, index);
                ctx.restore();
            }
            //console.log(index);
            if (index <= 50) {
                window.requestAnimationFrame(frame);
            } else {
				cb();
			}
        }
        frame();
    },
	
	createHelper: function(obj) {
		__helper.clearRect(0, 0, canvas2.width, canvas2.height);
		__helper.drawImage(obj.node, 0, 0, obj.width, obj.height);
	},

    createGradient: function(obj, alpha) {
        var width = obj.width;
        var height = obj.height;
        var r = Math.floor(Math.sqrt(Math.pow(width/2, 2), Math.pow(height/2, 2)));

        ctx.save();
        ctx.globalCompositeOperation = 'source-atop';
        var gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, r);

        gradient.addColorStop(0, 'rgba(97,97,97,0)');
        gradient.addColorStop(1, 'rgba(97,97,97,.6)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }
};
