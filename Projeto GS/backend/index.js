require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

const PORT = 5500;
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// 🔧 Serve arquivos estáticos (HTML, JS, CSS) a partir da raiz
app.use(express.static(path.join(__dirname, '..')));

// 🔐 Redireciona para a API do Google sem expor a chave
app.get('/maps-api', (req, res) => {
  const callback = req.query.callback || 'initMap';
  const url = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry&callback=${callback}`;
  res.redirect(url);
});

// 🔄 Endpoint de rota
app.get('/maps', async (req, res) => {
  const { origin, destination } = req.query;

  if (!origin || !destination) {
    return res.status(400).send({ error: 'Parâmetros origin e destination são obrigatórios.' });
  }

  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
      params: { origin, destination, key: GOOGLE_MAPS_API_KEY },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).send({ error: 'Erro ao buscar rota', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
