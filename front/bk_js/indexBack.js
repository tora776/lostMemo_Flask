/**
 * @type {HTMLFormElement}
 */

document.getElementById("indexBtn").addEventListener('click', indexBack())

function indexBack(){
        indexBtn.addEventListener("click", async ev => {
            ev.preventDefault();
            window.location.href='index.html'
        });

};