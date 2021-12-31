document.addEventListener("deviceready", onDeviceReady, false);
function onDeviceReady() {
    var platform = device.platform;
    if (platform == "browser"){
        var ws = new WebSocket('ws://127.0.0.1:9898/');
        var browser = true;
    }
    else if (platform == "Android"){
        var ws = new WebSocket('ws://10.0.2.2:9898/');
        var android = true;
    }
    else {
        var ws = new WebSocket('ws://10.0.2.2:9898/');
    }

    if (browser){
        var w = true;
    }
    else{
        var b = true;
    }

    let canplay = w ? true : false;

    ws.onopen = function() { //Ouverture de la connexion
        console.log('Ouverture de la connexion')
    };
    
    document.getElementById('mySubmit').onclick = function(){//Envoie des données du formulaire au click du bouton
        console.log('on va envoyer : '+JSON.stringify({datatype:'conn',login:document.getElementById('login').value,pwd:document.getElementById('password').value}))
        ws.send(JSON.stringify({datatype:'conn',login:document.getElementById('login').value,pwd:document.getElementById('password').value}))
    }


    /**
 * Tableau contenant une grille de l'état du tour actuel du jeu
 */
var tabCase = [];

/**
 * Tableau contenant une grille de l'état du tour precédent du jeu
 */
var lastTabCase = [];

/**
 * Element div dans le DOM, dans lequel seront contenu tous les autres éléments
 */
var main = document.getElementById('main');

/**
 * Pion actuellement sélectionné
 */
var pionSelected;

/**
 * Dernier pion selectionné
 */
var lastPionSelected;

/**
 * Tableau contenant tous les déplacements possible pour le pion sélectionné
 */
var tabCoupsPossible = [];

/**
 * Tableau contenant tous les déplacements possible pour le dernier pion sélectionné
 */
var lastTabCoupsPossible = [];

/**
 * Tableau contenant tous les déplacements, en mangeant un pion adverse, possible pour le pion sélectionné
 */
var tabMangerPossible = [];

/**
 * Tableau contenant tous les déplacements, en mangeant un pion adverse, possible pour le dernier pion sélectionné
 */
var lastTabMangerPossible = [];

/**
 * Tableau contenant tous les pions sélectionnables
 */
var tabPionSelectable = [];

/**
 * Tableau contenant tous les pions sélectionnables au tour précédent du jeu
 */
var lastTabPionSelectable = [];

/**
 * Dernière position enregistré avant le mouvement d'un pion
 */
var lastPos;

/**
 * Rafle en cours
 */
var rafle = false;

/**
 * Joueur actif :
 * 'w' : joueur blanc
 * 'b' : joueur noir
 */
var joueur;

/**
 * Nombre de pion du joueur blanc
 */
var countW = 20;

/**
 * Nombre de pion du joueur noir
 */
var countB = 20;

/**
 * Classe position
 * Possède deux attributs x et y représentant respectivant la position sur l'axe des abscisses et l'axe des ordonnées
 */
class Position {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    /**
     * @returns {boolean} : true si la position est dans le plateau, false sinon
     */
    isInPlateau() {
        return this.x >= 0 && this.x < 10 && this.y >= 0 && this.y < 10;
    }
}

/*--------------------------------------------------------------Fonction d'initialisation du jeu et du plateau-----------------------------------------------------------------------*/

/**
 * Créer une case dans le DOM à une position précisée en paramètre
 * @param {Position} pos 
 */
function createCase(pos = new Position) {
    let div = document.createElement('div');
    div.className = 'case';
    div.style.marginTop = pos.y * 60 + 'px';
    div.style.marginLeft = pos.x * 60 + 'px';
    if ((pos.x + pos.y) % 2 == 0) {
        div.style.backgroundColor = '#FFEECF';
    } else {
        div.style.backgroundColor = '#493D31';
        div.id = '' + pos.x + pos.y;
        div.onclick = function () { moveTo(pos) }
    }
    main.appendChild(div);
}

/**
 * Créer un pion dans le DOM à une position et avec un id/name tous deux précisés en paramètre.
 * @param {Position} pos 
 * @param {string} name 
 */
function createPion(pos = new Position, name = 'null') {
    let circle = document.createElement('div');
    circle.style.marginTop = pos.y * 60 + 5 + 'px';
    circle.style.marginLeft = pos.x * 60 + 5 + 'px';
    circle.className = 'pion';
    circle.id = name;
    circle.onclick = function () { selectPion(circle.id) };
    if (name.charAt(0) == 'b') {
        circle.style.backgroundColor = 'black';
        circle.style.color = 'white';
    } else {
        circle.style.backgroundColor = 'white';
        circle.style.color = 'black';
    }
    if (name.charAt(name.length - 1) == 'd') circle.innerHTML = '<p>D</p>';
    main.appendChild(circle);
}

/**
 * Remplace un pion (précisé en paramètre) par une dame dans le DOM à une position précisée en paramètre, 
 * si la position correspond et la couleur du pion sont concordantes et 
 * si le pion n'est pas déjà une dame
 * @param {Position} pos 
 * @param {string} pion 
 * @returns {boolean} true si le remplacement est effectué, false sinon
 */
function createDame(pos = lastPos, pion = pionSelected) {
    if (pion.charAt(pion.length - 1) != 'd' && ((pos.y == 0 && pion.charAt(0) == 'w') || (pos.y == 9 && pion.charAt(0) == 'b'))) {
        lastTabCase = JSON.parse(JSON.stringify(tabCase));
        tabCase[pos.y][pos.x] = tabCase[pos.y][pos.x] + 'd';
        lastPionSelected = undefined;
        pionSelected = undefined;
        actualizePlateau();
        rafle = false;
        return true;
    }
    return false;
}

/**
 * Initialise le tableau contenant l'état du jeu.
 * Ce tableau de données sera transféré entre les joueurs.
 */
function initTableau() {
    let nbWhite = 1;
    let nbBlack = 1;
    for (let y = 0; y < 10; y++) {
        let lineCase = new Array;
        for (let x = 0; x < 10; x++) {
            if ((y + x) % 2 == 0) {
                lineCase.push('null');
            } else {
                if (y > 5) {
                    lineCase.push('w' + nbWhite);
                    nbWhite++;
                } else if (y < 4) {
                    lineCase.push('b' + nbBlack);
                    nbBlack++;
                } else {
                    lineCase.push('empty');
                }
            }
        }
        tabCase.push(lineCase);
    }
}

/**
 * Initialise l'affichage du plateau de jeu.
 */
function initPlateau() {
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            createCase(new Position(x, y))
        }
    }
}

