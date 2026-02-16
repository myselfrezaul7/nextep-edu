
const fs = require('fs');
const path = require('path');

const dir = 'public/assets';

function getDims(buffer) {
    // PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        return { type: 'PNG', width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
    }
    // JPEG
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
        let i = 2;
        while (i < buffer.length) {
            while (buffer[i] !== 0xFF) i++; // Find next marker
            while (buffer[i] === 0xFF) i++; // Skip padding FFs
            const marker = buffer[i];
            i++;
            const len = buffer.readUInt16BE(i);
            if (marker >= 0xC0 && marker <= 0xC3) { // SOF0-SOF3
                return { type: 'JPEG', height: buffer.readUInt16BE(i + 2), width: buffer.readUInt16BE(i + 4) };
            }
            i += len;
        }
    }
    // WebP
    if (buffer.slice(8, 12).toString() === 'WEBP') {
        if (buffer.slice(12, 16).toString() === 'VP8 ') {
            // Simple lossy
            const w = buffer.readUInt16LE(26) & 0x3fff;
            const h = buffer.readUInt16LE(28) & 0x3fff;
            return { type: 'WEBP (VP8)', width: w, height: h };
        } else if (buffer.slice(12, 16).toString() === 'VP8X') {
            // Extended
            const w = buffer.readUInt24LE(24) + 1;
            const h = buffer.readUInt24LE(27) + 1;
            return { type: 'WEBP (VP8X)', width: w, height: h };
        } else if (buffer.slice(12, 16).toString() === 'VP8L') {
            // Lossless
            const b = buffer[21];
            const w = 1 + (((buffer[22] & 0x3F) << 8) | b);
            const h = 1 + (((buffer[24] & 0xF) << 10) | (buffer[23] << 2) | (buffer[22] >> 6));
            return { type: 'WEBP (VP8L)', width: w, height: h };
        }
    }
    return null;
}

// Add readUInt24LE helper to Buffer
Buffer.prototype.readUInt24LE = function (offset) {
    return this[offset] + (this[offset + 1] << 8) + (this[offset + 2] << 16);
};

const files = fs.readdirSync(dir).filter(f => f.includes('hero_blend'));
console.log(`Checking ${files.length} files...`);

files.forEach(file => {
    try {
        const buffer = fs.readFileSync(path.join(dir, file));
        const dims = getDims(buffer);
        if (dims) {
            console.log(`${file}: ${dims.type} ${dims.width}x${dims.height}`);
        } else {
            console.log(`${file}: Unknown format. First 8 bytes: ${buffer.slice(0, 8).toString('hex')}`);
        }
    } catch (e) {
        console.error(`Error reading ${file}: ${e.message}`);
    }
});
