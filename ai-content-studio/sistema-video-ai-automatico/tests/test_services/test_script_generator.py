import pytest
from app.services.script_generator import ScriptGenerator


@pytest.mark.asyncio
class TestScriptGenerator:
    def setup_method(self):
        self.generator = ScriptGenerator()

    def test_generates_script_with_scenes(self):
        result = self.generator.generate(topic="intelligenza artificiale", duration_sec=60, style="informativo")
        assert "full_script" in result
        assert "scenes" in result
        assert len(result["scenes"]) >= 2
        assert len(result["full_script"]) > 50

    def test_different_styles(self):
        for style in ["informativo", "divertente", "didattico", "motivazionale", "serio"]:
            result = self.generator.generate(topic="AI", duration_sec=30, style=style)
            assert len(result["scenes"]) > 0, f"Stile {style} non ha prodotto scene"

    def test_scene_has_required_fields(self):
        result = self.generator.generate(topic="Python", duration_sec=30)
        for scene in result["scenes"]:
            assert "content" in scene
            assert "image_prompt" in scene
            assert "duration" in scene

    def test_duration_affects_number_of_scenes(self):
        short = self.generator.generate(topic="AI", duration_sec=20)
        long = self.generator.generate(topic="AI", duration_sec=120)
        assert len(short["scenes"]) <= len(long["scenes"])
