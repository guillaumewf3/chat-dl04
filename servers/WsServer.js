//module externe pour aider à faire le serveur de ws
const WebSocket = require('ws')

//crée le serveur de websocket, écoute sur le port 8080
const wss = new WebSocket.Server({'port':8080})

const lastMessages = []

//lorsqu'un client se connecte, la fct ci-dessous est appelée
//on reçoit l'objet WebSocket en argument
wss.on('connection', (ws) => {
    console.log("Nouvelle connexion !")

    sendLastMessages(ws)

    ws.on('close', () => {
        sendUsersList()
    })

    //déclenchée sur réception d'un message du client
    //on reçoit la chaîne envoyée en argument
    ws.on('message', (json) => {
        var data = JSON.parse(json)
        console.log(lastMessages.length)

        //en fonction du type de message reçu...
        switch(data.type){
            case "classic":
                if (lastMessages.length >= 10){
                    lastMessages.shift()
                }
                lastMessages.push(data)

                //on boucle sur tous les clients connectés au serveur
                wss.clients.forEach((client) => {
                    data.dateSent = new Date()
                    client.send(JSON.stringify(data))
                })
                break

            //envoyé lorsqu'un user se connecte
            //on reçoit ainsi son username
            case "login":
                //on stocke le username directement sur la websocket
                ws.username = data.username

                //on rafraichit la liste des users chez les clients
                sendUsersList()
                break

            //shakin
            case "shake":
                wss.clients.forEach((client) => {
                    if (client !== ws){
                        client.send(json)
                    }
                })
                break
        }
    })
})

function sendLastMessages(client){
    let data = {
        "lastMessages": lastMessages,
        "type": "lastMessages"
    }
    client.send(JSON.stringify(data))
}

function sendUsersList(){
    let userslist = []
    wss.clients.forEach((client) => {
        userslist.push(client.username)
    })
    wss.clients.forEach((client) => {
        data = {
            "type": "userslist",
            "users": userslist
        }
        client.send(JSON.stringify(data))
    })
}