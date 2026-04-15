
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const dom = new JSDOM(\<!DOCTYPE html><html><body>
<pre><code>int main(){\n<br>    cout << 1;\n<br>}</code></pre>
</body></html>\);

const block = dom.window.document.querySelector('code');
console.log('TEXTCONTENT:', block.textContent);
console.log('INNERTEXT:', block.innerText);
let html = block.innerHTML || '';
html = html.replace(/<br\s*[\/]?>/gi, '\n');
const temp = dom.window.document.createElement('textarea');
temp.innerHTML = html;
console.log('HTML REPLACE:', temp.value);

