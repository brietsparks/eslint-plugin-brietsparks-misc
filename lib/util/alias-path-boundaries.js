const path = require('path');
const { getAbsImportedPath } = require('./abs');

function getCorrectlyFormattedImportPath({
  callerAbsPath,
  importedPath,
  alias,
  aliasedPath,
}) {
  if (!importedPath.startsWith('.') && !importedPath.startsWith(alias)) {
    return importedPath;
  }

  const rootAbsPath = path.resolve(aliasedPath);
  const importedAbsPath = getAbsImportedPath({
    alias,
    aliasedPath,
    callerAbsPath,
    importedPath
  });

  return _getCorrectlyFormattedImportPath({
    alias,
    rootAbsPath,
    callerAbsPath,
    importedAbsPath,
  });
}

function _getCorrectlyFormattedImportPath({ alias, rootAbsPath, callerAbsPath, importedAbsPath }) {
  const hasSameRootChild = pathsHaveSameRootChild({
    rootAbsPath,
    absPath1: callerAbsPath,
    absPath2: importedAbsPath,
  });

  if (hasSameRootChild) {
    let importedFileRelPath = path.relative(
      path.dirname(callerAbsPath),
      importedAbsPath
    );
    if (!importedFileRelPath.startsWith('..')) {
      return `./${importedFileRelPath}`;
    } else {
      return importedFileRelPath;
    }
  }

  return importedAbsPath.replace(rootAbsPath, alias);
}


function pathsHaveSameRootChild({ rootAbsPath, absPath1, absPath2 }) {
  if (!absPath1.startsWith(rootAbsPath)) {
    throw new Error ('path1 must start with the root path');
  }
  if (!absPath2.startsWith(rootAbsPath)) {
    throw new Error ('path2 must start with the root path');
  }

  return absPath1.substring(rootAbsPath.length).split('/')[1] === absPath2.substring(rootAbsPath.length).split('/')[1];
}

module.exports = {
  getCorrectlyFormattedImportPath
};
