// Exact allowlist: public proposal and its presentation assets only.
// Never publish workspace modules, project files, generated assets, or APIs.
const PUBLIC_ASSETS=new Set(['/proposal.css','/style.css','/assets/blocks.svg','/assets/dm-sans.ttf','/assets/dm-sans-semibold.ttf','/assets/space-grotesk.ttf']);
export function publicAssetPath(request){
  if(!['GET','HEAD'].includes(request.method))return null;
  const pathname=new URL(request.url).pathname;
  if(pathname==='/'||pathname==='/proposal.html')return '/proposal.html';
  return PUBLIC_ASSETS.has(pathname)?pathname:null;
}
