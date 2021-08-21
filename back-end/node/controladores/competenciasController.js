var con = require('../lib/conexionbd');

function cargarCompetencias(req, res) {
  var sql = "select * from competencia";
  con.query(sql, function(error, resultado, fields) {
      if (error) {
          console.log("Hubo un error en la consulta", error.message);
          return res.status(404).send("Hubo un error en la consulta");
      }
      var response = {
          'competencias': resultado,
          'cant': resultado.length
      };
      res.send(response);
  });
}

function obtenerCompetencia(req, res) {
  var idCompetencia = req.params.idCompetencia;
  var sql = "select * from competencia where id = " + idCompetencia;
  con.query(sql, function(error, competencia, fields) {
      if (error) {
          console.log("Hubo un error en la consulta", error.message);
          return res.status(404).send("Hubo un error en la consulta");
      }
      sql = "select g.nombre as genero_nombre from genero g join competencia c on g.id=c.genero_id where g.id = " + competencia[0].genero_id;
      con.query(sql, function(error, genero, fields) {
          if (error) {
              return res.status(404).send("Hubo un error en la consulta");
          }
        sql = "select d.nombre as director_nombre from director d join competencia c on d.id=c.director_id where d.id = " + competencia[0].director_id;
        con.query(sql, function(error, director, fields) {
            if (error) {
                return res.status(404).send("Hubo un error en la consulta");
            }
          sql = "select a.nombre as actor_nombre from actor a join competencia c on a.id=c.actor_id where a.id = " + competencia[0].actor_id;
          con.query(sql, function(error, actor, fields) {
              if (error) {
                  return res.status(404).send("Hubo un error en la consulta");
              }

      var gen = undefined;
      var act = undefined;
      var dir = undefined;

      if(genero.length > 0){
        gen = genero[0].genero_nombre;
      }
      if(director.length > 0){
        dir = director[0].director_nombre;
      }
      if(actor.length > 0){
        act = actor[0].actor_nombre;
      }

      console.log(gen + " " + dir + " " + act);
        var response = {
            'competencias': competencia[0],
            'genero': gen,
            'director': dir,
            'actor': act
        };
        console.log(response);
        res.send(response);
        });
      });
    });
  });
}

function obtenerOpciones(req, res) {
  var sql;
  var idCompetencia = req.params.id;
  console.log(idCompetencia);
  sql = "select * from competencia where id = " + idCompetencia;
  con.query(sql, function(error, competencia, fields) {
      if (error) {
          return res.status(404).json("No existe esa competencia");
      }
    sql = "select distinct p.id, p.poster, p.titulo from pelicula p";
    var orderYLimit = " order by rand() limit 2";

    console.log(competencia[0].genero_id);
    console.log(competencia[0].director_id);
    console.log(competencia[0].actor_id);

    //si la pelicula no tiene filtros
    if (competencia[0].genero_id == null && competencia[0].director_id == null && competencia[0].actor_id == null) {
      sql = sql + orderYLimit;
      console.log(sql);
      con.query(sql, function(error, peliculas, fields) {
          if (error) return res.status(500).json(error);
          var response = {
            'competencia': competencia[0].nombre,
            'peliculas': peliculas
          };
          console.log(response.competencia);
          console.log(response.peliculas);
          res.send(JSON.stringify(response));
      });
    }

    //si la pelicula tiene algun filtro
    else {
      sql = sql + " join genero g on p.genero_id = g.id join actor_pelicula ap on p.id = ap.pelicula_id join actor a on ap.actor_id = a.id join director_pelicula dp on p.id = dp.pelicula_id join director d on dp.director_id = d.id where 1=1";
      if(competencia[0].genero_id) {
        var genero = competencia[0].genero_id;
        sql = sql + " and g.id = '" + genero + "'";
      }
      if (competencia[0].director_id) {
        var director = competencia[0].director_id;
        sql = sql + " and d.id = '" + director + "'";
      }
      if (competencia[0].actor_id) {
        var actor = competencia[0].actor_id;
        sql = sql + " and a.id = '" + actor + "'";
      }
      sql = sql + orderYLimit;
      console.log(sql);
      con.query(sql, function(error, peliculas, fields) {
          if (error) return res.status(500).json(error);
          var response = {
            'competencia': competencia[0].nombre,
            'peliculas': peliculas
          };
          console.log(response.competencia);
          console.log(response.peliculas);
          res.send(JSON.stringify(response));
      });
    }
  });
}

