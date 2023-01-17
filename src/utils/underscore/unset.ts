type Key = string | number | symbol;

const unset = <T>(obj: T, path: Key | Key[]) => {
    // Regex explained: https://regexr.com/58j0k
    const pathArray = Array.isArray(path) ? path : path.toString().match(/([^[.\]])+/g) as string[];

    pathArray.reduce((acc, key, i) => {
        if (i === pathArray.length - 1) delete acc[key];
        return acc[key];
    }, obj);
}

export default unset;
