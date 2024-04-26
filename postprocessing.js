import {GlitchPass} from 'three/examples/jsm/postprocessing/GlitchPass'
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import { AfterimagePass, RenderPixelatedPass } from 'three/examples/jsm/Addons.js'

export function postprocessing(scene, camera, renderer) {
    const composer = new EffectComposer(renderer)
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    composer.setSize(window.innerWidth, window.innerHeight)
    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    // const pixelPass = new RenderPixelatedPass(6, scene, camera)
    // pixelPass.normalEdgeStrngth = 10
    // composer.addPass(pixelPass)

    // const bloomPass = new UnrealBloomPass()
    // bloomPass.strength = 0.3
    // composer.addPass(bloomPass)

    const outputPass = new OutputPass()
    composer.addPass(outputPass)

    // const afterPass = new AfterimagePass()
    // afterPass.uniforms.damp.value = 0.8
    // composer.addPass(afterPass)

    return {composer: composer}
}