/* =============================================================================
   3D-Szene: Renderer, Beleuchtung, Environment-Reflexionen, Kamera, Steuerung
============================================================================= */
(function (global) {
  'use strict';

  function Viewer(container) {
    this.container = container;
    this.autoRotate = false;
    this.dark = true;
    this._init();
  }

  Viewer.prototype._init = function () {
    var w = this.container.clientWidth || 800;
    var h = this.container.clientHeight || 600;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true, alpha: false, preserveDrawingBuffer: true
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.92;
    if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.setBackground(true);

    this.camera = new THREE.PerspectiveCamera(38, w / h, 0.05, 60);
    this.camera.position.set(1.75, 1.05, 1.85);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.target.set(0.09, 0.60, 0);
    this.controls.minDistance = 0.7;
    this.controls.maxDistance = 6;
    this.controls.maxPolarAngle = Math.PI * 0.52;
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN
    };
    this.controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };

    this._lights();
    this._environment();
    this._ground();

    this.root = new THREE.Group();
    this.scene.add(this.root);

    var self = this;
    this._onResize = function () { self.resize(); };
    window.addEventListener('resize', this._onResize);

    this.updaters = [];
    this.clock = new THREE.Clock();
    this._animate();
  };

  Viewer.prototype.setBackground = function (dark) {
    this.dark = dark;
    var top = dark ? 0x1a1e24 : 0xe9edf1;
    var bottom = dark ? 0x0b0d10 : 0xc3cbd3;
    var c = document.createElement('canvas');
    c.width = 8; c.height = 256;
    var g = c.getContext('2d');
    var grad = g.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#' + top.toString(16).padStart(6, '0'));
    grad.addColorStop(1, '#' + bottom.toString(16).padStart(6, '0'));
    g.fillStyle = grad;
    g.fillRect(0, 0, 8, 256);
    var tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    this.scene.background = tex;
    if (this.groundMat) this.groundMat.opacity = dark ? 0.45 : 0.28;
  };

  Viewer.prototype._lights = function () {
    var key = new THREE.DirectionalLight(0xffffff, 1.7);
    key.position.set(2.4, 3.4, 2.2);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    var d = 1.4;
    key.shadow.camera.left = -d; key.shadow.camera.right = d;
    key.shadow.camera.top = d; key.shadow.camera.bottom = -d;
    key.shadow.camera.near = 0.5; key.shadow.camera.far = 9;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.012;
    this.scene.add(key);
    this.keyLight = key;

    var fill = new THREE.DirectionalLight(0xbcd4ff, 0.45);
    fill.position.set(-2.6, 1.6, -1.6);
    this.scene.add(fill);

    var rim = new THREE.DirectionalLight(0xffffff, 0.7);
    rim.position.set(-1.2, 1.0, 2.6);
    this.scene.add(rim);

    this.scene.add(new THREE.HemisphereLight(0xdfe9f5, 0x1b1d20, 0.35));
  };

  /* Studio-Environment fuer realistische Reflexionen (eigene Geometrie,
     keine externen HDR-Dateien -> vollstaendig offline). */
  Viewer.prototype._environment = function () {
    var envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x9aa5b1);

    function panel(w, h, d, x, y, z, color, intensity) {
      var m = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) })
      );
      m.position.set(x, y, z);
      envScene.add(m);
    }
    // Softboxen rundherum
    panel(8, 0.1, 8, 0, 4, 0, 0xffffff, 1.9);      // Deckenlicht
    panel(3, 2.4, 0.1, 0, 2.2, -4, 0xdfe9ff, 1.6);
    panel(3, 2.4, 0.1, 0, 2.2, 4, 0xffffff, 1.9);
    panel(0.1, 2.4, 3, -4, 2.0, 0, 0xcfd8e6, 1.2);
    panel(0.1, 2.4, 3, 4, 2.0, 0, 0xffffff, 1.4);
    panel(10, 0.1, 10, 0, -1.2, 0, 0x2b2f35, 1.0); // dunkler Boden

    var pmrem = new THREE.PMREMGenerator(this.renderer);
    pmrem.compileEquirectangularShader();
    var envMap = pmrem.fromScene(envScene, 0.04).texture;
    this.scene.environment = envMap;
    pmrem.dispose();
  };

  Viewer.prototype._ground = function () {
    // Kontaktschatten-Ebene
    this.groundMat = new THREE.ShadowMaterial({ opacity: 0.45 });
    var g = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), this.groundMat);
    g.rotation.x = -Math.PI / 2;
    g.position.y = 0;
    g.receiveShadow = true;
    this.scene.add(g);

    // dezenter Reflexionsteller
    var discMat = new THREE.MeshStandardMaterial({
      color: 0x10131a, metalness: 0.5, roughness: 0.35, transparent: true, opacity: 0.35
    });
    var disc = new THREE.Mesh(new THREE.CircleGeometry(1.6, 64), discMat);
    disc.rotation.x = -Math.PI / 2;
    disc.position.y = -0.002;
    this.scene.add(disc);
    this.disc = disc;
  };

  Viewer.prototype.resize = function () {
    var w = this.container.clientWidth, h = this.container.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  var PRESETS = {
    side: { pos: [0.05, 0.62, 2.35], target: [0.05, 0.58, 0] },
    front: { pos: [2.25, 0.75, 0.05], target: [0.15, 0.60, 0] },
    rear: { pos: [-2.15, 0.75, 0.05], target: [-0.05, 0.60, 0] },
    top: { pos: [0.10, 2.6, 0.35], target: [0.08, 0.45, 0] },
    threequarter: { pos: [1.75, 1.05, 1.85], target: [0.09, 0.60, 0] },
    detailFront: { pos: [0.95, 0.95, 0.9], target: [0.52, 0.78, 0] },
    detailRear: { pos: [-0.75, 0.95, 0.95], target: [-0.30, 0.70, 0] }
  };

  Viewer.prototype.setView = function (name, instant) {
    var p = PRESETS[name] || PRESETS.threequarter;
    var self = this;
    var fromPos = this.camera.position.clone();
    var fromTar = this.controls.target.clone();
    var toPos = new THREE.Vector3().fromArray(p.pos);
    var toTar = new THREE.Vector3().fromArray(p.target);
    if (instant) {
      this.camera.position.copy(toPos);
      this.controls.target.copy(toTar);
      return;
    }
    var t0 = performance.now(), dur = 620;
    function step(now) {
      var t = Math.min(1, (now - t0) / dur);
      var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      self.camera.position.lerpVectors(fromPos, toPos, e);
      self.controls.target.lerpVectors(fromTar, toTar, e);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  };

  Viewer.prototype._animate = function () {
    var self = this;
    function loop() {
      self._raf = requestAnimationFrame(loop);
      var dt = self.clock.getDelta();
      if (self.autoRotate) self.root.rotation.y += dt * 0.35;
      for (var i = 0; i < self.updaters.length; i++) self.updaters[i](Math.min(dt, 0.05));
      self.controls.update();
      self.renderer.render(self.scene, self.camera);
    }
    loop();
  };

  Viewer.prototype.screenshot = function () {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  };

  Viewer.prototype.clearRoot = function () {
    while (this.root.children.length) {
      var c = this.root.children.pop();
      c.traverse(function (o) {
        if (o.geometry) o.geometry.dispose();
      });
    }
  };

  global.CubeViewer = Viewer;
})(window);
