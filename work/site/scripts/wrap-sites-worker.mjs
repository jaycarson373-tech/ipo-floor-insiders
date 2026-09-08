import { access, copyFile, readFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const serverDirectory = path.resolve('dist/server');
const entryPath = path.join(serverDirectory, 'index.js');
const handlerPath = path.join(serverDirectory, 'vinext-handler.js');
const wrapperSource = `import handler from './vinext-handler.js';

export * from './vinext-handler.js';

export default {
  fetch(request, env, context) {
    return handler(request, env, context);
  },
};
`;

await access(entryPath, constants.R_OK);

const currentEntry = await readFile(entryPath, 'utf8');
if (currentEntry === wrapperSource) {
  process.exit(0);
}

const workerModule = await import(
  `${pathToFileURL(entryPath).href}?sites-check=${Date.now()}`
);
if (
  workerModule.default &&
  typeof workerModule.default === 'object' &&
  typeof workerModule.default.fetch === 'function'
) {
  console.log('Vinext worker already has a Sites-compatible fetch export.');
  process.exit(0);
}

if (typeof workerModule.default !== 'function') {
  throw new TypeError('Vinext worker does not export a request handler.');
}

await copyFile(entryPath, handlerPath);
await writeFile(entryPath, wrapperSource, 'utf8');

console.log('Wrapped Vinext worker with a Sites-compatible fetch export.');
