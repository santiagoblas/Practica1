var express = require("express");
var Imagen = require("./models/imagenes");
var router = express.Router();
var image_finder_middleware = require("./middlewares/findImage");
var fs = require("fs");


router.get("/", function(req,res) {
    Imagen.find({})
        .populate("creator")
        .exec(function(err,imagenes) {
            if(err) console.log(err);
            res.render("app/home", {imagenes:imagenes});
        });
});

/**REST */

router.route("/imagenes")
    .get(function(req, res) {
        Imagen.find({}, function(err,imagenes) {  
            if(err) {res.redirect("/app");return;}
            res.render("app/imagenes/index", {imagenes: imagenes});
        });
    })
    .post(function(req, res) {
        var extension = req.files.archivo.name.split(".").pop();
        var data = {
            title: req.fields.titulo,
            creator: res.locals.user._id,
            extension: extension
        }

        var imagen = new Imagen(data);

        imagen.save(function(err){
            if(!err) {
                fs.rename(req.files.archivo.path, "public/imagenes/" + imagen._id + "." + extension, function(err) {
                    if(err) {
                        console.log(err);
                    }
                });
                
                res.redirect("/app/imagenes/" + imagen._id);
            } else {
                console.log(err);
            }
        });
    });

router.get("/imagenes/new",function(req,res) {
    res.render("app/imagenes/new");
});

//router.all("/imagenes/:id*", image_finder_middleware);

router.get("/imagenes/:id/edit",function(req,res) {
    res.render("app/imagenes/edit");
});

//Seteamos una url y concatenamos las funciones que identifican las acciones que se pueden realizar sobre el recurso.
router.route("/imagenes/:id")
    .get(function(req, res) {
        res.render("app/imagenes/show");
    })
    .put(function(req, res) {
        res.locals.imagen.title = req.body.titulo;
        res.locals.imagen.save(function(err) {
            if(!err) {
                res.redirect("/app/imagenes");
            } else {
                res.render("app/imagenes/edit");
            }
        });
    })
    .delete(function(req, res) {
        Imagen.findOneAndDelete({_id: req.params.id},function(err) {
            if(!err) {
                res.redirect("/app/imagenes");
            } else {
                res.redirect("/app/imagenes/"+req.params.id);
                console.log(err);
            }
        });
    });

module.exports = router;