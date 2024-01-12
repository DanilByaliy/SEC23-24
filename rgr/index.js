const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");
const forge = require("node-forge");
const CryptoJS = require("crypto-js");
const rsa = forge.pki.rsa;
const port = 3000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({}));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

let secret = "";
app.post("/handshake", (req, res) => {
  secret = "";
  const { message } = req.body;
  secret += message;
  const serverMessage = "server";
  secret += serverMessage;
  res.json({ message: serverMessage });
});

let privateKey;

app.get("/publickey", (req, res) => {
  var keypair = rsa.generateKeyPair(4096);
  privateKey = keypair.privateKey;
  const publicKeyPem = forge.pki.publicKeyToRSAPublicKeyPem(keypair.publicKey);
  res.json({ publicKeyPem });
});

app.post("/premaster", (req, res) => {
  const { premaster } = req.body;

  const encryptedVal = forge.util.decode64(premaster);
  const decryptedVal = privateKey.decrypt(encryptedVal, "RSA-OAEP");

  secret += decryptedVal;
  res.end();
});

let isConnectionSecure = false;

const scheduleDisconnection = () => {
  const averageDelay = 10;
  const deviation = 5;
  let currentDelay = averageDelay + (Math.random() * 2 - 1) * deviation;
  console.log("CurrentDelay: ", currentDelay);

  setTimeout(() => {
    console.log("Disconnecting..");
    isConnectionSecure = false;
  }, currentDelay * 1000);
};

app.post("/ready", (req, res) => {
  const { ready } = req.body;

  const bytes = CryptoJS.AES.decrypt(ready, secret);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);

  console.log("Conected");
  isConnectionSecure = true;
  scheduleDisconnection();

  const ciphertext = CryptoJS.AES.encrypt("server ready", secret).toString();
  res.json({ ready: ciphertext });
});

app.post("/reset", (req, res) => {
  secret = "";
  res.end();
});

app.post("/message", (req, res) => {
  const { message } = req.body;
  console.log("Message: ", message);

  if (!secret) return;
  const bytes = CryptoJS.AES.decrypt(message, secret);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);

  console.log("Decrypted message: ", originalText);
  res.end();
});

app.post("/file", (req, res) => {
  if (!isConnectionSecure)
    return res.status(403).send("The connection is not secure");
  const fileContent = req.files.file.data.toString();
  const fileName = req.files.file.name;
  req.files.file.mv("files/" + fileName);

  if (!secret) return;
  const bytes = CryptoJS.AES.decrypt(fileContent, secret);
  const originalText = bytes.toString(CryptoJS.enc.Utf8);

  res.end();
  fs.writeFile("files/encoded-" + fileName, originalText, () => {});
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
