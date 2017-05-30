const {
  FuseBox,
  SassPlugin,
  CSSPlugin,
  EnvPlugin,
  Sparky
} = require("fuse-box");

const { spawn } = require("child_process");
const isDev = process.env.NODE_ENV === "development";

Sparky.task("copy-html", () => {
  return Sparky.src("src/index.html").dest("dist/$name");
});

Sparky.task("default", ["copy-html"], () => {
  const fuse = FuseBox.init({
    homeDir: "src",
    output: "dist/$name.js"
  });

  if (isDev) {
    // development server for hot reload
    fuse.dev({ port: 4445, httpServer: false });

    fuse
      .bundle("app")
      .target("electron")
      .plugin(SassPlugin(), CSSPlugin({ group: "bundle.css" }))
      .watch()
      .hmr()
      .instructions(" > [index.ts]"); // it's import to isolate like this []
    return fuse.run().then(() => {
      // launch the app
      spawn("node", [`${__dirname}/node_modules/electron/cli.js`, __dirname]);
    });
  } else {
    // bundle app for production (with dependencies)
    fuse
      .bundle("index")
      .target("electron")
      .plugin(EnvPlugin({ NODE_ENV: process.env.NODE_ENV }))
      .instructions("> index.ts");

    return fuse.run();
  }
});
