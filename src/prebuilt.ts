import path from "node:path";
import { PackageInfo, WatchExpression } from "./watch-tree.js";

export const tsViteBuild = (p: PackageInfo): WatchExpression => [
  "allof",
  [
    "not",
    [
      "anyof",
      ["dirname", "dist"],
      ["dirname", "node_modules"],
      ["dirname", "lib"],
    ],
  ],
  [
    "anyof",
    [
      "allof",
      ["dirname", p.root],
      ["anyof", ["match", "index.html", "wholename"]],
    ],
    [
      "allof",
      ["dirname", path.join(p.root, "src")],
      ["anyof", ["match", "*.ts", "basename"], ["match", "*.css", "basename"]],
    ],
  ],
];
