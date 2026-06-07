import pytest
import tempfile
import os
from app.services.subtitle_generator import SubtitleGenerator


class TestSubtitleGenerator:
    def setup_method(self):
        self.generator = SubtitleGenerator()

    def test_generates_srt_file(self):
        with tempfile.NamedTemporaryFile(suffix=".srt", delete=False) as f:
            out_path = f.name

        try:
            scenes = ["Ciao mondo", "Questo è un test"]
            durations = [5.0, 3.0]
            result = self.generator.generate_srt(scenes, durations, out_path)

            assert os.path.exists(out_path)
            with open(out_path, encoding="utf-8") as f:
                content = f.read()

            assert "1" in content
            assert "2" in content
            assert "Ciao mondo" in content
            assert "Questo è un test" in content
            assert "-->" in content
        finally:
            if os.path.exists(out_path):
                os.unlink(out_path)

    def test_timing_format(self):
        formatted = self.generator._format_time(3661.5)
        assert "01:01:01" in formatted or "01:01:01" in formatted
