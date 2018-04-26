import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';

const readFile = promisify(fs.readFile);

export default function readFiles (...filepaths: string[]): Promise<string[]> {
    return Promise.all(filepaths.map((filepath: string) => readFile(path.resolve(__dirname, filepath), 'utf8')));
}