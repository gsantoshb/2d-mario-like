"""Original, reproducible pixel art. Standard library only; no downloaded imagery."""
import math
import random
import struct
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / 'public' / 'assets'
OUT.mkdir(parents=True, exist_ok=True)


class Canvas:
    def __init__(self, width, height):
        self.w, self.h = width, height
        self.data = bytearray(width * height * 4)

    def rect(self, x, y, w, h, color):
        rgb = tuple(bytes.fromhex(color.lstrip('#'))) + (255,)
        for py in range(max(0, int(y)), min(self.h, int(y + h))):
            for px in range(max(0, int(x)), min(self.w, int(x + w))):
                i = (py * self.w + px) * 4
                self.data[i:i + 4] = bytes(rgb)

    def circle(self, cx, cy, radius, color):
        for y in range(int(cy-radius), int(cy+radius+1)):
            span = int(math.sqrt(max(0, radius**2-(y-cy)**2)))
            self.rect(cx-span, y, span*2+1, 1, color)

    def paste(self, other, x, y, scale=1):
        for py in range(other.h):
            for px in range(other.w):
                i = (py*other.w+px)*4
                if other.data[i+3]:
                    self.rect(x+px*scale, y+py*scale, scale, scale, other.data[i:i+3].hex())

    def save(self, name):
        def chunk(tag, data):
            return struct.pack('!I', len(data))+tag+data+struct.pack('!I', zlib.crc32(tag+data) & 0xffffffff)
        raw = b''.join(b'\0'+self.data[y*self.w*4:(y+1)*self.w*4] for y in range(self.h))
        png = b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR', struct.pack('!2I5B', self.w, self.h, 8, 6, 0, 0, 0))+chunk(b'IDAT', zlib.compress(raw))+chunk(b'IEND', b'')
        (OUT/name).write_bytes(png)


def actor(name, frame=0, alt=False):
    c = Canvas(32, 32)
    ink, hair, skin, shade = '26202b', '292027', 'd79769', 'a85f4e'
    shirts = {'balayya': ('f4c458','d68f3c'), 'chiru': ('54b69b','2b7b72'), 'pk': ('f0e8cf','b7b3aa'), 'boss': ('56506a','343044')}
    shirt, dark = shirts[name]
    if alt:
        shirt, dark = {'balayya':('f0783e','b74937'),'chiru':('7791d2','424773'),'pk':('76bfe3','397396')}[name]
    pants = 'e8d9b6' if name == 'balayya' else '343c51'
    bob = -1 if frame in (1, 3, 5, 12, 13) else 0
    if frame == 11:
        c.rect(6,25,22,5,ink);c.rect(7,24,7,4,skin);c.rect(14,24,12,4,shirt)
        return c
    # Wide shoulders, outlined warm face, distinct hair and moustaches.
    c.rect(9,3+bob,13,12,ink);c.rect(10,4+bob,11,10,skin)
    c.rect(10,4+bob,11,3,hair);c.rect(8,5+bob,3,5,hair);c.rect(20,5+bob,3,5,hair)
    if name == 'balayya':
        c.rect(11,2+bob,9,3,hair);c.rect(9,4+bob,3,3,'6a5145');c.rect(11,10+bob,9,2,hair);c.rect(12,11+bob,2,2,hair);c.rect(18,11+bob,2,2,hair)
    elif name == 'chiru':
        c.rect(10,1+bob,9,3,hair);c.rect(8,3+bob,12,3,hair);c.rect(12,10+bob,7,2,hair);c.rect(10,6+bob,2,2,hair)
    elif name == 'pk':
        c.rect(10,1+bob,10,4,hair);c.rect(8,3+bob,4,5,hair);c.rect(18,3+bob,5,4,hair);c.rect(12,11+bob,7,1,hair);c.rect(12,12+bob,6,1,'845542')
    else:
        c.rect(11,2+bob,9,3,'84808c');c.rect(9,4+bob,2,5,'979099');c.rect(20,4+bob,2,5,'979099');c.rect(11,11+bob,9,3,'807580')
    c.rect(12,8+bob,2,1,ink);c.rect(18,8+bob,2,1,ink);c.rect(15,9+bob,2,2,shade);c.rect(14,12+bob,3,1,'f6cba1')
    c.rect(13,14+bob,5,3,skin)
    c.rect(7,16+bob,18,10,ink);c.rect(8,16+bob,16,8,shirt);c.rect(8,22+bob,16,2,dark)
    c.rect(14,16+bob,3,7,dark);c.rect(15,17+bob,1,1,'f3dfb3');c.rect(15,20+bob,1,1,'f3dfb3')
    if name == 'pk':
        c.rect(11,15+bob,10,2,'c74e49');c.rect(10,17+bob,3,7,'df6251')
    if name == 'boss':
        c.rect(14,16+bob,4,7,'ded3cc');c.rect(15,17+bob,2,7,'a74c60')
    arm = 1 if frame in (2,4) else 0
    c.rect(5,17+bob+arm,3,7,ink);c.rect(6,17+bob+arm,2,4,shirt);c.rect(5,22+bob+arm,3,3,skin)
    c.rect(24,17+bob-arm,3,7,ink);c.rect(24,17+bob-arm,2,4,shirt);c.rect(24,22+bob-arm,3,3,skin)
    if frame in (8,9,12,13):
        c.rect(3,12+bob,4,7,shirt);c.rect(3,10+bob,4,3,skin);c.rect(25,12+bob,4,7,shirt);c.rect(25,10+bob,4,3,skin)
    step = 2 if frame in (2,3) else -2 if frame in (4,5) else 0
    if frame in (6,7): step = 3
    c.rect(9-step,24,6,6,ink);c.rect(10-step,24,4,4,pants);c.rect(9-step,29,7,2,ink)
    c.rect(18+step,24,6,6,ink);c.rect(19+step,24,4,4,pants);c.rect(18+step,29,7,2,ink)
    if frame == 10:
        c.rect(10,8,4,1,'f8e4ce');c.rect(17,8,4,1,'f8e4ce')
    return c


