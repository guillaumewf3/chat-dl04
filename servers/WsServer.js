//module externe pour aider à faire le serveur de ws
const WebSocket = require('ws')

//crée le serveur de websocket, écoute sur le port 8080
const wss = new WebSocket.Server({'port':8080})

//lorsqu'un client se connecte, la fct ci-dessous est appelée
//on reçoit l'objet WebSocket en argument
wss.on('connection', (ws) => {
    console.log("Nouvelle connexion !")

    //déclenchée sur réception d'un message du client
    //on reçoit la chaîne envoyée en argument
    ws.on('message', (json) => {
        var data = JSON.parse(json)
        console.log("Message reçu !")
        console.log(data.message)
        console.log(data.username)

        //on boucle sur tous les clients connectés au serveur
        wss.clients.forEach((client) => {
            data.dateSent = new Date()
            client.send(JSON.stringify(data))
        })
    })
})

