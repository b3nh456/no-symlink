#!/usr/bin/env node

const fs = require("fs-extra");
const stringify = require("json-converters").stringify
const parse = require("json-converters").parse


async function BringOutSymlinks(parentProjectDirectory){

    const packageJsonPath = parentProjectDirectory + "/package.json";
    const packageJson = require(packageJsonPath);

    const symlinksJsonPath = parentProjectDirectory + "/symlinks-temp.json";
    const symlinksJson = parse(fs.readFile(symlinksJsonPath))

    console.log(symlinksJson)

    for (var symlinkDepName in symlinksJson.keys()){

            const version = symlinksJson.get(symlinkDepName)

            const pathStartIndex = version.indexOf(":")
            const projectPath = parentProjectDirectory + "/" + version.substring(pathStartIndex+1)

            await BringOutSymlinks(projectPath)
            
            packageJson.dependencies[symlinkDepName] = version
            
            console.log(`symlink package ${symlinkDepName} reverted from ${packageJson.name}`)

    }

    // Re-Write the package.json
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    await fs.remove(parentProjectDirectory + `/.packages`);

    await fs.remove(parentProjectDirectory + "/symlinks-temp.json");
}

BringOutSymlinks(process.cwd());