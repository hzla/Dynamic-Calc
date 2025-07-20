function importSheet() {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    // Handle file selection
    fileInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    // Parse JSON content and set encounters variable
                    encounters = JSON.parse(e.target.result);
                    localStorage.encounters = JSON.stringify(encounters)                    
                    
                    location.reload()

                } catch (error) {
                    console.error('Error parsing JSON file:', error);
                    alert('Invalid fragsheet file. Please select a valid fragsheet file.');
                }
            };
            
            reader.onerror = function() {
                console.error('Error reading file');
                alert('Error reading file. Please try again.');
            };
            
            // Read file as text
            reader.readAsText(file);
        }
    });
    
    // Trigger file selector
    fileInput.click();
}

function exportSheet(obj, filename = 'data.json') {
  // Convert object to JSON string with pretty formatting
  const jsonString = JSON.stringify(encounters, null, 2);
  
  // Create a blob with the JSON data
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Create a temporary URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary anchor element and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = `${TITLE} Fragsheet.json`.replace(" ", "_");
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function resetSheet() {
    if (confirm("Are you sure you want to wipe all encounter and frag data? Remember to download a backup of your fragsheet if you would like to save your data.")) {
        localStorage.encounters = ""
        location.reload()
    }
}

$('input').on('cellValueChanged', function(e) {
  console.log(e)
})


$('#import-sheet').click(importSheet);
$('#export-sheet').click(exportSheet);
$('#reset-sheet').click(resetSheet);


