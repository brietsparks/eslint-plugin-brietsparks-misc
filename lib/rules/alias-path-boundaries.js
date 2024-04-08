/**
 * @fileoverview Enforce whether a file import path should be relative or absolute based on file locations
 * @author Briet Sparks
 */
"use strict";

const { getSettings } = require('../util/settings');
const { getCorrectlyFormattedImportPath } = require('../util/alias-path-boundaries');


//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: "Enforce whether a file import path should be relative or absolute based on file locations",
      recommended: false,
      url: null,
    },
    fixable: 'code',
    schema: [],
  },

  create(context) {
    const { alias, aliasedPath } = getSettings(context);
    if (!alias || !aliasedPath) {
      throw new Error('Both "alias" and "aliasBaseUrl" options are required.');
    }

    return {
      ImportDeclaration(node) {
        const importedPath = node.source.value;

        const expectedImportedPath = getCorrectlyFormattedImportPath({
          callerAbsPath: context.getFilename(),
          importedPath,
          alias,
          aliasedPath,
        })

        if (importedPath !== expectedImportedPath) {
          context.report({
            node,
            message: `Improperly formatted path. Expected: ${expectedImportedPath}, Actual: ${importedPath}`,
            fix(fixer) {
              return fixer.replaceText(node.source, `'${expectedImportedPath}'`);
            },
          });
        }
      },
    };
  },
};
