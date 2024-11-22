/**
 * @type {HTMLFormElement}
 */
document.getElementById("sortBtn").addEventListener('click', searchText)

async function searchText(ev){
    ev.preventDefault();

    const form = document.getElementById("inquiry");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

        try {
            // APIコール
            const response = await window.fetch("http://127.0.0.1:5000/PostSortItem", {
                method: "POST",
                body: JSON.stringify(data, ["items", "places", "detailed_places"]),
            });

            const json = await response.json()
            makeTable(json)

        } catch (e) {
            console.log(e);
        }
    };
