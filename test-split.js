const fs = require('fs');
const path = require('path');

const INPUT_FILE = './epub_content/完整内容.txt';
const OUTPUT_DIR = './epub_content';

console.log('开始处理...');

const content = fs.readFileSync(INPUT_FILE, 'utf-8');
const lines = content.split('\n');

console.log(`总行数：${lines.length}`);
console.log(`第 350 行：${lines[349]}`);
console.log(`第 351 行：${lines[350]}`);

// 测试红楼梦前 1000 行
const testLines = lines.slice(349, 1349);
let chapterCount = 0;
let currentTitle = '';
let paragraphs = [];
const chapters = [];

for (let i = 0; i < testLines.length; i++) {
    const line = testLines[i].trim();
    
    if (/^第 [零一二三四五六七八九十百千 0-9]+回/.test(line)) {
        if (currentTitle && paragraphs.length > 0) {
            chapters.push({ title: currentTitle, content: paragraphs.join('\n') });
            chapterCount++;
        }
        currentTitle = line;
        paragraphs = [];
        console.log(`找到章回：${line}`);
    } else if (line && !line.includes('====') && !line.match(/^\[\d+\]$/) && currentTitle) {
        paragraphs.push(line);
    }
}

console.log(`\n找到 ${chapters.length} 回`);
console.log(`第一回内容长度：${chapters[0]?.content?.length || 0} 字符`);

// 保存测试
fs.writeFileSync(path.join(OUTPUT_DIR, 'test.json'), JSON.stringify(chapters.slice(0, 3), null, 2), 'utf-8');
console.log('\n已保存测试文件到 test.json');
