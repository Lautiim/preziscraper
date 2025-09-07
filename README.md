# preziscraper

This is a Node.js tool to download and convert a Prezi presentation into a PDF.

## Why create this?

One of my lecturers created his lecture in Prezi and I wanted to work with it on my iPad. Unfortunately, Prezi won't let you download their slide sets as PDF unless you have a Pro Account, which is expensive and restrictive.

So I created this Prezi scraper to download the slides and convert them into a single PDF file. (jonguenther's reason)

In my case (Lautiim), I reworked this because too many of my professors use Prezi, and I couldn't pass the PDF to any AI to create a summary or sum like that. _De vago noma en criollo_.

## Requirements

- You need a Chromium-based browser (e.g., Google Chrome) installed on your PC.
- Alternatively, you can switch from `puppeteer-core` to `puppeteer` in [`preziscraper.js`](preziscraper.js).

## Installation

Clone this repository and run:

```bash
npm install
```

## Using this tool

Currently, the tool is split into two scripts. `[preziscraper.js](preziscraper.js)` contains the scraper, while `[imgtopdf.js](imgtopdf.js)` contains the pdf creation tool, to make a pdf out of the scraped Prezi slides.

If I find the time, I will merge them into one script.

### Scrape Prezis

To scrape a Prezi and save them as images, simply run

```bash
node preziscraper.js --url [PREZI_URL] 

```
To download a Prezi and save it as a PDF, run:

```bash
node preziscraper.js --url [PREZI_URL] --pdf
```

**Additional options:**

- `--width` to set the screenshot width (default: `1440`)
- `--height` to set the screenshot height (default: `1252`)
- `--out` to set the output folder for images (default: `img` in the repo folder)
- `--chromePath` to set the path to the Chrome executable [default: `C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe` for windows and `/usr/bin/google-chrome` for everything else]
- `--pdf` to automatically generate the PDF after downloading the images. The PDF will be created as `prezi.pdf` in the repo folder.

### Example

```bash
node preziscraper.js --url "https://prezi.com/view/your-presentation" --pdf
```

### Transform Prezi Slides to PDF
To transformt the scraped Prezi to PDF, run `node imgtopdf.js`.

**Additional options are:**
- `--in` to set the input folder [default is `./img` in the repo folder]
- `--out` to set the output path [default is `./prezi.pdf` in the repo folder]
- `--del` add this flag to delete all previously scraped images after the convertion is done

## How it works

The script uses [puppeteer-core](https://github.com/puppeteer/puppeteer) to control Chrome, access the Prezi presentation, navigate through each slide, and take screenshots.  
It then converts those images into a PDF using [`imgtopdf.js`](imgtopdf.js).

## Issues

### Transition
The script does not detect when a transition is finished. A fixed timeout of `1200 ms` is used between screenshots. If a transition is slow, the screenshot might be taken before the slide is fully loaded.

### Full Screen
When running in headless mode, the script may not enter full screen. If you want to see the browser, set `headless: false` in [`preziscraper.js`](preziscraper.js).

---

**Now you can easily download and convert your Prezi presentations to PDF!**

---

```
Love from Argentina!

    /\_/\
   ( o.o )
    > ^ <
   🇦🇷🇦🇷🇦🇷🇦🇷
```