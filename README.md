# redirecter

Egyszerű URL redirecter: base64-kódolja a cél URL-t, ellenőrzi a domain-t a `source/trusted.txt` alapján, és vagy azonnal átirányít (ha megbízható), vagy megerősítést kér.

Röviden hogyan működik:
- Felhasználó megad egy URL-t az oldalon.
- A kliens JS Base64-re kódolja az URL-t és létrehoz egy linket: `?link=<base64>&newtab=0|1`.
- Az oldal ellenőrzi a `link` query-t, dekódolja, betölti a `source/trusted.txt`-et és eldönti, hogy automatikusan átirányít vagy megerősítést kér.

Python: legegyszerűbb módja a redirect link előállításának (a szerver/hosting címét és az oldal elérési útját add meg a `base_url`-ban):

```python
import base64
import urllib.parse
import re

def make_redirect_link(base_url, target_url, newtab=False):
    # séma hozzáadása ha hiányzik
    if not re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*://', target_url):
        target_url = 'https://' + target_url

    b64 = base64.b64encode(target_url.encode('utf-8')).decode('ascii')
    return f"{base_url}?link={urllib.parse.quote(b64)}&newtab={'1' if newtab else '0'}"

# példa
print(make_redirect_link('https://example.com/redirecter.html', 'example.com/path', True))
```

Ez pontosan reprodukálja azt a URL-formátumot, amit a `source/script.js` vár: a `link` param Base64, és `newtab=1` vagy `0`.
