import {createReactComponent} from '../../src/index';
import readFiles from '../read-files';

describe('createReactComponent()', () => {
    describe('component1', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component1/template.html',
                './component1/index.tsx'
            ).then(([template, expectedCode]: string[]) => {
                const generatedCode: string = createReactComponent({
                    template,
                    replaceDirectives: {
                        'my-icon': {
                            tagName: 'Icon',
                            valueProp: 'type'
                        }
                    },
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