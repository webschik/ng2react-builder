import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';
import {createReactComponent} from '../src';

const readFile = promisify(fs.readFile);

describe('createReactComponent()', () => {
    it('should generate TSX component', () => {
        return Promise.all<string>([
            createReactComponent({
                templatePath: './__tests__/component/template.html',
                replaceDirectives: {
                    'my-icon': 'Icon'
                },
                output: {
                    typescript: true,
                    name: 'TestComponent'
                }
            }),
            readFile(path.resolve(__dirname, './component/index.tsx'), 'utf8')
        ]).then(([generatedCode, expectedCode]: string[]) => {
            expect(generatedCode).toBe(expectedCode);
        });
    });
});