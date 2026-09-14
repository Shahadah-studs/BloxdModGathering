var sodiumIntro={};
var sodiumMode={};
var sodiumInstall={};

var CAT="SodiumClient";
var ITEM_SHADER="Shaders";
var ITEM_PERF="Performance";
var ITEM_NIGHT="NightVision";

var FONT={
S:["01110","10001","10000","01110","00001","10001","01110"],
O:["01110","10001","10001","10001","10001","10001","01110"],
D:["11110","10001","10001","10001","10001","10001","11110"],
I:["11111","00100","00100","00100","00100","00100","11111"],
U:["10001","10001","10001","10001","10001","10001","01110"],
M:["10001","11011","10101","10101","10001","10001","10001"]
};

function nrm(v){
    var l=Math.sqrt(
        v[0]*v[0]+
        v[1]*v[1]+
        v[2]*v[2]
    );

    if(!l)return [0,0,0];

    return [
        v[0]/l,
        v[1]/l,
        v[2]/l
    ];
}


function cross(a,b){

    return [

        a[1]*b[2]-
        a[2]*b[1],

        a[2]*b[0]-
        a[0]*b[2],

        a[0]*b[1]-
        a[1]*b[0]

    ];
}


/* =========================================
          HUGE GREEN PARTICLE
========================================= */

function dot(p){

    api.playParticleEffect({

        pos1:p,
        pos2:p,

        dir1:[0,0,0],
        dir2:[0,0,0],

        texture:"square_particle",

        minLifeTime:1.8,
        maxLifeTime:2.3,

        minEmitPower:0,
        maxEmitPower:0,

        minSize:0.72,
        maxSize:0.95,

        manualEmitCount:3,

        gravity:[0,0,0],

        colorGradients:[

            {
                timeFraction:0,

                minColor:[
                    40,
                    255,
                    70,
                    1
                ],

                maxColor:[
                    130,
                    255,
                    160,
                    1
                ]
            },

            {
                timeFraction:0.65,

                minColor:[
                    10,
                    255,
                    55,
                    0.95
                ],

                maxColor:[
                    75,
                    255,
                    110,
                    0.9
                ]
            },

            {
                timeFraction:1,

                minColor:[
                    0,
                    255,
                    45,
                    0
                ],

                maxColor:[
                    0,
                    255,
                    45,
                    0
                ]
            }

        ],

        velocityGradients:[

            {
                timeFraction:0,
                factor:0,
                factor2:0
            }

        ],

        blendMode:1

    });
}


/* =========================================
          GIANT SODIUM INTRO
========================================= */

function showSodium(pid){

    if(
        !api.playerIsInGame(pid)
    ){
        return false;
    }


    var f;


    try{

        f=
            api.getPlayerFacingInfo(pid);

    }catch(e){

        return false;

    }


    if(
        !f ||
        !f.camPos ||
        !f.dir
    ){

        return false;

    }


    var forward=
        nrm(f.dir);


    var right=
        nrm([

            forward[2],

            0,

            -forward[0]

        ]);


    if(

        Math.abs(right[0])+
        Math.abs(right[2])

        <

        0.01

    ){

        right=[1,0,0];

    }


    var up=
        [0,1,0];


    /*
       HUGE LOGO SETTINGS
    */

    var DIST=
        15;


    var PIX=
        0.55;


    var GAP=
        1;


    var WORD=
        "SODIUM";


    /*
       SPAWN WHERE CAMERA
       IS LOOKING
    */

    var center=[

        f.camPos[0]+
        forward[0]*DIST,

        f.camPos[1]+
        forward[1]*DIST,

        f.camPos[2]+
        forward[2]*DIST

    ];


    /*
       DON'T LET IT DROP
       ONTO THE FLOOR
    */

    if(
        center[1]
        <
        f.camPos[1]+0.5
    ){

        center[1]=
            f.camPos[1]+0.5;

    }


    var cols=

        WORD.length*5+

        (
            WORD.length-1
        )*GAP;


    var start=

        -(cols-1)*
        PIX/
        2;


    var off=0;


    for(
        var c=0;
        c<WORD.length;
        c++
    ){

        var g=
            FONT[
                WORD[c]
            ];


        for(
            var r=0;
            r<7;
            r++
        ){

            for(
                var x=0;
                x<5;
                x++
            ){

                if(
                    g[r][x]
                    !==
                    "1"
                ){

                    continue;

                }


                var h=

                    start+

                    (
                        off+x
                    )*

                    PIX;


                var v=

                    (
                        3-r
                    )*

                    PIX;


                dot([

                    center[0]+
                    right[0]*h+
                    up[0]*v,


                    center[1]+
                    right[1]*h+
                    up[1]*v,


                    center[2]+
                    right[2]*h+
                    up[2]*v

                ]);

            }
        }


        off+=
            5+
            GAP;

    }


    /*
       SODIUM STARTUP SOUND
    */

    try{

        api.playSound(
            pid,
            "trumpetFlare",
            0.9,
            1.05
        );

    }catch(e){}


    return true;
}


