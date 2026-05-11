import { useGLTF } from "@react-three/drei";

const Model = (props) => {
    const { scene } = useGLTF('/model/school.glb');
    // Rotation controlled by primitive prop below

    return (
        <>
            <primitive scale={18} position={[0, 0, 0]} rotation={[0.15, 1.5, 0]}  {...props} object={scene} />
        </>
    );
};


export default Model;