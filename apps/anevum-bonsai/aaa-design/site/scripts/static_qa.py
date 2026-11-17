from pathlib import Path
from bs4 import BeautifulSoup
import re,json, subprocess
r=Path(__file__).resolve().parents[1]
files=sorted(r.rglob('index.html'))
assert len(files)==14, len(files)
count=0
for file in files:
    html=file.read_text()
    soup=BeautifulSoup(html,'html.parser')
    assert soup.find('html').get('lang')=='en',file
    assert len(soup.select('main#main'))==1,file
    assert len(soup.select('main h1'))==1,(file,soup.select('main h1'))
    assert soup.find('meta',attrs={'name':'robots'}).get('content').startswith('noindex'),file
    assert soup.select_one('a.skip[href="#main"]'),file
    for link in soup.select('a[href]'):
        href=link['href']
        assert link.get_text(strip=True) or link.get('aria-label'),(file,'unlabeled link')
        if href.startswith('#'):continue
        if not href.startswith('http'):
            target=(file.parent/href).resolve()
            assert target.is_file(),(str(file.relative_to(r)),href,str(target))
            count+=1
    for img in soup.select('img[src]'):
        src=(file.parent/img['src']).resolve()
        assert src.is_file(),(file,src)
        assert img.get('alt') is not None,(file,img)
        assert img.get('width') and img.get('height'),file
    assert 'Acer palmatum' not in html,file
    assert 'root-over-rock completed' not in html,file
    assert 'not actual' in html.lower() or 'illustrative' in html.lower() or file.name=='index.html',file
    assert not re.search(r'href=["\']https?://(unsplash|pexels|googleapis)',html)
# user actual data fidelity
index=(r/'collection/index.html').read_text()
assert all(f'Tree {n:02}' in index for n in range(1,6))
assert 'The Acorn Experiment' in index
atelier=(r/'atelier/index.html').read_text()
assert 'Proposed / Not installed' in atelier
assert all(x in atelier for x in ('data-study="vertical"','data-study="shelter"','data-study="offset"'))
chrono=(r/'chronicle/index.html').read_text()
assert 'data-state="planned"' in chrono and 'data-state="observed"' in chrono
assert not re.search(r'data-state="completed"',chrono)
assert (r/'media/PROVENANCE.json').exists()
media=json.loads((r/'media/PROVENANCE.json').read_text())
assert media['authentic_tree_photographs_included'] is False
assert len(media['derivatives'])==6
assert subprocess.run(['node','--check',str(r/'assets/site.js')],capture_output=True).returncode==0
print(json.dumps({'routes':len(files),'internal_links_checked':count,'media_derivatives':len(media['derivatives']),'script_syntax':'pass','semantic_html':'pass','provenance_checks':'pass'},indent=2))
