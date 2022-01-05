const http = require("http");
const server = http.createServer();
server.listen(9898); // On écoute sur le port 9898

// Création du server WebSocket qui utilise le serveur précédent
const WebSocketServer = require("websocket").server;
const wsServer = new WebSocketServer({
  httpServer: server,
});

let queue = [];
queue[0] = [];
queue[1] = [];
let gameID = 0;
let games=[];
games[0] = [];
games[1] = [];
let connections = [];
connections[0] = [];
connections[1] = [];

// Mise en place des événements WebSockets
wsServer.on("request", function (request) {
  const connection = request.accept(null, request.origin);

  //Tableau des identifiants
  var myLogs = [
    ["coco58", "coco58pwd"],
    ["superman78", "superman78pwd"],
    ["toto", "totopwd"],
    ["tata", "tatapwd"],
  ];

  //Actions à la réception d'un message de la part du client
  connection.on("message", function (message) {
    if (JSON.parse(message.utf8Data).datatype == "conn") {
      var valid = false; //variable servant à vérifier si les identifiants sont valides
      for (let i = 0; i < myLogs.length; i++) {
        //on parcourt le tableau d'identifiants
        if (
          myLogs[i][0] == JSON.parse(message.utf8Data).login &&
          myLogs[i][1] == JSON.parse(message.utf8Data).pwd
        ) {
          valid = true; //si les identifiants reçus correspondent à des identifiants du tableau, on passe valid à true
        }
      }
      if (valid == true) {
        //correspondance -> réponse positive
        connections[0].push(connection);
        connections[1].push(JSON.parse(message.utf8Data).login);
        queue[0].push(connection);
        queue[1].push(JSON.parse(message.utf8Data).login);
        connection.send(
          JSON.stringify({
            datatype: "conn",
            identification: "bienvenue " + JSON.parse(message.utf8Data).login,
          })
        );
        if (queue[0].length == 1) {
          // TODO: gérer être seul dans la file
        //   connection.send(
        //     JSON.stringify({ datatype: "gamestart", versus: "random" })
        //   );
        } else if (queue[0].length == 2) {
          // TODO: créer la game en BDD
          queue[0][0].send(
            JSON.stringify({ datatype: "gamestart", versus: queue[1][1], player: 'w', gameID: gameID})
          );
          queue[0][1].send(
            JSON.stringify({ datatype: "gamestart", versus: queue[1][0], player: 'b', gameID: gameID})
          );
          games[gameID][0] = gameID;
          games[gameID][1] = queue[1][0];
          games[gameID][2] = queue[1][1];
          gameID++;
          queue[0] = [];
          queue[1] = [];
        }
      } else {
        //pas de correspondance -> réponse négative
        connection.send(
          JSON.stringify({
            datatype: "conn",
            identification: "identifiants invalides",
          })
        );
      }
    } else if (JSON.parse(message.utf8Data).datatype == "gamestate") {
        for (i = 0; i <= connections.length; i++){
            if(connections[1][i] == games[JSON.parse(message.utf8Data).gameID][1]){
                connections[0][i].send(message.utf8Data);
            }
            else if(connections[1][i] == games[JSON.parse(message.utf8Data).gameID][2]){
                connections[0][i].send(message.utf8Data);
            }
        }
        // TODO: gestion de gameend
    }
  });

  connection.on("close", function (reasonCode, description) {
    // TODO: gestion de la déconnexion en virant la co dans le tableau connections
    console.log(
      "Fermeture d'une connexion avec un code : " +
        reasonCode +
        " de description : " +
        description
    );
  });
});
