from pypdfium2 import PdfDocument
from pathlib import Path
src=Path(r'C:\Users\grami\Downloads\Vetting_PPT-1.pdf')
out=Path(r'C:\Users\grami\Desktop\newsProject\.presentation-build\vetting_render')
pdf=PdfDocument(src)
for i,page in enumerate(pdf):
    img=page.render(scale=2.0).to_pil()
    img.save(out/f'page-{i+1:02}.png')
print('rendered',len(pdf),'pages', 'size', pdf[0].get_size())
