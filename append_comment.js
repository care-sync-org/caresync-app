const fs = require('fs');
const path = require('path');

const filesToEdit = [
    'ai-service/src/server.ts',
    'appointment-service/src/server.ts',
    'auth-service/src/server.ts',
    'document-service/src/server.ts',
    'notification-service/src/server.ts',
    'user-service/src/server.ts',
    'frontend/src/main.tsx'
];

const comment = '\n// Trigger deployment for fresh ECR repositories\n';

for (const relPath of filesToEdit) {
    const fullPath = path.join(__dirname, relPath);
    if (fs.existsSync(fullPath)) {
        fs.appendFileSync(fullPath, comment);
        console.log(`Appended to ${relPath}`);
    } else {
        console.log(`File not found: ${relPath}`);
    }
}
