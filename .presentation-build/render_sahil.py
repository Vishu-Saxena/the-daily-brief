from pypdfium2 import PdfDocument
from pathlib import Path
src=Path(r'C:\Users\grami\Downloads\PPT_Sahil_Nandal.pdf')
out=Path(r'C:\Users\grami\Desktop\newsProject\.presentation-build\sahil_render')
pdf=PdfDocument(src)
for i,page in enumerate(pdf):
    page.render(scale=2.0).to_pil().save(out/f'page-{i+1:02}.png')
print('rendered',len(pdf),'pages')
