
export function parseKeyValueString(kvString: string): { [key: string]: any } {
    const result: { [key: string]: any } = {};
    const pairRegex = /([\w\u00C0-\u017F\s]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([\w\u00C0-\u017F\s\d.:\/+\-_%À-ỹ]+?(?=\s*,\s*[\w\u00C0-\u017F\s]+\s*=|$)))/gu;
    let match;
    while ((match = pairRegex.exec(kvString)) !== null) {
        const key = match[1].trim();
        let value = match[2] || match[3] || match[4]; 
        if (value !== undefined) {
            const trimmedValue = value.trim();
            if (trimmedValue.toLowerCase() === 'true') result[key] = true;
            else if (trimmedValue.toLowerCase() === 'false') result[key] = false;
            else if (/^\d+(\.\d+)?$/.test(trimmedValue) && !isNaN(parseFloat(trimmedValue))) result[key] = parseFloat(trimmedValue);
            else result[key] = trimmedValue;
        }
    }
    return result;
}
