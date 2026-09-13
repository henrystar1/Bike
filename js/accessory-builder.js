/* =============================================================================
   Prozedurale 3D-Zubehoerteile.
   Jede Funktion bekommt (M = Materialien, mt = Montagepunkte des Fahrrads)
   und liefert eine THREE.Group, die bereits an der richtigen Stelle sitzt.
============================================================================= */
(function (global) {
  'use strict';

  var V = function (x, y, z) { return new THREE.Vector3(x, y, z || 0); };
  var tube = function () { return CubeBikeBuilder.tube.apply(null, arguments); };
  var curvedTube = function () { return CubeBikeBuilder.curvedTube.apply(null, arguments); };

  function roundedBoxGeo(w, h, d, r) {
    var s = new THREE.Shape();
    var x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    var g = new THREE.ExtrudeGeometry(s, {
      depth: d, bevelEnabled: true, bevelSize: Math.min(0.01, d * 0.2),
      bevelThickness: Math.min(0.008, d * 0.2), bevelSegments: 3, curveSegments: 10
    });
    g.translate(0, 0, -d / 2);
    return g;
  }

  function roundedBox(w, h, d, r, mat) {
    var m = new THREE.Mesh(roundedBoxGeo(w, h, d, r), mat);
    m.castShadow = true;
    return m;
  }

  /* Schutzblech als Bogen mit sichtbaren Seitenwangen.
     Winkelbezug: theta 0 = unten, PI = oben (Zylinder um die Z-Achse gedreht). */
  function arcShell(radius, width, thetaStart, thetaLength, mat, thickness) {
    var g = new THREE.Group();
    var th = thickness || 0.012;
    var outer = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, width, 56, 1, true, thetaStart, thetaLength), mat);
    outer.rotation.x = Math.PI / 2;
    outer.castShadow = true;
    g.add(outer);
    var inner = new THREE.Mesh(
      new THREE.CylinderGeometry(radius - th, radius - th, width, 56, 1, true, thetaStart, thetaLength), mat);
    inner.rotation.x = Math.PI / 2;
    g.add(inner);
    // Seitenwangen: RingGeometry liegt in der XY-Ebene, Winkel um -90 Grad versetzt
    var ring = new THREE.RingGeometry(radius - th, radius, 56, 1,
      thetaStart - Math.PI / 2, thetaLength);
    [1, -1].forEach(function (sd) {
      var side = new THREE.Mesh(ring, mat);
      side.position.z = sd * width / 2;
      side.material = mat;
      g.add(side);
      // umlaufende Kante, damit das Blech auch von der Seite Volumen hat
      var lip = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius - th, 0.006, 56, 1, true, thetaStart, thetaLength), mat);
      lip.rotation.x = Math.PI / 2;
      lip.position.z = sd * (width / 2 - 0.002);
      g.add(lip);
    });
    return g;
  }

  var A = {};

  /* --------------------------- Rahmentasche ------------------------------- */
  A.framebag = function (M, mt, o) {
    var g = new THREE.Group();
    var F = (o && o.color) ? M.fabricColor(o.color) : M.fabric;
    var FD = (o && o.color) ? M.fabricColor(o.color, true) : M.fabricDark;
    var p = mt.P;
    var s = new THREE.Shape();
    // Dreieck leicht eingerueckt
    s.moveTo(p.seatTop.x + 0.045, p.seatTop.y - 0.055);
    s.lineTo(p.headTop.x - 0.10, p.headTop.y - 0.055);
    s.lineTo(p.downTubeHead.x - 0.14, p.downTubeHead.y - 0.055);
    s.lineTo(p.bb.x + 0.055, p.bb.y + 0.075);
    s.closePath();
    var geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.072, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012,
      bevelSegments: 4, curveSegments: 6
    });
    geo.translate(0, 0, -0.036);
    var bag = new THREE.Mesh(geo, F);
    bag.castShadow = true;
    g.add(bag);

    // Reissverschluss
    var zip = tube(V(p.seatTop.x + 0.04, p.seatTop.y - 0.062, 0),
      V(p.headTop.x - 0.10, p.headTop.y - 0.062, 0), 0.004, 0.004, M.aluDark, 8);
    zip.position.z = 0.038;
    g.add(zip);
    // Klettbaender
    [0.25, 0.55, 0.8].forEach(function (t) {
      var a = new THREE.Vector3().lerpVectors(p.seatTop, p.headTop, t);
      var b = new THREE.Mesh(new THREE.TorusGeometry(0.028, 0.005, 6, 18), FD);
      b.position.set(a.x, a.y - 0.008, 0);
      b.rotation.y = Math.PI / 2;
      g.add(b);
    });
    return g;
  };

  /* -------------------------- Oberrohrtasche ------------------------------ */
  A.toptubebag = function (M, mt, o) {
    var g = new THREE.Group();
    var F = (o && o.color) ? M.fabricColor(o.color) : M.fabric;
    var FD = (o && o.color) ? M.fabricColor(o.color, true) : M.fabricDark;
    var pos = new THREE.Vector3().lerpVectors(mt.topTube.b, mt.topTube.a, 0.16);
    var dir = new THREE.Vector3().subVectors(mt.topTube.a, mt.topTube.b).normalize();
    var bag = roundedBox(0.20, 0.075, 0.062, 0.02, F);
    bag.position.copy(pos).add(V(0, 0.055, 0));
    bag.quaternion.setFromUnitVectors(V(1, 0, 0), dir.clone().negate());
    g.add(bag);
    var zip = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.006, 0.008), M.aluDark);
    zip.position.copy(bag.position).add(V(0, 0.04, 0));
    zip.rotation.z = bag.rotation.z;
    g.add(zip);
    return g;
  };

  /* --------------------- Satteltasche / Arschrakete ----------------------- */
  A.saddlebag = function (M, mt, o) {
    var g = new THREE.Group();
    var F = (o && o.color) ? M.fabricColor(o.color) : M.fabric;
    var FD = (o && o.color) ? M.fabricColor(o.color, true) : M.fabricDark;
    var pts = [];
    // Laengsprofil der Bikepacking-Tasche
    var prof = [[0, 0.052], [0.06, 0.062], [0.16, 0.058], [0.26, 0.042], [0.30, 0.022], [0.34, 0.006]];
    prof.forEach(function (p) { pts.push(new THREE.Vector2(p[1], p[0])); });
    var geo = new THREE.LatheGeometry(pts, 28);
    geo.rotateZ(Math.PI / 2);
    var bag = new THREE.Mesh(geo, FD);
    bag.castShadow = true;
    bag.position.copy(mt.saddle).add(V(-0.09, -0.085, 0));
    bag.rotation.z = -0.12;
    g.add(bag);
    // Kompressionsriemen
    [0.1, 0.2, 0.3].forEach(function (d) {
      var r = new THREE.Mesh(new THREE.TorusGeometry(0.045 - d * 0.07, 0.004, 6, 20), M.black);
      r.position.copy(bag.position).add(V(-d, -d * 0.10 + 0.004, 0));
      r.rotation.y = Math.PI / 2;
      r.rotation.x = 0.12;
      g.add(r);
    });
    // Anbindung an Sattelgestell
    var bridge = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.03, 0.055), FD);
    bridge.position.copy(mt.saddle).add(V(-0.075, -0.045, 0));
    bridge.rotation.z = -0.25;
    g.add(bridge);
    // Befestigung an Sattelstuetze
    var strap = new THREE.Mesh(new THREE.TorusGeometry(0.021, 0.005, 6, 18), M.black);
    strap.position.copy(mt.seatpost.top).add(V(-0.004, -0.075, 0));
    strap.rotation.y = Math.PI / 2;
    g.add(strap);
    return g;
  };

  /* --------------------------- Lenkertasche ------------------------------- */
  A.handlebarbag = function (M, mt, o) {
    var g = new THREE.Group();
    var F = (o && o.color) ? M.fabricColor(o.color) : M.fabric;
    var FD = (o && o.color) ? M.fabricColor(o.color, true) : M.fabricDark;
    var roll = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.34, 24), F);
    roll.rotation.x = Math.PI / 2;
    roll.position.copy(mt.bar).add(V(0.075, -0.035, 0));
    roll.castShadow = true;
    g.add(roll);
    [1, -1].forEach(function (s) {
      var capm = new THREE.Mesh(new THREE.SphereGeometry(0.062, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), FD);
      capm.rotation.x = s > 0 ? Math.PI / 2 : -Math.PI / 2;
      capm.position.copy(roll.position).setZ(s * 0.17);
      capm.scale.set(1, 0.35, 1);
      g.add(capm);
    });
    var mount = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.10), M.black);
    mount.position.copy(mt.bar).add(V(0.03, -0.01, 0));
    g.add(mount);
    return g;
  };

  /* --------------------------- Gepaecktraeger ----------------------------- */
  A.rack = function (M, mt) {
    var g = new THREE.Group();
    var hub = mt.rearHub, top = V(hub.x + 0.02, 0.72, 0);
    var mat = M.aluDark;
    // Plattform
    var plate = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.012, 0.115), mat);
    plate.position.set(hub.x + 0.015, 0.735, 0);
    plate.rotation.z = -0.05;
    plate.castShadow = true;
    g.add(plate);
    // Laengsstreben
    [1, -1].forEach(function (s) {
      g.add(curvedTube([
        V(hub.x + 0.16, 0.742, s * 0.052),
        V(hub.x - 0.02, 0.732, s * 0.058),
        V(hub.x - 0.135, 0.712, s * 0.055),
        V(hub.x - 0.155, 0.66, s * 0.05)
      ], 0.006, mat, 20));
      // Streben nach unten zum Ausfallende
      g.add(tube(V(hub.x - 0.15, 0.66, s * 0.05), V(hub.x + 0.005, hub.y + 0.005, s * 0.062), 0.005, 0.005, mat, 8));
      // Streben nach vorn zur Sitzstrebe
      g.add(tube(V(hub.x + 0.16, 0.742, s * 0.05), V(mt.seatStayTop.x - 0.075, mt.seatStayTop.y - 0.04, s * 0.035), 0.005, 0.005, mat, 8));
    });
    // Querstrebe
    g.add(tube(V(hub.x - 0.15, 0.662, -0.05), V(hub.x - 0.15, 0.662, 0.05), 0.005, 0.005, mat, 8));
    return g;
  };

  A.rack21 = function (M, mt) { return A.rack(M, mt); };

  /* ------------------------- Gepaecktaschen ------------------------------- */
  A.panniers = function (M, mt, o) {
    var g = new THREE.Group();
    var F = (o && o.color) ? M.fabricColor(o.color) : M.fabric;
    var FD = (o && o.color) ? M.fabricColor(o.color, true) : M.fabricDark;
    var hub = mt.rearHub;
    [1, -1].forEach(function (s) {
      var bag = roundedBox(0.30, 0.30, 0.11, 0.03, F);
      bag.position.set(hub.x + 0.01, 0.56, s * 0.125);
      g.add(bag);
      var flap = roundedBox(0.30, 0.075, 0.115, 0.025, FD);
      flap.position.set(hub.x + 0.01, 0.70, s * 0.125);
      g.add(flap);
      var hook = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.018, 0.02), M.black);
      hook.position.set(hub.x + 0.01, 0.727, s * 0.075);
      g.add(hook);
    });
    return g;
  };

  /* --------------------------- Schutzbleche ------------------------------- */
  A.mudguards = function (M, mt) {
    var g = new THREE.Group();
    var R = mt.wheelRadius + 0.026;
    var W = mt.tireWidth + 0.030;

    // Hinten: von oben nach hinten unten
    var rear = arcShell(R, W, Math.PI * 0.52, Math.PI * 0.96, M.black, 0.013);
    rear.position.copy(mt.rearHub);
    g.add(rear);
    // Front: ueber dem Vorderrad
    var front = arcShell(R, W, Math.PI * 0.66, Math.PI * 0.72, M.black, 0.013);
    front.position.copy(mt.frontHub);
    g.add(front);

    // Streben
    [1, -1].forEach(function (s) {
      g.add(tube(V(mt.rearHub.x, mt.rearHub.y, s * 0.055),
        V(mt.rearHub.x - 0.24, mt.rearHub.y + 0.20, s * 0.035), 0.0032, 0.0032, M.steel, 6));
      g.add(tube(V(mt.rearHub.x, mt.rearHub.y, s * 0.055),
        V(mt.rearHub.x + 0.22, mt.rearHub.y + 0.24, s * 0.03), 0.0028, 0.0028, M.steel, 6));
      g.add(tube(V(mt.frontHub.x, mt.frontHub.y, s * 0.05),
        V(mt.frontHub.x - 0.04, mt.frontHub.y + 0.33, s * 0.03), 0.0028, 0.0028, M.steel, 6));
      g.add(tube(V(mt.frontHub.x, mt.frontHub.y, s * 0.05),
        V(mt.frontHub.x + 0.19, mt.frontHub.y + 0.26, s * 0.03), 0.0028, 0.0028, M.steel, 6));
    });
    return g;
  };

  /* ---------------------------- Beleuchtung ------------------------------- */
  function frontLightMesh(M, mt) {
    var g = new THREE.Group();
    var pos = mt.bar.clone().add(V(0.035, -0.005, 0.0));
    var body = roundedBox(0.052, 0.05, 0.032, 0.012, M.blackGloss);
    body.position.copy(pos);
    g.add(body);
    var lens = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.008, 20), M.glassWhite);
    lens.rotation.z = Math.PI / 2;
    lens.position.copy(pos).add(V(0.028, 0.002, 0));
    g.add(lens);
    var strap = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.004, 6, 16), M.black);
    strap.position.copy(mt.bar);
    g.add(strap);
    return g;
  }

  function rearLightMesh(M, mt) {
    var g = new THREE.Group();
    var pos = mt.seatpost.top.clone().add(V(-0.022, -0.10, 0));
    var body = roundedBox(0.026, 0.044, 0.026, 0.008, M.blackGloss);
    body.position.copy(pos);
    g.add(body);
    var lens = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.03, 0.022), M.glassRed);
    lens.position.copy(pos).add(V(-0.016, 0, 0));
    g.add(lens);
    var clamp = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.004, 6, 16), M.black);
    clamp.position.copy(mt.seatpost.top).add(V(0, -0.10, 0));
    clamp.rotation.x = Math.PI / 2;
    g.add(clamp);
    return g;
  }

  A.frontlight = function (M, mt) { return frontLightMesh(M, mt); };
  A.rearlight = function (M, mt) { return rearLightMesh(M, mt); };
  A.lightset = function (M, mt) {
    var g = new THREE.Group();
    g.add(frontLightMesh(M, mt));
    g.add(rearLightMesh(M, mt));
    return g;
  };

  /* -------------------------- Fahrradstaender ----------------------------- */
  A.kickstand = function (M, mt) {
    var g = new THREE.Group();
    var base = V(mt.bb.x - 0.11, mt.bb.y - 0.02, -0.058);
    var bracket = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.03), M.aluDark);
    bracket.position.copy(base);
    g.add(bracket);
    var footPos = V(base.x - 0.055, 0.012, -0.16);
    g.add(tube(base, footPos, 0.009, 0.008, M.aluDark, 10));
    var foot = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.012, 0.022), M.black);
    foot.position.copy(footPos);
    foot.rotation.z = 0.2;
    g.add(foot);
    return g;
  };

  /* --------------------------- Flaschenhalter ----------------------------- */
  A.bottlecage = function (M, mt) {
    var g = new THREE.Group();
    var a = mt.downTube.a, b = mt.downTube.b;
    var base = new THREE.Vector3().lerpVectors(a, b, 0.42);
    var dir = new THREE.Vector3().subVectors(b, a).normalize();
    var normal = V(-dir.y, dir.x, 0).normalize();

    var group = new THREE.Group();
    group.position.copy(base).addScaledVector(normal, 0.035);
    var ang = Math.atan2(dir.y, dir.x) - Math.PI / 2;
    group.rotation.z = ang;

    // Flasche
    var bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.034, 0.19, 24), M.bottle);
    bottle.castShadow = true;
    group.add(bottle);
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.03, 0.035, 20), M.bottle);
    neck.position.y = 0.112;
    group.add(neck);
    var lid = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.022, 18), M.black);
    lid.position.y = 0.138;
    group.add(lid);

    // Halter
    [0.06, -0.055].forEach(function (y) {
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.039, 0.0035, 8, 24, Math.PI * 1.5), M.aluDark);
      ring.rotation.x = Math.PI / 2;
      ring.rotation.z = -Math.PI * 0.25;
      ring.position.y = y;
      group.add(ring);
    });
    group.add(new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.14, 0.008), M.aluDark));

    g.add(group);
    return g;
  };

  /* ------------------------- Handyhalterung ------------------------------- */
  A.phonemount = function (M, mt) {
    var g = new THREE.Group();
    var pos = new THREE.Vector3().lerpVectors(mt.stemStart, mt.bar, 0.55).add(V(0.005, 0.03, 0));
    g.add(tube(pos.clone().add(V(0, -0.035, 0)), pos, 0.008, 0.008, M.black, 8));
    var holder = new THREE.Group();
    holder.position.copy(pos).add(V(0.012, 0.028, 0));
    holder.rotation.z = -0.45;
    var body = roundedBox(0.115, 0.075, 0.010, 0.012, M.black);
    body.rotation.z = Math.PI / 2;
    holder.add(body);
    var screen = new THREE.Mesh(new THREE.BoxGeometry(0.062, 0.10, 0.003), M.screen);
    screen.position.z = 0.008;
    holder.add(screen);
    g.add(holder);
    return g;
  };

  /* ------------------------------ Schloss --------------------------------- */
  A.lock = function (M, mt) {
    var g = new THREE.Group();
    var a = mt.downTube.a, b = mt.downTube.b;
    var base = new THREE.Vector3().lerpVectors(a, b, 0.72);
    var dir = new THREE.Vector3().subVectors(b, a).normalize();
    var normal = V(dir.y, -dir.x, 0).normalize();
    var holder = new THREE.Group();
    holder.position.copy(base).addScaledVector(normal, 0.048);
    holder.rotation.z = Math.atan2(dir.y, dir.x);
    var body = roundedBox(0.20, 0.055, 0.045, 0.012, M.black);
    holder.add(body);
    var plates = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.04, 0.03), M.aluDark);
    holder.add(plates);
    var cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.03, 16), M.aluDark);
    cyl.rotation.x = Math.PI / 2;
    cyl.position.set(-0.085, 0, 0);
    holder.add(cyl);
    g.add(holder);
    return g;
  };

  global.CubeAccessoryBuilder = {
    build: function (id, M, mounts, opts) {
      return A[id] ? A[id](M, mounts, opts || {}) : null;
    },
    has: function (id) { return !!A[id]; }
  };
})(window);
