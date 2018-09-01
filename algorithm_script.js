"use strict";

const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];


// pusta macierz o określonej liczbie wierszy i kolumn
class Matrix {
  constructor(columns, rows) {
  this.rows = rows;
  this.columns = columns;
  this.content = [];

  for (let i = 0; i < this.rows * this.columns; i++) {
    this.content.push(undefined);
  }
    // nazwy kolumn A, B, C, ...
    for (let i = 1; i < this.columns; i++) {
      this.set(i, 0, alphabet[i - 1]);
    }

    // numery wierszy 1, 2, 3, ...
    for (let i = 1; i <= this.rows; i++) {
      this.set(0, i, i);
    }
  }

  get(column, row) {
    return this.content[row * this.columns + column];
  }

  set(column, row, value) {
    this.content[row * this.columns + column] = value;
  }

  // tworzy lustrzane odbicie symetrycznej macierzy wzdłuż diagonali
  mirror(cornerToMirror) {
    let mirrorMatrix = new Matrix(this.columns, this.rows);
    mirrorMatrix.content = this.content;

      for (let i = 0; i < mirrorMatrix.rows; i++) {
        for (let j = 1; j < mirrorMatrix.columns; j++) {
          if (cornerToMirror === "bottom-left") {
            mirrorMatrix.set(j, i, this.get(i, j));
          }
          if (cornerToMirror === "top-right") {
            mirrorMatrix.set(i, j, this.get(j, i));
          }
        }
      }
    return mirrorMatrix;
  }

  // kopiuje określone kolumny do nowej macierzy columns to array
  copy(columns) {
    let copiedMatrix = new Matrix(columns.length + 1, this.rows);

    for (let i = 0; i < columns.length; i++) {
      for (let j = 0; j < this.rows; j++) {
        copiedMatrix.set(i + 1, j, this.get(columns[i], j));
      }
    }
    return copiedMatrix;
  }
}

class InputError extends Error {};

function testInput(rows) {
  let matWidth = rows[0].length;
  let status = true;
  rows.forEach(row => {
    if (row.length !== matWidth) {
      status = "Każdy wiersz powinien mieć taką samą liczbę kolumn!";
    }
    if (/[^01]/.test(row)) {
      status = "Dopuszczalne wartości w macierzy to 0 lub 1!";
    }
    if (row.length < 2) {status = "Brak danych";}
  });
  if (status !== true) {
    throw new InputError(status);
  }
}


// tworzy macierz z stringa, w którym wiersze są oddzielone enterem
function matrixFromString(string) {
  let splitedRows = string.split("\n");
  if (testInput(splitedRows) instanceof Error) return testInput(splitedRows);
  let matrix = new Matrix(splitedRows[0].length + 1, splitedRows.length + 1);

  let rowNum = 1;
  splitedRows.forEach(row => {
    for (let columnNum = 1; columnNum <= row.length; columnNum++) {
      matrix.set(columnNum, rowNum, Number(row.split("")[columnNum - 1]));
    }
    rowNum++;
  });
  return matrix;
}

// dla każdej pary wyrobów oblicza ich współczynnik podobieństwa,
// wynik zwraca w postaci symetrycznej macierzy współczyników
function connectionFactorMatrix(incidenceMatrix) {
  let connFactMat = new Matrix(incidenceMatrix.columns, incidenceMatrix.columns);

  for (let i = 1; i <= connFactMat.columns; i++) {
    for (let j = i + 1; j <= connFactMat.columns; j++) {
      let jointOperations = 0;
      let allOperations = 0;
      for (let rowNum = 1; rowNum <= incidenceMatrix.rows; rowNum++) {
        let a = incidenceMatrix.get(i, rowNum);
        let b = incidenceMatrix.get(j, rowNum);
        if (a == 1) allOperations++;
        if (b == 1) allOperations++;
        if (a && b) jointOperations++;
      }
      let connectionFactor = jointOperations / (allOperations - jointOperations);
      connectionFactor = round(connectionFactor, 2);
      connFactMat.set(j, i, connectionFactor);
    }
  }
  return(connFactMat.mirror("top-right"));
}

// podsumowanie macierzy współczyników
function max(matrix) {
  let minMaxMat = new Matrix(matrix.columns, 4);

  // z każdej kolumny wybiera wartośc maksymalną
  for (let i = 1; i < matrix.columns; i++) {
    let max = 0;
    for (let j = 0; j < matrix.rows; j++) {
      if (matrix.get(i, j) > max) max = matrix.get(i, j);
    }
    minMaxMat.set(i, 1, max);
  }

  // ze wszystkich wartości maksymalnych wybiera najmniejszą
  let minFromMax = 1;
  for (let i = 1; i < minMaxMat.columns; i++) {
    if (minMaxMat.get(i, 1) < minFromMax) minFromMax = minMaxMat.get(i, 1);
  }
  minMaxMat.set(1, 2, "min");
  minMaxMat.set(2, 2, minFromMax);

  // sprawdza ile wartości w danej kolumnie jest większa bądź równa
  // wartości minimalnej
  for (let i = 1; i < matrix.columns; i++) {
    let moreOrEqualToMax = 0;
    for (let j = 1; j < matrix.rows; j++) {
      if (matrix.get(i, j) >= minFromMax) moreOrEqualToMax++;
    }
    minMaxMat.set(i, 3, moreOrEqualToMax);
  }
  return minMaxMat;
}

