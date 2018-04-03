export default function searchNgAttr (name: string, source: {[key: string]: any}): any {
    return source[name.replace('data-', '')];
}