# Jeu_de_dames

## Guide d'installation

L'utilisation de l'environnement de développement cordova réalisé par Dominique Vaufreydaz est nécessaire au bon fonctionnement de l'application.

Il faut installer MongoDB, le guide d'installation se trouve [içi](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/), aucune spécification est nécessaire lors de l'installation.

Une fois l'installation terminée, vous pouvez cloner le projet dans le repertoire ou se trouvent les scripts d'exécution de l'environnement de développement cordova. 
Exécutez alors les scripts pour être dans l'environnement DevWeb.
Exécutez ensuite les commandes `npm i mongodb`, et `npm i mongoose`.

Vous avez maintenant tous les outils nécessaires pour lancer l'application, cependant pour que votre expérience soit optimale, il est préférable d'exécuter la commande `node db/initDB.mjs` (vous pouvez quitter l'exécution avec Ctrl+C rapidement). Cela va ajouter des utilisateurs par defaut dans la base de données.

Vous pouvez maintenant lancer votre serveur en exécutant la commande `node ServerWS.js`. Il est important que le serveur tourne en continue pendant que vous naviguez sur l'application.

Pour ajouter des plateformes d'exécution, vous devez exécuter les commandes `cordova platform add android` et `cordova platform add browser`.

## Guide d'utilisation

Pour lancer l'application, vous pouvez le faire soit en utilisant la plateforme android avec `cordova run android`, soit avec votre navigateur en faisant `cordova run browser`.

Vous avez maintenant devant vous une interface de connexion. Vous pouvez vous connecter en utilisant les identifiants 'toto' avec le mot de passe 'totopwd'. Vous pouvez aussi créer un compte en saisissant simplement un login et mot de passe. Tant que le login n'est pas déjà présent dans la base de données, votre compte sera créé.

Si vous cliquez sur jouer, vous serez mis en attente qu'un autre joueur arrive dans la queue pour pouvoir vous affronter. En attendant vous pouvez vous entraîner face à une IA. 

Vous avez aussi accès au règles du jeu de dame, ainsi qu'au leaderboard affichant les 5 meilleurs joueurs du serveur.

Amusez vous bien !