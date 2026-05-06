const fs = require('fs');
const path = require('path');

const INPUT_FILE = './epub_content/完整内容.txt';
const OUTPUT_DIR = './epub_content';

console.log('开始分割四大名著...');

// 读取完整内容
const content = fs.readFileSync(INPUT_FILE, 'utf-8');
const lines = content.split('\n');

// 根据之前找到的位置分割
const positions = [
    { name: '红楼梦', start: 349 },      // 第 350 行开始（索引 349）
    { name: '三国演义', start: 33246 },
    { name: '西游记', start: 42975 },
    { name: '水浒传', start: 64290 }
];

// 分割内容
for (let i = 0; i < positions.length; i++) {
    const current = positions[i];
    const next = positions[i + 1];
    
    let bookLines;
    if (next) {
        bookLines = lines.slice(current.start, next.start);
    } else {
        bookLines = lines.slice(current.start);
    }
    
    // 智能合并内容
    let mergedContent = [];
    let currentChapter = '';
    let chapterParagraphs = [];
    
    for (let j = 0; j < bookLines.length; j++) {
        let line = bookLines[j].trim();
        
        // 跳过空行和分隔符
        if (!line || line.includes('==========')) continue;
        
        // 跳过注释标记
        if (line.match(/^\[\d+\]$/) || line.match(/^〔[零一二三四五六七八九十百千 0-9]+〕$/)) continue;
        
        // 检测章回标题
        if (/^第 [零一二三四五六七八九十百千 0-9]+回/.test(line)) {
            // 保存前一章
            if (currentChapter) {
                mergedContent.push({
                    title: currentChapter,
                    paragraphs: [...chapterParagraphs]
                });
                chapterParagraphs = [];
            }
            currentChapter = line;
        } else if (currentChapter && line.length > 0) {
            // 合并段落
            chapterParagraphs.push(line);
        }
    }
    
    // 保存最后一章
    if (currentChapter) {
        mergedContent.push({
            title: currentChapter,
            paragraphs: [...chapterParagraphs]
        });
    }
    
    // 保存 TXT 版本（纯文本）
    const txtContent = mergedContent.map(chapter => {
        return `${chapter.title}\n\n${chapter.paragraphs.join('\n\n')}`;
    }).join('\n\n==========\n\n');
    
    const txtPath = path.join(OUTPUT_DIR, `${current.name}.txt`);
    fs.writeFileSync(txtPath, txtContent, 'utf-8');
    
    // 保存 JSON 版本（结构化）
    const jsonPath = path.join(OUTPUT_DIR, `${current.name}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify({ name: current.name, chapters: mergedContent }, null, 2), 'utf-8');
    
    console.log(`✅ ${current.name}: ${mergedContent.length} 回 - ${(txtContent.length / 10000).toFixed(1)} 万字`);
}

console.log('\n分割完成！');
