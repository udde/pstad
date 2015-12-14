
function loadShaders(gl){

    var crateShader = require('gl-shader');

    var shaders = {};

    shaders.test = crateShader(
        gl,
        require('../shaders/shader.vert')(),
        require('../shaders/shader.frag')()
    );

    shaders.ground = crateShader(
        gl,
        require('../shaders/ground.vert')(),
        require('../shaders/ground.frag')()
    );

    return shaders;
}
