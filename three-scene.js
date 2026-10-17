/**
 * AstraGov AI - 3D Three.js Interactive Animation Engine
 * Renders the AI Neural Reactor Core, Orbiting Exam Knowledge Crystals,
 * Cybernetic Gyro Rings, and Interactive Particle Field.
 */

class AstraThreeScene {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.coreGroup = new THREE.Group();
    this.particlesGroup = new THREE.Group();
    this.orbitalsGroup = new THREE.Group();
    this.ringsGroup = new THREE.Group();
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.windowHalfX = window.innerWidth / 2;
    this.windowHalfY = window.innerHeight / 2;
    
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.userRotation = { x: 0, y: 0 };

    this.currentMode = "quantum"; // quantum, matrix, holo
    this.hoveredOrbital = null;
    this.orbitalsData = [];
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    // 1. Create Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060913, 0.0018);

    // 2. Camera setup
    const aspect = this.canvas.clientWidth / (this.canvas.clientHeight || 500);
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 2000);
    this.camera.position.set(0, 20, 160);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x1a243b, 1.8);
    this.scene.add(ambientLight);

    const pointLightCyan = new THREE.PointLight(0x00f0ff, 3, 300);
    pointLightCyan.position.set(60, 50, 80);
    this.scene.add(pointLightCyan);

    const pointLightPurple = new THREE.PointLight(0xa855f7, 3, 300);
    pointLightPurple.position.set(-60, -40, 60);
    this.scene.add(pointLightPurple);

    const pointLightGold = new THREE.PointLight(0xf59e0b, 2, 200);
    pointLightGold.position.set(0, 80, -40);
    this.scene.add(pointLightGold);

    // 5. Build 3D Entities
    this.buildCore();
    this.buildGyroRings();
    this.buildOrbitingKnowledgeNodes();
    this.buildParticleField();
    this.buildCyberGrid();

    this.scene.add(this.coreGroup);
    this.scene.add(this.ringsGroup);
    this.scene.add(this.orbitalsGroup);
    this.scene.add(this.particlesGroup);

    // 6. Raycasting & Events
    this.raycaster = new THREE.Raycaster();
    this.mouseVec = new THREE.Vector2();

    this.bindEvents();
    this.animate();
  }

  buildCore() {
    // Inner pulsating crystal (Icosahedron)
    const innerGeo = new THREE.IcosahedronGeometry(22, 1);
    const innerMat = new THREE.MeshPhongMaterial({
      color: 0x06b6d4,
      emissive: 0x083344,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
      shininess: 90
    });
    this.innerCore = new THREE.Mesh(innerGeo, innerMat);
    this.coreGroup.add(this.innerCore);

    // Solid inner glowing orb
    const orbGeo = new THREE.SphereGeometry(14, 32, 32);
    const orbMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      wireframe: false
    });
    this.orbMesh = new THREE.Mesh(orbGeo, orbMat);
    this.coreGroup.add(this.orbMesh);

    // Secondary surrounding wireframe cage (Dodecahedron)
    const cageGeo = new THREE.DodecahedronGeometry(28, 0);
    const cageMat = new THREE.MeshStandardMaterial({
      color: 0xa855f7,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.8
    });
    this.cageMesh = new THREE.Mesh(cageGeo, cageMat);
    this.coreGroup.add(this.cageMesh);
  }

  buildGyroRings() {
    // 3 Concentric Tech Rings rotating on different axes
    const ringConfigs = [
      { radius: 38, tube: 0.5, color: 0x00f5ff, rotAxis: 'x', speed: 0.015 },
      { radius: 46, tube: 0.6, color: 0x9333ea, rotAxis: 'y', speed: -0.012 },
      { radius: 54, tube: 0.4, color: 0x3b82f6, rotAxis: 'z', speed: 0.018 }
    ];

    this.rings = [];

    ringConfigs.forEach(cfg => {
      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 100);
      const mat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.65
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.userData = cfg;
      this.ringsGroup.add(ring);
      this.rings.push(ring);

      // Add small glowing tech notches along the ring
      const notchGeo = new THREE.BoxGeometry(1.2, 1.2, 3);
      const notchMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      for (let i = 0; i < 4; i++) {
        const notch = new THREE.Mesh(notchGeo, notchMat);
        const angle = (i / 4) * Math.PI * 2;
        notch.position.set(
          Math.cos(angle) * cfg.radius,
          Math.sin(angle) * cfg.radius,
          0
        );
        ring.add(notch);
      }
    });
  }

  buildOrbitingKnowledgeNodes() {
    // Exam subjects floating in 3D orbit around AI core
    const subjects = [
      { name: "Indian Polity", code: "POLITY", color: 0x38bdf8, dist: 75, speed: 0.008, yOff: 12, shape: 'octa' },
      { name: "Economics", code: "ECON", color: 0xf59e0b, dist: 88, speed: -0.006, yOff: -15, shape: 'tetra' },
      { name: "Modern History", code: "HIST", color: 0xec4899, dist: 102, speed: 0.005, yOff: 22, shape: 'icosa' },
      { name: "Quant & CSAT", code: "QUANT", color: 0x10b981, dist: 115, speed: -0.007, yOff: -8, shape: 'cube' },
      { name: "Gen Science", code: "SCI-TECH", color: 0x8b5cf6, dist: 128, speed: 0.004, yOff: 18, shape: 'dodec' },
      { name: "Reasoning", code: "REASONING", color: 0x06b6d4, dist: 95, speed: -0.009, yOff: -24, shape: 'octa' }
    ];

    this.orbitals = [];

    subjects.forEach((subj, idx) => {
      let geo;
      switch (subj.shape) {
        case 'octa': geo = new THREE.OctahedronGeometry(4.5, 0); break;
        case 'tetra': geo = new THREE.TetrahedronGeometry(5, 0); break;
        case 'icosa': geo = new THREE.IcosahedronGeometry(4.5, 0); break;
        case 'cube': geo = new THREE.BoxGeometry(5.5, 5.5, 5.5); break;
        case 'dodec': geo = new THREE.DodecahedronGeometry(4.5, 0); break;
        default: geo = new THREE.SphereGeometry(4, 16, 16);
      }

      const mat = new THREE.MeshPhongMaterial({
        color: subj.color,
        emissive: subj.color,
        emissiveIntensity: 0.4,
        shininess: 100,
        wireframe: false
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = {
        name: subj.name,
        code: subj.code,
        dist: subj.dist,
        speed: subj.speed,
        angle: (idx / subjects.length) * Math.PI * 2,
        yOff: subj.yOff,
        initialColor: subj.color
      };

      // Add a mini ring around the satellite
      const satRingGeo = new THREE.TorusGeometry(7, 0.2, 8, 32);
      const satRingMat = new THREE.MeshBasicMaterial({ color: subj.color, transparent: true, opacity: 0.5 });
      const satRing = new THREE.Mesh(satRingGeo, satRingMat);
      satRing.rotation.x = Math.PI / 2;
      mesh.add(satRing);

      this.orbitalsGroup.add(mesh);
      this.orbitals.push(mesh);
    });
  }

  buildParticleField() {
    // 1,500 Starfield and AI neural data points
    const particleCount = 1400;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00f0ff);
    const color2 = new THREE.Color(0x8b5cf6);
    const color3 = new THREE.Color(0x38bdf8);

    for (let i = 0; i < particleCount; i++) {
      const radius = 60 + Math.random() * 450;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = (i % 3 === 0) ? color1 : (i % 3 === 1 ? color2 : color3);
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(geometry, material);
    this.particlesGroup.add(this.particleSystem);
  }

  buildCyberGrid() {
    // Horizon wireframe grid at the bottom for cyberpunk depth
    const grid = new THREE.GridHelper(500, 40, 0x0284c7, 0x1e293b);
    grid.position.y = -80;
    grid.material.transparent = true;
    grid.material.opacity = 0.22;
    this.scene.add(grid);
    this.cyberGrid = grid;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onResize());

    // Mouse movement parallax
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX - this.windowHalfX) * 0.06;
      this.targetMouseY = (e.clientY - this.windowHalfY) * 0.06;

      // Raycasting for interactive hover
      const rect = this.canvas.getBoundingClientRect();
      this.mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.checkRaycast();
    });

    // Touch support for mobile devices
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.targetMouseX = (e.touches[0].clientX - this.windowHalfX) * 0.05;
        this.targetMouseY = (e.touches[0].clientY - this.windowHalfY) * 0.05;
      }
    }, { passive: true });

    // Interactive canvas drag to orbit
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.prevMousePos.x;
      const deltaY = e.clientY - this.prevMousePos.y;
      this.userRotation.y += deltaX * 0.005;
      this.userRotation.x += deltaY * 0.005;
      this.prevMousePos = { x: e.clientX, y: e.clientY };
    });

    // Orbital click triggers AI flash card or HUD info
    this.canvas.addEventListener('click', () => {
      if (this.hoveredOrbital) {
        const u = this.hoveredOrbital.userData;
        this.pulseOrbital(this.hoveredOrbital);
        if (window.on3DNodeClick) {
          window.on3DNodeClick(u);
        }
      }
    });
  }

  checkRaycast() {
    this.raycaster.setFromCamera(this.mouseVec, this.camera);
    const intersects = this.raycaster.intersectObjects(this.orbitals);

    const hudBadge = document.getElementById('scene-active-node-hud');

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      if (this.hoveredOrbital !== hit) {
        if (this.hoveredOrbital) {
          this.hoveredOrbital.material.emissiveIntensity = 0.4;
          this.hoveredOrbital.scale.set(1, 1, 1);
        }
        this.hoveredOrbital = hit;
        this.hoveredOrbital.material.emissiveIntensity = 1.0;
        this.hoveredOrbital.scale.set(1.35, 1.35, 1.35);

        if (hudBadge) {
          hudBadge.innerHTML = `<span>🎯 3D Node Target: <strong>${hit.userData.name}</strong> [${hit.userData.code}]</span>`;
          hudBadge.classList.add('visible');
        }
      }
    } else {
      if (this.hoveredOrbital) {
        this.hoveredOrbital.material.emissiveIntensity = 0.4;
        this.hoveredOrbital.scale.set(1, 1, 1);
        this.hoveredOrbital = null;
        if (hudBadge) {
          hudBadge.classList.remove('visible');
        }
      }
    }
  }

  pulseOrbital(mesh) {
    // Energy ripple effect
    let scale = 1.6;
    mesh.scale.set(scale, scale, scale);
    const returnAnim = () => {
      scale -= 0.05;
      if (scale > 1.0) {
        mesh.scale.set(scale, scale, scale);
        requestAnimationFrame(returnAnim);
      } else {
        mesh.scale.set(1, 1, 1);
      }
    };
    returnAnim();
  }

  setVisualMode(mode) {
    this.currentMode = mode;
    if (mode === "matrix") {
      this.innerCore.material.color.setHex(0x10b981);
      this.innerCore.material.emissive.setHex(0x064e3b);
      this.cageMesh.material.color.setHex(0x34d399);
      this.particleSystem.material.color.setHex(0x10b981);
    } else if (mode === "holo") {
      this.innerCore.material.color.setHex(0xa855f7);
      this.innerCore.material.emissive.setHex(0x581c87);
      this.cageMesh.material.color.setHex(0xe879f9);
      this.particleSystem.material.color.setHex(0xc084fc);
    } else {
      // Quantum default
      this.innerCore.material.color.setHex(0x06b6d4);
      this.innerCore.material.emissive.setHex(0x083344);
      this.cageMesh.material.color.setHex(0xa855f7);
      this.particleSystem.material.color.setHex(0x38bdf8);
    }
  }

  onResize() {
    if (!this.canvas) return;
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight || 500;
    this.windowHalfX = width / 2;
    this.windowHalfY = height / 2;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth mouse parallax easing
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    this.camera.position.x = this.mouseX;
    this.camera.position.y = 20 - this.mouseY * 0.8;
    this.camera.lookAt(0, 0, 0);

    // Rotate core
    if (this.innerCore) {
      this.innerCore.rotation.x += 0.008;
      this.innerCore.rotation.y += 0.012;
      const pulse = 1 + Math.sin(elapsedTime * 2.5) * 0.08;
      this.orbMesh.scale.set(pulse, pulse, pulse);
    }

    if (this.cageMesh) {
      this.cageMesh.rotation.x -= 0.005;
      this.cageMesh.rotation.y -= 0.007;
    }

    // Rotate gyro rings on independent axes
    this.rings.forEach(ring => {
      const cfg = ring.userData;
      ring.rotation[cfg.rotAxis] += cfg.speed;
    });

    // Orbit knowledge nodes
    this.orbitals.forEach(mesh => {
      const u = mesh.userData;
      u.angle += u.speed;
      mesh.position.x = Math.cos(u.angle) * u.dist;
      mesh.position.z = Math.sin(u.angle) * u.dist;
      mesh.position.y = u.yOff + Math.sin(elapsedTime * 2 + u.angle) * 5;
      mesh.rotation.x += 0.02;
      mesh.rotation.y += 0.025;
    });

    // Rotate particle universe slowly
    if (this.particlesGroup) {
      this.particlesGroup.rotation.y += 0.0006;
      this.particlesGroup.rotation.x = Math.sin(elapsedTime * 0.1) * 0.05;
    }

    // Apply user drag rotation
    this.scene.rotation.y = this.userRotation.y;
    this.scene.rotation.x = this.userRotation.x;

    this.renderer.render(this.scene, this.camera);
  }
}

// Global initialization helper
window.initAstraThree = function(canvasId = 'hero-3d-canvas') {
  if (typeof THREE !== 'undefined') {
    window.astraThree = new AstraThreeScene(canvasId);
  } else {
    console.warn("Three.js not yet loaded; deferring 3D scene init.");
  }
};
