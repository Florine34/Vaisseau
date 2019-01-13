// This program was developped by Daniel Audet and uses sections of code  
// from http://math.hws.edu/eck/cs424/notes2013/19_GLSL.html
//
//  It has been adapted to be compatible with the "MV.js" library developped
//  for the book "Interactive Computer Graphics" by Edward Angel and Dave Shreiner.
//

"use strict";

var gl;   // The webgl context.

var CoordsLoc;       // Location of the coords attribute variable in the standard texture mappping shader program.
var NormalLoc;
var TexCoordLoc;

var CoordsLoccolor;       // Location of the coords attribute variable in the standard texture mappping shader program.
var NormalLoccolor;
var TexCoordLoccolor;

var aCoordsmap;      // Location of the attribute variables in the environment mapping shader program.
var aNormalmap;
var aTexCoordmap;

var uProjectionmap;     // Location of the uniform variables in the environment mapping shader program.
var uModelviewmap;
var uNormalMatrixmap;
var uSkybox;

var aCoordsbox;     // Location of the coords attribute variable in the shader program used for texturing the environment box.
var aNormalbox;
var aTexCoordbox;

var uModelviewbox;
var uProjectionbox;
var uEnvbox;

var  envbox;  // model identifiers


var ntextures_tobeloaded=0;
var ntextures_loaded=0;

var ProjectionLoc; // Location of the uniform variables in the standard texture mappping shader program.
var ModelviewLoc;
var NormalMatrixLoc;

var ProjectionLoccolor; 
var ModelviewLoccolor;
var NormalMatrixLoccolor;

var projection;   //--- projection matrix
var modelview;    // modelview matrix
var flattenedmodelview;    //--- flattened modelview matrix
var initialmodelview; 

var normalMatrix = mat3();  //--- create a 3X3 matrix that will affect normals

var rotator;   // A SimpleRotator object to enable rotation by mouse dragging.
var rotX = 0, rotY = 0;  // Additional rotations applied as modeling transform to the teapot.

var sphere, cylinder, cylinderReacteur,box, torus,tetra,devantCotpit, fenetreBox, tri, Reacteur, cubeReflec;  // model identifiers
var hemisphereinside, hemisphereoutside, thindisk;

var prog, progcolor, progmap, progbox;  // shader program identifier

var ct = 0;
var ctSky=0; 
var img = new Array(6);
var imgSkybox = new Array(6);

var lightPosition = vec4(20.0, 20.0, 100.0, 1.0);

var lightAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.58, 0.59, 0.65, 1.0);
var materialDiffuse = vec4(0.08, 0.09, 0.04, 1.0);
var materialSpecular = vec4(0.15, 0.13, 0.17, 1.0);
var materialShininess = 100.0;

var ambientProduct, diffuseProduct, specularProduct; 
var alphaLoc;
var modelviewLoc; 


// Fonction permettant de dessiner les tuyaux sur trouvant sur le réacteur
// Elle utilise 2 paramétres : la position en x et y 
// Cette fonction sera appelé plus tard dans la fonction reacteurs()
function reacteurTuyau(tx,ty){

    // Dessiner un tuyau en fonction des paramétres rentrés dans la fonction 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(tx, ty, -9.25));
    modelview = mult(modelview, rotate(90.0, 0, 0, 1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.05, 0.05, 2.9));
    box.render();
}

// Fonction permettant d'accrocher les tuyaux aux réacteurs
// Elle utilise 4 paramétres : différentes position en x, en une en y 
// Cette fonction sera appelé plus tard dans la fonction reacteurs()
function accrocheTuyauxReacteur(stx, sty, stx2,stx3){
    

    // accroche avant tuaux reateur  
    modelview = initialmodelview;
    modelview = mult(modelview, translate(stx, sty, 5.0));
    modelview = mult(modelview, rotate(90.0, 1, 0, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.15, 0.1, 0.04));
    box.render();


    //  tuyau après accroche - droit 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(stx2, sty, 8));
    modelview = mult(modelview, rotate(90.0, 0, 0, 1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.025, 0.025, 0.25));
    cylinder.render();


    //  tuyau après accroche - gauche 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(stx3, sty, 8));
    modelview = mult(modelview, rotate(90.0, 0, 0, 1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.025, 0.025, 0.25));
    cylinder.render();


    // accroche tuyau, fin 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(stx, sty, 11.0));
    modelview = mult(modelview, rotate(90.0, 1, 0, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.1, 0.1, 0.04));
    box.render();


    // accroche arriere au niveau des hélices 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(stx, sty, -23));
    modelview = mult(modelview, rotate(90.0, 1, 0, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.1, 0.3, 0.1));
    box.render();

}

// Fonction permettant de dessiner le reacteur
// Elle utilise 1 paramétres : la position en x
// Cette fonction sera appelé plus tard dans le render afin d'appliquer une texture dessus 

function reacteurCylindre(mtx){
     //  dessiner le modele du reacteur
    modelview = initialmodelview;
    modelview = mult(modelview, translate(mtx, 0.0,0));
    modelview = mult(modelview, rotate(90.0, 0, 0, 1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.55, 0.55, 0.8));
    cylinder.render();

    //  dessiner le cylindre derriere le reacteur
    modelview = initialmodelview;
    modelview = mult(modelview, translate(mtx, 0.0,-10));
    modelview = mult(modelview, rotate(180.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.15, 0.15, 0.15));
    Reacteur.render();
}

// Fonction permettant de dessiner la partie avant du reacteur ( la demi sphere coloré )
// Elle utilise 1 paramétres : la position en x
// Cette fonction sera appelé plus tard dans le render afin d'appliquer une texture dessus

function grilleMoteur(mtx){
	// On applique une couleur jaune dessus 
	selectColor(0.75, 0.61, 0, 0.48, 0.48, 0.48, 0.2, 0.2, 0.2, prog);
    //  dessiner le cylindre
    modelview = initialmodelview;
    modelview = mult(modelview, translate(mtx, 0.0,8.7));
    modelview = mult(modelview, rotate(90.0, 0, 0, 1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.55, 0.55, 0.07));
    cylinder.render();
    
}

// Fonction permettant de dessiner la partie avant du reacteur ( la demi sphere)
// Elle utilise 1 paramétres : la position en x
// Cette fonction sera appelé plus tard dans le render afin d'appliquer une texture dessus 

function moteur(mtx){
	// On applique une couleur sur les reacteurs 
    selectColor(0.13, 0.13, 0.13, 0.69, 0.69, 0.69, 0.2, 0.2, 0.2, prog);

    //  now, draw hemisphere model (with a thin circular rim)
    //      Note that this could be done more elegantly using two sets of shaders
    //         (one for the inside and one for the outside of the same hemisphere)
    modelview = initialmodelview;
    modelview = mult(modelview, translate(mtx, 0.0, 9.4));
    modelview = mult(modelview, rotate(180.0, 1, 0, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.55, 0.55, 0.7));
    hemisphereoutside.render();
    modelview = mult(modelview, scale(0.95, 0.95, 0.95));  // MAKE SURE THE INSIDE IS SMALLER THAN THE OUTSIDE
    hemisphereinside.render();  // in this model, the normals are inverted
    modelview = initialmodelview;
    modelview = mult(modelview, translate(mtx, 0.0, 9.4));
    modelview = mult(modelview, rotate(180.0, 1, 0, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.55, 0.55, 0.7));
    thindisk.render();
        
}

