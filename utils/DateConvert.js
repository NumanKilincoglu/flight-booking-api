
export function dateConvert(dateStr) {
    if(!dateStr) date = new Date();
    const date = new Date(dateStr);
    return date.toISOString().split('.')[0];
}