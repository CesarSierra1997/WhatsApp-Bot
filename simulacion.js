class Simulaciones{
    constructor(chat, client, msg, name){
        this.chat = chat;
        this.client = client;
        this.msg = msg;
        this.name = name;
    }
    async delay(ms) {
        return new Promise(res => setTimeout(res, ms));
    }

    async simulacion_corta(){
        await this.chat.sendSeen();
        await this.delay(3000);
        await this.chat.sendStateTyping();
        await this.delay(5000);
        await this.chat.clearState();
    }
    
    async simulacion_media(){
        await this.chat.sendSeen();
        await this.delay(5000);
        await this.chat.sendStateTyping();
        await this.delay(8000);
        await this.chat.clearState();
    }
    
    async simulacion_larga(){
        await this.chat.sendSeen();
        await this.delay(8000);
        await this.chat.sendStateTyping();
        await this.delay(1200);
        await this.chat.clearState();
    } 

}

module.exports = Simulaciones;