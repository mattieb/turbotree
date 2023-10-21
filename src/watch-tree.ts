import supportsColor from "supports-color";
import { watch } from "turbowatch";
import { TurbowatchConfigurationInput } from "turbowatch/dist/types.js";
import type { IterableElement } from "type-fest";
import { $, ProcessOutput, chalk } from "zx";
import { buildContext } from "./context.js";
import { defined, isDefined } from "./undefined.js";

export type PackageInfo = Readonly<{
  $: typeof $;
  name: string;
  root: string;
  leaves: readonly string[];
  turboFilterFlags: readonly string[];
}>;

export type KickstartContext = Readonly<{
  $: typeof $;
  turboFilterFlags: readonly string[];
}>;

export type Trigger = IterableElement<TurbowatchConfigurationInput["triggers"]>;

export type WatchExpression = Trigger["expression"];

const message = (text: string) => {
  console.log(chalk.bold(`${chalk.green("==>")} ${text}`));
  console.log();
};

export const watchTree = async (
  root: string,
  makeTriggers: (p: PackageInfo) => readonly Trigger[],
  kickstartCommand?: (k: KickstartContext) => Promise<ProcessOutput>,
) => {
  const ctx = buildContext(root);

  const triggers = ctx.packageGraph.packages
    .map((name) => {
      const leaves = defined(ctx.leavesByPackage[name]);
      const packageInfo: PackageInfo = {
        $,
        name,
        root: defined(ctx.relativePaths[name]),
        leaves,
        turboFilterFlags: ctx.turboFilterFlags(leaves),
      };
      return makeTriggers(packageInfo);
    })
    .reduce((a, t) => a.concat(t), []);

  if (supportsColor.stdout) {
    $.env["FORCE_COLOR"] = "1";
  }

  if (isDefined(kickstartCommand)) {
    message("Kickstarting...");

    const turboFilterFlags = ctx.turboFilterFlags(ctx.allLeaves);
    await kickstartCommand({ $, turboFilterFlags });
  }

  message("Watching...");

  watch({ project: ctx.projectRoot, triggers });
};
