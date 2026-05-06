const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// 自动查找 EPUB 文件
const epubFiles = fs.readdirSync('.').filter(f => f.endsWith('.epub'));
if (epubFiles.length === 0) {
    console.error('错误：当前目录未找到 EPUB 文件');
    process.exit(1);
}
const EPUB_PATH = './' + epubFiles[0];
const OUTPUT_DIR = './epub_content';

console.log(`使用文件：${epubFiles[0]}`);

// 创建输出目录
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

console.log('开始解析 EPUB 文件...');

try {
    // 打开 EPUB 文件（EPUB 本质是 ZIP）
    const zip = new AdmZip(EPUB_PATH);
    const zipEntries = zip.getEntries();

    console.log(`找到 ${zipEntries.length} 个文件`);

    // 提取所有 XHTML/HTML 文件
    const contentFiles = [];
    zipEntries.forEach(entry => {
        const entryName = entry.entryName;
        if (entryName.match(/\.xhtml$/i) || entryName.match(/\.html$/i)) {
            if (!entryName.includes('META-INF') && !entryName.includes('toc.ncx')) {
                contentFiles.push(entryName);
            }
        }
    });

    console.log(`找到 ${contentFiles.length} 个内容文件`);

    // 提取文本内容
    let fullText = '';
    contentFiles.sort().forEach((fileName, index) => {
        const content = zip.readAsText(fileName, 'utf-8');
        
        // 去除 HTML 标签，保留文本
        const text = content
            .replace(/<title>.*?<\/title>/gi, '')
            .replace(/<[^>]+>/g, '\n')
            .replace(/&nbsp;/g, ' ')
            .replace(/&ldquo;/g, '"')
            .replace(/&rdquo;/g, '"')
            .replace(/&lsquo;/g, "'")
            .replace(/&rsquo;/g, "'")
            .replace(/&mdash;/g, '——')
            .replace(/&hellip;/g, '…')
            .replace(/&middot;/g, '·')
            .replace(/&#\d+;/g, '')
            .replace(/\n\s*\n/g, '\n\n')
            .trim();

        fullText += `\n\n========== 第 ${index + 1} 部分 ==========\n\n`;
        fullText += text;
        
        console.log(`已提取：${fileName}`);
    });

    // 保存完整文本
    const outputPath = path.join(OUTPUT_DIR, '完整内容.txt');
    fs.writeFileSync(outputPath, fullText, 'utf-8');
    console.log(`\n✅ 提取完成！完整内容已保存到：${outputPath}`);
    console.log(`总字符数：${fullText.length.toLocaleString()}`);

} catch (error) {
    console.error(' 解析失败:', error.message);
    console.log('\n请确保：');
    console.log('1. EPUB 文件在当前目录下');
    console.log('2. 文件名正确');
    console.log('3. 已安装 adm-zip: npm install adm-zip');
}
