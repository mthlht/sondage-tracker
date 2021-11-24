d3.csv('data/df_sondages_loess.csv').then(data => {
    const graphCfg = {
        target: `#graph_02`,
        title: `Dynamique des candidats dans les sondages`,
        subtitle: `Intentions de vote pour le premier tour`,
        caption: `Source : <a href="https://twitter.com/NspPolls" target="_blank">NspPolls</a> - Crédits : Franceinfo`,
        type: 'landscape',
        device: window.screenDevice,
    }

    //--------------------------------------------------------------------------------------------------

    const locale = {
        dateTime: '%A %e %B %Y à %X',
        date: '%d/%m/%Y',
        time: '%H:%M:%S',
        periods: ['AM', 'PM'],
        days: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
        shortDays: ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
        months: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
        shortMonths: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
      };

    d3.timeFormatDefaultLocale(locale);
    
    //--------------------------------------------------------------------------------------------------
    
     // Tri des données

    // Nettoyage type valeurs
    let tidyData = data.map(d => {


        return {
            candidat: d.candidat,
            date: new Date(d.date),
            ymin: +d.ymin,
            ymax: +d.ymax,
            ymean: +d.ymean,
            nuance: d.nuance,
            order: +d.order
        }

    });

    // Ordre par dates croissantes
    tidyData = tidyData.sort((a, b) => {

        return a.date - b.date;

    });

    // Liste des candidats

    const checkList = []

    const candidatsListeFull = tidyData.reduce((acc, d) => {

        if(!checkList.includes(d.candidat)) {
            
            checkList.push(d.candidat);

            let obj = {
                candidat:d.candidat,
                order:d.order
            }
            
            acc.push(obj)
    
        }

        return acc
        
    }, []);

    candidatsListeFull.sort((a, b) => {

        return a.order - b.order;

    })

    // Définition liste candidats à afficher au départ

    const dataToFilter = candidatsListeFull.map(d => {
        let cand = d.candidat;

        let dataFiltered = tidyData.filter((d) => {
           return d.candidat === cand
        });

        return dataFiltered

    });

    const lastVals = dataToFilter.reduce((acc, d, i) => {

        let arrayToResearch = dataToFilter[i]
        let indexLastVal = arrayToResearch.length - 1
        let lastVal = arrayToResearch[indexLastVal]

        acc.push(lastVal)

        return acc

    }, []);

    const listNuance = ["EXGA", "ECO", "GAUC", "CENT", "DROI", "EXDR"]

    const lastValsGroup = listNuance.reduce((acc, d) => {

        let nomGroupe = d;

        let groupe = lastVals.filter(d => {return d.nuance === nomGroupe})
        
        groupe.sort((a, b) => {

            return b.ymean - a.ymean;
    
        });

        acc.push(groupe[0])

        console.log(acc)

        return acc

    }, []);


    console.log(lastValsGroup)

    let candidatsListe = lastValsGroup.map(d => {return d.candidat})

    console.log(candidatsListe)

    // Tri en array de candidats
    let dataToLines = candidatsListe.map(d => {
        let cand = d;

        let dataFiltered = tidyData.filter((d) => {
           return d.candidat === cand
        });

        return dataFiltered

    })

    

    //--------------------------------------------------------------------------------------------------

    // Création d'une nomenclature de couleurs

  paletteCouleurs = {
    'Emmanuel Macron': '#9859FC',
    'Marine Le Pen': '#002e61',
    'Eric Zemmour': '#002e61',
    'Xavier Bertrand': '#037bfc',
    'Valérie Pécresse': '#037bfc',
    'Jean-Luc Mélenchon': '#db1616',
    'Yannick Jadot': '#04b34d',
    'Michel Barnier': '#037bfc',
    'Anne Hidalgo': '#ff6daa',
    'Arnaud Montebourg': '#ff6daa',
    'Nicolas Dupont-Aignan': '#002e61',
    'Fabien Roussel': '#db1616',
    'Philippe Poutou': '#db1616',
    'Nathalie Arthaud': '#db1616',
    'Jean Lassalle': '#777f7f',
    'Jean-Frédéric Poisson': '#002e61',
    'Florian Philippot': '#002e61',
    'Jean-Christophe Lagarde': '#037bfc',
    'François Asselineau': '#777f7f',
    'Philippe Juvin': '#037bfc'
  }

  //--------------------------------------------------------------------------------------------------

    // Création des boites avec les noms

    const boxCandidats = d3
    .select(graphCfg.target)
    .select('.box-content');

    // Création des box pour chaque candidat
    const divCandidats = boxCandidats
        .selectAll("div")
        .data(candidatsListeFull)
        .join("div")
        .attr("class", "box-candidat")
        .html(d => d.candidat)
        .style("color", "white")
        .style("background-color", d => paletteCouleurs[d.candidat])
        .style("opacity", d => {
            if(candidatsListe.includes(d.candidat)) {
                return "1"
            } else { return "0.4" }

        })

    //--------------------------------------------------------------------------------------------------
     // Création du canevas SVG

     const width = 500;
     const height = 600;
     const marginH = 40;
     const marginV = 20;
 
     const viewBox = {
         width: width + marginH * 2,
         height: height + marginV * 2
     }
 
     // création du canevas pour le Graphique
     const svg = d3
         .select(graphCfg.target)
         .select('.grph-content')
         .insert('svg', ':first-child')
         .attr("viewBox", [0, 0, viewBox.width, viewBox.height])
         .attr("preserveAspectRatio", "xMinYMid");
 
     // création d'un groupe g pour le Graphique
     const svgPlot = svg
         .append("g")
         .attr("transform", `translate(${marginH}, ${marginV})`);
 
     //---------------------------------------------------------------------------------------
 
     // Écriture titraille graphique
 
     // Définition du padding à appliquer aux titres, sous-titres, source
     // pour une titraille toujours alignée avec le graphique
     const padding = marginH / viewBox.width * 100
     const paddingTxt = `0 ${padding}%`
 
     document.documentElement.style.setProperty('--gutter-size', `${padding}%`)
 
     // Écriture du titre
     d3.select(graphCfg.target)
         .select('.grph-title')
         .html(graphCfg.title)
         .style("padding", paddingTxt)
 
     // Écriture du sous-titre
     d3.select(graphCfg.target)
         .select('.grph-title')
         .append('span')
         .attr('class', 'grph-subtitle')
         .html(graphCfg.subtitle)
 
     // Écriture de la source
     d3.select(graphCfg.target)
         .select('.grph-caption')
         .html(graphCfg.caption)
         .style("padding", paddingTxt)
 
     //---------------------------------------------------------------------------------------
 
     // Création des échelles X et Y
 
     // échelle linéaire pour l'axe des Y
     const scaleY = d3
         .scaleLinear()
         .domain([0, d3.max(tidyData, (d) => d.ymax)])
         .range([height, 0]);
 
     // échelee temporelle pour l'axe des X
     const scaleT = d3
         .scaleTime()
         .domain([d3.min(tidyData, (d) => d.date), d3.max(tidyData, (d) => d.date)])
         .range([0, width]);
 
     //---------------------------------------------------------------------------------------
 
      // Création des axes
 
   // Axe des X
   const xAxis = (g) =>
   g
     .attr("transform", `translate(0, ${height})`)
     .call(d3.axisBottom(scaleT).ticks(4).tickFormat(d3.timeFormat("%b %Y")))
     .selectAll("text")
     .style("fill", "grey")
     .style("font-size", "12px");
 
 // Axe des Y
 const yAxis = (g) =>
   g
     .attr("transform", `translate(0, 0)`)
     .call(
       d3.axisLeft(scaleY)
         .ticks(6)
         .tickFormat(function(d) { return d + "%"; })
     ) // formatage grands nombre avec virgule entre milliers
     .call((g) => g.select(".domain").remove()); // supprime la ligne de l'axe
 
 
 
 //---------------------------------------------------------------------------------------

 // Générateurs d'aires et de lignes

    // Area charts
    const areaLines = d3
    .area()
    .x((d) => scaleT(d.date))
    .y0((d) => scaleY(d.ymin))
    .y1((d) => scaleY(d.ymax))
    .curve(d3.curveLinear);

    // générateur de la ligne avec les échelles
   const lineGenerator = d3
   .line()
   .x((d) => scaleT(d.date))
   .y((d) => scaleY(d.ymean))
   .curve(d3.curveLinear);

   const gLines = svgPlot
        .append("g")

    const gAreas = svgPlot
        .append("g")

 // Graphiques

 gAreas
    .selectAll("g")
    .data(dataToLines)
    .join("g")
    .append("path")
    .attr("d", (d) => areaLines(d))
    .attr("opacity", 0.1)
    .attr("fill", d => {
        let candidat = d[0]['candidat']
        return paletteCouleurs[candidat]
    });

    // projection des lignes
   gLines
   .selectAll("g")
   .data(dataToLines)
   .join("g")
   .append("path")
   .attr("d", (d) => lineGenerator(d))
   .attr("fill", "none") // ATTENTION A BIEN METTRE FILL NONE
   .attr("stroke", d => {
      let candidat = d[0]['candidat']
      return paletteCouleurs[candidat]
  })
   .attr("stroke-width", 3);

 // Ajout interactivité

 divCandidats
 .on("mouseover", function() { 
         d3.select(this)
             .style('opacity', "1")
             .style("cursor", "pointer");
      })
 .on("mouseout", function() { 
         d3.select(this)
             .style('opacity', d => candidatsListe.includes(d.candidat) ? "1" : "0.4")
             .style("cursor", "default");
      })
 .on("click", function(d) { 
         console.log("click")

         let candidatOnClick = d.candidat;

         if(!candidatsListe.includes(candidatOnClick)) {
             console.log("not in")
             candidatsListe.push(candidatOnClick)
             d3.select(this)
             .style('opacity', "1")
         } else if(candidatsListe.includes(candidatOnClick)) {
            
            candidatsListe = candidatsListe.filter(d =>{
                return d !== candidatOnClick
            })
            console.log(candidatsListe)
            d3.select(this)
             .style('opacity', "0.4")

         }
         

         dataToLines = candidatsListe.map(d => {
             let cand = d;
     
             let dataFiltered = tidyData.filter((d) => {
                return d.candidat === cand
             });
     
             return dataFiltered
     
         })

         gLines
         .selectAll("g")
         .remove();

         gAreas
         .selectAll("g")
         .remove();

         gAreas
    .selectAll("g")
    .data(dataToLines)
    .join("g")
    .append("path")
    .attr("d", (d) => areaLines(d))
    .attr("opacity", 0.1)
    .attr("fill", d => {
        let candidat = d[0]['candidat']
        return paletteCouleurs[candidat]
    });

    // projection des lignes
   gLines
   .selectAll("g")
   .data(dataToLines)
   .join("g")
   .append("path")
   .attr("d", (d) => lineGenerator(d))
   .attr("fill", "none") // ATTENTION A BIEN METTRE FILL NONE
   .attr("stroke", d => {
      let candidat = d[0]['candidat']
      return paletteCouleurs[candidat]
  })
   .attr("stroke-width", 3);

  })
    



    


//---------------------------------------------------------------------------------------
 
   // Line Chart
 
   
 
   
     
 
 //---------------------------------------------------------------------------------------
 
 // Placement des axes
 
   // Placement X
   svgPlot.append("g").call(xAxis).attr("color", "grey"); // mise en gris des ticks de l'axe des X
 
   // Placement Y
   svgPlot
     .append("g")
     .call(yAxis)
     .attr("color", "grey")
     .style("font-size", "12px")
     .call((g) =>
       g
         .selectAll(".tick line")
         .clone()
         .attr("x2", width)
         .attr("stroke-opacity", 0.1)
     ); // lignes horizontales projetées sur le graphique

})