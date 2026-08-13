import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const caseFiles = [
  '01-sales-sedan-fuel-preset-price.ts',
  '02-sales-suv-hybrid.ts',
  '03-new-energy-suv-pure-electric-preset-price.ts',
  '04-price-drop-mpv-new-energy-custom-price.ts',
  '05-switch-and-reset.ts',
];

for (const caseFile of caseFiles) {
  const casePath = fileURLToPath(new URL(caseFile, import.meta.url));
  console.log(`\n开始执行 ${caseFile}`);

  const result = spawnSync(
    process.execPath,
    ['--import', 'tsx', casePath],
    {
      env: process.env,
      stdio: 'inherit',
    },
  );

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    console.error(`${caseFile} 执行失败，停止后续 Case。`);
    process.exit(result.status ?? 1);
  }
}

console.log('\n5 个排行榜筛选 Case 全部通过。');
