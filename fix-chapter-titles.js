const fs = require('fs');
const path = require('path');

const INPUT_FILE = './epub_content/完整内容.txt';
const OUTPUT_DIR = './epub_content';

console.log('开始修复四大名著章回标题（合并多行标题）...');

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

// 处理每部书：专门修复多行章回标题
for (const book of books) {
    if (book.start === -1) continue;
    
    const bookLines = lines.slice(book.start, book.end);
    
    // 修复多行章回标题
    let fixedLines = [];
    let i = 0;
    
    while (i < bookLines.length) {
        let line = bookLines[i].trim();
        
        if (!line) {
            i++;
            continue;
        }
        
        if (line.includes('==========')) {
            i++;
            continue;
        }
        
        // 跳过注释标记
        if (line.match(/^\[\d+\]$/) || line.match(/^〔[零一二三四五六七八九十百千 0-9]+〕$/) || 
            line === '返回总目录' || (line.includes('底本') && line.includes('改')) || 
            line.includes('校记') || line.includes('注释')) {
            i++;
            continue;
        }
        
        // 检测章回标题
        if (/^第[零一二三四五六七八九十百千]+回/.test(line)) {
            // 检查后续行是否属于同一个章回标题
            let chapterTitle = line;
            let j = i + 1;
            
            // 检查后续行是否很短且不包含句号（可能是标题的延续）
            while (j < bookLines.length) {
                let nextLine = bookLines[j].trim();
                if (!nextLine) {
                    j++;
                    continue;
                }
                
                // 如果下一行很短（<10字符）且不包含句号，可能是标题的延续
                if (nextLine.length < 10 && !nextLine.includes('。') && !/^第[零一二三四五六七八九十百千]+回/.test(nextLine)) {
                    chapterTitle += nextLine;
                    j++;
                } else {
                    break;
                }
            }
            
            fixedLines.push(chapterTitle);
            i = j; // 跳过已处理的标题行
        } else {
            fixedLines.push(line);
            i++;
        }
    }
    
    const txtContent = fixedLines.join('\n');
    const txtPath = path.join(OUTPUT_DIR, `${book.name}.txt`);
    fs.writeFileSync(txtPath, txtContent, 'utf-8');
    
    const chapterCount = fixedLines.filter(p => /^第[零一二三四五六七八九十百千]+回/.test(p)).length;
    
    console.log(`✅ ${book.name}: ${chapterCount} 回 - ${(txtContent.length / 10000).toFixed(1)} 万字`);
}

console.log('\n完成！');
