const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function runBuild() {
  console.log('--- STARTING STABLE BUILD (Tailwind v3 + Vite 5) ---');
  
  try {
    const { build } = await import('vite');
    const { default: react } = await import('@vitejs/plugin-react');

    await build({
      root: process.cwd(),
      base: '/', 
      configFile: false, // ข้ามการโหลดไฟล์อัตโนมัติเพื่อเลี่ยงปัญหา Permission
      plugins: [
        react()
      ],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || ''),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, 'src'),
        },
      },
      build: {
        outDir: 'dist',
        assetsDir: '', 
        emptyOutDir: true,
        minify: 'esbuild',
        reportCompressedSize: false,
        rollupOptions: {
           output: {
             format: 'es',
           }
        }
      }
    });
    console.log('--- BUILD SUCCESSFUL ---');

    console.log('--- COPYING FILES TO ROOT FOR IIS ---');
    const fsNonPromise = require('fs');
    const distPath = path.resolve(__dirname, 'dist');
    const rootPath = path.resolve(__dirname);

    // อ่านรายการไฟล์ใน dist
    const files = fsNonPromise.readdirSync(distPath);
    files.forEach(file => {
      const srcPath = path.join(distPath, file);
      const destPath = path.join(rootPath, file);
      
      // คัดลอกเฉพาะไฟล์ที่จำเป็น (index.html, .js, .css) มาไว้ที่ root
      if (fsNonPromise.statSync(srcPath).isFile()) {
        fsNonPromise.copyFileSync(srcPath, destPath);
        console.log(`Copied: ${file}`);
      }
    });
    console.log('--- DEPLOYMENT TO ROOT COMPLETED ---');

  } catch (error) {
    console.error('--- BUILD FAILED ---');
    console.error(error);
    process.exit(1);
  }
}

runBuild();
