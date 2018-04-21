import {createReactComponent} from '../../src/index';
import readFiles from '../read-files';

describe('createReactComponent()', () => {
    describe('component5', () => {
        it('should generate TSX component', () => {
            return readFiles(
                './component5/template.html',
                './component5/index.tsx'
            ).then(([template, expectedCode]: string[]) => {
                const generatedCode: string = createReactComponent({
                    template,
                    react: {
                        typescript: true,
                        componentName: 'PhoneDetail'
                    }
                });

                expect(generatedCode).toBe(expectedCode);
            });
        });
    });
});