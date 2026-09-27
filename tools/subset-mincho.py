"""
見出しの明朝（Shippori Mincho B1 ExtraBold）を「このサイトで使う文字だけ」に絞った woff2 を作る。

    python3 tools/subset-mincho.py /path/to/ShipporiMinchoB1-ExtraBold.ttf

元フォント（OFL・約15MB）は Google Fonts のリポジトリから取る:
  https://raw.githubusercontent.com/google/fonts/main/ofl/shipporiminchob1/ShipporiMinchoB1-ExtraBold.ttf

文字の一覧は tools/mincho-chars.txt。見出しに新しい漢字を足したら、ここに足してから作り直す
（足し忘れた字は、端末の明朝体で表示されるだけで、崩れはしない）。
ひらがな・カタカナ・英数字・よく使う記号は、一覧になくても全部入れている。
"""
import sys
from pathlib import Path
from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
src = sys.argv[1]
chars = set((ROOT / "tools/mincho-chars.txt").read_text(encoding="utf-8").strip())
safety = set(chr(c) for c in range(0x20, 0x7F))            # ASCII
safety |= set(chr(c) for c in range(0x3041, 0x3097))        # ひらがな
safety |= set(chr(c) for c in range(0x30A1, 0x30FB))        # カタカナ
safety |= set("ー、。「」『』（）！？・…―─〜：；，．　“”‘’％＆＋－＝／")
text = "".join(sorted(chars | safety))

out = ROOT / "public/fonts/shippori-mincho-b1-800-subset.woff2"
opts = subset.Options()
opts.flavor = "woff2"
opts.layout_features = ["palt", "kern", "liga"]
opts.name_IDs = ["*"]
opts.notdef_outline = True
font = subset.load_font(src, opts)
sub = subset.Subsetter(opts)
sub.populate(text=text)
sub.subset(font)
subset.save_font(font, str(out), opts)
print(out, out.stat().st_size // 1024, "KB,", len(text), "chars")
