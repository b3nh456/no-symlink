#!/usr/bin/env node

const fs = require("fs-extra");
const stringify = require("json-converters").stringify
const parse = require("json-converters").parse


async function BringInSymlinks(packageDirectory, newPackageDirectory){

    const packageJsonPath =  `${newPackageDirectory}/package.json`;
    const packageJson = parse(await fs.readFile(packageJsonPath));

    const symlinkDependencies = new Map()

    // Delete current .packages folder
    await fs.remove(`${newPackageDirectory}/.packages`);

    for (var depName in packageJson.dependencies){
        const version = packageJson.dependencies[depName]

        // If dependency relies on a local file
        if(version.includes("file")){

            // Get the dependencies relative path and calculate the absolute path
            const pathStartIndex = version.indexOf(":")
            const relativeProjectPath = version.substring(pathStartIndex+1)
            const absoluteProjectPath = `${packageDirectory}/${relativeProjectPath}`

            // Copy the dependency package into this package
            await fs.copy(absoluteProjectPath, `${newPackageDirectory}/.packages/${depName}`);

            // (Recursive) Check this dependency's dependencies
            await BringInSymlinks(absoluteProjectPath, `${newPackageDirectory}/.packages/${depName}`)

            // Change the dependency version to reference this new filepath
            packageJson.dependencies[depName] = `file:./.packages/${depName}`

            // Add the old filepath to a map so we can revert is later
            symlinkDependencies.set(depName, version.substring(pathStartIndex+1))
            
            console.log(`In ${packageJson.name}: Symlink package ${depName} brought in`)
        }

    }
    if(!symlinkDependencies.keys()){return}

    // Re-Write the package.json
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Save the local file dependencies to json so can be rewritten after
    await fs.writeFile(`${newPackageDirectory}/symlinks-temp.json`, stringify(symlinkDependencies));
}

BringInSymlinks(process.cwd(), process.cwd());