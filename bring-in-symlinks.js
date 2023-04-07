#!/usr/bin/env node

const fs = require("fs-extra");
const stringify = require("json-converters").stringify
const parse = require("json-converters").parse


async function BringInSymlinks(parentProjectDirectory){

    const packageJsonPath =  `${parentProjectDirectory}/package.json`;
    const packageJson = parse(await fs.readFile(packageJsonPath));

    const localDependencies = new Map()

    // Delete current .packages folder
    await fs.remove(`${parentProjectDirectory}/.packages`);

    for (var depName in packageJson.dependencies){
        const version = packageJson.dependencies[depName]

        // If dependency relies on a local file
        if(version.includes("file")){

            // Get the dependencies relative path and calculate the absolute path
            const pathStartIndex = version.indexOf(":")
            const relativeProjectPath = version.substring(pathStartIndex+1)
            const absoluteProjectPath = `${parentProjectDirectory}/${relativeProjectPath}`

            // (Recursive) Check this dependency's dependencies
            await BringInSymlinks(absoluteProjectPath)

            // Copy the dependency package into this package
            await fs.copy(absoluteProjectPath, `${parentProjectDirectory}/.packages/${depName}`);

            // Change the dependency version to reference this new filepath
            packageJson.dependencies[depName] = `file:./.packages/${depName}`

            // Add the old filepath to a map so we can revert is later
            localDependencies.set(depName, version.substring(pathStartIndex+1))
            
            console.log(`In ${packageJson.name}: Symlink package ${depName} brought in`)
        }

    }

    // Re-Write the package.json
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Save the local file dependencies to json so can be rewritten after
    await fs.writeFile(`${parentProjectDirectory}/symlinks-temp.json`, stringify(localDependencies));
}

BringInSymlinks(process.cwd());