/* =========================================
             SAFE OPTIONS
========================================= */

function safeSet(
    pid,
    key,
    value
){

    try{

        api.setClientOption(
            pid,
            key,
            value
        );

    }catch(e){

        api.log(
            "Sodium option failed: "+
            key
        );

    }
}


function safeDefault(
    pid,
    key
){

    try{

        api.setClientOptionToDefault(
            pid,
            key
        );

    }catch(e){}

}


/* =========================================
            RESET VISUALS
========================================= */

function resetVisuals(pid){

    var options=[

        "lightingOverride",

        "ambientLightColourOverride",

        "skyLightColourOverride",

        "fogColourOverride",

        "fogChunkDistanceOverride",

        "cameraTint",

        "heldLightColourOverride",

        "heldLightRangeOverride",

        "heldLightConeAngleOverride",

        "numClosestPlayersVisible"

    ];


    for(
        var i=0;
        i<options.length;
        i++
    ){

        safeDefault(
            pid,
            options[i]
        );

    }
}


/* =========================================
            SODIUM SHADERS
========================================= */

function applyShader(pid){

    resetVisuals(pid);


    /*
       FORCE BETTER LIGHTING
    */

    safeSet(
        pid,
        "lightingOverride",
        true
    );


    /*
       DARKER SHADOW AREAS
    */

    safeSet(
        pid,
        "ambientLightColourOverride",
        "#4C5A50"
    );


    /*
       WARM SUNLIGHT
    */

    safeSet(
        pid,
        "skyLightColourOverride",
        "#FFE8C6"
    );


    /*
       BLUE ATMOSPHERE
    */

    safeSet(
        pid,
        "fogColourOverride",
        "#9BC8D8"
    );


    /*
       LONGER FOG DISTANCE
    */

    safeSet(
        pid,
        "fogChunkDistanceOverride",
        28
    );


    /*
       GREEN CINEMATIC
       COLOR GRADING
    */

    safeSet(
        pid,
        "cameraTint",
        [
            0.82,
            1,
            0.88,
            0.08
        ]
    );


    /*
       LIGHT AROUND PLAYER
    */

    safeSet(
        pid,
        "heldLightColourOverride",
        "#E8FFD8"
    );


    safeSet(
        pid,
        "heldLightRangeOverride",
        10
    );


    safeSet(
        pid,
        "heldLightConeAngleOverride",
        120
    );
}


/* =========================================
           PERFORMANCE MODE
========================================= */

function applyPerformance(pid){

    resetVisuals(pid);


    /*
       TURN EXPENSIVE
       LIGHTING OFF
    */

    safeSet(
        pid,
        "lightingOverride",
        false
    );


    /*
       LOWER VIEW DISTANCE
    */

    safeSet(
        pid,
        "fogChunkDistanceOverride",
        6
    );


    safeSet(
        pid,
        "fogColourOverride",
        "#B9C5C9"
    );


    /*
       RENDER FEWER PLAYERS
       IN HUGE LOBBIES
    */

    safeSet(
        pid,
        "numClosestPlayersVisible",
        10
    );

}


/* =========================================
              NIGHT VISION
========================================= */

function applyNight(pid){

    resetVisuals(pid);


    /*
       MAXIMUM BRIGHTNESS
       STYLE
    */

    safeSet(
        pid,
        "lightingOverride",
        true
    );


    safeSet(
        pid,
        "ambientLightColourOverride",
        "#FFFFFF"
    );


    safeSet(
        pid,
        "skyLightColourOverride",
        "#FFFFFF"
    );


    safeSet(
        pid,
        "fogColourOverride",
        "#E9FFF0"
    );


    safeSet(
        pid,
        "fogChunkDistanceOverride",
        32
    );


    safeSet(
        pid,
        "cameraTint",
        [
            0.92,
            1,
            0.94,
            0.035
        ]
    );


    /*
       HUGE PLAYER LIGHT
    */

    safeSet(
        pid,
        "heldLightColourOverride",
        "#FFFFFF"
    );


    safeSet(
        pid,
        "heldLightRangeOverride",
        16
    );


    safeSet(
        pid,
        "heldLightConeAngleOverride",
        180
    );
}


