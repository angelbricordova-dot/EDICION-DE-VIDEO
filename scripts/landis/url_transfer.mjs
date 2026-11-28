// Saca el enlace de descarga (S3 firmado, 1 h) del transfer de SwissTransfer del vlog: node scripts/landis/url_transfer.mjs
import { createRequire } from "module"; const require = createRequire(new URL("../../package.json", import.meta.url).pathname);
const { chromium } = require("playwright");
const b=await chromium.launch(); const ctx=await b.newContext({acceptDownloads:true}); const pg=await ctx.newPage();
await pg.goto("https://www.swisstransfer.com/dl/01a21f38-a2ab-7ff7-a727-35123f95307c",{waitUntil:"networkidle",timeout:60000});
pg.on('download', d=>{console.log('DESCARGA', d.url().replace(/(token|key)=[^&]+/g,'$1=…')); d.cancel();});
await pg.getByText('Decline',{exact:true}).click({timeout:8000}).catch(()=>{}); await pg.waitForTimeout(1000); await pg.getByText('Download all',{exact:true}).first().click({timeout:10000}).catch(e=>console.log('click1',e.message.slice(0,80)));
await pg.waitForTimeout(8000);
 await b.close();
