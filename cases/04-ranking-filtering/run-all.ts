import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const caseFiles = [
  '01-sales-sedan-fuel-preset-price.ts',
  '02-sales-suv-hybrid.ts',
  '03-new-energy-suv-pure-electric-preset-price.ts',
  '04-price-drop-mpv-new-energy-custom-price.ts',
  '05-switch-and-reset.ts',
];

interface CaseResult {
  caseFile: string;
  passed: boolean;
  detail?: string;
}

const results: CaseResult[] = [];

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
    console.error(`${caseFile} 无法执行：${result.error.message}`);
    results.push({
      caseFile,
      passed: false,
      detail: result.error.message,
    });
    continue;
  }

  const passed = result.status === 0;
  results.push({
    caseFile,
    passed,
    detail: passed
      ? undefined
      : result.signal
        ? `signal ${result.signal}`
        : `exit code ${result.status ?? 1}`,
  });
  console.log(
    passed
      ? `${caseFile} 执行通过。`
      : `${caseFile} 执行失败，继续执行后续 Case。`,
  );
}

const passedCount = results.filter((result) => result.passed).length;
const failedCount = results.length - passedCount;

console.log('\n排行榜筛选 Case 执行汇总：');
for (const result of results) {
  console.log(
    `- ${result.passed ? '通过' : '失败'}：${result.caseFile}${result.detail ? `（${result.detail}）` : ''}`,
  );
}
console.log(
  `\n共 ${results.length} 个 Case：通过 ${passedCount} 个，失败 ${failedCount} 个。`,
);

if (failedCount > 0) {
  process.exitCode = 1;
}
