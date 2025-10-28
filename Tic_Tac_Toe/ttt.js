let boxes = document.querySelectorAll(".box");
let resetBtn = document.querySelector("#resetBtn");
let newBtn = document.querySelector("#newBtn");
let msg = document.querySelector("#msg");
let msgcontainer = document.querySelector(".msgcontainer");

let turnX = true;
let count=0;

const winPatterns = [
    [0,1,2],
    [0,3,6],
    [0,4,8],
    [1,4,7],
    [2,5,8],
    [2,4,6],
    [3,4,5],
    [6,7,8],
];

boxes.forEach((box)=> {
    box.addEventListener("click",() =>{
       if(turnX===true)
       {
        box.innerText = "X";
        turnX = false;
       }
       else{
        box.innerText = "O";
        turnX = true;
       }
       box.disabled = true;
       count++;
       gameDraw();
       checkWinner();
    });
});

const resetGame = () =>{
turnX = true;
enableBtn();
msgcontainer.classList.add("hide");
};

const enableBtn = () =>{
    for(let box of boxes)
    {
        box.disabled = false;
        box.innerText = "";
    }
};

const disableBtn = () =>{
    for(let box of boxes)
    {
        box.disabled = true;
    }
};
const showWinner = (winner) => {
msg.innerText = `Congratulations! \nWinner is ${winner} `;
msgcontainer.classList.remove("hide");
disableBtn();
};

const gameDraw = () => {
    let winnerExists = false;

    for (let pattern of winPatterns) {
        let pos1 = boxes[pattern[0]].innerText;
        let pos2 = boxes[pattern[1]].innerText;
        let pos3 = boxes[pattern[2]].innerText;

        if (pos1 !== "" && pos1 === pos2 && pos2 === pos3) {
            winnerExists = true;
            break;
        }
    }

    if (count === 9 && !winnerExists) {
        msg.innerText = "Game Draw!";
        msgcontainer.classList.remove("hide");
        disableBtn();
    }
};


const checkWinner = () => {
    for(pattern of winPatterns)
    {
        let pos1=boxes[pattern[0]].innerText;
        let pos2=boxes[pattern[1]].innerText;
        let pos3=boxes[pattern[2]].innerText;

        if(pos1 != "" && pos2 != "" &&pos3 != "")
            {
                if(pos1===pos2 && pos2 ===pos3)
                {
                    showWinner(pos1);
                }
            } 
    }
    
};

newBtn.addEventListener("click",resetGame);
resetBtn.addEventListener("click",resetGame);