const path = require('path');

const { lintImportFromIndex, messages } = require('../../lib/util/import-from-index');

const mockFs = require('./mock-fs');

const mockSrcAbsPath = path.join(path.resolve(__filename, '../../..'), 'src');
const mockAliasParams = {
  alias: '~',
  aliasedPath: './src',
};

describe('lintImportFromIndex', () => {
  describe('invalid import paths', () => {
    const cases = [
      [
        'importing from sibling file via index',
        () => {
          mockFs.mock({
            [`${mockSrcAbsPath}/a/f1.ts`]: '',
            [`${mockSrcAbsPath}/a/index.ts`]: '',
          })
        },
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/f1.ts`,
          importedPath: '.',
          expected: {
            valid: false,
            message: messages.importSiblingFilesDirectly
          }
        }
      ],
      [
        'importing from descendant file directly, one level down',
        () => {
          mockFs.mock({
            [`${mockSrcAbsPath}/a/f1.ts`]: '',
            [`${mockSrcAbsPath}/a/aa/f2.ts`]: '',
          })
        },
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/f1.ts`,
          importedPath: './aa/f2',
          expected: {
            valid: false,
            message: messages.importDescendantFilesFromIndex
          }
        }
      ],
      [
        'importing from descendant file directly, multiple levels down',
        () => {
          mockFs.mock({
            [`${mockSrcAbsPath}/a/f1.ts`]: '',
            [`${mockSrcAbsPath}/a/aa/aaa/f2.ts`]: '',
          })
        },
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/f1.ts`,
          importedPath: './aa/aaa/f2',
          expected: {
            valid: false,
            message: messages.importDescendantFilesFromIndex
          }
        }
      ],
      [
        'importing from ancestor file via index, one level up',
        () => {
          mockFs.mock({
            [`${mockSrcAbsPath}/a/aa/aaa/f1.ts`]: '',
            [`${mockSrcAbsPath}/a/aa/index.ts`]: '',
          })
        },
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/aa/aaa/f1.ts`,
          importedPath: '..',
          expected: {
            valid: false,
            message: messages.importAncestorFilesDirectly,
          }
        }
      ],
      [
        'importing from ancestor file via index, multiple levels up',
        () => {
          mockFs.mock({
            [`${mockSrcAbsPath}/a/aa/aaa/f1.ts`]: '',
            [`${mockSrcAbsPath}/a/index.ts`]: '',
          })
        },
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/aa/aaa/f1.ts`,
          importedPath: '../..',
          expected: {
            valid: false,
            message: messages.importAncestorFilesDirectly,
          }
        }
      ],
      [
        'importing from cousin file directly, one level up',
        () => {
          mockFs.mock({
            [`${mockSrcAbsPath}/a/aa/aaa/f1.ts`]: '',
            [`${mockSrcAbsPath}/a/ab/aab/f2.ts`]: '',
          })
        },
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/aa/aaa/f1.ts`,
          importedPath: '../aab/f2',
          expected: {
            valid: false,
            message: messages.importCousinFilesFromAncestorIndex,
          }
        }
      ],
      [
        'importing from cousin file directly, multiple levels up',
        () => {
          mockFs.mock({
            [`${mockSrcAbsPath}/a/aa/aaa/f1.ts`]: '',
            [`${mockSrcAbsPath}/a/ab/f2.ts`]: '',
          })
        },
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/aa/aaa/f1.ts`,
          importedPath: '../../ab/f2',
          expected: {
            valid: false,
            message: messages.importCousinFilesFromAncestorIndex,
          }
        }
      ],
    ];

    test.each(cases)('%s', (_, mockFiles, { expected, ...params }) => {
      mockFiles();
      expect(lintImportFromIndex(params)).toEqual(expected);
      mockFs.restore();
    });
  });

  describe('valid import paths', () => {
    const cases = [
      [
        'importing from sibling file directly',
        () => {
          mockFs.mock({
            [`${mockSrcAbsPath}/a/f1.ts`]: '',
            [`${mockSrcAbsPath}/a/f2.ts`]: '',
          })
        },
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/f1.ts`,
          importedPath: './f2',
          expected: {
            valid: true,
          }
        }
      ],
      [
        'importing from descendant file via index, one level down',
        () => {
          mockFs.mock({
            [`${mockSrcAbsPath}/a/f1.ts`]: '',
            [`${mockSrcAbsPath}/a/aa/index.ts`]: '',
          })
        },
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/f1.ts`,
          importedPath: './aa',
          expected: {
            valid: true,
          }
        }
      ],
      [
        'importing from descendant file via index, multiple levels down',
        () => {
          mockFs.mock({
            [`${mockSrcAbsPath}/a/f1.ts`]: '',
            [`${mockSrcAbsPath}/a/aa/aaa/index.ts`]: '',
          })
        },
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/f1.ts`,
          importedPath: './aa/aaa',
          expected: {
            valid: true,
          }
        }
      ],
      [
        'importing from ancestor file directly, one level up',
        () => {
          mockFs.mock({
            [`${mockSrcAbsPath}/a/aa/aaa/f1.ts`]: '',
            [`${mockSrcAbsPath}/a/aa/f2.ts`]: '',
          })
        },
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/aa/aaa/f1.ts`,
          importedPath: '../f2',
          expected: {
            valid: true,
          }
        }
      ],
      [
        'importing from ancestor file directly, multiple levels up',
        () => {
          mockFs.mock({
            [`${mockSrcAbsPath}/a/aa/aaa/f1.ts`]: '',
            [`${mockSrcAbsPath}/a/f2.ts`]: '',
          })
        },
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/aa/aaa/f1.ts`,
          importedPath: '../../f2',
          expected: {
            valid: true,
          }
        }
      ],
      [
        'importing from cousin file via index, one level up',
        () => {
          mockFs.mock({
            [`${mockSrcAbsPath}/a/aa/aaa/f1.ts`]: '',
            [`${mockSrcAbsPath}/a/aa/aab/index.ts`]: '',
          })
        },
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/aa/aaa/f1.ts`,
          importedPath: '../aab',
          expected: {
            valid: true,
          }
        }
      ],
      [
        'importing from cousin file via index, multiple levels up',
        () => {
          mockFs.mock({
            [`${mockSrcAbsPath}/a/aa/aaa/f1.ts`]: '',
            [`${mockSrcAbsPath}/a/ab/index.ts`]: '',
          })
        },
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/aa/aaa/f1.ts`,
          importedPath: '../../ab',
          expected: {
            valid: true,
          }
        }
      ],
      [
        'importing from cousin file via index, multiple levels up, multiple levels deep',
        () => {
          mockFs.mock({
            [`${mockSrcAbsPath}/a/aa/aaa/f1.ts`]: '',
            [`${mockSrcAbsPath}/a/ab/aba/index.ts`]: '',
          })
        },
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/aa/aaa/f1.ts`,
          importedPath: '../../ab/aba',
          expected: {
            valid: true,
          }
        }
      ],
    ];

    test.each(cases)('%s', (_, mockFiles, { expected, ...params }) => {
      mockFiles();
      expect(lintImportFromIndex(params)).toEqual(expected);
      mockFs.restore();
    });
  });
});
