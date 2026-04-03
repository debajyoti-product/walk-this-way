const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'components');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  // Replace inline occurrences: `fontWeight: 'bold', ` or `fontWeight: 'bold'`
  content = content.replace(/fontWeight:\s*['"](?:bold|600)['"],?\s*/g, '');
  
  if (content !== original) {
    console.log(`Updated ${file}`);
    fs.writeFileSync(file, content);
  }
});
