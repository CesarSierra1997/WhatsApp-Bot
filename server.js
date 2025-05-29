const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
require('dotenv').config();
const { botApostilla } = require('./botApostilla');
const Simulaciones = require('./simulacion');

const app = express();
const PORT = process.env.PORT || 8080;

// Variables para el estado del cliente y el código QR
let isClientReady = false;
let qrImageUrl = '';

// Verifica qué ruta de Chromium está disponible
let chromePath = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium';
if (!fs.existsSync(chromePath)) chromePath = '/usr/bin/chromium-browser';

// Inicializa cliente de WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        executablePath: chromePath,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ],
    }
});

// Muestra el código QR en consola y en web
client.on('qr', async (qr) => {
    console.log('QR Code recibido, generando imagen...');
    qrImageUrl = await qrcode.toDataURL(qr);
    require('qrcode-terminal').generate(qr, { small: true });
});

// Marca el cliente como listo
client.on('ready', () => {
    console.log('¡El cliente de WhatsApp está listo!');
    isClientReady = true;
});

// Interfaz web simple para mostrar el código QR
app.get('/', (req, res) => {
    res.send(`
        <h1>WhatsApp Bot Server</h1>
        <p>Estado: ${isClientReady ? '✅ Conectado' : '⏳ Esperando conexión'}</p>
        ${qrImageUrl ? `<h2>Escanea este código QR con WhatsApp para iniciar sesión:</h2>
        <img src="${qrImageUrl}" alt="QR Code">` : '<p>No hay QR disponible aún.</p>'}
    `);
});



// Import all your menu variables and conversation logic from index.js
const mediosDePago = `Medios de pago
Bancolombia cuenta de ahorros 05360360654 
Nequi - Daviplata 3213162622
Cesar Sierra

_pd. enviar comprobante de pago_`;

const menuInicial = `*Menu principal*
    1. Apostilla de documentos.
    2. Traducciones Oficiales.
    3. Homologación de títulos en España.(mantenimiento)
    4. Asesoría Visa de estudiantes España.(mantenimiento)
    5. Otros Servicios
    6. Salir.`;

const idiomasMenu = `*Traducciones Oficiales*
Selecciona el idioma del documento:

1. Inglés 🇬🇧
2. Francés 🇫🇷
3. Italiano 🇮🇹
4. Alemán 🇩🇪
5. Portugués 🇵🇹
6. Volver al menú principal
`;
const idiomas = {
    1: "Inglés",
    2: "Francés",
    3: "Italiano",
    4: "Alemán",
    5: "Portugués"
};

const menuApostillaDocumentos = `
    1. Documentos de universidad
    2. Documentos de bachillerato
    3. Antecedentes Judiciales
    4. Registros Civiles
    5. Apostilla de documentos en España
    6. Otro tipo de apostillas
    7. Volver al menú principal
`;

async function pdfComprobante(client, msg, clientStates, mediosDePago) {
    if (msg.type === 'document' || msg.type === 'image') {
        await client.sendMessage(msg.from,
            `📄 *¡Archivo recibido!*\nExcelente trabajo,en seguida te contactaremos con nuestro equipo para finalizar el proceso.\nSí necesita cotizar otro servicio escriba *Menu principal* o *hola*._Gracias por elegir nuestros servicios_ 👍`
        );
        delete clientStates[msg.from]; // Resetea estado
    } else {
        // Incrementa los intentos
        clientStates[msg.from].intentos += 1;

        // Si supera los 3 intentos, cancela el proceso
        if (clientStates[msg.from].intentos >= 3) {
            await client.sendMessage(msg.from,
                "❌ Has enviado varios mensajes incorrectos. Por favor, inicia el proceso nuevamente escribiendo *Hola* o contacta asistencia."
            );
            delete clientStates[msg.from]; // Cancelar flujo
        } else {
            // Aún tiene intentos restantes
            await client.sendMessage(msg.from,
                "⚠️ Por favor, envía *solo archivos PDF*.\nSi conoce el monto a pagar, envie el comprobante de pago para agilizar el proceso, de lo contrario, envíe el archivo en pdf y espere su cotización."
            );
        }
    }
}

// Diccionario para mantener el estado de las conversaciones y ultimo msj
let clientStates = {};

