import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

const VRMViewer = () => {
  const containerRef = useRef();
  const currentVrmRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.4, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.4, 0);
    controls.update();

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1);
    scene.add(light);

    // Load VRM
    const loader = new GLTFLoader();
    loader.register(parser => new VRMLoaderPlugin(parser));
    loader.load('/your_model.vrm', (gltf) => {
      const vrm = gltf.userData.vrm;
      VRMUtils.removeUnnecessaryJoints(vrm.scene);
      scene.add(vrm.scene);
      currentVrmRef.current = vrm;
    });

    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (currentVrmRef.current) {
        currentVrmRef.current.update(delta);
        const head = currentVrmRef.current.humanoid.getBoneNode('head');
        if (head) {
          head.rotation.y = Math.sin(clock.elapsedTime) * 0.3;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      renderer.dispose();
      window.removeEventListener('resize', handleResize);
      container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default VRMViewer;
