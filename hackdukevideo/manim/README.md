# Manim Educational Videos

3B1B-style mathematical animations using Manim Community Edition.

## Markdown to LaTeX Converter

This project includes `md_to_tex.py` - a tool that converts Markdown math expressions to properly formatted LaTeX for MacTeX/Manim.

### Quick Start

```bash
# Convert a markdown file
python md_to_tex.py input.md

# Watch for changes and auto-convert
python md_to_tex.py --watch input.md

# Print to stdout
python md_to_tex.py input.md --stdout
```

### Features

- **Automatic fraction conversion**: `64\pi c^2/15` → `\frac{64\pi c^2}{15}`
- **Exponent formatting**: `x^12` → `x^{12}`
- **Fractions in exponents**: `u^{1/2}` → `u^{\frac{1}{2}}`
- **Preserves existing LaTeX**: Won't double-convert `\frac{}{}`

### Examples

| Input | Output |
|-------|--------|
| `1/2` | `\frac{1}{2}` |
| `64c^2/15` | `\frac{64c^2}{15}` |
| `x^12` | `x^{12}` |
| `\frac{1}{2}` | `\frac{1}{2}` (preserved) |

See `test_md_to_tex.py` for more examples.

## Installation

```bash
# Install Manim and dependencies
pip install -r requirements.txt

# Or install directly
pip install manim

# For LaTeX support (required for MathTex):
# macOS:
brew install --cask mactex

# Ubuntu/Debian:
sudo apt-get install texlive-full

# Windows:
# Download and install MiKTeX from miktex.org
```

## Usage

### Preview Mode (Fast, Lower Quality)
```bash
manim -pql scenes/spinning_toy_scene.py SpinningToyScene
```

### High Quality Render
```bash
manim -pqh scenes/spinning_toy_scene.py SpinningToyScene
```

### Production Quality (1080p)
```bash
manim --quality=h scenes/spinning_toy_scene.py SpinningToyScene
```

### 3D Scene
```bash
manim -pqh scenes/spinning_toy_scene.py SpinningToy3D
```

## Output

Videos are saved to:
```
media/videos/spinning_toy_scene/[QUALITY]/
```

## Project Structure

```
manim/
├── scenes/
│   └── spinning_toy_scene.py    # Scene definitions
├── scripts/
│   └── *.md                      # Voiceover scripts
├── media/                        # Generated videos (auto-created)
├── requirements.txt
└── README.md
```

## Available Scenes

| Scene | Description |
|-------|-------------|
| `SpinningToyScene` | Complete 2D walkthrough with equations |
| `SpinningToy3D` | 3D solid of revolution visualization |

## Tips

- **Always test with `-pql` first** — it's much faster
- Use `self.wait()` for pauses between animations
- MathTex uses LaTeX syntax with escaped backslashes: `\\frac{}{}`
- Colors are defined in the scene's `C` dictionary
- Run `manim --help` for all options
