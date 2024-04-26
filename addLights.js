import * as THREE from 'three'


export function addAmbient() {
	const light = new THREE.AmbientLight(0xffffff, 0.5)
	light.position.set(1, 1, 1)
	return light
}

export function addDirect() {
	const light = new THREE.DirectionalLight(0xffffff, 0.5)
	light.position.set(0, 1, 0)
	return light
}

export function addHemisphere() {
	const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 0.1 );
	return light
}

export function addRectLight() {
	const rectLight = new THREE.RectAreaLight( 0xffffff, 0.5,  10, 10 );
	rectLight.position.set( 5, 5, 0 );
	rectLight.lookAt( 0, 0, 0 );
	return rectLight
}
