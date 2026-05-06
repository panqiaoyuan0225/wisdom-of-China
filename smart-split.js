const fs = require('fs');
const path = require('path');

const INPUT_FILE = './epub_content/完整内容.txt';
const OUTPUT_DIR = './epub_content';

console.log('开始提取四大名著纯正文（删除目录和引言）...');

const content = fs.readFileSync(INPUT_FILE, 'utf-8');
const lines = content.split('\n');

// 查找每部书的正文起始位置（直接定位到正文叙事开始的地方）
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
        // 下一部书的起始位置就是当前书的结束位置
        books[i].end = books[i + 1].start;
    } else {
        // 最后一部书到文件末尾
        books[i].end = lines.length;
    }
}

// 处理每部书
for (const book of books) {
    if (book.start === -1) continue;
    
    const bookLines = lines.slice(book.start, book.end);
    
    // 智能合并内容，删除注释
    let cleanedParagraphs = [];
    let currentBuffer = '';
    
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
        
        // 跳过诗词注解
        if (line.length < 25 && line.includes('——')) continue;
        
        // 检测章回标题
        if (/^第[零一二三四五六七八九十百千]+回/.test(line)) {
            if (currentBuffer && currentBuffer.length > 10) {
                cleanedParagraphs.push(currentBuffer);
            }
            currentBuffer = '';
            cleanedParagraphs.push(line);
        } else {
            if (currentBuffer) {
                currentBuffer += line;
            } else {
                currentBuffer = line;
            }
            
            // 如果句子结束，保存
            if (/[。！？!?」』]/.test(line)) {
                if (currentBuffer.length > 15) {
                    cleanedParagraphs.push(currentBuffer);
                }
                currentBuffer = '';
            }
        }
    }
    
    if (currentBuffer && currentBuffer.length > 15) {
        cleanedParagraphs.push(currentBuffer);
    }
    
    const txtContent = cleanedParagraphs.join('\n\n');
    const txtPath = path.join(OUTPUT_DIR, `${book.name}.txt`);
    fs.writeFileSync(txtPath, txtContent, 'utf-8');
    
    const chapterCount = cleanedParagraphs.filter(p => /^第[零一二三四五六七八九十百千]+回/.test(p)).length;
    
    console.log(`✅ ${book.name}: ${chapterCount} 回 - ${(txtContent.length / 10000).toFixed(1)} 万字`);
}

console.log('\n完成！');
