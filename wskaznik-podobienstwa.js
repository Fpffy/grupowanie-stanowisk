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

class Matrix {
  constructor(columns, rows) {
    this.rows = rows;
    this.columns = columns;
    this.content = [];

    for (let i = 0; i < columns * rows; i++) {
      this.content.push(undefined);
    }
  }

  get(column, row) {
    return this.content[row * this.columns + column];
  }

  set(column, row, value) {
    this.content[row * this.columns + column] = value;
  }
}

function matrixFromString(string) {
  let splitedRows = string.split("\n");
  let matrix = new Matrix(splitedRows[0].length, splitedRows.length);

  let rowNum = 0;
  splitedRows.forEach(row => {
    for (let columnNum = 0; columnNum < row.length; columnNum++) {
      matrix.set(columnNum, rowNum, Number(row.split("")[columnNum]));
    }
    rowNum++;
  });
  return matrix;
}

//console.log(matrixFromString(incidenceMatStr));
//matrixFromString(incidenceMatrix);

let incMat = matrixFromString(incidenceMatStr);

function connectionFactor(a, b) {
  let jointOperations = 0;
  let allOperations = 0;

  if (a || b) allOperations++;


  let connectionFactor
  return jointOperations / (allOperations - jointOperations);

  //console.log(jointOperations, allOperations)

}
//console.log(connectionFactor(0, 0));

function connectionFactorMatrix(incidenceMatrix) {
  let connFactMat = new Matrix(incidenceMatrix.columns, incidenceMatrix.rows);

  for (let i = 0; i < connFactMat.columns; i++) {
    for (let j = i + 1; j < connFactMat.columns; j++) {
      let jointOperations = 0;
      let allOperations = 0;
      for (let rowNum = 0; rowNum < connFactMat.rows; rowNum++) {
        let a = incidenceMatrix.get(i, rowNum);
        let b = incidenceMatrix.get(j, rowNum);
        if (a) allOperations++;
        if (b) allOperations++;
        if (a + b === 2) jointOperations++;
      }
      //console.log(jointOperations, allOperations);
      let connectionFactor = jointOperations / (allOperations - jointOperations);
      //console.log(connectionFactor);

      connFactMat.set(i, j, connectionFactor);
    }
  }
  return(connFactMat);
}

console.log(connectionFactorMatrix(incMat));
