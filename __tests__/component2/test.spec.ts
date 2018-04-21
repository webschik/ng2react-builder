import {createReactComponent} from '../../src/index';
import readFiles from '../read-files';

describe('createReactComponent()', () => {
    describe('component2', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component2/template.html',
                './component2/index.tsx'
            ).then(([template, expectedCode]: string[]) => {
                const generatedCode: string = createReactComponent({
                    template,
                    react: {
                        typescript: true,
                        componentName: 'Icon',
                        componentType: 'stateless'
                    }
                });

                expect(generatedCode).toBe(expectedCode);
            });
        });
    });
});