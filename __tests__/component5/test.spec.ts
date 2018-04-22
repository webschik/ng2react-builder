import {transform} from '../../src/index';
import readFiles from '../read-files';

describe('transform()', () => {
    describe('component5', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component5/template.html',
                './component5/index.tsx'
            ).then(([template, expectedCode]: string[]) => {
                const generatedCode: string[] = transform({
                    react: {
                        typescript: true
                    },
                    components: [
                        {
                            template,
                            componentName: 'PhoneDetail'
                        }
                    ]
                });

                expect(generatedCode).toEqual([expectedCode]);
            });
        });
    });
});