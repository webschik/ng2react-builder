import * as fs from 'fs';
import {promisify} from 'util';
import {createReactComponent} from '../src';

const readFile = promisify(fs.readFileSync);

describe('createReactComponent()', () => {
    it('should generate component1', () => {
        const generatedCode: string = createReactComponent({
            name: 'Component1',
            template: './component1/template.html'
        });

        return readFile('./component1/index.tsx', 'utf8').then((expectedCode: string) => {
            expect(generatedCode).toBe(expectedCode);
        });
    });
});