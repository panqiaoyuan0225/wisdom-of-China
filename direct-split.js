const fs = require('fs');
const path = require('path');

const INPUT_FILE = './epub_content/完整内容.txt';
const OUTPUT_DIR = './epub_content';

console.log('开始提取四大名著（直接复制原始内容）...');

const content = fs.readFileSync(INPUT_FILE, 'utf-8');
const lines = content.split('\n');

// 查找每部书的正文起始位置
const startMarkers = [
    { name: '红楼梦', marker: '原来女娲氏炼石补天' },
    { name: '三国演义', marker: '建宁二年四月望日' },
    { name: '西游记', marker: '感盘古开辟' },
    { name: '水浒传', marker: '话说大宋仁宗天子在位' }
];

const books = [];

for (const marker of startMarkers) {
    const index = lines.findIndex(line => line.includes(marker.marker));
    
    if (index !== -1) {
        // 往前找最近的章回标题
        let titleIndex = index;
        while (titleIndex >= 0 && !lines[titleIndex].match(/^第[零一二三四五六七八九十百千]+回/)) {
            titleIndex--;
        }
        
        books.push({
            name: marker.name,
            start: titleIndex
        });
        
        console.log(`找到 ${marker.name}：${titleIndex + 1} 行`);
    }
}

// 设置结束位置
for (let i = 0; i < books.length; i++) {
    if (i < books.length - 1) {
        books[i].end = books[i + 1].start;
    } else {
        books[i].end = lines.length;
    }
}

// 处理每部书：直接复制原始内容，不进行任何处理
for (const book of books) {
    if (book.start === -1) continue;
    
    const bookLines = lines.slice(book.start, book.end);
    
    // 只删除注释标记，保留所有原始内容
    let cleanedLines = [];
    
    for (let j = 0; j < bookLines.length; j++) {
        let line = bookLines[j].trim();
        
        if (!line) continue;
        if (line.includes('==========')) continue;
        
        // 跳过注释标记
        if (line.match(/^\[\d+\]$/)) continue;
        if (line.match(/^〔[零一二三四五六七八九十百千 0-9]+〕$/)) continue;
        if (line === '返回总目录') continue;
        
        // 跳过校勘说明
        if (line.includes('底本') && line.includes('改')) continue;
        if (line.includes('校记') || line.includes('注释')) continue;
        
        // 直接保留所有行，不进行任何合并
        cleanedLines.push(line);
    }
    
    const txtContent = cleanedLines.join('\n');
    const txtPath = path.join(OUTPUT_DIR, `${book.name}.txt`);
    fs.writeFileSync(txtPath, txtContent, 'utf-8');
    
    const chapterCount = cleanedLines.filter(p => /^第[零一二三四五六七八九十百千]+回/.test(p)).length;
    
    console.log(`✅ ${book.name}: ${chapterCount} 回 - ${(txtContent.length / 10000).toFixed(1)} 万字`);
}

console.log('\n完成！');
