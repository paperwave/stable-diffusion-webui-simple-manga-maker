// Available api models
const apis = {
  A1111: "A1111",
  COMFYUI: "comfyui"
};

function generateZip(){

  saveState();

  var zip = new JSZip();
  zip.file("text2img_basePrompt.json", JSON.stringify(text2img_basePrompt));

  stateStack.forEach((json, index) => {
    const paddedIndex = String(index).padStart(6, '0');
    zip.file(`state_${paddedIndex}.json`, JSON.stringify(json));
  });

  imageMap.forEach((value, key) => {
    zip.file(`${key}.img`, value);
  });

  var canvasInfo = {
    width: canvas.width,
    height: canvas.height
  };
  zip.file("canvas_info.json", JSON.stringify(canvasInfo));

  removeGrid();
  var previewLink = getCropAndDownloadLinkByMultiplier(1, 'jpeg');
  zip.file("preview-image.jpeg", previewLink.href.substring(previewLink.href.indexOf('base64,') + 7), { base64: true });
  if (isGridVisible) {
    drawGrid();
    isGridVisible = true;
  }
  return zip;
}


function loadZip(zip, guid = null){
  stateStack = [];
  imageMap.clear();

  var text2imgBasePromptFile = zip.file("text2img_basePrompt.json");
  if (text2imgBasePromptFile) {
    text2imgBasePromptFile.async("string").then(function (content) {
      Object.assign(text2img_basePrompt, JSON.parse(content));
    });
  }


  var canvasInfoFile = zip.file("canvas_info.json");
  var canvasInfoPromise = canvasInfoFile
    ? canvasInfoFile.async("string").then(function (content) {
      return JSON.parse(content);
    })
    : Promise.resolve({ width: 750, height: 850 });

  // var sortedFiles = Object.keys(zip.files).sort();
  var sortedFiles = Object.keys(zip.files).sort((a, b) => {
    const numA = a.match(/(\d+)/) ? parseInt(a.match(/(\d+)/)[0]) : -1;
    const numB = b.match(/(\d+)/) ? parseInt(b.match(/(\d+)/)[0]) : -1;
    if (numA === numB) {
      return a.localeCompare(b);
    }
    return numA - numB;
  });

  //Image sort
  sortedFiles.map(function (fileName) {
    return zip.file(fileName).async("string").then(function (content) {
      if (fileName.endsWith(".img")) {
        let hash = fileName.split('.')[0];
        imageMap.set(hash, content);
      }
    }).catch(function (error) {
      console.error("Failed to load file:", fileName, error);
    });
  });

  var promises = sortedFiles.map(function (fileName) {
    return zip.file(fileName).async("string").then(function (content) {
      if (fileName.endsWith(".json") && fileName !== "text2img_basePrompt.json" && fileName !== "canvas_info.json") {
        try {
          //console.log( "fileName JSON.parse(content)", fileName, " ", JSON.parse(content).length );
          return JSON.parse(content);
        } catch (e) {
          console.error("JSON parse error in file:", fileName, e);
        }
      }
    }).catch(function (error) {
      console.error("Failed to load file:", fileName, error);
    });
  });

  Promise.all([canvasInfoPromise, ...promises]).then(function (allData) {
    var canvasInfo = allData[0];
    stateStack = allData.slice(1).filter((data, index) => {
      const isDataDefined = data !== undefined;
      return isDataDefined;
    });

    currentStateIndex = stateStack.length - 1;
    resizeCanvasByNum(canvasInfo.width, canvasInfo.height)
    lastRedo(guid);
    // console.log("100 loadZip guid", guid);
    if( guid ){
      setCanvasGUID(guid);
    }
  });
}

// Variable to keep track of selected api model to use
var API_mode = apis.A1111;

