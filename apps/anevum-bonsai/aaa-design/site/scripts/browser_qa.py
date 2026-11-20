from pathlib import Path
import socketserver,http.server,threading,json,sys
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
PORT=8905
routes=['','collection',*[f'collection/tree-{i:02}' for i in range(1,6)],'chronicle','atelier','journal','journal/time-is-the-medium','practice','about','field-notes/acorn-01']
widths=[320,390,768,1440,1920]
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(ROOT),**kwargs)
 def log_message(self,*args):pass
class Server(socketserver.ThreadingTCPServer):allow_reuse_address=True
srv=Server(('127.0.0.1',PORT),Handler)
threading.Thread(target=srv.serve_forever,daemon=True).start()
results=[]
shots=ROOT/'qa';shots.mkdir(exist_ok=True)
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
  for width in widths:
   page=browser.new_page(viewport={'width':width,'height':900 if width>=1440 else 844},device_scale_factor=1,reduced_motion='reduce')
   for route in routes:
    url=f'http://127.0.0.1:{PORT}/'+(route+'/' if route else '')
    response=page.goto(url,wait_until='load',timeout=30000)
    assert response.status==200,(route,response.status)
    d=page.evaluate('''() => ({w:document.documentElement.clientWidth,s:document.documentElement.scrollWidth,b:document.body.scrollWidth,h1:document.querySelectorAll('main h1').length,links:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),broken:[...document.images].filter(img=>!img.complete||img.naturalWidth===0).map(x=>x.src),menu: getComputedStyle(document.querySelector('.mobile-nav')).display})''')
    if d['s']>d['w']+1 or d['b']>d['w']+1:
     print('OVERFLOW',width,route,d['w'],d['s'],d['b']); raise RuntimeError('overflow')
    assert d['h1']==1,(width,route,d['h1'])
    assert not d['broken'],(width,route,d['broken'])
    for href in d['links']:
     if href.startswith('http') or href.startswith('#'):continue
     assert (ROOT / route / href if route else ROOT/href).exists(),('dead link',route,href)
    results.append((width,route,'pass'))
    if width in (390,1440) and route in ('','collection','collection/tree-01','chronicle','atelier'):
     name=(route or 'home').replace('/','-')
     page.screenshot(path=str(shots/f'{name}-{width}.png'),full_page=False,animations='disabled')
   page.close()
  page=browser.new_page(viewport={'width':390,'height':844})
  page.goto(f'http://127.0.0.1:{PORT}/atelier/',wait_until='load')
  page.get_by_role('button',name='II · Shelter').click()
  assert page.locator('#study-note').inner_text().startswith('Sheltered contour')
  assert page.get_by_role('button',name='II · Shelter').get_attribute('aria-pressed')=='true'
  page.goto(f'http://127.0.0.1:{PORT}/chronicle/',wait_until='load')
  page.get_by_role('button',name='Planned').click()
  assert page.locator('.timeline li:not(.is-filtered)').count()==1
  page.goto(f'http://127.0.0.1:{PORT}/',wait_until='load')
  page.locator('.mobile-nav summary').click()
  assert page.locator('.mobile-nav').evaluate('(el)=>el.open')
  page.locator('.mobile-nav a[href]').first.click()
  assert '/collection/' in page.url
  browser.close()
 finally_result={'routes':len(routes),'viewports':len(widths),'route_viewport_checks':len(results),'interactive_atelier':'pass','interactive_chronicle':'pass','mobile_navigation':'pass','engine':'Chromium','web_vitals':'not measured','webkit':'not tested'}
 (ROOT/'qa'/'results.json').write_text(json.dumps(finally_result,indent=2))
 print(json.dumps(finally_result,indent=2))
finally:
 srv.shutdown();srv.server_close()
