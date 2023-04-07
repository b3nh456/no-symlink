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

    console.log("=")
    console.log(symlinksJson)
    console.log(symlinksJson.keys())
    for (var symlinkDepName in symlinksJson.keys()){

            // Get old symlink path from symlinks-temp.json
            const version = symlinksJson.get(symlinkDepName)

            const pathStartIndex = version.indexOf(":")
            const projectPath = `${parentProjectDirectory}/${version.substring(pathStartIndex+1)}`

            await BringOutSymlinks(projectPath)
            
            // Revert package.json dependency to original symlink path
            packageJson.dependencies[symlinkDepName] = version
            
            console.log(`In ${packageJson.name}: Symlink package ${symlinkDepName} reverted`)

    }

    // Re-Write the package.json
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Remove .packages
    await fs.remove(`${parentProjectDirectory}/.packages`);

    // Remove symlinks-temp.json
    await fs.remove(`${parentProjectDirectory}/symlinks-temp.json`);
}

BringOutSymlinks(process.cwd());