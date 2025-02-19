[English](https://github.com/new-sankaku/stable-diffusion-webui-simple-manga-maker) : [Japanese](https://github.com/new-sankaku/stable-diffusion-webui-simple-manga-maker/blob/main/README_JP.md)

# Manga Editor Desu! Pro Edition
This is an extension of Stable diffusion WebUI (Forge).

However, all functions can be used on the demo site only, not the extension.
[Desu!](https://new-sankaku.github.io/SP-MangaEditer/)

Manga Editor Desu! is a lightweight browser application designed for intuitive operation. It supports a variety of features such as drag-and-drop image import, file selection, Text2Image functionality, and Image2Image functionality. For beginners, it offers pre-equipped panel layouts, making it easy to create manga. Additionally, it includes a knife tool that allows for professional panel layout customization, enabling you to freely cut panels. The features are continuously evolving, and regular updates are recommended.
For those who find updates bothersome, the Demo site is recommended.

## Main Page
<img src="https://new-sankaku.github.io/SP-MangaEditer-docs/01_mainpage.webp" width="800">

## Main Page With Txt2Img Window
<img src="https://new-sankaku.github.io/SP-MangaEditer-docs/10_prompt2.webp" width="800">

## Image Prompt Helper
<img src="https://new-sankaku.github.io/SP-MangaEditer-docs/03_prompthelper.webp" width="800">

## Support Language
<img src="https://new-sankaku.github.io/SP-MangaEditer-docs/02_trans.webp" height="400">

## Grid Line / Knife Mode
<div style="display: flex; align-items: flex-start;">
<img src="https://new-sankaku.github.io/SP-MangaEditer-docs/05_gridline.webp" height="350">
<img src="https://new-sankaku.github.io/SP-MangaEditer-docs/06_knifemode.webp" height="350">
</div>

## Dark Mode / Light Mode
<div style="display: flex; align-items: flex-start;">
<img src="https://new-sankaku.github.io/SP-MangaEditer-docs/09_darkmode.webp" height="350">
<img src="https://new-sankaku.github.io/SP-MangaEditer-docs/09_lightmode.webp" height="350">
</div>

## Blend Mode
<img src="https://new-sankaku.github.io/SP-MangaEditer-docs/11_blendmode.webp" height="800">

## Blend Mode Sample
<div style="display: flex; align-items: flex-start;">
<img src="https://new-sankaku.github.io/SP-MangaEditer-docs/12_blend.webp" height="350">
<img src="https://new-sankaku.github.io/SP-MangaEditer-docs/13_blend.webp" height="350">
</div>



## Drag on Drop
<img src="https://new-sankaku.github.io/SP-MangaEditer-docs/14_Drag on drop.webp" width="800">

## Effect(GLFX)
<div style="display: flex; align-items: flex-start;">
    <img src="https://new-sankaku.github.io/SP-MangaEditer-docs/04_gpix01.webp" width="400">
    <img src="https://new-sankaku.github.io/SP-MangaEditer-docs/04_gpix02.webp" width="400">
</div>

## Text, Speech Bubbles, Pen
<div style="display: flex; align-items: flex-start;">
<img src="https://new-sankaku.github.io/SP-MangaEditer-docs/08_speechbubble.webp" width="400">
<img src="https://new-sankaku.github.io/SP-MangaEditer-docs/07_font.webp" width="400">
</div>


## Features
- **Multiple languages**: English, Japanese, Korean, French, Chinese, Russian, Spanish, Portuguese, Thailand. Once you select a language, it will be loaded in the selected language from next time.
- **Page Presets**: Preset comic panel layouts. 29 vertical, 16 horizontal.
- **Panels**: Create and customize panels. Shape, color, line width, etc.
- **Speech Bubbles**: More than 40 different speech bubble styles, each with customizable background color, line color, and transparency settings.
- **Custom speech bubbles**: Create speech bubbles with coordinate specification or freehand drawing. Seven types of lines available. Smoothing process also included.
- **Auto-fit**: Images generated within or dropped into comic panels are automatically scaled and cropped appropriately.
- **Overlays**: Display images as overlays when dropped outside of frames.
- **Layers**: Manage images, text, and panels as layers that will be familiar to graphic designers and artists alike.
- **Image Editing Features**: Adjust angle, position, scale, changes along the X and Y axes, horizontal flip, vertical flip.
- **Image Effects**: Sepia, grayscale, gamma, blur, vibrance, pixelation.
- **Image Effects(Glfx)**: Unsharp Mask, Zoom Blur, Dot Screen, Hexagonal Pixelate, Ink, Hue / Saturation
- **Text**: Vertical writing, horizontal writing, bold, shadow, outline, neon, a variety of fonts suitable for comics.
- **Image text**: Preset text for images.
- **Effect 1**: One-click process to convert color images to black and white tones.
- **Effect 2**: 25 types of blend modes, similar to those found in Adobe Photoshop and other software.
- **Undo/Redo Function**: Freely undo or redo changes while editing.
- **Project Save/Load**: Save and load work-in-progress projects to continue from where you left off.
- **Settings Save/Load**: Save and load settings changed in the extension for a consistent and hassle-free workflow.
- **Image Exporting**: Export completed pages in a format suitable for printing or digital distribution.
- **Text2Image**: Generate images directly within panels via Stable diffusion WebUI (Forge).
- **Image2Image**: Generate images directly within panels via Stable diffusion WebUI (Forge).
- **Prompt Queue**: Bulk queue prompts to easily generate different character versions in the same page or panel.
- **Pen/Eraser tools**: Basic pen and eraser tool, change line width, color, line style, shadow. Erase lines, or portions of images.
- **Canvas Zoom In/Zoom Out**: Basic pen and eraser tool, change line width, color, line style, shadow. Erase lines, or portions of images.
- **Dark mode/Light mode**: When you switch, the selected mode will be applied from next time.
- **Tutorial**: There is a simple tutorial. After setting the language, select Tutorial at the top of the language settings.

# Demo Site  
[SP-MangaEditer](https://new-sankaku.github.io/SP-MangaEditer/)  
To use the Text2Image/Image2Image features you need to connect to the Stable Diffusion WebUI.

# Install(git clone only)
>git clone https://github.com/new-sankaku/stable-diffusion-webui-simple-manga-maker.git
>cd stable-diffusion-webui-simple-manga-maker\SP-MangaEditer
>index.html

Upload
>git fetch origin

# Install(extension install)
https://github.com/new-sankaku/stable-diffusion-webui-simple-manga-maker.git  
<img src="https://new-sankaku.github.io/SP-MangaEditer-docs/02_.webp" width="800">
*:All functions work on the Demo Site.

## How to Contribute
- **Bug Reports**: If you find a bug, please create a new issue in [Issues](https://github.com/new-sankaku/stable-diffusion-webui-simple-manga-maker/issues) and include **[Bug]** in the title.
- **Feature Suggestions**: If you have an idea for a new feature, please create a new issue in [Issues](https://github.com/new-sankaku/stable-diffusion-webui-simple-manga-maker/issues) and include **[Feature Request]** in the title.
- **Documentation Improvements**: If you notice any typos or errors in the documentation, please submit a pull request with possible corrections. You may also add to [Issues](https://github.com/new-sankaku/stable-diffusion-webui-simple-manga-maker/issues) if necessary.

## Communication
If you have questions or discussions about the project, please post in [Issues](https://github.com/new-sankaku/stable-diffusion-webui-simple-manga-maker/issues) or join our [Discord](https://discord.gg/XCp7dyHj3N) server.

Thank you!
