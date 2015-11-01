var canvas   = document.body.appendChild(document.createElement('canvas'))
var clear    = require('gl-clear')({ color: [0, 0, 0, 1] })
var gl       = require('gl-context')(canvas, animate)
var glBuffer = require('gl-buffer')
var mat4     = require('gl-mat4')
var glslify  = require('glslify')
var GLMatrix      = require('gl-matrix')
var createBuffer  = require('gl-buffer')
var createVAO     = require('gl-vao')

var shader = glslify({
    frag: './shader.frag',
    vert: './shader.vert'
})(gl)

var createShader = glslify({
    vertex: "\
    attribute vec2 position;\
    attribute vec3 color;\
    varying vec3 fragColor;\
    void main() {\
        gl_Position = vec4(position, 0, 1.0);\
        fragColor = color;\
    }",
    fragment: "\
    precision highp float;\
    varying vec3 fragColor;\
    void main() {\
        gl_FragColor = vec4(fragColor, 1.0);\
    }",
    inline: true
})


var plane = createMesh(0,0);

var vao, shader


//Create shader object
shader = createShader(gl)
shader.attributes.position.location = 0
shader.attributes.color.location = 1

//Create vertex array object
vao = createVAO(gl, [
    { "buffer": createBuffer(gl,
        [-1, 0, 0,
        -1, 1, 0,
        1, 1, 0,
        1, 1, 0,
        1, -1, 0,
        -1, 0, 0,
        -1, 0 , 0,
        1, -1, 0,
        -1, -1, 0]),
    "type": gl.FLOAT,
    "size": 3
},
{ "buffer": createBuffer(gl, [0, 0, 0, 0.6, 0.2, 0.4, 1, 1, 1, 0, 0, 0, 0.6, 0.2, 0.4, 1, 1, 1,0, 0, 0, 0.6, 0.2, 0.4, 1, 1, 1]),
"type": gl.FLOAT,
"size": 3
}
])



var triangleMatrix   = mat4.create()
var squareMatrix     = mat4.create()
var projectionMatrix = mat4.create()

var triangle = glBuffer(gl, new Float32Array([
    +0.0, +1.0, +0.0,
    -1.0, -1.0, +0.0,
    +1.0, -1.0, +0.0
]))

var square = glBuffer(gl, new Float32Array([
    +1.0, +1.0, +0.0,
    -1.0, +1.0, +0.0,
    +1.0, -1.0, +0.0,
    -1.0, -1.0, +0.0
]))

triangle.length = 3
square.length = 4

// vao = plane.vao;
// debugger;
//debugger;


function render() {
    var width = gl.drawingBufferWidth
    var height = gl.drawingBufferHeight

    //Bind the shader
    shader.bind()

    //Bind vertex array object and draw it
    vao.bind()
    vao.draw(gl.TRIANGLES, 9)

    //Unbind vertex array when fini
    vao.unbind()
    // // Clear the screen and set the viewport before
    // // drawing anything
    // clear(gl)
    // gl.viewport(0, 0, width, height)
    //
    // // Calculate projection matrix
    // mat4.perspective(projectionMatrix, Math.PI / 4, width / height, 0.1, 100)
    // // Calculate triangle's modelView matrix
    // mat4.identity(triangleMatrix, triangleMatrix)
    // mat4.translate(triangleMatrix, triangleMatrix, [-1.5, 0, -7])
    // // Calculate squares's modelView matrix
    // mat4.copy(squareMatrix, triangleMatrix)
    // mat4.translate(squareMatrix, squareMatrix, [3, 0, 0])
    //
    // // Bind the shader
    // shader.bind()
    // shader.uniforms.uProjection = projectionMatrix
    //
    // // Enable attribute pointer
    // shader.attributes.aPosition.pointer()
    //
    // // Draw the triangle
    // triangle.bind()
    // shader.uniforms.uModelView = triangleMatrix
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, triangle.length)
    //
    // // Draw the square
    // square.bind()
    // shader.uniforms.uModelView = squareMatrix
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}
function animate(){
    render();
}

// Resize the canvas to fit the screen
window.addEventListener('resize'
, require('canvas-fit')(canvas)
, false
)
function test(){

    return 10;
}

function createMesh(xoffset, yoffset) {
    var count = 64 * 64
    var size = count * 12
    var aPositionData = new Float32Array(size)
    var aVertex1Data  = new Float32Array(size)
    var aVertex2Data  = new Float32Array(size)
    var aVertex3Data  = new Float32Array(size)
    xoffset = xoffset || 0
    yoffset = yoffset || 0
    var xscale = 2
    var yscale = 2

    var i = 0
    for (var X = 0; X < 64; X++)
    for (var Y = 0; Y < 64; Y++, i += 12) {
        var x = X * xscale + xoffset * xscale
        var y = Y * yscale + yoffset * yscale

        // Triangle 1
        aPositionData[i   ] = x+xscale
        aPositionData[i+1 ] = y
        aPositionData[i+2 ] = x
        aPositionData[i+3 ] = y
        aPositionData[i+4 ] = x
        aPositionData[i+5 ] = y+yscale

        // Triangle 2
        aPositionData[i+6 ] = x
        aPositionData[i+7 ] = y+yscale

        aPositionData[i+8 ] = x+xscale
        aPositionData[i+9 ] = y+yscale

        aPositionData[i+10] = x+xscale
        aPositionData[i+11] = y

        aVertex1Data[i   ] = x+xscale
        aVertex1Data[i+1 ] = y
        aVertex1Data[i+2 ] = x+xscale
        aVertex1Data[i+3 ] = y
        aVertex1Data[i+4 ] = x+xscale
        aVertex1Data[i+5 ] = y
        aVertex1Data[i+6 ] = x
        aVertex1Data[i+7 ] = y+yscale
        aVertex1Data[i+8 ] = x
        aVertex1Data[i+9 ] = y+yscale
        aVertex1Data[i+10] = x
        aVertex1Data[i+11] = y+yscale

        aVertex2Data[i   ] = x
        aVertex2Data[i+1 ] = y
        aVertex2Data[i+2 ] = x
        aVertex2Data[i+3 ] = y
        aVertex2Data[i+4 ] = x
        aVertex2Data[i+5 ] = y
        aVertex2Data[i+6 ] = x+xscale
        aVertex2Data[i+7 ] = y+yscale
        aVertex2Data[i+8 ] = x+xscale
        aVertex2Data[i+9 ] = y+yscale
        aVertex2Data[i+10] = x+xscale
        aVertex2Data[i+11] = y+yscale

        aVertex3Data[i   ] = x
        aVertex3Data[i+1 ] = y+yscale
        aVertex3Data[i+2 ] = x
        aVertex3Data[i+3 ] = y+yscale
        aVertex3Data[i+4 ] = x
        aVertex3Data[i+5 ] = y+yscale
        aVertex3Data[i+6 ] = x+xscale
        aVertex3Data[i+7 ] = y
        aVertex3Data[i+8 ] = x+xscale
        aVertex3Data[i+9 ] = y
        aVertex3Data[i+10] = x+xscale
        aVertex3Data[i+11] = y
    }

    function createAttribute(data) {
        return {
            buffer: createBuffer(gl, data)
            , type: gl.FLOAT
            , size: 2

        }
    }

    var attributes
    var vao = createVAO(gl, attributes = [
        createAttribute(aPositionData)
        , createAttribute(aVertex1Data)
        , createAttribute(aVertex2Data)
        , createAttribute(aVertex3Data)
    ])

    return { vao: vao, length: size / 2 }
}
