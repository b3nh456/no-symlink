# Bring in symlink dependencies into current package

Used for taking dependencies with a version of "file:../*"
Files outside the scope of the package have problems with some deployments that only get the dependencies by npm installing them

bring-in-symlinks Will take these packages copy them into the current package and update the dependency
bring-out-symlinks will delete the copied packages and revert the dependencies