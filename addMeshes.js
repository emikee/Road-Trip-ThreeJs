import * as THREE from 'three'
import { Environment } from "@react-three/drei"


const textureLoader = new THREE.TextureLoader()

export function createTerrain() {
	const groundGeo = new THREE.PlaneGeometry(1200, 900, 30, 40);
	const basecolor = new THREE.TextureLoader().load( "/grass.jpeg" )
	const normal = new THREE.TextureLoader().load("/Dirt_003_OCC.png")

	let disMap = new THREE.TextureLoader()
		.load("/mountainmap.png")

		disMap.wrapS = disMap.wrapT = THREE.RepeatWrapping
		disMap.repeat.set(1, 1)

	const groundMat = new THREE.MeshStandardMaterial({
		color: 4538164,
		map: basecolor,
		displacementMap: disMap,
		displacementScale: 100,
		normalMap: normal,
		roughness: 0.8
	}) 
	const groundMesh = new THREE.Mesh(groundGeo, groundMat)
	groundMesh.position.set(-100,-1000,-100)
	groundMesh.rotation.set(180, 0, 0)
	return groundMesh
}

export function addWindow () {
	const geometry = new THREE.PlaneGeometry(100, 80)
	const roughnessMap = new THREE.TextureLoader().load("/Water droplets.jpeg")
	const texture = new THREE.TextureLoader().load("/dirtywindow.jpeg")

	const material = new THREE.MeshPhysicalMaterial({
		color: 14875647,
		side: THREE.DoubleSide,
		transmission: 1,
		ior: 1.2	,
		roughness: 0.4,
		roughnessMap: roughnessMap,
		normalMap: roughnessMap,
		thickness: 0.4,
		thicknessMap: roughnessMap,
		map: texture
	})

	const plane = new THREE.Mesh(geometry, material)
	plane.position.set(0, 20, 450)
	return plane
}

