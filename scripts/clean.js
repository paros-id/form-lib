const rmdir = require("rimraf");
rmdir("dist", (err) => {
    if(err) return console.error(err);
    console.log("Cleaned up dist directory.");
});
