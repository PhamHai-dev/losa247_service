const fs = require('fs');
const path = 'frontend/src/pages/client/ClientPages.jsx';
let content = fs.readFileSync(path, 'utf8');

const featuredStart = '        {mainFeatured && !search && page === 1 && (';
const featuredEnd = '        )}\n\n        <div className="blog-layout" style={{ marginTop: 60 }}>\n          <div className="blog-main-content">';
const featuredEndAlt = '        )}\r\n\r\n        <div className="blog-layout" style={{ marginTop: 60 }}>\r\n          <div className="blog-main-content">';

let startIndex = content.indexOf(featuredStart);
let endIndex = content.indexOf(featuredEnd);
let len = featuredEnd.length;

if (endIndex === -1) {
    endIndex = content.indexOf(featuredEndAlt);
    len = featuredEndAlt.length;
}

if (startIndex !== -1 && endIndex !== -1) {
    let featuredBlock = content.substring(startIndex, endIndex + 10); // get to '        )}'
    let afterBlock = content.substring(endIndex + 10);
    
    // Now extract the <div className="blog-layout"... \n <div className="blog-main-content"> part
    let layoutPartMatch = afterBlock.match(/(\s*<div className="blog-layout" style=\{\{ marginTop: 60 \}\}>\s*<div className="blog-main-content">)/);
    
    if (layoutPartMatch) {
        let layoutPart = layoutPartMatch[1];
        
        let newFeaturedBlock = featuredBlock.replace('className="featured-section"', 'className="featured-section" style={{ marginBottom: 40 }}');
        
        // Remove featuredBlock and layoutPart from their original positions
        let newContent = content.substring(0, startIndex) + layoutPart + '\n' + newFeaturedBlock + afterBlock.substring(layoutPart.length);
        
        fs.writeFileSync(path, newContent, 'utf8');
        console.log('Success');
    } else {
        console.log('Could not find layout part');
    }
} else {
    console.log('Could not find start or end', startIndex, endIndex);
}