/* =========================================
            SHOP TILE HELPER
========================================= */

function setTile(
    pid,
    key,
    title,
    desc,
    button,
    selected,
    canBuy,
    colour
){

    api.updateShopItemForPlayer(

        pid,

        CAT,

        key,

        {

            customTitle:
                title,

            description:
                desc,

            buyButtonText:
                button,

            isSelected:
                selected,

            canBuy:
                canBuy,

            imageColour:
                colour

        }
    );
}


/* =========================================
              UPDATE MENU
========================================= */

function refreshTiles(pid){

    var mode=
        sodiumMode[pid]||
        "none";


    setTile(

        pid,

        ITEM_SHADER,

        mode==="shader"
        ?
        "✓ Shaders Enabled"
        :
        "✦ Shaders",

        "Enhanced lighting, atmosphere and colour grading.",

        mode==="shader"
        ?
        "DISABLE"
        :
        "ENABLE SHADERS",

        mode==="shader",

        true,

        "#55FF88"

    );


    setTile(

        pid,

        ITEM_PERF,

        mode==="performance"
        ?
        "✓ Performance Mode"
        :
        "⚡ Performance Mode",

        "Reduces lighting work and view load for smoother play.",

        mode==="performance"
        ?
        "DISABLE"
        :
        "ENABLE PERFORMANCE",

        mode==="performance",

        true,

        "#A8FF55"

    );


    setTile(

        pid,

        ITEM_NIGHT,

        mode==="night"
        ?
        "✓ Night Vision"
        :
        "☾ Night Vision",

        "Bright caves and dark areas without changing blocks.",

        mode==="night"
        ?
        "DISABLE"
        :
        "ENABLE NIGHT VISION",

        mode==="night",

        true,

        "#D8FF9B"

    );

}


/* =========================================
            SWITCH PROFILE
========================================= */

function setMode(
    pid,
    newMode
){

    var old=
        sodiumMode[pid]||
        "none";


    /*
       CLICK SAME TOOL AGAIN
       = TURN IT OFF
    */

    if(
        old===
        newMode
    ){

        sodiumMode[pid]=
            "none";


        resetVisuals(pid);


        refreshTiles(pid);


        api.sendOverShopInfo(
            pid,
            "Sodium visuals reset"
        );


        return;
    }


    sodiumMode[pid]=
        newMode;


    if(
        newMode===
        "performance"
    ){

        applyPerformance(pid);

    }


    if(
        newMode===
        "night"
    ){

        applyNight(pid);

    }


    refreshTiles(pid);


    try{

        api.playSound(
            pid,
            "levelup",
            0.7,
            1.2
        );

    }catch(e){}


    api.sendOverShopInfo(

        pid,

        newMode==="performance"
        ?
        "Performance Mode Enabled"
        :
        "Night Vision Enabled"

    );
}


/* =========================================
              CREATE SHOP
========================================= */

function setupShop(){

    api.configureShopCategory(

        CAT,

        {

            customTitle:
                "🟢 SODIUM CLIENT",

            description:
                "Visual and performance tools",

            sortPriority:
                999

        }
    );


    /*
       SHADERS
    */

    api.createShopItem(

        CAT,

        ITEM_SHADER,

        {

            image:
                "Diamond",

            imageColour:
                "#55FF88",

            cost:
                0,

            canBuy:
                true,

            customTitle:
                "✦ Shaders",

            description:
                "Enhanced lighting, atmosphere and colour grading.",

            buyButtonText:
                "ENABLE SHADERS",

            sortPriority:
                400

        }
    );


    /*
       PERFORMANCE
    */

    api.createShopItem(

        CAT,

        ITEM_PERF,

        {

            image:
                "Iron Ingot",

            imageColour:
                "#A8FF55",

            cost:
                0,

            canBuy:
                true,

            customTitle:
                "⚡ Performance Mode",

            description:
                "Reduces lighting work and view load for smoother play.",

            buyButtonText:
                "ENABLE PERFORMANCE",

            sortPriority:
                300

        }
    );


    /*
       NIGHT VISION
    */

    api.createShopItem(

        CAT,

        ITEM_NIGHT,

        {

            image:
                "Moonstone",

            imageColour:
                "#D8FF9B",

            cost:
                0,

            canBuy:
                true,

            customTitle:
                "☾ Night Vision",

            description:
                "Bright caves and dark areas without changing blocks.",

            buyButtonText:
                "ENABLE NIGHT VISION",

            sortPriority:
                200

        }
    );


    /*
       FUTURE CLIENTS
    */

    api.createShopItem(

        CAT,

        "Soon",

        {

            image:
                "Diamond",

            imageColour:
                "#777777",

            cost:
                0,

            canBuy:
                false,

            customTitle:
                "🔒 More Clients Coming Soon",

            description:
                "More Sodium tools will be added here.",

            buyButtonText:
                "COMING SOON",

            sortPriority:
                100

        }
    );
}