// Fonction permettant de dessiner les helices du vaisseau 
// Elle utilise 1 paramétres : la position en x
// Cette fonction sera appelé plus tard dans la fonction reacteurs 

function helice(htx){
    
    // On applique une couleur 
    selectColor(0.13, 0.13, 0.13, 0.5, 0.5, 0.5, 0.2, 0.2, 0.2, prog);
    
     //  now, draw cylinder helice
    modelview = initialmodelview;
    modelview = mult(modelview, translate(htx, 0.0,-23));
    modelview = mult(modelview, rotate(90.0, 0, 0, 1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.55, 0.55, 0.15));
    cylinderReacteur.render();
    

     //  now, draw cylinder helice petit
    modelview = initialmodelview;
    modelview = mult(modelview, translate(htx, 0.0,-23));
    modelview = mult(modelview, rotate(90.0, 0, 0, 1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.30, 0.30, 0.03));
    cylinderReacteur.render();

    //  croix dans l'helice 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(-htx, 0.0, -23));
    modelview = mult(modelview, rotate(90.0, 1, 0, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(1.1, 0.3, 0.01));
    box.render();

    //  croix dans l'helice 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(htx, 0.0, -23));
    modelview = mult(modelview, rotate(90.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.3, 1.1, 0.01));
    box.render();

}


// Fonction regroupant plusieurs autres fonctions comme les tuyaux du reacteurs, les accroches tuyaux et les hélices 
// Cette fonction sera appelé plus tard dans le render
function reacteurs(){

    //  variables tuyaux reacteur 
    var tx=26.0;
    var tx2=20.0;
    var ty=5.0;
    // Si c'est le reacteur gauche 
    reacteurTuyau(-tx, ty);
    reacteurTuyau(-tx2, ty);
    reacteurTuyau(-tx,-ty);
    reacteurTuyau(-tx2,-ty);
    
    // Sinon si c'est le reacteur droit 
    reacteurTuyau(tx, ty);
    reacteurTuyau(tx2, ty);
    reacteurTuyau(tx,-ty);
    reacteurTuyau(tx2,-ty);
     
    // variable position x hélice 
    var htx=23.0; 
    // Si c'est l'helice gauche 
    helice(-htx);
    // Sinon si c'est l'helice droite
    helice(htx);
   
    // variables separateur/accroche + tuyau avant 
    var stx; 
    var stx2; 
    var stx3; 
    var sty=5.0; 

    var coteDroit= new Boolean("true");

    // Si on est du coté gauche 
    if(coteDroit){
        stx=26.0;
        stx2=25.7; 
        stx3=26.3;
        accrocheTuyauxReacteur(-stx, sty, -stx2,-stx3);
        accrocheTuyauxReacteur(-stx, -sty, -stx2,-stx3);   
    }
        
    stx=20.0; 
    stx2=19.7;
    stx3=20.3; 
    accrocheTuyauxReacteur(-stx, sty, -stx2,-stx3); 
    accrocheTuyauxReacteur(-stx, -sty, -stx2,-stx3);
    

    // Sinon si on est du coté droit
    if(coteDroit){
        stx=26.0;
        stx2=25.7; 
        stx3=26.3;
        accrocheTuyauxReacteur(stx, sty, stx2,stx3);
        accrocheTuyauxReacteur(stx, -sty, stx2,stx3);   
    }
        
    stx=20.0; 
    stx2=19.7;
    stx3=20.3; 
    accrocheTuyauxReacteur(stx, sty, stx2,stx3); 
    accrocheTuyauxReacteur(stx, -sty, stx2,stx3);    
}

// Fonction permettant de dessiner les tuyaux se trouvant sur les "ailes" du vaisseau
// Elle prend en paramétre la position du tuyaux en x 
// Cette fonction sera appelé plus tard dans le render
function TuyauSeparateur(ctx){
 
    //  now, draw cylinder  
    modelview = initialmodelview;
    modelview = mult(modelview, translate(ctx, 2.8,-3));
    modelview = mult(modelview, rotate(90.0, 0, 1, 0));
    // always extract the normal matrix before scaling
    normalMatrix = extractNormalMatrix(modelview);  
    modelview = mult(modelview, scale(0.05, 0.05, 0.65));
    cylinder.render();

    //  now, draw cylinder  
    modelview = initialmodelview;
    modelview = mult(modelview, translate(ctx, 2.8,-1.5));
    modelview = mult(modelview, rotate(90.0, 0, 1, 0));
    // always extract the normal matrix before scaling
    normalMatrix = extractNormalMatrix(modelview);  
    modelview = mult(modelview, scale(0.05, 0.05, 0.65));
    cylinder.render();

     //  now, draw cylinder  
    modelview = initialmodelview;
    modelview = mult(modelview, translate(ctx, 2.8,2));
    modelview = mult(modelview, rotate(90.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview); 
    // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.05, 0.05, 0.65));
    cylinder.render();  
}

// Fonction permettant de dessiner les deux bases séparant la base du vaisseau et les reacteurs 
// Elle prend en paramétre la position des plateformes 
// Cette fonction sera appelé plus tard dans le render
function Separateur(btx, cylindrex, cubex, cubex2){
	//  now, draw bases 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(btx, 0.0, 0));
    modelview = mult(modelview, rotate(90.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.8, 0.2, 1.2));
    box.render();

    //  details cylindre sur les séparateurs droit
    modelview = initialmodelview;
    modelview = mult(modelview, translate(cylindrex, 1.5,0));
    modelview = mult(modelview, rotate(90.0, 0, 0, 1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.1, 0.1, 0.2));
    cylinder.render();

    //  détails cube sur les séparateurs 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(cubex, 1.5, 0));
    modelview = mult(modelview, rotate(90.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.15, 0.15, 0.15));
    box.render();

    //  détails cube sur les séparateurs 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(cubex2, 1.5, 0));
    modelview = mult(modelview, rotate(90.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.15, 0.05, 0.15));
    box.render();


}


// Fonction permettant de dessiner les bases du vaisseau  
// Cette fonction sera appelé plus tard dans le render
function baseVaisseau(){
 
  	//  now, base milieu derriere
    modelview = initialmodelview;
    modelview = mult(modelview, translate(0.0, 0.0, -2));
    modelview = mult(modelview, rotate(90.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(1.5, 0.8, 1.2));
    box.render();

    //  now, base devant 1
    modelview = initialmodelview;
    modelview = mult(modelview, translate(0.0, 0.0, 8));
    modelview = mult(modelview, rotate(90.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(1.5, 0.5, 1.2));
    box.render();
        
    //  now, base devant 2
    modelview = initialmodelview;
    modelview = mult(modelview, translate(0.0, 0.0, 21));
    modelview = mult(modelview, rotate(90.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(1.2, 0.2, 0.8));
    box.render();
    

}


// Fonction permettant de dessiner le cockpit du vaisseau  
// Cette fonction sera appelé plus tard dans le render
function cockpitBase(){
    //base du cockpit
    modelview = initialmodelview;
    modelview = mult(modelview, translate(0.0, 3.1, 33));
    modelview = mult(modelview, rotate(90.0, 1, 0, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.5, 0.8, 0.6));
    box.render(); 

    //  devant cockpit 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(-2.5, 2.1, 37));
    modelview = mult(modelview, rotate(0.0, 1, 0, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.5, 0.4, 0.4));
    devantCotpit.render();

}

// Fonction permettant de dessiner les fenetres du cockpit 
// Elle prend en paramétre la position en x 
// Cette fonction sera appelé plus tard dans le render
function fenetre(posx){
    
    // Ici, on applique la couleur sans avoir recours au modèle de Phong
    // On utilise donc le second fragment shader qui impose la couleur noir 
    selectColor(0.0, 0.1, 0.8, 0.4, 0.55, 0.69, 0.48, 0.55, 0.69, progcolor);
    //  dessiner fenetre 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(0.0, 4.15, 39));
    modelview = mult(modelview, rotate(45.0, 1, 0, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.4, 0.05, 0.4));
    fenetreBox.render();

    //  dessiner fenetre 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(posx, 4.15, 33));
    modelview = mult(modelview, rotate(90.0, 0, 0, 1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.25, 0.02, 0.6));
    fenetreBox.render();    
    
    //  dessiner la fenetre en forme de triangle -  gauche 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(-2.6, 2.9, 36.5));
    modelview = mult(modelview, rotate(0.0, 1, 0, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.05, 0.25, 0.25	));
    tri.render();
    
    //  dessiner la fenetre en forme de triangle -  gauche 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(2.05, 2.9, 36.5));
    modelview = mult(modelview, rotate(0.0, 1, 0, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.05, 0.25, 0.25));
    tri.render();    
}
    
// Fonction permettant de dessiner la base de l'avant du vaisseau 
// Cette fonction sera appelé plus tard dans le render
function vaisseauAvant(){
	selectColor(0.13, 0.13, 0.13, 0.69, 0.69, 0.69, 0.2, 0.2, 0.2, prog);
   
    //  now, base avant
    modelview = initialmodelview;
    modelview = mult(modelview, translate(0.0, 0.2, 37.5));
    modelview = mult(modelview, rotate(90.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(2.15, 0.45, 1.15));
    box.render();
}


// Fonction permettant de dessiner les deux bases à l'avant du vaisseau
// Prend en paramétre la position en x ainsi que l'angle de rotation  
// Cette fonction sera appelé plus tard dans le render
function baseAvantVaisseau(batx1,  angle){ 

    selectColor(0.13, 0.13, 0.13, 0.69, 0.69, 0.69, 0.2, 0.2, 0.2, prog);
       
    //  now, base avant gauche
    modelview = initialmodelview;
    modelview = mult(modelview, translate(batx1, 0.0, 37.4));
    modelview = mult(modelview, rotate(angle, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(2.05, 0.4, 0.75));
    box.render();
    
}

// Fonction permettant de dessiner R2D2
// Cette fonction sera appelé plus tard dans le render afin d'y appliquer une texture 
function R2D2(){
    
    // On selectionne une couleur , ici vers le blanc 
    selectColor(1,1, 1, 0.05, 0.18, 0.21, 0.2, 0.2, 0.2, prog);

    //  now, draw cylinder R2D2
    modelview = initialmodelview;
    modelview = mult(modelview, translate(0.0, 1.0,19));
    modelview = mult(modelview, rotate(90.0, 1, 0, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.2, 0.2, 0.1));
    cylinder.render();

    //  now, draw hemisphere model (with a thin circular rim) R2D2
    modelview = initialmodelview;
    modelview = mult(modelview, translate(0.0, 2, 19.0));
    modelview = mult(modelview, rotate(90.0, 1, 0, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.2, 0.2, 0.2));
    hemisphereoutside.render();
    modelview = mult(modelview, scale(0.95, 0.95, 0.95));  // MAKE SURE THE INSIDE IS SMALLER THAN THE OUTSIDE
    hemisphereinside.render();  // in this model, the normals are inverted
    modelview = initialmodelview;
    modelview = mult(modelview, translate(0.0, 2, 19.0));
    modelview = mult(modelview, rotate(90.0, 1, 0, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.2, 0.2, 0.2));
    thindisk.render();
}

// Fonction permettant de dessiner les tir à l'avant du vaisseau 
// Prend en paramétre la position en x 
// Cette fonction sera appelé plus tard dans la fonction base()
function tir(ttx){

    //  now, draw cylinder tir 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(ttx, 0.0,48.5));
    modelview = mult(modelview, rotate(90.0, 0, 0, 1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.07, 0.07, 0.1));
    cylinder.render();

    //  now, draw cylinder tir 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(ttx, 0.0,49.8));
    modelview = mult(modelview, rotate(90.0, 0, 0, 1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.05, 0.05, 0.03));
    cylinder.render();

    //  now, draw cylinder tir 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(ttx, 0.0,50.5));
    modelview = mult(modelview, rotate(90.0, 0, 0, 1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.03, 0.03, 0.07));
    cylinder.render();

    //  now, draw cylinder tir 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(ttx, 0.0,52));
    modelview = mult(modelview, rotate(90.0, 0, 0, 1));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.02, 0.02, 0.08));
    cylinder.render();

}

// Fonction reprenant plusieurs fonctions, la base du vaisseau et les tirs 
// Cette fonction sera appelé plus tard dans le render
function base(){
    baseVaisseau();
    var batx1=4.8; 
	baseAvantVaisseau(batx1, 75.00); 
	baseAvantVaisseau(-batx1,105.00); 
    var ttx= 2; 
   	// tir droit 
    tir(ttx); 
    // tir gauche 
    tir(-ttx);

}

// Fonction permettant de dessiner la mitraillette au dessus du vaisseau
// Prend en paramétre la position en x 
// Cette fonction sera appelé plus tard dans le render
function mitrailleuse(x){
    
        //  now, base 
        modelview = initialmodelview;
        modelview = mult(modelview, translate(0.0, 6.5, 31.0));
        modelview = mult(modelview, rotate(90.0, 1, 0, 0));
        normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
        modelview = mult(modelview, scale(0.2, 0.2, 0.04));
        cylinder.render();
        
        //  now, cynlindre maintient tir 
        modelview = initialmodelview;
        modelview = mult(modelview, translate(0.0, 7.5, 31.0));
        modelview = mult(modelview, rotate(90.0, 1, 0, 0));
        normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
        modelview = mult(modelview, scale(0.15, 0.15, 0.05));
        cylinder.render();
        
        //  now, draw cylinder tir 
        modelview = initialmodelview;
        modelview = mult(modelview, translate(x, 8.5,30.5));
        modelview = mult(modelview, rotate(90.0, 0, 0, 1));
        normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
        modelview = mult(modelview, scale(0.05, 0.05, 0.05));
        cylinder.render();

        //  now, draw cylinder tir 
        modelview = initialmodelview;
        modelview = mult(modelview, translate(x, 8.5,31.5));
        modelview = mult(modelview, rotate(90.0, 0, 0, 1));
        normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
        modelview = mult(modelview, scale(0.03, 0.03, 0.1));
        cylinder.render();
            
        //  now, draw torus model
        modelview = initialmodelview;
        modelview = mult(modelview, translate(x, 8.5, 33.0));
        modelview = mult(modelview, rotate(0.0, 0, 0, 1));
        normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
        modelview = mult(modelview, scale(0.08, 0.08, 3));
        torus.render();
        
        //  now, draw torus model
        modelview = initialmodelview;
        modelview = mult(modelview, translate(x, 8.5, 33.5));
        modelview = mult(modelview, rotate(0.0, 0, 0, 1));
        normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
        modelview = mult(modelview, scale(0.085, 0.085, 1));
        torus.render();
}

// Fonction permettant de dessiner les tétraedre 
// Prend en paramétre différentes position x 
// Cette fonction sera appelé plus tard dans le render
function ftetreadre(tetrax){
    
    selectColor(0.93, 0.45, 0.13, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, prog);
    //  now, draw tetra model haut 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(tetrax, 2.0, -8));
    modelview = mult(modelview, rotate(180.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.1, 0.1, 0.1));
    tetra.render();

    //  now, draw tetra model bas 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(tetrax, -2.0, -8));
    modelview = mult(modelview, rotate(180.0, 1, 0, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.1, 0.1, 0.1));
    tetra.render();

    //  now, draw tetra model coté droit - réacteur  gauche 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(-25.0, 0.0, -8));
    modelview = mult(modelview, rotate(270.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.1, 0.1, 0.1));
    tetra.render();

    //  now, draw tetra model coté droit - réacteur droit
    modelview = initialmodelview;
    modelview = mult(modelview, translate(21.0, 0.0, -8));
    modelview = mult(modelview, rotate(270.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.1, 0.1, 0.1));
    tetra.render();

    //  now, draw tetra model coté gauche - réacteur gauche 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(-21.0, 0.0, -8));
    modelview = mult(modelview, rotate(90.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.1, 0.1, 0.1));
    tetra.render();

    //  now, draw tetra model coté gauche - réacteur droit 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(25, 0.0, -8));
    modelview = mult(modelview, rotate(90.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.1, 0.1, 0.1));
    tetra.render();
}

// Fonction permettant de dessiner la Terre. 
// On appliquera une texture sur celle ci dans le render.
// On applique une rotation afin que celle-ci tourne sur elle meme.
// On incrémentera théta dans le render  
function Earth(){	
	//  now, draw sphere model - Terre 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(0.0, 20.0, 0.0));
	modelview = mult(modelview, rotate(-90.0, 1, 0, 0));
	modelview = mult(modelview, rotate(theta, 0.0, 0.0, 1.0));
    // always extract the normal matrix before scaling 
    normalMatrix = extractNormalMatrix(modelview);  
    modelview = mult(modelview, scale(0.8, 0.8, 0.8));
    sphere.render();
	
}

// Fonction permettant de dessiner la Lune. 
// On appliquera une texture sur celle ci dans le render
// On applique une rotation et deux translate afin que celle-ci tourne sur elle meme et autour de la Terre
// On incrémentera théta dans le render   
function Lune(){

	//  now, draw sphere model - Lune 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(0.0, 20.0, 0.0));
    modelview = mult(modelview, rotate(-90.0, 1, 0, 0));
    modelview = mult(modelview, rotate(theta, 0.0, 0.0, 1.0));
    modelview = mult(modelview, translate(0.0, 20.0, 0.0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.3, 0.3, 0.3));
    sphere.render();
}

// Fonction permettant de dessiner Mars. 
// On appliquera une texture sur celle ci dans le render
// On applique une rotation afin que celle-ci tourne sur elle meme
// On incrémentera théta dans le render    
function Mars(){
	//  now, draw sphere model - Mars
    modelview = initialmodelview;
    modelview = mult(modelview, translate(-20.0, 10.0, 25.0));
    modelview = mult(modelview, rotate(-90.0, 1, 0, 0));
	modelview = mult(modelview, rotate(theta, 0.0, 0.0, 1.0)); 
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.6, 0.6, 0.6));
    sphere.render();
	
}

// Fonction permettant de dessiner Jupiter 
// On appliquera une texture sur celle ci dans le render
// On applique une rotation afin que celle-ci tourne sur elle meme 
// On incrémentera théta dans le render   
function Jupiter(){
	//  now, draw sphere model - Jupiter 
    modelview = initialmodelview;
    modelview = mult(modelview, translate(20.0, 15.0, 30.0));
	modelview = mult(modelview, rotate(-90.0, 1, 0, 0));
	modelview = mult(modelview, rotate(theta, 0.0, 0.0, 1.0)); 
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.7, 0.7, 0.7));
    sphere.render();	
	
}

// Fonction permettant de dessiner le cube translucide  
// On appliquera une texture sur celle ci dans le render
// On applique une rotation afin que celle-ci tourne sur elle meme 
// On incrémentera théta dans le render   

function cubeTranslucide(){
	 //  now, base avant gauche
    modelview = initialmodelview;
    modelview = mult(modelview, translate(-20.0, 30.0, 0.0));
    modelview = mult(modelview, rotate(-90.0, 1, 0, 0));
	modelview = mult(modelview, rotate(theta, 0.0, 0.0, 1.0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.5, 0.5, 0.5));
    box.render();
	
}

// Fonction permettant de dessiner le cube reflechissant un environnement   
// On appliquera une texture sur celle ci dans le render
// On applique une rotation afin que celle-ci tourne sur elle meme 
// On incrémentera théta dans le render

function cubeReflechissantEnv(){	
	 //  now, base avant gauche
    modelview = initialmodelview;
    modelview = mult(modelview, translate(20.0, 30.0, 0.0));
    modelview = mult(modelview, rotate(-90.0, 1, 0, 0));
	modelview = mult(modelview, rotate(theta, 0.0, 0.0, 1.0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(0.2, 0.2, 0.2));
    cubeReflec.render();
	
}

// Fonction permettant de dessiner la skybox  
// On appliquera une texture sur celle ci dans le render
function skybox(){
 //  now, base avant gauche
    modelview = initialmodelview;
    modelview = mult(modelview, translate(0.0, 0.0, 0.0));
    modelview = mult(modelview, rotate(90.0, 0, 1, 0));
    normalMatrix = extractNormalMatrix(modelview);  // always extract the normal matrix before scaling
    modelview = mult(modelview, scale(1, 1, 1));
    envbox.render();

}
// Fonction permettant de selectionner une couleur en utilisant le modèle de Phong 
function selectColor(mAr, mAv, mAb, mDr, mDv, mDb, mSr, mSv, mSb, programselected){
    
    materialAmbient = vec4(mAr, mAv, mAb, 1.0);
    materialDiffuse = vec4(mDr, mDv, mDb, 1.0);
    materialSpecular = vec4(mSr, mSv, mSb, 1.0);
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    gl.useProgram(programselected); 
    gl.uniform4fv(gl.getUniformLocation(programselected, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(programselected, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(programselected, "specularProduct"), flatten(specularProduct));
    gl.uniform1f(gl.getUniformLocation(programselected, "shininess"), materialShininess);   
    
}

function handleLoadedTexture(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    ntextures_loaded++;
    
    render();  // Call render function when the image has been loaded (to insure the model is displayed)

    gl.bindTexture(gl.TEXTURE_2D, null);
}


function handleLoadedTextureMap(texture) {

    ct++;
    if (ct == 6) {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        var targets = [
           gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
           gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
           gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];
        for (var j = 0; j < 6; j++) {
            gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img[j]);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }
	ntextures_loaded++;
    render();  //--- call render function when the image has been loaded (to insure the model is displayed)
}

function handleLoadedTextureSkybox(texture) {
    ctSky++;
    if (ctSky == 6) {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        var targets = [
           gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
           gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
           gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
        ];
        for (var j = 0; j < 6; j++) {
            gl.texImage2D(targets[j], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgSkybox[j]);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }
        gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

        texture.isloaded = true;

        console.log(texture); 

        render();  // Call render function when the image has been loaded (to insure the model is displayed)

        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}


function sleep(delay) {
    var start = new Date().getTime();
    while (new Date().getTime() < start + delay);
}

// Initialisation des variables de textures 
var vaisseauTexture;
var grilleTexture; 
var r2d2Texture; 
var reactTexture; 
var capotTexture; 
var earthTexture;
var marsTexture;
var jupiterTexture; 
var luneTexture; 
var translucideTexture; 
var reflechissantTexture; 
var skyboxTexture; 

function initTexture() {
	
	//define texture ship
    vaisseauTexture = gl.createTexture();

    vaisseauTexture.image = new Image();
    vaisseauTexture.image.onload = function () {
        handleLoadedTexture(vaisseauTexture)
    }

    vaisseauTexture.image.src = "Textures/metalPlate3.png";
    ntextures_tobeloaded++;

    // define texture grille reacteur
    grilleTexture = gl.createTexture();

    grilleTexture.image = new Image();
    grilleTexture.image.onload = function () {
        handleLoadedTexture(grilleTexture)
    }

    grilleTexture.image.src = "Textures/body2.jpg";
	ntextures_tobeloaded++;

	// define texture R2D2
    r2d2Texture = gl.createTexture();

    r2d2Texture.image = new Image();
    r2d2Texture.image.onload = function () {
        handleLoadedTexture(r2d2Texture)
    }

    r2d2Texture.image.src = "Textures/texR2d2.jpg";
	ntextures_tobeloaded++;

	// define texture reacteur sphere (avant)
    reactTexture = gl.createTexture();

    reactTexture.image = new Image();
    reactTexture.image.onload = function () {
        handleLoadedTexture(reactTexture)
    }

    reactTexture.image.src = "Textures/metalscratch.png";
	ntextures_tobeloaded++;

	// define texture vaisseau Avant (capot) 
    capotTexture = gl.createTexture();

    capotTexture.image = new Image();
    capotTexture.image.onload = function () {
        handleLoadedTexture(capotTexture)
    }

    capotTexture.image.src = "Textures/texReactor.jpg";
	ntextures_tobeloaded++;
	
	// define texture Earth
    earthTexture= gl.createTexture();

    earthTexture.image = new Image();
    earthTexture.image.onload = function () {
        handleLoadedTexture(
    earthTexture)
    }

    earthTexture.image.src = "Textures/terre.jpg";
	ntextures_tobeloaded++;
	
	// define texture Lune
    luneTexture= gl.createTexture();

    luneTexture.image = new Image();
    luneTexture.image.onload = function () {
        handleLoadedTexture(
    luneTexture)
    }

    luneTexture.image.src = "Textures/lune.jpg";
	ntextures_tobeloaded++;
	
	//define texture Mars
    marsTexture= gl.createTexture();

    marsTexture.image = new Image();
    marsTexture.image.onload = function () {
        handleLoadedTexture(
    marsTexture)
    }

    marsTexture.image.src = "Textures/mars.jpg";
	ntextures_tobeloaded++;
	
	//define texture Jupiter
    jupiterTexture= gl.createTexture();

    jupiterTexture.image = new Image();
    jupiterTexture.image.onload = function () {
        handleLoadedTexture(
    jupiterTexture)
    }

    jupiterTexture.image.src = "Textures/jupiter.jpg";
	ntextures_tobeloaded++;
	
	//define texture cube translucide
    translucideTexture= gl.createTexture();

    translucideTexture.image = new Image();
    translucideTexture.image.onload = function () {
        handleLoadedTexture(
    translucideTexture)
    }

    translucideTexture.image.src = "Textures/signer.jpg";
	ntextures_tobeloaded++;
	
	//define cube reflechissant 
	var urls = [
       "Textures/ciel-nuages/posx.jpg", "Textures/ciel-nuages/negx.jpg",
       "Textures/ciel-nuages/posy.jpg", "Textures/ciel-nuages/negy.jpg",
       "Textures/ciel-nuages/posz.jpg", "Textures/ciel-nuages/negz.jpg", 
    ];

    reflechissantTexture = gl.createTexture();

    for (var i = 0; i < 6; i++) {
        img[i] = new Image();
        img[i].onload = function () {  // this function is called when the image download is complete

            handleLoadedTextureMap(reflechissantTexture);
        }
        img[i].src = urls[i];   // this line starts the image downloading thread
		ntextures_tobeloaded++;
    }
	
	// define texture skybox 
	
	var urlsSkybox = [
       "Textures/space/nebula_posx.png", "Textures/space/nebula_negx.png",
       "Textures/space/nebula_posy.png", "Textures/space/nebula_negy.png",
       "Textures/space/nebula_posz.png", "Textures/space/nebula_negz.png"
    ];

    skyboxTexture = gl.createTexture();
    skyboxTexture.isloaded = false;  // this class member is created only to check if the image has been loaded

    for (var isky = 0; isky < 6; isky++) {
        imgSkybox[isky] = new Image();
        imgSkybox[isky].onload = function () {  // this function is called when the image download is complete

            handleLoadedTextureSkybox(skyboxTexture);
        }
        imgSkybox[isky].src = urlsSkybox[isky];   // this line starts the image downloading thread

    }
}

var theta=0.0; 
var thetaRot=0.0; 

function render() {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	theta += 1.5; 

    //--- Get the rotation matrix obtained by the displacement of the mouse
    //---  (note: the matrix obtained is already "flattened" by the function getViewMatrix)
    flattenedmodelview = rotator.getViewMatrix();
    modelview = unflatten(flattenedmodelview);
    normalMatrix = extractNormalMatrix(modelview);
    initialmodelview = modelview;
    // Permet de donner l'impression de faire bouger la caméra à l'aide des fleches du clavier 
    // thetaRot sera incrémenter lors de l'appuie sur la fleche droite ou gauche du clavier 
    initialmodelview = mult(initialmodelview, rotate(thetaRot, 0.0, 1.0, 0.0));

    var mtx=23.0;
	 
	if (skyboxTexture.isloaded ) {  // if texture images have been loaded

        // Draw the environment (box)
        gl.useProgram(progbox); // Select the shader program that is used for the environment box.

        gl.uniformMatrix4fv(uProjectionbox, false, flatten(projection));

        gl.enableVertexAttribArray(aCoordsbox);
        gl.enableVertexAttribArray(aNormalbox);     // normals are not used for the box
        gl.enableVertexAttribArray(aTexCoordbox);  // texture coordinates not used for the box

        gl.activeTexture(gl.TEXTURE13);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        // Send texture to sampler
        gl.uniform1i(uEnvbox, 13);

        skybox(); 

    }

   
    gl.useProgram(prog);
   
    if (ntextures_loaded == ntextures_tobeloaded) {  // if texture image has been loaded

	//  Draw first model using environmental mapping shader
        gl.useProgram(progmap);

        gl.uniformMatrix4fv(uProjectionmap, false, flatten(projection)); // send projection matrix to the new shader program

        gl.enableVertexAttribArray(aCoordsmap);
        gl.enableVertexAttribArray(aNormalmap);
        gl.disableVertexAttribArray(aTexCoordmap);  // texture coordinates not used (environmental mapping)

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, reflechissantTexture);
        // Send texture to sampler
        gl.uniform1i(uSkybox, 0);

		//--- Now extract the matrix that will affect normals (3X3).
        //--- It is achieved by simply taking the upper left portion (3X3) of the modelview matrix
        //--- (since normals are not affected by translations, only by rotations). 

        normalMatrix = extractNormalMatrix(modelview);
	
		cubeReflechissantEnv();  //  modelview and normalMatrix are sent to the shader in the "render()" method

		gl.useProgram(prog);
		
	
		gl.enableVertexAttribArray(CoordsLoc);
        gl.enableVertexAttribArray(NormalLoc);
        gl.enableVertexAttribArray(TexCoordLoc);  // we do not need texture coordinates

		// Dessiner le vaisseau opaque
		gl.uniform1f(alphaLoc, 1.0);

		//modelview = translate(-1.0, 0.0, -6.0);
		gl.uniformMatrix4fv(modelviewLoc, false, flatten(modelview));
	
	
	    // Texture Vaisseau
	    gl.activeTexture(gl.TEXTURE0);
	    gl.bindTexture(gl.TEXTURE_2D, vaisseauTexture);
	    // Send texture to sampler
	    gl.uniform1i(gl.getUniformLocation(prog, "texture"), 0);
		reacteurs(); 
		var btx=12.0;
	    var ctx=12.0; 
	    var cylindrex=13.0; 
	    var cubex=16.0; 
	    var cubex2=9.0; 
	    Separateur(btx, cylindrex, cubex, cubex2);
	    Separateur(-btx, -cylindrex, -cubex, -cubex2); 		
		base(); 
		cockpitBase();
		var x=0.5; 
		mitrailleuse(x); 
		mitrailleuse(-x);
		reacteurCylindre(mtx); 
	    reacteurCylindre(-mtx);  
		   		    
		var tetrax=23.0; 
		ftetreadre(tetrax); 
		ftetreadre(-tetrax); 
		
		// Use second shader
	    gl.useProgram(progcolor);

	    var posx=2.6;
	    fenetre(posx);
	    fenetre(-posx);  

		// Use first shader
		 gl.useProgram(prog);
	    
	    // Texture grille --------------------------------------- // 
	    gl.activeTexture(gl.TEXTURE1);
	    gl.bindTexture(gl.TEXTURE_2D, grilleTexture);
	    // Send texture to sampler
	    gl.uniform1i(gl.getUniformLocation(prog, "texture"), 1);
	   
	    grilleMoteur(mtx);
	    grilleMoteur(-mtx); 
	     
	    TuyauSeparateur(ctx);
	    TuyauSeparateur(-ctx);

	    // Texture R2D2 --------------------------------------- // 
	    gl.activeTexture(gl.TEXTURE2);
	    gl.bindTexture(gl.TEXTURE_2D, r2d2Texture);
	    // Send texture to sampler
	    gl.uniform1i(gl.getUniformLocation(prog, "texture"), 2);
	    R2D2(); 

	    // Texture Reacteur/Moteur --------------------------------------- // 
	    gl.activeTexture(gl.TEXTURE3);
	    gl.bindTexture(gl.TEXTURE_2D, reactTexture);
	    // Send texture to sampler
	    gl.uniform1i(gl.getUniformLocation(prog, "texture"), 3);
	    //Dessiner moteur 
	    var mtx=23.0; 
	    // partie gauche 
	    moteur(-mtx);
	    // partie droite 
	    moteur(mtx);
 	   
	    // Texture Vaiseau--------------------------------------- // 
	    gl.activeTexture(gl.TEXTURE4);
	    gl.bindTexture(gl.TEXTURE_2D, capotTexture);
	    // Send texture to sampler
	    gl.uniform1i(gl.getUniformLocation(prog, "texture"), 4);
	    vaisseauAvant(); 
		
		// Texture Earth--------------------------------------- // 
	    gl.activeTexture(gl.TEXTURE5);
	    gl.bindTexture(gl.TEXTURE_2D,earthTexture);
	    // Send texture to sampler
	    gl.uniform1i(gl.getUniformLocation(prog, "texture"), 5);
		Earth();
		
		// Texture Mars--------------------------------------- // 
	    gl.activeTexture(gl.TEXTURE6);
	    gl.bindTexture(gl.TEXTURE_2D,marsTexture);
	    // Send texture to sampler
	    gl.uniform1i(gl.getUniformLocation(prog, "texture"), 6);
		Mars();
		
		// Texture Jupiter--------------------------------------- // 
	    gl.activeTexture(gl.TEXTURE7);
	    gl.bindTexture(gl.TEXTURE_2D,jupiterTexture);
	    // Send texture to sampler
	    gl.uniform1i(gl.getUniformLocation(prog, "texture"), 7);
		Jupiter();
		
		
		// Texture Lune--------------------------------------- // 
	    gl.activeTexture(gl.TEXTURE8);
	    gl.bindTexture(gl.TEXTURE_2D,luneTexture);
	    // Send texture to sampler
	    gl.uniform1i(gl.getUniformLocation(prog, "texture"), 8);
		Lune();
		
	
		// Dessiner le cube translucide
		
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.enable(gl.BLEND);
		gl.depthMask(false);  // Le tampon sera en lecture seulement.
		                      // Les objets translucides seront cachÃ©s
							  // s'ils sont derriÃ¨re des objets opaques 
							  //  mais ils seront visibles s'ils sont devant.
		
		gl.uniform1f(alphaLoc, 0.5);
	
		modelview = translate(0.0, 0.0, -4.0);
		gl.uniformMatrix4fv(modelviewLoc, false, flatten(modelview));
	
        gl.activeTexture(gl.TEXTURE9);
        gl.bindTexture(gl.TEXTURE_2D, translucideTexture);
        // Send texture to sampler
        gl.uniform1i(gl.getUniformLocation(prog, "texture"), 9);
		cubeTranslucide(); 
		
		gl.disable(gl.BLEND);
		gl.depthMask(true); // ne pas oublier car on ne pourra pas effacer 
		                     // le tampon de profondeur lors de la prochaine itÃ©ration
	   
    }

    
}



function unflatten(matrix) {
    var result = mat4();
    result[0][0] = matrix[0]; result[1][0] = matrix[1]; result[2][0] = matrix[2]; result[3][0] = matrix[3];
    result[0][1] = matrix[4]; result[1][1] = matrix[5]; result[2][1] = matrix[6]; result[3][1] = matrix[7];
    result[0][2] = matrix[8]; result[1][2] = matrix[9]; result[2][2] = matrix[10]; result[3][2] = matrix[11];
    result[0][3] = matrix[12]; result[1][3] = matrix[13]; result[2][3] = matrix[14]; result[3][3] = matrix[15];

    return result;
}

function extractNormalMatrix(matrix) { // This function computes the transpose of the inverse of 
    // the upperleft part (3X3) of the modelview matrix (see http://www.lighthouse3d.com/tutorials/glsl-tutorial/the-normal-matrix/ )

    var result = mat3();
    var upperleft = mat3();
    var tmp = mat3();

    upperleft[0][0] = matrix[0][0];  // if no scaling is performed, one can simply use the upper left
    upperleft[1][0] = matrix[1][0];  // part (3X3) of the modelview matrix
    upperleft[2][0] = matrix[2][0];

    upperleft[0][1] = matrix[0][1];
    upperleft[1][1] = matrix[1][1];
    upperleft[2][1] = matrix[2][1];

    upperleft[0][2] = matrix[0][2];
    upperleft[1][2] = matrix[1][2];
    upperleft[2][2] = matrix[2][2];

    tmp = matrixinvert(upperleft);
    result = transpose(tmp);

    return result;
}

function matrixinvert(matrix) {

    var result = mat3();

    var det = matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[2][1] * matrix[1][2]) -
                 matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
                 matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);

    var invdet = 1 / det;

    // inverse of matrix m
    result[0][0] = (matrix[1][1] * matrix[2][2] - matrix[2][1] * matrix[1][2]) * invdet;
    result[0][1] = (matrix[0][2] * matrix[2][1] - matrix[0][1] * matrix[2][2]) * invdet;
    result[0][2] = (matrix[0][1] * matrix[1][2] - matrix[0][2] * matrix[1][1]) * invdet;
    result[1][0] = (matrix[1][2] * matrix[2][0] - matrix[1][0] * matrix[2][2]) * invdet;
    result[1][1] = (matrix[0][0] * matrix[2][2] - matrix[0][2] * matrix[2][0]) * invdet;
    result[1][2] = (matrix[1][0] * matrix[0][2] - matrix[0][0] * matrix[1][2]) * invdet;
    result[2][0] = (matrix[1][0] * matrix[2][1] - matrix[2][0] * matrix[1][1]) * invdet;
    result[2][1] = (matrix[2][0] * matrix[0][1] - matrix[0][0] * matrix[2][1]) * invdet;
    result[2][2] = (matrix[0][0] * matrix[1][1] - matrix[1][0] * matrix[0][1]) * invdet;

    return result;
}


function createModel(modelData) {
    var model = {};
    model.coordsBuffer = gl.createBuffer();
    model.normalBuffer = gl.createBuffer();
    model.textureBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;

    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexTextureCoords, gl.STATIC_DRAW);

    console.log(modelData.vertexPositions.length);
    console.log(modelData.indices.length);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);

    model.render = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(CoordsLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(NormalLoc, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
        gl.vertexAttribPointer(TexCoordLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.uniformMatrix4fv(ModelviewLoc, false, flatten(modelview));    //--- load flattened modelview matrix
        gl.uniformMatrix3fv(NormalMatrixLoc, false, flatten(normalMatrix));  //--- load flattened normal matrix

        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
        console.log(this.count);
    }
    return model;
}


function createModelbox(modelData) {  // For creating the environment box.
    var model = {};
    model.coordsBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;
    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    console.log(modelData.vertexPositions.length);
    console.log(modelData.indices.length);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
    model.render = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(aCoordsbox, 3, gl.FLOAT, false, 0, 0);
        gl.uniformMatrix4fv(uModelviewbox, false, flatten(modelview));
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
    }
    return model;
}


function createModelmap(modelData) {
    var model = {};
    model.coordsBuffer = gl.createBuffer();
    model.normalBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;

    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);

    console.log(modelData.vertexPositions.length);
    console.log(modelData.indices.length);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);

    model.render = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(aCoordsmap, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(aNormalmap, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.uniformMatrix4fv(uModelviewmap, false, flatten(modelview));    //--- load flattened modelview matrix
        gl.uniformMatrix3fv(uNormalMatrixmap, false, flatten(normalMatrix));  //--- load flattened normal matrix

        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
        console.log(this.count);
    }
    return model;
}

