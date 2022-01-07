const http = require("http");
const mongoose = require('mongoose');
const { Schema } = mongoose;
const server = http.createServer();
server.listen(9898); // On écoute sur le port 9898

// Définition des modeles de BD
const userSchema = new Schema({
  login: String,
  mdp: String,
  nbVictoire: Number,
  nbDefaite: Number
});

const gameSchema = new Schema({
  gameID: Number,
  status: String,
  board: Array,
  player1Login: String,
  player2Login: String,
  player1color: String,
  player2color: String,
  currentPlayer: String,
  start_time: Date,
  end_time: Date,
  playtime: Number
});

main().catch(err => console.log(err));

async function main() {

  await mongoose.connect('mongodb://localhost:27017/test');
  const User = mongoose.model('User', userSchema);
  const Game = mongoose.model('Game', gameSchema);

  // Création du server WebSocket qui utilise le serveur précédent
  const WebSocketServer = require("websocket").server;
  const wsServer = new WebSocketServer({
    httpServer: server,
  });

  let queue = [];
  queue[0] = [];
  queue[1] = [];
  let gameID = 0;
  let connections = [];
  connections[0] = [];
  connections[1] = [];

  // Mise en place des événements WebSockets
  wsServer.on("request", function (request) {
    const connection = request.accept(null, request.origin);

    //Actions à la réception d'un message de la part du client
    connection.on("message", function (message) {
      if (JSON.parse(message.utf8Data).datatype == "conn") {
        var valid = false; //variable servant à vérifier si les identifiants sont valides

        (async () => {
          try {
            await User.findOne({ 'login': JSON.parse(message.utf8Data).login }, 'mdp', function (err, user) {
              if (err) return handleError(err);
              if (user) {
                if (user.mdp == JSON.parse(message.utf8Data).pwd) {
                  valid = true;
                }
              } else { // login absent de la bdd, on inscrit le nouvel utilisateur
                var userAdd = new User({ login: JSON.parse(message.utf8Data).login, mdp: JSON.parse(message.utf8Data).pwd, nbVictoire: 0, nbDefaite: 0 });
                userAdd.save();
                valid = true;
              }
            }).clone();
          } catch (err) {
            console.log(err);
          }
          if (valid == true) {
            //correspondance -> réponse positive
            connections[0].push(connection);
            connections[1].push(JSON.parse(message.utf8Data).login);
            connection.send(
              JSON.stringify({
                datatype: "conn",
                identification: "bienvenue " + JSON.parse(message.utf8Data).login,
              })
            );
          }
        })(); // fin async
      } else if (JSON.parse(message.utf8Data).datatype == "queuejoin") {
        queue[0].push(connection);
        for (i = 0; i < connections[0].length; i++) {
          if (connections[0][i] == connection) {
            queue[1].push(connections[1][i]);
          }
        }
        if (queue[0].length == 2) {
          (async () => {
            try {
              var lastGame = await Game.findOne().sort({ _id: -1 });
              if (lastGame) {
                gameID = lastGame.gameID + 1;
              } else {
                gameID = 0;
              }
              var gameAdd = new Game({ gameID: gameID, status: "live", board: [], player1Login: queue[1][0], player2Login: queue[1][1], player1color: 'w', player2color: 'b', currentPlayer: queue[1][0], start_time: Date.now(), end_time: null, playtime: 0 });
              gameAdd.save();
              queue[0][0].send(
                JSON.stringify({ datatype: "gamestart", versus: queue[1][1], player: 'w', gameID: gameID })
              );
              queue[0][1].send(
                JSON.stringify({ datatype: "gamestart", versus: queue[1][0], player: 'b', gameID: gameID })
              );
              queue[0] = [];
              queue[1] = [];
            } catch (err) {
              console.warn('ERROR');
              console.log(err);
            }
          })();
        }
      } else if (JSON.parse(message.utf8Data).datatype == "gamestate") {
        (async () => {
          try {
            var currentGame = await Game.findOne({ gameID: JSON.parse(message.utf8Data).gameID });
            currentGame.board = JSON.parse(message.utf8Data).plateau;
            currentGame.save();
            var player1 = currentGame.player1Login;
            var player2 = currentGame.player2Login;


            for (i = 0; i <= connections.length; i++) {
              if (connections[1][i] == player1) {
                connections[0][i].send(message.utf8Data);
              }
              else if (connections[1][i] == player2) {
                connections[0][i].send(message.utf8Data);
              }
            }

          } catch (err) {
            console.log(err);
          }

        })();
        // TODO: gestion de gameend
      }
      else if (JSON.parse(message.utf8Data).datatype == "gameend") {
        (async () => {
          try {
            var currentGame = await Game.findOne({ gameID: JSON.parse(message.utf8Data).gameID });
            currentGame.end_time = Date.now();
            currentGame.status = "finished";
            currentGame.save();
            if (currentGame.player1Color == JSON.parse(message.utf8Data).winner) {
              var winner = await User.findOne({ login: currentGame.player1Login });
            } else {
              var winner = await User.findOne({ login: currentGame.player2Login });
            }
            winner.nbVictoire += 1;
            winner.save();
            if (winner.login == currentGame.player1Login) {
              var loser = await User.findOne({ login: currentGame.player2Login });
              loser.nbDefaite += 1;
            } else {
              var loser = await User.findOne({ login: currentGame.player1Login });
              loser.nbDefaite += 1;
            }
            loser.save();
            var player1 = currentGame.player1Login;
            var player2 = currentGame.player2Login;
            for (i = 0; i <= connections.length; i++) {
              if (connections[1][i] == player1) {
                connections[0][i].send(message.utf8Data);
              }
              else if (connections[1][i] == player2) {
                connections[0][i].send(message.utf8Data);
              }
            }
          } catch (err) {
            console.log(err);
          }
        })();
      }
    });

    connection.on("close", function (reasonCode, description) {
      // TODO: gestion de la déconnexion en virant la co dans le tableau connections
      // envoyer une gameend à l'adversaire en lui disant qu'il a gagné + la raison ?
      console.log("Fermeture d'une connexion avec un code : " + reasonCode + " de description : " + description);
    });
  });
}