/**
 * Initialise l'affichage des pions au sein du plateau de jeu.
 */
function initPion() {
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (tabCase[y][x] != 'null' && tabCase[y][x] != 'empty') createPion(new Position(x, y), tabCase[y][x]);
        }
    }
}

/*---------------------------------------------------------------------------Fonction du jeu-----------------------------------------------------------------------------------------*/

/**
 * Appelé lors du clic sur un pion :
 * Si aucune rafle est en cours et que le pion est selectionnable alors : lastPionSelected = pionSelected
 * Si le pion cliqué était déjà selectionné alors : pionSelected = undefined 
 * Sinon : pionSelected = id  
 * 
 * Ensuite si un pion est selectionné on enregistre sa position actuelle dans la variable lastPos, on définit les coups possible où il mange un adversaire
 * Si il ne peut manger aucun adversaire, on définit les coups possible sans manger d'adversaire    
 * 
 * On appel la fonction actualizeSelection().          
 * @param {string} id 
 */
function selectPion(id) {
    if ((!rafle || tabMangerPossible.length == 0) && canplay) {
        for (let i = 0; i < tabPionSelectable.length; i++) {
            if (tabPionSelectable[i] == id) {
                if (pionSelected != undefined) {
                    if (pionSelected == id) {
                        lastPionSelected = pionSelected;
                        pionSelected = undefined;
                        lastTabCoupsPossible = JSON.parse(JSON.stringify(tabCoupsPossible));
                        tabCoupsPossible = [];
                        lastTabMangerPossible = JSON.parse(JSON.stringify(tabMangerPossible));
                        tabMangerPossible = [];
                        actualizeSelection();
                        return null;
                    }
                }
                for (let y = 0; y < 10; y++) {
                    for (let x = 0; x < 10; x++) {
                        if (tabCase[y][x] == id) {
                            lastPionSelected = pionSelected;
                            pionSelected = id;
                            lastPos = new Position(x, y);
                            lastTabCoupsPossible = JSON.parse(JSON.stringify(tabCoupsPossible));
                            lastTabMangerPossible = JSON.parse(JSON.stringify(tabMangerPossible));
                            tabMangerPossible = defineMangerPossible();
                            if (tabMangerPossible.length == 0) tabCoupsPossible = defineCoupsPossible();
                            else tabCoupsPossible = [];
                            actualizeSelection();
                        }
                    }
                }
            }
        }
    }
}