function createModelColor(modelData) {
    var model = {};
    model.coordsBuffer = gl.createBuffer();
    model.normalBuffer = gl.createBuffer();
    model.textureBuffer = gl.createBuffer();
    model.indexBuffer = gl.createBuffer();
    model.count = modelData.indices.length;

    gl.bindBuffer(gl.ARRAY_BUFFER, model.coordsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, model.textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexTextureCoords, gl.STATIC_DRAW);

    console.log(modelData.vertexPositions.length);
    console.log(modelData.indices.length);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);

    model.render = function () {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.coordsBuffer);
        gl.vertexAttribPointer(CoordsLoccolor, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(NormalLoccolor, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.textureBuffer);
        gl.vertexAttribPointer(TexCoordLoccolor, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        gl.uniformMatrix4fv(ModelviewLoccolor, false, flatten(modelview));    //--- load flattened modelview matrix
        gl.uniformMatrix3fv(NormalMatrixLoccolor, false, flatten(normalMatrix));  //--- load flattened normal matrix

        gl.drawElements(gl.TRIANGLES, this.count, gl.UNSIGNED_SHORT, 0);
        console.log(this.count);
    }
    return model;
}
var vzoom=75; 
function zoomIn(){
        rotator.setViewDistance(vzoom); 
        vzoom--; 
   } 

