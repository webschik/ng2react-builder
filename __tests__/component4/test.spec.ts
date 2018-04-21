import {createReactComponent} from '../../src/index';
import readFiles from '../read-files';

describe('createReactComponent()', () => {
    describe('component4', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component4/template.html',
                './component4/index.tsx'
            ).then(([template, expectedCode]: string[]) => {
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