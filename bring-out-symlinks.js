#!/usr/bin/env node

const fs = require("fs-extra");
const stringify = require("json-converters").stringify
const parse = require("json-converters").parse


async function BringOutSymlinks(parentProjectDirectory){

    // Get package.json
    const packageJsonPath = parentProjectDirectory + "/package.json";
    const packageJson = parse(await fs.readFile(packageJsonPath));

    // Get saved symlink paths
    const symlinksJsonPath = parentProjectDirectory + "/symlinks-temp.json";
    const symlinksJson = parse(await fs.readFile(symlinksJsonPath))

    for (var [symlinkDepName, relativeProjectPath] of symlinksJson) {

        // Revert package.json dependency to original symlink path
        packageJson.dependencies[symlinkDepName] = `file:${relativeProjectPath}`

        console.log(`In \"${packageJson.name}\": Symlink package \"${symlinkDepName}\" was reverted`)

    }

    // delet if theres package has a dependency on itself
    // (calling npm install from outside directory sometimes creates a dependency on itself)
    for (var depName in packageJson.dependencies){
        const version = packageJson.dependencies[depName]

        // If dependency relies on a local file
        if(version=="file:" || version=="file:." || version=="file:./"){
            delete packageJson.dependencies[depName]
            console.log("Deleted self dependency:",depName)

        }

    }

    // Re-Write the package.json
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Remove .packages
    await fs.remove(`${parentProjectDirectory}/.packages`);

    // Remove symlinks-temp.json
    await fs.remove(`${parentProjectDirectory}/symlinks-temp.json`);
}

BringOutSymlinks(process.cwd());