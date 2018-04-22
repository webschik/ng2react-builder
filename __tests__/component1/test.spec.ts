import {transform} from '../../src/index';
import readFiles from '../read-files';

describe('transform()', () => {
    describe('component1', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component1/template.html',
                './component1/index.tsx'
            ).then(([template, expectedCode]: string[]) => {
                const generatedCode: string[] = transform({
                    replaceDirectives: {
                        'my-icon': {
                            tagName: 'Icon',
                            valueProp: 'type'
                        }
                    },
                    react: {
                        typescript: true
                    },
                    components: [
                        {
                            template,
                            componentName: 'TestComponent'
                        }
                    ]
                });

                expect(generatedCode).toEqual([expectedCode]);
            });
        });
    });
});