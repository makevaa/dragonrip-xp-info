// ==UserScript==
// @name         Dragonrip XP Info
// @namespace    http://tampermonkey.net/
// @version      1.0.15
// @description  View skill xp data on character page in Dragonrip
// @author       paxu
// @match         *://*.dragonrip.com/*
// @icon         https://i.imgur.com/Vn0ku7D.png
// @grant        none
// @license      GPLv3 
// ==/UserScript==


(() => {
    'use strict';


    /*
    2025-08-05: yomismon kanssa keskustelut discordissa:
    eli xp-hommeleissa on bugeja. Aikaisemmin ajattelin että ei voi olla lvl 0, mutta dragonripissä jotkut skillit alkaa levelistä 0, toiset levelistä 1.
    Toinen juttu oli, että kuulemma wikissä (mistä otin datan) voi olla virheitä lvl 50 jälkeen. Ja jos on, niin kaikki loput levelit pilaantuu, virhe kaiketi kasaantuu. Tämä homma laitetaan muhittelemaan.
    */

    const settings = {
        compactBasicInfo:true, // Make basic character info elements compact by reducing size
        removeVanillaElements:true, // Remove game's vanilla skill info on character page
        customPlayerInfo: true, // Create custom player info box (name, clan, combat level etc.)
        showPlayerId: true,
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
            --blue: #2259b7;
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
            position:relative;
            xtext-align:left;
            xfilter:saturate(2);
            background-color: var(--blue);
            xbackground-color: #2259b7 ;
        }

        /* The big combat xp bar */
        .dragonrip-combat-info-box > .xp-bar-cont > .bar-outer > .bar-inner {
            background-color: rgba(63, 0, 165, 1);
            background-color: #1a4185ff ;
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
            xborder:1px solid grey;
            font-family: consolas, monospace;
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
        body > .veik {
            xdisplay:flex;
        }

        /* the br elements the game's designer has used in the layout */
        body > .veik > br {
            display: none !important;
            visibility: hidden !important;
        }

        body > .veik > *:nth-child(4) {
            xborder:1px solid lime;
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

    const customPlayerInfoCss = `
        #custom-player-info {
            border: 1px solid rgba(54, 54, 54, 1);
            border-radius:5px;
            display: flex;
            xflex-direction: column;
            align-items: center;
            justify-content: center;
            width:95%;
            min-width:300px;
            height:120px;
            background-color: rgba(0, 0, 0, 0.3);
            margin: 0px auto 5px auto;
            font-family: consolas, monospace, Courier New;
            padding: 5px 0px;
            /* border simple https://i.imgur.com/c7Oeu0F.png'  */
            /* border ornamental https://i.imgur.com/j7xNFLn.png  */
            border-image-source: url('https://i.imgur.com/j7xNFLn.png');
            border-image-slice: 150;
            border-image-width: 3em;
            border-image-outset: 0;
            border-image-repeat: repeat;
            box-shadow: 5px 5px 5px 0px rgba(0, 0, 0, 0.6), inset 0px 0px 10px 10px rgba(0, 0, 0, 0.8);

            xborder-radius: 100px;

            background-image: url('https://i.imgur.com/vjJ8ugC.jpeg');
            background-size:contain;

            xoutline: 5px solid grey;
 
        }
        
        #custom-player-info > .avatar-cont {
            overflow:hidden;
            height:100%;
            aspect-ratio:1/1;
            display: flex;
            align-items: center;
            justify-content: center;
        
     
        }

        #custom-player-info > .avatar-cont > .avatar {
            xborder:1px solid grey;
            width:80%;
            height:80%;
            background-size: cover;
            background-repeat: no-repeat;
            border: 4px ridge rgba(61, 61, 61, 1);
            border-radius:5px;
            background-color: rgba(22, 22, 22, 1);

            box-shadow: inset 0px 0px 5px 5px rgba(0,0,0, 0.5), 5px 5px 5px rgba(0,0,0, 0.5);

            /*
            border-image-source: url('https://i.imgur.com/c7Oeu0F.png');
            border-image-slice: 150;
            border-image-width: 3em;
            border-image-outset: 0;
            border-image-repeat: round;
           
            */
        }


        #custom-player-info > .info {
            xborder:1px solid grey;
            display:flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height:100%;
            width:40%;
            xflex: 1;
            padding:5px;
            filter: brightness(0.9);
            
            text-shadow: 
                0px 0px 10px rgba(0,0,0, 1.0),
                0px 0px 10px rgba(0,0,0, 1.0),
                0px 0px 10px rgba(0,0,0, 1.0),
                0px 0px 10px rgba(0,0,0, 1.0),
                0px 0px 10px rgba(0,0,0, 1.0) !important;
        }

        #custom-player-info > .info > .item {
            xborder:1px solid grey;
            display:flex;
            align-items: center;
            justify-content: center;
            width:100%;
            padding:3px;
            height:25%;
            xbackground-color: rgba(0,0,0, 0.5);
        }   

        #custom-player-info > .info > .name-cont {
           xfont-family: Garamond;
           xfont-size: 1.2em;
           xfont-weight:bold;

        } 
        
        #custom-player-info > .info > .name-cont > .title {
           margin-right: 5px;
           text-shadow: 
                0px 0px 10px rgba(0,0,0, 1.0),
                0px 0px 10px rgba(0,0,0, 1.0),
                0px 0px 10px rgba(0,0,0, 1.0),
                0px 0px 10px rgba(0,0,0, 1.0),
                0px 0px 10px rgba(0,0,0, 1.0) !important;
        }  

        #custom-player-info > .info > .clan {
           font-style: italic;
        }  

        #custom-player-info > .info > .clan:hover{
           filter: brightness(1.2);
        }  

        #custom-player-info > .info > .item.levels-cont {
            xborder:1px solid grey;
            display:flex;
            align-items:center;
            justify-content: center;
            width:100%;
       
        }

        #custom-player-info > .info > .item.levels-cont > .item {
            xborder:1px solid grey;
            display:flex;
            align-items:center;
            justify-content:center;
        }

        #custom-player-info > .info > .item.levels-cont > .item.combat-level {
            margin-right:20px;
        }

        #custom-player-info > .info > .item.levels-cont > .item > .icon {
            height: 20px;
            aspect-ratio: 1/1;
            xborder:1px solid red;
            margin-right:10px;
        }

        #custom-player-info > .info > .item.levels-cont > .item > .num {
            font-size: 1.3em;
        }
    
        #copy-player-id-button, #copy-clan-data-button {
            border: 2px double grey !important;
            border-radius: 5px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 5px;
            width: 20%;
            height: 80%;
            text-align: center;
            justify-self: end;
            background-color: rgba(0, 0, 0, 0.5);
            color: grey;
        }

        #copy-player-id-button {
            
        }

        .copy-button:hover {
            background-color: rgba(0, 0, 0, 0.8);
        }
        
        .copy-button:active {

        }
         
          
    
    `

    // https://dragonrip.fandom.com/wiki/Experience
    // Level: Experience Required from Previous Level
    const experiences={0:0,1:100,2:300,3:550,4:800,5:1100,6:1450,7:1800,8:2200,9:2700,10:3300,11:4e3,12:4800,13:6e3,14:7500,15:9200,16:11e3,17:13e3,18:15500,19:18e3,20:21e3,21:24500,22:28e3,23:32e3,24:37e3,25:42e3,26:48e3,27:55e3,28:62e3,29:69e3,30:77e3,31:85e3,32:94e3,33:103e3,34:112e3,35:122e3,36:132e3,37:143e3,38:155e3,39:167e3,40:18e4,41:195e3,42:21e4,43:225e3,44:242e3,45:26e4,46:28e4,47:3e5,48:325e3,49:35e4,50:4e5,51:5e5,52:55e4,53:6e5,54:65e4,55:7e5,56:76e4,57:82e4,58:88e4,59:95e4,60:102e4,61:11e5,62:118e4,63:127e4,64:136e4,65:145e4,66:155e4,67:167e4,68:18e5,69:2e6,70:22e5,71:24e5,72:26e5,73:28e5,74:3e6,75:32e5,76:34e5,77:36e5,78:38e5,79:4e6,80:44e5,81:48e5,82:52e5,83:56e5,84:6e6,85:64e5,86:68e5,87:72e5,88:76e5,89:8e6,90:88e5,91:96e5,92:104e5,93:112e5,94:12e6,95:128e5,96:136e5,97:144e5,98:152e5,99:16e6,100:172e5,101:184e5,102:196e5,103:208e5,104:22e6,105:232e5,106:244e5,107:256e5,108:268e5,109:28e6,110:298e5,111:316e5,112:334e5,113:352e5,114:37e6,115:388e5,116:406e5,117:424e5,118:442e5,119:46e6,120:484e5,121:508e5,122:532e5,123:556e5,124:58e6,125:604e5,126:628e5,127:652e5,128:676e5,129:7e7,130:73e6,131:76e6,132:79e6,133:82e6,134:85e6,135:88e6,136:91e6,137:94e6,138:97e6,139:1e8,140:104e6,141:108e6,142:112e6,143:116e6,144:12e7,145:124e6,146:128e6,147:132e6,148:136e6,149:14e7,150:146e6};



    const log = str => {
        console.log(`[Dragonrip XP Info]: ${str}`);
    }

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
        const tableNodes = document.querySelectorAll('body > .veik > table#pirki');
        const tables = Array.from(tableNodes);
        log(tables)

        // Check if Christmas event snowball "throw" and "hits" element row exists, remove from array if found
        const firstRowSnowballElem = tables[0].querySelector('tbody > tr > td > div');
        if (firstRowSnowballElem.classList.contains('juod')) {
            log("snowball row found, removing from rows...");
            tables.shift();
        }

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
        barInner.style.width = `${progress}`;

        const progressNum = document.createElement('div');
        progressNum.classList.add('progress');
        progressNum.innerText = `${progress.replace('%', ' %')}`;
        //progressNum.style.left = progress;

        barOuter.append(progressNum);
        barOuter.append(barInner);
        elem.append(barOuter);
        return elem;
    }


    const calcTotalXp = (level, xpToLevel) => {
        let totalXp = 0;
        level = parseInt(level);

        for (let i=0; i<level; i++) {
            totalXp += experiences[i]; 
        }

        // Calc the current level's xp gained
        totalXp += experiences[level] - xpToLevel;

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
        const tableNodes = document.querySelectorAll('body > .veik > table#pirki');
        const tables = Array.from(tableNodes);
     
        
        // Check if Christmas event snowball "throw" and "hits" element row exists, remove from array if found
        const firstRowSnowballElem = tables[0].querySelector('tbody > tr > td > div');
        if (firstRowSnowballElem.classList.contains('juod')) {
            log("snowball row found, removing from rows...");
            tables.shift();
        }

        // Get combat level from the element in the character page
        const combatLevel = parseInt(tables[0].querySelectorAll('tbody > tr > td')[1].querySelector('span > b').innerText);
        

        const combatXpElem = tables[1];
        //combatXpElem.style.border = '1px solid lime';

        let xpLeft = tables[1].querySelector('tbody > tr > td > div.levelio').getAttribute('title');
        xpLeft = xpLeft.replace('XP left: ', '');
        xpLeft = parseInt(xpLeft); 

        let progress = tables[1].querySelector('tbody > tr > td > div.levelio > div.levelio2').style.width;
        //log(`combat xp bar progress: ${progress}`)

        const totalXp = calcTotalXp(combatLevel, xpLeft, 'Combat') 


       

        const data = {
            level: combatLevel,
            xpLeft: xpLeft,
            totalXp: totalXp,
            progress: progress
        }

        //log(`[data object] level: ${data.level}, xpLeft: ${data.xpLeft}, totalXp: ${data.totalXp}, progress: ${data.progress} %`);



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

    /* Read player name, title, clan etc. from vanilla game elements */
    const getPlayerData = () => {
        
        // Basic info is the title, name, faction, clan and their applies styles (colors etc.) 
        const playerBasicInfoElem = document.querySelector('  body > .veik > *:nth-child(2)')
  
        const playerBasicInfo = playerBasicInfoElem.childNodes;
        //log(playerBasicInfo)
        const playerTitle = playerBasicInfo[0].innerText;
        const titleStyle = playerBasicInfo[0].getAttribute('style');
        const playerName = playerBasicInfo[1].textContent.replace('"', '').trim();
        const factionName = playerBasicInfo[3].innerText;
        const factionStyle = playerBasicInfo[3].getAttribute('style');

        log(playerBasicInfo.length)

        // If player is in clan, the playerBasicInfo length is longer
        let clanName = '<player not in clan>';
        let clanStyle = 'color:grey;';
        let clanUrl = '';

        if (playerBasicInfo.length > 4) {
            clanName = playerBasicInfo[5].querySelector('span > i').innerText;
            clanStyle = playerBasicInfo[5].querySelector('span').getAttribute('style');;
            clanUrl = playerBasicInfo[5].getAttribute('href');
        }


   
        const playerCombatLevel = document.querySelector('  body > .veik > *:nth-child(4) > tbody > tr > *:nth-child(2) > span > b ').innerText;

        const combatLevelStyle = document.querySelector('  body > .veik > *:nth-child(4) > tbody > tr > *:nth-child(2) > span').getAttribute('style');;

        const playerAvatarUrl = document.querySelector('  body > .veik > *:nth-child(4) > tbody > tr > *:nth-child(3) > .gru > img ').getAttribute('src');

        const playerAchiPoints = document.querySelector('  body > .veik > *:nth-child(4) > tbody > tr > *:nth-child(4) > span > b ').innerText;

        const achiPointsStyle = document.querySelector('  body > .veik > *:nth-child(4) > tbody > tr > *:nth-child(4) > span').getAttribute('style');


        const data = {
            playerTitle: playerTitle,
            titleStyle: titleStyle,
            playerName: playerName,
            factionName: factionName,
            factionStyle: factionStyle,
            clanName: clanName,
            clanStyle: clanStyle,
            clanUrl: clanUrl,
            combatLevel: playerCombatLevel,
            combatLevelStyle: combatLevelStyle,
            avatarUrl: playerAvatarUrl,
            achiPoints: playerAchiPoints,
            achiPointsStyle: achiPointsStyle,
        }

        //log(data)
        return data;
    }


    // Read clan data from clan page
    const getClanData = () => {
        const box = document.querySelector('body > .veik > .riped');
        const infoArr = box.innerText.split('\n');
        const clanFaction = infoArr[0].trim(); 
        const clanName = infoArr[1].trim();
 
        const data = {
            clanName: clanName,
            clanFaction: clanFaction,
        }

        return data;
    }

    const createCustomPlayerInfoArea = () => {
        const data = getPlayerData();
        log(data)

        const elem = document.createElement('div');
        elem.id = 'custom-player-info';

        // Player avatar
        const avatarCont = document.createElement('div');
        avatarCont.classList.add('avatar-cont');

        const avatar =  document.createElement('div');
        avatar.classList.add('avatar');
        //avatar.src = `${data.avatarUrl}`;
        avatar.style.backgroundImage = `url(${data.avatarUrl})`;
        avatarCont.append(avatar);

        // Container for player info
        const info =  document.createElement('div');
        info.classList.add('info');

        // Container for player title and name
        const nameCont = document.createElement('div');
        nameCont.classList.add('item');
        nameCont.classList.add('name-cont');

        // Player title
        const title = document.createElement('div');
        title.classList.add('title');
        title.innerText = data.playerTitle;
        title.style = data.titleStyle;
        nameCont.append(title);

        // Player name
        const name = document.createElement('div');
        name.classList.add('name');
        name.innerText = data.playerName;
        nameCont.append(name);
        info.append(nameCont);


        // Player faction
        const faction = document.createElement('div');
        faction.classList.add('item');
        faction.classList.add('faction');
        faction.innerText = data.factionName;
        faction.style = data.factionStyle;
        info.append(faction);

        // Player clan
        const clan = document.createElement('a');
        clan.classList.add('item');
        clan.classList.add('clan');
        clan.innerText = data.clanName;
        clan.style = data.clanStyle;
        clan.setAttribute('href', data.clanUrl);
        info.append(clan);


        // Player combat level and achievement points row
        const levelsCont = document.createElement('div');
        levelsCont.classList.add('item');
        levelsCont.classList.add('levels-cont');


        // Container for combat icon and combat level
        const combatLevelCont = document.createElement('div');
        combatLevelCont.classList.add('item');
        combatLevelCont.classList.add('combat-level');

        // Combat icon
        const combatIcon = document.createElement('img');
        combatIcon.classList.add('icon');
        combatIcon.src = '/game/images/icons/kova.png';
        combatLevelCont.append(combatIcon);

        // Combat level number
        const combatLevel = document.createElement('div');
        combatLevel.classList.add('num');
        combatLevel.innerText = data.combatLevel;
        combatLevel.style = data.combatLevelStyle;
        combatLevelCont.append(combatLevel);

        levelsCont.append(combatLevelCont);
      

        // Container for achievement icon and achievement points
        const achiCont = document.createElement('div');
        achiCont.classList.add('item');

        // Achievement icon
        const achiIcon = document.createElement('img');
        achiIcon.classList.add('icon');
        achiIcon.src = '/game/images/icons/achieve.png';
        achiCont.append(achiIcon);
 
        // Achievement point number
        const achiPoints = document.createElement('div');
        achiPoints.classList.add('num');
        achiPoints.innerText = data.achiPoints;
        achiPoints.style = data.achiPointsStyle;
        achiCont.append(achiPoints);

        levelsCont.append(achiCont);


        info.append(levelsCont);

        elem.append(avatarCont);
        elem.append(info);

        const target = document.querySelector('body > .veik');
  
        // Remove vanilla info elements
        if (true) {
            target.querySelector('*:nth-child(2)').remove();
            target.querySelector('*:nth-child(3)').remove();
        } 

        // Create Player name / id box, for use in player-data.js for other projects
        if (settings.showPlayerId) {
            const url = document.location.href;
            const playerId = url.replace('https://dragonrip.com/game/who.php?wr=', '')
            const playerIdStr = `${data.playerName.trim()} | ${playerId.trim()}`;
        
            const copyPlayerIdButton = document.createElement('div');
            copyPlayerIdButton.classList.add('copy-button');
            copyPlayerIdButton.id = 'copy-player-id-button';
            copyPlayerIdButton.innerText = 'Copy ID to clipboard';

            copyPlayerIdButton.addEventListener("click", (e) => {
                navigator.clipboard.writeText(playerIdStr);
                copyPlayerIdButton.innerText = `copied ${playerIdStr}`;
                copyPlayerIdButton.style.color = '#00cc00';
            });

            elem.append(copyPlayerIdButton);
        }
        target.prepend(elem);
    }


    // Create button to copy clan data on clan page, used in player-index project
    const createCopyClanIdButton = () => {
        log("on clan page");

        const data =  getClanData();

        const url = document.location.href;
        const clanId = url.replace('https://dragonrip.com/game/clanm.php?wr=', '');

        let factionIndex = 0;
        if (data.clanFaction === "Legion of the Damned") {
            factionIndex = 1;
        }

        const clanIdStr = `${data.clanName.trim()} | ${clanId.trim()} | ${factionIndex}`;
    
        const copyClanDataButton = document.createElement('div');
        copyClanDataButton.classList.add('copy-button');
        copyClanDataButton.id = 'copy-clan-data-button';
        copyClanDataButton.innerText = 'Copy data to clipboard';

        copyClanDataButton.addEventListener("click", (e) => {
            navigator.clipboard.writeText(clanIdStr);
            copyClanDataButton.innerText = `copied ${clanIdStr}`;
            copyClanDataButton.style.color = '#00cc00';
        });

        const target = document.querySelector('body > .veik > *:nth-child(2)');

        target.append(copyClanDataButton);
        
    }
    

    const setCustomCss = str => {
        const styleElem = document.createElement("style");
        styleElem.textContent = str;
        document.body.appendChild(styleElem);
    }

    // Wait for game UI to load, then insert elements
    const waitForUI = () => {

        const currentUrl = document.location.href;
        if (currentUrl.indexOf('https://dragonrip.com/game/who.php') === -1) {
            log("not on character page, aborting...");

            if (currentUrl.indexOf('https://dragonrip.com/game/clanm.php?wr=') > -1) {
                createCopyClanIdButton();
            }

            return;
        }

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

                    if (settings.customPlayerInfo) {
                        setCustomCss(customPlayerInfoCss);
                        createCustomPlayerInfoArea();
                    }

                   
                }
              
               
            }
        }, 5);
    }




    waitForUI();

})();
