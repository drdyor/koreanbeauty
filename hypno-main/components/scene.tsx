"use client";
import { Canvas } from "@react-three/fiber";
import Model from "./model";
import { Environment } from "@react-three/drei";

const Scene = () => {
  return (
    <Canvas className="bg-black">
        <directionalLight intensity={3} position={[0, 3, 2]} />
        <Environment preset="city" />
        <Model />
    </Canvas>
  )
}

export default Scene