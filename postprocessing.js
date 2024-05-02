import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'

//doesn't work :(
//import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
//import {DepthLimitedBlurShader} from 'three/examples/jsm/shaders/DepthLimitedBlurShader.js'


export function postprocessing(scene, camera, renderer) {
    
    //set up
    const composer = new EffectComposer(renderer)
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    composer.setSize(window.innerWidth, window.innerHeight)

    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    //doF attempt
    // const dofPass = new ShaderPass(DepthLimitedBlurShader)
    // composer.addPass(dofPass)

    const bloomPass = new UnrealBloomPass()
    bloomPass.strength = 0.2
    composer.addPass(bloomPass)

    const outputPass = new OutputPass()
    composer.addPass(outputPass)

    return {composer: composer}
}