import fs from 'fs';
import path from 'path';
import pngToIco from 'png-to-ico';

const iconSizes = [16, 32, 48, 64, 128, 256];
const iconPaths = iconSizes.map(size => path.resolve('build', `icon_${size}.png`));

pngToIco(iconPaths)
  .then(buf => {
    fs.writeFileSync(path.resolve('build', 'icon.ico'), buf);
    fs.writeFileSync(path.resolve('public', 'favicon.ico'), buf);
    console.log('Successfully generated build/icon.ico and public/favicon.ico!');
  })
  .catch(err => {
    console.error('Failed generating ICO:', err);
    process.exit(1);
  });
