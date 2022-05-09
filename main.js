const container = document.querySelector("#container");
const root = document.querySelector(":root");


let ELMH = 100, ELMW = 100;
let LIVE = "White";
let DEAD = "Transparent";
let trigger = false;

root.style.setProperty("--elmW" , ELMW);
root.style.setProperty("--elmH" , ELMH);

//list with piece (object)
let grid = [];
//list with cell live (index)
let live = [];
//create the grid
createGrid(grid, ELMW, ELMH);
//add event listener for press cell
setClickFunction(grid, live);


function findIndex(live, piece){
	for (let i = 0; i < live.length; i++){
		if (piece.x == live[i][0] && piece.y == live[i][1]){
			return i;
		}
	}
	return -1;
}

function setLive(grid, x, y, live){
	if (!grid[y][x].live){
		grid[y][x].live = true;
		grid[y][x].elm.style.background = LIVE;
		live.push([x,y]);
	}
}


function removeLive(grid, x, y){
	if (grid[y][x].live){
		grid[y][x].live = false;
		grid[y][x].elm.style.background = DEAD;
	}
}


function createGrid(grid, elmH, elmW){
	for (let y = 0; y < elmH; y++){
		let list = [];
		for (let x = 0; x < elmW; x++){
			//creo il piece
			let piece = new Piece(x, y);
			//creo l'elemento html
		    let newDiv = document.createElement("div");
			//aggiungo l'elm al argument dell'oggetto
			piece.elm = newDiv;
			piece.elm.classList.add("piece");
			//aggiungo al container il div
			container.appendChild(piece.elm);
			list.push(piece);
		}
		grid.push(list);
	}
}

function setClickFunction(grid, live){
	//for every piece if the mouse move and trigger = true it became live
	grid.forEach(gridY => {
		gridY.forEach(piece => {
			piece.elm.addEventListener('mouseenter', () => {
				if (trigger === true){
					setLive(grid, piece.x, piece.y, live)
				}
			})
			//if i press with the mouse only (without moving mouse) it became live
			piece.elm.addEventListener('mousedown', () => {
				setLive(grid, piece.x, piece.y, live)
			})
		})
	})
}

//if press mouse trigger true
document.addEventListener('mousedown', function(evt){
    trigger = true;
});

//if press mouse trigger false 
document.addEventListener('mouseup', function(evt){
    trigger = false;
})

//if press enter the generation start
document.addEventListener('keydown', function(evt){
	if (evt.key == 'Enter'){
		startGeneration(grid, live);
	}
})


//return gli indici dei vicini 
function getNeighbours(grid, piece){
	let neighbours = [];
	for (let y = piece.y - 1; y <= piece.y + 1; y++){
		//se e' fuori passo alla prossima iterazione
		if (y < 0 || y >= grid.length){
			continue;
		}
		for (let x = piece.x - 1; x <= piece.x + 1; x++){
			//se e' fuori passo alla prossima iterazione
			if (x < 0 || x >= grid[y].length || x === piece.x && y === piece.y){
				continue;
			}
			neighbours.push([x,y]);
		}

	}
	return neighbours;
}

function startGeneration(grid, live){
	let addPiece = [];
	for (let i = 0; i < live.length; i++){
		let pieceOpen = grid[live[i][1]][live[i][0]];
		//livi vicini
		let liveVicini = getLiveNeighbours(grid, pieceOpen);
		//morti vicini
		let deadVicini = getDeadNeighbours(grid, pieceOpen);

		//2 o 3 vicini a un vivo fanno sopravvivere il vivo
		if (liveVicini.length == 2 || liveVicini.length == 3){
			//aggiungo (pending non serve visto che non lo potro' trovare mai)
			addPiece.push([pieceOpen.x, pieceOpen.y]);
		}

		//caso in cui un morto ha 3 vicini vivi e diventa vivo anche lui
		for (let i = 0; i < deadVicini.length; i++){
			let newDeadPiece = grid[deadVicini[i][1]][deadVicini[i][0]];
			let newLiveVicini = getLiveNeighbours(grid, newDeadPiece);
			//se non e' gia' in pending e ci sono 3 vicini vivi
			if (newLiveVicini.length == 3 && newDeadPiece.pending == false){
				//aggiungo
				newDeadPiece.pending = true;
				addPiece.push([newDeadPiece.x, newDeadPiece.y]);
			}
		}
	}

	for (let i = 0; i < live.length; i++){
		removeLive(grid, live[i][0], live[i][1], live);
	}

	live.length = 0;
	for (let i = 0; i < addPiece.length; i++){
		grid[addPiece[i][1]][addPiece[i][0]].pending = false;
		setLive(grid, addPiece[i][0], addPiece[i][1], live)
	}
}


function getDeadNeighbours(grid, piece){
	let neighbours = getNeighbours(grid, piece);
	let deadVicini = [];
	for (let iVicini = 0; iVicini < neighbours.length; iVicini++){
		if (!(grid[neighbours[iVicini][1]][neighbours[iVicini][0]].live)){
			deadVicini.push([grid[neighbours[iVicini][1]][neighbours[iVicini][0]].x, grid[neighbours[iVicini][1]][neighbours[iVicini][0]].y]);
		}
	}
	return deadVicini;
}

function getLiveNeighbours(grid, piece){
	let neighbours = getNeighbours(grid, piece);
	let liveVicini = [];
	for (let iVicini = 0; iVicini < neighbours.length; iVicini++){
		if (grid[neighbours[iVicini][1]][neighbours[iVicini][0]].live){
			liveVicini.push([grid[neighbours[iVicini][1]][neighbours[iVicini][0]].x, grid[neighbours[iVicini][1]][neighbours[iVicini][0]].y]);
		}
	}
	return liveVicini;
}
