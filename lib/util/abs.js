const path = require('path');

function getAbsImportedPath({ alias, aliasedPath, callerAbsPath, importedPath }) {
  if (!importedPath.startsWith(alias)) {
    const importerParts = callerAbsPath.split('/');
    importerParts.pop();
    const importerDir = importerParts.join('/');

    return path.resolve(importerDir, importedPath);
  }

  const resolvedPath = importedPath.replace(alias, aliasedPath);
  return path.resolve(resolvedPath);
}

module.exports = {
  getAbsImportedPath
};
