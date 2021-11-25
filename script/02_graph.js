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

    // Dictionnaire de dates normalisées FR
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
            nom: d.nom,
            date: new Date(d.date),
            ymin: +d.ymin,
            ymax: +d.ymax,
            ymean: +d.ymean,
            nuance: d.nuance,
            order: +d.order
        }

    });

    // Ordre de tidyData par dates croissantes
    tidyData = tidyData.sort((a, b) => {

        return a.date - b.date;

    });

    // Liste complete des candidats

    const checkList = []

    const candidatsListeFull = tidyData.reduce((acc, d) => {

        if (!checkList.includes(d.candidat)) {

            checkList.push(d.candidat);

            let obj = {
                candidat: d.candidat,
                order: d.order
            }

            acc.push(obj)

        }

        return acc

    }, []);

    candidatsListeFull.sort((a, b) => {

        return a.order - b.order;

    })

    // Définition liste candidats à afficher au départ

    // Transposition de tidyData en array d'arrays (un par candidat)
    const dataToFilter = candidatsListeFull.map(d => {
        let cand = d.candidat;

        let dataFiltered = tidyData.filter((d) => {
            return d.candidat === cand
        });

        return dataFiltered

    });

    // Filtre des dernières valeurs et mise dans l'ordre décroissant (ymean)
    const lastVals = dataToFilter.reduce((acc, d, i) => {

        let arrayToResearch = dataToFilter[i]
        let indexLastVal = arrayToResearch.length - 1
        let lastVal = arrayToResearch[indexLastVal]

        acc.push(lastVal)

        return acc

    }, []);

    lastVals.sort((a, b) => {

        return b.ymean - a.ymean;

    });

    // Liste des nuances
    const listNuance = ["EXGA", "ECO", "GAUC", "CENT", "DROI", "EXDR"]

    // Date maximum
    const lastDate = d3.max(lastVals, d => d.date);

    // Filtre des dernières valeurs avec condition == à lastDate

    const lastValsToDate = lastVals.filter(d => d.date >= lastDate);

    // Liste des premiers candidats à afficher
    let candidatsListe = lastValsToDate.slice(0, 6).map(d => { return d.candidat })

    // Données à projeter en ligne
    let dataToLines = candidatsListe.map(d => {
        let cand = d;

        let dataFiltered = tidyData.filter((d) => {
            return d.candidat === cand
        });

        return dataFiltered

    })

    // Données à projeter en points
    let dataToPoints = candidatsListe.reduce((acc, d) => {

        let candidat = d

        let valToReturn = lastVals.filter(d => d.candidat === candidat)

        acc.push(valToReturn[0])

        return acc


    }, [])


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
        'Jean-Christophe Lagarde': '#9859FC',
        'François Asselineau': '#777f7f',
        'Philippe Juvin': '#037bfc'
    }

    //--------------------------------------------------------------------------------------------------

    // Création des boites avec les noms des candidats

    // sélection du container
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
        .style("color", d => {
            if (candidatsListe.includes(d.candidat)) {
                return "white"
            } else { return paletteCouleurs[d.candidat] }
        })
        .style("background-color", d => {
            if (candidatsListe.includes(d.candidat)) {
                return paletteCouleurs[d.candidat]
            } else { return "white" }
        })
        .style("border", d => {

            let col = paletteCouleurs[d.candidat];

            return `0.1em solid ${col}`

        })

    //--------------------------------------------------------------------------------------------------
    // Création du canevas SVG

    const width = 500;
    const height = 600;
    const marginH = 40;
    const marginV = 20;

    const viewBox = {
        width: width + marginH * 5,
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
            .style("font-size", "12px")
            .style("font-weight", "bold");

    // Axe des Y
    const yAxis = (g) =>
        g
            .attr("transform", `translate(0, 0)`)
            .call(
                d3.axisLeft(scaleY)
                    .ticks(6)
                    .tickFormat(function (d) { return d + "%"; })
            ) // formatage grands nombre avec virgule entre milliers
            .call((g) => g.select(".domain").remove()); // supprime la ligne de l'axe


    //---------------------------------------------------------------------------------------

    // Les générateurs

    // Générateur d'area charts
    const areaLines = d3
        .area()
        .x((d) => scaleT(d.date))
        .y0((d) => scaleY(d.ymin))
        .y1((d) => scaleY(d.ymax))
        .curve(d3.curveLinear);

    // générateur de line chart
    const lineGenerator = d3
        .line()
        .x((d) => scaleT(d.date))
        .y((d) => scaleY(d.ymean))
        .curve(d3.curveLinear);




    //---------------------------------------------------------------------------------------

    // Projection des éléments graphiques - avant interaction

    // Création d'un groupe par élément
    const gAreas = svgPlot
        .append("g");

    const gLines = svgPlot
        .append("g");

    const gCircles = svgPlot
        .append("g");

    // Projection des aires
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
        .append("g")
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


    // projection des cercles


    gCircles
        .selectAll("g")
        .data(dataToPoints)
        .join("g")
        .append("circle")
        .attr("cx", d => scaleT(d.date))
        .attr("cy", d => scaleY(d.ymean))
        .attr("r", 6)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 0.8)
        .attr("fill", d => {
            return paletteCouleurs[d.candidat]
        })

    //---------------------------------------------------------------------------------------

    // Ajout des dernières valeurs

    // Annotations - affichage des dernières valeurs

    // Création de noeuds
    let labels = dataToPoints.map((d) => {
        return {
            fx: 0,
            targetY: scaleY(d.ymean),
        };
    });

    const forceClamp = (min, max) => {
        let nodes;
        const force = () => {
            nodes.forEach(n => {
                if (n.y > max) n.y = max;
                if (n.y < min) n.y = min;
            });
        };
        force.initialize = (_) => nodes = _;
        return force;
    };

    // Simulation de force sur les noeuds
    let force = d3
        .forceSimulation()
        .nodes(labels)
        .force("collide", d3.forceCollide(10))
        .force("y", d3.forceY((d) => d.targetY).strength(1))
        .force('clamp', forceClamp(0, height))
        .stop();

    // Execute la simulation
    for (let i = 0; i < 300; i++) force.tick();

    // Ajout d'une valeur y dans chaque objet de l'array lastValues
    labels.sort((a, b) => a.y - b.y);
    dataToPoints.sort((a, b) => b.ymean - a.ymean);
    dataToPoints.forEach((d, i) => (d.y = labels[i].y));

    // Ajout des valeurs sur le graphique
    const gLabels = svgPlot
        .append("g")

    gLabels
        .selectAll("g")
        .data(dataToPoints)
        .join("g")
        .append("text")
        .attr("x", width + 8)
        .attr("y", (d) => d.y)
        .text((d) => d.nom + " " + Math.round(d.ymean) + "%")
        .style("font-weight", "bold")
        .style("fill", d => paletteCouleurs[d.candidat]);


    //---------------------------------------------------------------------------------------

    // Ajout interactivité

    divCandidats
        // MOUSEOVER
        .on("mouseover", function () {
            d3.select(this)
                .style("background-color", d => paletteCouleurs[d.candidat])
                .style("color", "white")
                .style("cursor", "pointer");
        })
        // MOUSEOUT
        .on("mouseout", function () {
            d3.select(this)
                .style("background-color", d => candidatsListe.includes(d.candidat) ? paletteCouleurs[d.candidat] : "white")
                .style("color", d => candidatsListe.includes(d.candidat) ? "white" : paletteCouleurs[d.candidat])
                .style("cursor", "default");
        })
        // CLICK
        .on("click", function (d) {

            let candidatOnClick = d.candidat;

            if (!candidatsListe.includes(candidatOnClick)) {

                candidatsListe.push(candidatOnClick)
                d3.select(this)
                .style("background-color", "white")
                .style("color", d => paletteCouleurs[d.candidat])

            } else if (candidatsListe.includes(candidatOnClick)) {

                candidatsListe = candidatsListe.filter(d => {
                    return d !== candidatOnClick
                })

                d3.select(this)
                .style("background-color", d => paletteCouleurs[d.candidat])
                .style("color", d => "white")

            }

            // ACTUALISATION LISTE DES CANDIDATS APRÈS CLICK
            dataToLines = candidatsListe.map(d => {
                let cand = d;

                let dataFiltered = tidyData.filter((d) => {
                    return d.candidat === cand
                });

                return dataFiltered

            })

            // NETTOYAGE DES PROJECTIONS
            gLines
                .selectAll("g")
                .remove();

            gAreas
                .selectAll("g")
                .remove();

            gCircles
                .selectAll("g")
                .remove()

            gLabels
                .selectAll("g")
                .remove()

            // RE-PROJECTION DES AIRES
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

            // RE-PROJECTION DES LIGNES
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

            dataToPoints = candidatsListe.reduce((acc, d) => {

                let candidat = d

                let valToReturn = lastVals.filter(d => d.candidat === candidat)

                acc.push(valToReturn[0])

                return acc


            }, [])


            // RE-PROJECTION DES CERCLES
            gCircles
                .selectAll("g")
                .data(dataToPoints)
                .join("g")
                .append("circle")
                .attr("cx", d => scaleT(d.date))
                .attr("cy", d => scaleY(d.ymean))
                .attr("r", 6)
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 0.8)
                .attr("fill", d => {

                    return paletteCouleurs[d.candidat]
                });

            // RE-PROJECTION DES LABELS

            // Création de noeuds
            labels = dataToPoints.map((d) => {
                return {
                    fx: 0,
                    targetY: scaleY(d.ymean)
                };
            });

            // Simulation de force sur les noeuds
            force = d3
                .forceSimulation()
                .nodes(labels)
                .force("collide", d3.forceCollide(10))
                .force("y", d3.forceY((d) => d.targetY).strength(1))
                .force('clamp', forceClamp(0, height))
                .stop();

            // Execute la simulation
            for (let i = 0; i < 300; i++) force.tick();

            // Ajout d'une valeur y dans chaque objet de l'array lastValues
            labels.sort((a, b) => a.y - b.y);
            dataToPoints.sort((a, b) => b.ymean - a.ymean);
            dataToPoints.forEach((d, i) => (d.y = labels[i].y));

            // Ajout des valeurs sur le graphique
            gLabels
                .selectAll("g")
                .data(dataToPoints)
                .join("g")
                .append("text")
                .attr("x", width + 8)
                .attr("y", (d) => d.y)
                .text((d) => d.nom + " " + Math.round(d.ymean) + "%")
                .style("font-weight", "bold")
                .style("fill", d => paletteCouleurs[d.candidat]);

        })


    //---------------------------------------------------------------------------------------

    // Placement des axes

    // Placement X
    svgPlot.append("g").call(xAxis)
        .attr("color", "grey"); // mise en gris des ticks de l'axe des X

    // Placement Y
    svgPlot
        .append("g")
        .call(yAxis)
        .attr("color", "grey")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .call((g) =>
            g
                .selectAll(".tick line")
                .clone()
                .attr("x2", width)
                .attr("stroke-opacity", 0.1)
        ); // lignes horizontales projetées sur le graphique

})