// wydziela grupy złożone z wyrobów podobnych
function orderedIncMat(incMat, connFactMat, minMaxMat) {
  let orderedMat = new Matrix(incMat.columns, incMat.rows);
  let min = minMaxMat.get(2, 2);
  let groups = [];
  let currentGroup = -1;
  let order = [];
  let columnsLeft = [];
  for (let i = 1; i < incMat.columns; i++) {
    columnsLeft.push(i);
  }

  // wybiera wyrób wiodący
  function choseLeading(minMaxMat) {
    if (columnsLeft[0]) {
      let leadingProductCol = 0;
      let leadingProductValue = 0;

      for (let column of columnsLeft) {
        if (minMaxMat.get(column, 3) > leadingProductValue) {
          leadingProductCol = column;
          leadingProductValue = minMaxMat.get(column, 3);
        }
      }

      columnsLeft = columnsLeft.filter(column => {
        return column !== leadingProductCol;
      })
      currentGroup++;
      groups.push([leadingProductCol]);
      order.push(leadingProductCol);
      addSimilarToLeading(min, connFactMat);
    }
  }

  choseLeading(minMaxMat);

  // wybiera wyroby najbardziej podobne do obecnego wyrobu wiodącego
  // jeśli takich nie ma to to uruchami choseLeading(), aby wybrac nowy
  function addSimilarToLeading(min, connFactMat) {
    let maxConnFactCol = false;
    for (let column of columnsLeft) {
      if (connFactMat.get(groups[groups.length -1][0], column) >= min) {
        maxConnFactCol = column;
      }
    }
    columnsLeft = columnsLeft.filter(column => {
      return column !== maxConnFactCol;
    });

    if (maxConnFactCol) {
      order.push(maxConnFactCol);
      groups[currentGroup].push(maxConnFactCol);
      addSimilarToLeading(min, connFactMat);
    } else choseLeading(minMaxMat);

  }
  // zwraca object z properties matrix: uporządkowana macierz
  // groups: wydzielone grupy w postaci arraya: np. [[x y z], [a, b], [i, j, k]]
  return {matrix: incMat.copy(order), groups: groups};
}

// na podstawie macirzy tworzy tabele
function tableFromMatrix(matrix, tableId) {
  let headingRow = document.createElement("tr");
  document.getElementById(tableId).appendChild(headingRow);
  for (let i = 0; i < matrix.columns; i++) {
    let headingCell = document.createElement("th");
    if (matrix.get(i, 0) === undefined) headingCell.style.backgroundColor = "#B8B8B8";
    headingCell.textContent = matrix.get(i, 0);
    headingRow.appendChild(headingCell);
  }

  for (let i = 1; i < matrix.rows; i++) {
    let row = document.createElement("tr");
    let headingCell = document.createElement("th");
    headingCell.textContent = matrix.get(0, i);
    row.appendChild(headingCell);
    document.getElementById(tableId).appendChild(row);
    for (let j = 1; j < matrix.columns; j++){
      let cell = document.createElement("td");
      let rows = document.getElementsByTagName("tr");
      let currentRow = rows[rows.length - 1];
      if (matrix.get(j, i) === undefined) cell.style.backgroundColor = "#B8B8B8";
      matrix.get(j, i) === 0 ? cell.textContent = "" : cell.textContent = matrix.get(j, i);
      currentRow.appendChild(cell);
    }
  }
}

// grupy wyrobów podobnych mają różne kolory tła tabeli wybierane losowo
function colorGroups(orderedIncMat, groups) {
  let huesArr = [];
  for (let hue = 0; hue < 360; hue += 45) huesArr.push(`hsl(${hue}, 100%, 70%)`);

  let start = 1;
  groups.forEach(group => {
    let color = huesArr[Math.round(Math.random() * (huesArr.length - 1))];
    for (let i = start; i < group.length + start; i++) {
      for (let j = 0; j < orderedIncMat.rows; j++) {
      document.getElementById("table_4")
        .children[j].children[i].style.backgroundColor = color;
      }
    }
    huesArr = huesArr.filter(hue => {return hue !== color;})
    start += group.length;
  });
}

function round(number, numbersAfterDot) {
  let n = Math.pow(10, numbersAfterDot);
  return Math.round(number * n) / n;
}

function reset() {
  let tables = document.getElementsByTagName("table");
  for (let i = 0; i < tables.length; i++) {
    while (tables[i].firstChild) {
      tables[i].removeChild(tables[i].firstChild);
    }
  }
}

function run() {
  reset();

  let err = document.getElementById("errorMessage");

  try {
    let err = document.getElementById("errorMessage");
    let incMat = matrixFromString(document.getElementById("inputMatrix").value);
    let connFactMat = connectionFactorMatrix(incMat);
    let minMaxMat = max(connFactMat);
    let ordMat = orderedIncMat(incMat, connFactMat, minMaxMat);


    tableFromMatrix(incMat, "table_1");
    tableFromMatrix(connFactMat, "table_2");
    tableFromMatrix(minMaxMat, "table_3");
    tableFromMatrix(ordMat.matrix, "table_4");

    colorGroups(ordMat.matrix, ordMat.groups);
    err.textContent = "";
    document.getElementsByClassName("table")[0].style.display = "block";
  } catch (e) {
    if (e instanceof InputError) {
      err.textContent = "InputError: " + e.message;
      console.log(e);
    } else {
      err.textContent = "Error: coś poszło nie tak!"
      console.log(e);
    }
  }
}