for name in ['balayya','chiru','pk','boss']:
    for alt in ([False,True] if name != 'boss' else [False]):
        key = name+('-alt' if alt else '')
        sheet=Canvas(32*14,32)
        for f in range(14): sheet.paste(actor(name,f,alt),f*32,0)
        sheet.save(key+'.png')
        actor(name,0,alt).save(key+'-idle.png')

lineup=Canvas(256,80)
lineup.rect(0,0,256,80,'171923')
for i,name in enumerate(['balayya','chiru','pk','boss']):lineup.paste(actor(name),i*64,8,2)
lineup.save('lineup.png')

for theme in ['village','city','fort']:
    rng=random.Random(27)
    c=Canvas(768,216)
    sky={'village':['756478','b78483','e8ad8a','efc69b'],'city':['26364d','3e6179','7095a5','c1b9a2'],'fort':['252239','44344e','755369','af7c80']}[theme]
    for y in range(216):c.rect(0,y,768,1,sky[min(3,y//48)])
    c.circle(575,73,26,'f7d8a0' if theme!='fort' else 'd3bdb2')
    for x,y in [(35,32),(196,55),(355,29),(635,46)]:
        c.rect(x,y,62,5,'e8bfab' if theme=='village' else '8d97a2');c.rect(x+9,y-5,28,5,'e8bfab' if theme=='village' else '8d97a2')
    # Distant mountains and buildings form a seamless layer.
    for x in range(0,768,4):
        h=int(22+14*math.sin(x/75)+10*math.sin(x/31))
        c.rect(x,150-h,4,66+h,'866b79' if theme=='village' else '344456' if theme=='city' else '514257')
    for x in range(0,768,48):
        h=rng.randint(25,62);color='6c6573' if theme=='village' else '425569' if theme=='city' else '443b52'
        c.rect(x,156-h,38,h,color)
        for wy in range(160-h,150,8):
            for wx in range(x+5,x+34,10):c.rect(wx,wy,3,3,'cda281' if theme!='city' else '8e9c9e')
    if theme=='city':
        # Original Charminar-inspired silhouette.
        for x in [270,324]:
            c.rect(x,73,9,77,'b19d91');c.rect(x-3,79,15,4,'d4b79a');c.rect(x+2,64,5,9,'d4b79a');c.circle(x+4,63,4,'d4b79a')
        c.rect(279,105,45,45,'b19d91');c.rect(294,123,15,27,'425569');c.circle(301,124,7,'425569')
    for x in range(0,768,80):
        if theme=='village':
            c.rect(x+38,129,7,57,'514b50')
            for dx,dy,r in [(-7,0,15),(9,1,18),(0,-12,13)]:c.circle(x+40+dx,128+dy,r,'535f5b')
            c.rect(x,160,35,25,'be8f73');c.rect(x-3,157,42,4,'735d60');c.rect(x+13,171,8,14,'695762')
        elif theme=='fort':
            c.rect(x,124,60,60,'493c50');c.rect(x,119,10,5,'493c50');c.rect(x+20,119,10,5,'493c50');c.rect(x+50,119,10,5,'493c50')
            c.rect(x+20,144,16,40,'2a293d');c.circle(x+28,146,8,'2a293d')
        else:
            c.rect(x,155,60,40,'334b5e');c.rect(x,151,65,4,'627480');c.rect(x+12,165,7,10,'d1b584');c.rect(x+38,165,7,10,'d1b584')
    c.rect(0,192,768,24,'393e43' if theme!='village' else '615744')
    if theme=='village':
        for x in range(0,768,7):c.rect(x,190-rng.randrange(6),2,9,'7c7950')
        for x in range(0,768,22):
            y=78+int(12*math.sin(x/52));c.rect(x,y,12,1,'5b535d');c.rect(x+2,y+1,6,6,['e8b963','c66362','82aaa0'][x%3])
    c.save(theme+'.png')

# Terrain tiles and original enemies.
for theme,color,top in [('village','75604a','a1a36a'),('city','5e6473','a1aeb8'),('fort','5e4c65','a28b9b')]:
    c=Canvas(32,32);c.rect(0,0,32,32,color);c.rect(0,0,32,4,top);c.rect(0,4,32,2,'393541')
    for y in [9,21]:
        c.rect(0,y,32,1,'49404b')
        for x in [0,16]:c.rect(x+(8 if y==21 else 0),y,1,12,'49404b')
    c.rect(3,7,5,1,top);c.rect(20,20,6,1,top);c.save('tile-'+theme+'.png')
for kind in ['patrol','ranged']:
    c=actor('boss');c.rect(9,3,13,4,'a34f63' if kind=='patrol' else '5b697c');c.rect(9,17,15,6,'8f4f63' if kind=='patrol' else '526b7b')
    if kind=='ranged':c.rect(23,18,8,3,'d4bd91')
    c.save(kind+'.png')
print('Created original pixel sheets, lineup, environments, tiles, and enemies.')

# Additional original river and studio scenes; varied silhouettes share the game's pixel grid.
for theme in ['forest','studio']:
    c=Canvas(768,216)
    colors=['29455c','426d7c','67968d','9bb8a1'] if theme=='forest' else ['27283f','454064','716082','b6989d']
    for y in range(216):c.rect(0,y,768,1,colors[min(3,y//52)])
    c.circle(590,48,19,'ded7aa')
    for x in range(0,768,4):
        h=45+int(24*math.sin(x/80)+12*math.sin(x/37))
        c.rect(x,160-h,4,h+36,'365e65' if theme=='forest' else '514667')
    if theme=='forest':
        c.rect(0,171,768,45,'528f9a')
        for x in range(0,768,31):c.rect(x,180+(x%17),16,1,'9ac9b5')
        for x in range(16,768,96):
            c.rect(x+15,111,8,72,'3e4549')
            for dx,dy,r in [(0,0,20),(16,-12,24),(32,2,20)]:c.circle(x+dx,100+dy,r,'39746a')
            c.circle(x+12,91,16,'548a70')
            c.rect(x+6,184,23,8,'788a79')
    else:
        for x in range(0,768,128):
            c.rect(x,104,88,88,'6c596d');c.rect(x-4,100,96,5,'c4a189')
            c.rect(x+12,118,20,32,'32344d');c.rect(x+52,118,20,32,'32344d');c.rect(x+30,162,26,30,'3f394f')
            c.rect(x+100,72,4,120,'343447');c.rect(x+95,68,14,8,'e8d5aa')
            c.rect(x+96,79,2,64,'968197');c.rect(x+107,79,2,64,'968197')
        c.rect(0,192,768,24,'3a374c')
        for x in range(0,768,48):c.rect(x,196,24,2,'9b7b8e')
    c.save(theme+'.png')

# Shared palette is consumed by runtime rendering and numeric contrast tests too.
import json
palette=json.loads((OUT.parents[1]/'src/game/data/palette.json').read_text())
for theme,top in palette['tops'].items():
    edge=palette['outline'];side=palette['sides'][theme]
    c=Canvas(32,32);c.rect(0,0,32,32,side);c.rect(0,0,32,1,edge);c.rect(0,1,32,3,top);c.rect(0,4,32,2,edge)
    for y in [14,26]:
        c.rect(0,y,32,1,edge)
        for x in [8,24]:c.rect(x,y-8,1,8,edge)
    c.save('tile-'+theme+'.png')
    c=Canvas(32,8);c.rect(0,0,32,8,edge);c.rect(1,1,30,2,top);c.rect(1,4,30,3,side);c.rect(8,5,1,2,top);c.rect(24,5,1,2,top);c.save('platform-'+theme+'.png')

c=Canvas(16,16);c.rect(5,7,7,8,palette['outline']);c.rect(6,8,5,6,'fff1ba');c.rect(2,3,12,6,palette['outline']);c.rect(1,5,14,4,palette['outline']);c.rect(3,3,10,4,'ed7453');c.rect(2,6,12,2,'ed7453');c.rect(5,3,3,2,'fff3cb');c.rect(10,5,2,2,'fff3cb');c.rect(7,10,1,2,'75513e');c.rect(10,10,1,2,'75513e');c.save('growshroom.png')
c=Canvas(16,16)
rows=['.......##.......','.......##.......','......####......','......####......','..############..','...##########...','....########....','....########....','...##########...','...##########...','..####....####..','..##........##..']
for y,row in enumerate(rows):
    for x,ch in enumerate(row):
        if ch=='#':c.rect(x, y+2,1,1,palette['outline'])
for y,row in enumerate(rows):
    for x,ch in enumerate(row):
        if ch=='#' and x>0 and x<15 and y>0 and y<11 and rows[y-1][x]=='#' and rows[y+1][x]=='#' and row[x-1]=='#' and row[x+1]=='#':c.rect(x,y+2,1,1,palette['coin'])
c.rect(6,7,1,3,palette['outline']);c.rect(9,7,1,3,palette['outline']);c.save('star.png')
print('Updated five themes, high-contrast terrain, and original collectible sprites.')
