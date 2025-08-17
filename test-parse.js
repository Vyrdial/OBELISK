const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');

const JSXParser = acorn.Parser.extend(jsx());

try {
  const content = fs.readFileSync('/Users/noahedery/Desktop/obelisk/src/components/sandbox/LogicGateWorkspace.tsx', 'utf8');
  
  // Remove TypeScript types for basic parsing
  const jsContent = content
    .replace(/: \w+(\[\])?/g, '') // Remove type annotations
    .replace(/<\w+>/g, '') // Remove generic types
    .replace(/as \w+/g, '') // Remove type assertions
    .replace(/\?\./g, '.') // Replace optional chaining
    .replace(/interface .+?\{[\s\S]*?\}/g, '') // Remove interfaces
    .replace(/type .+? = .+?;/g, ''); // Remove type aliases
  
  JSXParser.parse(jsContent, {
    sourceType: 'module',
    ecmaVersion: 2020
  });
  console.log('Parse successful!');
} catch (e) {
  console.log('Parse error:', e.message);
  console.log('Location:', e.loc);
}