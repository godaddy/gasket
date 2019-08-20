const { spawn } = require('child_process');
const { Readable } = require('stream');

function generateSVG(dot) {
  return new Promise((resolve, reject) => {
    const errChunks = [];
    const outputChunks = [];

    const proc = spawn('dot', ['-Tsvg']);

    proc
      .once('error', reject)
      .once('close', code => {
        if (code) {
          reject(new Error(errChunks.join('')));
        } else {
          resolve(outputChunks.join(''));
        }
      });

    proc.stderr.on('data', chunk => errChunks.push(chunk));
    proc.stdout.on('data', chunk => outputChunks.push(chunk));

    stringStream(dot).pipe(proc.stdin);
  });
}

function stringStream(str) {
  return new Readable({
    read(size) {
      let wantsMore = true;
      while (wantsMore) {
        const chunk = str.substr(0, size);
        if (!chunk) {
          return void this.push(null);
        }

        wantsMore = this.push(chunk);
        str = str.substr(size);
      }
    }
  });
}

module.exports = generateSVG;
