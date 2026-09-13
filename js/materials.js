/* Materialbibliothek – alle Oberflaechen der 3D-Szene an einer Stelle. */
(function (global) {
  'use strict';

  function makeCarbonTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var g = c.getContext('2d');
    g.fillStyle = '#141416';
    g.fillRect(0, 0, 128, 128);
    for (var y = 0; y < 128; y += 8) {
      for (var x = 0; x < 128; x += 8) {
        var weave = ((x / 8) + (y / 8)) % 2 === 0;
        g.fillStyle = weave ? '#26272b' : '#0e0e10';
        g.fillRect(x, y, 8, 8);
        g.fillStyle = 'rgba(255,255,255,0.05)';
        g.fillRect(x, y, weave ? 8 : 2, weave ? 2 : 8);
      }
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 2);
    return t;
  }

  function makeTireTexture() {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 128;
    var g = c.getContext('2d');
    g.fillStyle = '#111113';
    g.fillRect(0, 0, 512, 128);
    // Seitenwand dunkel, Lauflaeche mit Stollenmuster
    function knob(x, y, w, h, shade) {
      g.fillStyle = shade;
      g.beginPath();
      g.moveTo(x + 2, y); g.lineTo(x + w, y + 1); g.lineTo(x + w - 2, y + h); g.lineTo(x, y + h - 1);
      g.closePath(); g.fill();
    }
    for (var i = 0; i < 16; i++) {
      var x = i * 32;
      knob(x + 3, 22, 22, 24, '#3a3b42');   // grobe Mittelstollen
      knob(x + 19, 54, 22, 24, '#313239');
      knob(x + 3, 86, 22, 20, '#3a3b42');
      knob(x - 6, 2, 18, 18, '#2a2b30');    // Schulterstollen
      knob(x + 14, 108, 18, 18, '#2a2b30');
    }
    g.fillStyle = 'rgba(0,0,0,.55)';
    g.fillRect(0, 0, 512, 6); g.fillRect(0, 122, 512, 6);
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(15, 1);
    t.anisotropy = 8;
    return t;
  }

  function makeTireBump() {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 128;
    var g = c.getContext('2d');
    g.fillStyle = '#3a3a3a';
    g.fillRect(0, 0, 512, 128);
    g.fillStyle = '#ffffff';
    for (var i = 0; i < 16; i++) {
      var x = i * 32;
      g.fillRect(x + 3, 22, 22, 24);
      g.fillRect(x + 19, 54, 22, 24);
      g.fillRect(x + 3, 86, 22, 20);
      g.fillRect(x - 6, 2, 18, 18);
      g.fillRect(x + 14, 108, 18, 18);
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(15, 1);
    return t;
  }

  var carbonTex = null, tireTex = null, tireBump = null;

  function create() {
    if (!carbonTex) { carbonTex = makeCarbonTexture(); carbonTex.encoding = THREE.sRGBEncoding; }
    if (!tireTex) { tireTex = makeTireTexture(); tireTex.encoding = THREE.sRGBEncoding; }
    if (!tireBump) tireBump = makeTireBump();

    var M = {};

    M.paint = new THREE.MeshPhysicalMaterial({
      color: 0x6d7a84, metalness: 0.08, roughness: 0.28,
      clearcoat: 1.0, clearcoatRoughness: 0.05, envMapIntensity: 0.55
    });
    M.paintAccent = new THREE.MeshPhysicalMaterial({
      color: 0xc3cad0, metalness: 0.10, roughness: 0.26,
      clearcoat: 1.0, clearcoatRoughness: 0.07, envMapIntensity: 0.6
    });
    M.fork = new THREE.MeshPhysicalMaterial({
      color: 0x1a1c1f, metalness: 0.1, roughness: 0.3, envMapIntensity: 0.6,
      clearcoat: 0.9, clearcoatRoughness: 0.1
    });
    M.carbon = new THREE.MeshPhysicalMaterial({
      map: carbonTex, color: 0xffffff, metalness: 0.25, roughness: 0.35,
      clearcoat: 1.0, clearcoatRoughness: 0.08
    });
    M.alu = new THREE.MeshStandardMaterial({ color: 0xb9bcc0, metalness: 0.95, roughness: 0.28 });
    M.aluDark = new THREE.MeshStandardMaterial({ color: 0x5a5e63, metalness: 0.9, roughness: 0.35 });
    M.steel = new THREE.MeshStandardMaterial({ color: 0xd6d9dc, metalness: 1.0, roughness: 0.16 });
    // eigenes Speichenmaterial: wird bei hoher Drehzahl transparenter (Bewegungsunschaerfe)
    M.spoke = new THREE.MeshStandardMaterial({
      color: 0xd6d9dc, metalness: 1.0, roughness: 0.18, transparent: true, opacity: 1
    });
    M.rotor = new THREE.MeshStandardMaterial({
      color: 0xc9ccd0, metalness: 1.0, roughness: 0.22, side: THREE.DoubleSide
    });
    M.black = new THREE.MeshStandardMaterial({ color: 0x1b1c1e, metalness: 0.2, roughness: 0.55 });
    M.blackGloss = new THREE.MeshPhysicalMaterial({
      color: 0x141517, metalness: 0.35, roughness: 0.22, clearcoat: 0.8
    });
    M.rubber = new THREE.MeshStandardMaterial({
      map: tireTex, bumpMap: tireBump, bumpScale: 0.0075,
      color: 0xffffff, metalness: 0.0, roughness: 0.95, envMapIntensity: 0.25
    });
    M.rubberSide = new THREE.MeshStandardMaterial({ color: 0x171719, metalness: 0.0, roughness: 0.85 });
    M.saddle = new THREE.MeshStandardMaterial({ color: 0x121316, metalness: 0.05, roughness: 0.65 });
    M.bartape = new THREE.MeshStandardMaterial({ color: 0x1a1b1d, metalness: 0.0, roughness: 0.8 });
    M.fabric = new THREE.MeshStandardMaterial({ color: 0x1e2024, metalness: 0.0, roughness: 0.92 });
    M.fabricDark = new THREE.MeshStandardMaterial({ color: 0x131417, metalness: 0.0, roughness: 0.95 });
    M.glassWhite = new THREE.MeshPhysicalMaterial({
      color: 0xffffff, metalness: 0.0, roughness: 0.05, transmission: 0.55,
      transparent: true, opacity: 0.85, emissive: 0xfff2cc, emissiveIntensity: 0.35
    });
    M.glassRed = new THREE.MeshPhysicalMaterial({
      color: 0xd42323, metalness: 0.0, roughness: 0.08, transmission: 0.4,
      transparent: true, opacity: 0.9, emissive: 0xaa1010, emissiveIntensity: 0.4
    });
    M.screen = new THREE.MeshStandardMaterial({
      color: 0x0d1418, metalness: 0.1, roughness: 0.15, emissive: 0x1d3a44, emissiveIntensity: 0.5
    });
    M.bottle = new THREE.MeshPhysicalMaterial({
      color: 0xdfe4e8, metalness: 0.0, roughness: 0.35, transmission: 0.25,
      transparent: true, opacity: 0.92
    });
    M.chain = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: 1.0, roughness: 0.34 });
    M.chainDark = new THREE.MeshStandardMaterial({ color: 0x5f656b, metalness: 1.0, roughness: 0.45 });

    // Farbige Taschenstoffe (Zubehoer) - werden pro Farbwert einmal erzeugt
    M._fabricCache = {};
    M.fabricColor = function (hex, dark) {
      var key = hex + '|' + (dark ? 1 : 0);
      if (!M._fabricCache[key]) {
        var col = new THREE.Color(hex);
        if (dark) col.multiplyScalar(0.55);
        M._fabricCache[key] = new THREE.MeshStandardMaterial({
          color: col, metalness: 0.0, roughness: 0.82, envMapIntensity: 0.5
        });
      }
      return M._fabricCache[key];
    };

    return M;
  }

  global.CubeMaterials = { create: create };
})(window);
