# dragonrip-visual-tweaks
![Dragonrip toolbar compact preview](https://i.imgur.com/KLC9bxv.png "Dragonrip toolbar compact preview")

README.md WIP

🐵 Tampermonkey userscript to show a shortcut toolbar for [the browser game Dragonrip](https://dragonrip.com/).
The items shown, their order, and layout can be edited in the JS file.

🍴 Available on GreasyFork: [greasyfork.org/en/scripts/532949-dragonrip-toolbar](https://greasyfork.org/en/scripts/533554-dragonrip-server-time)
## 🛠 Customizing the toolbar
To change the toolbar contents, edit the <code>toolbarItems</code> global array. 
See the <code>toolbarItems</code> in the code to see how the keywords are used to create the toolbar.

Possible keywords for toolbar items: 
- <code>home, bank, prof, shop, combat, market, quests, events, dungeon</code>
- <code>mining, smithing, jewels, fishing, hunter, herbs, cooking, crafting, alchemy, slayer, summoning, explo, woodwork, magic, beastmastery</code>
- <code>[]</code> adds an empty square slot
- <code>|</code> adds a shorter separator space


## ⚙️ Other settings
Global object <code>settings</code> has 2 properties for minor layout tweaks:
- <code>removeVanillaNavbar</code>: remove the game's vanilla navbar element
- <code>smallerVanillaTopbars</code>: make the player info and game logo boxes more compact by reducing height

## Preview
![Dragonrip toolbar preview](https://i.imgur.com/X8V0id8.png "Dragonrip toolbar preview")






