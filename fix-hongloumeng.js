const fs = require('fs');
const path = require('path');

const INPUT_FILE = './epub_content/红楼梦.txt';
const OUTPUT_FILE = './epub_content/红楼梦.txt';

console.log('开始修复红楼梦章回标题...');

const content = fs.readFileSync(INPUT_FILE, 'utf-8');
const lines = content.split('\n');

// 修复章回标题
let fixedLines = [];
let i = 0;

while (i < lines.length) {
    let line = lines[i].trim();
    
    if (!line) {
        fixedLines.push('');
        i++;
        continue;
    }
    
    // 检测章回标题行
    if (/^第[零一二三四五六七八九十百千]+回/.test(line)) {
        // 检查是否有注释标记需要删除
        let cleanTitle = line.replace(/〔[^〕]+〕/g, '').replace(/\[\d+\]/g, '').trim();
        
        // 检查下一行是否属于标题的延续
        if (i + 1 < lines.length) {
            let nextLine = lines[i + 1].trim();
            
            // 如果下一行很短且不包含句号，可能是标题的延续
            if (nextLine && nextLine.length < 15 && !nextLine.includes('。') && !/^第[零一二三四五六七八九十百千]+回/.test(nextLine)) {
                cleanTitle += nextLine.replace(/〔[^〕]+〕/g, '').replace(/\[\d+\]/g, '').trim();
                i++; // 跳过下一行
            }
        }
        
        fixedLines.push(cleanTitle);
        i++;
    } else {
        fixedLines.push(line);
        i++;
    }
}

const fixedContent = fixedLines.join('\n');
fs.writeFileSync(OUTPUT_FILE, fixedContent, 'utf-8');

// 验证修复结果
const finalContent = fs.readFileSync(OUTPUT_FILE, 'utf-8');
const finalLines = finalContent.split('\n');

console.log('修复后的章回标题：');
const chapter14 = finalLines.find(line => line.includes('第十四回'));
if (chapter14) {
    console.log('✅ 第十四回：', chapter14);
} else {
    console.log('❌ 未找到第十四回');
}

console.log('\n完成！');
