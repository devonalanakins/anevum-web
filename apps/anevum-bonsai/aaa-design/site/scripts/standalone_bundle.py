from pathlib import Path
from bs4 import BeautifulSoup
from html import escape
import base64,os,json
R=Path(__file__).resolve().parents[1]
paths=['','collection',*[f'collection/tree-{n:02d}' for n in range(1,6)],'chronicle','atelier','journal','journal/time-is-the-medium','practice','about','field-notes/acorn-01']
styles=(R/'assets/site.css').read_text()
base=BeautifulSoup((R/'index.html').read_text(),'html.parser')
header=str(base.find('header',class_='site-header'))
footer=str(base.find('footer',class_='footer'))
js=(R/'assets/site.js').read_text()
start=js.index('const studies=')
js=js[start:]
# On each virtual view change, reactivate native controls with same semantics.
js=js.replace('document.querySelectorAll(\'[data-study]\')','viewRoot.querySelectorAll(\'[data-study]\')').replace('document.querySelectorAll(\'[data-filter]\')','viewRoot.querySelectorAll(\'[data-filter]\')').replace('document.querySelectorAll(\'[data-timeline] li\')','viewRoot.querySelectorAll(\'[data-timeline] li\')').replace('document.getElementById(\'study-note\')','viewRoot.querySelector(\'#study-note\')').replace('document.getElementById(\'stone-path\')','viewRoot.querySelector(\'#stone-path\')').replace('document.getElementById(\'root-path\')','viewRoot.querySelector(\'#root-path\')')
# Resolve local path on original page to canonical route.
route_map={(R/(p+'/index.html' if p else 'index.html')).resolve():('/'+p if p else '/') for p in paths}
media_data={}
for p in (R/'media').glob('*.webp'):
 media_data[p.resolve()]='data:image/webp;base64,'+base64.b64encode(p.read_bytes()).decode('ascii')

def rewrite(doc,current):
 for a in doc.select('a[href]'):
  href=a.get('href','')
  if href.startswith('#') or href.startswith('http') or href.startswith('mailto:'):continue
  dest=(R/current/href).resolve() if current else (R/href).resolve()
  route=route_map.get(dest)
  if route is None:raise ValueError((current,href,str(dest)))
  a['href']='#'+route
 for img in doc.select('img[src],source[srcset]'):
  attr='srcset' if img.name=='source' else 'src'
  src=img.get(attr,'')
  p=(R/current/src).resolve() if current else (R/src).resolve()
  if p not in media_data:raise ValueError(('unknown media',src,current))
  img[attr]=media_data[p]
 return str(doc)
# header/footer use home root links
h=BeautifulSoup(header,'html.parser');rewrite(h,'')
f=BeautifulSoup(footer,'html.parser');rewrite(f,'')
templates=[]
for current in paths:
 page=R/current/'index.html' if current else R/'index.html'
 soup=BeautifulSoup(page.read_text(),'html.parser')
 main=soup.select_one('main#main')
 rewrite(main,current)
 route='/'+current if current else '/'
 templates.append(f'<template data-route="{escape(route)}" data-title="{escape(soup.title.get_text())}">{main.decode_contents()}</template>')
# Make no-JS default visibly informative
script='''
const screens = new Map(Array.from(document.querySelectorAll('template[data-route]'), el=>[el.dataset.route,el]));
const viewRoot=document.querySelector('main#main');
function render(){
 let route=decodeURIComponent(location.hash.slice(1))||'/';
 let template=screens.get(route)||screens.get('/');
 if(!screens.has(route))route='/';
 viewRoot.innerHTML=template.innerHTML;
 document.title=template.dataset.title;
 document.querySelectorAll('.desktop-nav a, .mobile-nav nav a').forEach(a=>{
   const destination=a.getAttribute('href')?.slice(1);
   const active=destination==='/' ? route==='/' : (route===destination || route.startsWith(destination+'/'));
   if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 });
 const menu=document.querySelector('details.mobile-nav');if(menu)menu.open=false;
 if(!location.hash.includes('main'))window.scrollTo({top:0,behavior:'instant'});
 bindInteractions();
}
function bindInteractions(){
'''+js+'''
}
window.addEventListener('hashchange',render);render();
'''
body=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow,noarchive"><meta name="theme-color" content="#0b1710"><title>ANEVUM — A Living Atlas · Interactive Design Review</title><style>{styles}</style></head><body><a class="skip" href="#main">Skip to content</a>{h}<main id="main" tabindex="-1"><section class="wrap chapter"><h1>ANEVUM — The Living Atlas</h1><p>Enable JavaScript to experience the interactive review, or open the separate static site files.</p></section></main>{f}{''.join(templates)}<script>{script}</script></body></html>'''
out=R/'ANEVUM-Living-Atlas-Interactive-Review.html'
out.write_text(body,encoding='utf-8')
print('interactive single-file preview bytes:',out.stat().st_size,'routes',len(paths))
