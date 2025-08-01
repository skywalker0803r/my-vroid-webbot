// VRMViewer.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm";

const VRMViewer = ({ modelUrl, latestReply }) => {
  const mountRef = useRef();
  const currentVrm = useRef(null);
  const renderer = useRef(null);
  const scene = useRef(null);
  const camera = useRef(null);
  const clock = useRef(new THREE.Clock());

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    renderer.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.current.setSize(width, height);
    mountRef.current.appendChild(renderer.current.domElement);

    scene.current = new THREE.Scene();
    camera.current = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.current.position.set(0.0, 1.4, 2.0);

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(1, 1, 1).normalize();
    scene.current.add(light);

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      modelUrl,
      (gltf) => {
        const vrm = gltf.userData.vrm;
        if (!vrm) {
          console.error("Loaded model is not a VRM");
          return;
        }
        console.log("VRM model loaded successfully.");
        
        if (currentVrm.current) {
          scene.current.remove(currentVrm.current.scene);
          if (typeof currentVrm.current.dispose === 'function') {
            currentVrm.current.dispose();
          }
        }
        currentVrm.current = vrm;
        scene.current.add(vrm.scene);
        VRMUtils.rotateVRM0(vrm);
      },
      undefined,
      (error) => {
        console.error("Failed to load VRM model:", error);
      }
    );

    let blinkTime = Math.random() * 5 + 2;

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.current.getDelta();
      const elapsedTime = clock.current.elapsedTime;

      if (currentVrm.current) {
        // 點頭動作
        const head = currentVrm.current.humanoid.getRawBoneNode('head');
        if (head) {
          head.rotation.x = Math.sin(elapsedTime * 2) * 0.1;
        }

        // 身體輕微搖晃
        const spine = currentVrm.current.humanoid.getRawBoneNode('spine');
        if (spine) {
          spine.rotation.y = Math.sin(elapsedTime * 0.5) * 0.05;
        }

        // 眨眼效果
        blinkTime -= delta;
        if (blinkTime <= 0) {
          currentVrm.current.expressionManager.setValue('blink', 1.0);
          setTimeout(() => {
            if (currentVrm.current) {
              currentVrm.current.expressionManager.setValue('blink', 0.0);
            }
          }, 100);
          blinkTime = Math.random() * 5 + 2;
        }

        const leftUpperArm = currentVrm.current.humanoid.getRawBoneNode('leftUpperArm');
        const rightUpperArm = currentVrm.current.humanoid.getRawBoneNode('rightUpperArm');

        // 新增的日誌
        console.log("Current latestReply:", latestReply);
        if (leftUpperArm) {
          console.log("Left arm rotation before gesture check:", leftUpperArm.rotation);
        } else {
          console.warn("Left arm bone not found.");
        }

        // 檢查是否有特定回覆，來觸發誇張姿勢
        const greetingKeywords = ['嗨', '哈囉', '您好', '你好'];
        if (greetingKeywords.some(keyword => latestReply.includes(keyword))) {
          console.log("Triggering 'Hello' gesture.");
          // 誇張的揮手動作
          if (leftUpperArm) {
            leftUpperArm.rotation.x = Math.sin(elapsedTime * 5) * 0.5 - Math.PI / 2;
            leftUpperArm.rotation.y = Math.sin(elapsedTime * 3) * 0.5;
          }
          if (rightUpperArm) {
            rightUpperArm.rotation.x = Math.sin(elapsedTime * 5) * 0.5 - Math.PI / 2;
            rightUpperArm.rotation.y = Math.sin(elapsedTime * 3) * 0.5;
          }
        } else if (latestReply.includes('謝謝') || latestReply.includes('感謝')) {
          console.log("Triggering 'Thanks' gesture.");
          // 雙手舉起表示感謝
          if (leftUpperArm) {
            leftUpperArm.rotation.x = Math.PI * 0.6;
            leftUpperArm.rotation.z = Math.PI * 0.2;
          }
          if (rightUpperArm) {
            rightUpperArm.rotation.x = Math.PI * 0.6;
            rightUpperArm.rotation.z = -Math.PI * 0.2;
          }
        } else {
          // 沒有特定回覆時，執行閒置動作
          console.log("Triggering 'Idle' gesture.");
          if (leftUpperArm) {
            leftUpperArm.rotation.x = Math.sin(elapsedTime * 1) * 0.05 - 0.1;
            leftUpperArm.rotation.y = Math.sin(elapsedTime * 0.8) * 0.05;
            leftUpperArm.rotation.z = Math.cos(elapsedTime * 1.2) * 0.05;
          }
          if (rightUpperArm) {
            rightUpperArm.rotation.x = Math.sin(elapsedTime * 1) * 0.05 - 0.1;
            rightUpperArm.rotation.y = Math.sin(elapsedTime * 0.8) * 0.05;
            rightUpperArm.rotation.z = Math.cos(elapsedTime * 1.2) * -0.05;
          }
        }
        
        if (leftUpperArm) {
          console.log("Left arm rotation after gesture check:", leftUpperArm.rotation);
        } else {
          console.warn("Left arm bone not found.");
        }

        currentVrm.current.update(delta);
      }

      renderer.current.render(scene.current, camera.current);
    };
    animate();

    return () => {
      if (renderer.current) {
        renderer.current.dispose();
        if (mountRef.current && renderer.current.domElement) {
          mountRef.current.removeChild(renderer.current.domElement);
        }
      }
      if (currentVrm.current) {
        if (typeof currentVrm.current.dispose === 'function') {
          currentVrm.current.dispose();
        }
      }
    };
  }, [modelUrl, latestReply]);

  return <div ref={mountRef} style={{ width: "100%", height: "500px" }} />;
};

export default VRMViewer;