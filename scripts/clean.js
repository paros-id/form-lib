const rmdir = require("rimraf");
rmdir("dist")
    .then(() => console.log("Cleaned up dist directory."))
    .catch(console.error);