document.addEventListener("DOMContentLoaded", function () {
  var settingsSave = $("settingsSave");
  var settingsLoad = $("settingsLoad");
  settingsSave.addEventListener("click", function () {
    saveSettingsLocalStrage();
  });
  settingsLoad.addEventListener("click", function () {
    loadSettingsLocalStrage();
  });


  var saveButton = $("projectSave");
  var loadButton = $("projectLoad");

  saveButton.addEventListener("click", function () {

    console.log("stateStack.length", stateStack.length);

    if (stateStack.length === 0) {
      createToast("Save Error", "Not Found.");
      return;
    }
  
    btmSaveZip().then(() => {
      createToast("Save Project Start!", "");
      var zip = new JSZip();
      var zipPromises = [];
      btmImageZipMap.forEach((value, key) => {
        zipPromises.push(
          zip.file(`project_${key}.zip`, value.zipBlob, {binary: true})
        );
      });
      return Promise.all(zipPromises).then(() => zip);
    })
    .then((zip) => {
      return zip.generateAsync({ type: "blob" });
    })
    .then((content) => {
      var url = window.URL.createObjectURL(content);
      var a = document.createElement("a");
      a.href = url;
      a.download = "project.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("Error during save process:", error);
    });
  });

  


  loadButton.addEventListener("click", function () {
    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);
    fileInput.click();
  
    fileInput.onchange = function () {
      var file = this.files[0];
  
      if (file) {
        JSZip.loadAsync(file).then(function(zip) {
          var hasNestedZip = false;
          var fileCount = 0;
  
          zip.forEach(function (relativePath, zipEntry) {
            fileCount++;
            if (zipEntry.name.toLowerCase().endsWith('.zip')) {
              hasNestedZip = true;
            }
          });
  
          if (hasNestedZip) {
            processZip(zip);
            document.body.removeChild(fileInput);
          } else {
            loadZip(zip);
          }
        }).catch(function(error) {
          console.error("Error loading ZIP:", error);
        });
      }
    };
  });
  
  async function processZip(zip) {
    const zipFiles = Object.keys(zip.files).filter(filename => filename.endsWith('.zip'));
    
    for (let i = 0; i < zipFiles.length; i++) {
      const zipContent = await zip.file(zipFiles[i]).async('blob');
      const innerZip = await JSZip.loadAsync(zipContent);
      const previewImage = innerZip.file('preview-image.jpeg');
      if (!previewImage) {
        continue;
      }
      
      const previewImageBlob = await previewImage.async('blob');
      const previewImageUrl = URL.createObjectURL(previewImageBlob);
  
      const stateFiles = Object.keys(innerZip.files).filter(filename => filename.startsWith('state_') && filename.endsWith('.json'));

      var canvasGuid = null;

      for (const stateFile of stateFiles) {
        const stateContent = await innerZip.file(stateFile).async('text');
        try {
          const state = JSON.parse(stateContent);
          canvasGuid = findCanvasGuid(state);
  
          if (canvasGuid) {
            btmAddImage({ href: previewImageUrl }, zipContent, canvasGuid);
            break;
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }

      if( canvasGuid ){
        //skip
      }else{
        let guid = generateGUID();
        btmAddImage({ href: previewImageUrl }, zipContent, guid);
      }
    }
  }

  


  function findCanvasGuid(obj) {
    if (typeof obj === 'string') {
      try {
        obj = JSON.parse(obj);
      } catch (error) {
        return null;
      }
    }
    if (typeof obj !== 'object' || obj === null) {
      return null;
    }
  
    if (obj.canvasGuid) {
      return obj.canvasGuid;
    }
  
    for (let key in obj) {
      if (typeof obj[key] === 'object') {
        const result = findCanvasGuid(obj[key]);
        if (result) return result;
      }
    }
    return null;
  }


  
  
  //TODO: Maybe moved this to another file
  var selectA1111APIButton = $("Select_a1111_button");
  var selectComfyuiAPIButton = $("Select_comfyui_button");


});


var localSettingsData = null;
  
function loadSettingsLocalStrage(  ) {
  createToast('Settings Load', [
    'Canvas Background Color...',
    'Api port/host/check...',
    'Base Settings...',
    'Dpi...',
    'Grid, Layer, Controle...',
    'Margin From Panel...',
    'Knife Space Size...',
    'Load Completed!!'
  ]);

  const localSettingsData = localStorage.getItem('localSettingsData');

  if (localSettingsData) {
    const localSettings = JSON.parse(localSettingsData);
    var bgColorInputElement = $('bg-color');
    bgColorInputElement.value = localSettings.canvasBgColor || "#ffffff";
    
    var event = new Event('input', { 'bubbles': true, 'cancelable': true });
    bgColorInputElement.dispatchEvent(event);


    $('view_layers_checkbox').checked = localSettings.view_layers_checkbox ?? true;
    $('view_controles_checkbox').checked = localSettings.view_controles_checkbox ?? true;
    $('knifePanelSpaceSize').value = localSettings.knifePanelSpaceSize || "20";
    $('outputDpi').value = localSettings.canvasDpi || "300";
    $('gridSizeInput').value = localSettings.canvasGridLineSize || "10";
    $('marginFromPanel').value = localSettings.canvasMarginFromPanel || 20;
    svgPagging = localSettings.canvasMarginFromPanel || 20;
    $('Stable_Diffusion_WebUI_apiPort').value = localSettings.Stable_Diffusion_WebUI_apiPort || "7860";
    $('Stable_Diffusion_WebUI_apiHost').value = localSettings.Stable_Diffusion_WebUI_apiHost || "127.0.0.1";
    $('apiHeartbeatCheckbox').checked = localSettings.apiHeartbeatCheckbox;

$('text2img_basePrompt_model').value                  = localSettings.text2img_basePrompt_text2img_model || text2img_basePrompt.text2img_model;
$('text2img_basePrompt_samplingMethod').value         = localSettings.text2img_basePrompt_text2img_samplingMethod || text2img_basePrompt.text2img_samplingMethod;
$('text2img_basePrompt_prompt').value                 = localSettings.text2img_basePrompt_text2img_prompt || text2img_basePrompt.text2img_prompt;
$('text2img_basePrompt_negativePrompt').value         = localSettings.text2img_basePrompt_text2img_negativePrompt || text2img_basePrompt.text2img_negativePrompt;
$('text2img_basePrompt_seed').value                   = localSettings.text2img_basePrompt_text2img_seed || text2img_basePrompt.text2img_seed;
$('text2img_basePrompt_cfg_scale').value              = localSettings.text2img_basePrompt_text2img_cfg_scale || text2img_basePrompt.text2img_cfg_scale;
$('text2img_basePrompt_width').value                  = localSettings.text2img_basePrompt_text2img_width || text2img_basePrompt.text2img_width;
$('text2img_basePrompt_height').value                 = localSettings.text2img_basePrompt_text2img_height || text2img_basePrompt.text2img_height;
$('text2img_basePrompt_samplingSteps').value          = localSettings.text2img_basePrompt_text2img_samplingSteps || text2img_basePrompt.text2img_samplingSteps;
$('text2img_basePrompt_hr_upscaler').value            = localSettings.text2img_basePrompt_text2img_hr_upscaler || text2img_basePrompt.text2img_hr_upscaler;
$('text2img_basePrompt_hr_scale').value               = localSettings.text2img_basePrompt_text2img_basePrompt_hr_scale || text2img_basePrompt.text2img_basePrompt_hr_scale;
$('text2img_basePrompt_hr_denoising_strength').value  = localSettings.text2img_basePrompt_text2img_basePrompt_hr_denoising_strength || text2img_basePrompt.text2img_basePrompt_hr_denoising_strength;
$('text2img_basePrompt_hr_step').value                = localSettings.text2img_basePrompt_text2img_basePrompt_hr_step || text2img_basePrompt.text2img_basePrompt_hr_step;

$('text2img_basePrompt_height').addEventListener('blur', function() {
  var value = parseInt(this.value);
  if (value !== -1) {
    this.value = Math.round(value / 8) * 8;
  }
});
$('text2img_basePrompt_width').addEventListener('blur', function() {
  var value = parseInt(this.value);
  if (value !== -1) {
    this.value = Math.round(value / 8) * 8;
  }
});

text2img_basePrompt.text2img_prompt = $('text2img_basePrompt_prompt').value;
text2img_basePrompt.text2img_negativePrompt = $('text2img_basePrompt_negativePrompt').value;
text2img_basePrompt.text2img_model = $('text2img_basePrompt_model').value;
text2img_basePrompt.text2img_samplingSteps = $('text2img_basePrompt_samplingSteps').value;
text2img_basePrompt.text2img_samplingMethod = $('text2img_basePrompt_samplingMethod').value;
text2img_basePrompt.text2img_width = $('text2img_basePrompt_width').value;
text2img_basePrompt.text2img_height = $('text2img_basePrompt_height').value;
text2img_basePrompt.text2img_seed = $('text2img_basePrompt_seed').value;
text2img_basePrompt.text2img_cfg_scale = $('text2img_basePrompt_cfg_scale').value;
text2img_basePrompt.text2img_hr_upscaler = $('text2img_basePrompt_hr_upscaler').value;
text2img_basePrompt.text2img_basePrompt_hr_step = $('text2img_basePrompt_hr_step').value;
text2img_basePrompt.text2img_basePrompt_hr_denoising_strength = $('text2img_basePrompt_hr_denoising_strength').value;
text2img_basePrompt.text2img_basePrompt_hr_scale = $('text2img_basePrompt_hr_scale').value;
  }
}

function saveSettingsLocalStrage() {
  createToast('Settings Save', [
    'Canvas Background Color...',
    'Api port/host/check...',
    'Base Settings...',
    'Dpi...',
    'Grid, Layer, Controle...',
    'Margin From Panel...',
    'Knife Space Size...',
    'Save Completed!!'
  ]);
  
  localSettingsData = {
    view_layers_checkbox: $('view_layers_checkbox').checked,
    view_controles_checkbox: $('view_controles_checkbox').checked,

    knifePanelSpaceSize: $('knifePanelSpaceSize').value,
    canvasBgColor: $('bg-color').value,
    canvasDpi: $('outputDpi').value,
    canvasGridLineSize: $('gridSizeInput').value,
    canvasMarginFromPanel: $('marginFromPanel').value,
    Stable_Diffusion_WebUI_apiPort: $('Stable_Diffusion_WebUI_apiPort').value,
    Stable_Diffusion_WebUI_apiHost: $('Stable_Diffusion_WebUI_apiHost').value,
    apiHeartbeatCheckbox : $('apiHeartbeatCheckbox').checked ,
    text2img_basePrompt_text2img_prompt: text2img_basePrompt.text2img_prompt,
    text2img_basePrompt_text2img_negativePrompt: text2img_basePrompt.text2img_negativePrompt,
    text2img_basePrompt_text2img_seed: text2img_basePrompt.text2img_seed,
    text2img_basePrompt_text2img_cfg_scale: text2img_basePrompt.text2img_cfg_scale,
    text2img_basePrompt_text2img_width: text2img_basePrompt.text2img_width,
    text2img_basePrompt_text2img_height: text2img_basePrompt.text2img_height,
    text2img_basePrompt_text2img_samplingMethod: text2img_basePrompt.text2img_samplingMethod,
    text2img_basePrompt_text2img_samplingSteps: text2img_basePrompt.text2img_samplingSteps,
    text2img_basePrompt_text2img_scheduler: text2img_basePrompt.text2img_scheduler,
    text2img_basePrompt_text2img_model: text2img_basePrompt.text2img_model,
    text2img_basePrompt_text2img_hr_upscaler: text2img_basePrompt.text2img_hr_upscaler,
    text2img_basePrompt_text2img_basePrompt_hr_scale: text2img_basePrompt.text2img_basePrompt_hr_scale,
    text2img_basePrompt_text2img_basePrompt_hr_step: text2img_basePrompt.text2img_basePrompt_hr_step,
    text2img_basePrompt_text2img_basePrompt_hr_denoising_strength: text2img_basePrompt.text2img_basePrompt_hr_denoising_strength
  };
  localStorage.setItem('localSettingsData', JSON.stringify(localSettingsData));
}

document.addEventListener('DOMContentLoaded', function() {
  loadSettingsLocalStrage();
  changeView("layer-panel", $('view_layers_checkbox').checked);
  changeView("controls", $('view_controles_checkbox').checked);
});










document.addEventListener('DOMContentLoaded', function() {
  $('svgDownload').onclick = function () {
    var svg = canvas.toSVG();
    // console.log(svg);
    svgDownload('canvas.svg', svg);
  };
});


function svgDownload(filename, content) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(content));
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}