console.log("dans la console du navigateur depuis chat.js")

var ws = new WebSocket("ws://localhost:8080")

ws.onclose = function (d) {
    console.log(d)
}
ws.onerror = function (d) {
    console.log(d)
}

ws.onopen = function(event){
    console.log("Connecté au serveur de ws")

    //on écoute pour la réception de messages depuis le serveur
    ws.onmessage = function(message){
        //message est un objet de type MessageEvent
        //le json reçu est dans la propriété message.data
        console.log(message)

        var data = JSON.parse(message.data)

        //crée le HTML qui sera injecté dans la fenêtre de chat
        var messageDiv = $("<div>")
        messageDiv.addClass("message")
        var messageParagraph = $("<p>")
        messageParagraph.html(data.message)
        messageDiv.html(messageParagraph)

        //ajoute notre HTML dans la liste des messages
        $("#messages-list").append(messageDiv)
    }




    //on met sous écoute notre formulaire, sur l'événement de soumission
    $("#message-form").on("submit", function(e){
        //empêche le formulaire de réaliser une nouvelle requête au serveur
        e.preventDefault()

        //récupère nos données dans le formulaire
        var newMessage = $("#message-input").val()
        var username = $("#username-input").val()

        var data = {
            "message": newMessage,
            "username": username,
            "type": "classic"
        }

        var json = JSON.stringify(data)

        ws.send(json)
    })
}