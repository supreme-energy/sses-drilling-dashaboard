/**
 * Deploys contents of dist/ to an S3 bucket
 */

const fs = require("fs");
const path = require("path");
const aws = require("aws-sdk");
const readdir = require("node-readdir/lib/readdir");
const os = require("os");
const s3ls = require("s3-ls");

const [, , SOURCE_DIR, PROFILE_NAME, BUCKET_NAME, REMOTE_DIR, BUILD_INDEX] = process.argv;

let AWS_CONFIG;
const AWS_PATH = path.join(os.homedir(), ".s3DeployConfig.json");
if (fs.existsSync(AWS_PATH)) {
  try {
    AWS_CONFIG = require()[PROFILE_NAME];
  } catch (e) {}
}

if (!AWS_CONFIG) {
  if (PROFILE_NAME) {
    // try the environment
    const upper = PROFILE_NAME.toUpperCase();
    AWS_CONFIG = {
      accessKeyId: process.env[`AWS_${upper}_DEPLOY_ACCESS_KEY`],
      secretAccessKey: process.env[`AWS_${upper}_DEPLOY_SECRET_KEY`],
      mfaSerialNumber: null
    };
  } else {
    AWS_CONFIG = {
      accessKeyId: process.env[`AWS_DEPLOY_ACCESS_KEY`],
      secretAccessKey: process.env[`AWS_DEPLOY_SECRET_KEY`],
      mfaSerialNumber: null
    };
  }
}

const MUST_REVALIDATE = new Set(["index.html", "favicon.ico"]);

// if filename does not have a checksum hash in it of at least 7 digits aka "somefile.3938dd8f3.whatever.js
const CAN_CACHE_REGEX = /\.[0-9a-f]{7,}\./i;

const EXPIRES_DATE = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

const EXT_TO_MIME_TYPE = {
  html: "text/html",
  css: "text/css",
  json: "application/json",
  js: "application/javascript",
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpg",
  svg: "image/svg+xml",
  xml: "text/xml",
  ico: "image/x-icon",
  txt: "text/plain"
};

function getContentTypeByFile(fileName) {
  const extention = path.extname(fileName.toLowerCase()).replace(".", "");
  return EXT_TO_MIME_TYPE[extention] || "application/octet-stream";
}

function getFileList(SOURCE_DIR) {
  return new Promise((resolve, reject) => {
    // recursively read the directory to get all files
    readdir(
      SOURCE_DIR,
      { readContents: false },
      () => {},
      (err, files) => {
        if (err) {
          return reject(err);
        }

        // replace backslash with forward slash
        resolve(files.map(f => f.replace(/\\/g, "/")));
      }
    );
  });
}

// Get temporary session token generated from MFA code
function setupTemporaryCredentials(tokenCode) {
  return new Promise(resolve => {
    aws.config = new aws.Config();
    aws.config.update(AWS_CONFIG);
    const sts = new aws.STS();
    console.log("requesting session token");
    sts.getSessionToken(
      {
        DurationSeconds: 900,
        SerialNumber: AWS_CONFIG.mfaSerialNumber,
        TokenCode: tokenCode
      },
      (err, data) => {
        if (err) {
          console.error("Failed to get session token");
          console.error(err);
          process.exit(-1);
        } else {
          aws.config.credentials = sts.credentialsFrom(data);
          resolve();
        }
      }
    );
  });
}

function uploadFile(s3, fileName, content) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: content || fs.readFileSync(path.join(SOURCE_DIR, fileName)),
    ContentType: getContentTypeByFile(fileName)
  };

  if (REMOTE_DIR) {
    params.Key = REMOTE_DIR + "/" + fileName;
  }

  if (MUST_REVALIDATE.has(fileName) || !CAN_CACHE_REGEX.test(fileName)) {
    params.CacheControl = "max-age=0, must-revalidate";
  } else {
    params.Expires = EXPIRES_DATE;
  }

  return new Promise((resolve, reject) => s3.putObject(params, err => (err ? reject(err) : resolve())));
}

function promptForMfaToken() {
  return new Promise(resolve => {
    if (AWS_CONFIG.mfaSerialNumber) {
      process.stdout.write("Enter MFA Token: ");
      process.stdin.resume();
      process.stdin.setEncoding("utf8");
      process.stdin.once("data", input => resolve(input.trim()));
    } else {
      resolve();
    }
  });
}

function buildNewIndexFile(s3) {
  console.log("building new index.html");
  const lister = s3ls({ bucket: BUCKET_NAME, s3: s3 });
  const BASE_URL = REMOTE_DIR ? `https://${BUCKET_NAME}/${REMOTE_DIR}/` : `https://${BUCKET_NAME}/`;
  return lister.ls(REMOTE_DIR || "/").then(data => {
    function mapEntry(f) {
      // strip REMOTE_DIR from the front of the file
      let filename = REMOTE_DIR && f.indexOf(REMOTE_DIR) === 0 ? f.substr(REMOTE_DIR.length + 1) : f;
      if (filename === "index.html") {
        filename = "..";
      }
      const url = `${BASE_URL}${filename}`;
      const link = `<li><a href="${url}">${filename}</a></li>`;
      return link;
    }
    const links = [...data.files.map(mapEntry), ...data.folders.map(mapEntry)];
    const linkBlock = `<ul>${links.join("")}</ul>`;
    const body = `<body>${linkBlock}</body>`;
    const html = `<!doctype html><html lang="en"><head><title>${REMOTE_DIR || "/"}</title></head>${body}</html>`;

    return uploadFile(s3, "index.html", html);
  });
}

function main() {
  promptForMfaToken()
    .then(mfaToken => setupTemporaryCredentials(mfaToken))
    .then(() => {
      console.log("Starting upload...");

      const s3 = new aws.S3();
      return getFileList(SOURCE_DIR).then(fileList => {
        function doUpload(i) {
          const fileName = fileList[i];
          process.stdout.write(`Uploading ${fileName}...`);
          return uploadFile(s3, fileName).then(() => {
            console.log("Complete");
            const next = i + 1;
            if (next < fileList.length) {
              return doUpload(next);
            }
            return s3;
          });
        }

        return doUpload(0);
      });
    })
    .then(s3 => {
      console.log("Successfully uploaded all files");
      if (BUILD_INDEX === "true") {
        return buildNewIndexFile(s3);
      }
    })
    .then(() => {
      console.log("All done");
      process.exit();
    })
    .catch(err => {
      console.log("");
      console.error(err);
      process.exit(-1);
    });
}

main();
