var tabCase = new Array;
var main = document.getElementById('main');
var pions = new Array;
var pionSelected;
var lastPionSelected;
var tabCoupsPossible = [];
var lastTabCoupsPossible = [];
var tabMangerPossible = [];
var lastTabMangerPossible = [];
var lastPos;
var lastTabCase;


class Position {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}

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

function createPion(pos = new Position, name = 'null') {
    let circle = document.createElement('div');
    circle.style.marginTop = pos.y * 60 + 5 + 'px';
    circle.style.marginLeft = pos.x * 60 + 5 + 'px';
    circle.className = 'pion';
    circle.id = name;
    circle.onclick = function () { selectPion(circle.id) };
    if (pos.y < 4) {
        circle.style.backgroundColor = 'black';
    } else {
        circle.style.backgroundColor = 'white';
    }
    main.appendChild(circle);
}

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

function initPlateau() {
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            createCase(new Position(x, y))
        }
    }
}

function initPion() {
    for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 10; x++) {
            if (tabCase[y][x] != 'null' && tabCase[y][x] != 'empty') createPion(new Position(x, y), tabCase[y][x]);
        }
    }
}

function selectPion(id) {
    if (tabMangerPossible.length == 0) {
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

function defineCoupsPossible() {
    let res = [];
    let y = lastPos.y + 1;
    if (pionSelected.charAt(0) == 'w') y = lastPos.y - 1;
    let x1 = lastPos.x + 1;
    let x2 = lastPos.x - 1;
    if (y >= 0 && y < 10) {
        if (tabCase[y][x1] == 'empty' && x1 >= 0 && x1 < 10) res.push('' + (x1) + (y));
        if (tabCase[y][x2] == 'empty' && x2 >= 0 && x2 < 10) res.push('' + (x2) + (y));
    }
    return res;
}

function defineMangerPossible(pos = lastPos, pion = pionSelected, tab=tabCase) {
    let res = [];
    for (let x = -2; x <= 2; x = x + 4) {
        for (let y = -2; y <= 2; y = y + 4) {
            if (pos.x + x >= 0 && pos.x + x < 10 && pos.y + y >= 0 && pos.y + y < 10) {
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
    return res;
}

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
            }
        }
        for (let i = 0; i < tabMangerPossible.length; i++) {
            if (tabMangerPossible[i] == '' + pos.x + pos.y) {
                lastTabCase = JSON.parse(JSON.stringify(tabCase));
                tabCase[pos.y][pos.x] = pionSelected;
                tabCase[lastPos.y][lastPos.x] = 'empty';
                tabCase[(lastPos.y + pos.y) / 2][(lastPos.x + pos.x) / 2] = 'r' + tabCase[(lastPos.y + pos.y) / 2][(lastPos.x + pos.x) / 2];
                lastTabMangerPossible = JSON.parse(JSON.stringify(tabMangerPossible));
                tabMangerPossible = [];
                actualizePlateau();
                lastPos = pos;
                tabMangerPossible = defineMangerPossible();
                if (tabMangerPossible.length == 0) {
                    lastPionSelected = pionSelected;
                    pionSelected = undefined;
                } else {
                    actualizeSelection();
                }
            }
        }
    }
}

function actualizePlateau() {
    actualizeSelection();
    if (lastTabCase != undefined) {
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                if (tabCase[y][x] != lastTabCase[y][x]) {
                    if (tabCase[y][x] != 'empty' && tabCase[y][x].charAt(0) != 'r') {
                        let pion = document.getElementById(tabCase[y][x]);
                        pion.style.zIndex = '3';
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

function actualizeSelection() {
    if (pionSelected != undefined) document.getElementById(pionSelected).style.border = 'solid 2px green';
    if (lastPionSelected != undefined && pionSelected != lastPionSelected) {
        document.getElementById(lastPionSelected).style.border = 'solid 2px #FFEECF';
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


initTableau();
initPlateau();
initPion();