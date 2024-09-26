const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal'); // Importa qrcode-terminal

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


// Diccionario para mantener el estado de las conversaciones y ultimo msj
let clientStates = {};

// Evento que se dispara cuando se recibe un mensaje
client.on('message', async msg => {

    const mediosDePago = `Medios de pago
Bancolombia cuenta de ahorros 05360360654 
Nequi - Daviplata 3213162622
Cesar Sierra

_pd. enviar comprobante de pago_`;

    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const name = contact.pushname ? contact.pushname.split(" ")[0] : 'Usuario'; // Si no hay pushname, usa 'Usuario' por defecto


    // Estado inicial de la conversación si no existe
    if (!clientStates[msg.from]) {
        clientStates[msg.from] = { step: 0 };
    }

    let currentState = clientStates[msg.from].step;

    // Si el mensaje contiene alguna palabra clave inicial
    if (currentState === 0 && /interesado|hola|información|buenas|buen|más información|cordial|como estas/i.test(msg.body)) {

        await chat.sendSeen();
        await delay(3000);
        await chat.sendStateTyping();
        await delay(5000);
        await chat.clearState();
        await client.sendMessage(msg.from, `¡Saludos ${name}! Sea bienvenido a *Apostilla Colombia Traducciones Oficiales*.`);
        await delay(3000);
        await chat.sendStateTyping();
        await delay(3000);
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
        const respuestaMenu = parseInt(msg.body); // Convertir a número la opción

        switch (respuestaMenu) {
            case 1:
                await chat.sendSeen();
                await delay(3000);
                await chat.sendStateTyping();
                await delay(5000);
                await chat.clearState();
                await client.sendMessage(msg.from, `Indícanos el tipo de documento que vas a apostillar:
    1. Documentos de universidad
    2. Documentos de bachillerato
    3. Antecedentes Judiciales
    4. Registros Civiles
    5. Apostilla de documentos en España
    6. Otro tipo de apostillas.
    7. volver atras`);
                clientStates[msg.from].step = 3; // Actualizar el estado para el segundo menú
                break;
                
            case 2:
                await client.sendMessage(msg.from, 'Traducciones oficiales: ¿Cuál es el idioma del documento que necesitas traducir?');
                clientStates[msg.from].step = 2; // Actualizar el estado a traducciones oficiales
                break;

            case 3:
                await client.sendMessage(msg.from, 'Homologación de títulos en España: Por favor, indícanos el país donde obtuviste tu título.');
                clientStates[msg.from].step = 2; // Actualizar el estado a homologación de títulos
                break;

            case 4:
                await client.sendMessage(msg.from, 'Asesoría Visa de estudiantes en España: ¿En qué parte de España deseas estudiar?');
                clientStates[msg.from].step = 2; // Actualizar el estado a visa de estudiantes
                break;

            case 5:
                await client.sendMessage(msg.from, 'Por favor, indícanos qué otros servicios te interesan.');
                clientStates[msg.from].step = 2; // Actualizar el estado a otros servicios
                break;
            default:
                await delay(3000);
                await chat.sendStateTyping();
                await client.sendMessage(msg.from, `¡${name}! debes seleccionar un opción valida, digite un número del 1 al 5`);
                break;
        }
        return;
    }

    // Ejemplo de cómo seguir interactuando según el estado (documentos de apostilla en este caso)
    if (currentState === 2) {
        await chat.sendSeen();
        await delay(3000);
        await chat.sendStateTyping();
        await delay(5000);
        await chat.clearState();
        await client.sendMessage(msg.from, `Vamos a validar la información y en seguida nos pondremos en contacto contigo.`);
        clientStates[msg.from].step = 0; // Resetear el estado a 0 para la próxima conversación
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


