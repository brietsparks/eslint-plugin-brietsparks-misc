const path = require('path');
const { getCorrectlyFormattedImportPath } = require('../../lib/util/alias-path-boundaries');

const mockSrcAbsPath = path.join(path.resolve(__filename, '../../..'), 'src');
const mockAliasParams = {
  alias: '~',
  aliasedPath: './src',
}

describe('getCorrectlyFormattedImportPath', () => {
  describe('importing a file from the same directory', () => {
    const cases = [
      [
        'with relative path',
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/a1.ts`,
          importedPath: './a2',
          expected: './a2',
        }
      ],
      [
        'with aliased path',
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/a1.ts`,
          importedPath: '~/a/a2',
          expected: './a2',
        }
      ],
      [
        'with relative path and extraneous parts',
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/a1.ts`,
          importedPath: '../a/a2',
          expected: './a2',
        }
      ],
    ];

    test.each(cases)('%s', (_, { expected, ...params }) => {
      expect(getCorrectlyFormattedImportPath(params)).toEqual(expected);
    });
  });

  describe('importing a file from a different directory within the alias boundary', () => {
    const cases =[
      [
        'with relative path',
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/aa/aa1.ts`,
          importedPath: '../ab/ab1',
          expected: '../ab/ab1',
        }
      ],
      [
        'with aliased path',
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/aa/aa1.ts`,
          importedPath: '~/a/ab/ab1',
          expected: '../ab/ab1',
        }
      ],
      [
        'with relative path and extraneous parts',
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/aa/aa1.ts`,
          importedPath: '../../a/ab/ab1',
          expected: '../ab/ab1',
        }
      ],
    ];

    test.each(cases)('%s', (_, { expected, ...params }) => {
      expect(getCorrectlyFormattedImportPath(params)).toEqual(expected);
    });
  });

  describe('importing a file from a different directory across alias boundaries', () => {
    const cases = [
      [
        'with aliased path',
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/a1.ts`,
          importedPath: '~/b/b1',
          expected: '~/b/b1',
        }
      ],
      [
        'with relative path',
        {
          ...mockAliasParams,
          callerAbsPath: `${mockSrcAbsPath}/a/a1.ts`,
          importedPath: '../b/b1',
          expected: '~/b/b1',
        }
      ],
    ];

    test.each(cases)('%s', (_, { expected, ...params }) => {
      expect(getCorrectlyFormattedImportPath(params)).toEqual(expected);
    });
  });
});
