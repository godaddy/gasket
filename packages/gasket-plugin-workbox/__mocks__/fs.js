let __mockFiles = [];

module.exports = {
  __setMockFiles: mockFiles => {
    __mockFiles = mockFiles;
  },
  readdir: jest.fn((dir, cb) => cb(null, __mockFiles))
};
