import json
import unittest
from pathlib import Path
from urllib.request import urlopen
ROOT=Path(__file__).resolve().parents[1]
class ReleaseTests(unittest.TestCase):
    def test_manifest(self):
        m=json.loads((ROOT/'extension/manifest.json').read_text())
        self.assertEqual(m['name'],'FluxGate')
        self.assertEqual(m['manifest_version'],3)
    def test_codespaces(self):
        cfg=json.loads((ROOT/'.devcontainer/devcontainer.json').read_text())
        self.assertIn(6080,cfg['forwardPorts'])
        self.assertEqual(cfg['portsAttributes']['6080']['visibility'],'private')
    def test_icons(self):
        for n in (16,32,48,128): self.assertTrue((ROOT/f'extension/icons/icon{n}.png').is_file())
if __name__=='__main__': unittest.main()
