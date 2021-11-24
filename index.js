var tabCase = new Array;
var main = document.getElementById('main');
var pions = new Array;
var pionSelected;
var lastPionSelected;
var tabCoupsPossible = [];
var lastTabCoupsPossible = [];
var tabMangerPossible = [];
var lastTabMangerPossible = [];
var tabPionSelectable = [];
var lastTabPionSelectable = [];
var lastPos;
var lastTabCase;
var rafle = false;
var posEnemy;
var joueur = 'w';

/**
 * Classe position
 * Possède deux attributs x et y représentant respectivant la position sur l'axe des abscisses et l'axe des ordonnées
 */
class Position {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

function isInPlateau(pos = new Position()) {
    return pos.x >= 0 && pos.x < 10 && pos.y >= 0 && pos.y < 10;
}

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
 * Créer le 
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
 * 
 */
function initPlateau() {
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            createCase(new Position(x, y))
        }
    }
}

/**
 * 
 */
function initPion() {
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (tabCase[y][x] != 'null' && tabCase[y][x] != 'empty') createPion(new Position(x, y), tabCase[y][x]);
        }
    }
}

/**
 * 
 * @param {*} id 
 * @returns 
 */
function selectPion(id) {
    if (!rafle || tabMangerPossible.length == 0) {
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
 * Cette fonction retourne les coups possibles pour un pion donné, à une position donnée dans un tableau de case donné.
 * Elle ne retourne que les coups qui ne mange pas de pion adverse.
 * @param {Position} pos : position du pion selctionné (default value : lastPos)
 * @param {string} pion : pion selectionné (default value : pionSelected)
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
                    if (isInPlateau(new Position(x1, y1)) && tab[y1][x1] == 'empty') res.push('' + (x1) + (y1));
                    else i = 10;
                }
            }
        }
    } else {
        let y = pos.y + 1;
        if (pion.charAt(0) == 'w') y = pos.y - 1;
        let x1 = pos.x + 1;
        let x2 = pos.x - 1;
        if (tab[y][x1] == 'empty' && isInPlateau(new Position(x1, y))) res.push('' + (x1) + (y));
        if (tab[y][x2] == 'empty' && isInPlateau(new Position(x2, y))) res.push('' + (x2) + (y));
    }
    return res;
}
/**
 * Cette fonction retourne les coups possibles pour un pion donné, à une position donnée dans un tableau de case donné.
 * Elle ne retourne que les coups qui mange un pion adverse.
 * @param {Position} pos : position du pion selctionné (default value : lastPos)
 * @param {string} pion : pion selectionné (default value : pionSelected)
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
                    if (isInPlateau(new Position(x1, y1))) {
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
                if (isInPlateau(new Position(pos.x + x, pos.y + y))) {
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

/*----------------------------------------------------------------Fonction récursive de recherche du meilleur coups----------------------------------------------------------------- */
/*-----------------------------------------------------------------INCOMPLETE A FINIR SI LE TEMPS EN FIN DE PROJET------------------------------------------------------------------ */
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

/**
 * 
 * @param {*} j 
 * @returns 
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
 * 
 * @param {*} pos 
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
                actualizePlateau();
                createDame(pos, lastPionSelected);
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
                    if ((tabCase[y0][x0].charAt(0) == 'w' && joueur == 'b') || (tabCase[y0][x0].charAt(0) == 'b' && joueur == 'w')) tabCase[y0][x0] = 'r' + tabCase[y0][x0];
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

function createDame(pos = lastPos, pion = pionSelected) {
    console.log('1');
    if (pion.charAt(pion.length - 1) != 'd' && ((pos.y == 0 && pion.charAt(0) == 'w') || (pos.y == 9 && pion.charAt(0) == 'b'))) {
        console.log('2');
        lastTabCase = JSON.parse(JSON.stringify(tabCase));
        tabCase[pos.y][pos.x] = tabCase[pos.y][pos.x] + 'd';
        actualizePlateau();
        rafle=false;
        return true;
    }
    return false;
}


/**
 * 
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
                    } else if (tabCase[y][x] != 'empty' && tabCase[y][x].charAt(0) != 'r') {
                        let pion = document.getElementById(tabCase[y][x]);
                        pion.style.marginTop = y * 60 + 5 + 'px';
                        pion.style.marginLeft = x * 60 + 5 + 'px';
                    } else if (tabCase[y][x].charAt(0) == 'r') {
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
 * 
 */
function actualizeSelection() {
    if (pionSelected != undefined) document.getElementById(pionSelected).style.border = 'solid 2px green';
    if (lastPionSelected != undefined && pionSelected != lastPionSelected) {
        document.getElementById(lastPionSelected).style.border = 'solid 2px red';
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
 * 
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

/**
 * 
 */
function tour() {
    if (!rafle) {
        joueur = (joueur == 'w' ? 'b' : 'w');
        lastTabPionSelectable = JSON.parse(JSON.stringify(tabPionSelectable));
        tabPionSelectable = defineMeilleurCoupsPossible(joueur);
        actualizeSelectable();
    }
}

initTableau();
initPlateau();
initPion();

tabPionSelectable = defineMeilleurCoupsPossible(joueur);
actualizeSelectable();