import type { PointValue } from 'server/src/types';

const changePointValueToALetter = (pointValue: PointValue) => {
  switch (pointValue) {
    case 0:
      return ' ';
    case 1:
      return 'X';
    case 2:
      return 'O';
  }
};

export const printBoard = (board: PointValue[][]) => {
  console.log();

  board.forEach((row, index) => {
    console.log(
      `| ${changePointValueToALetter(row[0])} | ${changePointValueToALetter(
        row[1],
      )} | ${changePointValueToALetter(row[2])} |`,
    );
    if (index !== 2) console.log('  -   -   -  ');
  });

  console.log();
};
