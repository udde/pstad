
function loadShaders(gl){

    var crateShader = require('gl-shader');

    var shaders = {};

    // shaders.test = crateShader(
    //     gl,
    //     require('./shader.vert')(),
    //     require('./shader.frag')()
    // );

    shaders.ground = crateShader(
        gl,
        require('../shaders/ground.vert')(),
        require('../shaders/ground.frag')()
    );
    return shaders;
}

var createGL    = require('gl-now'),
createShader    = require('gl-shader'),
createBuffer    = require("gl-buffer"),
createVAO       = require("gl-vao"),
clearGL         = require('gl-clear'),
mat4            = require('gl-mat4'),
vec3            = require('gl-vec3');
// createCamera    = require('orbit-camera');

var shell = createGL({

});

var clear = clearGL({
    color: [0.8, 0.9, 0.9, 1],
});

var meshes, ground, groundShader, cam, eye, target, up, camUp, camRight, camToTarget;
var nBlocks, nLevels, blocks, levels = [0,0,0,0];

shell.on('gl-init', function() {
    var gl = shell.gl;
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    //camshit
    cam = mat4.create()
    eye = vec3.create()
    vec3.set(eye, 0, 10, 10);
    target = vec3.create()
    vec3.set(target, 0, 0, 0);
    up = vec3.create()
    vec3.set(up, 0, 1, 0);
    // camToTarget = vec3.create();
    // vec3.subtract(camToTarget, target, eye);
    // camRight = vec3.create();
    // vec3.cross(camRight, camToTarget, up );
    // camUp = vec3.create();
    // vec3.cross(camUp, camRight, camToTarget);

    mat4.lookAt(cam, eye, target, up)
    console.log(cam);
    // shader = createShader(gl,vs(),fs());
    // shaders = require('./shaders/shaders.js')(gl);
    shaders = loadShaders(gl);
    groundShader = shaders.ground;

    ground = require('../js/terrainDataGenerator.js')(gl);
    nLevels = ground.nLevels;
    nBlocks = ground.nBlocks;
    ground.skriv();

    groundShader.attributes.aPosition.location = 0;
    groundShader.attributes.aColor.location = 1;
    groundShader.attributes.aNormal.location = 2;
    groundShader.attributes.aTriangleHeight.location = 3;

});

shell.on('gl-render', function(t) {
    var gl = shell.gl;
    clear(gl);

    //draw the ground
    groundShader.bind();
    groundShader.uniforms.t += 0.01;
    groundShader.uniforms.uCameraPos = eye;


    mat4.lookAt(cam, eye, target, up)

    var scratch = mat4.create()
    groundShader.uniforms.projection = mat4.perspective(scratch, Math.PI/4.0, shell.width/shell.height, 0.1, 1000.0)
    groundShader.uniforms.view = cam
    var model = mat4.create(), unityM = mat4.create();

    for (var j = 0; j < nBlocks; j++) {
        var i = j + 4*levels[j];

        // i = level * 4 + 2*y + x
        mat4.translate(model, unityM, vec3.fromValues(ground.blocks[i].offset[0],ground.blocks[i].offset[1],ground.blocks[i].offset[2]) );
        groundShader.uniforms.model = model;
        ground.blocks[i].vao.bind();
        ground.blocks[i].vao.draw(gl.TRIANGLES, ground.blocks[i].nVertices);
        ground.blocks[i].vao.unbind();
    }

});

shell.on("tick", function() {
    if(shell.wasDown("W")) {
        vec3.add(eye, vec3.fromValues(0.0,0.0,-1.0), eye);
        vec3.add(target, vec3.fromValues(0.0,0.0,-1.0), target);
        // mat4.lookAt(cam, eye, target, up)
        // mat4.translate(cam, cam , vec3.fromValues(0.0,0.0,1.0));
    }
    if(shell.wasDown("S")) {
        vec3.add(eye, vec3.fromValues(0.0,0.0,1.0), eye);
        vec3.add(target, vec3.fromValues(0.0,0.0,1.0), target);
        // mat4.translate(cam, cam , vec3.fromValues(0.0,0.0,-1.0));
    }
    if(shell.wasDown("A")) {
        vec3.add(eye, vec3.fromValues(-1.0,0.0,0.0), eye);
        vec3.add(target, vec3.fromValues(-1.0,0.0,0.0), target);
        // mat4.translate(cam, cam , vec3.fromValues(1.0,0.0,0.0));
    }
    if(shell.wasDown("D")) {
        vec3.add(eye, vec3.fromValues(1.0,0.0,0.0), eye);
        vec3.add(target, vec3.fromValues(1.0,0.0,0.0), target);
        // mat4.translate(cam, cam , vec3.fromValues(-1.0,0.0,0.0));
    }
    if(shell.wasDown("Z")) {
        vec3.add(eye, vec3.fromValues(0.0,-1.0,0.0), eye);
        vec3.add(target, vec3.fromValues(0.0,-1.0,0.0), target);
        // mat4.translate(cam, cam , vec3.fromValues(0.0,1.0,0.0));
    }
    if(shell.wasDown("X")) {
        vec3.add(eye, vec3.fromValues(0.0,1.0,0.0), eye);
        vec3.add(target, vec3.fromValues(0.0,1.0,0.0), target);
        // mat4.translate(cam, cam , vec3.fromValues(0.0,-1.0,0.0));
    }
    if(shell.wasDown("I")) {
        // levels[2] ^= 1;
        // mat4.rotate(cam, cam, 0.1, vec3.fromValues(1.0, 0.0, 0.0));
        // vec3.add(eye, vec3.fromValues(0.0,-1.0,0.0), eye);
        // vec3.rotateY(target, target, up, 0.1);
    }
    if(shell.wasDown("K")) {
        // levels[2] ^= 1;
        // mat4.rotate(cam, cam, -0.1, vec3.fromValues(1.0, 0.0, 0.0));
        // vec3.add(eye, vec3.fromValues(0.0,-1.0,0.0), eye);
        // vec3.rotateY(target, target, up, 0.3);
    }
    if(shell.wasDown("J")) {
        // levels[2] ^= 1;
        // mat4.rotate(cam, cam, -0.1, vec3.fromValues(0.0, 1.0, 0.0));
    }
    if(shell.wasDown("L")) {
        // levels[2] ^= 1;
        // mat4.rotate(cam, cam, 0.1, vec3.fromValues(0.0, 1.0, 0.0));
    }
    if(shell.wasDown("mouse-right")) {
        // cam.pan([10*(shell.mouseX-shell.prevMouseX)/shell.width,
        // 10*(shell.mouseY - shell.prevMouseY)/shell.height])
    }
    if(shell.scroll[1]) {
        // cam.zoom(shell.scroll[1] * 0.1)
    }
});
