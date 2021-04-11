const textarr = [" To Revolutionary  Diary Entry  Place... ","  Its completely  secured and protected..  "," Pen down  Real  Quick  and Easy.."];

const alreadyTyped = document.querySelector(".typed");
const typingdelay = 200;
const erasingdelay = 100;
const newTextDelay = 200;

let textarrIndex=0;
let chararrIndex = 0;


function typing(){
    
    if(chararrIndex<textarr[textarrIndex].length){
        alreadyTyped.textContent += textarr[textarrIndex].charAt(chararrIndex);
        chararrIndex++;
        setTimeout(typing,typingdelay);

    }
    else{
        textarrIndex ++;
        if(textarrIndex<textarr.length){
            
            
            chararrIndex =0;
            setTimeout(typing,typingdelay+1000);
        }
        else{
            alreadyTyped.textContent = "";
            textarrIndex=0;
            chararrIndex=0;
            setTimeout(typing,typingdelay);

        }
    }
}

    


document.addEventListener("DOMContentLoaded",function(){
    setTimeout(typing,3000);
})