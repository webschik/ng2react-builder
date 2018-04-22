import {transform} from '../../src/index';
import readFiles from '../read-files';

describe('transform()', () => {
    describe('component4', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component4/template.html',
                './component4/index.tsx'
            ).then(([template, expectedCode]: string[]) => {
                const generatedCode: string[] = transform({
                    react: {
                        typescript: true
                    },
                    components: [
                        {
                            template,
                            componentName: 'PhoneList'
                        }
                    ]
                });

                expect(generatedCode).toEqual([expectedCode]);
            });
        });
    });
});