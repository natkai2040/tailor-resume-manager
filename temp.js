const fs = require('fs');

const data = JSON.parse(fs.readFileSync('public/12_2025_SFT.json', 'utf8'));

function replaceStrings(obj) {
    if (typeof obj === 'string') {
        return 'xx';
    } else if (Array.isArray(obj)) {
        return obj.map(replaceStrings);
    } else if (typeof obj === 'object' && obj !== null) {
        const newObj = {};
        for (const key in obj) {
            newObj[key] = replaceStrings(obj[key]);
        }
        return newObj;
    } else {
        return obj;
    }
}

const newData = replaceStrings(data);

fs.writeFileSync('public/12_2025_SFT.json', JSON.stringify(newData, null, 4));