const pattern: RegExp = /^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/;
const iteratorExpPattern: RegExp = /^(?:(\s*[\$\w]+)|\(\s*([\$\w]+)\s*,\s*([\$\w]+)\s*\))$/;
const aliasPattern: RegExp = /^[$a-zA-Z_][$a-zA-Z0-9_]*$/;
const aliasReservedNamesPattern: RegExp =
    /^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent|\$root|\$id)$/;

export default function parseNgIterator (expression: string) {
    let match: RegExpMatchArray = expression.match(pattern);

    if (!match) {
        throw new Error(`Invalid iterator expression ${ expression }`);
    }

    const [, iteratorExp, collectionIdentifier, aliasAs, trackByExp]: string[] = match;

    match = iteratorExp.match(iteratorExpPattern);

    if (!match) {
        throw new Error(`Invalid left-side expression ${ iteratorExp } in iterator ${ expression }`);
    }

    const valueIdentifier: string = match[3] || match[1];
    const keyIdentifier: string = match[2];

    if (aliasAs && (!aliasPattern.test(aliasAs) || aliasReservedNamesPattern.test(aliasAs))) {
        throw new Error(
            `Iterator alias ${ aliasAs } is invalid --- must be a valid JS identifier which is not a reserved name`
        );
    }

    return {
        valueIdentifier,
        keyIdentifier,
        collectionIdentifier,
        aliasAs
    };
}