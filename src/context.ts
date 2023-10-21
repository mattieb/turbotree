import path from "node:path";
import {
  createPackageGraph,
  getPackageInfos,
  getWorkspaceRoot,
} from "workspace-tools";
import { partial } from "./partial.js";
import { defined, isUndefined } from "./undefined.js";

type Dependents = { [key: string]: string[] };

const getLeaves = (dependents: Dependents, node: string): string[] => {
  const dependent = dependents[node];
  if (isUndefined(dependent)) return [node];
  return dependent
    .map(partial(getLeaves, dependents))
    .reduce((a, d) => a.concat(d), [])
    .reduce((a, d) => (a.includes(d) ? a : a.concat([d])), [] as string[]);
};

const unboundTurboFilterFlags = (
  relativePaths: { [key: string]: string },
  leaves: string[],
) => leaves.map((l) => `--filter=./${relativePaths[l]}`);

export const buildContext = (root: string) => {
  const projectRoot = defined(getWorkspaceRoot(root));
  const packageInfos = getPackageInfos(projectRoot);
  const packageGraph = createPackageGraph(packageInfos);

  const dependents = packageGraph.dependencies.reduce(
    (a, d) => ({
      ...a,
      [d.dependency]: (a[d.dependency] ?? []).concat([d.name]),
    }),
    {} as Dependents,
  );

  const getLeavesFromDependents = partial(getLeaves, dependents);

  const leavesByPackage = Object.fromEntries(
    packageGraph.packages.map((p) => [p, getLeavesFromDependents(p)]),
  );

  const allLeaves = Object.values(leavesByPackage)
    .reduce((a, d) => a.concat(d), [])
    .reduce((a, d) => (a.includes(d) ? a : a.concat([d])), [] as string[]);

  const relativePaths = Object.fromEntries(
    packageGraph.packages.map((p) => [
      p,
      path.relative(
        projectRoot,
        path.dirname(defined(packageInfos[p]).packageJsonPath),
      ),
    ]),
  );

  const turboFilterFlags = partial(unboundTurboFilterFlags, relativePaths);

  return {
    allLeaves,
    leavesByPackage,
    packageGraph,
    projectRoot,
    relativePaths,
    turboFilterFlags,
  };
};