/**
 * Cette fonction retourne les coups possibles pour un pion/dame donné, à une position donnée dans un tableau de case donné.
 * Elle ne retourne que les coups qui ne mange pas de pion adverse.
 * @param {Position} pos : position du pion selctionné (default value : lastPos)
 * @param {string} pion : pion/dame selectionné (default value : pionSelected)
 * @param {Array} tab : tableau de case dans lequel le pion selectionné se situe (default value : tabCase)
 * @returns {Array} res : tableau des positions vers lesquelles le pion donné en paramètres peut se déplacer
 */
function defineCoupsPossible(pos = lastPos, pion = pionSelected, tab = tabCase) {
    let res = [];
    if (pion.charAt(pion.length - 1) == 'd') {
        for (let x = -1; x < 2; x = x + 2) {
            for (let y = -1; y < 2; y = y + 2) {
                for (let i = 1; i < 10; i++) {
                    let x1 = pos.x - x * i;
                    let y1 = pos.y - y * i;
                    if (new Position(x1, y1).isInPlateau() && tab[y1][x1] == 'empty') res.push('' + (x1) + (y1));
                    else i = 10;
                }
            }
        }
    } else {
        let y = pos.y + 1;
        if (pion.charAt(0) == 'w') y = pos.y - 1;
        let x1 = pos.x + 1;
        let x2 = pos.x - 1;
        if (tab[y][x1] == 'empty' && new Position(x1, y).isInPlateau()) res.push('' + (x1) + (y));
        if (tab[y][x2] == 'empty' && new Position(x2, y).isInPlateau()) res.push('' + (x2) + (y));
    }
    return res;
}

/**
 * Cette fonction retourne les coups possibles pour un pion/dame donné, à une position donnée dans un tableau de case donné.
 * Elle ne retourne que les coups qui mange un pion adverse.
 * @param {Position} pos : position du pion selctionné (default value : lastPos)
 * @param {string} pion : pion/dame selectionné (default value : pionSelected)
 * @param {Array} tab : tableau de case dans lequel le pion selectionné se situe (default value : tabCase)
 * @returns {Array} res : tableau des positions vers lesquelles le pion donné en paramètres peut se déplacer en mangeant un pion adverse
 */
function defineMangerPossible(pos = lastPos, pion = pionSelected, tab = tabCase) {
    let res = [];
    if (pion.charAt(pion.length - 1) == 'd') {
        for (let x = -1; x < 2; x = x + 2) {
            for (let y = -1; y < 2; y = y + 2) {
                let enemy = false;
                for (let i = 1; i < 10; i++) {
                    let x1 = pos.x - x * i;
                    let y1 = pos.y - y * i;
                    if (new Position(x1, y1).isInPlateau()) {
                        if ((tab[y1][x1].charAt(0) == 'w' && joueur == 'b') || (tab[y1][x1].charAt(0) == 'b' && joueur == 'w')) {
                            if (enemy) i = 10;
                            else enemy = true;
                        }
                        else if ((tab[y1][x1].charAt(0) == 'b' && joueur == 'b') || (tab[y1][x1].charAt(0) == 'w' && joueur == 'w')) i = 10;
                        else if (enemy && tab[y1][x1] == 'empty') res.push('' + (x1) + (y1));
                    } else i = 10;
                }
            }
        }
    } else {
        for (let x = -2; x <= 2; x = x + 4) {
            for (let y = -2; y <= 2; y = y + 4) {
                if (new Position(pos.x + x, pos.y + y).isInPlateau()) {
                    let x1 = pos.x + x / 2;
                    let x2 = pos.x + x;
                    let y1 = pos.y + y / 2;
                    let y2 = pos.y + y;
                    if ((pion.charAt(0) == 'w' && tab[y1][x1].charAt(0) == 'b') || (pion.charAt(0) == 'b' && tab[y1][x1].charAt(0) == 'w')) {
                        if (tab[y2][x2] == 'empty') res.push('' + x2 + y2);
                    }
                }
            }
        }
    }
    return res;
}

