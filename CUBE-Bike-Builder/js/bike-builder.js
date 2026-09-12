/* =============================================================================
   Prozedurales 3D-Fahrradmodell (Gravelbike im Stil der CUBE Nuroad Geometrie)
   -----------------------------------------------------------------------------
   Alle Geometrie wird zur Laufzeit aus Grundkoerpern erzeugt. Es werden KEINE
   fremden/urheberrechtlich geschuetzten 3D-Dateien geladen. Die Proportionen
   orientieren sich an oeffentlich verfuegbaren Geometrieangaben eines
   28"-Gravelbikes (Radstand ~1,03 m, 45 mm Reifen, Gravel-Comfort-Sitzposition).

   buildBike(options) -> { group, mounts, dispose() }
============================================================================= */
(function (global) {
  'use strict';

  var V = function (x, y, z) { return new THREE.Vector3(x, y, z || 0); };

  /* ---- Hilfsfunktionen ---------------------------------------------------- */

  function tube(a, b, r1, r2, mat, seg) {
    var dir = new THREE.Vector3().subVectors(b, a);
    var len = dir.length();
    var g = new THREE.CylinderGeometry(r2, r1, len, seg || 20, 1, false);
    var m = new THREE.Mesh(g, mat);
    m.position.copy(a).addScaledVector(dir, 0.5);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize());
    m.castShadow = true;
    return m;
  }

  function curvedTube(points, r, mat, tubularSeg) {
    var curve = new THREE.CatmullRomCurve3(points);
    var g = new THREE.TubeGeometry(curve, tubularSeg || 24, r, 14, false);
    var m = new THREE.Mesh(g, mat);
    m.castShadow = true;
    return m;
  }

  function cap(pos, r, mat) {
    var m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat);
    m.position.copy(pos);
    m.castShadow = true;
    return m;
  }

  function ringBand(a, b, t, r, mat) {
    // Farbring / Dekor auf einem Rohr (t = 0..1 Position, r = Radius)
    var p = new THREE.Vector3().lerpVectors(a, b, t);
    var dir = new THREE.Vector3().subVectors(b, a).normalize();
    var m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.05, 20, 1, true), mat);
    m.position.copy(p);
    m.quaternion.setFromUnitVectors(V(0, 1, 0), dir);
    return m;
  }

  /* ---- Laufrad ------------------------------------------------------------ */

  function buildWheel(M, opts) {
    var g = new THREE.Group();
    var rimR = opts.rimRadius, tireR = opts.tireRadius, tireW = opts.tireWidth;
    var tubeR = (tireR - rimR + tireW * 0.5) * 0.5 + 0.004;
    var torusR = tireR - tubeR;

    // Reifen
    var tire = new THREE.Mesh(new THREE.TorusGeometry(torusR, tubeR, 18, 72), M.rubber);
    tire.castShadow = true;
    g.add(tire);

    // Felge (Aussenwand + Flanken)
    var rimOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(rimR, rimR, tireW * 0.62, 72, 1, true), M.aluDark);
    rimOuter.rotation.x = Math.PI / 2;
    g.add(rimOuter);
    var rimInner = new THREE.Mesh(
      new THREE.CylinderGeometry(rimR - 0.021, rimR - 0.021, tireW * 0.5, 64, 1, true), M.aluDark);
    rimInner.rotation.x = Math.PI / 2;
    g.add(rimInner);
    var rimFaceGeo = new THREE.RingGeometry(rimR - 0.022, rimR, 72);
    [1, -1].forEach(function (s) {
      var f = new THREE.Mesh(rimFaceGeo, M.alu);
      f.position.z = s * tireW * 0.31;
      if (s < 0) f.rotation.y = Math.PI;
      g.add(f);
    });

    // Nabe
    var hub = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.019, 0.098, 20), M.alu);
    hub.rotation.x = Math.PI / 2;
    hub.castShadow = true;
    g.add(hub);
    [1, -1].forEach(function (s) {
      var fl = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.024, 0.008, 20), M.alu);
      fl.rotation.x = Math.PI / 2;
      fl.position.z = s * 0.032;
      g.add(fl);
    });

    // Speichen
    var spokeGeo = new THREE.CylinderGeometry(0.0011, 0.0011, 1, 5);
    var n = opts.spokes || 24;
    for (var i = 0; i < n; i++) {
      var side = (i % 2 === 0) ? 1 : -1;
      var aAng = (i / n) * Math.PI * 2;
      var bAng = aAng + side * 0.42;
      var from = V(Math.cos(aAng) * 0.026, Math.sin(aAng) * 0.026, side * 0.032);
      var to = V(Math.cos(bAng) * (rimR - 0.008), Math.sin(bAng) * (rimR - 0.008), 0);
      var d = new THREE.Vector3().subVectors(to, from);
      var sp = new THREE.Mesh(spokeGeo, M.steel);
      sp.scale.y = d.length();
      sp.position.copy(from).addScaledVector(d, 0.5);
      sp.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
      g.add(sp);
    }

    // Bremsscheibe (Center-Lock Optik)
    var rotorR = opts.rotorRadius;
    var rotor = new THREE.Mesh(new THREE.RingGeometry(rotorR * 0.55, rotorR, 64), M.rotor);
    rotor.position.z = -0.045;
    g.add(rotor);
    var rotorArms = new THREE.Mesh(new THREE.RingGeometry(0.022, rotorR * 0.56, 10), M.rotor);
    rotorArms.position.z = -0.045;
    g.add(rotorArms);
    var lockring = new THREE.Mesh(new THREE.CylinderGeometry(0.023, 0.023, 0.008, 18), M.aluDark);
    lockring.rotation.x = Math.PI / 2;
    lockring.position.z = -0.045;
    g.add(lockring);

    // Ventil
    var valve = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.03, 8), M.aluDark);
    valve.position.set(0, rimR - 0.005, 0);
    g.add(valve);

    return g;
  }

  /* ---- Antrieb: Kettenblaetter, Kassette, Schaltwerk, animierte Kette ------ */

  var PITCH = 0.0127;                       // Kettenteilung 1/2"
  function teethRadius(t) { return t * PITCH / (2 * Math.PI); }

  /* Aeussere Tangente zweier Kreise -> obere und untere Beruehrwinkel */
  function extTangent(c1, r1, c2, r2) {
    var dx = c2.x - c1.x, dy = c2.y - c1.y;
    var D = Math.sqrt(dx * dx + dy * dy) || 1e-6;
    var a = Math.atan2(dy, dx);
    var th = Math.acos(Math.max(-1, Math.min(1, (r1 - r2) / D)));
    var o1 = { a1: a + th, a2: a + th }, o2 = { a1: a - th, a2: a - th };
    var y1 = c1.y + r1 * Math.sin(o1.a1), y2 = c1.y + r1 * Math.sin(o2.a1);
    return y1 >= y2 ? { upper: o1, lower: o2 } : { upper: o2, lower: o1 };
  }

  function arcPoints(cx, cy, r, a0, a1, ccw, z, n) {
    if (ccw) { while (a1 < a0) a1 += Math.PI * 2; }
    else { while (a1 > a0) a1 -= Math.PI * 2; }
    var out = [];
    n = n || Math.max(4, Math.round(Math.abs(a1 - a0) / 0.25));
    for (var i = 0; i <= n; i++) {
      var a = a0 + (a1 - a0) * (i / n);
      out.push(V(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z));
    }
    return out;
  }

  function straight(p0, p1, n) {
    var out = [];
    for (var i = 1; i < n; i++) out.push(new THREE.Vector3().lerpVectors(p0, p1, i / n));
    return out;
  }

  /* Kette aus Einzelgliedern entlang eines geschlossenen Pfades */
  function Chain(M, max) {
    this.max = max || 140;
    var plate = new THREE.BoxGeometry(0.0108, 0.0058, 0.0018);
    var roller = new THREE.CylinderGeometry(0.0027, 0.0027, 0.0072, 8);
    roller.rotateX(Math.PI / 2);
    this.plates = new THREE.InstancedMesh(plate, M.chain, this.max);
    this.rollers = new THREE.InstancedMesh(roller, M.chainDark, this.max);
    this.plates.frustumCulled = this.rollers.frustumCulled = false;
    this.plates.castShadow = true;
    this.group = new THREE.Group();
    this.group.add(this.plates, this.rollers);
    this.offset = 0;
    this._m = new THREE.Matrix4();
    this._x = new THREE.Vector3(); this._y = new THREE.Vector3(); this._z = new THREE.Vector3();
  }
  Chain.prototype.setPath = function (points) {
    this.curve = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5);
    this.length = this.curve.getLength();
    this.count = Math.min(this.max, Math.max(24, Math.round(this.length / PITCH)));
    this.plates.count = this.count;
    this.rollers.count = this.count;
    this.refresh();
  };
  Chain.prototype.refresh = function () {
    if (!this.curve) return;
    var zAxis = V(0, 0, 1);
    for (var i = 0; i < this.count; i++) {
      var u = ((i / this.count) + this.offset) % 1;
      if (u < 0) u += 1;
      var p = this.curve.getPointAt(u);
      var t = this.curve.getTangentAt(u).normalize();
      this._x.copy(t);
      this._y.copy(zAxis).cross(this._x).normalize();
      this._z.copy(this._x).cross(this._y).normalize();
      this._m.makeBasis(this._x, this._y, this._z);
      this._m.setPosition(p);
      this.plates.setMatrixAt(i, this._m);
      this.rollers.setMatrixAt(i, this._m);
    }
    this.plates.instanceMatrix.needsUpdate = true;
    this.rollers.instanceMatrix.needsUpdate = true;
  };
  Chain.prototype.advance = function (du) {
    this.offset = (this.offset + du) % 1;
    this.refresh();
  };

  function buildDrivetrain(M, P, opts) {
    var bb = P.bb, hub = P.rearHub;
    var rings = opts.chainrings.slice();     // absteigend, z.B. [48,31]
    var cogs = opts.cassette.slice();        // absteigend, z.B. [36,...,11]
    var g = new THREE.Group();

    var ringZ = rings.length > 1 ? [0.0505, 0.0385] : [0.0455];
    var cogZ = cogs.map(function (_, i) { return 0.0205 + i * 0.0038; });

    /* --- Kurbelgarnitur (dreht sich) --- */
    var crank = new THREE.Group();
    crank.position.copy(bb);
    g.add(crank);

    rings.forEach(function (t, i) {
      var r = teethRadius(t);
      var body = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.97, r * 0.97, 0.0028, 64), M.alu);
      body.rotation.x = Math.PI / 2;
      body.position.z = ringZ[i];
      crank.add(body);
      // Zaehne einzeln (sichtbar, ohne die Polyzahl zu sprengen)
      var toothGeo = new THREE.BoxGeometry(0.0042, 0.0075, 0.0026);
      var teeth = new THREE.InstancedMesh(toothGeo, M.alu, t);
      var m = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), sc = V(1, 1, 1);
      for (var k = 0; k < t; k++) {
        var a = (k / t) * Math.PI * 2;
        pos.set(Math.cos(a) * (r + 0.0022), Math.sin(a) * (r + 0.0022), ringZ[i]);
        q.setFromAxisAngle(V(0, 0, 1), a + Math.PI / 2);
        m.compose(pos, q, sc);
        teeth.setMatrixAt(k, m);
      }
      teeth.frustumCulled = false;
      crank.add(teeth);
      // Spider
      var spider = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.42, r * 0.42, 0.0042, 5), M.aluDark);
      spider.rotation.x = Math.PI / 2;
      spider.position.z = ringZ[i] - 0.004;
      crank.add(spider);
    });

    [[1, 0], [-1, Math.PI]].forEach(function (c) {
      var side = c[0], ang = c[1], armLen = 0.1725;
      var arm = new THREE.Mesh(new THREE.BoxGeometry(armLen, 0.028, 0.014), M.aluDark);
      arm.position.set(Math.cos(ang) * armLen / 2, Math.sin(ang) * armLen / 2, side * 0.062);
      arm.rotation.z = ang;
      arm.castShadow = true;
      crank.add(arm);
      var pedal = new THREE.Group();
      pedal.position.set(Math.cos(ang) * armLen, Math.sin(ang) * armLen, side * 0.062);
      var pin = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.035, 10), M.steel);
      pin.rotation.x = Math.PI / 2;
      pin.position.z = side * 0.016;
      pedal.add(pin);
      var body = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.016, 0.062), M.black);
      body.position.z = side * 0.032;
      body.castShadow = true;
      pedal.add(body);
      pedal.userData.keepLevel = true;      // Pedal bleibt waagerecht
      crank.add(pedal);
    });
    var axle = new THREE.Mesh(new THREE.CylinderGeometry(0.0125, 0.0125, 0.15, 16), M.alu);
    axle.rotation.x = Math.PI / 2;
    axle.position.copy(bb);
    g.add(axle);

    /* --- Kassette (dreht sich mit dem Laufrad) --- */
    var cassette = new THREE.Group();
    cassette.position.copy(hub);
    g.add(cassette);
    cogs.forEach(function (t, i) {
      var r = teethRadius(t);
      var disc = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.94, r * 0.94, 0.0016, 44), M.steel);
      disc.rotation.x = Math.PI / 2;
      disc.position.z = cogZ[i];
      cassette.add(disc);
      var teeth = new THREE.Mesh(new THREE.TorusGeometry(r - 0.0015, 0.0022, 5, Math.min(64, Math.max(16, t))), M.steel);
      teeth.position.z = cogZ[i];
      cassette.add(teeth);
    });
    var freehub = new THREE.Mesh(new THREE.CylinderGeometry(0.0165, 0.0165, 0.042, 18), M.aluDark);
    freehub.rotation.x = Math.PI / 2;
    freehub.position.z = 0.038;
    cassette.add(freehub);

    /* --- Schaltwerk --- */
    var rd = new THREE.Group();
    g.add(rd);
    var rdBody = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.052, 0.03), M.blackGloss);
    rdBody.castShadow = true;
    rd.add(rdBody);
    var rdArm = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.055, 0.018), M.blackGloss);
    rdArm.position.set(0.004, -0.04, 0);
    rd.add(rdArm);
    var cage = new THREE.Group();
    cage.position.set(0.006, -0.062, 0);
    rd.add(cage);
    var cagePlate = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.088, 0.004), M.aluDark);
    cagePlate.position.set(0.008, -0.028, 0.006);
    cage.add(cagePlate);
    var pulleyGeo = new THREE.CylinderGeometry(0.0165, 0.0165, 0.007, 20);
    pulleyGeo.rotateX(Math.PI / 2);
    var pulleyTop = new THREE.Mesh(pulleyGeo, M.aluDark);
    var pulleyBot = new THREE.Mesh(pulleyGeo, M.aluDark);
    pulleyBot.position.set(0.016, -0.075, 0);
    cage.add(pulleyTop, pulleyBot);

    /* --- Umwerfer (nur bei 2-fach) --- */
    var fd = null;
    if (rings.length > 1) {
      fd = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.052, 0.038), M.blackGloss);
      g.add(fd);
    }

    /* --- Kette --- */
    var chain = new Chain(M);
    g.add(chain.group);

    var state = { front: 0, rear: Math.max(0, Math.floor(cogs.length / 2)) };

    function pulleyWorld(local) {
      return V(rd.position.x + cage.position.x + local.x,
        rd.position.y + cage.position.y + local.y, rd.position.z + local.z);
    }

    function rebuildChain() {
      var rRing = teethRadius(rings[state.front]);
      var zRing = ringZ[state.front];
      var rCog = teethRadius(cogs[state.rear]);
      var zCog = cogZ[state.rear];

      // Schaltwerk unter das gewaehlte Ritzel setzen
      rd.position.set(hub.x + 0.048, hub.y - rCog - 0.052, zCog + 0.004);
      var gp = V(rd.position.x + cage.position.x, rd.position.y + cage.position.y, rd.position.z);
      var tp = V(gp.x + 0.016, gp.y - 0.075, gp.z);

      if (fd) {
        fd.position.set(bb.x + 0.012, bb.y + rRing + 0.038, zRing + 0.006);
        fd.rotation.z = -0.12;
      }

      var ring2d = { x: bb.x, y: bb.y }, cog2d = { x: hub.x, y: hub.y };
      var tan = extTangent(ring2d, rRing, cog2d, rCog);

      var pts = [];
      // 1) Kettenblatt vorne herum (unterer -> oberer Beruehrpunkt)
      pts = pts.concat(arcPoints(bb.x, bb.y, rRing, tan.lower.a1, tan.upper.a1, true, zRing));
      // 2) Obertrum nach hinten
      var a = pts[pts.length - 1];
      var b = V(hub.x + Math.cos(tan.upper.a2) * rCog, hub.y + Math.sin(tan.upper.a2) * rCog, zCog);
      pts = pts.concat(straight(a, b, 5), [b]);
      // 3) ueber das Ritzel nach hinten unten
      pts = pts.concat(arcPoints(hub.x, hub.y, rCog, tan.upper.a2, 4.36, true, zCog));
      // 4) hinunter zum oberen Schaltroellchen
      a = pts[pts.length - 1];
      b = V(gp.x + Math.cos(2.44) * 0.0165, gp.y + Math.sin(2.44) * 0.0165, gp.z);
      pts = pts.concat(straight(a, b, 3), [b]);
      pts = pts.concat(arcPoints(gp.x, gp.y, 0.0165, 2.44, -1.22, false, gp.z));
      // 5) zum unteren Spannroellchen
      a = pts[pts.length - 1];
      b = V(tp.x + Math.cos(1.75) * 0.0165, tp.y + Math.sin(1.75) * 0.0165, tp.z);
      pts = pts.concat(straight(a, b, 2), [b]);
      pts = pts.concat(arcPoints(tp.x, tp.y, 0.0165, 1.75, 5.06, true, tp.z));
      // 6) Untertrum nach vorn zum Kettenblatt
      a = pts[pts.length - 1];
      b = V(bb.x + Math.cos(tan.lower.a1) * rRing, bb.y + Math.sin(tan.lower.a1) * rRing, zRing);
      pts = pts.concat(straight(a, b, 6));

      chain.setPath(pts);
    }

    rebuildChain();

    return {
      group: g, crank: crank, cassette: cassette, chain: chain,
      rd: rd, cage: cage, fd: fd, state: state,
      gearing: { chainrings: rings, cassette: cogs },
      ratio: function () { return rings[state.front] / cogs[state.rear]; },
      ringRadius: function () { return teethRadius(rings[state.front]); },
      shift: function (which, dir) {
        var changed = false;
        if (which === 'front' && rings.length > 1) {
          var f = Math.min(rings.length - 1, Math.max(0, state.front - dir));
          if (f !== state.front) { state.front = f; changed = true; }
        } else if (which === 'rear') {
          // dir +1 = schwerer (kleineres Ritzel), -1 = leichter
          var r = Math.min(cogs.length - 1, Math.max(0, state.rear + dir));
          if (r !== state.rear) { state.rear = r; changed = true; }
        }
        if (changed) rebuildChain();
        return changed;
      },
      rebuild: rebuildChain
    };
  }

  /* ---- Sattel ------------------------------------------------------------- */

  function buildSaddle(M) {
    // Sattelumriss von oben: schmale Nase vorn, breites Heck
    var s = new THREE.Shape();
    s.moveTo(0.135, 0);
    s.bezierCurveTo(0.125, 0.014, 0.05, 0.032, -0.03, 0.055);
    s.bezierCurveTo(-0.085, 0.072, -0.125, 0.062, -0.128, 0.012);
    s.bezierCurveTo(-0.130, -0.030, -0.100, -0.062, -0.055, -0.070);
    s.bezierCurveTo(-0.010, -0.078, 0.06, -0.040, 0.135, 0);
    var geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.012, bevelEnabled: true, bevelSize: 0.009,
      bevelThickness: 0.011, bevelSegments: 5, curveSegments: 26
    });
    geo.rotateX(-Math.PI / 2);
    var mesh = new THREE.Mesh(geo, M.saddle);
    mesh.castShadow = true;
    var g = new THREE.Group();
    g.add(mesh);
    // Sattelnase leicht angehoben, Heck etwas dicker
    mesh.scale.set(1, 1, 1);
    // Streben und Sattelklemmung
    [1, -1].forEach(function (side) {
      g.add(tube(V(0.055, -0.014, side * 0.020), V(-0.070, -0.020, side * 0.030), 0.0034, 0.0034, M.steel, 8));
    });
    var clamp = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.018, 0.048), M.aluDark);
    clamp.position.set(-0.012, -0.024, 0);
    g.add(clamp);
    return g;
  }

  /* ---- Cockpit ------------------------------------------------------------ */

  function buildCockpit(M, P) {
    var g = new THREE.Group();
    var shifters = [];
    var barY = P.bar.y, barX = P.bar.x, halfW = 0.205;

    // Vorbau
    var stem = tube(P.stemStart, P.bar, 0.019, 0.017, M.aluDark, 14);
    g.add(stem);
    var faceplate = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.042, 0.05), M.aluDark);
    faceplate.position.copy(P.bar);
    g.add(faceplate);

    // Lenkermitte
    var center = tube(V(barX, barY, -halfW * 0.45), V(barX, barY, halfW * 0.45), 0.0125, 0.0125, M.aluDark, 16);
    g.add(center);

    // Dropbar-Buegel je Seite
    [1, -1].forEach(function (side) {
      var z = side * halfW;
      var pts = [
        V(barX, barY, side * halfW * 0.42),
        V(barX + 0.005, barY + 0.006, side * (halfW * 0.8)),
        V(barX + 0.03, barY + 0.008, z),
        V(barX + 0.083, barY - 0.004, z),
        V(barX + 0.098, barY - 0.045, z),
        V(barX + 0.075, barY - 0.085, z),
        V(barX + 0.028, barY - 0.093, z),
        V(barX + 0.006, barY - 0.088, z)
      ];
      g.add(curvedTube(pts, 0.0122, M.aluDark, 40));

      // Lenkerband auf Ober- und Unterlenker
      g.add(curvedTube(pts.slice(1, 4), 0.0135, M.bartape, 18));
      g.add(curvedTube(pts.slice(5), 0.0135, M.bartape, 18));

      // Brems-/Schalthebel
      var hoodBase = V(barX + 0.088, barY - 0.012, z);
      var hood = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.115, 0.032), M.blackGloss);
      hood.position.set(hoodBase.x + 0.012, hoodBase.y + 0.045, z);
      hood.rotation.z = -0.22;
      hood.castShadow = true;
      hood.userData.shifter = side > 0 ? 'rear' : 'front';
      shifters.push(hood);
      g.add(hood);
      var hoodTop = new THREE.Mesh(new THREE.SphereGeometry(0.019, 14, 10), M.blackGloss);
      hoodTop.position.set(hoodBase.x + 0.023, hoodBase.y + 0.1, z);
      hoodTop.scale.set(1, 0.8, 0.85);
      g.add(hoodTop);
      var lever = tube(V(hoodBase.x + 0.026, hoodBase.y + 0.075, z), V(hoodBase.x + 0.03, hoodBase.y - 0.045, z), 0.005, 0.004, M.aluDark, 8);
      lever.scale.z = 0.6;
      lever.userData.shifter = side > 0 ? 'rear' : 'front';
      shifters.push(lever);
      g.add(lever);
      hoodTop.userData.shifter = side > 0 ? 'rear' : 'front';
      shifters.push(hoodTop);
      // Leitung zum Rahmen
      g.add(curvedTube([
        V(hoodBase.x + 0.01, hoodBase.y + 0.09, z),
        V(barX + 0.02, barY + 0.02, z * 0.7),
        V(P.stemStart.x, P.stemStart.y + 0.01, z * 0.15)
      ], 0.0032, M.black, 16));
    });

    return { group: g, shifters: shifters };
  }

  /* ---- Gesamtes Fahrrad --------------------------------------------------- */

  function buildBike(M, cfg) {
    cfg = cfg || {};
    var profile = cfg.profile === 'hpa' ? 'hpa' : 'superlite';
    var hpa = profile === 'hpa';

    var paint = M.paint, accent = M.paintAccent;
    var forkMat = cfg.carbonFork ? M.carbon : M.fork;

    // Eckpunkte der Rahmengeometrie (Meter)
    var P = {
      bb: V(0, 0.278),
      rearHub: V(-0.425, 0.352),
      frontHub: V(0.605, 0.352),
      seatTop: V(hpa ? -0.150 : -0.158, hpa ? 0.812 : 0.800),
      headBottom: V(0.505, 0.615),
      headTop: V(0.455, 0.778)
    };
    P.downTubeHead = new THREE.Vector3().lerpVectors(P.headBottom, P.headTop, 0.32);
    P.seatStayTop = new THREE.Vector3().lerpVectors(P.seatTop, P.bb, 0.10);
    var steer = new THREE.Vector3().subVectors(P.headTop, P.headBottom).normalize();
    P.stemStart = P.headTop.clone().addScaledVector(steer, 0.052);
    P.bar = V(0.556, 0.848);
    var seatDir = new THREE.Vector3().subVectors(P.seatTop, P.bb).normalize();
    P.seatpostTop = P.seatTop.clone().addScaledVector(seatDir, 0.215);

    var group = new THREE.Group();
    var frame = new THREE.Group();

    var rTop = hpa ? 0.0225 : 0.0205;
    var rDown = hpa ? 0.0285 : 0.0255;
    var rSeat = hpa ? 0.0195 : 0.0185;

    // Hauptrahmen
    var topTube = tube(P.seatTop, P.headTop, rTop, rTop * 0.92, paint, 22);
    var downTube = tube(P.bb, P.downTubeHead, rDown * 1.05, rDown * 0.85, paint, 24);
    var seatTube = tube(P.bb, P.seatTop, rSeat * 1.15, rSeat, paint, 20);
    var headTube = tube(P.headBottom, P.headTop, 0.0245, 0.0215, paint, 22);
    frame.add(topTube, downTube, seatTube, headTube);
    frame.add(cap(P.seatTop, rTop * 1.05, paint));
    frame.add(cap(P.bb.clone().setZ(0), 0.026, paint));

    // Dekor / Zweitfarbe
    frame.add(ringBand(P.bb, P.downTubeHead, 0.62, rDown * 0.94, accent));
    frame.add(ringBand(P.bb, P.downTubeHead, 0.72, rDown * 0.90, accent));
    frame.add(ringBand(P.bb, P.seatTop, 0.82, rSeat * 1.06, accent));

    // Tretlagergehaeuse
    var bbShell = new THREE.Mesh(new THREE.CylinderGeometry(0.0225, 0.0225, 0.086, 24), paint);
    bbShell.rotation.x = Math.PI / 2;
    bbShell.position.copy(P.bb);
    bbShell.castShadow = true;
    frame.add(bbShell);

    // Hinterbau
    [1, -1].forEach(function (side) {
      var drop = V(P.rearHub.x, P.rearHub.y, side * 0.058);
      frame.add(curvedTube([
        V(P.bb.x, P.bb.y - 0.004, side * 0.042),
        V(-0.13, P.bb.y + 0.006, side * 0.068),
        V(-0.30, 0.31, side * 0.064),
        drop
      ], 0.0132, paint, 24));
      frame.add(curvedTube([
        V(P.seatStayTop.x, P.seatStayTop.y, side * 0.016),
        V(-0.26, 0.62, side * 0.045),
        drop
      ], 0.0105, paint, 24));
      var dropout = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.03, 0.01), M.aluDark);
      dropout.position.copy(drop);
      frame.add(dropout);
    });

    // Bremssattel hinten
    var rCal = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.062, 0.026), M.aluDark);
    rCal.position.set(P.rearHub.x - 0.062, P.rearHub.y + 0.055, -0.045);
    rCal.rotation.z = 0.5;
    frame.add(rCal);

    // Gabel
    var fork = new THREE.Group();
    var crown = P.headBottom.clone().addScaledVector(steer, -0.028);
    fork.add(tube(P.headBottom.clone().addScaledVector(steer, 0.05), crown, 0.0165, 0.021, forkMat, 16));
    var crownBox = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.035, 0.065), forkMat);
    crownBox.position.copy(crown);
    crownBox.rotation.z = -0.28;
    crownBox.castShadow = true;
    fork.add(crownBox);
    [1, -1].forEach(function (side) {
      fork.add(curvedTube([
        V(crown.x, crown.y - 0.005, side * 0.028),
        V(crown.x + 0.028, crown.y - 0.085, side * 0.046),
        V(crown.x + 0.062, crown.y - 0.175, side * 0.05),
        V(P.frontHub.x, P.frontHub.y, side * 0.05)
      ], 0.0125, forkMat, 26));
      var fd = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.028, 0.012), M.aluDark);
      fd.position.set(P.frontHub.x, P.frontHub.y, side * 0.052);
      fork.add(fd);
    });
    var fCal = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.06, 0.026), M.aluDark);
    fCal.position.set(P.frontHub.x - 0.03, P.frontHub.y + 0.075, -0.045);
    fCal.rotation.z = -0.15;
    fork.add(fCal);
    frame.add(fork);

    // Steuersatz
    var hs = new THREE.Mesh(new THREE.CylinderGeometry(0.0225, 0.0245, 0.018, 22), M.aluDark);
    hs.position.copy(P.headTop);
    hs.quaternion.setFromUnitVectors(V(0, 1, 0), steer);
    frame.add(hs);
    var spacers = new THREE.Mesh(new THREE.CylinderGeometry(0.0165, 0.0165, 0.03, 20), M.black);
    spacers.position.copy(P.headTop).addScaledVector(steer, 0.022);
    spacers.quaternion.setFromUnitVectors(V(0, 1, 0), steer);
    frame.add(spacers);

    // Sattelstuetze + Sattel
    var post = tube(P.seatTop.clone().addScaledVector(seatDir, -0.03), P.seatpostTop, 0.0138, 0.0138, M.blackGloss, 18);
    frame.add(post);
    var saddle = buildSaddle(M);
    saddle.position.copy(P.seatpostTop).add(V(0.008, 0.022, 0));
    saddle.rotation.z = -0.03;
    frame.add(saddle);

    group.add(frame);

    // Laufraeder
    var rotorR = cfg.rotorRadius || 0.09;
    var wheelOpts = {
      rimRadius: 0.311, tireRadius: 0.352, tireWidth: cfg.tireWidth || 0.045,
      spokes: 24, rotorRadius: rotorR
    };
    var wr = buildWheel(M, wheelOpts);
    wr.position.copy(P.rearHub);
    var wf = buildWheel(M, wheelOpts);
    wf.position.copy(P.frontHub);
    group.add(wr, wf);

    // Antrieb mit den tatsaechlichen Zaehnezahlen des Modells
    var drivetrain = buildDrivetrain(M, P, {
      chainrings: (cfg.chainrings && cfg.chainrings.length) ? cfg.chainrings : [40],
      cassette: (cfg.cassette && cfg.cassette.length) ? cfg.cassette
        : [50, 42, 36, 32, 28, 24, 21, 18, 15, 13, 11]
    });
    group.add(drivetrain.group);

    // Cockpit
    var cockpit = buildCockpit(M, P);
    group.add(cockpit.group);

    /* Montagepunkte fuer Zubehoer */
    var mounts = {
      P: P,
      frameTriangle: {
        top: new THREE.Vector3().lerpVectors(P.seatTop, P.headTop, 0.5),
        bottom: new THREE.Vector3().lerpVectors(P.bb, P.downTubeHead, 0.5),
        rear: P.seatTop.clone(), front: P.headTop.clone()
      },
      topTube: { a: P.seatTop.clone(), b: P.headTop.clone() },
      downTube: { a: P.bb.clone(), b: P.downTubeHead.clone() },
      saddle: P.seatpostTop.clone().add(V(0.008, 0.022, 0)),
      seatpost: { top: P.seatpostTop.clone(), dir: seatDir.clone() },
      rearHub: P.rearHub.clone(),
      frontHub: P.frontHub.clone(),
      seatStayTop: P.seatStayTop.clone(),
      bb: P.bb.clone(),
      bar: P.bar.clone(),
      stemStart: P.stemStart.clone(),
      steerDir: steer.clone(),
      wheelRadius: 0.352,
      tireWidth: wheelOpts.tireWidth
    };

    return {
      group: group, mounts: mounts, wheels: [wr, wf],
      rearWheel: wr, frontWheel: wf,
      drivetrain: drivetrain, shifters: cockpit.shifters
    };
  }

  global.CubeBikeBuilder = { build: buildBike, tube: tube, curvedTube: curvedTube };
})(window);
