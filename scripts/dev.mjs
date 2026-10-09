import { watchSite, dist } from './lib/site.mjs';

const ctx = await watchSite();
const { port } = await ctx.serve({ servedir: dist, port: 5173 });
console.log(`\nDev server running at http://localhost:${port}/ (rebuilds on save)`);
