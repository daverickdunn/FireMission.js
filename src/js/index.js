
const FireMissionJS = (config) => {

    let parent = document.getElementById('canvas-parent');
    let bg_canvas = document.getElementById('bg');
    let bg_context = bg_canvas.getContext('2d');
    let canvas = document.getElementById('fg');
    let context = canvas.getContext('2d');

    let redDot = {
        x : parent.clientWidth/2,
        y : 50,
        c : '#FF0D00'
    }

    let greenDot = {
        x : parent.clientWidth/2,
        y : 50,
        c : '#95FF20'
    }

    let currentImage = config.images[0];

    let fireMissions = []

    let drawBackground = (width, height) => {
        let bg_img = new Image();
        bg_img.src = currentImage.src;
        bg_img.onload = () => {
            bg_context.drawImage(bg_img, 0, 0, width, height);
        }
    }

    let scalePoint = (point) => {
        return Object.assign(
            {},
            point,
            {
                x : point.x * (currentImage.scale.x/canvas.width),
                y : point.y * (currentImage.scale.y/canvas.height)
            }
        )
    }

    let clear = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    let addShadow = (colour, blur) => {
        context.shadowColor = colour;
        context.shadowBlur = blur;
    }

    let getMousePos = (canvas, evt) => {
        let rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    let lineMidpoint = (p1, p2) => {
        let x = p1.x + (p2.x - p1.x) * 0.50;
        let y = p1.y + (p2.y - p1.y) * 0.50;
        return { x: x, y: y }
    }

    let lineDistance = (p1, p2) => Math.hypot(p2.x-p1.x, p2.y-p1.y);

    let lineSlope = (p1, p2) => (p2.y-p1.y) / (p2.x-p1.x);

    let lineDegrees = (p1, p2) => {
        let deg = (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI) - 90;
        let sgn = Math.sign(deg)
        if (sgn == 1) return deg
        if (sgn == -1) return 360 + deg
        return 0
    }


    let drawDot = (dot) => {
        context.save();
        addShadow('black', 10);
        context.fillStyle = dot.c;
        context.beginPath();
        context.arc(dot.x, dot.y, 5, 0, 2*Math.PI);
        context.fill();
        context.restore();
    }

    let drawLine = (redDot, greenDot) => {
        context.save();
        addShadow('black', 10);
        let gradient = context.createLinearGradient(0, 0, 200, 0);
        gradient.addColorStop(0, redDot.c);
        gradient.addColorStop(1, greenDot.c);
        context.beginPath();
        context.moveTo(greenDot.x,greenDot.y);
        context.lineTo(redDot.x,redDot.y);
        context.stroke();
        context.restore();
    }

    let textAngle = (degrees) => {
        if (degrees <= 180) return (degrees - 90) * Math.PI / 180
        return (degrees + 90) * Math.PI / 180
    }


    let drawText = (point, angle, offset, message) => {
        context.save();
        context.fillStyle = '#FFFFFF';
        context.translate(point.x, point.y);
        context.rotate(angle);
        context.font = '12px Georgia';
        context.textAlign = 'center';
        addShadow('black', 12);
        context.fillText(message, offset.x, offset.y);
        context.restore();
    }

    let drawCurrentMission = () => {
        drawDot(redDot)
        drawDot(greenDot)
        drawLine(redDot, greenDot)
    }

    let drawFireMissions = () => {
        for (var i=0; i<fireMissions.length; i++){
            drawDot(fireMissions[i].redDot)
        }
    }

    let showStats = (p1, p2) => {
        let distance = lineDistance(scalePoint(p1), scalePoint(p2));
        let slope = lineSlope(scalePoint(p1), scalePoint(p2))
        let degrees = lineDegrees(scalePoint(p1), scalePoint(p2))
        let mid = lineMidpoint(p1, p2)
        let angle = textAngle(degrees)
        drawText(mid, angle, {x: 0, y: -8}, distance.toFixed(1) + ' m')
        drawText(mid, angle, {x: 0, y: 12}, degrees.toFixed(1) + ' °')
    }

    let draw = () => {
        clear()
        drawCurrentMission()
        drawFireMissions()
        showStats(redDot, greenDot)
    }

    let resizeCanvas = () => {
        parent.style.height = parent.clientWidth
        bg_canvas.width = parent.clientWidth
        bg_canvas.height = parent.clientWidth
        canvas.width = parent.clientWidth
        canvas.height = parent.clientWidth
        drawBackground(bg_canvas.width, bg_canvas.height);
    }

    let addSelectOptions = () => {
        $.each(config.images, function (i, item) {
            $('#fmMapSelect').append($('<option>', {
                value: i,
                text : item.title
            }));
        });
    }

    let addFireMission = () => {
        fireMissions.push({
            redDot: Object.assign({}, {
                x : redDot.x,
                y : redDot.y,
                c : redDot.c + '80'
            }),
            greenDot: Object.assign({}, {
                x : greenDot.x,
                y : greenDot.y,
                c : greenDot.c + '80'
            }),
            distance : lineDistance(scalePoint(redDot), scalePoint(greenDot)).toFixed(1),
            degrees : lineDegrees(scalePoint(redDot), scalePoint(greenDot)).toFixed(1)
        })
        drawTable();
    }

    let removeFireMission = (index) => {
        fireMissions.splice(index, 1);
        drawTable();
        draw();
    }

    document.fmRemoveFireMission = removeFireMission;

    let clearTable = () => {
        $("#fmMissionTable > tbody").empty();
        // $('#fmMissionTable *').off('click');
    }

    let drawTable = () => {
        clearTable();
        $.each(fireMissions, (i, item) => {
            $('#fmMissionTable').find('tbody:last')
            .append(
                `<tr id="tableRow${i}">
                    <th scope="row">${i+1}</th>
                    <td>${item.distance} m</td>
                    <td>${item.degrees} °</td>
                    <td class="text-center">
                        <button type="button" class="btn btn-danger remove-button" onclick="fmRemoveFireMission(${i})">
                            <span>&times;</span>
                        </button>
                    </td>
                </tr>`
            );
        });
    }

    let addListeners = () => {
        window.addEventListener('resize', resizeCanvas)

        canvas.addEventListener(
            'click',
            function(e){
                let pos = getMousePos(canvas, e);
                Object.assign(redDot, pos);
                draw()
            },
            false
        );

        canvas.addEventListener(
            'contextmenu',
            function(e){
                e.preventDefault();
                let pos = getMousePos(canvas, e);
                Object.assign(greenDot, pos);
                draw();
            },
            false
        );

        document.addEventListener('keydown', (event) => {
            if (event.key == "a" || event.key == "Enter"){
                addFireMission()
            } else if (event.key == "c" || event.key == "Delete"){
                fireMissions = [];
                clearTable();
                draw();
            } else if (event.key == "r" || event.key == "Backspace"){
                removeFireMission(fireMissions.length - 1)
            }
        });

        $('#fmMapSelect').change(function(e) {
            currentImage = config.images[this.value]
            resizeCanvas();
            draw();
        });

        $('#fmAddMission').click(function() {
            addFireMission();
        });

        $('#fmClearTable').click(function() {
            fireMissions = [];
            clearTable();
        });

    }

    let setup = () => {
        addSelectOptions()
        addListeners()
    }

    setup();
    resizeCanvas();
    draw();

};
