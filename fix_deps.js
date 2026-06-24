const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = 'c:/Users/admin/Desktop/aws-final-project/caresync-app';
const backendServices = [
  'ai-service',
  'appointment-service',
  'auth-service',
  'document-service',
  'notification-service',
  'user-service'
];
const allServices = [...backendServices, 'frontend'];

const overrides = {
  "cross-spawn": "^7.0.5",
  "glob": "^11.1.0",
  "minimatch": "^10.2.1",
  "tar": "^7.5.3"
};

for (const service of allServices) {
  const serviceDir = path.join(rootDir, service);
  
  // 1. Update shared/package.json for backend services
  if (backendServices.includes(service)) {
    const sharedPkgPath = path.join(serviceDir, 'shared', 'package.json');
    if (fs.existsSync(sharedPkgPath)) {
      const sharedPkg = JSON.parse(fs.readFileSync(sharedPkgPath, 'utf8'));
      if (sharedPkg.dependencies && sharedPkg.dependencies['multer']) {
        sharedPkg.dependencies['multer'] = '^2.2.0';
        fs.writeFileSync(sharedPkgPath, JSON.stringify(sharedPkg, null, 2) + '\n');
        console.log(`Updated multer in ${service}/shared/package.json`);
      }
    }
  }

  // 2. Add overrides to main package.json
  const mainPkgPath = path.join(serviceDir, 'package.json');
  if (fs.existsSync(mainPkgPath)) {
    const mainPkg = JSON.parse(fs.readFileSync(mainPkgPath, 'utf8'));
    mainPkg.overrides = { ...(mainPkg.overrides || {}), ...overrides };
    fs.writeFileSync(mainPkgPath, JSON.stringify(mainPkg, null, 2) + '\n');
    console.log(`Added overrides to ${service}/package.json`);
  }

  // 3. Run npm install
  console.log(`Running npm install in ${service}...`);
  try {
    execSync('npm install --package-lock-only', { cwd: serviceDir, stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to run npm install in ${service}`, err.message);
  }
}

console.log('Dependency fix complete!');
