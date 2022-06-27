const serviceUrl = 'https://kgsearch.googleapis.com/v1/entities:search';
const apiKey= 'AIzaSyAG7w627q-djB4gTTahssufwNOImRqdYKM'


function knowledgeGraph(value) {
    console.log("Inside knowledgeGraph");
    config = {
        'limit': 10,
        'languages': ['en'],
        'maxDescChars': 100,
        'selectHandler': value,
    }
    KGSearchWidget(apiKey, document.getElementById("knowledgeInput"), config);

    $("#knowledgeType").change(function(){
        var type = $("#knowledgeType").val();
        if (type) {
            config = {
            'limit': 10,
            'languages': ['en'],
            'types': [type],
            'maxDescChars': 100,
            'selectHandler': value,
            }
        }else {
            config = {
                'limit': 10,
                'languages': ['en'],
                'maxDescChars': 100,
                'selectHandler': value,
            }
        }
        KGSearchWidget(apiKey, document.getElementById("knowledgeInput"), config);
    })
}


 function addKnowledgeGraph(data) {
    $('#knowledgeOutput').append(
        $(`
      <div class="card mb-1 border-3">
        <div class="card-body">
          <h3>${data.eventRow.name}</h3>
          <h6>${data.eventRow.description}</h6>
          <div>${data.eventRow.rc}</div>
          <div>
               <a href="${data.eventRow.qc}" target="_blank">
              Link to Webpage
            </a> 
          </div>
        </div>
      </div>
    `)
    )
}


function removeKnowledgeGraph(){
    $('#knowledgeOutput').empty();
}