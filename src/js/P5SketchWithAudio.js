import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

import audio from "../audio/circles-no-3.ogg";
import midi from "../audio/circles-no-3.mid";

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
                    const noteSet1 = result.tracks[5].notes; // Synth 1
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

        p.hexSize = 30;
        
        p.mapSize = 16;

        p.padding = 0;

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.angleMode(p.RADIANS);
	        p.origin = p.createVector(p.width / 2, p.height / 2);
            // p.background(0);
            p.translate(p.width / 2, p.height / 2);
        }

        p.draw = () => {
            for (var q = -p.mapSize; q <= p.mapSize; q++) {
				var r1 = p.max(-p.mapSize, -q - p.mapSize);
				var r2 = p.min(p.mapSize, -q + p.mapSize);
				for (var r = r1; r <= r2; r++) {
					p.drawHexagon(p.hexToPixel(q, r), p.hexSize, q, r);
				}
		    }
            if(p.audioLoaded && p.song.isPlaying()){

            }
        }

        p.drawHexagon = (center, size, q, r) => {
            const points = [];
            for(var i = 0; i < 6; i++){
                points.push(p.hexCorner(center, size - p.padding, i));
                var c = p.hexCorner(center, size, i);
            }
            
            p.beginShape();
            for(i = 1; i <= 6; i++){
                p.fill(
                    p.map(-q -r, -p.mapSize, p.mapSize, 0, 255),
                    p.map(r, -p.mapSize, p.mapSize, 0, 255), 
                    p.map(q, -p.mapSize, p.mapSize, 0, 255)
                );
                p.point(points[i % 6].x, points[i % 6].y);
                p.vertex(points[i % 6].x, points[i % 6].y);
                p.line(points[i-1].x, points[i-1].y, points[i % 6].x, points[i % 6].y);
            }
            p.endShape();
            p.fill(255);
            
            p.textSize(10);
            p.textAlign(p.CENTER, p.CENTER);
            p.text(q + " " + r + " \n" + (-q-r), center.x + 1, center.y + 2)
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

        p.executeCueSet1 = (note) => {
            p.background(p.random(255), p.random(255), p.random(255));
            p.fill(p.random(255), p.random(255), p.random(255));
            p.noStroke();
            p.ellipse(p.width / 2, p.height / 2, p.width / 4, p.width / 4);
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