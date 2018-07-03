//
// Full config example:
//
//     scratch({
//         // Wrapper to apend canvas to
//         wrapper: document.getElementById(''),
//         // Image to be scratched
//         imageUrl: '',
//         // You can use brush texture instead of plain circle
//         useBrush: true,
//         // Use when useBrush is set to false or not set at all
//         lineWidth: 60
//         // Banner will autoscratch itself right away
//         autoScratch: true,
//         // Banner will autoscratch itself after delay in miliseconds
//         autoScratch: {
//             delay: 5000
//         },
//         // Canvas will fadeOut after <value>% scratched
//         percentLimit: 40
//     });
//
// Minimal config example:
//
//     scratch({
//         wrapper: document.getElementById(''),
//         imageUrl: '',
//         useBrush: true
//     });
//

(function(Scratch) {
    if (typeof define === 'function' && define.amd) {
        define(function() {
            return Scratch;
        });
    } else if (typeof exports !== 'undefined') {
        exports.scratch = Scratch;
    } else {
        window.scratch = Scratch;
    }
})(function() {

    function getLocalCoords(elem, ev) {
        var ox = 0;
        var oy = 0;
        var first;
        var pageX
        var pageY;

        while (elem != null) {
            ox += elem.offsetLeft;
            oy += elem.offsetTop;
            elem = elem.offsetParent;
        }

        if (ev.hasOwnProperty('changedTouches')) {
            first = ev.changedTouches[0];
            pageX = first.pageX;
            pageY = first.pageY;
        } else {
            pageX = ev.pageX;
            pageY = ev.pageY;
        }

        return {
            x: pageX - ox,
            y: pageY - oy
        };
    }

    function Scratch(config) {
        if (!(this instanceof Scratch)) {
            return new Scratch(config);
        }

        this.wrapper        = config.wrapper;
        this.imageUrl       = config.imageUrl;
        this.lineWidth      = config.lineWidth;
        this.onImagesLoaded = config.onImagesLoaded;
        this.onScratch      = config.onScratch;
        this.onComplete     = config.onComplete;
        this.mode           = config.mode || Scratch.MODE_WITHOUT_MOUSEDOWN;
        this.useBrush       = config.useBrush;
        this.autoScratch    = config.autoScratch || config.autoScratch.length;
        this.autoScratchDelay = config.autoScratch.delay || 0;
        this.percentLimit   = config.percentLimit || 80;

        this.loadImage();
    }

    Scratch.MODE_WITH_MOUSEDOWN    = 1;
    Scratch.MODE_WITHOUT_MOUSEDOWN = 2;

    Scratch.prototype = {};

    Scratch.prototype.loadImage = function() {
        function imageLoaded(e) {
            this.init();
        }

        this.image = document.createElement('img');
        this.image.setAttribute('crossOrigin', '');
        this.image.addEventListener('load', imageLoaded.bind(this), false);
        this.image.src = this.imageUrl;
    };

    Scratch.prototype.init = function() {
        var c = this.maincanvas = document.createElement('canvas');
        c.width = this.image.width;
        c.height = this.image.height;

        if (this.useBrush) {
            this.brush = new Image();
            this.brush.src = ' data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIwAAABVCAYAAACb8QzZAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQyIDc5LjE2MDkyNCwgMjAxNy8wNy8xMy0wMTowNjozOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6RDk3QkQ2NEY3RUEwMTFFODkxMDBBRjJGNUVGRDQ3MUUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6RDk3QkQ2NEU3RUEwMTFFODkxMDBBRjJGNUVGRDQ3MUUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkRCMENEQTcxN0REQTExRTg4Q0E4RTkxRUZEMTIyRkIyIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkRCMENEQTcyN0REQTExRTg4Q0E4RTkxRUZEMTIyRkIyIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+qajWzAAAITtJREFUeNrsXWdzHFd2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';
        }

        this.wrapper.appendChild(c);

        this.drawcanvas = document.createElement('canvas');
        this.drawcanvas.width = c.width;
        this.drawcanvas.height = c.height;

        this.render();

        function mousedown_handler(e) {
            if (this.completed || (this.mode === Scratch.MODE_WITHOUT_MOUSEDOWN)) {
                return true;
            }
            this.mouseDown = true;

            var local = getLocalCoords(c, e);

            this.scratchPoint(local.x, local.y, true);

            this.render();

            if (e.cancelable) {
                e.preventDefault();
            }
            return false;
        };

        function mousemove_handler(e) {
            if (
                this.completed ||
                ((this.mode === Scratch.MODE_WITH_MOUSEDOWN) && !this.mouseDown)
            ) {
                return true;
            }

            var local = getLocalCoords(c, e);

            this.scratchPoint(local.x, local.y, false);

            this.render();

            if (e.cancelable) {
                e.preventDefault();
            }
            return false;
        };

        function mouseup_handler(e) {
            if (
                this.completed ||
                ((this.mode === Scratch.MODE_WITH_MOUSEDOWN) && this.mouseDown)
            ) {
                this.mouseDown = false;
                if (e.cancelable) {
                    e.preventDefault();
                }
                return false;
            }

            return true;
        };

        c.addEventListener('mousedown', mousedown_handler.bind(this), false);
        c.addEventListener('touchstart', mousedown_handler.bind(this), false);

        c.addEventListener('mousemove', mousemove_handler.bind(this), false);
        c.addEventListener('touchmove', mousemove_handler.bind(this), false);

        window.addEventListener('mouseup', mouseup_handler.bind(this), false);
        window.addEventListener('touchend', mouseup_handler.bind(this), false);

        if (this.autoScratch) {
            var _this = this;
            var delay = this.autoScratchDelay;

            setTimeout(function() {
                window.requestAnimationFrame(_this.step.bind(_this));
            }, delay);
        }

        if(this.onInit) {
            this.onInit();
        }
    };

    Scratch.prototype.step = function(timestemp) {
        if (!this.autoScratch) return;
        if (this.getPercent() > 10 && !this.start) return;

        if (!this.start) this.start = timestemp;

        var progress = (timestemp - this.start) / 30;
        var y = progress;
        var x = (this.image.width/2) + Math.sin(250 * progress) * (this.image.width/2) ;

        if (this.image.width >= 1000) {
            x = (this.image.width/2) + Math.sin(970 * progress) * (this.image.width/2) ;
        }

        this.scratchPoint(x, y, false);
        this.render();

        if (progress < this.image.height) {
            window.requestAnimationFrame(this.step.bind(this));
        } else {
            this.fadeOut();
        }
    }

    Scratch.prototype.render = function() {
        var ctx = this.maincanvas.getContext('2d');
        ctx.clearRect(0, 0, this.maincanvas.width, this.maincanvas.height);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(this.image, 0, 0);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.drawImage(this.drawcanvas, 0, 0);
    };

    Scratch.prototype.scratchPoint = function(x, y, fresh) {
        var ctx = this.drawcanvas.getContext('2d');

        if (this.useBrush) {
            if (fresh) {
                ctx.beginPath();
            }

            x = x - this.brush.width/2;
            y = y - this.brush.height/2;

            ctx.drawImage(this.brush, x, y);
        } else {
            ctx.lineWidth = this.lineWidth;
            ctx.lineCap = ctx.lineJoin = 'round';
            ctx.strokeStyle = '#000';
            if (fresh) {
                ctx.beginPath();
                // this +0.01 hackishly causes Linux Chrome to draw a
                // "zero"-length line (a single point), otherwise it doesn't
                // draw when the mouse is clicked but not moved:
                ctx.moveTo(x+0.01, y);
            }
            ctx.lineTo(x, y);
            ctx.stroke();
        }

        var percent = this.getPercent();

        if(this.onScratch) {
            this.onScratch({
                x: x,
                y: y,
                percent: percent
            });
        }

        console.log(percent);

        if(percent >= this.percentLimit && !this.start) {
            this.completed = true;

            this.fadeOut();

            if(this.onComplete) {
                this.onComplete();
            }
        }
    };

    Scratch.prototype.fadeOut = function() {
        var fadeTarget = this.wrapper;
        var fadeEffect = setInterval(function () {
            if (!fadeTarget.style.opacity) {
                fadeTarget.style.opacity = 1;
            }
            if (fadeTarget.style.opacity > 0) {
                fadeTarget.style.opacity -= 0.1;
            } else {
                clearInterval(fadeEffect);
            }
        }, 100);
    };

    Scratch.prototype.getPercent = function() {
        var hits = 0;
        var imageData;
        var totalPixels = this.maincanvas.width * this.maincanvas.height;

        imageData = this.maincanvas.getContext('2d').getImageData(
            0,
            0,
            this.maincanvas.width,
            this.maincanvas.height
        );

        for (var i = 0, ii = imageData.data.length; i < ii; i = i + 4) {
            if (
                imageData.data[i]   === 0 &&
                imageData.data[i+1] === 0 &&
                imageData.data[i+2] === 0 &&
                imageData.data[i+3] === 0
            ) {
                hits++;
            }
        }

        return (hits / totalPixels) * 100;
    };

    return Scratch;

}());
