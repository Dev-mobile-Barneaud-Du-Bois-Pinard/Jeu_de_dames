const http = require("http");
const mongoose = require('mongoose');
const { Schema } = mongoose;
const server = http.createServer();
server.listen(9898); // On écoute sur le port 9898



// Définition des modeles de BD
const userSchema = new Schema({
  login : String,
  mdp : String,
  nbVictoire : Number,
  nbDefaite : Number
});
const gameSchema = new Schema({
  gameID : Number,
  status : String,
  board : Array,
  player1Login : String,
  player2Login : String,
  player1color : String,
  player2color : String,
  currentPlayer : String,
  start_time : Date,
  end_time : Date,
  playtime : Number
});

console.log('setup database');

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

main().catch(err => console.log(err));

async function main() {

  await mongoose.connect('mongodb://localhost:27017/test');
  const User = mongoose.model('User', userSchema);

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

        (async () => {
          try {
            await User.findOne({'login' : JSON.parse(message.utf8Data).login}, 'mdp', function (err, user) {
              if (err) return handleError(err);
              if (user) {
                if (user.mdp == JSON.parse(message.utf8Data).pwd) {
                  valid = true;
                }
              } else {
                var userAdd = new User({login: JSON.parse(message.utf8Data).login, mdp: JSON.parse(message.utf8Data).pwd, nbVictoire: 0, nbDefaite :0});
                userAdd.save();
                valid = true;
              }
                console.log('auth : ' + valid);
              }).clone();
          } catch (err) { // login absent de la bdd
            console.log(err);
          }
        console.log('auth final : ' + valid);

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
      })(); // fin async
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

}

