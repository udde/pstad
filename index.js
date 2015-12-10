var createGL    = require('gl-now'),
createShader    = require('gl-shader'),
createBuffer    = require("gl-buffer"),
createVAO       = require("gl-vao"),
clearGL         = require('gl-clear'),
mat4            = require('gl-mat4'),
vec3            = require('gl-vec3'),
createCamera    = require('orbit-camera');

var shell = createGL({

});

var clear = clearGL({
    color: [0.8, 0.9, 0.9, 1],
});

var meshes, ground, groundShader, cam, eye, target, up, camUp, camRight, camToTarget;
var nBlocks, nLevels, blocks;

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
    camToTarget = vec3.create();
    vec3.subtract(camToTarget, target, eye);
    camRight = vec3.create();
    vec3.cross(camRight, camToTarget, up );
    camUp = vec3.create();
    vec3.cross(camUp, camRight, camToTarget);

    // shader = createShader(gl,vs(),fs());
    shaders = require('./shaders')(gl);
    groundShader = shaders.ground;

    ground = require('./meshes')(gl);
    nLevels = ground.nLevels;
    nBlocks = ground.nBlocks;

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


    mat4.lookAt(cam, eye, target, camUp)

    var scratch = mat4.create()
    groundShader.uniforms.projection = mat4.perspective(scratch, Math.PI/4.0, shell.width/shell.height, 0.1, 1000.0)
    groundShader.uniforms.view = cam

    var model = mat4.create(), unityM = mat4.create();
    levels = [0,0,1,0]
    for (var j = 0; j < nBlocks; j++) {
        var i = j + 4*levels[j];

        // i = level * 4 + 2*y + x
        mat4.translate(model, unityM, vec3.fromValues(ground.blocks[i].offset[0],ground.blocks[i].offset[1],ground.blocks[i].offset[2]) );
        groundShader.uniforms.model = model;
        ground.blocks[i].vao.bind();
        ground.blocks[i].vao.draw(gl.TRIANGLES, ground.blocks[i].nvertices);
        ground.blocks[i].vao.unbind();
    }

});

shell.on("tick", function() {
    if(shell.wasDown("W")) {
        vec3.add(eye, vec3.fromValues(0.0,0.0,-1.0), eye);
        vec3.add(target, vec3.fromValues(0.0,0.0,-1.0), target);
    }
    if(shell.wasDown("S")) {
        vec3.add(eye, vec3.fromValues(0.0,0.0,1.0), eye);
        vec3.add(target, vec3.fromValues(0.0,0.0,1.0), target);
    }
    if(shell.wasDown("A")) {
        vec3.add(eye, vec3.fromValues(-1.0,0.0,0.0), eye);
        vec3.add(target, vec3.fromValues(-1.0,0.0,0.0), target);
    }
    if(shell.wasDown("D")) {
        vec3.add(eye, vec3.fromValues(1.0,0.0,0.0), eye);
        vec3.add(target, vec3.fromValues(1.0,0.0,0.0), target);
    }
    if(shell.wasDown("Z")) {
        vec3.add(eye, vec3.fromValues(0.0,-1.0,0.0), eye);
        vec3.add(target, vec3.fromValues(0.0,-1.0,0.0), target);
    }
    if(shell.wasDown("X")) {
        vec3.add(eye, vec3.fromValues(0.0,1.0,0.0), eye);
        vec3.add(target, vec3.fromValues(0.0,1.0,0.0), target);
    }
    if(shell.wasDown("J")) {
        // vec3.add(eye, vec3.fromValues(0.0,-1.0,0.0), eye);
        // vec3.rotateY(target, target, camUp, 0.3);
    }
    if(shell.wasDown("mouse-right")) {
        // cam.pan([10*(shell.mouseX-shell.prevMouseX)/shell.width,
        // 10*(shell.mouseY - shell.prevMouseY)/shell.height])
    }
    if(shell.scroll[1]) {
        // cam.zoom(shell.scroll[1] * 0.1)
    }
});

// function getShader(gl, id) {
//       var shaderScript = document.getElementById(id);
//       if (!shaderScript) {
//           return null;
//       }
//
//       var str = "";
//       var k = shaderScript.firstChild;
//       while (k) {
//           if (k.nodeType == 3)
//               str += k.textContent;
//           k = k.nextSibling;
//       }
//
//       var shader;
//       if (shaderScript.type == "x-shader/x-fragment") {
//           shader = gl.createShader(gl.FRAGMENT_SHADER);
//       } else if (shaderScript.type == "x-shader/x-vertex") {
//           shader = gl.createShader(gl.VERTEX_SHADER);
//       } else {
//           return null;
//       }
//
//       gl.shaderSource(shader, str);
//       gl.compileShader(shader);
//
//       if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
//           alert(gl.getShaderInfoLog(shader));
//           return null;
//       }
//
//       return shader;
//   }


