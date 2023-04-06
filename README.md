# Can bring in local dependencies (symlink packages) into this package
# Then can bring them back out as local dependencies (symink)

Used for taking dependencies with a version of "file:../*"
Files outside the scope of the package have problems with some deployments that only get the dependencies from npm installing them

BringIn Will take these packages copy them into the current package and update the dependency
BringOut will then put them back out and change the dependency back to local (symlink)