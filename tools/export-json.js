/* Erzeugt data/bikes.json und data/accessories.json aus den .js-Datendateien.
   Aufruf:  node tools/export-json.js     */
const fs = require('fs'), vm = require('vm'), path = require('path');
const root = path.join(__dirname, '..');
const sandbox = { window: {} }; sandbox.window = sandbox;
vm.createContext(sandbox);
['data/bikes.js', 'data/accessories.js'].forEach(f =>
  vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f }));
fs.writeFileSync(path.join(root, 'data/bikes.json'),
  JSON.stringify({ meta: sandbox.CUBE_BIKES_META, bikes: sandbox.CUBE_BIKES }, null, 2));
fs.writeFileSync(path.join(root, 'data/accessories.json'),
  JSON.stringify({ meta: sandbox.CUBE_ACCESSORIES_META, accessories: sandbox.CUBE_ACCESSORIES }, null, 2));
console.log('data/bikes.json und data/accessories.json aktualisiert.');
