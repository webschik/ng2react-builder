import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';
import {createReactComponent} from '../../src/index';

const readFile = promisify(fs.readFile);

describe('createReactComponent()', () => {
    function getSources (path1: string, path2: string): Promise<[string, string]> {
        return Promise.all([
            readFile(path.resolve(__dirname, path1), 'utf8'),
            readFile(path.resolve(__dirname, path2), 'utf8')
        ]);
    }

    describe('component4', () => {
        it('should generate TSX component', () => {
            return getSources('./template.html', './index.tsx').then(([template, expectedCode]: string[]) => {
                const generatedCode: string = createReactComponent({
                    template,
                    react: {
                        typescript: true,
                        componentName: 'PhoneList'
                    }
                });

                expect(generatedCode).toBe(expectedCode);
            });
        });
    });
});