function zoomOut(){
    rotator.setViewDistance(vzoom);
    vzoom++; 
} 

function doKey(evt) {
    var rotationChanged = true;

    switch (evt.keyCode) {
        case 37: thetaRot -= 2.0; render(); break;       // left arrow
        case 39: thetaRot += 2.0; render(); break;       // right arrow
        case 38: zoomIn(); break;        // up arrow
        case 40: zoomOut(); break;        // down arrow
        
    }
}



function createProgram(gl, vertexShaderSource, fragmentShaderSource) {
    var vsh = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vsh, vertexShaderSource);
    gl.compileShader(vsh);
    if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
        throw "Error in vertex shader:  " + gl.getShaderInfoLog(vsh);
    }
    var fsh = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fsh, fragmentShaderSource);
    gl.compileShader(fsh);
    if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
        throw "Error in fragment shader:  " + gl.getShaderInfoLog(fsh);
    }
    var prog = gl.createProgram();
    gl.attachShader(prog, vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        throw "Link error in program:  " + gl.getProgramInfoLog(prog);
    }
    return prog;
}


function getTextContent(elementID) {
    var element = document.getElementById(elementID);
    var fsource = "";
    var node = element.firstChild;
    var str = "";
    while (node) {
        if (node.nodeType == 3) // this is a text node
            str += node.textContent;
        node = node.nextSibling;
    }
    return str;
}       
        

