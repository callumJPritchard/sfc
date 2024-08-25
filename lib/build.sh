npx tsc --outFile dist/index.ts --declaration --declarationMap --sourceMap --emitDeclarationOnly --project  tsconfig.json 
npx esbuild src/index.ts  --sourcemap --outfile=dist/index.js 
npx terser dist/index.js --compress "unsafe=true, passes=3" --mangle --module --output dist/index.min.js
# log out the size in bytes of the minified file
ls -l dist/index.min.js | awk '{print $5} {print "bytes"}'