
const html1 = 'int main(){\n<br>    cout << 1;\n<br>}';
function normalize(html) {
    html = html.replace(/<br\s*[\/]?>/gi, '\n');
    html = html.replace(/<div[^>]*>/gi, '\n');
    html = html.replace(/<\/div>/gi, '');
    html = html.replace(/<p[^>]*>/gi, '\n');
    html = html.replace(/<\/p>/gi, '');
    return html;
}
console.log(normalize(html1));

