<img width="1786" alt="Screen Shot 2024-02-20 at 2 00 43 PM" src="https://github.com/hzla/Dynamic-Calc/assets/5680299/1f8cb136-dfb7-4482-88fc-98ba0b0a458b">

# Dynamic Calc
A showdown calculator fork with dynamic data source loading and expanded features for nuzlockes

## Features for Nuzlockers
  
### Imported Set Preview
<img width="854" alt="Screen Shot 2024-02-20 at 2 03 36 PM" src="https://github.com/hzla/Dynamic-Calc/assets/5680299/cccd0ce2-342e-46e4-8d5b-081b0b0a4920">

All imported sets are treated as your box and can be clicked to be quickly loaded into the left side of the calc

### Enemy Trainer Team Preview
<img width="885" alt="Screen Shot 2024-02-20 at 2 04 29 PM" src="https://github.com/hzla/Dynamic-Calc/assets/5680299/5cb031cb-4859-4acc-a9c3-4c3fe5168abe">

Enemy Trainers have their teams shown on the right side and can be clicked to load into the right side of the calc.

### Switchin Bait Order Preview (Gen 4-9)
On supported games next pokemon to be switched in will always be the left most pokemon in the preview. For gen 4, you will need to make sure you current HP is accurate for full accuracy. In addition, in gen 4, some moves with unconventional damage calculations like grass knot may cause switchin in preview errors. 

### Automatic PKHex move import adjusting
For all games in the romhack dropdown, pkhex imported movesets are autocorrected to the correct moves in game. 

### Hotkeys for common actions

`f` - toggle "F"ield info

`i` - "I"mports set data from clipboard

`c` - toggle all opposing moves "C"rit

`l` - toggle "L"earnset window if available


## Features for Rom Hack Developers

### Load data for any Rom Hack
Host your romhack's data on npoint.io and specify the npoint ID in the url to load it into Dynamic Calc. Example data can be seen [here](https://www.npoint.io/docs/9aa37533b7c000992d92).
Move/Pokemon/Item names use Smogon showdown format and spellings. 

Trainer set names are specified with the following Format `Lvl LEVEL TRAINER_NAME `

### Customize your calc with URL parameters

`data` the npoint data source for your calc
`gen` the movepool and species pool to draw from for your calc
`dmgGen` the damage calc mechanics generation to use
`types` the type chart generation to use

### Easy Calc data generation with Pokeweb (Gen 5)
Generate the data in one click with [Pokeweb](https://github.com/hzla/Pokeweb-Live) for Gen 4/5 only. Use pokeweb-live `prod-g4` branch for gen 4. Use [this](https://github.com/hzla/pk3ds_for_dynamic_calc) for gen 6/7.




