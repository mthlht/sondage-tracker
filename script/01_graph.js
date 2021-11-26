d3.csv('data/df_sondages_classement.csv').then(data => {
    const graphCfg = {
        target: `#graph_01`,
        title: `Classement des candidats selon les sondages des trois dernières semaines ?`,
        subtitle: ``,
        caption: `Source : <a href="https://twitter.com/NspPolls" target="_blank">NspPolls</a> - Crédits : Franceinfo`,
        type: 'landscape',
        device: window.screenDevice,
    }

    // Traitement des données

    console.log(data)

    // Premier tri
    const tempObjData = data.reduce((acc, d) => {

      let candidat = d.candidat

      if(acc[candidat]) {
          
          acc[candidat]['resultats'].push({
            'nom':candidat,
            'nuance': d.nuance,
            'initiales': d.initiales,
            'min':+d.erreur_inf,
            'max':+d.erreur_sup
        })


      } else {

          acc[candidat] = {
              'nom':candidat,
              'initiales': d.initiales,
              'parti': d.parti,
              'rank': +d.rank,
              'img_url': d.img_url,
              'nuance': d.nuance,
              'resultats': [
                {
                  'nom':candidat,
                  'initiales': d.initiales,
                  'nuance': d.nuance,
                  'min':+d.erreur_inf,
                  'max':+d.erreur_sup
              }]
          }

      }

      return acc

  }, {});

  // Deuxième tri

  const tempData = Object.keys(tempObjData).map(i => {
      return tempObjData[i];
  })

  const tidyData = tempData.sort((a, b) => d3.ascending(a.rank, b.rank));


  // Tri données pour les labels

  const dataMinMax = data.reduce((acc, d) => {

    let candidat = d.candidat;

    if(acc[candidat]) {

      acc[candidat]['erreur_inf'].push(+d.erreur_inf)
      acc[candidat]['erreur_sup'].push(+d.erreur_sup)

    } else {

      acc[candidat] = {

        'erreur_inf': [+d.erreur_inf],
        'erreur_sup': [+d.erreur_sup],
        'rank': +d.rank
        }

    }

    return acc

  }, {});

  console.log(tidyData)

    //---------------------------------------------------------------------------------------

    // Sélection div

    const rootDiv = d3.select(graphCfg.target)

    //---------------------------------------------------------------------------------------


    // Création du canevas SVG

    const width = 400;
    const height = 60;
    const marginH = 5;
    const marginV = 5;

    const viewBox = {
        width: width + marginH*2,
        height: height + marginV*2
    }


//---------------------------------------------------------------------------------------

  // Écriture titraille graphique

  // Définition du padding à appliquer aux titres, sous-titres, source
  // pour une titraille toujours alignée avec le graphique
  const padding = marginH / viewBox.width * 100
  const paddingTxt = `0 ${ padding }%`

  // déclaration du padding du graphe (pour mettre du padding aux titres, via le CSS)
  document.documentElement.style.setProperty('--gutter-size', `${ padding }%`)

  // Écriture du titre
  d3.select(graphCfg.target)
    .select('.grph-title')
    .html(graphCfg.title)
    .style("padding", paddingTxt);

  // Écriture du sous-titre
  d3.select(graphCfg.target)
    .select('.grph-title')
    .append('span')
    .attr('class', 'grph-subtitle')
    .html(graphCfg.subtitle);

  // Écriture de la source
  d3.select(graphCfg.target)
    .select('.grph-caption')
    .html(graphCfg.caption)
    .style("padding", paddingTxt);


//---------------------------------------------------------------------------------------

// Création d'une nomenclature de couleurs

  paletteCouleurs = {
    'EXGA': '#db1616',
    'GAUC': '#ff6daa',
    'ECO': '#04b34d',
    'CENT': '#9859FC',
    'DROI': '#037bfc',
    'EXDR': '#002e61',
    'DIV': 'grey'
  }

//---------------------------------------------------------------------------------------

   // Création des cadres

   const divCandidat = rootDiv
    .select('.grph-content')
    .selectAll('div')
    .data(tidyData)
    .join('div')
    .attr('class', 'candidat-box');

  const divLeft = divCandidat
    .append('div')
    .attr('class', 'left-box');
  
  const divRight = divCandidat
    .append('div')
    .attr('class', 'right-box');

 //---------------------------------------------------------------------------------------

  // Photos candidats

  const divPhoto = divLeft
    .append('div')
    .attr('class', 'photo-box');


  const circlePhoto = divPhoto
    .append('div')
    .attr('class', 'circle-img')
    .append('img')
    .attr('src', d => d.img_url)
    .style('border-color', d => paletteCouleurs[d.nuance]);

 //---------------------------------------------------------------------------------------

 // Noms candidats

  const divNom = divLeft
    .append('div')
    .attr('class', 'candidat-nom')

  divNom
    .append('p')
    .attr('class', 'sub-nom')
    .html(d => d.nom);

  divNom
    .append('p')
    .attr('class', 'sub-parti')
    .html(d => d.parti);


 //---------------------------------------------------------------------------------------
 
 // Création du SVG pour les résultats

  const svgResult = divRight
    .insert('svg', ':first-child')
    .attr("viewBox", [0, 0, viewBox.width, viewBox.height])
    .attr("preserveAspectRatio", "xMinYMid")
    .attr('class', 'graph-box');

//---------------------------------------------------------------------------------------

// Création des échelles

  // échelle linéaire pour l'axe des X
  const scaleX = d3
    .scaleLinear()
    .domain([0, d3.max(tidyData[0]['resultats'], (d) => d['max'])+10])
    .range([0, width]);
  
    //---------------------------------------------------------------------------------------

   
  
    const bars = svgResult
    .append('g')
    .attr("class", "marges")
    .selectAll('rect')
    .data(d => {
      return d['resultats']
    })
    .join('rect')
     .attr("y", 22)
     .attr("x", (d) => scaleX(d['min']+4))
     .attr("width", (d) => scaleX((d['max']+4) - (d['min']+4)))
     .attr("height", 38) // height des barres avec l'échelle d'épaiseur
     .attr("fill", d => paletteCouleurs[d['nuance']])
     .attr("opacity", 0.1);

    
    const labelsMin = svgResult
      .append('g')
      .attr("class", 'labels')
      .append('text')
      .attr('x', d => {
        let numbers = dataMinMax[d.nom]
        let number = d3.min(numbers.erreur_inf)+4
        
        if(d3.max(numbers.erreur_sup) - d3.min(numbers.erreur_inf) < 20) {
          return scaleX(number) - 25
        } else {
          return scaleX(number)
        }        
      })
      .attr('y', 18)
      .text(d => {
        let numbers = dataMinMax[d.nom]
        let number = Math.round(d3.min(numbers.erreur_inf))
        let label = number + '%'
        return label
      })
      .attr('font-weight', 'bold')
      .attr('font-size', 18)

      const labelsMax = svgResult
      .append('g')
      .attr("class", 'labels')
      .append('text')
      .attr('x', d => {
        let numbers = dataMinMax[d.nom]
        let number = d3.max(numbers.erreur_sup)+4
        if(d3.max(numbers.erreur_sup) - d3.min(numbers.erreur_inf) < 20) {
          return scaleX(number)
        } else {
          return scaleX(number) - 25
        }    
      })
      .attr('y', 18)
      .text(d => {
        let numbers = dataMinMax[d.nom]
        let number = Math.round(d3.max(numbers.erreur_sup))
        let label = number + '%'
        return label
      })
      .attr('font-weight', 'bold')
      .attr('font-size', 18)

})