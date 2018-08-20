const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

let incidenceMatStr =
`001100001
000010100
000010100
010001010
101100001
000000100
100100001
101100001
010000010
000010100
010001010`;

let incidenceMatStr2 =
`0000110000
1010000101
0001001000
1110000000
0000000010
1000100000
0000010101
0011001010
0100000100
0100110100
0010000000
0001000000`;

let t20 =
`00000001011000011001
00000111011001000001
01010010000001100110
00000101011000011001
00000101011000011001
01010010000001000000
00000000011000011000
00000100011000011000
00100010000010000110
10001000100100000000
00000101010000000001
10000000100100000000
01010010000001000000
01110010000001100110
00101010000010100110
00000000011000010000
10101000100100000000
01010010000000000000
00000000000010100110
00000000011000000000`;

function getMatrix() {
  return document.getElementById("matrix").value;
}

let x = getMatrix();

class Matrix {
  constructor(columns, rows) {
  this.rows = rows;
  this.columns = columns;
  this.content = [];

  for (let i = 0; i < this.rows * this.columns; i++) {
    this.content.push(undefined);
  }

    for (let i = 1; i < this.columns; i++) {
      this.set(i, 0, alphabet[i - 1]);
    }

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
}

Matrix.prototype.mirror = function(cornerToMirror) {
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

Matrix.prototype.copy = function(columns) {
  let copiedMatrix = new Matrix(columns.length + 1, this.rows);

  for (i = 0; i < columns.length; i++) {
    for (let j = 0; j < this.rows; j++) {
      copiedMatrix.set(i + 1, j, this.get(columns[i], j));
    }
  }
  return copiedMatrix;
}


function matrixFromString(string) {
  let splitedRows = string.split("\n");
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

function max(matrix) {
  let minMaxMat = new Matrix(matrix.columns, 4);

  for (let i = 1; i < matrix.columns; i++) {
    let max = 0;
    for (let j = 0; j < matrix.rows; j++) {
      if (matrix.get(i, j) > max) max = matrix.get(i, j);
    }
    minMaxMat.set(i, 1, max);
  }

  let minFromMax = 1;
  for (let i = 1; i < minMaxMat.columns; i++) {
    if (minMaxMat.get(i, 1) < minFromMax) minFromMax = minMaxMat.get(i, 1);
  }
  minMaxMat.set(1, 2, "min");
  minMaxMat.set(2, 2, minFromMax);

  for (let i = 1; i < matrix.columns; i++) {
    let moreOrEqualToMax = 0;
    for (let j = 1; j < matrix.rows; j++) {
      if (matrix.get(i, j) >= minFromMax) moreOrEqualToMax++;
    }
    minMaxMat.set(i, 3, moreOrEqualToMax);
  }
  return minMaxMat;
}

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


  function addSimilarToLeading(min, connFactMat) {
    let maxConnFactCol = false;
    for (let column of columnsLeft) {
      if (connFactMat.get(groups[groups.length -1][0], column) >= min) {
        maxConnFact = connFactMat.get(groups[groups.length -1][0], column);
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
  return {matrix: incMat.copy(order), groups: groups};
}

function colorGroups(orderedIncMat, groups) {
  let huesArr = [];
  for (let hue = 0; hue <= 360; hue += 45) huesArr.push(`hsl(${hue}, 100%, 70%)`);

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

function run() {

  let incMat = matrixFromString(document.getElementById("inputMatrix").value);
  let connFactMat = connectionFactorMatrix(incMat);
  let minMaxMat = max(connFactMat);
  let ordMat = orderedIncMat(incMat, connFactMat, minMaxMat);

  tableFromMatrix(incMat, "table_1");
  tableFromMatrix(connFactMat, "table_2");
  tableFromMatrix(minMaxMat, "table_3");
  tableFromMatrix(ordMat.matrix, "table_4");

  colorGroups(ordMat.matrix, ordMat.groups);
  location.reload();
}
