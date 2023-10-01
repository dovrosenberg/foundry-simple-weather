// rather than specifying biomes, we take a more flexible approach (though we also define some biomes as defaults)
// this approach allows GMs to create non-earth biomes (ex. what's the weather like in the Fey realm or another plane?) and 
//    still easily use the tool

// this approach borrows heavily from Dave's All-Purpose Weather Table from reddit u/AlliedSalad2
// https://docs.google.com/spreadsheets/d/1j0d1MtsWtJT-Q-Ncbl8DsBlf6cK51j5T13JTll5bSTE/edit#gid=0

// similarly, it uses the concepts from https://www.reddit.com/r/osr/comments/omtd4g/4_season_weather_table_hex_easy_and_logical/ 
//    to determine day to day changes

// in the weather hex approach, each season moves generally southwest (on a hex grid of options) based on
//    these probabilities:
//    25%: repeat   
//    20%: SW  
//    16%: S  
//    14%: SE  
//    14%: NW  
//    6%: N   
//    5%: NE  

// however, we also look at how far into the season we are and adjust the probabilities so
//    that as we progress, we heavily weight moving toward the next season (pt (percent through) = days in / season length)
// these shift in a few cycles based on % of the way through the year - 
// adjusted probabilities:
//    3/6: 25+(6*pt):     4/6: 28-(19.5*pt)   5/6: 28-(19.5*2/3)-(.15*pt)           repeat (peaks half-way through season, then gives way to S and SW)
//    3/6: 20+(5*pt)      4/6: 22.5+(26.25*pt)     5/6: 22.5+(26.25*2/3)+(60*pt)         SW    (raises continually, i.e. on the last day, we're 90% likely to move to SW)
//    3/6: 16+(3*pt)       4/6: 17.5+(3.75*pt)   5/6: 17.5+(3.75*2/3))-(.2*pt)        S   (peaks 2/3 way through season, then gives way to SW)
//    3/6: 14-(14/39)*[(6*pt)+(5*pt)+(3*pt)]   4/6: 14-(14/39)*(7+10.5pt)   5/6:    SE
//    3/6: 14-(14/39)*[(6*pt)+(5*pt)+(3*pt)]   4/6: 14-(14/39)*(7+10.5pt)  5/6:    NW
//    3/6: 6-(6/39)*[(6*pt)+(5*pt)+(3*pt)]   4/6: 6-(6/39)*(7+10.5pt)  5/6:    N
//    3/6: 5-(5/39)*[(6*pt)+(5*pt)+(3*pt)]   4/6: 5-(5/39)*(7+10.5pt)  5/6:    NE

// Each hex translates to an array as follows
/*
                   _____        
                  /     \       
            _____/  2,0  \_____
           /     \       /     \ 
     _____/  1,1  \_____/  3,1  \_____
    /     \       /     \       /     \ 
   /  0,2  \_____/  2,2  \_____/  4,2  \
   \       /     \       /     \       /
    \_____/  1,3  \_____/  3,3  \_____/ 
    /     \       /     \       /     \ 
   /  0,4  \_____/  2,4  \_____/  4,4  \
   \       /     \       /     \       /
    \_____/  1,5  \_____/  3,5  \_____/ 
    /     \       /     \       /     \ 
   /  0,6  \_____/  2,6  \_____/  4,6  \
   \       /     \       /     \       /
    \_____/  1,7  \_____/  3,7  \_____/ 
          \       /     \       /     
           \_____/  2,8  \_____/  
                 \       / 
                  \_____/

*/

// the conditions on each day should be arranged so that the ones that move you toward the next season
//   are in the SW and the ones like the prior season are in the NE
// on each season transition, we start in cell (3,1)
