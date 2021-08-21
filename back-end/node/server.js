//paquetes necesarios para el proyecto
//require('dotenv').config();
var dotenv = require('dotenv');
var result = dotenv.config();
if (result.error) {
  console.log(result.error);
}
console.log(result.parsed);

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var CompetenciasController = require('./controladores/competenciasController');

var app = express();
var con = require('./lib/conexionbd.js');

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

//get que trae las competencias
app.get('/competencias', CompetenciasController.cargarCompetencias);
//get que trae una competencia en particular
app.get('/competencias/:idCompetencia', CompetenciasController.obtenerCompetencia);
//get que trae las opciones de peliculas de una competencia
app.get('/competencias/:id/peliculas', CompetenciasController.obtenerOpciones);
//post para sumar un voto a una pelicula de una competencia
app.post('/competencias/:idCompetencia/voto', CompetenciasController.votar);
//get para obtener los resultados de una competencia
app.get('/competencias/:idCompetencia/resultados', CompetenciasController.obtenerResultados);
//get que carga los generos
app.get('/generos', CompetenciasController.cargarGeneros);
//get que carga los directores
app.get('/directores', CompetenciasController.cargarDirectores);
//get que carga los actores
app.get('/actores', CompetenciasController.cargarActores);
//post para crear una competencia
app.post('/competencias', CompetenciasController.crearCompetencia);
//delete para reiniciar los votos de una competencia
app.delete('/competencias/:idCompetencia/votos', CompetenciasController.reiniciarVotos);
//delete para eliminar una competencia
app.delete('/competencias/:idCompetencia', CompetenciasController.eliminarCompetencia);
//put para editar el nombre de una competencia
app.put('/competencias/:idCompetencia', CompetenciasController.editarCompetencia);


//seteo del puerto que va a escuchar los pedidos la aplicación
var puerto = '8080';

app.listen(puerto, function () {
  console.log( "Escuchando en el puerto " + puerto );
});
