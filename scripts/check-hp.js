const fs = require('fs');

const morgrim = JSON.parse(fs.readFileSync('samples/fvtt-Actor-morgrim-6sq926EkPKZuDcYT.json', 'utf8'));
const lemvir = JSON.parse(fs.readFileSync('samples/fvtt-Actor-lemvir-GTsiLmkzfdu8dplo.json', 'utf8'));

console.log('Morgrim HP:', JSON.stringify(morgrim.system.attributes.hp, null, 2));
console.log('Lemvir HP:', JSON.stringify(lemvir.system.attributes.hp, null, 2));
