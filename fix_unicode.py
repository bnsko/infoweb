import re, os

def fix_unicode_escapes(content):
    # First handle surrogate pairs (emoji)
    def replace_surrogate_pair(m):
        hi = int(m.group(1), 16)
        lo = int(m.group(2), 16)
        code = 0x10000 + (hi - 0xD800) * 0x400 + (lo - 0xDC00)
        return chr(code)
    content = re.sub(
        r'\\u([dD][89aAbB][0-9a-fA-F]{2})\\u([dD][cCdDeEfF][0-9a-fA-F]{2})',
        replace_surrogate_pair, content
    )
    # Then handle remaining BMP characters
    def replace_bmp(m):
        code = int(m.group(1), 16)
        return chr(code)
    content = re.sub(r'\\u([0-9a-fA-F]{4})', replace_bmp, content)
    return content

files_to_fix = [
    'app/page.tsx',
    'components/widgets/StatsWidget.tsx',
    'components/widgets/WeatherPanel.tsx',
    'components/widgets/SpaceEnvWidget.tsx',
    'components/widgets/PopulationWidget.tsx',
]

for fpath in files_to_fix:
    if not os.path.exists(fpath):
        print("SKIP: " + fpath + " not found")
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    count = len(re.findall(r'\\u[0-9a-fA-F]{4}', content))
    if count == 0:
        print("SKIP: " + fpath + " (no escapes)")
        continue
    fixed = fix_unicode_escapes(content)
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(fixed)
    print("FIXED: " + fpath + " (" + str(count) + " escapes replaced)")

print("Done!")
