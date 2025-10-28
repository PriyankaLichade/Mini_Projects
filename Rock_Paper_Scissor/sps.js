let userscore=0;
let comscore=0;
let msg = document.querySelector("#msg");
let scoreuser = document.querySelector("#user-score");
let scorecom = document.querySelector("#com-score");

const choices= document.querySelectorAll(".choice");

const genComChoice = () => {
    const options = ["rock","paper","scissors"];
    const randInx = Math.floor(Math.random()*3);
    return options[randInx];
}
const drawGame = () =>{
    console.log("The game is draw");
    msg.innerText = "Game was draw"; 
     msg.style.backgroundColor = "blue";
};

const showWinner = (userWin,userChoice,comChoice) => {
 if(userWin)
 {
    userscore++;
    scoreuser.innerText = userscore;
    msg.innerText = "You Win!";
    msg.style.backgroundColor = "green";
 }
 else 
 {
    comscore++;
    scorecom.innerText = comscore;
    msg.innerText ="You Lose!";
    msg.style.backgroundColor = "red";
 }
};
const playGame = (userChoice) =>{
    console.log("user choice =", userChoice);
    const comChoice = genComChoice();
    console.log("comp choice = ",comChoice);

    if(userChoice === comChoice)
    {
        drawGame();
    }
    else{
        let userWin = true;
        if(userChoice === "rock")
        {
            userWin = comChoice === "paper" ? false : true;  
        }
        else if(userChoice === "paper"){
            userWin = comChoice === "scissors" ? false : true;
        }
        else
        {
            userWin = comChoice ==="rock" ? false : true;
        }
        showWinner(userWin, userChoice,comChoice);
    }
};

choices.forEach((choice) => {
    choice.addEventListener("click",() => {
        const userChoice = choice.getAttribute("id");
        console.log("choice was clicked", userChoice);
        playGame(userChoice);
    });
});