import * as THREE from 'three'


export function addAmbient() {
	const light = new THREE.AmbientLight(0xffffff, 0.3)
	light.position.set(40, 40, 1)
	return light
}

export function addDirect() {
	const light = new THREE.DirectionalLight(15111193, 0.9)
	const light2 = new THREE.DirectionalLight(15111193, 0.9)
	light.position.set(120, 20, -1000)
	light2.position.set(50, 20, 0)
	return light
	return light2
}
