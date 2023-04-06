#!/usr/bin/env node

const fs = require("fs-extra");
const stringify = require("json-converters").stringify
const parse = require("json-converters").parse


async function BringInSymlinks(parentProjectDirectory){

    const packageJsonPath = parentProjectDirectory + "/package.json";
    const packageJson = require(packageJsonPath);

    const localDependencies = new Map()

    // 1. Delete current .packages folder
    await fs.remove(parentProjectDirectory + `/.packages`);

    for (var depName in packageJson.dependencies){
        const version = packageJson.dependencies[depName]

        // If dependency relies on a local file
        if(version.includes("file")){

            // Get 
            const pathStartIndex = version.indexOf(":")
            const projectPath = parentProjectDirectory + "/" + version.substring(pathStartIndex+1)

            await BringInSymlinks(projectPath)

            await fs.copy(filePath, `./.packages/${depName}`);

            packageJson.dependencies[depName] = `file:./.packages/${depName}`

            localDependencies.set(depName, version.substring(pathStartIndex+1))
            
            console.log(`symlink package ${depName} brought inside ${packageJson.name}`)
        }

    }

    // Re-Write the package.json
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Save the local file dependencies to json so can be rewritten after
    await fs.writeFile(parentProjectDirectory + "/symlinks-temp.json", stringify(localDependencies));
}

BringInSymlinks(process.cwd());