function votar(req, res) {
  var datos = req.body;
  var idPelicula = datos.idPelicula;
  var idCompetencia = req.params.idCompetencia;
  var existe = false;

  if (idPelicula < 1 || idPelicula > 743) {
    return res.status(404).json("No existe esa pelicula");
  }

  var sql = "select * from competencia";
  con.query(sql, function(error, resultado, fields) {
      if (error) {
          console.log("Hubo un error en la consulta", error.message);
          return res.status(404).send("Hubo un error en la consulta");
      }
      for (var i = 0; i < resultado.length; i++) {
        if (idCompetencia==resultado[i].id) {
          existe = true;
          con.query('INSERT INTO voto (pelicula_id, competencia_id) VALUES (?,?)', [idPelicula, idCompetencia], function (error, results, fields) {
              if (error) return res.status(500).json(error);
              res.json(results); // o res.json(results.insertId)
          });
        }
      }
      if(existe==false){
        return res.status(404).json("No existe esa competencia");
      }
  });
}

function obtenerResultados(req, res) {
  var idCompetencia = req.params.idCompetencia;
  var existe = false;
  var sql = "select * from competencia";
  con.query(sql, function(error, resultado, fields) {
      if (error) {
          console.log("Hubo un error en la consulta", error.message);
          return res.status(404).send("Hubo un error en la consulta");
      }
      for (var i = 0; i < resultado.length; i++) {
        if(resultado[i].id == idCompetencia) {
          existe = true;
        }
      }
      if (existe == true) {
        sql = "select competencia.nombre, voto.pelicula_id, count(*) as votos, pelicula.poster, pelicula.titulo from voto join competencia on voto.competencia_id = competencia.id join pelicula on voto.pelicula_id = pelicula.id where voto.competencia_id = " + idCompetencia + " group by voto.pelicula_id order by votos desc limit 3";
        con.query(sql, function(error, resultados, fields) {
            if (error) return res.status(500).json(error);
            var response = {
                'competencia': resultados.nombre,
                'resultados': resultados
            };
            res.send(JSON.stringify(response));
        });
      }
      else {
        return res.status(404).json("Esa competencia no existe");
      }
  });
}

function cargarGeneros(req, res) {
  var sql = "select * from genero";
  con.query(sql, function(error, resultado, fields) {
      if (error) {
          console.log("Hubo un error en la consulta", error.message);
          return res.status(404).send("Hubo un error en la consulta");
      }
      var response = {
          'generos': resultado
      };
      res.send(JSON.stringify(response));
  });
}

function cargarDirectores(req, res) {
  var sql = "select * from director";
  con.query(sql, function(error, resultado, fields) {
      if (error) {
          console.log("Hubo un error en la consulta", error.message);
          return res.status(404).send("Hubo un error en la consulta");
      }
      var response = {
          'directores': resultado
      };
      res.send(JSON.stringify(response));
  });
}

function cargarActores(req, res) {
  var sql = "select * from actor";
  con.query(sql, function(error, resultado, fields) {
      if (error) {
          console.log("Hubo un error en la consulta", error.message);
          return res.status(404).send("Hubo un error en la consulta");
      }
      var response = {
          'actores': resultado
      };
      res.send(JSON.stringify(response));
  });
}

function crearCompetencia(req, res) {
  var nuevaCompetencia = req.body;
  var nombre = nuevaCompetencia.nombre;
  var genero = nuevaCompetencia.genero;
  var director = nuevaCompetencia.director;
  var actor = nuevaCompetencia.actor;
  console.log(nombre);
  console.log(genero);
  console.log(director);
  console.log(actor);
  var sql = "select * from competencia";
  con.query(sql, function(error, resultado, fields) {
      if (error) {
          console.log("Hubo un error en la consulta", error.message);
          return res.status(404).send("Hubo un error en la consulta");
      }
      for (var i = 0; i < resultado.length; i++) {
        if(resultado[i].nombre == nombre) {
          return res.status(422).json("Esa competencia ya existe");
        }
      }
      if (genero=="0"){
        genero = null;
      }
      if (director=="0"){
        director = null;
      }
      if (actor=="0"){
        actor = null;
      }

      //se fija que haya mínimo 2 películas con los criterios deseados
      sql = "select distinct p.id, p.poster, p.titulo from pelicula p join genero g on p.genero_id = g.id join actor_pelicula ap on p.id = ap.pelicula_id join actor a on ap.actor_id = a.id join director_pelicula dp on p.id = dp.pelicula_id join director d on dp.director_id = d.id where 1=1";
      var orderYLimit = " order by rand() limit 2";

      if (genero!=null) {
        sql = sql + " and g.id = '" + genero + "'";
      }
      if (director!=null) {
        sql = sql + " and d.id = '" + director + "'";
      }
      if (actor!=null) {
        sql = sql + " and a.id = '" + actor + "'";
      }
      sql = sql + orderYLimit;

      console.log(sql);
      con.query(sql, function(error, peliculas, fields) {
        if (error) return res.status(500).json(error);
        if (peliculas.length < 2){
          return res.status(422).json("No existen las suficientes películas con esos criterios");
        }
        else {
          sql = "INSERT INTO competencia (nombre, genero_id, director_id, actor_id) VALUES ('"+ nombre +"', " + genero + ", " + director + ", " + actor + ")";
          con.query(sql, function (error, results, fields) {
              if (error) return res.status(500).json(error);
              res.json(results); // o res.json(results.insertId)
          });
        }
      });
  });
}

