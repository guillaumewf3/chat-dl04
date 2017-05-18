console.log("dans la console du navigateur depuis chat.js")

var ws = new WebSocket("ws://localhost:8080")

ws.onopen = function(event){
    console.log("Connecté au serveur de ws")

    var username = $("#username-input").val()

    //envoie un message de "connexion", qui permet au serveur de connaître notre username
    var data = {
        "message": username,
        "username": username,
        "type": "login"
    }

    var json = JSON.stringify(data)
    ws.send(json)

    //on écoute pour la réception de messages depuis le serveur
    ws.onmessage = function(message){
        //message est un objet de type MessageEvent
        //le json reçu est dans la propriété message.data
        console.log(message)

        var data = JSON.parse(message.data)

        //en fonction du type de message qu'on vient de recevoir du serveur...
        switch (data.type){
            //liste des derniers messages
            case "lastMessages":
                for(i=0; i<data.lastMessages.length; i++){
                    var m = data.lastMessages[i]
                    appendMessage(m.message, m.username, m.dateSent)
                }
                break
            //message normal
            case "classic":
                appendMessage(data.message, data.username, data.dateSent)
                break
            //liste des utilisateurs connectés
            case "userlist":
                var userUl = $("<ul>")
                for(var i = 0; i < data.users.length; i++){
                    userUl.append($('<li>').html(data.users[i]))
                }
                $("#users-list").html(userUl)
                break
            //on vient de recevoir un shake
            case "shake":
                $("#messages-list").fadeOut(100, function(){
                    $("#messages-list").fadeIn(100)
                })
                break
        }
    }

    //on met sous écoute notre formulaire, sur l'événement de soumission
    $("#message-form").on("submit", function(e){
        //empêche le formulaire de réaliser une nouvelle requête au serveur
        e.preventDefault()

        //récupère nos données dans le formulaire
        var newMessage = $("#message-input").val()
        $("#message-input").val("") //vide le champ

        //envoie un message "classic"
        var data = {
            "message": newMessage,
            "username": username,
            "type": "classic"
        }

        var json = JSON.stringify(data)
        ws.send(json)
    })

    //mise sous écoute du bouton "shake"
    $("#shake-btn").on("click", function(e){
        //envoie un message shake
        var data = {
            "type": "shake",
            "username": username
        }
        var json = JSON.stringify(data)
        ws.send(json)
    })
}

//ajoute un message classique dans la fenêtre de chat
function appendMessage(content, author, date){
    //crée le HTML qui sera injecté dans la fenêtre de chat
    var messageDiv = $("<div>")
    messageDiv.addClass("message")

    //pour l'heure et l'auteur
    var infoContainer = $("<em>")
    var dateObj = new Date(date)
    var formattedDate = dateObj.getHours() + ":" + dateObj.getMinutes() + ":" + dateObj.getSeconds()
    moment.locale("fr")
    formattedDate = moment(dateObj).fromNow()

    infoContainer.html(author + ' (' + formattedDate + ')')
    messageDiv.append(infoContainer)

    //le message...
    var messageParagraph = $("<p>")
    messageParagraph.html(content)
    messageDiv.append(messageParagraph)

    //ajoute notre HTML dans la liste des messages
    var ml = $("#messages-list")
    ml.append(messageDiv)

    ml.scrollTop(ml.prop("scrollHeight"));
}