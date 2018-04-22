import {transform} from '../../src/index';
import readFiles from '../read-files';

describe('transform()', () => {
    describe('component3', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component3/template.html',
                './component3/index.tsx'
            ).then(([template, expectedCode]: string[]) => {
                const generatedCode: string[] = transform({
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