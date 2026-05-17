const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const mensajes = [];

/*
========================================
WEBHOOK VERIFICACION META
========================================
*/

app.get("/webhook", (req, res) => {

  const verifyToken = "fmcielo_token";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode &&
    token &&
    mode === "subscribe" &&
    token === verifyToken
  ) {

    console.log("Webhook verificado");
    return res.status(200).send(challenge);

  }

  res.sendStatus(403);

});

/*
========================================
RECIBIR MENSAJES WHATSAPP
========================================
*/

app.post("/webhook", (req, res) => {

  try {

    const body = req.body;

    const mensaje =
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!mensaje) {
      return res.sendStatus(200);
    }

    // SOLO texto
    if (mensaje.type !== "text") {
      return res.sendStatus(200);
    }

    const texto = mensaje.text.body.trim();

    // SOLO 3 DIGITOS
    if (!/^\d{3}$/.test(texto)) {
      return res.sendStatus(200);
    }

    mensajes.push({
      numero: texto,
      timestamp: Date.now()
    });

    console.log("Número guardado:", texto);

    res.sendStatus(200);

  } catch (error) {

    console.log(error);

    res.sendStatus(500);

  }

});

/*
========================================
OBTENER NUMEROS
========================================
*/

app.get("/numeros", (req, res) => {

  const desde = req.query.desde;

  if (!desde) {
    return res.json([]);
  }

  const ahora = new Date();

  const [hora, minuto] = desde.split(":");

  const fechaFiltro = new Date();

  fechaFiltro.setHours(hora);
  fechaFiltro.setMinutes(minuto);
  fechaFiltro.setSeconds(0);

  const filtrados = mensajes.filter(m => {

    const fechaMensaje = new Date(m.timestamp);

    // mismo dia
    const mismoDia =
      fechaMensaje.toDateString()
      === ahora.toDateString();

    // despues de la hora elegida
    const despues =
      fechaMensaje >= fechaFiltro;

    return mismoDia && despues;

  });

  res.json(filtrados);

});

/*
========================================
INICIAR SERVIDOR
========================================
*/

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor iniciado");
});