/**
 * Retourne, pour un joueur (précisé en paramètres), un tableau contenant l'id de tous les pions pouvant manger au moins 1 pion à l'adversaire,
 * si aucun pion ne peut manger alors la fonction retourne un tableau contenant l'id de tous les pions pouvant se déplacer
 * @param {string} j : joueur actif
 * @returns {Array} res : tableau contenant l'id de tous les pions selectionnnables
 */
function defineMeilleurCoupsPossible(j = joueur) {
    let res = [];
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (tabCase[y][x].charAt(0) == j) {
                let coups = defineMangerPossible(new Position(x, y), tabCase[y][x], tabCase);
                if (coups.length != 0) {
                    res.push(tabCase[y][x]);
                }
            }
        }
    }
    if (res.length == 0) {
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                if (tabCase[y][x].charAt(0) == j) {
                    let coups = defineCoupsPossible(new Position(x, y), tabCase[y][x], tabCase);
                    if (coups.length != 0) {
                        res.push(tabCase[y][x]);
                    }
                }
            }
        }
    }
    return res;
}

/**
 * Appelé au clic sur une case
 * 
 * Si un pion est selectionné et que ce dernier peut se déplacer sur la case cliqué alors on déplace le pion dans tabCase.
 * Si le pion mange un adversaire on le modifie dans tabCase et on vérifie si une rafle est possible.
 * Si une dame est créé on interromp la rafle en cours.
 * 
 * Enfin on appel la fonction actualizePlateau, actualizeSelection() et tour().
 * @param {Position} pos 
 */
function moveTo(pos = new Position) {
    if (pionSelected != undefined) {
        for (let i = 0; i < tabCoupsPossible.length; i++) {
            if (tabCoupsPossible[i] == '' + pos.x + pos.y) {
                lastTabCase = JSON.parse(JSON.stringify(tabCase));
                tabCase[pos.y][pos.x] = pionSelected;
                tabCase[lastPos.y][lastPos.x] = 'empty';
                lastPionSelected = pionSelected;
                pionSelected = undefined;
                lastTabCoupsPossible = JSON.parse(JSON.stringify(tabCoupsPossible));
                tabCoupsPossible = [];
                createDame(pos, lastPionSelected);
                actualizePlateau();
                tour();
            }
        }
        for (let i = 0; i < tabMangerPossible.length; i++) {
            if (tabMangerPossible[i] == '' + pos.x + pos.y) {
                lastTabCase = JSON.parse(JSON.stringify(tabCase));
                tabCase[pos.y][pos.x] = pionSelected;
                tabCase[lastPos.y][lastPos.x] = 'empty';
                yn = pos.y;
                y0 = lastPos.y;
                xn = pos.x;
                x0 = lastPos.x;
                while (x0 != xn && y0 != yn) {
                    if (lastPos.x > pos.x) {
                        x0--;
                    } else {
                        x0++;
                    }
                    if (lastPos.y > pos.y) {
                        y0--;
                    } else {
                        y0++;
                    }
                    if ((tabCase[y0][x0].charAt(0) == 'w' && joueur == 'b') || (tabCase[y0][x0].charAt(0) == 'b' && joueur == 'w')) {
                        tabCase[y0][x0] = 'empty';
                        if (tabCase[y0][x0].charAt(1) == 'w') countW--;
                        else if (tabCase[y0][x0].charAt(1) == 'b') countB--;
                        console.log("white : " + countW, "black : " + countB)
                    }
                }
                lastTabMangerPossible = JSON.parse(JSON.stringify(tabMangerPossible));
                tabMangerPossible = [];
                actualizePlateau();
                lastPos = pos;
                if (!createDame(pos, pionSelected)) {
                    tabMangerPossible = defineMangerPossible();
                    if (tabMangerPossible.length == 0) {
                        lastPionSelected = pionSelected;
                        pionSelected = undefined;
                        rafle = false;
                    } else {
                        rafle = true;
                    }
                }
                actualizeSelection();
                tour();
            }
        }
    }
}

