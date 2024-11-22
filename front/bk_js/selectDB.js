function select_data(url) {
  fetch(url)
  .then(function(response) {
    return response.json();
  })
  .then(function (json) {
   makeTable(json);
   setupRowClickEvent();
  });
}