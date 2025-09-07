const puppeteer = require('puppeteer-core'); // Importa la librería puppeteer-core
const argv = require('minimist')(process.argv.slice(2)); // Procesa los argumentos de la línea de comandos
const fs = require('fs'); // Importa el módulo fs para trabajar con el sistema de archivos
const path = require('path'); // Importa el módulo path para trabajar con rutas de archivos

let prezi = null; // Variable para almacenar la URL del Prezi
let out = path.join(__dirname, 'img'); // Define la carpeta de salida para las imágenes

// Obtiene la URL del Prezi desde los argumentos
if ("url" in argv) {
    prezi = argv.url;
} else {
    throw "PREZI URL is missing. Please provide a URL using --url=<your_prezi_url>";
}

// Obtiene la ruta de salida desde los argumentos si se proporciona
if ("out" in argv) {
    out = argv.out;
}

// Crea la carpeta de salida si no existe
if (!fs.existsSync(out)) {
    fs.mkdirSync(out, { recursive: true });
}

// Define la ruta del ejecutable de Chrome según el sistema operativo
let chromePath = null;
if (process.platform === "win32") {
    chromePath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
    if (!fs.existsSync(chromePath)) {
        chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    }
} else {
    chromePath = "/usr/bin/google-chrome";
}

// Define las dimensiones de la ventana del navegador
let height = 1252;
let width = 1440;

// Permite sobrescribir las dimensiones por argumentos
if ("width" in argv) {
    width = argv.width;
}

if ("height" in argv) {
    height = argv.height;
}

// Selectores CSS para interactuar con la página de Prezi
const fullscr = ".webgl-viewer-navbar-fullscreen-enter-icon"; // Selector para el botón de pantalla completa
const nxt = ".webgl-viewer-navbar-next-icon"; // Selector para el botón de siguiente
const breaker = ".viewer-common-info-overlay-button-label"; // Selector para un elemento que indica el final de la presentación

(async () => {
    // Inicia una instancia de Puppeteer
    const browser = await puppeteer.launch({
        executablePath: chromePath,
        headless: true // Ejecuta el navegador en modo headless (sin interfaz gráfica)
    });

    // Crea una nueva página
    const page = await browser.newPage();

    // Establece el tamaño de la ventana
    await page.setViewport({
        width: width,
        height: height,
        deviceScaleFactor: 1,
    });

    // Navega a la URL del Prezi
    await page.goto(prezi, {
        timeout: 3000000 // Establece un tiempo de espera alto para la carga de la página
    });

    // Espera y hace clic en el botón 'Presentar' si existe
    const presentBtn = '.viewer-common-info-overlay-button-filled';
    try {
        await page.waitForSelector(presentBtn, { timeout: 10000 });
        await page.click(presentBtn);
        console.log('Botón Presentar clickeado');
    } catch (e) {
        console.log('No se encontró el botón Presentar, continuando...');
    }

    let n = 0; // Inicializa el contador de imágenes

    // Inicia la presentación en pantalla completa
    await page.waitForSelector(fullscr);
    await page.click(fullscr);

    // Captura la primera imagen
    await page.screenshot({ path: `${out}/prezi-${n}.png` });
    await page.mouse.move(100, 100);
    await page.waitForSelector(".webgl-viewer-navbar-next-icon");
    await page.click(".webgl-viewer-navbar-next-icon");

    // Captura las imágenes sucesivas hasta que se detecte el final
    while (true) {
        n++;
        await page.waitFor(1200); // Espera un breve período de tiempo
        if (await page.$(breaker) !== null) break; // Sale del bucle si se encuentra el elemento que indica el final
        await page.screenshot({ path: `${out}/prezi-${n}.png` }); // Captura la imagen
        await page.mouse.move(100, 100); // Mueve el mouse para evitar problemas con elementos interactivos
        try {
            await page.waitForSelector(nxt, { timeout: 10000 }); // Espera a que el botón de siguiente esté disponible
            await page.click(nxt); // Hace clic en el botón de siguiente
        } catch (e) {
            console.log('No se encontró el botón de siguiente, finalizando captura.');
            break; // Sale del bucle si no se encuentra el botón de siguiente
        }
    }

    // Cierra el navegador
    await browser.close();

    // Ejecuta el script para crear el PDF automáticamente si el flag --pdf está presente
    if (argv.pdf) {
        const { exec } = require('child_process');
        /**
         * @file Define la ruta al script imgtopdf.js.
         * @const {string} pdfScript - La ruta absoluta al script imgtopdf.js,
         * utilizada para convertir imágenes a formato PDF. Esta ruta se construye uniendo
         * el directorio del módulo actual (__dirname) con el nombre de archivo 'imgtopdf.js'.
         */
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
    }
})();