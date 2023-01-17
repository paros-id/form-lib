const minimatch = require("minimatch");
const { promisify } = require("util");
const cp = require("child_process");
const Glob = require("glob");
const path = require("path");
const fs = require("fs");

const glob = promisify(Glob);
const mkdir = promisify(fs.mkdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const dirname = (...dir) => path.join(process.cwd(), ...dir);

const copy = async(src, dest = src) => {
    const dir = path.dirname(dirname("dist", dest));
    await mkdir(dir, { recursive: true });

    return await new Promise((resolve, reject) => {
        const output = fs.createWriteStream(dirname("dist", dest));
        const input  = fs.createReadStream(dirname(src));
        input.pipe(output);
        input.on("error", reject);
        output.on("error", reject);
        output.on("finish", resolve);
    });
};

const { include, exclude } = require(dirname("tsconfig.build.json"));

async function copySourceFiles() {
    for(const path of include) {
        let files = await glob(path);

        const actions = files.filter(x => {
            return !exclude.find(y => minimatch(x, y));
        }).map(x => {
            return copy(x); // Keep "src" prefix for source maps
        });

        await Promise.all(actions);
    }
}

async function processSourcemaps() {
    let files = await glob("dist/**/*.js.map");

    await Promise.all(files.map(async(file) => {
        const src = (await readFile(file)).toString();
        const json = JSON.parse(src);
        json.sources = json.sources.map(x => {
            let dest = x.substring(3); // Remove the first "../"

            if(!dest.startsWith(".")) {
                dest = `./${dest}`; // Add relative import if not already relative
            }

            return dest;
        });
        return await writeFile(file, JSON.stringify(json));
    }));
}

(async() => {
    console.log("Copying source files for sourcemaps...");
    await copySourceFiles();

    console.log("Post-processing sourcemaps...");
    await processSourcemaps();

    console.log("Copying package.json...");
    await copy("package.json");

    console.log("Publishing...");
    process.stdin.resume();
    cp.spawnSync("npm", ["publish"], {
        cwd: dirname("dist"),
        shell: true,
        stdio: [process.stdin, process.stdout, process.stderr]
    });

    console.log("Done!");
    process.exit(0);
})();