/* =========================================
             SHOP CLICKS
========================================= */

onPlayerBoughtShopItem=(

    pid,
    cat,
    key,
    item,
    userInput

)=>{


    if(
        cat!==
        CAT
    ){

        return;

    }


    /*
       SHADER BUTTON
    */

    if(
        key===
        ITEM_SHADER
    ){


        if(
            sodiumInstall[pid]
        ){

            return;

        }


        /*
           DISABLE SHADERS
        */

        if(
            sodiumMode[pid]
            ===
            "shader"
        ){

            sodiumMode[pid]=
                "none";


            resetVisuals(pid);


            refreshTiles(pid);


            api.sendOverShopInfo(
                pid,
                "Shaders Disabled"
            );


            return;
        }


        /*
           5 SECOND INSTALL
        */

        sodiumInstall[pid]={

            end:
                Date.now()+
                5000,

            last:
                5

        };


        setTile(

            pid,

            ITEM_SHADER,

            "⏳ Installing Shaders...",

            "Applying Sodium graphics profile.",

            "WAIT 5",

            false,

            false,

            "#AAFFBB"

        );


        try{

            api.playSound(
                pid,
                "sonarBeep",
                0.6,
                1
            );

        }catch(e){}


        return;

    }


    /*
       PERFORMANCE
    */

    if(
        key===
        ITEM_PERF
    ){

        setMode(
            pid,
            "performance"
        );

        return;
    }


    /*
       NIGHT VISION
    */

    if(
        key===
        ITEM_NIGHT
    ){

        setMode(
            pid,
            "night"
        );

        return;
    }

};


/* =========================================
              PLAYER JOIN
========================================= */

onPlayerJoin=(pid)=>{

    sodiumMode[pid]=
        "none";


    sodiumIntro[pid]=
        Date.now()+
        700;

};


/* =========================================
              PLAYER LEAVE
========================================= */

onPlayerLeave=(pid)=>{

    delete sodiumIntro[pid];

    delete sodiumMode[pid];

    delete sodiumInstall[pid];

};


/* =========================================
                  TICK
========================================= */

tick=()=>{

    var now=
        Date.now();


    /*
       SODIUM INTRO
    */

    for(
        var pid
        in
        sodiumIntro
    ){

        if(
            now<
            sodiumIntro[pid]
        ){

            continue;

        }


        if(
            showSodium(pid)
        ){

            delete sodiumIntro[pid];

        }else{

            sodiumIntro[pid]=
                now+
                250;

        }
    }


    /*
       SHADER INSTALLER
    */

    for(
        var pid2
        in
        sodiumInstall
    ){

        var job=
            sodiumInstall[pid2];


        if(
            !api.playerIsInGame(
                pid2
            )
        ){

            delete sodiumInstall[pid2];

            continue;
        }


        var left=
            job.end-
            now;


        /*
           DONE
        */

        if(
            left<=0
        ){

            delete sodiumInstall[pid2];


            sodiumMode[pid2]=
                "shader";


            applyShader(pid2);


            refreshTiles(pid2);


            try{

                api.playSound(
                    pid2,
                    "exp_levelup",
                    0.8,
                    1.15
                );

            }catch(e){}


            api.sendOverShopInfo(

                pid2,

                "✓ Sodium Shaders Enabled"

            );


            continue;
        }


        /*
           5 4 3 2 1
        */

        var sec=

            Math.ceil(
                left/
                1000
            );


        if(
            sec!==
            job.last
        ){

            job.last=
                sec;


            setTile(

                pid2,

                ITEM_SHADER,

                "⏳ Installing Shaders...",

                "Applying Sodium graphics profile.",

                "WAIT "+sec,

                false,

                false,

                "#AAFFBB"

            );

        }
    }
};


/* =========================================
              START SODIUM
========================================= */

setupShop();


/* =========================================
      PLAY INTRO FOR PEOPLE ALREADY IN
========================================= */

var ids=
    api.getPlayerIds();


for(
    var i=0;
    i<ids.length;
    i++
){

    sodiumMode[
        ids[i]
    ]=
        "none";


    sodiumIntro[
        ids[i]
    ]=

        Date.now()+
        400;

}
