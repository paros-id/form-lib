import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";
import cjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import dts from "rollup-plugin-dts";
import path from "path";
import fs from "fs";

const packageJson = require("./package.json");
const minimatch = require("minimatch");


const Glob = require("glob");

const dirname = (...dir) => path.join(process.cwd(), ...dir);

const { compilerOptions: { baseUrl, paths }, include, exclude } = require(dirname("tsconfig.build.json"));
function getSourceFiles() {
    let found = [];

    for(const path of include) {
        let files = Glob.sync(path);
        found.push(...files.filter(x => !exclude.find(y => minimatch(x, y))));
    }

    return found;
}

const aliases = Object.entries(paths).map(([ alias, [ destination ] ]) => ({
    find: new RegExp(`${alias.replace("/*", "")}`),
    replacement: path.resolve(process.cwd(), baseUrl, destination.replace("/*", ""))
}));

const sourceSet = getSourceFiles().reduce((set, file) => {
    const ext = path.extname(file);
    const key = file.substring(4, file.length - ext.length);

    return {
        ...set,
        [key]: file
    };
}, {});

console.log(sourceSet);

export default [{
    input: sourceSet,
    output: [{
        dir: "dist",
        format: "cjs",
        sourcemap: true,
    }],
    plugins: [
        alias({
            customResolver: resolve({ extensions: [".d.ts", ".tsx", ".ts", ".json" ] }),
            entries: aliases
        }),
        // peerDepsExternal(),
        // resolve(),
        // cjs(),
        esbuild({
            logLevel: "verbose",
            tsconfig: "tsconfig.build.json"
        }),
        // dts()
    ],
    external: ["react", "react-dom"]
}];