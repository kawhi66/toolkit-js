import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { getConfig, validateConfig } from './config';
import { getPackages } from '@lerna/project';
import { PackageGraph } from '@lerna/package-graph';
import * as assert from 'assert';
import buildTask from './build';
import transformTask from './transform';

/**
 * TODO
 *  - esbuild
 */

const dispose = [];

export async function build(opts) {
  const cwd = opts.cwd || process.cwd();
  const userConfigs = getConfig({ cwd });

  for (let userConfig of userConfigs) {
    validateConfig(userConfig, { cwd });
    userConfig = { ...userConfig, ...opts, cwd, dispose };

    if (userConfig.transform) {
      await transformTask(userConfig);
    }

    if (userConfig.type) {
      await buildTask(userConfig);
    }
  }
}

export default async function (args) {
  const cwd = process.cwd();
  const isLerna = existsSync(join(cwd, 'lerna.json'));

  if (isLerna) {
    // 参考 https://github.com/lerna/lerna/blob/main/utils/symlink-dependencies/symlink-dependencies.js
    const packages = await getPackages(cwd);
    const packageGraph = new PackageGraph(packages, 'allDependencies');
    const cacheNodes = [];

    // build lerna package recursively
    const buildNode = async function (node) {
      if (node.localDependencies.size) {
        for (const [dependencyName, resolved] of node.localDependencies) {
          if (resolved.type === 'directory') {
            // a local file: specifier is already a symlink
            continue;
          }

          const dependencyNode = packageGraph.get(dependencyName);
          await buildNode(dependencyNode);
        }
      }

      // get PackageGraphNode of dependency
      const dependencyName = node.name;
      const dependencyNode = packageGraph.get(dependencyName);
      const dependencyLocation = dependencyNode.pkg.contents
        ? resolve(dependencyNode.location, dependencyNode.pkg.contents)
        : dependencyNode.location;

      if (cacheNodes.includes(dependencyName)) return;
      cacheNodes.push(dependencyName);

      assert.ok(
        existsSync(join(dependencyLocation, 'package.json')),
        `package.json not found in ${dependencyName}`,
      );
      process.chdir(dependencyLocation);
      await build({ ...args, cwd: dependencyLocation, rootPath: cwd });
    };

    for (const node of packageGraph.values()) {
      if (cacheNodes.includes(node.name)) continue;
      await buildNode(node);
    }
  } else {
    await build({ ...args, cwd });
  }

  return () => dispose.forEach((e) => e());
}
