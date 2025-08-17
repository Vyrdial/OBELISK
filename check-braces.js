const fs = require('fs');
const content = fs.readFileSync('/Users/noahedery/Desktop/obelisk/src/components/sandbox/LogicGateWorkspace.tsx', 'utf8');
const lines = content.split('\n');

let depth = 0;
let componentStarted = false;
let componentStartLine = -1;

lines.forEach((line, index) => {
  const lineNum = index + 1;
  
  if (line.includes('export default function LogicGateWorkspace')) {
    componentStarted = true;
    componentStartLine = lineNum;
    console.log(`Component starts at line ${lineNum}`);
  }
  
  // Count braces
  for (let char of line) {
    if (char === '{') depth++;
    if (char === '}') {
      depth--;
      if (componentStarted && depth === 0) {
        console.log(`Component ENDS at line ${lineNum}`);
        componentStarted = false;
      }
    }
  }
  
  if (line.trim().startsWith('return (') && lineNum > 400) {
    console.log(`Return statement at line ${lineNum}, depth: ${depth}, inside component: ${componentStarted}`);
  }
});