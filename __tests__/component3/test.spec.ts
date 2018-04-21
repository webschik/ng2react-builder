import {createReactComponent} from '../../src/index';
import readFiles from '../read-files';

describe('createReactComponent()', () => {
    describe('component3', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component3/template.html',
                './component3/index.tsx'
            ).then(([template, expectedCode]: string[]) => {
                const generatedCode: string = createReactComponent({
                    template,
                    react: {
                        typescript: true,
                        componentName: 'TestComponent'
                    }
                });

                expect(generatedCode).toBe(expectedCode);
            });
        });
    });
});