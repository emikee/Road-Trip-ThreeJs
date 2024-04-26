import { cameraPosition } from 'three/examples/jsm/nodes/Nodes.js'
import './style.css'
import * as THREE from 'three'

const scene = new THREE.Scene() 
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
const clock = new THREE.Clock()
const settings = { fps: 30, scale: 1.0, parallaxVal: 1 };

const renderer = new THREE.WebGLRenderer({ 
    antialias: true ,
    canvas: document.querySelector("#window")
})

camera.position.setZ(50)
const ambl = new THREE.AmbientLight(0xFFFFFF);
scene.add(ambl)

async function init() {
    renderer.setPixelRatio(window.devicePixelRatio )
    renderer.setSize(window.innerWidth, window.innerHeight)

    const material = new THREE.ShaderMaterial({
        uniforms: {
          u_tex0: { type: "t" },
          u_time: { value: 0, type: "f" },
          u_intensity: { value: 0.4, type: "f" },
          u_speed: { value: 0.25, type: "f" },
          u_brightness: { value: 0.8, type: "f" },
          u_normal: { value: 0.5, type: "f" },
          u_zoom: { value: 2.61, type: "f" },
          u_blur_intensity: { value: 0.5, type: "f" },
          u_blur_iterations: { value: 16, type: "i" },
          u_panning: { value: false, type: "b" },
          u_post_processing: { value: true, type: "b" },
          u_lightning: { value: false, type: "b" },
          u_texture_fill: { value: true, type: "b" },
          u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight), type: "v2" },
          u_tex0_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight), type: "v2" },
        },
        vertexShader: `
              varying vec2 vUv;        
              void main() {
                  vUv = uv;
                  gl_Position = vec4( position, 1.0 );    
              }
            `,
    })
    
    material.fragmentShader = await (await fetch("shaders/rain.frag")).text();
    resize();

    material.uniforms.u_tex0_resolution.value = new THREE.Vector2(1920, 1080);
    material.uniforms.u_tex0.value = await new THREE.TextureLoader().loadAsync("media/image.webp");

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2, 1, 1), material);
    scene.add(quad);

    window.addEventListener("resize", (e) => resize());
    render();

    document.dispatchEvent(sceneLoadedEvent);
}

function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.u_resolution.value = new THREE.Vector2(
      window.innerWidth * settings.scale,
      window.innerHeight * settings.scale
    );
  }

function render() {
    setTimeout(function () {
      requestAnimationFrame(render);
    }, 1000 / settings.fps);
  
    //reset every 6hr
    if (clock.getElapsedTime() > 21600) clock = new THREE.Clock();
    material.uniforms.u_time.value = clock.getElapsedTime();
  
    renderer.render(scene, camera);
  }
  
  init();
