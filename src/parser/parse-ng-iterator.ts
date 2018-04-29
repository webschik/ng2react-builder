import {AngularIteratorInfo} from '../transformer/transform-template';

const pattern: RegExp = /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/;
const iteratorExpPattern: RegExp = /^(?:(\s*[\$\w]+)|\(\s*([\$\w]+)\s*,\s*([\$\w]+)\s*\))$/;
const aliasPattern: RegExp = /^[$a-zA-Z_][$a-zA-Z0-9_]*$/;
const aliasReservedNamesPattern: RegExp =
    /^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent|\$root|\$id)$/;
const collectionExpSeparator: RegExp = /\s*\|\s*/;

export default function parseNgIterator (expression: string): AngularIteratorInfo {
    let match: RegExpMatchArray = expression.match(pattern);

    if (!match) {
        throw new Error(`Invalid iterator expression '${ expression }'`);
    }

    const [, iteratorExp, collectionExp, aliasAs]: string[] = match;

    match = iteratorExp.match(iteratorExpPattern);

    if (!match) {
        throw new Error(`Invalid left-side expression ${ iteratorExp } in iterator '${ expression }'`);
    }

    const valueIdentifier: string = match[3] || match[1];
    const keyIdentifier: string = match[2];

    if (aliasAs && (!aliasPattern.test(aliasAs) || aliasReservedNamesPattern.test(aliasAs))) {
        throw new Error(
            `Iterator alias ${ aliasAs } is invalid - must be a valid JS identifier which is not a reserved name`
        );
    }

    const collectionPipe: string[] = collectionExp.split(collectionExpSeparator);
    const collectionTransform: string[] = collectionPipe
        .slice(1)
        .reduce((collectionTransform: string[], filter: string) => {
            const ngFilterData: string[] = filter.split(':');
            const ngFilterName: string = ngFilterData[0].trim();

            switch (ngFilterName) {
                case 'filter':
                    collectionTransform.push(`.filter(${ (ngFilterData[1] || '').trim() })`);
                    break;
                case 'orderBy':
                    collectionTransform.push(`.sort(${ (ngFilterData[1] || '').trim() })`);
                    break;
                case 'limitTo':
                    const limit: string = (ngFilterData[1] || '').trim();
                    const begin: string = (ngFilterData[2] || '').trim();

                    collectionTransform.push(`.slice(${ begin || 0 }, ${ begin || 0 } + ${ limit || 0 })`);
                    break;
                default:
                    collectionTransform.push(`.${ ngFilterName }(${
                        ngFilterData.slice(1).map((param: string) => param.trim()).join(', ')
                    })`);
            }

            return collectionTransform;
        }, []);

    return {
        valueIdentifier,
        keyIdentifier,
        collectionIdentifier: collectionPipe[0],
        collectionTransform,
        aliasAs
    };
}