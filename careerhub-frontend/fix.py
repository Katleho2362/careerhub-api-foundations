content = open('src/app/jobs/page.tsx', encoding='utf-8').read()
content = content.replace('              \n                href=', '              <a\n                href=')
open('src/app/jobs/page.tsx', 'w', encoding='utf-8').write(content)
print('Done')
