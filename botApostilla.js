const Simulaciones = require('./simulacion');
const delay = ms => new Promise(res => setTimeout(res, ms)); 


async function botApostilla(chat, client, msg, clientStates, name) {
    const simular = new Simulaciones(chat, client, msg, name);

    const respuestaMenu = parseInt(msg.body); // Convertir a número la opción

    switch (respuestaMenu) {
        case 1:
            await simular.simulacion_corta();
            await client.sendMessage(msg.from, `Indícanos el tipo de documento que vas a apostillar:
    1. Documentos de universidad
    2. Documentos de bachillerato
    3. Antecedentes Judiciales
    4. Registros Civiles
    5. Apostilla de documentos en España
    6. Otro tipo de apostillas.
    7. Volver atrás.`);
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
            await client.sendMessage(msg.from, `¡${name}! debes seleccionar una opción válida, digita un número del 1 al 5.`);
            break;
    }
}

module.exports = { botApostilla };
