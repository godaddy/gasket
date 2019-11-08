let __mockFileJson = {
  '__default__': 'test-app',
  'test-app': {
    'en-US': 'aaaaaaa',
    'hi': 'hihihihi1',
    'hi-IN': 'bbbbbbb',
    'zh-CN': 'cncncnc',
    'zh-TW': 'twtwtwt',
    'a.b.o.u.t': {
      'en-US': 'ccccccc',
      'hi': 'hihihihi2',
      'hi-IN': 'ddddddd',
      'zh-CN': 'cncncn2',
      'zh-TW': 'twtwtw2'
    },
    'common': {
      'en-US': 'eeeeeee',
      'hi': 'hihihihi3',
      'hi-IN': 'fffffff',
      'zh-CN': 'cncncn3',
      'zh-TW': 'twtwtw3'
    }
  },
  '@org/mod-name': {
    'en-US': 'ggggggg',
    'hi': 'hihihihi4',
    'hi-IN': 'hhhhhhh',
    'zh-CN': 'cncncn4',
    'zh-TW': 'twtwtw4',
    'ns1': {
      'en-US': 'iiiiiii',
      'hi': 'hihihihi5',
      'hi-IN': 'jjjjjjj',
      'zh-CN': 'cncncn5',
      'zh-TW': 'twtwtw5'
    },
    'ns2': {
      'en-US': 'kkkkkkk',
      'hi': 'hihihihi6',
      'hi-IN': 'lllllll',
      'zh-CN': 'cncncn6',
      'zh-TW': 'twtwtw6'
    }
  }
};

module.exports = {
  __setMockFileData: mockFileData => {
    __mockFileJson = mockFileData;
  },
  readFileSync: jest.fn(() => JSON.stringify(__mockFileJson))
};
