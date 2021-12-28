const http = require('http');    
const server = http.createServer(); 
server.listen(9898);  // On écoute sur le port 9898 

// Création du server WebSocket qui utilise le serveur précédent 
const WebSocketServer = require('websocket').server; 
const wsServer = new WebSocketServer({ 
    httpServer: server 
});

let connections = []
connections[0] = []
connections[1] = []

// Mise en place des événements WebSockets 
wsServer.on('request', function(request) { 
    const connection = request.accept(null, request.origin);

    //Tableau des identifiants
    var myLogs = [
        ['coco58', 'coco58pwd'],
        ['superman78', 'superman78pwd'],
        ['toto', 'totopwd'],
        ['tata', 'tatapwd']
       ];
    
    //Actions à la réception d'un message de la part du client
    connection.on('message', function(message) {
        if (JSON.parse(message.utf8Data).datatype == 'conn'){
            var valid=false; //variable servant à vérifier si les identifiants sont valides
            for(let i = 0; i < myLogs.length; i++){ //on parcourt le tableau d'identifiants
                if(myLogs[i][0] == JSON.parse(message.utf8Data).login && myLogs[i][1] == JSON.parse(message.utf8Data).pwd){
                    valid=true; //si les identifiants reçus correspondent à des identifiants du tableau, on passe valid à true
                }
            }
            if(valid==true){ //correspondance -> réponse positive
                connections[0].push(connection);
                connections[1].push(JSON.parse(message.utf8Data).login)
                connection.send(JSON.stringify({datatype:'conn', 'identification':'bienvenue '+JSON.parse(message.utf8Data).login}));
            }
            else{ //pas de correspondance -> réponse négative
                connection.send(JSON.stringify({datatype:'conn', 'identification':'identifiants invalides'}));
            }
        }
        else if (JSON.parse(message.utf8Data).datatype == 'gamestate'){
            for(var i = 0; i < connections.length; i++) {
                console.log('on va envoyer '+message.utf8Data+' à '+connections[1][i])
                connections[0][i].send(message.utf8Data);
            }
        }
    }); 
 
    connection.on('close', function(reasonCode, description) { //fermeture de connection
        console.log("Fermeture d'une connexion avec un code : "+reasonCode+" de description : "+description) 
    }); 
}); 