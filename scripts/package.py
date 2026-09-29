from pathlib import Path
import base64,re,json,zipfile
root=Path(__file__).resolve().parents[1];out=root/'dist';out.mkdir(exist_ok=True)
assets={}
for p in sorted((root/'assets').rglob('*')):
 if p.is_file() and p.suffix.lower() in ('.png','.jpg','.jpeg','.webp','.wav'):
  mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.wav':'audio/wav'}[p.suffix.lower()]
  assets[p.relative_to(root).as_posix()]='data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
s=(root/'index.html').read_text();css=(root/'styles.css').read_text()
# Only references embedded in CSS/HTML are substituted here; runtime paths use the resolver.
for path,uri in assets.items():
 css=css.replace("url('"+path+"')","url('"+uri+"')")
 s=s.replace('src="'+path+'"','src="'+uri+'"')
s=s.replace('<link rel="stylesheet" href="styles.css">','<style>'+css+'</style>')
s=s.replace('<script src="catalog.js"></script>','<script>window.DCC_ASSETS='+json.dumps(assets,separators=(',',':'))+';</script>\n<script src="catalog.js"></script>')
for name in ['catalog','content','audio','touch-controls','game','library','intro']:
 s=s.replace(f'<script src="{name}.js"></script>','<script>\n'+(root/(name+'.js')).read_text().replace('</script','<\\/script')+'\n</script>')
s=s.replace('href="DESIGN.md"','href="dark-chaos-carnival/DESIGN.md"')
(out/'Dark-Chaos-Carnival.html').write_text(s)
with zipfile.ZipFile(out/'Dark-Chaos-Carnival-Prototype.zip','w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(root.rglob('*')):
  if p.is_file() and not any(part in {'.git','dist','node_modules','__pycache__'} for part in p.relative_to(root).parts):z.write(p,Path('dark-chaos-carnival')/p.relative_to(root))
print('Source ZIP:',round((out/'Dark-Chaos-Carnival-Prototype.zip').stat().st_size/1e6,1),'MB')
print('Single-file game:',round((out/'Dark-Chaos-Carnival.html').stat().st_size/1e6,1),'MB')
