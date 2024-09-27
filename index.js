const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { botApostilla } = require('./botApostilla');
const Simulaciones = require('./simulacion');

// Inicializa el cliente
const client = new Client({
    authStrategy: new LocalAuth()
});

// Función que usamos para crear un delay entre una acción y otra
const delay = ms => new Promise(res => setTimeout(res, ms));

// Evento que se dispara cuando se recibe un código QR
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });  // Genera el código QR en la terminal
});

// Evento que se dispara cuando el cliente de WhatsApp está listo
client.on('ready', () => {
    console.log('¡El cliente de WhatsApp está listo!');
});

const mediosDePago = `Medios de pago
Bancolombia cuenta de ahorros 05360360654 
Nequi - Daviplata 3213162622
Cesar Sierra

_pd. enviar comprobante de pago_`;



// Diccionario para mantener el estado de las conversaciones y ultimo msj
let clientStates = {};

// Evento que se dispara cuando se recibe un mensaje
client.on('message', async msg => {
    // Obtener el chat y el contacto de la conversación actual
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const name = contact.pushname ? contact.pushname.split(" ")[0] : 'Usuario'; // Si no hay pushname, usa 'Usuario' por defecto

    //instancia de la clase Simulaciones
    const simular = new Simulaciones(chat, client, msg, name);


    // Estado inicial de la conversación si no existe
    if (!clientStates[msg.from]) {
        clientStates[msg.from] = { step: 0 };
    }

    let currentState = clientStates[msg.from].step;



    // Si el mensaje contiene alguna palabra clave inicial
    if (currentState === 0 && /interesado|hola|información|buenas|buen|más información|cordial|como estas/i.test(msg.body)) {
        await simular.simulacion_corta();
        await client.sendMessage(msg.from, `¡Saludos ${name}! Sea bienvenido a *Apostilla Colombia Traducciones Oficiales*.`);
        await simular.simulacion_media();
        await client.sendMessage(msg.from, `¿Cuéntanos, en qué servicio estás interesado?:
    1. Apostilla de documentos.
    2. Traducciones Oficiales.
    3. Homologación de títulos en España.
    4. Asesoría Visa de estudiantes España.
    5. Otros.`);

        clientStates[msg.from].step = 1; // Actualizar el estado al menú principal 1
        return;
    }

    // Procesar la respuesta del menú principal
    if (currentState === 1) {
        await botApostilla(chat, client, msg, clientStates, name);
        return;
    }

    // Ejemplo de cómo seguir interactuando según el estado (documentos de apostilla en este caso)
    if (currentState === 2) {

        if (msg.type === 'image') {

            await simular.simulacion_corta();
            await client.sendMessage(msg.from, `Vamos a validar la información y en seguida nos pondremos en contacto contigo.`);
            clientStates[msg.from].step = 0; 
        } else if (/SALIR/i.test(msg.body)) {
            await client.sendMessage(msg.from, `Gracias por su visita.`);
            clientStates[msg.from].step = 0; 
        } else {
            await client.sendMessage(msg.from, `Por favor, envía una imagen para continuar.
o escribe *SALIR* para terminar.`);
        }
    }

    if (currentState === 3) {
        const respuestaMenuApostilla = parseInt(msg.body); // Convertir a número la opción

        switch (respuestaMenuApostilla) {
            case 1:
                await chat.sendSeen();
                await delay(3000);
                await chat.sendStateTyping();
                await delay(5000);
                await chat.clearState();
                await client.sendMessage(msg.from, `Valor $80.000 por documento,
debe adjuntar los documentos en PDF de manera individual y con buena resolución, 
tiempo estimado de entrega 3-5 días hábiles,

las apostillas las enviamos por este medio o al correo.`);
                await chat.sendStateTyping();
                await delay(3000);
                await client.sendMessage(msg.from, `${mediosDePago}`);
                clientStates[msg.from].step = 2; // Actualizar el estado a documentos de apostilla
                break;

            case 2:
                await chat.sendSeen();
                await delay(2000);
                await chat.sendStateTyping();
                await delay(2000);
                await client.sendMessage(msg.from, `Colegios de bogota
Valor $80.000 por documento,
debe adjuntar los documentos en PDF de manera individual y con buena resolución, 
tiempo estimado de entrega 15 días,

otros colegios
legalizacion y apostilla
Valor $160.000 por documento,
debe adjuntar los documentos en PDF de manera individual y con buena resolución, 
tiempo estimado de entrega 15 días

las apostillas las enviamos por este medio o al correo.`);
                await chat.sendStateTyping();
                await delay(3000);
                await client.sendMessage(msg.from, `${mediosDePago}`);
                clientStates[msg.from].step = 2; // Actualizar el estado a traducciones oficiales
                break;

            case 3:
                await chat.sendSeen();
                await delay(2000);
                await chat.sendStateTyping();
                await delay(2000);
                await client.sendMessage(msg.from, `Colegios de bogota
Valor $80.000 por antecedente,
debe adjuntar la CC(Cédula Ciudadania) en PDF de manera individual y con buena resolución, 
tiempo estimado de entrega 15 días,

las apostillas las enviamos por este medio o al correo.`);
                await chat.sendStateTyping();
                await delay(3000);
                await client.sendMessage(msg.from, `${mediosDePago}`);
                clientStates[msg.from].step = 2; // Actualizar el estado a homologación de títulos
                break;

            case 4:
                await chat.sendSeen();
                await delay(2000);
                await chat.sendStateTyping();
                await delay(2000);
                await client.sendMessage(msg.from, `Indiquenos lo siguiente:
¿Que entidad expidío el documento?
1. Registraduria Nacional (Auxiliares o principales)
Valor $120.000, debe adjuntar el documento en pdf de manera individual y 
tiempo de entrega 1 dias.
2. Notarias Colombianas 
Valor $80.000 debe compartir el codigo de apostilla (solicitarlo en la notaria)
tiempo de entrega 1 día.

*Nota* 
_Los documento de registraduria vienen con un holograma o stiker plateado_.`);
                await chat.sendStateTyping();
                await delay(3000);
                await client.sendMessage(msg.from, `${mediosDePago}`);
                clientStates[msg.from].step = 2; // Actualizar el estado a homologación de títulos
                break;

            case 5:
                await client.sendMessage(msg.from, 'apostilla españa.');
                clientStates[msg.from].step = 2; // Actualizar el estado a otros servicios
                break;

            case 6:
                await client.sendMessage(msg.from, 'Por favor, indícanos qué otros servicios te interesan.');
                clientStates[msg.from].step = 2; // Actualizar el estado a otros servicios
                break;

            case 7:
                await client.sendMessage(msg.from, `¿Cuéntanos, en qué servicio estás interesado?:
    1. Apostilla de documentos.
    2. Traducciones Oficiales.
    3. Homologación de títulos en España.
    4. Asesoría Visa de estudiantes España.
    5. Otros.`);
                clientStates[msg.from].step = 1; 
                break;

            default:
                await delay(3000);
                await chat.sendStateTyping();
                await client.sendMessage(msg.from, `¡${name}! debes seleccionar un opción valida, digite un número del 1 al 6`);
                break;
        }
        return;
        
    }




});

// Inicia el cliente
client.initialize();


