import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

import audio from "../audio/hexagons-no-3.ogg";
import midi from "../audio/hexagons-no-3.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[3].notes; // Thor 2 - Awakenings
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.origin = null;

        p.hexSize = 20;
        
        p.mapSize = 16;

        p.padding = 0;

        p.hexagons = [];

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.angleMode(p.RADIANS);
            p.noLoop();
	        p.origin = p.createVector(p.width / 2, p.height / 2);
            p.background(0);
        }

        p.draw = () => {
            
            if(p.audioLoaded && p.song.isPlaying()){
                
            }
        }

        p.executeCueSet1 = (note) => {
            const { duration, currentCue } = note,
                delay = (duration * 1000) / (p.hexagons.length);
            p.hexagons = currentCue % 4 === 1 ? [] : p.hexagons;
            p.mapSize = p.random([6, 8, 10, 12, 14, 16]);
            p.hexSize = p.random([8, 16, 32]);
            p.populateHexagonsArray();
            p.background(p.random(255), p.random(255), p.random(255));
            for (let i = 0; i < p.hexagons.length; i++) {
                const { center, size, q, r } = p.hexagons[i];

                setTimeout(
                    function () {
                        // p.mapSize = p.random(6, 24);
                        p.stroke(255,255,255);
                        p.drawHexagon(center, size, q, r, 191);
                        p.drawHexagon(center, size / 2, q, r, 191);
                        // p.stroke(0, 0, 0);
                        // p.drawHexagon(center, size / 2, q, r, 0, p.color(255,255,255, 0));
                        // p.drawHexagon(center, size / 4, q, r, 255);
                    },
                    (delay * i) * 0.8
                );
                
            }
        }

        p.populateHexagonsArray = () => {
            for (var q = -p.mapSize; q <= p.mapSize; q++) {
				var r1 = p.max(-p.mapSize, -q - p.mapSize);
				var r2 = p.min(p.mapSize, -q + p.mapSize);
				for (var r = r1; r <= r2; r++) {
                    const center = p.hexToPixel(q, r);
					p.hexagons.push(
                        {
                            center: center,
                            size: p.hexSize,
                            q: q,
                            r: r,
                            sort: Math.abs(q * r * (-q-r))
                        }
                    );
				}
		    }

            p.hexagons.sort(
                (a, b) => { 
                    return a.sort - b.sort;
                } 
            );
        }

        p.drawHexagon = (center, size, q, r, opacity, fill = false) => {
            const points = [];
            for(var i = 0; i < 6; i++){
                points.push(p.hexCorner(center, size - p.padding, i));
                var c = p.hexCorner(center, size, i);
            }
            
            p.beginShape();
            for(i = 1; i <= 6; i++){
                if(fill) {
                    p.fill(fill);
                }
                else {
                    p.fill(
                        p.map(-q -r, -p.mapSize, p.mapSize, 0, 255),
                        p.map(r, -p.mapSize, p.mapSize, 0, 255), 
                        p.map(q, -p.mapSize, p.mapSize, 0, 255),
                        opacity
                    );
                }
                p.point(points[i % 6].x, points[i % 6].y);
                p.vertex(points[i % 6].x, points[i % 6].y);
                p.line(points[i-1].x, points[i-1].y, points[i % 6].x, points[i % 6].y);
            }
            p.endShape();
        }

        p.hexCorner = (center, size, i) => {
            var angleDeg = 60 * i   + 30
            var angleRad = p.PI/180 * angleDeg;
            return p.createVector(
                center.x + size * p.cos(angleRad),
                center.y + size * p.sin(angleRad)
            );
        }

        p.hexToPixel = (q, r) => {
            // This is basically a matrix multiplication between a hexagon orientation matrix 
            // and the vector {q; r}
            var x = (p.sqrt(3) * q + p.sqrt(3)/2 * r) * (p.hexSize) ;
            var y = (0 * q + 3/2 * r) * p.hexSize;
            return p.createVector(x + p.origin.x, y + p.origin.y);
        }

        p.hasStarted = false;

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                        if (typeof window.dataLayer !== typeof undefined){
                            window.dataLayer.push(
                                { 
                                    'event': 'play-animation',
                                    'animation': {
                                        'title': document.title,
                                        'location': window.location.href,
                                        'action': 'replaying'
                                    }
                                }
                            );
                        }
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                    if (typeof window.dataLayer !== typeof undefined && !p.hasStarted){
                        window.dataLayer.push(
                            { 
                                'event': 'play-animation',
                                'animation': {
                                    'title': document.title,
                                    'location': window.location.href,
                                    'action': 'start playing'
                                }
                            }
                        );
                        p.hasStarted = false
                    }
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
