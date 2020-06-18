# GoAnimate Wrapper
This is an API wrapper for GoAnimate's Legacy Video Maker, which had been retired on *19th December 2019, 03:10 UTC*.	Unlike other services that attempt to sole the same problem, this project allows the LVM to access data peristence and is very portable.  Please keep in mind that not all features designed to run on the original API work properly.
## How to Use
To access this service, install [Node.JS](https://nodejs.org/en/) then clone/download this project.	Once done, unzip the folder, copy the path, and execute the following commands in your command prompt (where `{PATH}` is the folder path you copied):
```console
cd "{PATH}\GoAnimate-Wrapper-master"
npm install
npm start
```
**When done, go to your web browser and navigate to `localhost`.**

## How To Change 'Heavy' or 'Kid' Outfits on the Character Creator
*Written verbatim by CaptainArgonut24, as of `2020-03-25`*

### Intro:

If your using the business friendly character creator and you want to change the outfits of the "heavy" and or the "kid", here is how you do it:

### Steps:

1. Make the character normally. It will allow you to do everything but change the outfits
2. Save it and go to the “_SAVED” file and find the number where the character file is saved.
3. Download a xml editor and change the id’s of (GoHands,GoFeet,GoLower,GoUpper,
    GoBehindBody) to what you want it to be. Takes will some trial and error to get to what you
    want it to be. Use the video maker to  view each update.
4. Change the colour in [https://www.google.com/search?q=hex+color&rlz=1C1CHBD_enCA886CA886&oq=hex&aqs=chrome.1.69i57j69i59j0l6.3320j0j7&sourceid=chrome&ie=UTF-8](hex code) in the colour area.


*Refer to the regular Business Guy CC for changing the id’s. Just change the 1 at the beginning to the number of the character. (Ex: change 1 to a 3 for heavy) might not be 100% exact but pretty close. Just going up 1 or down 1 until you find what you're looking for*

Example:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<cc_char headdy="0" headdx="0" hyscale="1.4" hxscale="1.4" yscale="0.7" xscale="0.7">
<color r="ccSkinColor">0xE2C294</color>
<color r="ccEyeLib">0xBD8764</color>
<color r="ccMouthLip">0xA63636</color>
<color r="ccBackMajor">0x996600</color>
<color r="ccHairMajor">0x000000</color>
<color r="ccEyebrow">0x000000</color>
<color r="ccLowerMainA">0x080c52</color>
<color r="ccUpperMain">0x46946f</color>
<component yscale="1" xscale="1" rotation="0" offset="0" y="0" x="0" theme_id="business" component_id="heavy" type="bodyshape"/>
<component yscale="1" xscale="1" rotation="0" offset="0" y="0" x="0" theme_id="business" component_id="heavy" type="freeaction"/>
<component yscale="1" xscale="1" rotation="0" offset="0" y="0" x="0" theme_id="business" component_id="1012" type="faceshape" split="N"/>
<component yscale="1" xscale="1" rotation="0" offset="0" y="0" x="0" theme_id="business" component_id="1009" type="nose"/>
<component yscale="1" xscale="1" rotation="0" offset="0" y="0" x="0" theme_id="business" component_id="1040" type="hair"/>
<component yscale="1" xscale="1" rotation="0" offset="0" y="0" x="0" theme_id="business" component_id="1018" type="mouth"/>
<component yscale="1" xscale="1" rotation="0" offset="0" y="0" x="0" theme_id="business" component_id="1004" type="ear"/>
<component yscale="1" xscale="1" rotation="0" offset="0" y="0" x="0" theme_id="business" component_id="1003" type="eye" split="N"/>
<component yscale="1" xscale="1" rotation="0" offset="0" y="0" x="0" theme_id="business" component_id="1020" type="eyebrow" split="N"/>
<component yscale="1" xscale="1" rotation="0" offset="0" y="0" x="0" theme_id="business" component_id="1012" type="glasses" split="N"/>
<component yscale="1" xscale="1" rotation="0" offset="0" y="0" x="0" theme_id="business" component_id="1008" type="facedecoration" id="ID5161"/>
<component yscale="1" xscale="1" rotation="0" offset="0" y="0" x="0" theme_id="business" component_id="1035" type="facedecoration" split="N" id="ID8089"/>
<library theme_id="business" component_id="3001" type="GoHands"/>
<library theme_id="business" component_id="1001" type="GoBehindBody"/>
<library theme_id="business" component_id="3019" type="GoUpper"/>
<library theme_id="business" component_id="3046" type="GoLower"/>
<library theme_id="business" component_id="3002" type="GoFeet"/>
</cc_char>
 ```