window.onload = function init() {
    try {
        var canvas = document.getElementById("glcanvas");
        gl = canvas.getContext("webgl");
        if (!gl) {
            gl = canvas.getContext("experimental-webgl");
        }
        if (!gl) {
            throw "Could not create WebGL context.";
        }
		
		// LOAD SHADER (for the environment) -- Skybox 
        var vertexShaderSourceSkybox = getTextContent("vshaderbox");
        var fragmentShaderSourceSkybox = getTextContent("fshaderbox");
        progbox = createProgram(gl, vertexShaderSourceSkybox, fragmentShaderSourceSkybox);

        gl.useProgram(progbox);

        aCoordsbox = gl.getAttribLocation(progbox, "vcoords");
        aNormalbox = gl.getAttribLocation(progbox, "vnormal");
        aTexCoordbox = gl.getAttribLocation(progbox, "vtexcoord");

        uModelviewbox = gl.getUniformLocation(progbox, "modelview");
        uProjectionbox = gl.getUniformLocation(progbox, "projection");

        uEnvbox = gl.getUniformLocation(progbox, "skybox");

        gl.enable(gl.DEPTH_TEST);
	
		
		// LOAD SHADER  (environmental mapping) -- Cube reflection 
        var vertexShaderSourcemap = getTextContent("vshadermap");
        var fragmentShaderSourcemap = getTextContent("fshadermap");
        progmap = createProgram(gl, vertexShaderSourcemap, fragmentShaderSourcemap);

        gl.useProgram(progmap);

        // locate variables for further use
        aCoordsmap = gl.getAttribLocation(progmap, "vcoords");
        aNormalmap = gl.getAttribLocation(progmap, "vnormal");
        aTexCoordmap = gl.getAttribLocation(progmap, "vtexcoord");

        uModelviewmap = gl.getUniformLocation(progmap, "modelview");
        uProjectionmap = gl.getUniformLocation(progmap, "projection");
        uNormalMatrixmap = gl.getUniformLocation(progmap, "normalMatrix");

        uSkybox = gl.getUniformLocation(progmap, "skybox");

        gl.enableVertexAttribArray(aCoordsmap);
        gl.enableVertexAttribArray(aNormalmap);
        gl.disableVertexAttribArray(aTexCoordmap);   // texture coordinates not used (environmental mapping)

        // LOAD FIRST SHADER (standard texture mapping)
        var vertexShaderSource = getTextContent("vshader");
        var fragmentShaderSource = getTextContent("fshader");
        prog = createProgram(gl, vertexShaderSource, fragmentShaderSource);

        gl.useProgram(prog);
        
        // locate variables for further use
        CoordsLoc = gl.getAttribLocation(prog, "vcoords");
        NormalLoc = gl.getAttribLocation(prog, "vnormal");
        TexCoordLoc = gl.getAttribLocation(prog, "vtexcoord");

        ModelviewLoc = gl.getUniformLocation(prog, "modelview");
        ProjectionLoc = gl.getUniformLocation(prog, "projection");
        NormalMatrixLoc = gl.getUniformLocation(prog, "normalMatrix");

        gl.enableVertexAttribArray(CoordsLoc);
        gl.enableVertexAttribArray(NormalLoc);
        gl.enableVertexAttribArray(TexCoordLoc);  // we do not need texture coordinates

        gl.enable(gl.DEPTH_TEST);
        
        // LOAD SECOND SHADER 
        var vertexShaderSourcecolor = getTextContent("vshader");
        var fragmentShaderSourcecolor = getTextContent("fshadercolor");
        progcolor = createProgram(gl, vertexShaderSourcecolor, fragmentShaderSourcecolor);

        gl.useProgram(progcolor);
        
        // locate variables for further use
        CoordsLoccolor = gl.getAttribLocation(progcolor, "vcoords");
        NormalLoccolor = gl.getAttribLocation(progcolor, "vnormal");
        TexCoordLoccolor = gl.getAttribLocation(progcolor, "vtexcoord");

        ModelviewLoccolor = gl.getUniformLocation(progcolor, "modelview");
        ProjectionLoccolor = gl.getUniformLocation(progcolor, "projection");
        NormalMatrixLoccolor = gl.getUniformLocation(progcolor, "normalMatrix");

        gl.enableVertexAttribArray(CoordsLoccolor);
        gl.enableVertexAttribArray(NormalLoccolor);
        gl.enableVertexAttribArray(TexCoordLoccolor);  // we do not need texture coordinates

        gl.enable(gl.DEPTH_TEST); 
        
        // --------------------------------------------------------------------- //
        

        //  create a "rotator" monitoring mouse mouvement
        rotator = new SimpleRotator(canvas, render);
        //  set initial camera position at z=40, with an "up" vector aligned with y axis
        //   (this defines the initial value of the modelview matrix )
        rotator.setView([0, 0, 1], [0, 1, 0],75);

        gl.useProgram(prog);
                
        ambientProduct = mult(lightAmbient, materialAmbient);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);
        specularProduct = mult(lightSpecular, materialSpecular);
        
        gl.uniform4fv(gl.getUniformLocation(prog, "ambientProduct"), flatten(ambientProduct));
        gl.uniform4fv(gl.getUniformLocation(prog, "diffuseProduct"), flatten(diffuseProduct));
        gl.uniform4fv(gl.getUniformLocation(prog, "specularProduct"), flatten(specularProduct));
        gl.uniform1f(gl.getUniformLocation(prog, "shininess"), materialShininess);

        gl.uniform4fv(gl.getUniformLocation(prog, "lightPosition"), flatten(lightPosition));
        
        gl.useProgram(progcolor);
        gl.uniform4fv(gl.getUniformLocation(progcolor, "lightPosition"), flatten(lightPosition)); 

        gl.useProgram(prog);
        projection = perspective(70.0, 1.0, 1.0, 200.0);
        gl.uniformMatrix4fv(ProjectionLoc, false, flatten(projection));  // send projection matrix to the shader program
        
        gl.useProgram(progcolor);
        gl.uniformMatrix4fv(ProjectionLoccolor, false, flatten(projection));  // send projection matrix to the shader program

        initTexture();


        // You can use basic models using the following lines
		envbox = createModelbox(cube(150));
		cubeReflec= createModelmap(cube(25.0)); 
        sphere = createModel(uvSphere(10.0, 25.0, 25.0));
        cylinder = createModel(uvCylinder(10.0, 20.0, 25.0, false, false));
        Reacteur = createModel(Reacteur(10.0, 20.0, 25.0, false, false));
        cylinderReacteur = createModel(uvCylinder(10.0, 20.0, 25.0, true, true));
        box = createModel(cube(10.0));
        fenetreBox = createModelColor(cube(10.0));
        tetra=createModel(tetraedre(10.0));
        tri=createModelColor(triangle(10.0));
        devantCotpit= createModel(devantCotpit(10.0));
        torus = createModel(uvTorus(5.5, 5, 25.0, 25.0));
        hemisphereinside = createModel(uvHemisphereInside(10.0, 25.0, 25.0));
        hemisphereoutside = createModel(uvHemisphereOutside(10.0, 25.0, 25.0));
        thindisk = createModel(ring(9.5, 10.0, 25.0));


    }
    catch (e) {
        document.getElementById("message").innerHTML =
             "Could not initialize WebGL: " + e;
        return;
    }
	
	// Locate uniform variables
    modelviewLoc = gl.getUniformLocation(prog, "modelview");
    alphaLoc = gl.getUniformLocation(prog, "alpha");

	document.addEventListener("keydown", doKey, false);  // add a callback function (when a key is pressed)
    setInterval(render, 100);
	render(); 
}


