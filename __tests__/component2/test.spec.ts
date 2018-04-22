import {transform} from '../../src/index';
import readFiles from '../read-files';

describe('transform()', () => {
    describe('component2', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component2/template.html',
                './component2/index.tsx'
            ).then(([template, expectedCode]: string[]) => {
                const generatedCode: string[] = transform({
                    react: {
                        typescript: true
                    },
                    components: [
                        {
                            template,
                            componentName: 'Icon',
                            componentType: 'stateless'
                        }
                    ]
                });

                expect(generatedCode).toEqual([expectedCode]);
            });
        });
    });
});