/*----------------------------------------------------------------Fonction récursive de recherche du meilleur coups------------------------------------------------------------------*/
/*-----------------------------------------------------------------INCOMPLETE A FINIR SI LE TEMPS EN FIN DE PROJET-------------------------------------------------------------------*/
/*
function defineMeilleurCoupsPossible(joueur = 'w') {
    let res = [];
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (tabCase[y][x].charAt(0) == joueur) {
                let tab = JSON.parse(JSON.stringify(tabCase));
                nbCoups = recursiveMeilleurCoupsPossible(tab, new Position(x, y),1);
                console.log(nbCoups);
                res.push([tabCase[y][x], nbCoups]);
            }
        }
    }
}

function recursiveMeilleurCoupsPossible(tab = new Array, pos = new Position, i) {
    let tabCoups = defineMangerPossible(pos, tab[pos.y][pos.x], tab);
    let res = [];
    for (let i = 0; i < tabCoups.length; i++) {
        let newTab = JSON.parse(JSON.stringify(tab));
        let newPos = new Position(parseInt(tabCoups[i].charAt(0)), parseInt(tabCoups[i].charAt(1)));
        newTab[(newPos.y + pos.y) / 2][(newPos.x + pos.x) / 2] = 'empty';
        newTab[newPos.y][newPos.x] = newTab[pos.y][pos.x];
        newTab[pos.y][pos.x] = 'empty';
        res.push([''+pos.x+pos.y,i])
        res.push(recursiveMeilleurCoupsPossible(newTab, newPos, i+1));
    }
    return res;
}
*/

/*---------------------------------------------------------Fonction d'affichage du plateau dans le DOM-------------------------------------------------------------------------------*/

/**
 * Cette fonction appel la fonction actualizeSelection(). Puis elle actualise l'affichage des pions sur le plateau en fonction des changements dans le tableau de jeu.
 */
function actualizePlateau() {
    actualizeSelection();
    if (lastTabCase != undefined) {
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                if (tabCase[y][x] != lastTabCase[y][x]) {
                    if (tabCase[y][x].charAt(tabCase[y][x].length - 1) == 'd' && tabCase[y][x].substring(0, tabCase[y][x].length - 1) == lastTabCase[y][x]) {
                        let pion = document.getElementById(lastTabCase[y][x]);
                        pion.style.opacity = '0';
                        setTimeout(function () { pion.remove() }, 1500);
                        createPion(new Position(x, y), tabCase[y][x]);
                    } else if (tabCase[y][x] != 'empty') {
                        let pion = document.getElementById(tabCase[y][x]);
                        pion.style.marginTop = y * 60 + 5 + 'px';
                        pion.style.marginLeft = x * 60 + 5 + 'px';
                    } else if (tabCase[y][x] == 'empty' && lastTabCase[y][x].charAt(0)!=joueur) {
                        let pion = document.getElementById(lastTabCase[y][x]);
                        pion.style.opacity = '0';
                        tabCase[y][x] = 'empty';
                        setTimeout(function () { pion.remove() }, 1500);
                    }
                }
            }
        }
        lastTabCase = undefined;
    }
}

/**
 * Cette fonction actualise l'affichage des pions selectionné ou déselectionné et des cases où l'on peut déplacer le pion selectionné. Elle modifie aussi le z-index du pion selectionné.
 */
function actualizeSelection() {
    if (pionSelected != undefined) {
        document.getElementById(pionSelected).style.border = 'solid 2px green';
        document.getElementById(pionSelected).style.zIndex = 3;
    }
    if (lastPionSelected != undefined && pionSelected != lastPionSelected) {
        document.getElementById(lastPionSelected).style.border = 'solid 2px red';
        document.getElementById(lastPionSelected).style.zIndex = 2;
    }
    for (let i = 0; i < lastTabCoupsPossible.length; i++) {
        document.getElementById(lastTabCoupsPossible[i]).style.backgroundColor = '#493D31';
    }
    lastTabCoupsPossible = [];
    for (let i = 0; i < lastTabMangerPossible.length; i++) {
        document.getElementById(lastTabMangerPossible[i]).style.backgroundColor = '#493D31';
    }
    lastTabMangerPossible = [];
    for (let i = 0; i < tabCoupsPossible.length; i++) {
        document.getElementById(tabCoupsPossible[i]).style.backgroundColor = 'green';
    }
    for (let i = 0; i < tabMangerPossible.length; i++) {
        document.getElementById(tabMangerPossible[i]).style.backgroundColor = 'green';
    }
}