function reiniciarVotos(req, res) {
  var datos = req.body;
  var idCompetencia = req.params.idCompetencia;
  var existe = false;

  var sql = "select * from competencia";
  con.query(sql, function(error, resultado, fields) {
      if (error) {
          console.log("Hubo un error en la consulta", error.message);
          return res.status(404).send("Hubo un error en la consulta");
      }
      for (var i = 0; i < resultado.length; i++) {
        if (idCompetencia==resultado[i].id) {
          existe = true;
          var nombreCompetencia = resultado[i].nombre;
          sql = "DELETE FROM voto WHERE competencia_id = " + idCompetencia;
          con.query(sql, function (error, results, fields) {
              if (error) return res.status(500).json(error);
              res.json(nombreCompetencia);
          });
        }
      }
      if(existe==false){
        return res.status(404).json("No existe esa competencia");
      }
  });
}

function eliminarCompetencia(req, res) {
  var datos = req.body;
  var idCompetencia = req.params.idCompetencia;
  var existe = false;

  var sql = "select * from competencia";
  con.query(sql, function(error, resultado, fields) {
      if (error) {
          console.log("Hubo un error en la consulta", error.message);
          return res.status(404).send("Hubo un error en la consulta");
      }
      for (var i = 0; i < resultado.length; i++) {
        if (idCompetencia==resultado[i].id) {
          existe = true;
          var nombreCompetencia = resultado[i].nombre;
          //eliminación en cascada:
          //primero elimina los registros de la tabla votos que esten relacionados
          sql = "DELETE FROM voto WHERE competencia_id = " + idCompetencia;
          con.query(sql, function (error, results, fields) {
              if (error) return res.status(500).json(error);
              //luego, elimina definitivamente la competencia
              sql = "DELETE FROM competencia WHERE id = " + idCompetencia;
              con.query(sql, function (error, results, fields) {
                  if (error) return res.status(500).json(error);
                  res.json(nombreCompetencia);
              });
          });
        }
      }
      if(existe==false){
        return res.status(404).json("No existe esa competencia");
      }
  });
}

function editarCompetencia(req, res) {
  var datos = req.body;
  var nuevoNombre = req.body.nombre;
  var idCompetencia = req.params.idCompetencia;
  var existe = false;

  var sql = "select * from competencia";
  con.query(sql, function(error, resultado, fields) {
      if (error) {
          console.log("Hubo un error en la consulta", error.message);
          return res.status(404).send("Hubo un error en la consulta");
      }
      for (var i = 0; i < resultado.length; i++) {
        if (idCompetencia==resultado[i].id) {
          existe = true;
          var nombreCompetencia = resultado[i].nombre;

          sql = "UPDATE competencia SET nombre = '" + nuevoNombre + "' WHERE id = " + idCompetencia;
          con.query(sql, function (error, results, fields) {
              if (error) return res.status(500).json(error);
              res.json(results);
          });
        }
      }
      if(existe==false){
        return res.status(404).json("No existe esa competencia");
      }
  });
}

module.exports = {
  cargarCompetencias : cargarCompetencias,
  obtenerCompetencia: obtenerCompetencia,
  obtenerOpciones: obtenerOpciones,
  votar: votar,
  obtenerResultados: obtenerResultados,
  cargarGeneros: cargarGeneros,
  cargarDirectores: cargarDirectores,
  cargarActores: cargarActores,
  crearCompetencia: crearCompetencia,
  reiniciarVotos: reiniciarVotos,
  eliminarCompetencia: eliminarCompetencia,
  editarCompetencia: editarCompetencia
};
