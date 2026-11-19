"""Combine GreenhouseCover.html, GreetingCard.html and PhotosFlow.html into Invitation.html.

Usage: python3 scripts/BuildInvitation.py (run from docs/cover-studies)."""
import re
cover=open('GreenhouseCover.html',encoding='utf-8').read()
greet=open('GreetingCard.html',encoding='utf-8').read()
photos=open('PhotosFlow.html',encoding='utf-8').read()
part=lambda s,t: re.search(r'<%s[^>]*>(.*?)</%s>'%(t,t),s,re.S).group(1)
cstyle=part(cover,'style'); gstyle=part(greet,'style')
a="  html,\n  body {\n    height: 100%;\n  }\n\n"; assert a in cstyle; cstyle=cstyle.replace(a,"")
b="    min-height: 100%;\n    box-sizing: border-box;\n    max-width: 440px;"; assert b in cstyle; cstyle=cstyle.replace(b,b.replace("100%","100svh"),1)
cmain=re.search(r'<main.*?</main>',cover,re.S).group(0).replace('<main class="card" aria-label="커버">','<section class="card" aria-label="커버">').replace('</main>','</section>')
gmain=re.search(r'<main.*?</main>',greet,re.S).group(0).replace('<main class="greeting" aria-label="인사말">','<section class="greeting" aria-label="인사말">').replace('</main>','</section>')
script='\n\n'.join(re.findall(r'<script>.*?</script>',cover,re.S))
pstyle=part(photos,'style')
pcss="\n  /* Photos: Cover Flow strip. */\n  .photos {"+pstyle.split("  .photos {",1)[1]
pmain=re.search(r'<section class="photos".*?</section>',photos,re.S).group(0)
pscript=re.search(r'<script>.*?</script>',photos,re.S).group(0)
gcss="\n  /* Greeting: one photo in a white instant-photo frame, then the greeting in the cover's sans. */\n  :root {\n    --frame: #ffffff;\n    --pencil: #3a3a37;\n  }\n\n  .greeting {"+gstyle.split("  .greeting {",1)[1]
head='''<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>진용·하림 청첩장</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
'''
open('Invitation.html','w',encoding='utf-8').write(head+"<style>"+cstyle.rstrip()+"\n"+gcss.rstrip()+"\n"+pcss.rstrip()+"\n</style>\n\n<main>\n"+cmain+"\n\n"+gmain+"\n\n"+pmain+"\n</main>\n\n"+script+"\n\n"+pscript+"\n")
print("ok")
