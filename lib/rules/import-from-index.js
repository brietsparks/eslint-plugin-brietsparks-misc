/**
 * @fileoverview Enforce importing from index files with specific path conventions
 * @author Briet Sparks
 */
"use strict";

const { lintImportFromIndex } = require('../util/import-from-index');
const { getSettings } = require('../util/settings');


//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'layout',
    docs: {
      description: "Enforce importing from index files with specific path conventions",
      recommended: false,
      url: null,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          ignore: {
            type: 'array',
            items: {
              type: 'string',
            },
          }
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const { alias, aliasedPath } = getSettings(context);

    const options = context.options[0] ?? {};
    const { ignore } = options;

    return {
      ImportDeclaration(node) {
        const importedPath = node.source.value;
        const callerAbsPath = context.getFilename();

        const { valid, message } = lintImportFromIndex({
          alias,
          aliasedPath,
          callerAbsPath,
          importedPath,
          ignore,
        });

        if (!valid) {
          context.report({ node, message });
        }
      },
    };
  },
};
