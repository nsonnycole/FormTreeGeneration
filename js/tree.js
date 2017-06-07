(function() {

    var requestAnimationFrame = (function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
        function(callback, element) {
            window.setTimeout(callback, 1000 / 16);
        };
    })();

    var branches = [];
    var growth_rate = 2;
    var maximum_bend = 90 / 180 * Math.PI;
    var smallest_branch = 30;
    var hue = 0;
    var fps;
    var canvas;
    var ctx;

    var avgTime = 0;
    var frameCounter = 0;
    var trackFrames = 60;

    function each(array, fn) {
        var idx = 0,
            len = array.length;

        for (; idx < len; idx++) {
            fn(array[idx]);
        }
    }

    $(function() {
        canvas = $('canvas.tree')[0];
        ctx = canvas.getContext('2d');

        $('#grow-tree').click(plant_tree);

        var swatch = $('#swatch');
        fps = $('#fps');


            swatch.css({
                'background-color': '#3b3f45'
            });


        ctx.lineCap = 'square';

        plant_tree();

        loop();
    });

    function hsl(lightness) {
        return 'hsl(' + hue + ',70%,' + lightness + '%)';
    }

    function loop(onFrame) {

        var startDate = new Date();

        update();
        draw(ctx);

        var endDate = new Date();
        var duration = (endDate - startDate);
        avgTime += duration;

        frameCounter++;
        if (frameCounter >= trackFrames) {
            avgTime = avgTime / trackFrames;
            var avgFps = Math.floor(1000 / avgTime);
            if (avgFps > 60) avgFps = 60;

            fps.text(avgFps);
            avgTime = 0;
            frameCounter = 0;
        }

        requestAnimationFrame(loop);
    }

    function plant_tree() {
        var magnitude = 100,
            l = 50,
            thickness = 8,
            theta = 0,
            origin = {
                x: canvas.width / 2,
                y: canvas.height - 40
            };

        branches = [create_branch(origin, magnitude, thickness, theta, l)];
    }

    function update() {
        each(branches, grow_branch);
    }

    function draw(ctx) {
        ctx.fillStyle = '#3b3f45';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        each(branches, function(branch) {
            var w = branch.thickness;
            var oX1 = branch.origin.x - w;
            var oX2 = branch.origin.x + w;
            var oY = branch.origin.y;
            var tX1 = branch.tip.x - w * 0.8;
            var tX2 = branch.tip.x + w * 0.8;
            var tY = branch.tip.y;
            var cpX1 = (oX1 + oX1 + tX1) / 3;
            var cpY1 = (oY + tY + tY) / 3;
            var cpX2 = (oX2 + oX2 + tX2) / 3;
            var cpY2 = (oY + tY + tY) / 3;
            ctx.beginPath();
            ctx.moveTo(oX1, oY);
            ctx.quadraticCurveTo(cpX1, cpY1, tX1, tY);
            ctx.lineTo(tX2, tY);
            ctx.quadraticCurveTo(cpX2, cpY2, oX2, oY);
            ctx.lineWidth = 1;
            ctx.fillStyle = hsl(branch.lightness);
            ctx.fill();
        });
    }

    function grow_branch(branch) {
        if (branch.done) return;

        var x = (branch.tip.x - branch.origin.x);
        var y = (branch.tip.y - branch.origin.y);
        var h = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

        if (h >= branch.magnitude) {
            branch.done = true;

            if (branch.magnitude < smallest_branch) return;
            shoot(branch);

            return;
        }

        branch.tip.x = branch.tip.x + (Math.sin(branch.theta) * growth_rate);
        branch.tip.y = branch.tip.y - (Math.cos(branch.theta) * growth_rate);
    }

    function shoot(branch) {
        if (branch.sprouts <= 0) return;
        branch.sprouts -= 1;
        shoot(branch);

        var theta2 = branch.theta + (Math.random() * maximum_bend - maximum_bend / 2);
        var magnitude2 = branch.magnitude * (Math.random() * 0.2 + 0.7);
        var lightness2 = branch.lightness * 0.9;

        branches.push(create_branch({
            x: branch.tip.x,
            y: branch.tip.y
        }, magnitude2, branch.thickness * 0.6, theta2, lightness2));
    }

    function create_branch(origin, magnitude, thickness, theta, lightness) {
        return {
            origin: origin,
            thickness: thickness,
            theta: theta,
            magnitude: magnitude,
            tip: {
                x: origin.x,
                y: origin.y
            },
            lightness: lightness,
            sprouts: ((Math.random() * 4) + 1) >>> 0
        };
    }

}());
