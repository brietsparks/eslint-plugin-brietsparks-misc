const path = require('path');
const fs = require('fs');

const { getAbsImportedPath } = require('./abs');

const messages = {
  importSiblingFilesDirectly: 'Import from sibling files directly, not via the directory index file',
  importDescendantFilesFromIndex: 'Import from descendant files via their directory index file',
  importAncestorFilesDirectly: 'Import from ancestor files directly, not via their directory index file',
  importCousinFilesFromAncestorIndex: 'Import from cousin files via an ancestor directory index file of the caller',
};

const FileKind = {
  INDEX: 'index',
  NON_INDEX: 'nonIndex',
};

const Relation = {
  DESCENDANT: 'descendant',
  SIBLING: 'sibling',
  ANCESTOR: 'ancestor',
  COUSIN: 'cousin'
};

function lintImportFromIndex({
  importedPath,
  callerAbsPath,
  alias,
  aliasedPath,
  ignore = [],
}) {
  if (!importedPath.startsWith('.') && !importedPath.startsWith(alias)) {
    return { valid: true };
  }

  for (const ignorable of ignore) {
    if (importedPath.startsWith(ignorable)) {
      return { valid: true };
    }
  }

  const importedAbsPath = getAbsImportedPath({
    alias,
    aliasedPath,
    callerAbsPath,
    importedPath
  });

  let fileKind;
  let relation;

  fileKind = (
    fs.existsSync(path.join(importedAbsPath, 'index.ts')) ||
    fs.existsSync(path.join(importedAbsPath, 'index.tsx')) ||
    fs.existsSync(path.join(importedAbsPath, 'index.js')) ||
    fs.existsSync(path.join(importedAbsPath, 'index.jsx'))
  ) ? FileKind.INDEX : FileKind.NON_INDEX;

  const callerParentDirectoryAbsPath = path.dirname(callerAbsPath);
  const importedParentDirectoryAbsPath = fileKind === FileKind.INDEX
    ? importedAbsPath
    : path.dirname(importedAbsPath);

  if (callerParentDirectoryAbsPath === importedParentDirectoryAbsPath) {
    relation = Relation.SIBLING;
  } else if (importedParentDirectoryAbsPath.includes(callerParentDirectoryAbsPath)) {
    relation = Relation.DESCENDANT;
  } else if (callerParentDirectoryAbsPath.includes(importedParentDirectoryAbsPath)) {
    relation = Relation.ANCESTOR;
  } else {
    relation = Relation.COUSIN;
  }

  if (relation === Relation.SIBLING && fileKind === FileKind.INDEX) {
    return {
      valid: false,
      message: messages.importSiblingFilesDirectly,
    };
  }

  if (relation === Relation.DESCENDANT && fileKind === FileKind.NON_INDEX) {
    return {
      valid: false,
      message: messages.importDescendantFilesFromIndex,
    };
  }

  if (relation === Relation.ANCESTOR && fileKind === FileKind.INDEX) {
    return {
      valid: false,
      message: messages.importAncestorFilesDirectly,
    }
  }

  if (relation === Relation.COUSIN && fileKind === FileKind.NON_INDEX) {
    return {
      valid: false,
      message: messages.importCousinFilesFromAncestorIndex,
    }
  }

  return {
    valid: true,
  }
}

module.exports = {
  lintImportFromIndex,
  messages,
};
