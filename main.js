import './style.css'
import * as THREE from 'three'
import { addWindow, createTerrain } from './addMeshes'
import { addAmbient, addHemisphere, addRectLight, addDirect } from './addLights'
import Model from './Model'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {postprocessing} from "./postprocessing"
import { Sky } from 'three/addons/objects/Sky.js'
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'

const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({ 
	antialias: true,
	canvas: document.querySelector("#bg") 
})

const camera = new THREE.PerspectiveCamera(
	10,
	window.innerWidth / window.innerHeight,
	0.01,
	10000
)
// const listener = new THREE.AudioListener()
// camera.add( listener )
// const sound = new THREE.Audio( listener )
// const audioLoader = new THREE.AudioLoader()
// audioLoader.load( 'sounds/ambient.ogg', function( buffer ) {
// 	sound.setBuffer( buffer );
// 	sound.setLoop( true );
// 	sound.setVolume( 0.5 );
// 	sound.play();
// });
let sky, sun


// const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
camera.position.set(0, 20, 700)

//Globals
const meshes = {}
const lights = {}
const clock = new THREE.Clock()
const material = new THREE.ShaderMaterial
const pointerLock = new PointerLockControls( camera, document.body )
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

let prevTime = performance.now();
let moveLeft = false
let moveRight = false
let composer 
let rayleigh = 1.394
let exposure = 0.7

//controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableRotate = false
controls.enableZoom = false


init()

function initSky() {

	// Add Sky
	sky = new Sky();
	sky.scale.setScalar( 450000 );
	scene.add( sky );

	sun = new THREE.Vector3();

	let uniforms = sky.material.uniforms;
	uniforms[ 'turbidity' ].value = 4.5;
	uniforms[ 'mieCoefficient' ].value = 0.009;
	uniforms[ 'mieDirectionalG' ].value = 0.7;

	const phi = THREE.MathUtils.degToRad( 90 - 0.3 );
	const theta = THREE.MathUtils.degToRad( -150 );

	sun.setFromSphericalCoords( 1, phi, theta );

	uniforms[ 'sunPosition' ].value.copy( sun );
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	
	renderer.render( scene, camera );

}


function init() {
	renderer.setSize(window.innerWidth, window.innerHeight)

	//meshes
	meshes.terrain = createTerrain()
	meshes.window = addWindow()

	//lights
	lights.ambient = addAmbient()
	lights.hemisphere = addHemisphere()
	lights.rectlight = addRectLight()
	lights.direct = addDirect()

	//changes

	//post
	composer = postprocessing(scene, camera, renderer)

	//key
	const onKeyDown = function ( event ) {

		switch ( event.code ) {

			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = true;
				if (rayleigh < 6.0) {
					rayleigh += 0.05
				}
				if (exposure > 0.3) {
					exposure -= 0.005
				}
				console.log(exposure)
				break;

			case 'ArrowRight':
			case 'KeyD':
				moveRight = true;
				if (rayleigh >= 0.3) {
					rayleigh -= 0.05
				}
				if (exposure < 0.9) {
					exposure += 0.005
				}
				break;
		}

	};

	const onKeyUp = function ( event ) {

		switch ( event.code ) {

			case 'ArrowLeft':
			case 'KeyA':
				moveLeft = false;
				break;

			case 'ArrowRight':
			case 'KeyD':
				moveRight = false;
				break;

		}

	};

	document.addEventListener( 'keydown', onKeyDown );
	document.addEventListener( 'keyup', onKeyUp );

	//scene operations
	scene.add(meshes.terrain)
	scene.add(meshes.window)
	scene.add(lights.ambient)
	scene.add(lights.hemisphere)
	scene.add(lights.rectlight)
	scene.add(lights.direct)

	lights.direct.target = meshes.window
	

	initSky()
	resize()
	animate()
	
}


function resize() {
	window.addEventListener('resize', () => {
		renderer.setSize(window.innerWidth, window.innerHeight)
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()
	})
}

function animate() {
	requestAnimationFrame(animate)
	meshes.window.rotation.setFromRotationMatrix(camera.matrix)
	const time = performance.now();
	const delta = ( time - prevTime ) / 1000;

	meshes.terrain.rotation.x = -Math.PI/2
	meshes.terrain.position.y = -100

	let uniforms = sky.material.uniforms;
	uniforms[ 'rayleigh' ].value = rayleigh
	renderer.toneMappingExposure = exposure


	velocity.x -= velocity.x * 15.0 * delta;

	velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

	direction.x = Number( moveRight ) - Number( moveLeft );
	direction.normalize(); // this ensures consistent movements in all directions

	if ( moveLeft || moveRight ) velocity.x -= direction.x * 400.0 * delta;

	pointerLock.moveRight( - velocity.x * delta );

	prevTime = time;

	composer.composer.render()
}

window.onresize = function (e) {
	camera.aspect = window.innerWidth/window.innerHeight
	camera.updateProjectionMatrix()

	renderer.setSize(window.innerWidth, window.innerHeight)
}

let oldx = 0
let oldy = 0

window.onmousemove = function(ev) {
	let changex = ev.x - oldx
	let changey = ev.y - oldy
	camera.position.x += changex/200
	camera.position.y += changey/200 

	oldx = ev.x
	oldy = ev.y
}
