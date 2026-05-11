const fs = require('fs');
const path = require('path');

const srcDir = 'c:/BEWT_Sem_4/Resource-Project/Frontend/src';

function replaceInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const updated = content.replace(/localhost:5001/g, 'localhost:5000');
    if (content !== updated) {
        fs.writeFileSync(filePath, updated);
        console.log(`Updated: ${filePath}`);
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            replaceInFile(fullPath);
        }
    });
}

traverse(srcDir);
