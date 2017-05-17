const fs = require('fs') //module permettant de manipuler les fichiers
const url = require('url') //pour nous aider à analyser les URLs
const http = require('http') //importe le module permettant de créer le serveur
const nunjucks = require('nunjucks') //notre moteur de template semblable à twig
const path = require('path') //pour nous aider à extraire l'extension des fichiers

const querystring = require('querystring'); //permet d'analyser la requête POST

function sendAsset(pathname, extension, response) {
    //on déduit le type mime en fonction de l'extension
    let mimetype = null;
    switch(extension){
        case ".css":
            mimetype = "text/css"
            break
        case ".js":
            mimetype = "text/javascript"
            break
        case ".png":
            mimetype = "image/png"
            break
    }

    //si c'est un mimetype qu'on ne gère pas, on renvoie une erreur 404
    if (mimetype === null){
        response.writeHead(404, {'Content-Type' : mimetype})
        response.end()
    }
    else {
        response.writeHead(200, {'Content-Type' : mimetype})

        fs.readFile("." + pathname, (err, data) => {
            response.write(data)
            response.end()
        })
    }
}

//appelée par le serveur plus bas
//envoie une réponse d'un template HTML
function sendResponse(template, response, statusCode, data) {
    //code de réponse HTTP optionnel. défaut à 200
    statusCode = (statusCode) ? statusCode : 200
    data = (data) ? data : {}
    data.currentYear = new Date().getFullYear()

    //on écrit des entêtes : le code de statut, plus un objet d'entêtes
    response.writeHead(statusCode, {'Content-Type' : 'text/html'})

    data = {
        username: "yo",
        currentYear: 2017
    }
    let html = nunjucks.render('./templates/'+template, data)
    response.write(html)
    response.end()

    /*
     //SANS NUNJUCKS ON FAISAIT ÇA
     //on lit le contenu du fichier html de manière async.
     //la fonction fléchée sera appelée lorsque le contenu sera récupéré
     fs.readFile('./templates/'+template, (err, data) => {

     data = data.toString().replace("{{ currentYear }}", new Date().getFullYear())

     //on ajoute le contenu du fichier dans la réponse
     response.write(data)
     //on envoie la réponse
     response.end()
     })
     */
}


//crée notre serveur HTTP
//la fonction anonyme sera appelée à chaque requête
let server = http.createServer(function(request, response){

    //récupère uniquement le "pathname" de l'URL
    //voir https://nodejs.org/dist/latest-v7.x/docs/api/url.html#url_url_strings_and_url_objects
    let pathname = url.parse(request.url).pathname

    //extrait l'(éventuelle) extension au bout de l'URL
    let extension = path.extname(pathname)

    console.log(extension)
    console.log(pathname)

    //si on a une extension dans l'URL, alors on prend pour acquis qu'on doit
    //envoyer un asset (img, js, css...)
    if (extension !== ""){
        sendAsset(pathname, extension, response);
    }
    //sinon, c'est une "page"
    else {
        //page d'accueil
        if (pathname === "/"){
            sendResponse('home.html', response)
        }
        //page principale du chat
        else if (pathname === "/chat/"){
            //récupère le username envoyé en POST
            let postData = ""
            request.on('data', (data) => {
                postData += data
            })

            request.on('end', () => {
                let data = querystring.parse(postData)
                sendResponse('chat.html', response, 200, data)
            })
        }
        //page à propos
        else if (pathname === "/a-propos/"){
            sendResponse('about.html', response)
        }
        //sinon, c'est que ça n'existe pas ici, on envoie une 404
        else {
            sendResponse('404.html', response, 404)
        }
    }
})

//notre serveur écoute maintenant pour de nouvelles requêtes HTTP sur le port 3000
server.listen(3000)


module.exports = server













/*
 console.log("hello world !")

 const yo = "pouf"

 for(let i=0; i<=100;i++){
 console.log(i)
 }

 if (true){
 let name = "Guillaume"
 console.log(name)
 }

 console.log(name)
 */