// var canvas   = document.body.appendChild(document.createElement('canvas'))
// var clear    = require('gl-clear')({ color: [0, 0, 0, 1] })
// var gl       = require('gl-context')(canvas, animate)
// var glBuffer = require('gl-buffer')
// var mat4     = require('gl-mat4')
// var glslify  = require('glslify')
// // var GLMatrix      = require('gl-matrix')
// var createBuffer  = require('gl-buffer')
// var createVAO     = require('gl-vao')
//
// var shader = glslify({
//     frag: './shader.frag',
//     vert: './shader.vert'
// })(gl)
//
// var createShader = glslify({
//     vertex: "\
//     attribute vec2 position;\
//     attribute vec3 color;\
//     varying vec3 fragColor;\
//     void main() {\
//         gl_Position = vec4(position, 0, 1.0);\
//         fragColor = color;\
//     }",
//     fragment: "\
//     precision highp float;\
//     varying vec3 fragColor;\
//     void main() {\
//         gl_FragColor = vec4(fragColor, 1.0);\
//     }",
//     inline: true
// })
//
//
// var plane = createMesh(0,0);
//
// var vao, shader
//
// shaders = require('./shaders')(gl);
// shader = shaders.test;
//
//
//
// //Create shader object
// // shader = createShader(gl)
// shader.attributes.position.location = 0
// shader.attributes.color.location = 1
//
// //Create vertex array object
// vao = createVAO(gl, [
//     { "buffer": createBuffer(gl,
//         [-1, 0, 0,
//             -1, 1, 0,
//             1, 1, 0,
//             1, 1, 0,
//             1, -1, 0,
//             -1, 0, 0,
//             -1, 0 , 0,
//             1, -1, 0,
//             -1, -1, 0]),
//             "type": gl.FLOAT,
//             "size": 3
//         },
//         { "buffer": createBuffer(gl, [0, 0, 0, 0.6, 0.2, 0.4, 1, 1, 1, 0, 0, 0, 0.6, 0.2, 0.4, 1, 1, 1,0, 0, 0, 0.6, 0.2, 0.4, 1, 1, 1]),
//         "type": gl.FLOAT,
//         "size": 3
//     }
// ])
//
//
//
// var triangleMatrix   = mat4.create()
// var squareMatrix     = mat4.create()
// var projectionMatrix = mat4.create()
//
// var triangle = glBuffer(gl, new Float32Array([
//     +0.0, +1.0, +0.0,
//     -1.0, -1.0, +0.0,
//     +1.0, -1.0, +0.0
// ]))
//
// var square = glBuffer(gl, new Float32Array([
//     +1.0, +1.0, +0.0,
//     -1.0, +1.0, +0.0,
//     +1.0, -1.0, +0.0,
//     -1.0, -1.0, +0.0
// ]))
//
// triangle.length = 3
// square.length = 4
//
// // vao = plane.vao;
// // debugger;
// //debugger;
//
//
// function render() {
//     var width = gl.drawingBufferWidth
//     var height = gl.drawingBufferHeight
//
//     //Bind the shader
//     shader.bind()
//
//     //Bind vertex array object and draw it
//     vao.bind()
//     vao.draw(gl.TRIANGLES, 9)
//
//     //Unbind vertex array when fini
//     vao.unbind()
//     // // Clear the screen and set the viewport before
//     // // drawing anything
//     // clear(gl)
//     // gl.viewport(0, 0, width, height)
//     //
//     // // Calculate projection matrix
//     // mat4.perspective(projectionMatrix, Math.PI / 4, width / height, 0.1, 100)
//     // // Calculate triangle's modelView matrix
//     // mat4.identity(triangleMatrix, triangleMatrix)
//     // mat4.translate(triangleMatrix, triangleMatrix, [-1.5, 0, -7])
//     // // Calculate squares's modelView matrix
//     // mat4.copy(squareMatrix, triangleMatrix)
//     // mat4.translate(squareMatrix, squareMatrix, [3, 0, 0])
//     //
//     // // Bind the shader
//     // shader.bind()
//     // shader.uniforms.uProjection = projectionMatrix
//     //
//     // // Enable attribute pointer
//     // shader.attributes.aPosition.pointer()
//     //
//     // // Draw the triangle
//     // triangle.bind()
//     // shader.uniforms.uModelView = triangleMatrix
//     // gl.drawArrays(gl.TRIANGLE_STRIP, 0, triangle.length)
//     //
//     // // Draw the square
//     // square.bind()
//     // shader.uniforms.uModelView = squareMatrix
//     // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
// }
// function animate(){
//     render();
// }
//
// // Resize the canvas to fit the screen
// window.addEventListener('resize'
// , require('canvas-fit')(canvas)
// , false
// )
// function test(){
//
//     return 10;
// }
//
// function createMesh(xoffset, yoffset) {
//     var count = 64 * 64
//     var size = count * 12
//     var aPositionData = new Float32Array(size)
//     var aVertex1Data  = new Float32Array(size)
//     var aVertex2Data  = new Float32Array(size)
//     var aVertex3Data  = new Float32Array(size)
//     xoffset = xoffset || 0
//     yoffset = yoffset || 0
//     var xscale = 2
//     var yscale = 2
//
//     var i = 0
//     for (var X = 0; X < 64; X++)
//     for (var Y = 0; Y < 64; Y++, i += 12) {
//         var x = X * xscale + xoffset * xscale
//         var y = Y * yscale + yoffset * yscale
//
//         // Triangle 1
//         aPositionData[i   ] = x+xscale
//         aPositionData[i+1 ] = y
//         aPositionData[i+2 ] = x
//         aPositionData[i+3 ] = y
//         aPositionData[i+4 ] = x
//         aPositionData[i+5 ] = y+yscale
//
//         // Triangle 2
//         aPositionData[i+6 ] = x
//         aPositionData[i+7 ] = y+yscale
//
//         aPositionData[i+8 ] = x+xscale
//         aPositionData[i+9 ] = y+yscale
//
//         aPositionData[i+10] = x+xscale
//         aPositionData[i+11] = y
//
//         aVertex1Data[i   ] = x+xscale
//         aVertex1Data[i+1 ] = y
//         aVertex1Data[i+2 ] = x+xscale
//         aVertex1Data[i+3 ] = y
//         aVertex1Data[i+4 ] = x+xscale
//         aVertex1Data[i+5 ] = y
//         aVertex1Data[i+6 ] = x
//         aVertex1Data[i+7 ] = y+yscale
//         aVertex1Data[i+8 ] = x
//         aVertex1Data[i+9 ] = y+yscale
//         aVertex1Data[i+10] = x
//         aVertex1Data[i+11] = y+yscale
//
//         aVertex2Data[i   ] = x
//         aVertex2Data[i+1 ] = y
//         aVertex2Data[i+2 ] = x
//         aVertex2Data[i+3 ] = y
//         aVertex2Data[i+4 ] = x
//         aVertex2Data[i+5 ] = y
//         aVertex2Data[i+6 ] = x+xscale
//         aVertex2Data[i+7 ] = y+yscale
//         aVertex2Data[i+8 ] = x+xscale
//         aVertex2Data[i+9 ] = y+yscale
//         aVertex2Data[i+10] = x+xscale
//         aVertex2Data[i+11] = y+yscale
//
//         aVertex3Data[i   ] = x
//         aVertex3Data[i+1 ] = y+yscale
//         aVertex3Data[i+2 ] = x
//         aVertex3Data[i+3 ] = y+yscale
//         aVertex3Data[i+4 ] = x
//         aVertex3Data[i+5 ] = y+yscale
//         aVertex3Data[i+6 ] = x+xscale
//         aVertex3Data[i+7 ] = y
//         aVertex3Data[i+8 ] = x+xscale
//         aVertex3Data[i+9 ] = y
//         aVertex3Data[i+10] = x+xscale
//         aVertex3Data[i+11] = y
//     }
//
//     function createAttribute(data) {
//         return {
//             buffer: createBuffer(gl, data)
//             , type: gl.FLOAT
//             , size: 2
//
//         }
//     }
//
//     var attributes
//     var vao = createVAO(gl, attributes = [
//         createAttribute(aPositionData)
//         , createAttribute(aVertex1Data)
//         , createAttribute(aVertex2Data)
//         , createAttribute(aVertex3Data)
//     ])
//
//     return { vao: vao, length: size / 2 }
// }
