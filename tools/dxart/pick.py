# 畫中有話卡圖第 3 步：揀 168 個場景做卡（keep.json：第 n 張卡用邊個場景），抄去 Board-Game 嘅 dx/c000.webp…c167.webp
# python3 pick.py painted ../../dx
import json, os, shutil, sys
src, dst = sys.argv[1], sys.argv[2]
keep = json.load(open(os.path.join(os.path.dirname(__file__), 'keep.json')))
os.makedirs(dst, exist_ok=True)
for card, scene in enumerate(keep):
    shutil.copy(os.path.join(src, f'c{scene:03d}.webp'), os.path.join(dst, f'c{card:03d}.webp'))
print(len(keep), 'cards')
