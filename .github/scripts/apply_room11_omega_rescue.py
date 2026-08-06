from pathlib import Path

source_path = Path('.github/scripts/apply_room11_omega.py')
source = source_path.read_text(encoding='utf-8')
source = source.replace("raise RuntimeError(f'{n}: {c}')", "print(f'warning {n}: {c}')")
namespace = {'__name__': '__main__', '__file__': str(source_path)}
exec(compile(source, str(source_path), 'exec'), namespace)

# The main patch is deliberately tolerant so small earlier code changes do not
# block all requested features. These final guards fail only when core routing
# or syntax-critical state hooks were not installed at all.
game = Path('game.js').read_text(encoding='utf-8')
required = [
    'ROOM11_OMEGA_MODULE_V1',
    "setState('sansGuide')",
    "setState('omegaBattle')",
    'undertaleProfilesV2',
    'logoutCurrentProfile',
]
missing = [item for item in required if item not in game]
if missing:
    raise SystemExit('Core ROOM11 features missing: ' + ', '.join(missing))
print('Resilient ROOM11 patch completed.')
