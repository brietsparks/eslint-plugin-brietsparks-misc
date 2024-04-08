const mockFs = require('mock-fs');

/*
This is a workaround for problems using console.log with jest and mock-fs
See: https://github.com/tschaub/mock-fs/issues/234
 */

let logsTemp = [];
let logMock;
exports.mock = (config) => {
  logMock = jest.spyOn(console, 'log').mockImplementation((...args) => {
    logsTemp.push(args)
  })
  mockFs(config)
}

exports.restore = () => {
  logMock.mockRestore()
  mockFs.restore()
  logsTemp.map(el => console.log(...el))
  logsTemp = []
}
