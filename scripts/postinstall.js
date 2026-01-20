/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

const zeroValue = 0;

const getFilePath = (packageName, file) => {
  const filePath = `${packageName}/${file}`;
  const rootPaths = [
    '../',
    '../../',
    './node_modules/',
    '../../node_modules/',
  ];

  let foundPath = null;

  rootPaths.forEach((rootPath) => {
    const tryPath = `${rootPath}/${filePath}`;

    if (fs.existsSync(tryPath) && foundPath === null) {
      foundPath = tryPath;
    }
  });

  return foundPath;
};

const getFileContent = (filePath) => {
  if (fs.existsSync(filePath)) {
    const file = fs.readFileSync(
      filePath,
      'utf8',
    );

    if (file) {
      return file;
    }
  }

  return null;
};

const saveFileContent = (filePath, data) => {
  fs.writeFileSync(
    filePath,
    data,
  );
};

const zem = () => {
  const packageName = 'zod-express-middleware';
  const filePath = 'lib/index.js';

  const fullFilePath = getFilePath(
    packageName,
    filePath,
  );

  if (fullFilePath !== null) {
    const fileContent = getFileContent(fullFilePath);

    if (fileContent !== null) {
      const updatedFileContent = fileContent.replace(
        '.send(errors.map(function (error) { return ({ type: error.type, errors: error.errors }); }));',
        '.send({message: \'Invalid request\', key: \'REQUEST_VALIDATION_ERROR\', data: errors.map(function (error) { return ({ type: error.type, errors: error.errors }); })});',
      );

      saveFileContent(
        fullFilePath,
        updatedFileContent,
      );

      console.info(`Updated ${packageName}`);
    } else {
      console.error(`Unable to get ${packageName}/${filePath} content`);

      process.exit(zeroValue);
    }
  } else {
    console.error(`Unable to get ${packageName}/${filePath}`);

    process.exit(zeroValue);
  }
};

const main = () => {
  zem();
};

main();
