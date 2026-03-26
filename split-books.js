const fs = require('fs');
const path = require('path');

const INPUT_FILE = './epub_content/完整内容.txt';
const OUTPUT_DIR = './epub_content';

console.log('开始分割四大名著...');

// 读取完整内容
const content = fs.readFileSync(INPUT_FILE, 'utf-8');
const lines = content.split('\n');

// 查找四部名著的起始位置（查找"第一回"出现的位置）
const bookMarkers = [
    { name: '红楼梦', marker: '第一回 甄士隐梦幻识通灵' },
    { name: '三国演义', marker: '第一回 宴桃园豪杰三结义' },
    { name: '西游记', marker: '第一回 灵根育孕源流出' },
    { name: '水浒传', marker: '第一回 张天师祈禳瘟疫' }
];

const positions = [];

for (const book of bookMarkers) {
    const index = lines.findIndex(line => line.includes(book.marker));
    if (index !== -1) {
        positions.push({
            name: book.name,
            index: index
        });
        console.log(`找到 ${book.name} 在行 ${index}`);
    } else {
        console.log(`⚠️  未找到 ${book.name}`);
    }
}

// 按位置排序
positions.sort((a, b) => a.index - b.index);

// 分割内容
for (let i = 0; i < positions.length; i++) {
    const current = positions[i];
    const next = positions[i + 1];
    
    let bookLines;
    if (next) {
        bookLines = lines.slice(current.index, next.index);
    } else {
        bookLines = lines.slice(current.index);
    }
    
    // 清理内容：移除空行和注释标记
    const cleanedLines = bookLines.filter(line => {
        const trimmed = line.trim();
        // 保留：章节标题、正文（长度>2 的）、空行（用于分段）
        if (!trimmed) return false; // 移除空行
        if (trimmed.includes('==========')) return false; // 移除部分标记
        if (trimmed.match(/^\[\d+\]$/)) return false; // 移除 [1] 这种注释标记
        if (trimmed.match(/^〔[零一二三四五六七八九十百千 0-9]+〕$/)) return false; // 移除〔一〕这种
        return true;
    });
    
    const text = cleanedLines.join('\n');
    const outputPath = path.join(OUTPUT_DIR, `${current.name}.txt`);
    fs.writeFileSync(outputPath, text, 'utf-8');
    console.log(`✅ ${current.name}: ${(text.length / 10000).toFixed(1)} 万字`);
}

console.log('\n分割完成！');
