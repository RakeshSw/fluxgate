import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class PublicSafetyTests(unittest.TestCase):
    def test_no_internal_identifiers_in_project(self):
        banned = ('eurofins', 'off-site services', 'osm-', 'osm.', 'nexus', 'orion-', 'cit44', 'cit43', 'rakeshswain', 'rocky.deboss')
        for path in ROOT.rglob('*'):
            if not path.is_file() or path == Path(__file__).resolve() or path.suffix.lower() in ('.png', '.pyc') or '__pycache__' in path.parts:
                continue
            content = path.read_text(encoding='utf-8')
            for word in banned:
                with self.subTest(file=str(path.relative_to(ROOT)), banned=word):
                    self.assertNotIn(word, content.lower())

    def test_no_bundled_credentials_or_certs(self):
        for path in ROOT.rglob('*'):
            if path.is_file():
                with self.subTest(path=str(path)):
                    self.assertNotIn(path.name.lower(), ('.env', 'id_rsa', 'credentials.json'))
                    self.assertNotIn(path.suffix.lower(), ('.pfx', '.p12', '.pem', '.key', '.crt'))

if __name__ == '__main__': unittest.main()