/**
 * Cette fonction actualise l'affichage des pions selectionnable.
 */
function actualizeSelectable() {
    for (let i = 0; i < lastTabPionSelectable.length; i++) {
        let pion = document.getElementById(lastTabPionSelectable[i]);
        pion.style.border = 'solid 2px #FFEECF';
    }
    for (let i = 0; i < tabPionSelectable.length; i++) {
        let pion = document.getElementById(tabPionSelectable[i]);
        pion.style.border = 'solid 2px red';
    }
}

/*------------------------------------------------------------------Fonction de routine du jeu---------------------------------------------------------------------------------------*/

/**
 * Change le joueur actif a chaque appel, 
 * vérifie si un des deux joueurs a gagné, 
 * actualize tabPionSelectable avec le nouveau joueur actif et appel la fonction actualizeSelectable.
 */
function tour() {
    if (countB == 0) {
        console.log('white a gagné')
    } else if (countW == 0) {
        console.log('black a gagné')
    } else if (!rafle) {
        console.log('ICI joueur = '+joueur);
        lastjoueur = joueur;
        joueur = (joueur == 'w' ? 'b' : 'w');
        console.log('ET LA joueur = '+joueur+' ET lastjoueur = '+lastjoueur);
        lastTabPionSelectable = JSON.parse(JSON.stringify(tabPionSelectable));
        tabPionSelectable = defineMeilleurCoupsPossible(joueur);
        actualizeSelectable();
        //Envoyer l'état du jeu au serveur à cette étape
        console.log('on va envoyer : '+JSON.stringify({player:joueur,lastplayer:lastjoueur,plateau:tabCase}))
        ws.send(JSON.stringify({datatype:'gamestate',player:joueur,lastplayer:lastjoueur,plateau:tabCase}));
        actualizePlateau();
    }else{
        lastjoueur = joueur;
        console.log('ET LA joueur = '+joueur+' ET lastjoueur = '+lastjoueur);
        lastTabPionSelectable = JSON.parse(JSON.stringify(tabPionSelectable));
        tabPionSelectable = defineMeilleurCoupsPossible(joueur);
        actualizeSelectable();
        //Envoyer l'état du jeu au serveur à cette étape
        console.log('on va envoyer : '+JSON.stringify({player:joueur,lastplayer:lastjoueur,plateau:tabCase}))
        ws.send(JSON.stringify({datatype:'gamestate',player:joueur,lastplayer:lastjoueur,plateau:tabCase}));
        actualizePlateau();
    }
}

/**
 * Appel les fonctions d'initialisation et lance le jeu
 */
function start() {
    initTableau();
    initPlateau();
    initPion();
    joueur = 'w';
    tabPionSelectable = defineMeilleurCoupsPossible(joueur);
    actualizeSelectable();
}

start();

ws.onmessage = function(e) { //Fonctions de réceptions de messages
    console.log('réception de : '+e.data)
    if (JSON.parse(e.data).datatype == 'conn'){
        document.getElementById('inputMessage').innerHTML=JSON.parse(e.data).identification;
    }
    else if (JSON.parse(e.data).datatype == 'gamestate') {
        joueur = JSON.parse(e.data).player;
        if(w &&  JSON.parse(e.data).player=='w' || b &&  JSON.parse(e.data).player=='b'){
            document.getElementById('inputMessage').innerHTML="à vous de jouer"
            canplay = true;
        }
        else{
            document.getElementById('inputMessage').innerHTML="à votre adversaire de jouer"
            canplay = false;
        }    
        if(JSON.parse(e.data).lastplayer!=joueur){
            lastTabCase = JSON.parse(JSON.stringify(tabCase));
            tabCase = JSON.parse(e.data).plateau;
            lastjoueur = JSON.parse(e.data).lastplayer;
            actualizePlateau();
        }
        lastTabPionSelectable = JSON.parse(JSON.stringify(tabPionSelectable));
        tabPionSelectable = defineMeilleurCoupsPossible(JSON.parse(e.data).player);
        actualizeSelectable();
    }
};
}