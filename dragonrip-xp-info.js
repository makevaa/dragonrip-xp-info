// ==UserScript==
// @name         Dragonrip XP Info
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  View skill xp data on character page in Dragonrip
// @author       Kronos1
// @match         *://*.dragonrip.com/*
// @icon         https://i.imgur.com/Vn0ku7D.png
// @grant        none
// @license      GPLv3 
// ==/UserScript==


(() => {
    'use strict';


    const settings = {
        compactBasicInfo:true, // Make basic character info elements compact by reducing size
        removeVanillaElements:true, // Remove game's vanilla skill info on character page
    }
    
    //        

    const mainCss = `



        .dragonrip-xp-info-box {
            xborder:1px solid grey;
            width:100%;
            xfont-family:consolas,monospace;
            display:flex;
            flex-direction:column;
            align-items: start;
            justify-content: start;
            padding:0px 3px;

            --light-blue: #679fff;
            --blue: #2259b7ff;
            --purple: #6f6fffff;
            --light-lime: #00ff80ff;
        }

        .dragonrip-xp-info-box > .row {
            xborder:1px solid grey;
            width:100%;
            display:flex;
            align-items: center;
            justify-content: start;
        }

        .dragonrip-xp-info-box > .row > img.skill-image {
            padding:3px;
            xborder-radius:100%;
            xborder: 2px solid var(--light-blue);
            xbackground-color: white;
            filter: drop-shadow( 0px 0px 2px var(--light-blue) );
        }

        .dragonrip-xp-info-box > .row > .label {
            xborder:1px solid grey;
            width:40%;
            text-align:right;
            padding:0px 5px 0px 0px;
            color:grey;
            font-size:0.9em;
        }

        .dragonrip-xp-info-box > .row > .num {
            xborder:1px solid grey;
            width:60%;
            text-align:left;
            xcolor:lime;
            font-size:0.9em;
        }

        /* Special rules for the skill name */
        .dragonrip-xp-info-box > .row.skill-name > .label {
            width:0%;
            padding:0px;
        }

        .dragonrip-xp-info-box > .row.skill-name > .num {
            width:100%;
            xtext-align:center;
            xcolor:#de6c09;
            color:grey;
            padding:0px;
            font-size:1em;
        }

        .dragonrip-xp-info-box > .row > .skill-level {
            margin:0px 5px 0px 5px;
            color: var(--light-blue);
            text-shadow: 
                0px 0px 3px black,
                0px 0px 3px black,
                0px 0px 3px black,
                0px 0px 3px black,
                0px 0px 3px black,
                0px 0px 3px black,
                0px 0px 3px black
            ;
        } 

        /* XP bar container */
        .dragonrip-xp-info-box > .xp-bar-cont,
        .dragonrip-combat-info-box > .xp-bar-cont {
            border: 1px solid rgba(255, 255, 255, 0.3);
            width:100%;
            height:7px;
            position:relative;
            margin:5px 0px 4px 0px;
        }

        .dragonrip-combat-info-box > .xp-bar-cont {
            height:15px;
            width:70%;
            margin:auto;
            box-shadow:3px 3px 3px 0px rgba(0, 0, 0, 0.7);
        }

        /* XP bar */
        .dragonrip-xp-info-box > .xp-bar-cont > .bar-outer,
        .dragonrip-combat-info-box > .xp-bar-cont > .bar-outer {
            width:100%;
            height:100%;
            background-color: rgba(255, 255, 255, 0.05);
            position:relative;
        }

        .dragonrip-xp-info-box > .xp-bar-cont > .bar-outer:after, 
        .dragonrip-combat-info-box > .xp-bar-cont > .bar-outer:after {
            content: '';
            position: absolute;
            top: 0px;
            left: 0px;
            width: calc(100% - 0px);
            height: 10%;
        }
   
        /* XP bar filled interior */
        .dragonrip-xp-info-box > .xp-bar-cont > .bar-outer > .bar-inner,
        .dragonrip-combat-info-box > .xp-bar-cont > .bar-outer > .bar-inner {
            height:100%;
            background-color:red;
            position:relative;
            text-align:left;
            filter:saturate(2);
            background-color: var(--blue);
        }

        .dragonrip-xp-info-box > .xp-bar-cont > .bar-outer:after,
        .dragonrip-combat-info-box > .xp-bar-cont > .bar-outer:after {
            content: '';
            position: absolute;
            width:100%;
            height:100%;
            box-shadow: inset 0px 0px 1px 1px rgba(0, 0, 0, 0.9);
            z-index:1;
        }

         /* XP bar progress percent inside the bar */
        .dragonrip-xp-info-box > .xp-bar-cont > .bar-outer > .progress,
        .dragonrip-combat-info-box > .xp-bar-cont > .bar-outer > .progress {
            position: absolute;
            height: 100%;
            z-index: 2;
            font-size: 0.9em;
            padding: 0px 0px 0px 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: consolas, monospace;
            text-shadow: 
                0px 0px 3px black,
                0px 0px 3px black,
                0px 0px 3px black,
                0px 0px 3px black,
                0px 0px 3px black,
                0px 0px 3px black,
                0px 0px 3px black
            ;
        }


        .dragonrip-combat-info-box {
        
        }

        .dragonrip-combat-info-box > .xp-info {
            display:flex;
            align-items: start;
            justify-content: center;
            margin:5px;
            font-size:0.9em;
        }

        .dragonrip-combat-info-box > .xp-info > .box {
            border-radius:3px;
            display:flex;
            align-items: start;
            justify-content: start;
            padding:5px;
            margin:5px 5px 0px 5px;
            background-color:rgba(0,0,0,0.5);
            border: 2px solid rgb(60, 60, 60);
            box-shadow:5px 5px 5px 0px rgba(0, 0, 0, 0.5);
        }

        .dragonrip-combat-info-box > .xp-info > .box > .label {
            color:grey;
            padding-right:5px;
        }

        .dragonrip-combat-info-box > .xp-info > .box > .num {
            xcolor: grey;
        }
    }
    `;

    const compactBasicInfoCss = `
        body > .veik > *:nth-child(4) {
            xborder:1px solid lime;
        }

        /* Character avatar on character page */
        body > .veik > *:nth-child(4) > tbody > tr > td:nth-child(3) {
            xborder:1px solid red;
            width:50px!important;
            height:50px!important;
        }
    `;

    const removeVanillaElementsCss = `
        body > .veik > table#pirki > tbody > tr > td#pirki > img,
        body > .veik > table#pirki > tbody > tr > td#pirki > div.levelio,
        body > .veik > table#pirki > tbody > tr > td#pirki > text
        {
            border:1px solid lime!important;
            display:none;
        }

    `;

    // https://dragonrip.fandom.com/wiki/Experience
    // Level: Experience Required from Previous Level
    const experiences={0:0,1:100,2:300,3:550,4:800,5:1100,6:1450,7:1800,8:2200,9:2700,10:3300,11:4e3,12:4800,13:6e3,14:7500,15:9200,16:11e3,17:13e3,18:15500,19:18e3,20:21e3,21:24500,22:28e3,23:32e3,24:37e3,25:42e3,26:48e3,27:55e3,28:62e3,29:69e3,30:77e3,31:85e3,32:94e3,33:103e3,34:112e3,35:122e3,36:132e3,37:143e3,38:155e3,39:167e3,40:18e4,41:195e3,42:21e4,43:225e3,44:242e3,45:26e4,46:28e4,47:3e5,48:325e3,49:35e4,50:4e5,51:5e5,52:55e4,53:6e5,54:65e4,55:7e5,56:76e4,57:82e4,58:88e4,59:95e4,60:102e4,61:11e5,62:118e4,63:127e4,64:136e4,65:145e4,66:155e4,67:167e4,68:18e5,69:2e6,70:22e5,71:24e5,72:26e5,73:28e5,74:3e6,75:32e5,76:34e5,77:36e5,78:38e5,79:4e6,80:44e5,81:48e5,82:52e5,83:56e5,84:6e6,85:64e5,86:68e5,87:72e5,88:76e5,89:8e6,90:88e5,91:96e5,92:104e5,93:112e5,94:12e6,95:128e5,96:136e5,97:144e5,98:152e5,99:16e6,100:172e5,101:184e5,102:196e5,103:208e5,104:22e6,105:232e5,106:244e5,107:256e5,108:268e5,109:28e6,110:298e5,111:316e5,112:334e5,113:352e5,114:37e6,115:388e5,116:406e5,117:424e5,118:442e5,119:46e6,120:484e5,121:508e5,122:532e5,123:556e5,124:58e6,125:604e5,126:628e5,127:652e5,128:676e5,129:7e7,130:73e6,131:76e6,132:79e6,133:82e6,134:85e6,135:88e6,136:91e6,137:94e6,138:97e6,139:1e8,140:104e6,141:108e6,142:112e6,143:116e6,144:12e7,145:124e6,146:128e6,147:132e6,148:136e6,149:14e7,150:146e6};



    const log = console.log;

    // Check if character page is open by inspecting the current url address
    const characterPageOpen = () => {
        let pageOpen = false;

        const currentUrl = document.location.href;
        if (currentUrl.includes('https://dragonrip.com/game/who.php')) {
            pageOpen = true;
        }

        return pageOpen;
    }



    // Number with commas function by Elias Zamaria
    // Source: https://stackoverflow.com/a/2901298
    const numberWithCommas = x => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const getSkillElems = () => {
        log("char page is open, creating xp stuff...");

        //each skill row has 3 skills
        const skillElems = [];
        //const skillElemRows = document.querySelectorAll('body > .veik > table:nth-child(6) > tbody > tr');
        const tables = document.querySelectorAll('body > .veik > table#pirki');
        const skillElemRows = tables[2].querySelectorAll('tbody > tr')

        //log(tables)

        // Add individual skill elems to array
        for (const row of skillElemRows) {
            const skillsInRow = row.querySelectorAll('td');

            for (const skillElem of skillsInRow) {
                skillElems.push(skillElem);
            }
   
        }

        //log(skillElems);
        return skillElems;
    }

    // Create data row with label (key) and value
    const createInfoRow = (rowClassName, labelStr, labelValue) => {
        const elem = document.createElement('div');
        elem.classList.add('row');
        elem.classList.add(rowClassName);

        const label = document.createElement('div');
        label.classList.add('label');
        label.innerText = labelStr;
        elem.append(label);

        const num = document.createElement('div');
        num.classList.add('num');
        num.innerText = labelValue;
        elem.append(num);

        return elem;
    }

    const createXpBar = progress => {
        const elem = document.createElement('div');
        elem.classList.add('xp-bar-cont');

        const barOuter = document.createElement('div');
        barOuter.classList.add('bar-outer');

        const barInner = document.createElement('div');
        barInner.classList.add('bar-inner');
        barInner.style.width = progress;

        const progressNum = document.createElement('div');
        progressNum.classList.add('progress');
        progressNum.innerText = `${progress.replace('%', ' %')}`;
        //progressNum.style.left = progress;

        barOuter.append(progressNum);
        barOuter.append(barInner);
        elem.append(barOuter);
        return elem;
    }

    const calcTotalXp = (level, xpToLevel, skillName) => {
        let totalXp = 0;
        level = parseInt(level);

        for (let i=0; i < level; i++) {
            totalXp += experiences[i]; 
        }

        // Calc the current level's xp gained
        totalXp +=  experiences[level] - xpToLevel;

        if (totalXp < 0) {
            totalXp = 0;
        }

        //log(`[${skillName}] level: ${level}, totalXp: ${totalXp}`)
        return totalXp;
    }

    const createElems = elems => {
        for (const skillElem of elems) {

            // Get data from skill elements child nodes
            // Child node elements are: skill image, skill level, skill xp bar
            const childNodes = skillElem.childNodes;
            //log(childNodes)

            let skillName = childNodes[0].getAttribute('title');
            skillName = skillName.replace(' Level', '');

            const skillImageUrl = childNodes[0].getAttribute('src');

            let xpLeft = childNodes[2].getAttribute('title');
            xpLeft = xpLeft.replace('XP left: ', '');
            xpLeft = parseInt(xpLeft); 

      
    
            const barPercent = childNodes[2].querySelector('.levelio2').style.width;
            const skillLevel = childNodes[1].nodeValue.trim();
            const totalXp = calcTotalXp(skillLevel, xpLeft, skillName);

            const progress = barPercent.replace('%', '');

            //log(totalXp)

            const skill = {
                name: skillName,
                level: skillLevel,
                imageUrl: skillImageUrl,
                xpLeft: xpLeft,
                totalXp: totalXp,
                progress: progress,

          
            }

            //log(`(skill object), name: ${skill.name}, level: ${skill.level}, imageUrl: ${skill.imageUrl}, xpLeft: ${skill.xpLeft}, progress: ${skill.progress}`,);

            // Insert custom elements inside skill item
            const info = document.createElement('div');
            info.classList.add('dragonrip-xp-info-box');

            //createInfoRow(rowClassName, labelStr, labelValue);
            const skillNameElem = createInfoRow('skill-name', "", `${skill.name}`);

            const skillLevelElem = document.createElement('div');
            skillLevelElem.classList.add('skill-level');
            skillLevelElem.innerText = skill.level;
            skillNameElem.prepend(skillLevelElem);

            const xpToLevelElem = createInfoRow('xp-left', "To level:", numberWithCommas(skill.xpLeft));
            const totalXpElem = createInfoRow('total-xp', "XP:", numberWithCommas(skill.totalXp));
            const progressElem = createInfoRow('progress', "", skill.progress);
           
            const image = document.createElement('img');
            image.classList.add('skill-image');
            image.src = skill.imageUrl;
            skillNameElem.prepend(image);

            const barElem = createXpBar(`${skill.progress}%`);

            info.append(skillNameElem);
            info.append(barElem);
            info.append(totalXpElem);
            info.append(xpToLevelElem);
            //info.append(progressElem);


            // Remove vanilla skill level text
            if (settings.removeVanillaElements) {
                skillElem.innerText = "";
            }

            skillElem.append(info);
        }
    }


    const combatXpBar = () => {
        const tables = document.querySelectorAll('body > .veik > table#pirki');
        //log(tables)

        // Get combat level from the element in the character page
        const combatLevel = parseInt(tables[0].querySelectorAll('tbody > tr > td')[1].querySelector('span > b').innerText);
        

        const combatXpElem = tables[1];
        combatXpElem.style.border = '1px solid lime';

        let xpLeft = tables[1].querySelector('tbody > tr > td > div.levelio').getAttribute('title');
        xpLeft = xpLeft.replace('XP left: ', '');
        xpLeft = parseInt(xpLeft); 

        let progress = tables[1].querySelector('tbody > tr > td > div.levelio > div.levelio2').style.width;

        const totalXp = calcTotalXp(combatLevel, xpLeft, 'Combat') 


       

        const data = {
            level: combatLevel,
            xpLeft: xpLeft,
            totalXp: totalXp,
            progress: progress
        }

        log(`[data object] level: ${data.level}, xpLeft: ${data.xpLeft}, totalXp: ${data.totalXp}, progress: ${data.progress} %`);



        const combatInfo = document.createElement('div');
        combatInfo.classList.add('dragonrip-combat-info-box');

        const barElem = createXpBar(`${data.progress}`);

        const xpInfo = document.createElement('div');
        xpInfo.classList.add('xp-info');

        // Create box for total xp
        const totalXpCont = document.createElement('div');
        totalXpCont.classList.add('box');
        totalXpCont.classList.add('total-xp');

        const totalXpLabel = document.createElement('div');
        totalXpLabel.classList.add('label');
        totalXpLabel.innerText = 'Combat XP: ';
        totalXpCont.append(totalXpLabel);

        const totalXpNum = document.createElement('div');
        totalXpNum.classList.add('num');
        totalXpNum.innerText = numberWithCommas(data.totalXp);
        totalXpCont.append(totalXpNum);

        
        // Create box for XP to level
        const xpToLevelCont = document.createElement('div');
        xpToLevelCont.classList.add('box');
        xpToLevelCont.classList.add('xp-to-level');

        const xpToLevelLabel = document.createElement('div');
        xpToLevelLabel.classList.add('label');
        xpToLevelLabel.innerText = 'XP to level: ';
        xpToLevelCont.append(xpToLevelLabel);

        const xpToLevelNum = document.createElement('div');
        xpToLevelNum.classList.add('num');
        xpToLevelNum.innerText = numberWithCommas(data.xpLeft);
        xpToLevelCont.append(xpToLevelNum);

        xpInfo.append(totalXpCont);
        xpInfo.append(xpToLevelCont);
        combatInfo.append(xpInfo);
        combatInfo.append(barElem);
        combatXpElem.after(combatInfo);

        combatXpElem.remove();
    }
    

    const setCustomCss = str => {
        const styleElem = document.createElement("style");
        styleElem.textContent = str;
        document.body.appendChild(styleElem);
    }

    // Wait for game UI to load, then insert elements
    const waitForUI = () => {
        const checkElem = setInterval( () => {
            if (document.querySelector('ul.navbar') !== null) {
                clearInterval(checkElem); 

                if ( characterPageOpen() ) {
                    setCustomCss(mainCss); 
                    if (settings.compactBasicInfo) {
                        setCustomCss(compactBasicInfoCss);
                    }

                    // Remove vanilla skill data elements
                    if (settings.removeVanillaElements) {
                        setCustomCss(removeVanillaElementsCss);
                    }


                    const skillElems = getSkillElems();

                    createElems(skillElems);
                    combatXpBar();
                }
              
               
            }
        }, 5);
    }




    waitForUI();

})();
