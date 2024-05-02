import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass'

export function postprocessing(scene, camera, renderer) {

    //set up
    const composer = new EffectComposer(renderer)
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    composer.setSize(window.innerWidth, window.innerHeight)

    const renderPass = new RenderPass(scene, camera)
    composer.addPass(renderPass)

    // const bokehPass = new BokehPass(scene, camera, {
    //     focus: 100,
    //     aperature: 5,
    //     maxblur: 0.01
    // })
    // composer.addPass(bokehPass)

    const bloomPass = new UnrealBloomPass()
    bloomPass.strength = 0.2
    composer.addPass(bloomPass)

    const outputPass = new OutputPass()
    composer.addPass(outputPass)

    return {composer: composer}
}