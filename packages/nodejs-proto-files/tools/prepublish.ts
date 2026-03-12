// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
import {promisify} from 'util';
import * as fs from 'fs';
import * as got from 'got';
import * as path from 'path';

const protoFolders = ['google', 'grafeas', 'gapic'];

// eslint-disable-next-line @typescript-eslint/no-var-requires
const DecompressZip = require('decompress-zip');

const extract = (
  input: string,
  opts: {strip?: number; filter?: (file: any) => boolean},
  callback: (err?: Error | null) => void,
) => {
  const output = Math.floor(Math.random() * 1000000) + '.zip';
  console.log(`Downloading ${input} to ${output}...`);

  const writeStream = fs.createWriteStream(output);
  const stream = (got as unknown as got.Got).stream(input);

  stream.on('error', err => {
    console.error(`Download error for ${input}: ${err.message}`);
    writeStream.end();
    fs.unlink(output, () => {});
    callback(err);
  });

  stream.pipe(writeStream);

  writeStream.on('error', err => {
    console.error(`Write error for ${output}: ${err.message}`);
    fs.unlink(output, () => {});
    callback(err);
  });

  writeStream.on('finish', () => {
    console.log(`Extracting ${output}...`);
    const unzipper = new DecompressZip(output);

    unzipper
      .on('error', err => {
        console.error(`Extraction error for ${output}: ${err.message}`);
        fs.unlink(output, () => {});
        callback(err);
      })
      .extract({
        strip: opts.strip,
        filter: file => {
          if (opts.filter && !opts.filter(file)) return;
          return path.extname(file.filename) === '.proto';
        },
      })
      .on('extract', () => {
        console.log(`Finished extracting ${output}`);
        fs.unlink(output, callback);
      });
  });
};

const extractAsync = promisify(extract);
const execAsync = promisify(require('child_process').exec);

async function main() {
  console.log(`Cleaning up old proto folders: ${protoFolders.join(', ')}`);
  await execAsync(`rm -rf ${protoFolders.join(' ')}`);

  console.log('Fetching googleapis protos...');
  await extractAsync(
    'https://github.com/googleapis/googleapis/archive/master.zip',
    {
      strip: 1,
    },
  );

  console.log('Fetching protobuf protos...');
  await extractAsync('https://github.com/google/protobuf/archive/main.zip', {
    strip: 2,
    filter: file => {
      const parent = file.parent || path.dirname(file.filename);
      return (
        parent.indexOf('protobuf-main') === 0 &&
        parent.indexOf('protobuf-main/src/') === 0 &&
        parent.indexOf('/internal') === -1 &&
        file.filename.indexOf('unittest') === -1 &&
        file.filename.indexOf('test') === -1
      );
    },
  });

  await execAsync(
    '[ -d "overrides" ] && cp -R overrides/* google || echo "no overrides"',
  );

  // Validation
  for (const folder of protoFolders) {
    if (!fs.existsSync(folder) || fs.readdirSync(folder).length === 0) {
      throw new Error(`Failed to create or populate folder: ${folder}`);
    }
  }
  console.log('Successfully prepared all proto files.');
}

main().catch(err => {
  console.error('PREPUBLISH FAILED:', err);
  // eslint-disable-next-line n/no-process-exit
  process.exit(1);
});
