const { spawnSync } = require('node:child_process');
const options = [process.env.NODE_OPTIONS || '', '--openssl-legacy-provider'].join(' ').trim();
const result = spawnSync(process.execPath, [require.resolve('./build-worker.cjs')], {
  stdio: 'inherit', env: { ...process.env, NODE_OPTIONS: options }, windowsHide: true
});
process.exit(result.status === null ? 1 : result.status);
