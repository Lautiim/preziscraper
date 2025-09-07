PDFDocument = require('pdfkit');
const argv = require('minimist')(process.argv.slice(2));

var input="./img";
var output="./prezi.pdf";

if("im" in argv) input = argv.im;
if("out" in argv) output = argv.out;

fs = require('fs');
const path = require('path');
doc = new PDFDocument({
    autoFirstPage: false
});

imgs = [];

doc.pipe(fs.createWriteStream(output));

console.log("Creating pdf",output);

fs.readdir(input, function (err, files) {
    // Manejo de errores
    if (err) {
        return console.log('No se puede escanear el directorio: ' + err);
    } 
    // Listando todos los archivos usando forEach
    files.forEach(function (file) {
        // Haz lo que quieras con el archivo
        imgs.push(file.substring(6).replace(".png",""));
    });
    x = imgs.sort(function(a, b) {
        return a - b;
    });
    for(var i in x){
        console.log(`escribiendo Imagen #${i} al pdf`);
        var img = doc.openImage(`${input}/prezi-${i}.png`);
        doc.addPage({size: [img.width, img.height]});
        doc.image(img, 0, 0, {width: img.width, height: img.height});
    }

    console.log("guardando en",output);
    doc.end();
    
    // borrar archivos si se desea
    if("del" in argv){
        fs.readdir(input, (err, files) => {
            if (err) throw err;
            for (const file of files) {
                fs.unlink(path.join(input, file), err => {
                    if (err) throw err;
                });
            }
        });
    }
});