// Evento que se dispara cuando se recibe un mensaje
client.on('message', async msg => {
    // Obtener el chat y el contacto de la conversación actual
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const name = contact.pushname ? contact.pushname.split(" ")[0] : ''; // Si no hay pushname, usa 'Usuario' por defecto

    //instancia de la clase Simulaciones
    const simular = new Simulaciones(chat, client, msg, name);

    // Estado inicial de la conversación si no existe
    if (!clientStates[msg.from]) {
        clientStates[msg.from] = { step: 0 };
    }

    let currentState = clientStates[msg.from].step;
    const estado = clientStates[msg.from];

    // Estado de la conversación esperando PDF o imagen
    if (estado && estado.step === 'esperando_archivo') {
        await pdfComprobante(client, msg, clientStates, mediosDePago);
        return;
    }

    //Estado de la conversación 0 - Esperando mensaje
    if (currentState === 0 && /interesado|hola|información|buenas|buen|más información|Menu principal||Menú principal|cordial|como estas/i.test(msg.body)) {
        // await simular.simulacion_corta();
        await client.sendMessage(msg.from, `¡Saludos ${name}! \nSea bienvenido a *Apostilla Colombia Traducciones Oficiales*.`);
        // await simular.simulacion_media();
        await client.sendMessage(msg.from, `¿Cuéntenos, en qué servicio está interesado?\n${menuInicial}`);

        clientStates[msg.from].step = 1; // Actualizar el estado 1 - Menú principal
        return;
    }

    //Estado de la conversación 1 - Menú principal
    if (currentState === 1) {
        const simular = new Simulaciones(chat, client, msg, name);

        const respuestaMenuPrincipal = parseInt(msg.body);

        switch (respuestaMenuPrincipal) {
            case 1: // Apostilla de documentos
                // await simular.simulacion_corta();
                await client.sendMessage(msg.from, `*Apostilla de documentos*\nIndícanos el tipo de documento que vas a apostillar:\n${menuApostillaDocumentos}`);
                clientStates[msg.from].step = 2; // Actualizar al estado 2 - Apostilla de documentos
                break;

            case 2: // TRADUCCIONES OFICIALES
                // await simular.simulacion_corta();
                await client.sendMessage(msg.from, idiomasMenu);
                clientStates[msg.from] = {
                    step: 3, // Actualizar al estado 3 - Traducciones oficiales
                    esperandoIdioma: true // Bandera para validar la selección
                };
                break;

            case 3: // HOMOLOGACIÓN DE TÍTULOS
                await client.sendMessage(msg.from, 'Homologación de títulos en España: Por favor, indícanos el país donde obtuviste tu título.');
                clientStates[msg.from].step = 4; // Actualizar el estado a homologación de títulos
                break;

            case 4:
                await client.sendMessage(msg.from, 'Asesoría Visa de estudiantes en España: ¿En qué parte de España deseas estudiar?');
                clientStates[msg.from].step = 0; // Actualizar el estado a visa de estudiantes
                break;

            case 5:
                await client.sendMessage(msg.from, 'Por favor, indícanos qué otros servicios te interesan.');
                clientStates[msg.from].step = 0; // Actualizar el estado a otros servicios
                break;

            default:
                await delay(3000);
                await chat.sendStateTyping();
                await client.sendMessage(msg.from, `⚠️ *Menú pricipal*\n¡${name}! debes seleccionar una opción válida, digita un número del 1 al 5.`);
                break;
        }
        return;
    }

    //Estado de la conversación 2 - Apostilla de documentos
    if (currentState === 2) {
        const respuestaMenuApostilla = parseInt(msg.body);

        switch (respuestaMenuApostilla) {
            case 1:
                await client.sendMessage(msg.from, `*Apostilla de documentos*\nDocumentos de universidad:\nValor $80.000 por documento,\ndebe adjuntar los documentos en *PDF* de manera individual con buena resolución.\nTiempo estimado de respuesta 3-5 días hábiles,\n\nlas apostillas las enviamos por este medio o al correo.`);

                await client.sendMessage(msg.from, `${mediosDePago}`);

                // Actualiza el estado del cliente para esperar el PDF o imagen
                clientStates[msg.from] = {
                    step: 'esperando_archivo',
                    intentos: 0
                };
                break;

            case 2:
                await client.sendMessage(msg.from, `*Apostilla de documentos*\nColegios de bogota:\nlegalizacion y apostilla\nValor $80.000 por documento,\ndebe adjuntar los documentos en PDF de manera individual con buena resolución. \ntiempo estimado de respuesta 15 días calendario.\n\nOtras ciudades:\nlegalizacion y apostilla\nValor $180.000 por documento,\ndebe adjuntar los documentos en PDF de manera individual con buena resolución, \ntiempo estimado de respuesta 15 días calendario.\n\nlas apostillas las enviamos por este medio o al correo.`);
                await pdfComprobante(client, msg, clientStates, mediosDePago);
                break;

            case 3:
                await client.sendMessage(msg.from, `*Apostilla de documentos*\nAntecedentes Judiciales con fines migratorios\nValor $80.000 por antecedente,\ndebe adjuntar la CC(Cédula Ciudadania) en *PDF* con buena resolución, \ntiempo estimado de respuesta 1 día.\n\nlas apostillas las enviamos por este medio o al correo.`);
                await client.sendMessage(msg.from, `${mediosDePago}`);
                break;

            case 4:

                await client.sendMessage(msg.from, `*Apostilla de documentos*\nRegistros Civiles: (valide su documento)\n    1. Registraduria Nacional (Auxiliares o principales)\n    Valor $120.000 por documento, debe adjuntar el documento en pdf de manera individual, tiempo de respues 15 días calendario.\n    2. Notarias Colombianas \n    Valor $80.000 por documento, debe compartir el codigo de apostilla (solicitarlo previamente en la notaria) tiempo de entrega 1 día habil.\n\n    *Nota* \n    _Los registros de registraduria vienen con un holograma o stiker plateado_.`);
                await client.sendMessage(msg.from, `${mediosDePago}`);
                break;

            case 5:
                await client.sendMessage(msg.from, 'apostilla españa.');
                clientStates[msg.from].step = 0; // Actualizar el estado a otros servicios
                break;

            case 6:
                await client.sendMessage(msg.from, 'Por favor, indícanos qué otros servicios te interesan.');
                clientStates[msg.from].step = 0; // Actualizar el estado a otros servicios
                break;

            case 7:
                await client.sendMessage(msg.from, "📌 Volviendo al menú principal...");
                await client.sendMessage(msg.from, menuInicial);
                clientStates[msg.from].step = 1;
                break;

            default:

                await client.sendMessage(msg.from, `⚠️ ¡${name}! debes seleccionar un opción valida, digite un número del 1 al 6`);
                break;
        }
        return;
    }

    //Estado de la conversación 3 - Traducciones oficiales
    if (currentState === 3 && clientStates[msg.from]?.esperandoIdioma) {
        const opcion = parseInt(msg.body.trim());

        if (opcion >= 1 && opcion <= 5) {
            const idiomaElegido = idiomas[opcion];
            clientStates[msg.from] = {
                step: 3,
                idiomaDocumento: idiomaElegido,
                esperandoDocumento: true
            };
            // await simular.simulacion_corta();
            await client.sendMessage(msg.from, `*Traducciones Oficiales*\n✅ Idioma seleccionado *${idiomaElegido}*. a continucación adjunte el archivo en *PDF* con buena resolución para indicarle la cotización de la traducción.`
            );

            clientStates[msg.from] = {
                step: 'esperando_archivo', // Actualizar el estado para esperar el PDF o imagen
                intentos: 0
            };
        }
        else if (opcion === 6) {
            await client.sendMessage(msg.from, `📌 Volviendo al menú principal...`);
            await client.sendMessage(msg.from, menuInicial);
            clientStates[msg.from].step = 1;
        }
        else {
            await client.sendMessage(msg.from, `*Traducciones Oficiales*
    ❌ Opción inválida. Por favor, escribe un número del 1 al 6 y seleccione su idioma.\n_${idiomas}_`
            );
        }
    }
});

// Handle client disconnects/reconnects
client.on('disconnected', (reason) => {
    console.log('Cliente desconectado:', reason);
    isClientReady = false;
    qrImageUrl = '';
    // Attempt to reconnect
    client.initialize();
});

// Initialize the client
client.initialize();

// Start the Express server
app.listen(PORT, () => {
    console.log(`Servidor Express iniciado en el puerto ${PORT}`);
    console.log(`Abre http://localhost:${PORT} para ver el código QR`);
});

