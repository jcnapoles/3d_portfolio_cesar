from pathlib import Path
from rembg import remove, new_session
out = remove(Path("public/cesar.webp").read_bytes(), session=new_session("isnet-general-use"))
Path("scripts/source").mkdir(parents=True, exist_ok=True)
Path("scripts/source/cesar-cutout.png").write_bytes(out)
