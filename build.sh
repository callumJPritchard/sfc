npx tsc --outFile dist/index.ts --declaration --declarationMap --sourceMap --emitDeclarationOnly --project  tsconfig.json 
npx esbuild src/index.ts --minify --sourcemap --outfile=dist/index.min.js
npx esbuild src/index.ts  --sourcemap --outfile=dist/index.js 