from pathlib import Path
import base64,re,json,zipfile
root=Path(__file__).resolve().parents[1];out=root/'dist';out.mkdir(exist_ok=True)
assets={}
retired={'assets/sprites/icp.png','assets/sprites/hosts.png','assets/sprites/spirits.png','assets/intro/arrival.wav'}
for p in sorted((root/'assets').rglob('*')):
 if p.is_file() and p.relative_to(root).as_posix() not in retired and p.suffix.lower() in ('.png','.jpg','.jpeg','.webp','.wav'):
  mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.wav':'audio/wav'}[p.suffix.lower()]
  assets[p.relative_to(root).as_posix()]='data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
s=(root/'index.html').read_text();css=(root/'styles.css').read_text()
s=re.sub(r'(src="[\w-]+\.js|href="styles\.css)\?v=[^"]+',r'\1',s)
# Store each bitmap once; CSS and markup resolve from the same embedded asset map.
# Fill direct CSS URLs at startup: large image data exceeds CSS variable token limits.
initial_css=re.sub(r"url\('assets/[^']+'\)",'none',css)
for path in assets:s=s.replace('src="'+path+'"','data-embedded-asset="'+path+'"')
s=s.replace('<link rel="stylesheet" href="styles.css">','<style id="embedded-style">'+initial_css+'</style>')
boot='window.DCC_ASSETS='+json.dumps(assets,separators=(',',':'))+';'
boot+='document.getElementById("embedded-style").textContent='+json.dumps(css)+'.replace(/url\(\x27(assets\/[^\x27]+)\x27\)/g,(_,path)=>\'url("\'+window.DCC_ASSETS[path]+\'")\');'
boot+='document.querySelectorAll("[data-embedded-asset]").forEach(el=>el.src=window.DCC_ASSETS[el.dataset.embeddedAsset]);'
s=s.replace('<script src="catalog.js"></script>','<script>'+boot+'</script>\n<script src="catalog.js"></script>')
for name in ['catalog','content','audio','touch-controls','progress','animation','game','library','intro']:
 s=s.replace(f'<script src="{name}.js"></script>','<script>\n'+(root/(name+'.js')).read_text().replace('</script','<\\/script')+'\n</script>')
s=s.replace('href="DESIGN.md"','href="dark-chaos-carnival/DESIGN.md"')
(out/'Dark-Chaos-Carnival.html').write_text(s)
with zipfile.ZipFile(out/'Dark-Chaos-Carnival-Alpha.zip','w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(root.rglob('*')):
  if p.is_file() and not any(part in {'.git','dist','node_modules','__pycache__'} for part in p.relative_to(root).parts):z.write(p,Path('dark-chaos-carnival')/p.relative_to(root))
print('Source ZIP:',round((out/'Dark-Chaos-Carnival-Alpha.zip').stat().st_size/1e6,1),'MB')
print('Single-file game:',round((out/'Dark-Chaos-Carnival.html').stat().st_size/1e6,1),'MB')
