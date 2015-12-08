var crateShader = require('gl-shader');

module.exports = init;

function init(gl) {

    var shaders = {};

    shaders.test = crateShader(
        gl,
        require('./shader.vert')(),
        require('./shader.frag')()
    );

    shaders.ground = crateShader(
        gl,
        require('./ground.vert')(),
        require('./ground.frag')()
    );

    return shaders;
}
