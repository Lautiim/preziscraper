const puppeteer = require('puppeteer-core');
const argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');

var prezi = null;
var path = require('path');
var out = path.join(__dirname, 'img');

// set prezi url
if("url" in argv){
    prezi= argv.url;
} else{
    throw "PREZI nOT FONT"
}

if("out" in argv){
    out = argv.out;
}

if (!fs.existsSync(out)){
    fs.mkdirSync(out, { recursive: true });
}

// uncomment if you want to emulate different devices
// const devices = require('puppeteer-core/DeviceDescriptors');
// const iPad = devices['iPad Pro'];

// default values
if(process.platform === "win32"){
    var chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
    if (!fs.existsSync(chromePath)) {
        chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    }
} else {
    var chromePath = "/usr/bin/google-chrome";
}
var height = 1252;
var width = 1440;

// overwrite default if present
// Forzar siempre Opera GX, ignorar argumento chromePath

if("width" in argv){
    width = argv.width
}

if("height" in argv){
    height = argv.height
}

// prezi control
const fullscr = ".webgl-viewer-navbar-fullscreen-enter-icon";
const nxt = ".webgl-viewer-navbar-next-icon";
const breaker = ".viewer-common-info-overlay-button-label";

(async () => {
    const browser = await puppeteer.launch(
        {
            executablePath: chromePath,
            headless: true // <-- así verás la ventana
        }
    );
    const page = await browser.newPage();
    // await page.emulate(iPad);
    await page.setViewport({
        width: width,
        height: height,
        deviceScaleFactor: 1,   
    });
    await page.goto(prezi,{
        timeout: 3000000
    });

    // Esperar y hacer clic en el botón 'Presentar' si existe
    const presentBtn = '.viewer-common-info-overlay-button-filled';
    try {
        await page.waitForSelector(presentBtn, { timeout: 10000 });
        await page.click(presentBtn);
        console.log('Botón Presentar clickeado');
    } catch (e) {
        console.log('No se encontró el botón Presentar, continuando...');
    }

    n = 0;
    // TODO: Refactor code into promise
    await page.waitForSelector(fullscr);
    await page.click(fullscr);

    // TODO: work on check if bar is existing
    // await page.waitFor(() => !document.querySelector(nxt));
    await page.screenshot({path: `${out}/prezi-${n}.png`});
    await page.mouse.move(100, 100);
    await page.waitForSelector(".webgl-viewer-navbar-next-icon");
    await page.click(".webgl-viewer-navbar-next-icon");

    while(true){
        n++;
        await page.waitFor(1200);
        if (await page.$(breaker) !== null) break;
        await page.screenshot({path: `${out}/prezi-${n}.png`});
        await page.mouse.move(100, 100);
        try {
            await page.waitForSelector(nxt, { timeout: 10000 });
            await page.click(nxt);
        } catch (e) {
            console.log('No se encontró el botón de siguiente, finalizando captura.');
            break;
        }
    }

    await browser.close();

    // Ejecutar el script para crear el PDF automáticamente
    const { exec } = require('child_process');
    const pdfScript = path.join(__dirname, 'imgtopdf.js');
    exec(`node "${pdfScript}" --in "${out}" --out "${path.join(__dirname, 'prezi.pdf')}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error al crear el PDF: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
        }
        console.log(stdout);
        console.log('PDF creado correctamente.');
    });
})();