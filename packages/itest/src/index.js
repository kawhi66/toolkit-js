import jest from 'jest';
import { existsSync } from 'fs';
import { join } from 'path';

process.env.NODE_ENV = 'test';

export default async function (opts) {
  const cwd = opts.cwd || process.cwd();
  const jestConfigFile = join(cwd, 'jest.config.js');
  let userJestConfig = {};
  if (existsSync(jestConfigFile)) {
    userJestConfig = require(jestConfigFile);
  }

  const config = {
    rootDir: cwd,
    testEnvironment: 'jsdom',
    setupFiles: [require.resolve('./shim.js')],
    setupFilesAfterEnv: [require.resolve('./jasmine')],
    resolver: require.resolve('jest-pnp-resolver'),
    transform: {
      // process *.vue files with vue-jest
      '^.+\\.vue$': require.resolve(`@vue/vue2-jest`),
      '^.+\\.jsx?$': require.resolve('babel-jest'),
      '^.+\\.tsx?$': require.resolve('ts-jest'),
      '.+\\.(css|styl|less|sass|scss|jpg|jpeg|png|svg|gif|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|avif)$':
        require.resolve('jest-transform-stub'),
    },
    transformIgnorePatterns: ['/node_modules/'],
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'vue'], // tell Jest to handle *.vue files
    // support the same @ -> src alias mapping in source code
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
    },
    // serializer for snapshots
    snapshotSerializers: ['jest-serializer-vue'],
    testMatch: ['**/?*.(spec|test|e2e).(j|t)s?(x)'],
    testPathIgnorePatterns: ['/node_modules/'],
    // https://github.com/facebook/jest/issues/6766
    testURL: 'http://localhost/',
    // 用于设置 jest worker 启动的个数
    ...(process.env.MAX_WORKERS ? { maxWorkers: Number(process.env.MAX_WORKERS) } : {}),
    ...(userJestConfig || {}),
  };

  return new Promise((resolve, reject) => {
    jest
      .runCLI(
        {
          config: JSON.stringify(config),
          ...opts,
        },
        [cwd],
      )
      .then((result) => {
        const { results } = result;
        if (results.success) {
          resolve();
        } else {
          reject(new Error('Jest failed'));
        }
      })
      .catch((e) => {
        console.log(e);
      });
  });
}
