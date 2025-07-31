import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRM } from "@pixiv/three-vrm";

const VRMViewer = ({ modelUrl }) => {
  const mountRef = useRef();
  const currentVrm = useRef(null);
  const renderer = useRef(null);
  const scene = useRef(null);
  const camera = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 初始化渲染器
    renderer.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.current.setSize(width, height);
    mountRef.current.appendChild(renderer.current.domElement);

    // 初始化场景和相机
    scene.current = new THREE.Scene();
    camera.current = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.current.position.set(0.0, 1.4, 2.0);

    // 添加灯光
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    scene.current.add(light);

    // 载入 VRM 模型
    const loader = new GLTFLoader();

    loader.load(
      modelUrl,
      async (gltf) => {
        try {
          const vrm = await VRM.from(gltf);

          if (currentVrm.current) {
            scene.current.remove(currentVrm.current.scene);
            currentVrm.current.dispose();
          }
          currentVrm.current = vrm;
          scene.current.add(vrm.scene);
        } catch (error) {
          console.error("Error converting to VRM:", error);
        }
      },
      undefined,
      (error) => {
        console.error("Failed to load model:", error);
      }
    );

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      if (currentVrm.current) {
        currentVrm.current.update();
      }
      renderer.current.render(scene.current, camera.current);
    };
    animate();

    // 卸载清理
    return () => {
      if (renderer.current) {
        renderer.current.dispose();
        if (mountRef.current && renderer.current.domElement) {
          mountRef.current.removeChild(renderer.current.domElement);
        }
      }
      if (currentVrm.current) {
        currentVrm.current.dispose();
      }
    };
  }, [modelUrl]);

  return <div ref={mountRef} style={{ width: "100%", height: "500px" }} />;
};

export default VRMViewer;
