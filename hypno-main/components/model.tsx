import { useGLTF, Text, MeshTransmissionMaterial } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef } from "react";

const Model = () => {
    const mesh: any = useRef();
    const { nodes } = useGLTF("/torus.glb"); 
    const { viewport } = useThree()

    useFrame(() => {
        mesh.current.rotation.x += 0.02
        mesh.current.rotation.y += 0.01
    })

    const materialProps = useControls({
        thickness: { value: 0.2, min: 0, max: 3, step: 0.05 },
        roughness: { value: 0.4, min: 0, max: 1, step: 0.1 },
        transmission: {value: 1, min: 0, max: 1, step: 0.1},
        ior: { value: 1.2, min: 0, max: 3, step: 0.1 },
        chromaticAberration: { value: 1, min: 0, max: 1},
        backside: { value: true},
    })

    return (
        <group scale={viewport.width / 8}>
            <Text fontSize={1.4} font='fonts/NunitoSans_10pt-Bold.ttf' position={[0, 0, -0.5]}>
                Hypnosis
            </Text>
            <mesh ref={mesh} {...nodes.Torus001}>
                <MeshTransmissionMaterial {...materialProps}/>
            </mesh>
        </group>
    )
}

export default Model